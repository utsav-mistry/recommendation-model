from __future__ import annotations

import sqlite3
from typing import Any

from .database import SQLiteDatabase


class OrderService:
    def __init__(self, database: SQLiteDatabase, catalogue: Any) -> None:
        self.database = database
        self.catalogue = catalogue

    def checkout(self, user_id: int) -> dict[str, Any]:
        with self.database.connection() as connection:
            rows = connection.execute(
                """
                SELECT parent_asin, quantity
                FROM cart_items
                WHERE user_id = ?
                ORDER BY id
                """,
                [user_id],
            ).fetchall()
            if not rows:
                raise ValueError("Cannot checkout an empty cart")

            items = []
            total = 0.0
            for row in rows:
                product = self.catalogue.product(str(row["parent_asin"]))
                if product is None:
                    raise ValueError(f"Product not found: {row['parent_asin']}")
                price = product.get("price")
                quantity = int(row["quantity"])
                if price is None or price <= 0 or quantity <= 0:
                    raise ValueError(f"Product price is unavailable: {row['parent_asin']}")
                items.append((str(row["parent_asin"]), quantity, float(price)))
                total += float(price) * quantity

            order_cursor = connection.execute(
                """
                INSERT INTO orders (user_id, order_status, total_amount)
                VALUES (?, 'simulated_completed', ?)
                """,
                [user_id, total],
            )
            order_id = int(order_cursor.lastrowid)
            connection.executemany(
                """
                INSERT INTO order_items (order_id, parent_asin, quantity, unit_price)
                VALUES (?, ?, ?, ?)
                """,
                [[order_id, asin, quantity, price] for asin, quantity, price in items],
            )
            connection.execute("DELETE FROM cart_items WHERE user_id = ?", [user_id])
        return self.get_order(user_id, order_id)

    def orders(self, user_id: int) -> list[dict[str, Any]]:
        with self.database.connection() as connection:
            rows = connection.execute(
                """
                SELECT id, order_status, total_amount, created_at
                FROM orders
                WHERE user_id = ?
                ORDER BY created_at DESC, id DESC
                """,
                [user_id],
            ).fetchall()
        return [dict(row) for row in rows]

    def get_order(self, user_id: int, order_id: int) -> dict[str, Any]:
        with self.database.connection() as connection:
            order = connection.execute(
                """
                SELECT id, order_status, total_amount, created_at
                FROM orders
                WHERE id = ? AND user_id = ?
                """,
                [order_id, user_id],
            ).fetchone()
            if order is None:
                raise ValueError("Order not found")
            items = connection.execute(
                """
                SELECT parent_asin, quantity, unit_price
                FROM order_items
                WHERE order_id = ?
                ORDER BY id
                """,
                [order_id],
            ).fetchall()
        enriched = []
        for item in items:
            product = self.catalogue.product(str(item["parent_asin"]))
            enriched.append(
                {
                    "parent_asin": str(item["parent_asin"]),
                    "quantity": int(item["quantity"]),
                    "unit_price": float(item["unit_price"]),
                    "product": product,
                }
            )
        return {**dict(order), "items": enriched}
