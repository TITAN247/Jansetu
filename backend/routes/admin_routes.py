from flask import Blueprint, request, jsonify
from database.mongo import get_db
from bson.objectid import ObjectId
import datetime

admin_bp = Blueprint('admin', __name__)

# ============ PRE-GENERATED ADMIN ACCESS CODES ============
# These codes are required during admin/governance registration.
# Only developers can generate new codes.
VALID_ADMIN_CODES = {
    'JANSETU-ADM-2026-ALPHA': 'admin',
    'JANSETU-ADM-2026-BETA': 'admin',
    '@': 'admin',
    'JANSETU-GOV-2026-ALPHA': 'governance',
    'JANSETU-GOV-2026-BETA': 'governance',
}


@admin_bp.route('/verify-access-code', methods=['POST'])
def verify_access_code():
    """Verify if an admin/governance access code is valid."""
    data = request.json
    code = data.get('access_code', '').strip().upper()
    
    if code in VALID_ADMIN_CODES:
        return jsonify({
            'valid': True,
            'role': VALID_ADMIN_CODES[code],
            'message': 'Access code verified successfully.'
        }), 200
    
    return jsonify({
        'valid': False,
        'message': 'Invalid access code. Contact your system administrator.'
    }), 401


# ============ UP DISTRICTS DATA ============
UP_DISTRICTS = {
    "Agra": {"lat": 27.1767, "lng": 78.0081, "zoom": 12},
    "Aligarh": {"lat": 27.8974, "lng": 78.0880, "zoom": 12},
    "Allahabad (Prayagraj)": {"lat": 25.4358, "lng": 81.8463, "zoom": 12},
    "Ambedkar Nagar": {"lat": 26.4499, "lng": 82.5928, "zoom": 12},
    "Amethi": {"lat": 26.1544, "lng": 81.8137, "zoom": 12},
    "Amroha": {"lat": 28.9044, "lng": 78.4678, "zoom": 12},
    "Auraiya": {"lat": 26.4653, "lng": 79.5090, "zoom": 12},
    "Azamgarh": {"lat": 26.0673, "lng": 83.1850, "zoom": 12},
    "Baghpat": {"lat": 28.9449, "lng": 77.2185, "zoom": 12},
    "Bahraich": {"lat": 27.5745, "lng": 81.5959, "zoom": 12},
    "Ballia": {"lat": 25.7593, "lng": 84.1414, "zoom": 12},
    "Balrampur": {"lat": 27.4336, "lng": 82.1805, "zoom": 12},
    "Banda": {"lat": 25.4796, "lng": 80.3382, "zoom": 12},
    "Barabanki": {"lat": 26.9285, "lng": 81.1864, "zoom": 12},
    "Bareilly": {"lat": 28.3670, "lng": 79.4304, "zoom": 12},
    "Basti": {"lat": 26.8017, "lng": 82.7627, "zoom": 12},
    "Bhadohi": {"lat": 25.3951, "lng": 82.5698, "zoom": 12},
    "Bijnor": {"lat": 29.3724, "lng": 78.1360, "zoom": 12},
    "Budaun": {"lat": 28.0416, "lng": 79.1250, "zoom": 12},
    "Bulandshahr": {"lat": 28.4070, "lng": 77.8498, "zoom": 12},
    "Chandauli": {"lat": 25.2583, "lng": 83.2641, "zoom": 12},
    "Chitrakoot": {"lat": 25.2020, "lng": 80.8525, "zoom": 12},
    "Deoria": {"lat": 26.5024, "lng": 83.7791, "zoom": 12},
    "Etah": {"lat": 27.5585, "lng": 78.6689, "zoom": 12},
    "Etawah": {"lat": 26.7854, "lng": 79.0206, "zoom": 12},
    "Farrukhabad": {"lat": 27.3906, "lng": 79.5819, "zoom": 12},
    "Fatehpur": {"lat": 25.9304, "lng": 80.8139, "zoom": 12},
    "Firozabad": {"lat": 27.1505, "lng": 78.3957, "zoom": 12},
    "Gautam Buddh Nagar": {"lat": 28.5706, "lng": 77.3260, "zoom": 12},
    "Ghaziabad": {"lat": 28.6692, "lng": 77.4538, "zoom": 12},
    "Ghazipur": {"lat": 25.5878, "lng": 83.5762, "zoom": 12},
    "Gonda": {"lat": 27.1340, "lng": 81.9619, "zoom": 12},
    "Gorakhpur": {"lat": 26.7606, "lng": 83.3732, "zoom": 12},
    "Hamirpur": {"lat": 25.9487, "lng": 80.1502, "zoom": 12},
    "Hapur": {"lat": 28.7309, "lng": 77.7759, "zoom": 12},
    "Hardoi": {"lat": 27.3958, "lng": 80.1314, "zoom": 12},
    "Hathras": {"lat": 27.5963, "lng": 78.0537, "zoom": 12},
    "Jalaun": {"lat": 26.1416, "lng": 79.3359, "zoom": 12},
    "Jaunpur": {"lat": 25.7464, "lng": 82.6837, "zoom": 12},
    "Jhansi": {"lat": 25.4484, "lng": 78.5685, "zoom": 12},
    "Kannauj": {"lat": 27.0508, "lng": 79.9122, "zoom": 12},
    "Kanpur Dehat": {"lat": 26.4051, "lng": 79.9534, "zoom": 12},
    "Kanpur Nagar": {"lat": 26.4499, "lng": 80.3319, "zoom": 12},
    "Kasganj": {"lat": 27.8073, "lng": 78.6468, "zoom": 12},
    "Kaushambi": {"lat": 25.5325, "lng": 81.3751, "zoom": 12},
    "Kushinagar": {"lat": 26.7412, "lng": 83.8891, "zoom": 12},
    "Lakhimpur Kheri": {"lat": 27.9467, "lng": 80.7821, "zoom": 12},
    "Lalitpur": {"lat": 24.6877, "lng": 78.4170, "zoom": 12},
    "Lucknow": {"lat": 26.8467, "lng": 80.9462, "zoom": 12},
    "Maharajganj": {"lat": 27.1238, "lng": 83.5610, "zoom": 12},
    "Mahoba": {"lat": 25.2923, "lng": 79.8718, "zoom": 12},
    "Mainpuri": {"lat": 27.2167, "lng": 79.0250, "zoom": 12},
    "Mathura": {"lat": 27.4924, "lng": 77.6737, "zoom": 12},
    "Mau": {"lat": 25.9417, "lng": 83.5611, "zoom": 12},
    "Meerut": {"lat": 28.9845, "lng": 77.7064, "zoom": 12},
    "Mirzapur": {"lat": 25.1334, "lng": 82.5649, "zoom": 12},
    "Moradabad": {"lat": 28.8389, "lng": 78.7768, "zoom": 12},
    "Muzaffarnagar": {"lat": 29.4727, "lng": 77.7085, "zoom": 12},
    "Pilibhit": {"lat": 28.6316, "lng": 79.8040, "zoom": 12},
    "Pratapgarh": {"lat": 25.8971, "lng": 81.9458, "zoom": 12},
    "Raebareli": {"lat": 26.2345, "lng": 81.2310, "zoom": 12},
    "Rampur": {"lat": 28.7960, "lng": 79.0280, "zoom": 12},
    "Saharanpur": {"lat": 29.9680, "lng": 77.5510, "zoom": 12},
    "Sambhal": {"lat": 28.5872, "lng": 78.5592, "zoom": 12},
    "Sant Kabir Nagar": {"lat": 26.7905, "lng": 83.0371, "zoom": 12},
    "Shahjahanpur": {"lat": 27.8808, "lng": 79.9147, "zoom": 12},
    "Shamli": {"lat": 29.4494, "lng": 77.3078, "zoom": 12},
    "Shravasti": {"lat": 27.5066, "lng": 82.0535, "zoom": 12},
    "Siddharthnagar": {"lat": 27.2984, "lng": 83.0930, "zoom": 12},
    "Sitapur": {"lat": 27.5619, "lng": 80.6829, "zoom": 12},
    "Sonbhadra": {"lat": 24.6892, "lng": 83.0562, "zoom": 12},
    "Sultanpur": {"lat": 26.2648, "lng": 82.0727, "zoom": 12},
    "Unnao": {"lat": 26.5471, "lng": 80.4880, "zoom": 12},
    "Varanasi": {"lat": 25.3176, "lng": 82.9739, "zoom": 12},
}


