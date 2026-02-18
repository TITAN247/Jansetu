from flask import Blueprint, request, jsonify
from database.mongo import get_db
from bson.objectid import ObjectId
import datetime

dept_officer_bp = Blueprint('dept_officer', __name__)

@dept_officer_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    """Department Officer dashboard stats for their department."""
    db = get_db()
    department = request.args.get('department')
    
    if not department:
        return jsonify({'error': 'Department parameter required'}), 400

    # Handle legacy name variants
    search_depts = [department]
    dept_variants = {
        'Road': ['Road Department'], 'Water': ['Water Department'],
        'Electricity': ['Electricity Department'], 'Sanitation': ['Sanitation Department']
    }
    search_depts.extend(dept_variants.get(department, []))

    query = {'department': {'$in': search_depts}}
    
    total = db.complaints.count_documents(query)
    unassigned = db.complaints.count_documents({**query, 'status': 'Pending', 'worker_id': None})
    assigned = db.complaints.count_documents({**query, 'status': 'Assigned'})
    in_progress = db.complaints.count_documents({**query, 'status': 'In Progress'})
    resolved = db.complaints.count_documents({**query, 'status': 'Resolved'})
    
    return jsonify({
        'stats': {
            'total': total,
            'unassigned': unassigned,
            'assigned': assigned,
            'in_progress': in_progress,
            'resolved': resolved
        }
    }), 200


@dept_officer_bp.route('/complaints', methods=['GET'])
def get_dept_complaints():
    """Get all complaints in this department."""
    db = get_db()
    department = request.args.get('department')
    
    if not department:
        return jsonify({'error': 'Department parameter required'}), 400

    search_depts = [department]
    dept_variants = {
        'Road': ['Road Department'], 'Water': ['Water Department'],
        'Electricity': ['Electricity Department'], 'Sanitation': ['Sanitation Department']
    }
    search_depts.extend(dept_variants.get(department, []))
    
    complaints = list(db.complaints.find(
        {'department': {'$in': search_depts}}
    ).sort('created_at', -1))
    
    for c in complaints:
        c['_id'] = str(c['_id'])
        # Attach worker name if assigned
        if c.get('worker_id'):
            try:
                worker = db.workers.find_one({'_id': ObjectId(c['worker_id'])})
                c['worker_name'] = worker['name'] if worker else 'Unknown'
            except:
                c['worker_name'] = 'Unknown'
    
    return jsonify(complaints), 200


@dept_officer_bp.route('/workers', methods=['GET'])
def get_dept_workers():
    """Get all workers in this department with their current task load."""
    db = get_db()
    department = request.args.get('department')
    
    if not department:
        return jsonify({'error': 'Department parameter required'}), 400

    search_depts = [department]
    dept_variants = {
        'Road': ['Road Department'], 'Water': ['Water Department'],
        'Electricity': ['Electricity Department'], 'Sanitation': ['Sanitation Department']
    }
    search_depts.extend(dept_variants.get(department, []))

    workers = list(db.workers.find({'department_id': {'$in': search_depts}}))
    
    result = []
    for w in workers:
        w_id = str(w['_id'])
        # Count active tasks for this worker
        active_tasks = db.complaints.count_documents({
            'worker_id': w_id,
            'status': {'$in': ['Assigned', 'In Progress']}
        })
        resolved_tasks = db.complaints.count_documents({
            'worker_id': w_id,
            'status': 'Resolved'
        })
        result.append({
            '_id': w_id,
            'name': w.get('name', 'Worker'),
            'email': w.get('email', ''),
            'department': w.get('department_id', department),
            'active_tasks': active_tasks,
            'resolved_tasks': resolved_tasks
        })
    
    return jsonify(result), 200


