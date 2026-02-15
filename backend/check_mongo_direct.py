from pymongo import MongoClient
import pprint

def main():
    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['jansetu_ai']
        print("Connected to jansetu_ai")
        
        cols = db.list_collection_names()
        print(f"Collections: {cols}")
        
        if 'complaints' not in cols:
            print("No complaints collection.")
            return

        # sort by _id descending to get latest
        c = db.complaints.find_one(sort=[('_id', -1)])
        
        if not c:
            print("No complaints found.")
            return

        print("\n--- Latest Complaint ---")
        print(f"ID: {c.get('_id')}")
        print(f"Status: {c.get('status')}")
        print(f"Verif Status: {c.get('verification_status')}")
        print(f"Reason: {c.get('verification_reason')}")
        print(f"Confidence: {c.get('verification_confidence')}")
        print(f"Remarks: {c.get('remarks')}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
