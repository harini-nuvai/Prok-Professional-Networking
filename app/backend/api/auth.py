"""
api/auth.py — Authentication routes.

Endpoints:
  POST /api/signup  — register a new user
  POST /api/login   — authenticate and return a JWT
  GET  /api/me      — return the current user (JWT required)

All responses follow the standard format:
  { success: bool, message: str, data?: any, errors?: {field: str} }
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from sqlalchemy.exc import IntegrityError

from extensions import db
from models.user import User
from utils.rate_limiter import is_rate_limited
from utils.validators import validate_login_input, validate_signup_input

auth_bp = Blueprint("auth", __name__)


# ── helper: standard response builders ───────────────────────────────────────

def success_response(message: str, data: dict | None = None, status: int = 200):
    body = {"success": True, "message": message}
    if data is not None:
        body["data"] = data
    return jsonify(body), status


def error_response(message: str, errors: dict | None = None, status: int = 400):
    body = {"success": False, "message": message}
    if errors:
        body["errors"] = errors
    return jsonify(body), status


# ── POST /api/signup ──────────────────────────────────────────────────────────

@auth_bp.route("/signup", methods=["POST"])
def signup():
    # Rate limit: max 5 signup attempts per IP per minute
    if is_rate_limited(request.remote_addr, "signup", max_requests=5, window_seconds=60):
        return error_response("Too many signup attempts. Please wait a minute.", status=429)

    data = request.get_json(silent=True) or {}
    errors, cleaned = validate_signup_input(data)

    if errors:
        return error_response("Validation failed.", errors=errors, status=400)

    username = cleaned["username"]
    email = cleaned["email"]
    password = cleaned["password"]

    # Check uniqueness before hitting the DB constraint
    # (gives a friendlier, field-specific error message)
    if User.query.filter_by(username=username).first():
        return error_response(
            "Validation failed.",
            errors={"username": "Username is already taken."},
            status=409,
        )
    if User.query.filter_by(email=email).first():
        return error_response(
            "Validation failed.",
            errors={"email": "An account with this email already exists."},
            status=409,
        )

    try:
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        # Race condition: another request inserted the same username/email
        db.session.rollback()
        return error_response("Username or email already exists.", status=409)
    except Exception:
        db.session.rollback()
        return error_response("Failed to create account. Please try again.", status=500)

    return success_response(
        "Account created successfully!",
        data={"user": user.to_dict()},
        status=201,
    )


# ── POST /api/login ───────────────────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
def login():
    # Rate limit: max 10 login attempts per IP per minute
    if is_rate_limited(request.remote_addr, "login", max_requests=10, window_seconds=60):
        return error_response("Too many login attempts. Please wait a minute.", status=429)

    data = request.get_json(silent=True) or {}
    errors, cleaned = validate_login_input(data)

    if errors:
        return error_response("Validation failed.", errors=errors, status=400)

    identifier = cleaned["identifier"]
    password = cleaned["password"]

    # Look up user by email OR username
    user = User.query.filter(
        (User.email == identifier) | (User.username == identifier)
    ).first()

    # Use a generic error — do NOT reveal whether the username/email exists.
    # This prevents user enumeration attacks.
    if not user or not user.check_password(password):
        return error_response("Invalid credentials.", status=401)

    # Create a JWT; the identity is the user's integer ID (as a string per JWT spec)
    access_token = create_access_token(identity=str(user.id))

    return success_response(
        "Login successful.",
        data={"access_token": access_token, "user": user.to_dict()},
    )


# ── GET /api/me ───────────────────────────────────────────────────────────────

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    # get_jwt_identity() returns the string we passed to create_access_token()
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user:
        return error_response("User not found.", status=404)

    return success_response("User fetched.", data={"user": user.to_dict()})
