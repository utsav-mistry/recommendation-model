from __future__ import annotations

import json
import sqlite3
from typing import Any

from .database import SQLiteDatabase


ALLOWED_EVENT_TYPES = {
    "product_view",
    "search",
    "category_view",
    "wishlist_add",
    "wishlist_remove",
    "cart_add",
    "cart_remove",
}


class ActivityService:
    def __init__(self, database: SQLiteDatabase) -> None:
        self.database = database

    def record(
        self,
        user_id: int,
        event_type: str,
        parent_asin: str | None = None,
        search_query: str | None = None,
        category: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if event_type not in ALLOWED_EVENT_TYPES:
            raise ValueError("Unsupported event type")
        with self.database.connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO user_events
                    (user_id, event_type, parent_asin, search_query, category, metadata)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                [
                    user_id,
                    event_type,
                    parent_asin,
                    search_query,
                    category,
                    json.dumps(metadata, separators=(",", ":")) if metadata else None,
                ],
            )
            return {"id": int(cursor.lastrowid), "event_type": event_type}

    def list(self, user_id: int, limit: int = 100) -> list[dict[str, Any]]:
        with self.database.connection() as connection:
            rows = connection.execute(
                """
                SELECT id, event_type, parent_asin, search_query, category, metadata, created_at
                FROM user_events
                WHERE user_id = ?
                ORDER BY created_at DESC, id DESC
                LIMIT ?
                """,
                [user_id, limit],
            ).fetchall()
        return [dict(row) for row in rows]
