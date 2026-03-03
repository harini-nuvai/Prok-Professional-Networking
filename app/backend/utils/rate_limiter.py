"""
utils/rate_limiter.py — Simple in-memory rate limiter (no Redis needed for dev).

Uses a sliding-window approach:
  • Keeps a list of request timestamps per (IP, endpoint) key.
  • Drops timestamps older than `window_seconds` on each check.
  • Rejects if count exceeds `max_requests` within the window.

Limitations:
  • Not shared across multiple worker processes (fine for dev/single-worker).
  • For production with multiple workers, use Flask-Limiter + Redis backend.
"""
import time
from collections import defaultdict
from threading import Lock

# Stores timestamps: key → [timestamp, timestamp, ...]
_store: dict[str, list[float]] = defaultdict(list)
_lock = Lock()  # thread-safe for multi-threaded Flask dev server


def is_rate_limited(
    ip: str,
    endpoint: str,
    max_requests: int = 10,
    window_seconds: int = 60,
) -> bool:
    """
    Returns True if the caller should be rate-limited (too many recent requests).

    Args:
        ip:             Client IP address (from request.remote_addr).
        endpoint:       A label like "login" or "signup".
        max_requests:   How many requests are allowed in the window. Default: 10.
        window_seconds: The sliding window size in seconds. Default: 60.
    """
    key = f"{ip}:{endpoint}"
    now = time.time()
    cutoff = now - window_seconds

    with _lock:
        # Remove timestamps outside the window (sliding window)
        _store[key] = [t for t in _store[key] if t > cutoff]

        if len(_store[key]) >= max_requests:
            return True  # limit exceeded

        _store[key].append(now)
        return False
