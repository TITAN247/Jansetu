from datetime import datetime
import time

def get_timestamp():
    return datetime.utcnow()

# 1. USER SCHEMA
def create_user(name, email, password_hash, role="Citizen", is_active=True):
    return {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "created_at": get_timestamp(),
        "is_active": is_active
    }

# 2. WORKER SCHEMA
def create_worker(name, email, department_id, password_hash, role="Worker", is_active=True):
    return {
        "name": name,
        "email": email,
        "department_id": department_id,
        "password_hash": password_hash, # Explicitly storing hash
        "role": role,
        "is_active": is_active,
        "assigned_complaints": [],
        "created_at": get_timestamp()
    }

# 3. DEPARTMENT OFFICER SCHEMA
def create_dept_officer(name, email, department_id, password_hash, role="dept_officer", is_active=True):
    return {
        "name": name,
        "email": email,
        "department_id": department_id,
        "password_hash": password_hash,
        "role": role,
        "is_active": is_active,
        "created_at": get_timestamp()
    }

# 4. DEPARTMENT SCHEMA
def create_department(department_name, issue_types, sla_hours=48):
    return {
        "department_name": department_name,
        "issue_types": issue_types, # List of strings
        "sla_hours": sla_hours,
        "is_active": True,
        "created_at": get_timestamp()
    }

# 4. COMPLAINT SCHEMA
def create_complaint(user_id, text, category, priority, department, image_path, ref_id=None, lat=None, lng=None, email=None):
    """
    Detailed Complaint Schema as per requirements.
    """
    timestamp = get_timestamp()
    return {
        "user_id": user_id,
        "ref_id": ref_id, # Official ID (e.g., JAN-ROAD-2024-X92A)
        "email": email,  # Email for guest complaints & notifications
        
        # Complaint Details
        "complaint_text": text,
        "category": category,
        "priority": priority,
        "department": department,
        
        # Location
        "location": {
            "lat": float(lat) if lat else None,
            "lng": float(lng) if lng else None,
        },
        
        # Evidence
        "image_path": image_path, # Legacy field support
        "image_before": image_path, # New field
        "image_after": None,
        
        # AI Analysis Data
        "normalized_text": "", # NEW: Stores the Hinglish version used for AI
        "ai_analysis": {
            "text_confidence": 0.0, 
            "image_confidence": 0.0,
            "model_used": "YOLOv8 + NLP"
        },
        
        # Status & Lifecycle
        "status": "Pending", # Pending -> Assigned -> In Progress -> Resolved
        "worker_id": None,
        "assigned_by": None,  # Dept Officer who assigned
        "deadline": None,     # Optional deadline set by officer
        "escalation_level": 0, # 0=normal, 1=escalated to admin
        "timeline": {
            "submitted": timestamp,
            "assigned": None,
            "in_progress": None,
            "resolved": None,
            "verified": None
        },
        
        # Review Data
        "worker_remarks": [],
        "admin_notes": "",
        
        # Verification
        "verification": {
            "status": "Pending",
            "confidence": 0.0,
            "verified_at": None,
            "method": "AI Image Comparison"
        },
        
        # Metadata
        "created_at": timestamp,
        "last_updated": timestamp
    }

# 5. FEEDBACK SCHEMA
def create_feedback(complaint_id, user_id, rating, comment):
    return {
        "complaint_id": complaint_id,
        "user_id": user_id,
        "rating": rating,
        "comment": comment,
        "created_at": get_timestamp()
    }

# 6. NOTIFICATION SCHEMA
def create_notification(user_id, complaint_id, message, type="system"):
    return {
        "user_id": user_id,
        "complaint_id": complaint_id,
        "message": message,
        "type": type,
        "is_read": False,
        "created_at": get_timestamp()
    }

