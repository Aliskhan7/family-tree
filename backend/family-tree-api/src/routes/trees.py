from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from src.models.user import db, User
from src.models.tree import Tree

trees_bp = Blueprint('trees', __name__)

@trees_bp.route('/trees', methods=['GET'])
@jwt_required()
def get_user_trees():
    """Получить все деревья пользователя"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        trees = Tree.query.filter_by(user_id=current_user_id).order_by(Tree.updated_at.desc()).all()
        
        return jsonify({
            'trees': [tree.to_dict() for tree in trees]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@trees_bp.route('/trees', methods=['POST'])
def create_tree():
    """Создать новое дерево (может быть анонимным)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Данные не предоставлены'}), 400
        
        name = data.get('name', '').strip()
        tree_data = data.get('data', {})
        background_image = data.get('background_image', 'mountains')
        
        if not name:
            return jsonify({'error': 'Название дерева обязательно'}), 400
        
        # Проверяем, авторизован ли пользователь
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            pass  # Пользователь не авторизован, создаем анонимное дерево
        
        # Создание дерева
        tree = Tree(
            name=name,
            user_id=user_id,
            background_image=background_image
        )
        tree.set_data(tree_data)
        
        db.session.add(tree)
        db.session.commit()
        
        return jsonify({
            'message': 'Дерево успешно создано',
            'tree': tree.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@trees_bp.route('/trees/<int:tree_id>', methods=['GET'])
def get_tree(tree_id):
    """Получить дерево по ID"""
    try:
        tree = Tree.query.get(tree_id)
        
        if not tree:
            return jsonify({'error': 'Дерево не найдено'}), 404
        
        # Проверяем права доступа
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            pass
        
        # Если дерево принадлежит пользователю, проверяем авторизацию
        if tree.user_id and tree.user_id != user_id:
            return jsonify({'error': 'Нет доступа к этому дереву'}), 403
        
        return jsonify({
            'tree': tree.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@trees_bp.route('/trees/<int:tree_id>', methods=['PUT'])
def update_tree(tree_id):
    """Обновить дерево"""
    try:
        tree = Tree.query.get(tree_id)
        
        if not tree:
            return jsonify({'error': 'Дерево не найдено'}), 404
        
        # Проверяем права доступа
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            pass
        
        # Если дерево принадлежит пользователю, проверяем авторизацию
        if tree.user_id and tree.user_id != user_id:
            return jsonify({'error': 'Нет доступа к этому дереву'}), 403
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Данные не предоставлены'}), 400
        
        # Обновляем поля
        if 'name' in data:
            name = data['name'].strip()
            if not name:
                return jsonify({'error': 'Название дерева не может быть пустым'}), 400
            tree.name = name
        
        if 'data' in data:
            tree.set_data(data['data'])
        
        if 'background_image' in data:
            tree.background_image = data['background_image']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Дерево успешно обновлено',
            'tree': tree.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@trees_bp.route('/trees/<int:tree_id>', methods=['DELETE'])
@jwt_required()
def delete_tree(tree_id):
    """Удалить дерево"""
    try:
        current_user_id = get_jwt_identity()
        tree = Tree.query.get(tree_id)
        
        if not tree:
            return jsonify({'error': 'Дерево не найдено'}), 404
        
        # Проверяем права доступа
        if tree.user_id != current_user_id:
            return jsonify({'error': 'Нет доступа к этому дереву'}), 403
        
        db.session.delete(tree)
        db.session.commit()
        
        return jsonify({
            'message': 'Дерево успешно удалено'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@trees_bp.route('/trees/anonymous', methods=['POST'])
def create_anonymous_tree():
    """Создать анонимное дерево (альтернативный endpoint)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Данные не предоставлены'}), 400
        
        name = data.get('name', '').strip()
        tree_data = data.get('data', {})
        background_image = data.get('background_image', 'mountains')
        
        if not name:
            return jsonify({'error': 'Название дерева обязательно'}), 400
        
        # Создание анонимного дерева
        tree = Tree(
            name=name,
            user_id=None,  # Анонимное дерево
            background_image=background_image
        )
        tree.set_data(tree_data)
        
        db.session.add(tree)
        db.session.commit()
        
        return jsonify({
            'message': 'Анонимное дерево успешно создано',
            'tree': tree.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