@dept_officer_bp.route('/assign', methods=['POST'])
def assign_complaint():
    """Assign a complaint to a specific worker."""
    db = get_db()
    data = request.json
    
    complaint_id = data.get('complaint_id')
    worker_id = data.get('worker_id')
    officer_id = data.get('officer_id')
    deadline = data.get('deadline')  # Optional ISO string
    
    if not complaint_id or not worker_id:
        return jsonify({'error': 'complaint_id and worker_id are required'}), 400

    try:
        complaint = db.complaints.find_one({'_id': ObjectId(complaint_id)})
    except:
        return jsonify({'error': 'Invalid complaint ID'}), 400
    
    if not complaint:
        return jsonify({'error': 'Complaint not found'}), 404

    # Verify worker exists
    try:
        worker = db.workers.find_one({'_id': ObjectId(worker_id)})
    except:
        return jsonify({'error': 'Invalid worker ID'}), 400
    
    if not worker:
        return jsonify({'error': 'Worker not found'}), 404

    # Update complaint
    update = {
        'worker_id': worker_id,
        'assigned_by': officer_id,
        'status': 'Assigned',
        'timeline.assigned': datetime.datetime.utcnow(),
        'last_updated': datetime.datetime.utcnow()
    }
    if deadline:
        update['deadline'] = deadline

    db.complaints.update_one(
        {'_id': ObjectId(complaint_id)},
        {'$set': update}
    )

    # Notify worker (in-app)
    try:
        from services.notification_service import notification_service
        ref_id = complaint.get('ref_id', complaint_id)
        notification_service.notify(
            user_id=worker_id,
            message=f"New task assigned: {ref_id} ({complaint.get('category', 'General')})",
            type="assignment"
        )
    except Exception as e:
        print(f"[ASSIGN] Notification error: {e}")

    # Email the WORKER about their new assignment
    worker_email = worker.get('email')
    if worker_email:
        try:
            from services.email_service import send_worker_assignment_email
            send_worker_assignment_email(
                to_email=worker_email,
                worker_name=worker.get('name', 'Worker'),
                ref_id=complaint.get('ref_id', complaint_id),
                category=complaint.get('category', 'General'),
                priority=complaint.get('priority', 'Medium'),
                complaint_text=complaint.get('complaint_text', complaint.get('text', ''))
            )
        except Exception as e:
            print(f"[ASSIGN] Worker email error: {e}")

    # Email notification to citizen
    if complaint.get('email'):
        try:
            from services.email_service import send_status_update
            send_status_update(complaint['email'], complaint.get('ref_id', ''), 'Assigned',
                f'Your complaint has been assigned to {worker.get("name", "a field worker")} in the {complaint.get("department", "")} department.')
        except Exception as e:
            print(f"[ASSIGN] Email error: {e}")

    return jsonify({
        'message': f'Complaint assigned to {worker.get("name", "worker")}',
        'status': 'Assigned'
    }), 200


@dept_officer_bp.route('/reassign', methods=['POST'])
def reassign_complaint():
    """Reassign a complaint to a different worker."""
    db = get_db()
    data = request.json
    
    complaint_id = data.get('complaint_id')
    new_worker_id = data.get('worker_id')
    officer_id = data.get('officer_id')
    
    if not complaint_id or not new_worker_id:
        return jsonify({'error': 'complaint_id and worker_id required'}), 400

    try:
        complaint = db.complaints.find_one({'_id': ObjectId(complaint_id)})
        new_worker = db.workers.find_one({'_id': ObjectId(new_worker_id)})
    except:
        return jsonify({'error': 'Invalid ID format'}), 400
    
    if not complaint:
        return jsonify({'error': 'Complaint not found'}), 404
    if not new_worker:
        return jsonify({'error': 'Worker not found'}), 404

    old_worker_id = complaint.get('worker_id')

    db.complaints.update_one(
        {'_id': ObjectId(complaint_id)},
        {'$set': {
            'worker_id': new_worker_id,
            'assigned_by': officer_id,
            'status': 'Assigned',
            'timeline.assigned': datetime.datetime.utcnow(),
            'last_updated': datetime.datetime.utcnow()
        }}
    )

    # Notify new worker (in-app)
    try:
        from services.notification_service import notification_service
        ref_id = complaint.get('ref_id', complaint_id)
        notification_service.notify(
            user_id=new_worker_id,
            message=f"Task reassigned to you: {ref_id}",
            type="assignment"
        )
        # Notify old worker
        if old_worker_id:
            notification_service.notify(
                user_id=old_worker_id,
                message=f"Task {ref_id} has been reassigned to another worker.",
                type="reassignment"
            )
    except Exception as e:
        print(f"[REASSIGN] Notification error: {e}")

    # Email the NEW WORKER about reassignment
    new_worker_email = new_worker.get('email')
    if new_worker_email:
        try:
            from services.email_service import send_worker_assignment_email
            send_worker_assignment_email(
                to_email=new_worker_email,
                worker_name=new_worker.get('name', 'Worker'),
                ref_id=complaint.get('ref_id', complaint_id),
                category=complaint.get('category', 'General'),
                priority=complaint.get('priority', 'Medium'),
                complaint_text=complaint.get('complaint_text', complaint.get('text', ''))
            )
        except Exception as e:
            print(f"[REASSIGN] Worker email error: {e}")

    return jsonify({
        'message': f'Reassigned to {new_worker.get("name", "worker")}',
        'status': 'Assigned'
    }), 200


@dept_officer_bp.route('/smart-assign', methods=['POST'])
def smart_assign_complaint():
    """AI Smart Assignment: Automatically assigns complaint to least-loaded free worker."""
    data = request.json
    complaint_id = data.get('complaint_id')
    department = data.get('department')
    officer_id = data.get('officer_id')
    
    if not complaint_id or not department:
        return jsonify({'error': 'complaint_id and department are required'}), 400
    
    from services.smart_assignment import smart_assign
    result = smart_assign(complaint_id, department, officer_id)
    
    if result.get('success'):
        return jsonify(result), 200
    else:
        return jsonify(result), 400
