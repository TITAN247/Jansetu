from flask import Blueprint, request, jsonify
from database.mongo import get_db
from bson.objectid import ObjectId
import os
import datetime
from werkzeug.utils import secure_filename
from config import Config
from services.verification_service import verification_service
from services.notification_service import notification_service

worker_bp = Blueprint('worker', __name__)

@worker_bp.route('/assigned', methods=['GET'])
def get_assigned_complaints():
    db = get_db()
    department = request.args.get('department')
    
    if not department:
        return jsonify({'error': 'Department parameter required'}), 400
        
    # Handle Legacy Data Mappings (Road vs Road Department)
    search_depts = [department]
    if department == 'Road': search_depts.append('Road Department')
    if department == 'Water': search_depts.append('Water Department')
    if department == 'Electricity': search_depts.append('Electricity Department')
    if department == 'Sanitation': search_depts.append('Sanitation Department')
    
    print(f"[WORKER DASHBOARD] Searching for Departments: {search_depts}")

    query = {
        'department': {'$in': search_depts},
        # Include 'Pending' status which is the initial status from schemas.py
        'status': {'$in': ['Pending', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Verified']}
    }
    
    complaints = list(db.complaints.find(query).sort('created_at', -1))
    
    print(f"[WORKER DASHBOARD] Found {len(complaints)} complaints")
    
    for c in complaints:
        c['_id'] = str(c['_id'])
        
    return jsonify(complaints), 200

@worker_bp.route('/upload-work', methods=['POST'])
def upload_work():
    try:
        db = get_db()
        
        # 1. Validation
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
            
        file = request.files['image']
        complaint_id = request.form.get('complaint_id')
        worker_remark = request.form.get('remark', '') 
        
        if not complaint_id:
            return jsonify({'error': 'Missing complaint ID'}), 400

        # 2. Get Complaint
        try:
           complaint = db.complaints.find_one({'_id': ObjectId(complaint_id)})
        except:
           return jsonify({'error': 'Invalid Complaint ID format'}), 400

        if not complaint:
            return jsonify({'error': 'Complaint not found'}), 404
            
        # 3. Save After Image
        timestamp = int(datetime.datetime.now().timestamp())
        filename = secure_filename(f"resolved_{complaint_id}_{timestamp}.jpg")
        file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # 4. Get Before Image Path
        before_image_name = complaint.get('image_before', '')
        before_path = os.path.join(Config.UPLOAD_FOLDER, before_image_name)
        
        if not os.path.exists(before_path):
             print(f"[WARNING] Before image not found: {before_path}")
             # Proceed? Or fail? Verification will handle it (returns Not Verified)
        
        # 5. AI Verification
        print(f"[DEBUG] Verifying {before_path} vs {file_path}")
        verification_result = verification_service.verify(before_path, file_path)
        print(f"[DEBUG] Result: {verification_result}")

        # 6. Update DB
        all_remarks = complaint.get('remarks', '')
        if worker_remark:
             all_remarks += f"\n[Worker]: {worker_remark}"
        
        # Determine Status
        # If Verification Passed -> 'Verified' (Closed)
        # If Verification Failed -> 'In Progress' (Rejected, requires re-upload)
        
        is_verified = (verification_result['status'] == 'Verified')
        # User Request: "verified by ai first then resolved in evry where"
        # Changing status to 'Resolved' so it shows as fully completed in UI.
        new_status = 'Resolved' if is_verified else 'In Progress'
        
        # Capture verification failure reason for the worker
        rejection_note = ""
        if not is_verified:
            rejection_note = f"\n[System]: Auto-Rejected by AI. Reason: {verification_result.get('reason', 'Verification Failed')}"
            all_remarks += rejection_note

        update_data = {
            'image_after': filename,
            'status': new_status,
            'verification_status': verification_result['status'],
            'verification_reason': verification_result.get('reason', 'N/A'),
            'verification_confidence': verification_result.get('confidence', 0.0),
            'remarks': all_remarks,
            'ai_analysis_before': verification_result.get('before_analysis', {}),
            'ai_analysis_after': verification_result.get('after_analysis', {}),
            'updated_at': datetime.datetime.now()
        }
        
        if is_verified:
            update_data['resolved_at'] = datetime.datetime.now()

        db.complaints.update_one(
            {'_id': ObjectId(complaint_id)},
            {'$set': update_data}
        )
        
        # 7. Notify
        user_id = complaint.get('user_id')
        ref_id = str(complaint.get('_id'))
        
        if is_verified:
            msg = f"Complaint {ref_id} Verified & Closed by AI."
            # Notify Citizen
            try:
                notification_service.notify_complaint_activity(user_id, ref_id, msg, "resolution")
            except Exception as ne:
                print(f"Notification Error: {ne}")
        else:
            # Notify Worker (Logic to notify worker would go here, but Alert serves as immediate feedback)
            print(f"[AUTO-REJECT] Worker update rejected for {ref_id}")

        return jsonify({
            'message': 'Work processed',
            'status': new_status,
            'verification': verification_result
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f"Server Error: {str(e)}"}), 500
