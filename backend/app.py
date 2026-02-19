"""
Flask Backend (Beginner-friendly)
REST API for signup/login + JWT protected /api/me.
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash


app = Flask(__name__)

# In production, set SECRET_KEY as an environment variable.
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///auth.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_EXPIRATION_DELTA"] = timedelta(hours=24)

db = SQLAlchemy(app)

# Allow your Vite frontend origin.
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
        }


def _json_error(message: str, status: int):
    return jsonify({"error": message}), status


def generate_token(user_id: int) -> str:
    exp = datetime.now(timezone.utc) + app.config["JWT_EXPIRATION_DELTA"]
    payload = {"user_id": user_id, "exp": exp}
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")


def verify_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        return int(payload.get("user_id"))
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return _json_error("Token is missing", 401)

        token = auth_header.split(" ", 1)[1].strip()
        user_id = verify_token(token)
        if not user_id:
            return _json_error("Token is invalid or expired", 401)

        return fn(user_id, *args, **kwargs)

    return wrapper


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not email or not password:
        return _json_error("Missing required fields", 400)

    if len(username) < 3:
        return _json_error("Username must be at least 3 characters", 400)

    if "@" not in email or "." not in email:
        return _json_error("Invalid email format", 400)

    if len(password) < 8:
        return _json_error("Password must be at least 8 characters", 400)

    if User.query.filter_by(username=username).first():
        return _json_error("Username already exists", 400)

    if User.query.filter_by(email=email).first():
        return _json_error("Email already exists", 400)

    try:
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
        )
        db.session.add(user)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return _json_error("Failed to create user", 500)

    token = generate_token(user.id)
    return (
        jsonify({"message": "User created successfully", "token": token, "user": user.to_dict()}),
        201,
    )


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return _json_error("Email and password are required", 400)

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return _json_error("Invalid email or password", 401)

    token = generate_token(user.id)
    return jsonify({"message": "Login successful", "token": token, "user": user.to_dict()}), 200


@app.route("/api/me", methods=["GET"])
@token_required
def me(user_id: int):
    user = User.query.get(user_id)
    if not user:
        return _json_error("User not found", 404)
    return jsonify({"user": user.to_dict()}), 200


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True, port=5000)

