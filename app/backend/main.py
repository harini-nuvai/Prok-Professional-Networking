from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv

load_dotenv()


def create_app():
    app = Flask(__name__)

    # Load config
    from config import Config
    app.config.from_object(Config)

    # Extensions
    from models.user import db
    db.init_app(app)

    JWTManager(app)
    CORS(app, resources={r"/*": {"origins": "*"}})
    Migrate(app, db)

    # Import all models so SQLAlchemy knows about them
    from models.user import User          # noqa: F401
    from models.profile import Profile, Skill, Experience, Education  # noqa: F401

    # Register blueprints
    from api.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    # Optionally register other blueprints when implemented
    # from api.profile import profile_bp
    # app.register_blueprint(profile_bp, url_prefix='/profile')

    return app, db


app, db = create_app()


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")
    app.run(debug=True, port=5000)
