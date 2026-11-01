from __future__ import annotations

import sqlite3
from typing import Any

from .database import SQLiteDatabase


class UserDataService:
    def __init__(self, database: SQLiteDatabase, catalogue: Any) -> None:
        self.database = database
        self.catalogue = catalogue

    def _product(self, parent_asin: str) -> dict[str, Any]:
        product = self.catalogue.product(parent_asin)
        if product is None:
            raise ValueError("Product not found")
        return product

    def wishlist(self, user_id: int) -> dict[str, Any]:
        with self.database.connection() as connection:
            rows = connection.execute(
                """
                SELECT id, parent_asin, created_at
                FROM wishlist_items
                WHERE user_id = ?
                ORDER BY created_at DESC, id DESC
                """,
                [user_id],
            ).fetchall()
        return self._enriched_items(rows, "wishlist")

    def add_wishlist(self, user_id: int, parent_asin: str) -> dict[str, Any]:
        self._product(parent_asin)
        with self.database.connection() as connection:
            try:
                connection.execute(
                    """
                    INSERT INTO wishlist_items (user_id, parent_asin)
                    VALUES (?, ?)
                    ON CONFLICT (user_id, parent_asin) DO NOTHING
                    """,
                    [user_id, parent_asin],
                )
            except sqlite3.IntegrityError as error:
                raise ValueError("Unable to add wishlist item") from error
        return self.wishlist(user_id)

    def remove_wishlist(self, user_id: int, parent_asin: str) -> dict[str, Any]:
        with self.database.connection() as connection:
            connection.execute(
                "DELETE FROM wishlist_items WHERE user_id = ? AND parent_asin = ?",
                [user_id, parent_asin],
            )
        return self.wishlist(user_id)

    def cart(self, user_id: int) -> dict[str, Any]:
        with self.database.connection() as connection:
            rows = connection.execute(
                """
                SELECT id, parent_asin, quantity, created_at, updated_at
                FROM cart_items
                WHERE user_id = ?
                ORDER BY updated_at DESC, id DESC
                """,
                [user_id],
            ).fetchall()
        return self._enriched_items(rows, "cart")

    def recommendation_context(self, user_id: int) -> dict[str, Any]:
        with self.database.connection() as connection:
            purchases = connection.execute(
                """
                SELECT DISTINCT oi.parent_asin
                FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                WHERE o.user_id = ? AND o.order_status = 'simulated_completed'
                """,
                [user_id],
            ).fetchall()
            events = connection.execute(
                """
                SELECT event_type, parent_asin, search_query, category, metadata, created_at
                FROM user_events
                WHERE user_id = ?
                  AND event_type IN ('search', 'category_view', 'product_view')
                ORDER BY created_at DESC, id DESC
                LIMIT 200
                """,
                [user_id],
            ).fetchall()
        return {
            "purchased_asins": [str(row["parent_asin"]) for row in purchases],
            "events": [dict(row) for row in events],
        }

    def recently_viewed(self, user_id: int, limit: int = 8) -> list[dict[str, Any]]:
        with self.database.connection() as connection:
            rows = connection.execute(
                """
                SELECT parent_asin
                FROM user_events
                WHERE user_id = ? AND event_type = 'product_view'
                  AND parent_asin IS NOT NULL
                GROUP BY parent_asin
                ORDER BY MAX(created_at) DESC, MAX(id) DESC
                LIMIT ?
                """,
                [user_id, limit],
            ).fetchall()
        return [
            product
            for product in (
                self.catalogue.product(str(row["parent_asin"])) for row in rows
            )
            if product is not None
        ]

    def add_cart(self, user_id: int, parent_asin: str, quantity: int) -> dict[str, Any]:
        self._validate_quantity(quantity)
        product = self._product(parent_asin)
        if product.get("price") is None or product["price"] <= 0:
            raise ValueError("This product is out of stock and cannot be added to the cart")
        with self.database.connection() as connection:
            connection.execute(
                """
                INSERT INTO cart_items (user_id, parent_asin, quantity)
                VALUES (?, ?, ?)
                ON CONFLICT (user_id, parent_asin) DO UPDATE SET
                    quantity = cart_items.quantity + excluded.quantity,
                    updated_at = CURRENT_TIMESTAMP
                """,
                [user_id, parent_asin, quantity],
            )
        return self.cart(user_id)

    def update_cart(self, user_id: int, parent_asin: str, quantity: int) -> dict[str, Any]:
        self._validate_quantity(quantity)
        with self.database.connection() as connection:
            cursor = connection.execute(
                """
                UPDATE cart_items
                SET quantity = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND parent_asin = ?
                """,
                [quantity, user_id, parent_asin],
            )
        if cursor.rowcount == 0:
            raise ValueError("Cart item not found")
        return self.cart(user_id)

    def remove_cart(self, user_id: int, parent_asin: str) -> dict[str, Any]:
        with self.database.connection() as connection:
            connection.execute(
                "DELETE FROM cart_items WHERE user_id = ? AND parent_asin = ?",
                [user_id, parent_asin],
            )
        return self.cart(user_id)

    @staticmethod
    def _validate_quantity(quantity: int) -> None:
        if quantity <= 0:
            raise ValueError("Quantity must be a positive integer")

    def _enriched_items(self, rows: list[sqlite3.Row], kind: str) -> dict[str, Any]:
        items = []
        unavailable = []
        for row in rows:
            try:
                product = self._product(str(row["parent_asin"]))
            except ValueError:
                unavailable.append(str(row["parent_asin"]))
                continue
            item = {
                "id": int(row["id"]),
                "parent_asin": str(row["parent_asin"]),
                "created_at": str(row["created_at"]),
                "product": product,
            }
            if kind == "cart":
                item["quantity"] = int(row["quantity"])
                item["updated_at"] = str(row["updated_at"])
            items.append(item)
        return {"items": items, "unavailable_parent_asins": unavailable}
