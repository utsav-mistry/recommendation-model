from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import time
from typing import Any

import duckdb


EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PBKDF2_ITERATIONS = 310_000


class DuplicateEmailError(ValueError):
    pass


class AuthService:
    def __init__(self, db_path: str) -> None:
        self.db_path = db_path
        self.secret = os.getenv("AUTH_TOKEN_SECRET", "standalone-demo-change-this-secret").encode()
        connection = self._connect()
        try:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS app_users (
                    email VARCHAR PRIMARY KEY,
                    display_name VARCHAR NOT NULL,
                    password_hash VARCHAR NOT NULL,
                    password_salt VARCHAR NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        finally:
            connection.close()

    def _connect(self) -> duckdb.DuckDBPyConnection:
        return duckdb.connect(self.db_path)

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
    def _hash_password(password: str, salt: bytes) -> str:
        return hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS
        ).hex()

    def _token(self, email: str) -> str:
        payload = {"email": email, "expires_at": int(time.time()) + 60 * 60 * 24 * 7}
        encoded = base64.urlsafe_b64encode(
            json.dumps(payload, separators=(",", ":")).encode()
        ).decode()
        signature = hmac.new(self.secret, encoded.encode(), hashlib.sha256).hexdigest()
        return f"{encoded}.{signature}"

    def _user(self, email: str) -> dict[str, str] | None:
        connection = self._connect()
        try:
            row = connection.execute(
                "SELECT email, display_name FROM app_users WHERE email = ?", [email]
            ).fetchone()
        finally:
            connection.close()
        if row is None:
            return None
        return {"email": str(row[0]), "display_name": str(row[1])}

    def signup(self, email: str, password: str, display_name: str) -> dict[str, Any]:
        normalised_email = self._validate_email(email)
        name = display_name.strip()
        if len(password) < 8:
            raise ValueError("Password must contain at least 8 characters")
        if not name:
            raise ValueError("Display name is required")
        if self._user(normalised_email) is not None:
            raise DuplicateEmailError("An account with that email already exists")
        salt = secrets.token_bytes(16)
        connection = self._connect()
        try:
            connection.execute(
                """
                INSERT INTO app_users (email, display_name, password_hash, password_salt)
                VALUES (?, ?, ?, ?)
                """,
                [normalised_email, name, self._hash_password(password, salt), salt.hex()],
            )
        finally:
            connection.close()
        user = {"email": normalised_email, "display_name": name}
        return {"token": self._token(normalised_email), "user": user}

    def login(self, email: str, password: str) -> dict[str, Any]:
        normalised_email = self._validate_email(email)
        connection = self._connect()
        try:
            row = connection.execute(
                """
                SELECT email, display_name, password_hash, password_salt
                FROM app_users WHERE email = ?
                """,
                [normalised_email],
            ).fetchone()
        finally:
            connection.close()
        if row is None:
            raise ValueError("Invalid email or password")
        expected = self._hash_password(password, bytes.fromhex(str(row[3])))
        if not hmac.compare_digest(expected, str(row[2])):
            raise ValueError("Invalid email or password")
        return {
            "token": self._token(normalised_email),
            "user": {"email": str(row[0]), "display_name": str(row[1])},
        }

    def verify_token(self, token: str) -> dict[str, str]:
        try:
            encoded, signature = token.split(".", 1)
            expected = hmac.new(self.secret, encoded.encode(), hashlib.sha256).hexdigest()
            if not hmac.compare_digest(expected, signature):
                raise ValueError
            payload = json.loads(base64.urlsafe_b64decode(encoded.encode()))
            if int(payload["expires_at"]) < int(time.time()):
                raise ValueError
            user = self._user(str(payload["email"]))
        except (ValueError, KeyError, TypeError, json.JSONDecodeError):
            user = None
        if user is None:
            raise ValueError("Invalid or expired session")
        return user
