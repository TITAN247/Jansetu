from database.mongo import get_db
import pprint

db = get_db()

print("\n--- LATEST WORKER ---")
# Get the most recently created worker
worker = db.workers.find_one(sort=[('_id', -1)])
if worker:
    print(f"ID: {worker['_id']}")
    print(f"Name: {worker.get('name')}")
    print(f"Email: {worker.get('email')}")
    print(f"Dept ID (in DB): '{worker.get('department_id')}'")
else:
    print("No workers found.")

print("\n--- LATEST COMPLAINTS ---")
# Get last 5 complaints
complaints = list(db.complaints.find().sort('_id', -1).limit(5))
if not complaints:
    print("No complaints found.")

for c in complaints:
    print(f"ID: {c['_id']} | Text: {c.get('complaint_text', 'N/A')[:20]} | Dept: '{c.get('department')}' | Status: '{c.get('status')}'")

print("\n--- DIAGNOSIS ---")
if worker and complaints:
    w_dept = worker.get('department_id')
    
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
        # Check if they match dept but are resolved
        resolved_count = db.complaints.count_documents({'department': {'$in': search_depts}, 'status': 'Resolved'})
        print(f"Resolved Tasks (Hidden): {resolved_count}")
        
