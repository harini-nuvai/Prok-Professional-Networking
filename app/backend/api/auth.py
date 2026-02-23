import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User, db
from models.profile import Profile

auth_bp = Blueprint('auth', __name__)

EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')


def _validate_signup(data):
    errors = {}
    if not data.get('first_name', '').strip():
        errors['first_name'] = 'First name is required.'
    if not data.get('last_name', '').strip():
        errors['last_name'] = 'Last name is required.'
    username = data.get('username', '').strip()
    if not username:
        errors['username'] = 'Username is required.'
    elif len(username) < 3:
        errors['username'] = 'Username must be at least 3 characters.'
    email = data.get('email', '').strip()
    if not email:
        errors['email'] = 'Email is required.'
    elif not EMAIL_RE.match(email):
        errors['email'] = 'Invalid email address.'
    password = data.get('password', '')
    if not password:
        errors['password'] = 'Password is required.'
    elif len(password) < 6:
        errors['password'] = 'Password must be at least 6 characters.'
    return errors


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json(silent=True) or {}

    errors = _validate_signup(data)
    if errors:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 422

    email = data['email'].strip().lower()
    username = data['username'].strip()

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'An account with this email already exists.'}), 409

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username is already taken.'}), 409

    user = User(
        username=username,
        email=email,
        first_name=data['first_name'].strip(),
        last_name=data['last_name'].strip(),
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.flush()  # get user.id before commit

    # Create empty profile for the new user
    profile = Profile(user_id=user.id)
    db.session.add(profile)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Account created successfully.',
        'access_token': access_token,
        'user': user.to_dict(),
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'message': 'Email and password are required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid email or password.'}), 401

    if not user.is_active:
        return jsonify({'message': 'Account is deactivated.'}), 403

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Logged in successfully.',
        'access_token': access_token,
        'user': user.to_dict(),
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'message': 'User not found.'}), 404
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # JWT is stateless; client simply discards the token.
    return jsonify({'message': 'Logged out successfully.'}), 200
