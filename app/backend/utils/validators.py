"""
utils/validators.py — Input validation helpers for auth endpoints.

validate_signup_input()  — returns (errors_dict, cleaned_data)
validate_login_input()   — returns (errors_dict, cleaned_data)
validate_email()         — simple regex-based email check
validate_password()      — complexity rules
"""
import re
from typing import Any


# ── email regex ───────────────────────────────────────────────────────────────
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# ── password complexity ───────────────────────────────────────────────────────
_UPPER_RE = re.compile(r"[A-Z]")
_LOWER_RE = re.compile(r"[a-z]")
_DIGIT_RE = re.compile(r"\d")


def validate_email(email: str) -> str | None:
    """Return an error message string if invalid, else None."""
    if not _EMAIL_RE.match(email):
        return "Invalid email format."
    return None


def validate_password(password: str) -> str | None:
    """
    Password rules:
      • At least 8 characters
      • At least 1 uppercase letter
      • At least 1 lowercase letter
      • At least 1 digit
    Returns an error message or None.
    """
    if len(password) < 8:
        return "Password must be at least 8 characters."
    if not _UPPER_RE.search(password):
        return "Password must contain at least one uppercase letter."
    if not _LOWER_RE.search(password):
        return "Password must contain at least one lowercase letter."
    if not _DIGIT_RE.search(password):
        return "Password must contain at least one digit."
    return None


def validate_signup_input(data: dict[str, Any]) -> tuple[dict, dict]:
    """
    Validate and sanitize signup fields.

    Returns:
        errors  — {field_name: error_message}  (empty if all valid)
        cleaned — {username, email, password}   (stripped / lowercased)
    """
    errors: dict[str, str] = {}

    username = str(data.get("username") or "").strip()
    email = str(data.get("email") or "").strip().lower()
    password = str(data.get("password") or "")

    if not username:
        errors["username"] = "Username is required."
    elif len(username) < 3:
        errors["username"] = "Username must be at least 3 characters."
    elif len(username) > 80:
        errors["username"] = "Username must be 80 characters or fewer."

    if not email:
        errors["email"] = "Email is required."
    else:
        email_err = validate_email(email)
        if email_err:
            errors["email"] = email_err

    if not password:
        errors["password"] = "Password is required."
    else:
        pw_err = validate_password(password)
        if pw_err:
            errors["password"] = pw_err

    cleaned = {"username": username, "email": email, "password": password}
    return errors, cleaned


def validate_login_input(data: dict[str, Any]) -> tuple[dict, dict]:
    """
    Validate and sanitize login fields.
    Accepts either 'username_or_email' or 'username' or 'email' as the identifier.

    Returns:
        errors  — {field_name: error_message}
        cleaned — {identifier, password}
    """
    errors: dict[str, str] = {}

    # Accept any of these field names from the client
    identifier = (
        str(data.get("username_or_email") or "").strip()
        or str(data.get("email") or "").strip()
        or str(data.get("username") or "").strip()
    ).lower()

    password = str(data.get("password") or "")

    if not identifier:
        errors["username_or_email"] = "Username or email is required."
    if not password:
        errors["password"] = "Password is required."

    cleaned = {"identifier": identifier, "password": password}
    return errors, cleaned
