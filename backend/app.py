from flask import Flask, send_from_directory, request, send_file
from flask_cors import CORS
from config import Config
from database.mongo import init_db
from routes.auth_routes import auth_bp
from routes.complaint_routes import complaint_bp
from routes.worker_routes import worker_bp
from routes.admin_routes import admin_bp
import os

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
app.config.from_object(Config)

# Enable CORS only in development (when running locally)
if os.getenv('FLASK_ENV') != 'production':
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

# Serve Frontend (Single Page Application)
@app.route('/')
def serve_frontend():
    return send_file(os.path.join(app.static_folder, 'index.html'))

# Handle client-side routing - serve index.html for all non-API routes
@app.route('/<path:path>')
def serve_static(path):
    # If path starts with api/, it's an API request - return 404 if not handled
    if path.startswith('api/'):
        return {"error": "API endpoint not found"}, 404
    
    # Check if file exists in static folder
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    
    # Otherwise serve index.html for client-side routing
    return send_file(os.path.join(app.static_folder, 'index.html'))

if __name__ == '__main__':
    if not os.path.exists(Config.UPLOAD_FOLDER):
        os.makedirs(Config.UPLOAD_FOLDER)
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
