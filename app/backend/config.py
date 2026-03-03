"""
config.py — App configuration loaded from environment variables.
In production, always set SECRET_KEY, JWT_SECRET_KEY, and DATABASE_URL as real env vars.
"""
import os
from datetime import timedelta


class Config:
    # ── Flask core ────────────────────────────────────────────────────────────
    # WARNING: Change this in production by setting the SECRET_KEY env var.
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me-in-prod")

    # ── Database (MySQL via SQLAlchemy) ───────────────────────────────────────
    # Format: mysql://user:password@host/dbname
    # Override with: export DATABASE_URL="mysql://root:yourpassword@localhost/prok_db"
    # Fallback to SQLite for local dev when MySQL isn't configured.
    # Set DATABASE_URL env var to use MySQL:
    #   export DATABASE_URL="mysql://root:yourpassword@localhost/prok_db"
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "sqlite:///auth.db",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ── JWT (Flask-JWT-Extended) ──────────────────────────────────────────────
    # WARNING: Change this in production by setting the JWT_SECRET_KEY env var.
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-dev-secret-change-me-in-prod")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Only the Vite dev server is allowed to call the API.
    CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001"]
