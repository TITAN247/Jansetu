from pymongo import MongoClient
import pprint
import os
from dotenv import load_dotenv

load_dotenv()

def main():
    try:
        uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
        client = MongoClient(uri)
        # Handle database name extraction if implicit in URI or default
        db_name = os.getenv('DB_NAME', 'jansetu_ai')
        # If the URI specifies a db, get_database() without args uses it, but pymongo client connects to server
        # Explicitly get the database
        db = client[db_name]
        print(f"Connected to {db_name}")
        
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
