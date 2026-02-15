import pickle
import os
import numpy as np

class TextAI:
    def __init__(self):
        self.vectorizer = None
        self.category_model = None
        self.priority_model = None
        self.models_loaded = False
        self._load_models()

    def _load_models(self):
        try:
            # Use directory of this file to determine project root
            # .../backend/services/text_ai.py -> .../backend/services
            current_dir = os.path.dirname(os.path.abspath(__file__))
            # .../backend/services -> .../backend
            backend_dir = os.path.dirname(current_dir)
            base_path = os.path.join(backend_dir, 'models')
            
            # Load Vectorizer
            with open(os.path.join(base_path, 'vectorizer.pkl'), 'rb') as f:
                self.vectorizer = pickle.load(f)
            
            # Load Category Model
            with open(os.path.join(base_path, 'complaint_model.pkl'), 'rb') as f:
                self.category_model = pickle.load(f)
                
            # Load Priority Model (Sentiment)
            with open(os.path.join(base_path, 'sentiment_model.pkl'), 'rb') as f:
                self.priority_model = pickle.load(f)

            self.models_loaded = True
            print("Text AI Models loaded successfully.")
        except Exception as e:
            print(f"Error loading Text AI models: {e}")
            self.models_loaded = False

    def analyze(self, text):
        if not self.models_loaded:
            return {
                "category": "General", 
                "priority": "Medium",
                "error": "Models not loaded"
            }

        try:
            # Preprocess
            text_vector = self.vectorizer.transform([text])
            
            # Predict Category
            category = self.category_model.predict(text_vector)[0]
            
            # Predict Priority/Sentiment
            # Assuming sentiment model returns 'Negative' (High Priority) or 'Positive' (Low Priority)
            # Or directly maps to priority. Adjust based on actual model output.
            sentiment = self.priority_model.predict(text_vector)[0]
            
            priority = "Medium"
            if sentiment == "Negative":
                priority = "High"
            elif sentiment == "Positive":
                priority = "Low"
            
            return {
                "category": category,
                "priority": priority,
                "sentiment": sentiment
            }
        except Exception as e:
            print(f"Error during text analysis: {e}")
            return {"category": "Uncategorized", "priority": "Medium"}

text_ai = TextAI()
