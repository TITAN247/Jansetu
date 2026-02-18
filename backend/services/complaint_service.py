from database.mongo import get_db
from database.schemas import create_complaint
from services.text_ai_service import text_ai_service
from services.sentiment_service import sentiment_service
from services.image_ai_service import image_ai_service
from services.priority_engine import priority_engine
from services.department_mapper import department_mapper
from services.normalization_service import normalization_service
from utils.id_generator import generate_complaint_id
import os
from config import Config

class ComplaintService:
    def process_submission(self, user_id, text, image_file, lat=None, lng=None, email=None):
        """
        Orchestrates the entire complaint submission process:
        1. Saves Image
        2. Normalizes Input Text (Multilingual -> Hinglish)
        3. Runs AI Analysis (Text, Sentiment, Image)
        4. Determines Priority & Department (Fusion)
        5. Generates ID
        6. Saves to DB
        7. Sends Email Notification (if email provided)
        """
        db = get_db()
        
        # 1. Save Image
        filename = image_file.filename
        image_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        image_file.save(image_path)
        
        # 2. Normalize Text
        normalized_text = normalization_service.normalize(text)
        
        # 3. AI Analysis
        text_result = text_ai_service.analyze(normalized_text)
        category = text_result.get('category', 'General')
        
        sentiment_result = sentiment_service.analyze(normalized_text)
        text_priority = sentiment_result.get('priority', 'Medium')
        
        image_result = image_ai_service.analyze(image_path)
        image_confidence = image_result.get('confidence', 0.0)
        
        # 4. Decision Fusion Engine
        final_priority = priority_engine.calculate_priority(text_priority, image_confidence)
        department = department_mapper.map_complaint(category)
        
        # 5. Generate Official ID
        ref_id = generate_complaint_id(category)

        # ── DUPLICATE DETECTION ─────────────────────────────────────────────
        # Check if same user/email already has an active or recent complaint
        # with the same category within the last 7 days.
        DEDUP_WINDOW_DAYS = 7
        dedup_cutoff = __import__('datetime').datetime.utcnow() - \
                       __import__('datetime').timedelta(days=DEDUP_WINDOW_DAYS)

        # Build the duplicate query
        dedup_query = {
            'category':   category,
            'created_at': {'$gte': dedup_cutoff},
        }
        # Match by user_id (authenticated) OR email (guest)
        if user_id and user_id != 'Anonymous':
            dedup_query['user_id'] = user_id
        elif email:
            dedup_query['email'] = email
        else:
            dedup_query = None   # anonymous with no email — skip dedup

        if dedup_query:
            existing = db.complaints.find_one(
                dedup_query,
                sort=[('created_at', -1)]   # most recent first
            )
            if existing:
                ex_status = existing.get('status', 'Pending')
                ex_ref    = existing.get('ref_id', str(existing['_id']))
                is_resolved = ex_status in ('Resolved', 'Verified')

                if is_resolved:
                    friendly_msg = (
                        f"Your concern about '{category}' was already registered as "
                        f"{ex_ref} and has been resolved. "
                        f"Don't panic — your concern has been taken care of! "
                        f"If the issue persists, you may reopen that complaint."
                    )
                else:
                    friendly_msg = (
                        f"Your concern about '{category}' is already registered as "
                        f"{ex_ref} (Status: {ex_status}). "
                        f"Don't panic — your concern has been taken. "
                        f"We are actively working on it!"
                    )

                print(f"[DEDUP] Duplicate detected for user {user_id}/{email}: "
                      f"{ex_ref} ({ex_status})")

                return {
                    'duplicate':      True,
                    'existing_ref_id': ex_ref,
                    'existing_status': ex_status,
                    'message':        friendly_msg,
                    'is_resolved':    is_resolved,
                }
        # ── END DUPLICATE DETECTION ──────────────────────────────────────────
        new_complaint = create_complaint(
            user_id=user_id,
            text=text,
            category=category,
            priority=final_priority,
            department=department,
            image_path=filename,
            ref_id=ref_id,
            lat=lat,
            lng=lng,
            email=email
        )
        new_complaint['normalized_text'] = normalized_text
        
        result = db.complaints.insert_one(new_complaint)
        complaint_id = str(result.inserted_id)

        # 7. Trigger In-App Notification
        from services.notification_service import notification_service
        notification_service.notify_complaint_activity(
            user_id=user_id,
            complaint_id=ref_id,
            message=f"Your complaint {ref_id} has been successfully registered.",
            type="submission"
        )

        # 8. Send Email Notification
        if email:
            try:
                from services.email_service import send_complaint_confirmation
                send_complaint_confirmation(email, ref_id, complaint_id)
            except Exception as e:
                print(f"[EMAIL] Error sending confirmation: {e}")

        # 9. AUTO-ASSIGN: Smart capacity-aware assignment
        auto_assign_result = None
        try:
            from services.smart_assignment import smart_assign, HARD_LIMIT
            auto_assign_result = smart_assign(complaint_id, department, officer_id=None)

            if auto_assign_result.get('success'):
                override_tag = ' [PRIORITY OVERRIDE]' if auto_assign_result.get('capacity_override') else ''
                print(
                    f"[AUTO-ASSIGN] {ref_id} → {auto_assign_result['worker_name']} "
                    f"(load {auto_assign_result['worker_load']}/{HARD_LIMIT}){override_tag}"
                )
            else:
                # Assignment failed — stays Pending for manual officer assignment
                all_at_cap = auto_assign_result.get('all_at_capacity', False)
                reason = (
                    f"All {auto_assign_result.get('worker_count', '?')} workers "
                    f"are at capacity ({HARD_LIMIT} tasks)."
                    if all_at_cap
                    else auto_assign_result.get('error', 'Unknown reason')
                )
                print(f"[AUTO-ASSIGN] {ref_id} → Failed: {reason}. Awaiting manual assignment.")

                # Email dept officers that manual intervention is needed
                try:
                    from services.email_service import send_authority_no_worker_alert
                    dept_officers = list(db.dept_officers.find({
                        'department_id': {'$in': [department, f'{department} Department']}
                    }))
                    for officer in dept_officers:
                        officer_email = officer.get('email')
                        if officer_email:
                            send_authority_no_worker_alert(
                                officer_email=officer_email,
                                officer_name=officer.get('name', 'Officer'),
                                ref_id=ref_id,
                                category=category,
                                priority=final_priority,
                                department=department
                            )
                    if not dept_officers:
                        print(f"[AUTO-ASSIGN] No dept officers found for {department} to email.")
                except Exception as e2:
                    print(f"[AUTO-ASSIGN] Error emailing dept officers: {e2}")

        except Exception as e:
            print(f"[AUTO-ASSIGN] Error during smart assignment for {ref_id}: {e}")

        _ar = auto_assign_result or {}
        return {
            'complaint_id':      complaint_id,
            'ref_id':            ref_id,
            'auto_assigned':     _ar.get('success', False),
            'assigned_worker':   _ar.get('worker_name') if _ar.get('success') else None,
            'capacity_override': _ar.get('capacity_override', False),
            'all_at_capacity':   _ar.get('all_at_capacity', False),
            'ai_analysis': {
                'category':     category,
                'priority':     final_priority,
                'department':   department,
                'image_issues': image_result.get('description')
            }
        }

    def get_details(self, complaint_id):
        pass

complaint_service = ComplaintService()
