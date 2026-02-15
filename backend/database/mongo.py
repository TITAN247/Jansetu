from pymongo import MongoClient
from flask import current_app, g

client = None
db = None

def init_db(app):
    global client, db
    try:
        client = MongoClient(app.config['MONGO_URI'])
        db = client[app.config['DB_NAME']]
        print(f"Connected to MongoDB: {app.config['DB_NAME']}")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")

def get_db():
    global db
    return db
