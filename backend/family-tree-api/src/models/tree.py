from src.models.user import db
from datetime import datetime
import json

class Tree(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # nullable для анонимных деревьев
    data = db.Column(db.Text, nullable=False, default='{}')  # JSON структура дерева
    background_image = db.Column(db.String(500), default='mountains')  # URL или название фона
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Tree {self.name}>'

    def get_data(self):
        """Получить данные дерева как Python объект"""
        try:
            return json.loads(self.data) if self.data else {}
        except json.JSONDecodeError:
            return {}

    def set_data(self, data_dict):
        """Установить данные дерева из Python объекта"""
        self.data = json.dumps(data_dict, ensure_ascii=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'data': self.get_data(),
            'background_image': self.background_image,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

