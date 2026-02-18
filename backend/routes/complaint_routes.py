from flask import Blueprint, request, jsonify
from database.mongo import get_db
from services.complaint_service import complaint_service
from bson.objectid import ObjectId
import jwt
from config import Config

complaint_bp = Blueprint('complaint', __name__)

def verify_user_role():
    """
    Verify that the authenticated user is a citizen.
    Returns (user_id, role) if valid citizen, None otherwise.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        # Guest submission allowed (Anonymous user)
        return ('Anonymous', None)
    
    try:
        token = auth_header.replace('Bearer ', '')
        decoded = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = decoded.get('user_id')
        role = decoded.get('role')
        
        # Only citizens can register complaints
        if role != 'citizen':
            return None
        
        return (user_id, role)
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception as e:
        print(f"[AUTH ERROR] Token verification failed: {e}")
        return None

@complaint_bp.route('/submit', methods=['POST'])
def submit_complaint():
    # 1. Validation
    if 'image' not in request.files:
        return jsonify({'error': 'No image part'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # 2. Verify user role - Only citizens can register complaints
    auth_result = verify_user_role()
    if auth_result is None:
        return jsonify({
            'error': 'Only citizens can register complaints. Please log in as a citizen to submit a complaint.',
            'message': 'Access denied: Non-citizen role detected'
        }), 403
    
    user_id_from_token, role = auth_result
    
    # 3. Get Data
    user_id_form = request.form.get('user_id') or 'Anonymous'
    text = request.form.get('description', '')
    lat = request.form.get('lat')
    lng = request.form.get('lng')
    email = request.form.get('email', '').strip() or None

    # Use authenticated user_id if available, otherwise use form value (for guest submissions)
    final_user_id = user_id_from_token if user_id_from_token != 'Anonymous' else user_id_form
    
    # Additional check: If user_id_form is provided and not Anonymous, verify it matches token
    if user_id_form != 'Anonymous' and user_id_from_token != 'Anonymous' and user_id_form != user_id_from_token:
        return jsonify({'error': 'User ID mismatch. Please log out and log in again.'}), 403

    try:
        # 4. Call Service
        result = complaint_service.process_submission(final_user_id, text, file, lat, lng, email=email)

        # ── Duplicate detected ────────────────────────────────────────────────
        if result.get('duplicate'):
            return jsonify({
                'duplicate':        True,
                'message':          result['message'],
                'existing_ref_id':  result['existing_ref_id'],
                'existing_status':  result['existing_status'],
                'is_resolved':      result.get('is_resolved', False),
            }), 409

        # ── Normal success ────────────────────────────────────────────────────
        return jsonify({
            'message':           'Complaint submitted successfully',
            'complaint_id':      result['complaint_id'],
            'ref_id':            result['ref_id'],
            'auto_assigned':     result.get('auto_assigned', False),
            'assigned_worker':   result.get('assigned_worker'),
            'capacity_override': result.get('capacity_override', False),
            'all_at_capacity':   result.get('all_at_capacity', False),
            'ai_analysis':       result['ai_analysis']
        }), 201
    except Exception as e:
        print(f"Error submitting complaint: {e}")
        return jsonify({'error': str(e)}), 500

@complaint_bp.route('/user/<uid>', methods=['GET'])
def get_user_complaints(uid):
    db = get_db()
    complaints = list(db.complaints.find({'user_id': uid}))
    for c in complaints:
        c['_id'] = str(c['_id'])
    return jsonify(complaints), 200

@complaint_bp.route('/by-email/<email>', methods=['GET'])
def get_complaints_by_email(email):
    """Get all complaints associated with an email address."""
    db = get_db()
    complaints = list(db.complaints.find({'email': email}))
    for c in complaints:
        c['_id'] = str(c['_id'])
    return jsonify(complaints), 200

@complaint_bp.route('/<id>', methods=['GET'])
def get_complaint_details(id):
    db = get_db()
    complaint = None
    
    # 1. Try by MongoDB ObjectId
    try:
        complaint = db.complaints.find_one({'_id': ObjectId(id)})
    except:
        pass  # Not a valid ObjectId, try ref_id next
    
    # 2. Fallback: Try by ref_id (e.g., JAN-ROAD-2026-X92A)
    if not complaint:
        complaint = db.complaints.find_one({'ref_id': id})
    
    if complaint:
        complaint['_id'] = str(complaint['_id'])
        return jsonify(complaint), 200
    
    return jsonify({'error': 'Complaint not found'}), 404

@complaint_bp.route('/reopen', methods=['POST'])
def reopen_complaint():
    """Citizen reopens/appeals a resolved complaint if unsatisfied."""
    db = get_db()
    data = request.json
    complaint_id = data.get('complaint_id')
    appeal_reason = data.get('reason', '')
    
    if not complaint_id:
        return jsonify({'error': 'complaint_id required'}), 400
    
    try:
        complaint = db.complaints.find_one({'_id': ObjectId(complaint_id)})
    except:
        return jsonify({'error': 'Invalid complaint ID'}), 400
    
    if not complaint:
        return jsonify({'error': 'Complaint not found'}), 404
    
    # Only allow reopening resolved/verified complaints
    if complaint.get('status') not in ['Resolved', 'Verified']:
        return jsonify({'error': 'Only resolved or verified complaints can be reopened'}), 400
    
    # Track reopen count to prevent abuse (max 3 reopens)
    reopen_count = complaint.get('reopen_count', 0)
    if reopen_count >= 3:
        return jsonify({'error': 'Maximum appeal limit reached (3). Please contact administration directly.'}), 400
    
    import datetime
    appeal_entry = {
        'reason': appeal_reason,
        'reopened_at': datetime.datetime.utcnow(),
        'previous_status': complaint.get('status')
    }
    
    db.complaints.update_one(
        {'_id': ObjectId(complaint_id)},
        {
            '$set': {
                'status': 'Reopened',
                'worker_id': None,
                'image_after': None,
                'verification_status': None,
                'last_updated': datetime.datetime.utcnow()
            },
            '$inc': {'reopen_count': 1},
            '$push': {'appeal_history': appeal_entry}
        }
    )
    
    # Notify via email
    if complaint.get('email'):
        try:
            from services.email_service import send_status_update
            send_status_update(complaint['email'], complaint.get('ref_id', ''), 'Reopened',
                f'Your complaint has been reopened for re-investigation. Reason: {appeal_reason}')
        except Exception as e:
            print(f"[REOPEN] Email error: {e}")
    
    # AUTO-ASSIGN to a new worker (capacity-aware)
    auto_assigned        = False
    assigned_worker_name = None
    capacity_override    = False
    all_at_capacity      = False
    try:
        from services.smart_assignment import smart_assign
        department    = complaint.get('department', '')
        assign_result = smart_assign(str(complaint['_id']), department, officer_id=None)
        if assign_result.get('success'):
            auto_assigned        = True
            assigned_worker_name = assign_result.get('worker_name')
            capacity_override    = assign_result.get('capacity_override', False)
            override_tag = ' [PRIORITY OVERRIDE]' if capacity_override else ''
            print(f"[REOPEN+AUTO-ASSIGN] {complaint.get('ref_id')} → {assigned_worker_name}{override_tag}")
        else:
            all_at_capacity = assign_result.get('all_at_capacity', False)
            print(f"[REOPEN] Auto-assign failed: {assign_result.get('error')}. Awaiting manual assignment.")
    except Exception as e:
        print(f"[REOPEN] Auto-assign error: {e}")

    return jsonify({
        'message':           'Complaint reopened successfully. It will be reassigned for re-investigation.',
        'status':            'Reopened' if not auto_assigned else 'Assigned',
        'reopen_count':      reopen_count + 1,
        'auto_assigned':     auto_assigned,
        'assigned_worker':   assigned_worker_name,
        'capacity_override': capacity_override,
        'all_at_capacity':   all_at_capacity,
    }), 200


@complaint_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    db = get_db()
    data = request.json
    complaint_id = data.get('complaint_id')
    rating = data.get('rating')
    comment = data.get('comment')
    
    if not complaint_id or not rating:
        return jsonify({'error': 'Missing fields'}), 400
        
    db.complaints.update_one(
        {'_id': ObjectId(complaint_id)},
        {'$set': {'feedback': {'rating': rating, 'comment': comment}}}
    )
    
    return jsonify({'message': 'Feedback submitted'}), 200
