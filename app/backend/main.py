"""
main.py — Flask application factory.

Usage:
  export FLASK_APP=main.py
  flask db init      # (first time only)
  flask db migrate -m "initial"
  flask db upgrade
  flask run --port 5000
"""
import os

from flask import Flask
from flask_cors import CORS

from config import Config
from extensions import db, jwt, migrate


def create_app(config_class=Config) -> Flask:
    """Application factory — creates and configures the Flask app."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Warn developers if default secrets are still in use
    if app.config["SECRET_KEY"] == "dev-secret-change-me-in-prod":
        print("⚠️  WARNING: Using default SECRET_KEY. Set SECRET_KEY env var in production.")
    if app.config["JWT_SECRET_KEY"] == "jwt-dev-secret-change-me-in-prod":
        print("⚠️  WARNING: Using default JWT_SECRET_KEY. Set JWT_SECRET_KEY env var in production.")

    # ── Initialize extensions ─────────────────────────────────────────────────
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # ── CORS — allow frontend dev server only ─────────────────────────────────
    CORS(
        app,
        origins=app.config.get("CORS_ORIGINS", ["http://localhost:3000"]),
        supports_credentials=True,
    )

    # ── Register blueprints ───────────────────────────────────────────────────
    # Import here (inside factory) to avoid circular imports with extensions
    from api.auth import auth_bp

    # All auth routes live under /api  (e.g. /api/signup, /api/login, /api/me)
    app.register_blueprint(auth_bp, url_prefix="/api")

    return app


# ── Entry point ───────────────────────────────────────────────────────────────
# `flask run` uses the `app` variable when FLASK_APP=main.py
app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
