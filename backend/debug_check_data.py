from database.mongo import get_db
import pprint

db = get_db()

print("--- RECENT WORKERS ---")
workers = list(db.workers.find().sort('_id', -1).limit(5))
for w in workers:
    print(f"Name: {w.get('name')}, Email: {w.get('email')}, Dept: '{w.get('department_id')}', Role: {w.get('role')}")

print("\n--- RECENT COMPLAINTS ---")
complaints = list(db.complaints.find().sort('_id', -1).limit(5))
for c in complaints:
    print(f"ID: {c.get('_id')}, Text: {c.get('complaint_text')[:20]}..., Dept: '{c.get('department')}', Status: {c.get('status')}")

# Check for mismatches
if workers and complaints:
    w_dept = workers[0].get('department_id')
    print(f"\nChecking matches for Worker Dept: '{w_dept}'")
    matches = db.complaints.count_documents({'department': w_dept})
    print(f"Found {matches} complaints matching department '{w_dept}'")
