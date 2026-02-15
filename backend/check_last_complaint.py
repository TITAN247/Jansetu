from database.mongo import get_db
from app import app
from bson.json_util import dumps

if __name__ == "__main__":
    with app.app_context():
        db = get_db()
        # Find the most recently updated complaint
        c = db.complaints.find_one(sort=[('_id', -1)])
        if c:
            print("--- Latest Complaint ---")
            print(f"ID: {c.get('_id')}")
            print(f"Status: {c.get('status')}")
            print(f"Verification Status: {c.get('verification_status')}")
            print(f"Reason: {c.get('verification_reason')}")
            print(f"Confidence: {c.get('verification_confidence')}")
            print(f"Remarks: {c.get('remarks')}")
        else:
            print("No complaints found.")
