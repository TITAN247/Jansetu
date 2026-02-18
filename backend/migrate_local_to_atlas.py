import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import BulkWriteError

# Load environment variables (to get Atlas URI)
load_dotenv()

def migrate():
    print("Starting migration from Local MongoDB to Atlas MongoDB...")

    # 1. Connect to Local DB (Source)
    local_uri = 'mongodb://localhost:27017/'
    try:
        local_client = MongoClient(local_uri, serverSelectionTimeoutMS=5000)
        local_db = local_client['jansetu_ai']
        local_client.server_info() # Trigger connection check
        print("✅ Connected to Local MongoDB (Source)")
    except Exception as e:
        print(f"❌ Failed to connect to Local MongoDB: {e}")
        print("Ensure your local MongoDB service is running.")
        return

    # 2. Connect to Atlas DB (Target)
    atlas_uri = os.getenv('MONGO_URI')
    if not atlas_uri:
        print("❌ Error: MONGO_URI not found in .env")
        return

    try:
        atlas_client = MongoClient(atlas_uri, serverSelectionTimeoutMS=10000)
        # Parse database name from URI if present, but config uses 'jansetu_ai'
        # The URI usually has /dbname?options
        # We will consistently use 'jansetu_ai' as per config.py
        target_db_name = os.getenv('DB_NAME', 'jansetu_ai')
        atlas_db = atlas_client[target_db_name] 
        
        # Verify connection
        atlas_client.server_info()
        print(f"✅ Connected to Atlas MongoDB (Target: {target_db_name})")
    except Exception as e:
        print(f"❌ Failed to connect to Atlas MongoDB: {e}")
        return

    # 3. Migrate Collections
    # We explicitly exclude system collections if any
    collections = [name for name in local_db.list_collection_names() if not name.startswith("system.")]
    print(f"\nFound collections to migrate: {collections}")

    if not collections:
        print("⚠️ No collections found in local database 'jansetu_ai'.")
        return

    for col_name in collections:
        print(f"\nMigrating collection: {col_name}...")
        
        # Get source data
        source_col = local_db[col_name]
        docs = list(source_col.find())
        
        if not docs:
            print(f"  - No documents found in {col_name}. Skipping.")
            continue
            
        print(f"  - Found {len(docs)} documents in local {col_name}.")
        
        # Get target collection
        target_col = atlas_db[col_name]
        
        # Check if target already has data
        target_count = target_col.count_documents({})
        if target_count > 0:
            print(f"  - ⚠️ Target collection {col_name} already has {target_count} documents.")
            print("    Attempting to merge (duplicates will be skipped)...")
        
        try:
            # ordered=False allows valid inserts to succeed even if some fail (e.g. duplicates)
            result = target_col.insert_many(docs, ordered=False)
            print(f"  - ✅ Successfully migrated {len(result.inserted_ids)} new documents.")
        except BulkWriteError as bwe:
             # This error is raised if *any* insert fails (e.g. duplicate _id)
             # but successful ones still get inserted because ordered=False
            inserted_count = bwe.details['nInserted']
            duplicates = len(bwe.details['writeErrors'])
            print(f"  - ⚠️ Partial migration: Inserted {inserted_count}, Skipped {duplicates} duplicates.")
        except Exception as e:
            print(f"  - ❌ Error during migration: {e}")

    print("\n✅ Migration process completed.")
    print("You can verify the data in MongoDB Atlas.")

if __name__ == "__main__":
    migrate()
