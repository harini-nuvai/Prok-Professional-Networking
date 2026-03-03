"""
models/user.py — SQLAlchemy User model.

Fields: id, username, email, password_hash, created_at
Methods: set_password(), check_password(), to_dict()
"""
from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db  # shared SQLAlchemy instance (see extensions.py)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    # unique=True enforces uniqueness at the DB level (index), not only in Python.
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)

    # We never store plain-text passwords — only the bcrypt/pbkdf2 hash.
    password_hash = db.Column(db.String(255), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # ── password helpers ──────────────────────────────────────────────────────

    def set_password(self, plain_password: str) -> None:
        """Hash and store a plain-text password using werkzeug's pbkdf2:sha256."""
        self.password_hash = generate_password_hash(plain_password)

    def check_password(self, plain_password: str) -> bool:
        """Verify a plain-text password against the stored hash."""
        return check_password_hash(self.password_hash, plain_password)

    # ── serialization ─────────────────────────────────────────────────────────

    def to_dict(self) -> dict:
        """Return a safe dict — no password_hash ever included."""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
        }
