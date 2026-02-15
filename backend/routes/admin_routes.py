from flask import Blueprint, jsonify
from database.mongo import get_db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
def get_dashboard_stats():
    db = get_db()
    
    total = db.complaints.count_documents({})
    resolved = db.complaints.count_documents({'status': 'Resolved'})
    pending = db.complaints.count_documents({'status': {'$in': ['Submitted', 'Assigned', 'In Progress']}})
    
    # Aggregation for categories
    category_stats = list(db.complaints.aggregate([
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]))
    
    return jsonify({
        'stats': {
            'total': total,
            'resolved': resolved,
            'pending': pending
        },
        'categories': category_stats
    }), 200

@admin_bp.route('/all', methods=['GET'])
def get_all_complaints():
    db = get_db()
    complaints = list(db.complaints.find({}).sort('created_at', -1))
    for c in complaints:
        c['_id'] = str(c['_id'])
    return jsonify(complaints), 200
