from flask import Flask, send_from_directory, request
from flask_cors import CORS
from config import Config
from database.mongo import init_db
from routes.auth_routes import auth_bp
from routes.complaint_routes import complaint_bp
from routes.worker_routes import worker_bp
from routes.admin_routes import admin_bp
import os

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Global Request Logging
@app.before_request
def log_request_info():
    import datetime
    with open("global_requests.log", "a") as f:
        f.write(f"[{datetime.datetime.now()}] {request.method} {request.url}\n")
        f.write(f"Headers: {request.headers}\n")
        # Don't log body for uploads as it's huge


# Initialize Database
init_db(app)

# Start background escalation scanner (daemon thread)
from services.escalation_service import start_escalation_service
start_escalation_service()

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(complaint_bp, url_prefix='/api/complaint')
app.register_blueprint(worker_bp, url_prefix='/api/worker')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
from routes.dept_officer_routes import dept_officer_bp
app.register_blueprint(dept_officer_bp, url_prefix='/api/dept-officer')
from routes.notification_routes import notification_bp
app.register_blueprint(notification_bp, url_prefix='/api/notifications')

# Serve Uploaded Images (for frontend display)
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/')
def index():
    return "Jansetu AI Backend Running"

if __name__ == '__main__':
    if not os.path.exists(Config.UPLOAD_FOLDER):
        os.makedirs(Config.UPLOAD_FOLDER)
    app.run(debug=True, port=5000)