@admin_bp.route('/up-districts', methods=['GET'])
def get_up_districts():
    """Get list of all UP districts with their coordinates."""
    districts = [{"name": k, **v} for k, v in UP_DISTRICTS.items()]
    return jsonify(districts), 200


@admin_bp.route('/dashboard', methods=['GET'])
def get_dashboard_stats():
    db = get_db()
    
    total = db.complaints.count_documents({})
    resolved = db.complaints.count_documents({'status': 'Resolved'})
    pending = db.complaints.count_documents({'status': 'Pending'})
    assigned = db.complaints.count_documents({'status': 'Assigned'})
    in_progress = db.complaints.count_documents({'status': 'In Progress'})
    escalated = db.complaints.count_documents({'escalation_level': {'$gte': 1}})
    reopened = db.complaints.count_documents({'status': 'Reopened'})
    
    # Aggregation for categories
    category_stats = list(db.complaints.aggregate([
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]))
    
    # Department performance
    dept_stats = list(db.complaints.aggregate([
        {"$group": {
            "_id": "$department",
            "total": {"$sum": 1},
            "resolved": {"$sum": {"$cond": [{"$eq": ["$status", "Resolved"]}, 1, 0]}},
            "pending": {"$sum": {"$cond": [{"$in": ["$status", ["Pending", "Assigned", "In Progress"]]}, 1, 0]}}
        }}
    ]))
    
    return jsonify({
        'stats': {
            'total': total,
            'resolved': resolved,
            'pending': pending,
            'assigned': assigned,
            'in_progress': in_progress,
            'escalated': escalated,
            'reopened': reopened
        },
        'categories': category_stats,
        'dept_stats': dept_stats
    }), 200

