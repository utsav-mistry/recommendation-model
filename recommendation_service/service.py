from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import duckdb
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix, load_npz


@dataclass(frozen=True)
class ProductPage:
    items: list[dict[str, Any]]
    page: int
    page_size: int
    total: int


class RecommendationService:
    def __init__(
        self,
        db_path: str,
        rankings_path: str,
        graph_path: str,
        item_ids_path: str,
    ) -> None:
        self.db_path = db_path
        self.rankings = pd.read_parquet(rankings_path)
        self.graph: csr_matrix = load_npz(graph_path).tocsr()
        self.item_ids = np.load(item_ids_path, allow_pickle=True).astype(str)
        if self.graph.shape != (len(self.item_ids), len(self.item_ids)):
            raise ValueError("Recommendation graph and item ID mapping have different shapes")
        self.item_index = {asin: index for index, asin in enumerate(self.item_ids)}

    def _connect(self) -> duckdb.DuckDBPyConnection:
        return duckdb.connect(self.db_path, read_only=True)

    @staticmethod
    def _string_list(value: Any) -> list[str]:
        if value is None:
            return []
        if isinstance(value, (list, tuple)):
            return [str(item) for item in value if item]
        return [str(value)]

    @classmethod
    def _image_list(cls, value: Any) -> list[str]:
        if not isinstance(value, dict):
            return []
        for key in ("hi_res", "large", "thumb", "variant"):
            values = cls._string_list(value.get(key))
            if values:
                return values
        return []

    @classmethod
    def _row_to_product(cls, row: dict[str, Any]) -> dict[str, Any]:
        return {
            "parent_asin": str(row["parent_asin"]),
            "title": row.get("title") or "Untitled product",
            "category": row.get("category") or "Uncategorized",
            "price": cls._price(row.get("price")),
            "rating": float(row.get("rating") or 0),
            "review_count": int(row.get("review_count") or 0),
            "images": cls._image_list(row.get("images")),
            "features": cls._string_list(row.get("features")),
            "description": cls._string_list(row.get("description")),
            "brand": row.get("brand"),
            "store": row.get("store"),
        }

    @staticmethod
    def _price(value: Any) -> float | None:
        if value is None:
            return None
        try:
            cleaned = str(value).replace("$", "").replace(",", "").strip()
            return float(cleaned) if cleaned else None
        except (TypeError, ValueError):
            return None

    def _metadata(self, asins: list[str]) -> dict[str, dict[str, Any]]:
        if not asins:
            return {}
        placeholders = ",".join("?" for _ in asins)
        connection = self._connect()
        try:
            rows = connection.execute(
                f"""
                SELECT
                    parent_asin,
                    title,
                    source_category AS category,
                    price,
                    average_rating AS rating,
                    rating_number AS review_count,
                    images,
                    features,
                    description,
                    store
                FROM products
                WHERE parent_asin IN ({placeholders})
                """,
                asins,
            ).fetchdf()
        finally:
            connection.close()
        return {
            str(row["parent_asin"]): self._row_to_product(row.to_dict())
            for _, row in rows.iterrows()
        }

    def products(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        category: str | None = None,
    ) -> ProductPage:
        page_size = min(page_size, 100)
        offset = (page - 1) * page_size
        clauses = ["title IS NOT NULL", "TRIM(title) <> ''"]
        params: list[Any] = []
        if search:
            clauses.append(
                "(LOWER(title) LIKE ? OR LOWER(COALESCE(store, '')) LIKE ?)"
            )
            term = f"%{search.strip().lower()}%"
            params.extend([term, term])
        if category and category.lower() != "all":
            clauses.append(
                "(source_category = ? OR main_category = ? "
                "OR REPLACE(source_category, '_', ' ') = ?)"
            )
            params.extend([category, category, category])
        where = " AND ".join(clauses)
        connection = self._connect()
        try:
            total = connection.execute(
                f"SELECT COUNT(*) FROM products WHERE {where}", params
            ).fetchone()[0]
            rows = connection.execute(
                f"""
                SELECT
                    parent_asin,
                    title,
                    source_category AS category,
                    price,
                    average_rating AS rating,
                    rating_number AS review_count,
                    images,
                    features,
                    description,
                    store
                FROM products
                WHERE {where}
                ORDER BY parent_asin
                LIMIT ? OFFSET ?
                """,
                [*params, page_size, offset],
            ).fetchdf()
        finally:
            connection.close()
        items = [self._row_to_product(row.to_dict()) for _, row in rows.iterrows()]
        return ProductPage(items=items, page=page, page_size=page_size, total=total)

    def product(self, parent_asin: str) -> dict[str, Any] | None:
        return self._metadata([parent_asin]).get(parent_asin)

    def categories(self) -> list[dict[str, Any]]:
        connection = self._connect()
        try:
            rows = connection.execute(
                """
                SELECT source_category AS category, COUNT(*) AS product_count
                FROM products
                WHERE source_category IS NOT NULL
                GROUP BY source_category
                ORDER BY source_category
                """
            ).fetchall()
        finally:
            connection.close()
        return [
            {
                "name": category,
                "label": str(category).replace("_", " "),
                "product_count": int(count),
            }
            for category, count in rows
        ]

    def _recommendation_products(
        self, asins: list[str], scores: dict[str, float] | None = None
    ) -> list[dict[str, Any]]:
        metadata = self._metadata(asins)
        products = []
        for asin in asins:
            product = metadata.get(asin)
            if product is not None:
                if scores is not None:
                    product["recommendation_score"] = scores.get(asin, 0.0)
                products.append(product)
        return products

    def ranked(self, category: str | None, limit: int) -> list[dict[str, Any]]:
        frame = self.rankings
        if category:
            normalized = category.replace(" ", "_").lower()
            frame = frame[
                frame["category"].astype(str).str.lower().str.replace(" ", "_")
                == normalized
            ]
        frame = frame.head(limit)
        scores = dict(zip(frame["parent_asin"], frame["bayesian_score"]))
        return self._recommendation_products(frame["parent_asin"].astype(str).tolist(), scores)

    def similar(self, seeds: list[str], limit: int) -> list[dict[str, Any]]:
        seed_indices = [self.item_index[asin] for asin in dict.fromkeys(seeds) if asin in self.item_index]
        if not seed_indices:
            return []
        scores: dict[str, float] = {}
        excluded = {str(self.item_ids[index]) for index in seed_indices}
        for index in seed_indices:
            row = self.graph.getrow(index)
            for target, score in zip(row.indices, row.data):
                asin = str(self.item_ids[target])
                if asin not in excluded:
                    scores[asin] = scores.get(asin, 0.0) + float(score)
        ordered = sorted(scores, key=lambda asin: scores[asin], reverse=True)[:limit]
        return self._recommendation_products(ordered, scores)
