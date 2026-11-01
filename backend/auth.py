from __future__ import annotations

import hashlib
import hmac
import re
import secrets
import sqlite3
import time
import uuid
from typing import Any

from .database import SQLiteDatabase


EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PBKDF2_ITERATIONS = 310_000
SESSION_TTL_SECONDS = 60 * 60 * 24 * 7


class DuplicateEmailError(ValueError):
    pass


class AuthService:
    def __init__(self, database: SQLiteDatabase) -> None:
        self.database = database

    @staticmethod
    def _normalise_email(email: str) -> str:
        return email.strip().lower()

    @staticmethod
    def _validate_email(email: str) -> str:
        normalised = AuthService._normalise_email(email)
        if not EMAIL_PATTERN.fullmatch(normalised):
            raise ValueError("Enter a valid email address")
        return normalised

    @staticmethod
    def _validate_age(age: int) -> int:
        if age <= 0 or age > 120:
            raise ValueError("Age must be a positive integer no greater than 120")
        return age

    @staticmethod
    def _hash_password(password: str, salt: bytes) -> str:
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS
        ).hex()
        return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt.hex()}${digest}"

    @classmethod
    def _verify_password(cls, password: str, stored_hash: str) -> bool:
        try:
            algorithm, iterations, salt_hex, expected = stored_hash.split("$")
            if algorithm != "pbkdf2_sha256":
                return False
            actual = hashlib.pbkdf2_hmac(
                "sha256",
                password.encode("utf-8"),
                bytes.fromhex(salt_hex),
                int(iterations),
            ).hex()
            return hmac.compare_digest(actual, expected)
        except (ValueError, TypeError):
            return False

    @staticmethod
    def _user(row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": int(row["id"]),
            "name": str(row["name"]),
            "email": str(row["email"]),
            "age": int(row["age"]),
            "created_at": str(row["created_at"]),
            "updated_at": str(row["updated_at"]),
        }

    @staticmethod
    def _token_hash(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    def _create_session(self, connection: sqlite3.Connection, user_id: int) -> str:
        token = secrets.token_urlsafe(32)
        connection.execute(
            """
            INSERT INTO sessions (id, user_id, token_hash, expires_at)
            VALUES (?, ?, ?, ?)
            """,
            [
                str(uuid.uuid4()),
                user_id,
                self._token_hash(token),
                int(time.time()) + SESSION_TTL_SECONDS,
            ],
        )
        return token

    def signup(self, email: str, password: str, name: str, age: int) -> dict[str, Any]:
        normalised_email = self._validate_email(email)
        display_name = name.strip()
        if not display_name:
            raise ValueError("Name is required")
        if len(password) < 8:
            raise ValueError("Password must contain at least 8 characters")
        validated_age = self._validate_age(age)
        salt = secrets.token_bytes(16)
        try:
            with self.database.connection() as connection:
                cursor = connection.execute(
                    """
                    INSERT INTO users (name, email, password_hash, age)
                    VALUES (?, ?, ?, ?)
                    """,
                    [
                        display_name,
                        normalised_email,
                        self._hash_password(password, salt),
                        validated_age,
                    ],
                )
                user_id = int(cursor.lastrowid)
                row = connection.execute(
                    "SELECT * FROM users WHERE id = ?", [user_id]
                ).fetchone()
                token = self._create_session(connection, user_id)
        except sqlite3.IntegrityError as error:
            raise DuplicateEmailError("An account with that email already exists") from error
        return {"token": token, "user": self._user(row)}

    def login(self, email: str, password: str) -> dict[str, Any]:
        normalised_email = self._validate_email(email)
        with self.database.connection() as connection:
            row = connection.execute(
                "SELECT * FROM users WHERE email = ?", [normalised_email]
            ).fetchone()
            if row is None or not self._verify_password(password, str(row["password_hash"])):
                raise ValueError("Invalid email or password")
            token = self._create_session(connection, int(row["id"]))
        return {"token": token, "user": self._user(row)}

    def verify_token(self, token: str) -> dict[str, Any]:
        with self.database.connection() as connection:
            row = connection.execute(
                """
                SELECT users.*
                FROM sessions
                JOIN users ON users.id = sessions.user_id
                WHERE sessions.token_hash = ? AND sessions.expires_at > ?
                """,
                [self._token_hash(token), int(time.time())],
            ).fetchone()
        if row is None:
            raise ValueError("Invalid or expired session")
        return self._user(row)

    def logout(self, token: str) -> None:
        with self.database.connection() as connection:
            connection.execute(
                "DELETE FROM sessions WHERE token_hash = ?", [self._token_hash(token)]
            )
