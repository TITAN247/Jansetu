from flask import Blueprint, jsonify
from database.mongo import get_db
import datetime

governance_bp = Blueprint('governance', __name__)

@governance_bp.route('/analytics', methods=['GET'])
def get_governance_analytics():
    db = get_db()
    
    # 1. High-Level KPIs
    total_complaints = db.complaints.count_documents({})
    resolved_count = db.complaints.count_documents({'status': {'$in': ['Resolved', 'Verified']}})
    verified_count = db.complaints.count_documents({'status': 'Verified'})
    
    resolution_rate = (resolved_count / total_complaints * 100) if total_complaints > 0 else 0
    verification_rate = (verified_count / resolved_count * 100) if resolved_count > 0 else 0

    # Mock Citizen Satisfaction (Average Feedback Rating)
    # In a real app, aggregation on feedback.rating would be used
    pipeline = [
        {"$match": {"feedback": {"$exists": True}}},
        {"$group": {"_id": None, "avgRating": {"$avg": "$feedback.rating"}}}
    ]
    avg_rating_result = list(db.complaints.aggregate(pipeline))
    avg_rating = avg_rating_result[0]['avgRating'] if avg_rating_result else 0.0

    return jsonify({
        'kpis': {
            'total_complaints': total_complaints,
            'resolution_rate': round(resolution_rate, 1),
            'verification_rate': round(verification_rate, 1),
            'citizen_satisfaction': round(avg_rating, 1),
            'avg_resolution_time_hours': 48 # Mock value for demo
        }
    }), 200

@governance_bp.route('/department-performance', methods=['GET'])
def get_department_performance():
    db = get_db()
    
    # Aggregate stats per department
    pipeline = [
        {"$group": {
            "_id": "$department",
            "total": {"$sum": 1},
            "resolved": {
                "$sum": {
                    "$cond": [{"$in": ["$status", ["Resolved", "Verified"]]}, 1, 0]
                }
            },
            "verified": {
                "$sum": {
                    "$cond": [{"$eq": ["$status", "Verified"]}, 1, 0]
                }
            }
        }}
    ]
    
    dept_stats = list(db.complaints.aggregate(pipeline))
    
    # Transform for frontend
    formatted_stats = []
    for dept in dept_stats:
        if dept['_id']: # Skip unassigned if any
            formatted_stats.append({
                'name': dept['_id'],
                'total': dept['total'],
                'resolved': dept['resolved'],
                'resolution_rate': round((dept['resolved'] / dept['total'] * 100), 1) if dept['total'] > 0 else 0,
                'verification_score': round((dept['verified'] / dept['resolved'] * 100), 1) if dept['resolved'] > 0 else 0
            })
            
    return jsonify(formatted_stats), 200

@governance_bp.route('/trends', methods=['GET'])
def get_complaint_trends():
    db = get_db()
    
    # Mock Time Series Data (Past 6 Months) for Area Chart
    # In real app, aggregate by created_at date
    current_month = datetime.datetime.now().month
    trends = []
    
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    # Generating some dummy trend data ending at current month
    for i in range(5, -1, -1):
        month_idx = (current_month - i - 1) % 12
        month_name = months[month_idx]
        trends.append({
            'month': month_name,
            'complaints': 50 + (i * 10) + (month_idx * 5) # Dummy logic
        })
        
    return jsonify(trends), 200

@governance_bp.route('/ai-metrics', methods=['GET'])
def get_ai_metrics():
    # Mock AI Performance Metrics
    return jsonify({
        'category_accuracy': 92.5,
        'priority_precision': 88.3,
        'vision_detection_rate': 95.1,
        'mismatches_flagged': 12
    }), 200
