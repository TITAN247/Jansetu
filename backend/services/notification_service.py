from database.mongo import get_db
from database.schemas import create_notification
from bson.objectid import ObjectId

class NotificationService:
    def notify(self, user_id, message, type="system"):
        """
        Creates and saves a notification to the database.
        """
        db = get_db()
        try:
            notification = create_notification(user_id, None, message, type)
            result = db.notifications.insert_one(notification)
            print(f"[NOTIFICATION] To {user_id}: {message}")
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error sending notification: {e}")
            return None

    def notify_complaint_activity(self, user_id, complaint_id, message, type="complaint_update"):
        """
        Specialized trigger for complaint-related updates.
        """
        db = get_db()
        try:
            notification = create_notification(user_id, complaint_id, message, type)
            result = db.notifications.insert_one(notification)
            print(f"[NOTIFICATION] To {user_id} re: {complaint_id}: {message}")
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error sending notification: {e}")
            return None

    def get_user_notifications(self, user_id, limit=20):
        """
        Fetches notifications for a user, sorted by newest first.
        """
        db = get_db()
        notifications = list(db.notifications.find({'user_id': user_id})
                             .sort('created_at', -1)
                             .limit(limit))
        for n in notifications:
            n['_id'] = str(n['_id'])
        return notifications

    def mark_as_read(self, notification_id):
        db = get_db()
        db.notifications.update_one({'_id': ObjectId(notification_id)}, {'$set': {'is_read': True}})

notification_service = NotificationService()
