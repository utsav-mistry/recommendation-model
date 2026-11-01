from __future__ import annotations

import os
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent


def _path_from_env(name: str, default: str) -> Path:
    value = os.getenv(name)
    path = Path(value) if value else ROOT_DIR / default
    return path if path.is_absolute() else ROOT_DIR / path


DB_PATH = _path_from_env("RECOMMENDATION_DB_PATH", "amazon_full.duckdb")
SQLITE_PATH = _path_from_env("APPLICATION_SQLITE_PATH", "application.sqlite3")
RANKINGS_PATH = _path_from_env(
    "RECOMMENDATION_RANKINGS_PATH",
    "experiments/global_rankings_clean.parquet",
)
GRAPH_PATH = _path_from_env(
    "RECOMMENDATION_GRAPH_PATH",
    "experiments/electronics_train_item_neighbors.npz",
)
ITEM_IDS_PATH = _path_from_env(
    "RECOMMENDATION_ITEM_IDS_PATH",
    "experiments/electronics_train_item_ids.npy",
)
