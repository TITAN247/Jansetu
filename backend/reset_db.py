from app import app
from database.mongo import get_db

if __name__ == "__main__":
    with app.app_context():
        db = get_db()
        print("Dropping Users...")
        db.users.drop()
        print("Dropping Workers...")
        db.workers.drop()
        print("Dropping Complaints...")
        db.complaints.drop()
        print("Database Reset Complete. Please register new users.")
