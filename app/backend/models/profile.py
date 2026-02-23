from .user import db
from datetime import datetime


class Profile(db.Model):
    __tablename__ = 'profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    bio = db.Column(db.Text, nullable=True)
    headline = db.Column(db.String(200), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    profile_picture = db.Column(db.String(300), nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    skills = db.relationship('Skill', backref='profile', cascade='all, delete-orphan')
    experiences = db.relationship('Experience', backref='profile', cascade='all, delete-orphan')
    educations = db.relationship('Education', backref='profile', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bio': self.bio,
            'headline': self.headline,
            'location': self.location,
            'profile_picture': self.profile_picture,
            'skills': [s.to_dict() for s in self.skills],
            'experiences': [e.to_dict() for e in self.experiences],
            'educations': [e.to_dict() for e in self.educations],
        }


class Skill(db.Model):
    __tablename__ = 'skills'

    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {'id': self.id, 'name': self.name}


class Experience(db.Model):
    __tablename__ = 'experiences'

    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    company = db.Column(db.String(150), nullable=False)
    start_date = db.Column(db.String(20), nullable=True)
    end_date = db.Column(db.String(20), nullable=True)
    description = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'description': self.description,
        }


class Education(db.Model):
    __tablename__ = 'educations'

    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    school = db.Column(db.String(150), nullable=False)
    degree = db.Column(db.String(150), nullable=True)
    field = db.Column(db.String(150), nullable=True)
    start_year = db.Column(db.Integer, nullable=True)
    end_year = db.Column(db.Integer, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'school': self.school,
            'degree': self.degree,
            'field': self.field,
            'start_year': self.start_year,
            'end_year': self.end_year,
        }
