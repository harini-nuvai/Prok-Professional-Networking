"""
extensions.py — Shared extension instances.

Created here (not in main.py) to avoid circular imports:
  models → db (extensions)  ✓
  main   → db (extensions)  ✓
  No circular chain.
"""
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
