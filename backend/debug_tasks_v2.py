import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import app
from database.mongo import get_db
import pprint

print("Initializing Debug Script...")

with app.app_context():
    db = get_db()
    
    if db is None:
        print("CRITICAL: Database connection failed (db is None).")
        exit(1)

    print("\n--- LATEST WORKER ---")
    worker = db.workers.find_one(sort=[('_id', -1)])
    if worker:
        print(f"ID: {worker['_id']}")
        print(f"Name: {worker.get('name')}")
        print(f"Email: {worker.get('email')}")
        print(f"Dept ID (in DB): '{worker.get('department_id')}'")
    else:
        print("No workers found.")

    print("\n--- LATEST COMPLAINTS ---")
    complaints = list(db.complaints.find().sort('_id', -1).limit(5))
    if not complaints:
        print("No complaints found.")

    for c in complaints:
        print(f"ID: {c['_id']} | Text: {c.get('complaint_text', 'N/A')[:20]} | Dept: '{c.get('department')}' | Status: '{c.get('status')}'")

    print("\n--- DIAGNOSIS ---")
    if worker and complaints:
        w_dept = worker.get('department_id') or "GENERAL_DEFAULT"
        
        # Simulate the query logic from worker_routes.py
        search_depts = [w_dept]
        if w_dept == 'Road': search_depts.append('Road Department')
        if w_dept == 'Water': search_depts.append('Water Department')
        if w_dept == 'Electricity': search_depts.append('Electricity Department')
        if w_dept == 'Sanitation': search_depts.append('Sanitation Department')
        
        print(f"Worker Dept: '{w_dept}'")
        print(f"Search Terms: {search_depts}")
        
        matching_query = {
            'department': {'$in': search_depts},
            'status': {'$in': ['Submitted', 'Assigned', 'In Progress']}
        }
        
        count = db.complaints.count_documents(matching_query)
        print(f"Active Tasks Found for this Worker: {count}")

        if count == 0:
            resolved_count = db.complaints.count_documents({'department': {'$in': search_depts}, 'status': 'Resolved'})
            print(f"Resolved Tasks (Hidden): {resolved_count}")
