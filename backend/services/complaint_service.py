from database.mongo import get_db
from database.schemas import create_complaint
from services.text_ai_service import text_ai_service
from services.sentiment_service import sentiment_service
from services.image_ai_service import image_ai_service
from services.priority_engine import priority_engine
from services.department_mapper import department_mapper
from services.normalization_service import normalization_service
from utils.id_generator import generate_complaint_id
import os
from config import Config

class ComplaintService:
    def process_submission(self, user_id, text, image_file, lat=None, lng=None):
        """
        Orchestrates the entire complaint submission process:
        1. Saves Image
        2. Normalizes Input Text (Multilingual -> Hinglish)
        3. Runs AI Analysis (Text, Sentiment, Image)
        4. Determines Priority & Department (Fusion)
        5. Generates ID
        6. Saves to DB
        """
        db = get_db()
        
        # 1. Save Image
        filename = image_file.filename
        image_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        image_file.save(image_path)
        
        # 2. Normalize Text
        normalized_text = normalization_service.normalize(text)
        
        # 3. AI Analysis
        # Text AI -> Category (Using Normalized Hinglish)
        text_result = text_ai_service.analyze(normalized_text)
        category = text_result.get('category', 'General')
        
        # Sentiment AI -> Priority (Base) (Using Normalized Hinglish)
        sentiment_result = sentiment_service.analyze(normalized_text)
        text_priority = sentiment_result.get('priority', 'Medium')
        
        # Image AI -> Visual Confirmation
        image_result = image_ai_service.analyze(image_path)
        image_confidence = image_result.get('confidence', 0.0)
        
        # 4. Decision Fusion Engine
        # Combine sentiment urgency with visual confidence
        final_priority = priority_engine.calculate_priority(text_priority, image_confidence)
        department = department_mapper.map_complaint(category)
        
        # 5. Generate Official ID
        ref_id = generate_complaint_id(category)

        # 6. Create DB Entry
        new_complaint = create_complaint(
            user_id=user_id,
            text=text, # Original Text
            category=category,
            priority=final_priority,
            department=department,
            image_path=filename,
            ref_id=ref_id,
            lat=lat,
            lng=lng
        )
        # Inject Normalized Text into Schema Object manually before insert
        new_complaint['normalized_text'] = normalized_text
        
        # Remove manual assignment since it's passed in
        # new_complaint['ref_id'] = ref_id 
        
        result = db.complaints.insert_one(new_complaint)
        complaint_id = str(result.inserted_id)

        # 6. Trigger Notification
        from services.notification_service import notification_service
        notification_service.notify_complaint_activity(
            user_id=user_id,
            complaint_id=ref_id, # Use official ID for display
            message=f"Your complaint {ref_id} has been successfully registered.",
            type="submission"
        )

        # 7. Notify Workers in Dept
        try:
            # Find workers in this department
            workers = db.workers.find({'department_id': department})
            for worker in workers:
                w_id = str(worker['_id'])
                notification_service.notify(
                    user_id=w_id,
                    message=f"New Task: {category} complaint ({priority} Priority) requires attention.",
                    type="work_alert"
                )
        except Exception as e:
            print(f"Error notifying workers: {e}")
        
        return {
            'complaint_id': complaint_id,
            'ref_id': ref_id,
            'ai_analysis': {
                'category': category,
                'priority': final_priority,
                'department': department,
                'image_issues': image_result.get('description')
            }
        }

    def get_details(self, complaint_id):
        # Placeholder for complex detail fetching logic if needed
        pass

complaint_service = ComplaintService()
