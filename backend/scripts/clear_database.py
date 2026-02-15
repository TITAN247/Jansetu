import os
import shutil
from pymongo import MongoClient

# Configuration
MONGO_URI = 'mongodb://localhost:27017/'
DB_NAME = 'jansetu_ai'
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')

def clear_database():
    try:
        # 1. Clear MongoDB
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        
        collections = db.list_collection_names()
        if not collections:
            print("Database is already empty.")
        else:
            print(f"Found collections: {collections}")
            for collection in collections:
                db[collection].drop()
                print(f"Dropped collection: {collection}")
            print("✅ Database cleared successfully.")

        # 2. Clear Uploads Folder
        if os.path.exists(UPLOAD_FOLDER):
            print(f"Clearing uploads folder: {UPLOAD_FOLDER}")
            for filename in os.listdir(UPLOAD_FOLDER):
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                except Exception as e:
                    print(f"Failed to delete {file_path}. Reason: {e}")
            print("✅ Uploads folder cleared.")
        else:
            print("Uploads folder does not exist, creating it...")
            os.makedirs(UPLOAD_FOLDER)
            print("✅ Uploads folder created.")

    except Exception as e:
        print(f"❌ Error clearing data: {e}")

if __name__ == "__main__":
    print("Starting automated database cleanup...")
    clear_database()

