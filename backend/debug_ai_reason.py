from database.mongo import get_db
from app import app
from bson import ObjectId
import pprint

with app.app_context():
    db = get_db()
    # Find the most recently updated complaint (checking 'image_after' existence implies work done)
    # or just sort by modification time if we tracked it (we don't tracking mod time explicitly in schema?)
    # We'll sort by 'created_at' and filter for those with 'verification_status'
    
    print("--- Checking Latest Verified/Resolved Complaints ---")
    
    cursor = db.complaints.find(
        {"verification_status": {"$exists": True}}
    ).sort('_id', -1).limit(3)
    
    complaints = list(cursor)
    
    if not complaints:
        print("No complaints found with verification status.")
    else:
        for c in complaints:
            print(f"\n[ID: {c['_id']}]")
            print(f"Status: {c.get('status')}")
            print(f"Verification: {c.get('verification_status')}")
            print(f"Reason: {c.get('verification_reason', 'N/A')}")
            print(f"Confidence: {c.get('verification', {}).get('confidence', 'N/A')}") # Legacy structure check
            print(f"AI Analysis (After): Objects Detected = {len(c.get('ai_analysis_after', {}).get('objects', []))}")
            full_verification = c.get('verification', {}) # Sometimes stored in 'verification' field? 
            # In my code I updated root fields.
            
            # Check the specific reason field I added
            print(f"Root Verification Reason: {c.get('verification_reason')}")
