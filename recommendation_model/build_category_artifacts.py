from __future__ import annotations

import argparse
from pathlib import Path
import re

import duckdb
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix, save_npz
from sklearn.preprocessing import normalize


def artifact_name(category: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", category.strip())


def build_category(
    connection: duckdb.DuckDBPyConnection,
    category: str,
    output_dir: Path,
    top_k: int,
    chunk_size: int,
    shrinkage: float,
) -> dict[str, int | float | str]:
    cutoff = connection.execute(
        """
        SELECT quantile_cont(CAST(timestamp AS DOUBLE), 0.8)
        FROM ratings
        WHERE category = ?
          AND rating BETWEEN 1 AND 5
          AND timestamp IS NOT NULL
        """,
        [category],
    ).fetchone()[0]
    if cutoff is None:
        return {"category": category, "products": 0, "training_interactions": 0}

    interactions = connection.execute(
        """
        SELECT user_id, parent_asin, CAST(timestamp AS DOUBLE) AS timestamp
        FROM ratings
        WHERE category = ?
          AND rating BETWEEN 4 AND 5
          AND timestamp IS NOT NULL
        """,
        [category],
    ).fetchdf()
    train = interactions[interactions["timestamp"] <= cutoff].copy()
    del interactions
    train = train.drop_duplicates(["user_id", "parent_asin"])
    if train.empty:
        return {"category": category, "products": 0, "training_interactions": 0}

    user_codes, _ = pd.factorize(train["user_id"])
    item_ids = train["parent_asin"].astype(str).drop_duplicates().to_numpy()
    item_mapping = {asin: index for index, asin in enumerate(item_ids)}
    item_codes = train["parent_asin"].astype(str).map(item_mapping).to_numpy(
        dtype=np.int32
    )
    user_item = csr_matrix(
        (
            np.ones(len(train), dtype=np.float32),
            (user_codes, item_codes),
        ),
        shape=(int(user_codes.max()) + 1, len(item_ids)),
        dtype=np.float32,
    )
    del train

    item_user = normalize(user_item.T.tocsr(), norm="l2", axis=1)
    interaction_counts = np.asarray(user_item.sum(axis=0)).ravel()
    num_items = len(item_ids)
    capacity = num_items * top_k
    neighbor_rows = np.empty(capacity, dtype=np.int32)
    neighbor_cols = np.empty(capacity, dtype=np.int32)
    neighbor_values = np.empty(capacity, dtype=np.float32)
    cursor = 0

    for start in range(0, num_items, chunk_size):
        end = min(start + chunk_size, num_items)
        block = item_user[start:end] @ item_user.T
        for local_row in range(end - start):
            source = start + local_row
            row = block.getrow(local_row)
            valid = (row.indices != source) & (row.data > 0)
            indices = row.indices[valid]
            scores = row.data[valid]
            if not len(scores):
                continue
            overlaps = scores * np.sqrt(
                interaction_counts[source] * interaction_counts[indices]
            )
            scores = scores * (overlaps / (overlaps + shrinkage))
            keep_count = min(top_k, len(scores))
            if len(scores) > keep_count:
                selected = np.argpartition(scores, -keep_count)[-keep_count:]
                indices = indices[selected]
                scores = scores[selected]
            order = np.argsort(scores)[::-1]
            indices = indices[order]
            scores = scores[order]
            count = len(scores)
            neighbor_rows[cursor:cursor + count] = source
            neighbor_cols[cursor:cursor + count] = indices
            neighbor_values[cursor:cursor + count] = scores
            cursor += count
        print(f"{category}: processed {end}/{num_items} products")

    neighbors = csr_matrix(
        (
            neighbor_values[:cursor],
            (neighbor_rows[:cursor], neighbor_cols[:cursor]),
        ),
        shape=(num_items, num_items),
    )
    category_dir = output_dir / artifact_name(category)
    category_dir.mkdir(parents=True, exist_ok=True)
    np.save(category_dir / "item_ids.npy", item_ids)
    save_npz(category_dir / "item_neighbors.npz", neighbors)
    return {
        "category": category,
        "cutoff": float(cutoff),
        "products": num_items,
        "training_interactions": int(user_item.nnz),
        "links": int(neighbors.nnz),
        "shrinkage": shrinkage,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build temporal, category-sharded item-item graphs."
    )
    parser.add_argument("--db", default="amazon_full.duckdb")
    parser.add_argument(
        "--output", default="recommendation_model/artifacts/categories"
    )
    parser.add_argument("--top-k", type=int, default=100)
    parser.add_argument("--chunk-size", type=int, default=256)
    parser.add_argument(
        "--shrinkage",
        type=float,
        default=5.0,
        help="Confidence-weighting constant for low-overlap neighbours.",
    )
    parser.add_argument("--category", action="append")
    args = parser.parse_args()
    if args.top_k < 1 or args.chunk_size < 1 or args.shrinkage < 0:
        raise ValueError("--top-k and --chunk-size must be positive; shrinkage cannot be negative")

    connection = duckdb.connect(args.db, read_only=True)
    try:
        categories = args.category or [
            row[0]
            for row in connection.execute(
                """
                SELECT DISTINCT category
                FROM ratings
                WHERE category IS NOT NULL
                ORDER BY category
                """
            ).fetchall()
        ]
        output_dir = Path(args.output)
        output_dir.mkdir(parents=True, exist_ok=True)
        manifest: list[dict[str, int | float | str]] = []
        for category in categories:
            manifest.append(
                build_category(
                    connection,
                    category,
                    output_dir,
                    args.top_k,
                    args.chunk_size,
                    args.shrinkage,
                )
            )
        pd.DataFrame(manifest).to_json(
            output_dir / "manifest.json", orient="records", indent=2
        )
    finally:
        connection.close()


if __name__ == "__main__":
    main()