@admin_bp.route('/all', methods=['GET'])
def get_all_complaints():
    db = get_db()
    
    # Support date-based and ref_id-based filtering
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    ref_id = request.args.get('ref_id')
    status_filter = request.args.get('status')
    
    query = {}
    
    # Date range filter
    if date_from or date_to:
        date_query = {}
        if date_from:
            try:
                date_query['$gte'] = datetime.datetime.fromisoformat(date_from)
            except:
                pass
        if date_to:
            try:
                # Add 1 day to include the end date fully
                end_date = datetime.datetime.fromisoformat(date_to) + datetime.timedelta(days=1)
                date_query['$lte'] = end_date
            except:
                pass
        if date_query:
            query['created_at'] = date_query
    
    # Ref ID filter (partial match)
    if ref_id:
        query['ref_id'] = {'$regex': ref_id, '$options': 'i'}
    
    # Status filter
    if status_filter and status_filter != 'All':
        query['status'] = status_filter
    
    complaints = list(db.complaints.find(query).sort('created_at', -1))
    for c in complaints:
        c['_id'] = str(c['_id'])
        # Attach worker name
        if c.get('worker_id'):
            try:
                worker = db.workers.find_one({'_id': ObjectId(c['worker_id'])})
                c['worker_name'] = worker['name'] if worker else 'Unknown'
            except:
                c['worker_name'] = 'Unknown'
        # Attach officer name
        if c.get('assigned_by'):
            try:
                officer = db.dept_officers.find_one({'_id': ObjectId(c['assigned_by'])})
                c['officer_name'] = officer['name'] if officer else 'Unknown'
            except:
                c['officer_name'] = 'Unknown'
    return jsonify(complaints), 200

