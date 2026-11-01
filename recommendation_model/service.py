from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import re
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
    """Read-only catalogue access and inference over precomputed model artifacts."""

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
        expected_shape = (len(self.item_ids), len(self.item_ids))
        if self.graph.shape != expected_shape:
            raise ValueError(
                f"Recommendation graph shape {self.graph.shape} does not match "
                f"item mapping shape {expected_shape}"
            )
        self.item_index = {
            asin: index for index, asin in enumerate(self.item_ids)
        }

    def _connect(self) -> duckdb.DuckDBPyConnection:
        return duckdb.connect(self.db_path, read_only=True)

    def connection_check(self) -> None:
        connection = self._connect()
        try:
            connection.execute("SELECT 1").fetchone()
        finally:
            connection.close()

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
            images = cls._string_list(value.get(key))
            if images:
                return images
        return []

    @staticmethod
    def _price(value: Any) -> float | None:
        if value is None:
            return None
        try:
            cleaned = str(value).replace("$", "").replace(",", "").strip()
            return float(cleaned) if cleaned else None
        except (TypeError, ValueError):
            return None

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

    def _metadata(self, asins: list[str]) -> dict[str, dict[str, Any]]:
        unique_asins = list(dict.fromkeys(str(asin) for asin in asins))
        if not unique_asins:
            return {}
        placeholders = ",".join("?" for _ in unique_asins)
        connection = self._connect()
        try:
            rows = connection.execute(
                f"""
                SELECT parent_asin, title, source_category AS category, price,
                       average_rating AS rating, rating_number AS review_count,
                       images, features, description, store
                FROM products
                WHERE parent_asin IN ({placeholders})
                """,
                unique_asins,
            ).fetchdf()
        finally:
            connection.close()
        return {
            str(row["parent_asin"]): self._row_to_product(row.to_dict())
            for _, row in rows.iterrows()
        }

    def _rating_distribution(self, parent_asin: str) -> dict[str, int]:
        connection = self._connect()
        try:
            rows = connection.execute(
                """
                SELECT CAST(rating AS INTEGER) AS stars, COUNT(*) AS count
                FROM ratings
                WHERE parent_asin = ? AND rating BETWEEN 1 AND 5
                GROUP BY CAST(rating AS INTEGER)
                """,
                [parent_asin],
            ).fetchall()
        finally:
            connection.close()
        counts = {str(stars): int(count) for stars, count in rows}
        return {str(stars): counts.get(str(stars), 0) for stars in range(1, 6)}

    def products(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        category: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        min_rating: float | None = None,
        store: str | None = None,
        sort: str = "relevance",
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
        price_expression = (
            "TRY_CAST(regexp_replace(price, '[^0-9.]', '', 'g') AS DOUBLE)"
        )
        if min_price is not None:
            clauses.append(f"{price_expression} >= ?")
            params.append(min_price)
        if max_price is not None:
            clauses.append(f"{price_expression} <= ?")
            params.append(max_price)
        if min_rating is not None:
            clauses.append("COALESCE(average_rating, 0) >= ?")
            params.append(min_rating)
        if store:
            clauses.append("LOWER(COALESCE(store, '')) LIKE ?")
            params.append(f"%{store.strip().lower()}%")
        where = " AND ".join(clauses)
        order_by = {
            "relevance": "parent_asin",
            "price_asc": f"{price_expression} ASC NULLS LAST, parent_asin",
            "price_desc": f"{price_expression} DESC NULLS LAST, parent_asin",
            "rating_desc": "average_rating DESC NULLS LAST, parent_asin",
            "popularity": "rating_number DESC NULLS LAST, parent_asin",
        }.get(sort, "parent_asin")
        connection = self._connect()
        try:
            total = connection.execute(
                f"SELECT COUNT(*) FROM products WHERE {where}", params
            ).fetchone()[0]
            rows = connection.execute(
                f"""
                SELECT parent_asin, title, source_category AS category, price,
                       average_rating AS rating, rating_number AS review_count,
                       images, features, description, store
                FROM products
                WHERE {where}
                ORDER BY {order_by}
                LIMIT ? OFFSET ?
                """,
                [*params, page_size, offset],
            ).fetchdf()
        finally:
            connection.close()
        return ProductPage(
            items=[self._row_to_product(row.to_dict()) for _, row in rows.iterrows()],
            page=page,
            page_size=page_size,
            total=int(total),
        )

    def product(self, parent_asin: str) -> dict[str, Any] | None:
        result = self._metadata([parent_asin]).get(parent_asin)
        if result is None:
            return None
        distribution = self._rating_distribution(parent_asin)
        rating_count = sum(distribution.values())
        if rating_count:
            result["review_count"] = rating_count
            result["rating"] = sum(
                int(stars) * count for stars, count in distribution.items()
            ) / rating_count
        result["rating_distribution"] = distribution
        return result

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
                "name": str(category),
                "label": str(category).replace("_", " ").title(),
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
            if product is None:
                continue
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
        asins = frame["parent_asin"].astype(str).tolist()
        scores = dict(zip(asins, frame["bayesian_score"]))
        return self._recommendation_products(asins, scores)

    def similar(self, seeds: list[str], limit: int) -> list[dict[str, Any]]:
        unique_seeds = list(dict.fromkeys(str(seed) for seed in seeds))
        indices = [self.item_index[seed] for seed in unique_seeds if seed in self.item_index]
        if not indices:
            return []
        excluded = {str(self.item_ids[index]) for index in indices}
        scores: dict[str, float] = {}
        for index in indices:
            row = self.graph.getrow(index)
            for target, score in zip(row.indices, row.data):
                asin = str(self.item_ids[target])
                if asin not in excluded:
                    scores[asin] = scores.get(asin, 0.0) + float(score)
        ordered = sorted(scores, key=lambda asin: (-scores[asin], asin))[:limit]
        return self._recommendation_products(ordered, scores)

    @staticmethod
    def _event_weight(event: dict[str, Any], now: datetime) -> float:
        try:
            timestamp = datetime.fromisoformat(
                str(event.get("created_at", "")).replace("Z", "+00:00")
            )
            if timestamp.tzinfo is None:
                timestamp = timestamp.replace(tzinfo=timezone.utc)
            age_days = max((now - timestamp.astimezone(timezone.utc)).total_seconds() / 86400, 0)
        except ValueError:
            age_days = 365
        return max(0.2, 1.0 / (1.0 + age_days / 14.0))

    def personalized(
        self,
        purchased_asins: list[str],
        events: list[dict[str, Any]],
        limit: int,
    ) -> list[dict[str, Any]]:
        purchased = set(str(asin) for asin in purchased_asins)
        now = datetime.now(timezone.utc)
        terms: list[tuple[str, float]] = []
        categories: list[tuple[str, float]] = []
        viewed_asins: list[str] = []

        for event in events:
            weight = self._event_weight(event, now)
            event_type = event.get("event_type")
            if event_type == "search" and event.get("search_query"):
                terms.extend(
                    (term, 2.5 * weight)
                    for term in re.findall(r"[a-z0-9]{3,}", str(event["search_query"]).lower())
                )
            elif event_type == "category_view" and event.get("category"):
                categories.append((str(event["category"]), weight))
            elif event_type == "product_view" and event.get("parent_asin"):
                viewed_asins.append(str(event["parent_asin"]))

        anchors = self._metadata(list(purchased) + viewed_asins)
        for asin, product in anchors.items():
            anchor_weight = 6.0 if asin in purchased else 2.0
            for value in (product.get("category"), product.get("store")):
                if value:
                    terms.append((str(value).lower(), anchor_weight))

        if not purchased and not terms and not categories:
            return []

        terms = [(term, weight) for term, weight in terms if len(term) >= 3]
        terms = list(dict.fromkeys(terms))[:40]
        categories = list(dict.fromkeys(categories))[:10]
        clauses: list[str] = []
        params: list[Any] = []
        for term, _ in terms:
            clauses.append(
                "(LOWER(title) LIKE ? OR LOWER(COALESCE(store, '')) LIKE ? "
                "OR LOWER(COALESCE(source_category, '')) LIKE ?)"
            )
            pattern = f"%{term}%"
            params.extend([pattern, pattern, pattern])
        for category, _ in categories:
            clauses.append("(source_category = ? OR main_category = ?)")
            params.extend([category, category])
        if not clauses:
            return []

        exclusion = ",".join("?" for _ in purchased)
        exclusion_clause = f"AND parent_asin NOT IN ({exclusion})" if purchased else ""
        connection = self._connect()
        try:
            rows = connection.execute(
                f"""
                SELECT parent_asin, title, source_category AS category, price,
                       average_rating AS rating, rating_number AS review_count,
                       images, features, description, store
                FROM products
                WHERE title IS NOT NULL AND TRIM(title) <> ''
                  {exclusion_clause}
                  AND ({" OR ".join(clauses)})
                LIMIT 1000
                """,
                [*purchased, *params],
            ).fetchdf()
        finally:
            connection.close()

        scored: list[tuple[str, float]] = []
        for _, row in rows.iterrows():
            product = self._row_to_product(row.to_dict())
            searchable = " ".join(
                str(product.get(key) or "").lower()
                for key in ("title", "category", "store")
            )
            score = sum(weight for term, weight in terms if term in searchable)
            for category, weight in categories:
                normalized = category.lower().replace(" ", "_")
                if normalized in str(product["category"]).lower().replace(" ", "_"):
                    score += 2.0 * weight
            if score > 0:
                scored.append((product["parent_asin"], score))

        scored.sort(key=lambda item: (-item[1], item[0]))
        selected = scored[:limit]
        return self._recommendation_products(
            [asin for asin, _ in selected],
            dict(selected),
        )
