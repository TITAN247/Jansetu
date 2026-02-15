from flask import Blueprint, request, jsonify
from services.notification_service import notification_service

notification_bp = Blueprint('notification', __name__)

@notification_bp.route('/<user_id>', methods=['GET'])
def get_notifications(user_id):
    notifications = notification_service.get_user_notifications(user_id)
    return jsonify(notifications), 200

@notification_bp.route('/read/<id>', methods=['POST'])
def mark_read(id):
    notification_service.mark_as_read(id)
    return jsonify({'success': True}), 200