@admin_bp.route('/escalated', methods=['GET'])
def get_escalated():
    """Get complaints that are escalated or overdue."""
    db = get_db()
    
    # Escalated complaints (escalation_level >= 1)
    escalated = list(db.complaints.find({
        '$or': [
            {'escalation_level': {'$gte': 1}},
            {'status': {'$in': ['Pending', 'Assigned']}}  # Potentially stale
        ]
    }).sort('created_at', 1))  # Oldest first
    
    for c in escalated:
        c['_id'] = str(c['_id'])
        if c.get('worker_id'):
            try:
                worker = db.workers.find_one({'_id': ObjectId(c['worker_id'])})
                c['worker_name'] = worker['name'] if worker else 'Unknown'
            except:
                c['worker_name'] = 'Unknown'
    
    return jsonify(escalated), 200

@admin_bp.route('/dept-officers', methods=['GET'])
def get_dept_officers():
    """Get all department officers."""
    db = get_db()
    officers = list(db.dept_officers.find({}))
    for o in officers:
        o['_id'] = str(o['_id'])
        # Count complaints in their department
        dept = o.get('department_id', '')
        o['dept_complaints'] = db.complaints.count_documents({'department': dept})
    return jsonify(officers), 200

@admin_bp.route('/override-status', methods=['POST'])
def override_status():
    """District Admin overrides complaint status (intervention power)."""
    db = get_db()
    data = request.json
    
    complaint_id = data.get('complaint_id')
    new_status = data.get('status')
    admin_note = data.get('note', '')
    
    if not complaint_id or not new_status:
        return jsonify({'error': 'complaint_id and status required'}), 400
    
    valid_statuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Escalated', 'Reopened']
    if new_status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400

    try:
        result = db.complaints.update_one(
            {'_id': ObjectId(complaint_id)},
            {'$set': {
                'status': new_status,
                'admin_notes': admin_note,
                'last_updated': datetime.datetime.utcnow()
            }}
        )
        if result.modified_count == 0:
            return jsonify({'error': 'Complaint not found'}), 404
    except:
        return jsonify({'error': 'Invalid complaint ID'}), 400

    # Email notification
    complaint = db.complaints.find_one({'_id': ObjectId(complaint_id)})
    if complaint and complaint.get('email'):
        try:
            from services.email_service import send_status_update
            send_status_update(complaint['email'], complaint.get('ref_id', ''), new_status,
                f'District Administration has updated your complaint status. {admin_note}')
        except Exception as e:
            print(f"[ADMIN OVERRIDE] Email error: {e}")

    return jsonify({'message': f'Status overridden to {new_status}'}), 200

@admin_bp.route('/reassign', methods=['POST'])
def admin_reassign():
    """District Admin reassigns complaint to different department or worker."""
    db = get_db()
    data = request.json
    
    complaint_id = data.get('complaint_id')
    new_department = data.get('department')
    new_worker_id = data.get('worker_id')
    admin_note = data.get('note', '')
    
    if not complaint_id:
        return jsonify({'error': 'complaint_id required'}), 400

    update = {
        'last_updated': datetime.datetime.utcnow(),
        'admin_notes': admin_note
    }
    
    if new_department:
        update['department'] = new_department
        update['worker_id'] = None  # Clear worker when changing department
        update['status'] = 'Pending'  # Reset to pending for new department officer
        update['escalation_level'] = 0
    
    if new_worker_id:
        update['worker_id'] = new_worker_id
        update['status'] = 'Assigned'
        update['timeline.assigned'] = datetime.datetime.utcnow()

    try:
        result = db.complaints.update_one(
            {'_id': ObjectId(complaint_id)},
            {'$set': update}
        )
        if result.modified_count == 0:
            return jsonify({'error': 'Complaint not found'}), 404
    except:
        return jsonify({'error': 'Invalid complaint ID'}), 400

    return jsonify({'message': 'Complaint reassigned by District Administration'}), 200
