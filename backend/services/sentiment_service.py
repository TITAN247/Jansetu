import pickle
import os
import re

class SentimentService:
    def __init__(self):
        self.vectorizer = None
        self.model = None
        self.models_loaded = False
        self._load_models()

    def _load_models(self):
        try:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(current_dir)
            models_dir = os.path.join(backend_dir, 'models')
            
            vec_path = os.path.join(models_dir, 'vectorizer.pkl') # Shared vectorizer usually
            model_path = os.path.join(models_dir, 'sentiment_model.pkl')
            
            if os.path.exists(vec_path) and os.path.exists(model_path):
                with open(vec_path, 'rb') as f:
                     # If separate vectorizer needed, load it. Assuming shared for simplicty or specific one.
                     # For this task, user said "vectorizer.pkl" is used for both.
                    self.vectorizer = pickle.load(f)
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                self.models_loaded = True
                print("Sentiment AI Models loaded successfully.")
            else:
                print(f"Sentiment AI models not found at {models_dir}")
        except Exception as e:
            print(f"Error loading Sentiment AI models: {e}")

    def analyze(self, text):
        if not self.models_loaded or not text:
            return {"priority": "Medium", "confidence": 0.0}

        try:
            # Simple cleaning
            text = text.lower()
            text_vector = self.vectorizer.transform([text])
            
            # Predict Priority
            prediction = self.model.predict(text_vector)[0]
            probabilities = self.model.predict_proba(text_vector)[0]
            confidence = max(probabilities)
            
            return {
                "priority": prediction, # High, Medium, Low
                "confidence": float(confidence)
            }
        except Exception as e:
            print(f"Error in Sentiment AI analysis: {e}")
            return {"priority": "Medium", "confidence": 0.0}

sentiment_service = SentimentService()
