import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'jansetu_secret_key_123')
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    DB_NAME = 'jansetu_ai'
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    Allowed_EXTENSIONS = {'png', 'jpg', 'jpeg'}
