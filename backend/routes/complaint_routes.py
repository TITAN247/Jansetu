from flask import Blueprint, request, jsonify
from database.mongo import get_db
from services.complaint_service import complaint_service
from bson.objectid import ObjectId

complaint_bp = Blueprint('complaint', __name__)

@complaint_bp.route('/submit', methods=['POST'])
def submit_complaint():
    # 1. Validation
    if 'image' not in request.files:
        return jsonify({'error': 'No image part'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # 2. Get Data
    user_id = request.form.get('user_id') or 'Anonymous'
    text = request.form.get('description', '')
    lat = request.form.get('lat')
    lng = request.form.get('lng')

    try:
        # 3. Call Service
        result = complaint_service.process_submission(user_id, text, file, lat, lng)
        
        return jsonify({
            'message': 'Complaint submitted successfully',
            'complaint_id': result['complaint_id'],
            'ref_id': result['ref_id'],
            'ai_analysis': result['ai_analysis']
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

@complaint_bp.route('/<id>', methods=['GET'])
def get_complaint_details(id):
    db = get_db()
    try:
        complaint = db.complaints.find_one({'_id': ObjectId(id)})
        if complaint:
            complaint['_id'] = str(complaint['_id'])
            return jsonify(complaint), 200
        return jsonify({'error': 'Complaint not found'}), 404
    except:
        return jsonify({'error': 'Invalid ID'}), 400

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
