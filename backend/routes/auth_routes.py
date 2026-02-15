from flask import Blueprint, request, jsonify
from database.mongo import get_db
from database.schemas import create_user, create_worker
import jwt
import datetime
from config import Config

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    db = get_db()
    data = request.json
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    email = data['email']
    password = data['password'] # In real app, hash this!
    role = data.get('role', 'Citizen') 
    
    print(f"[AUTH REGISTER] Attempting to register {email} as {role}")

    # Check if user exists in either collection
    if db.users.find_one({'email': email}) or db.workers.find_one({'email': email}):
        print(f"[AUTH REGISTER] User {email} already exists.")
        return jsonify({'error': 'User with this email already exists'}), 400
    
    if role == 'Worker':
        # Frontend sends 'department', Schema expects 'department_id' (or we align them)
        dept = data.get('department') 
        new_worker = create_worker(
            name=data.get('name', 'Worker'),
            email=email,
            department_id=dept, # Pass 'department' value to 'department_id' field
            password_hash=password, 
            role='Worker'
        )
        result = db.workers.insert_one(new_worker)
        user_id = str(result.inserted_id)
        collection = 'workers'
        
    elif role in ['admin', 'governance']:
        # Create Admin/Governance Profile
        # Schema similar to User but with higher privileges
        new_admin = {
            "name": data.get('name', 'Official'),
            "email": email,
            "password_hash": password,
            "role": role,
            "department": data.get('department', 'Administration'),
            "created_at": datetime.datetime.utcnow()
        }
        result = db.admins.insert_one(new_admin)
        user_id = str(result.inserted_id)
        collection = 'admins'

    else:
        new_user = create_user(
            name=data.get('name', 'Citizen'),
            email=email,
            password_hash=password, # Store consistent field
            role='Citizen'
        )
        result = db.users.insert_one(new_user)
        user_id = str(result.inserted_id)
        collection = 'users'
    
    print(f"[AUTH REGISTER] Success: {user_id} in {collection}")
    
    return jsonify({
        'message': f'{role} registered successfully',
        'user_id': user_id,
        'role': role,
        'collection': collection
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    print("--- [AUTH LOGIN] Request Received ---")
    try:
        db = get_db()
        # Log Headers and Data
        print(f"Headers: {request.headers}")
        data = request.json
        print(f"Raw Payload: {data}")
        
        if not data or 'email' not in data or 'password' not in data:
            print("Error: Missing credentials in payload")
            return jsonify({'error': 'Missing credentials'}), 400
        
        email = data['email']
        password = data['password']
        
        print(f"Attempting login for: {email}")

        # 1. Check Users (Citizens)
        user = db.users.find_one({'email': email})
        role = 'citizen' # Lowercase for frontend consistency
        print(f"Search Users Result: {user is not None}")
        
        # 2. Check Workers
        if not user:
            print("User not found in 'users', checking 'workers'...")
            user = db.workers.find_one({'email': email})
            role = 'worker'
            print(f"Search Workers Result: {user is not None}")

        # 3. Check Admins (New)
        if not user:
             print("User not found in 'workers', checking 'admins'...")
             # For now, let's treat specific hardcoded emails as admins if DB is empty, 
             # OR check an 'admins' collection. 
             # Let's check 'admins' collection first.
             user = db.admins.find_one({'email': email})
             if user:
                 role = user.get('role', 'admin') # Could be 'admin' or 'governance'
             print(f"Search Admins Result: {user is not None}")
             
        # 4. Fallback Hardcoded Admin (Emergency Access for Demo)
        if not user and email == 'admin@jansetu.ai' and password == 'admin123':
            print("Using Fallback Admin")
            user = {
                '_id': 'admin_001',
                'name': 'System Admin',
                'email': 'admin@jansetu.ai',
                'password': 'admin123',
                'role': 'admin'
            }
            role = 'admin'
            
        if not user and email == 'gov@jansetu.ai' and password == 'gov123':
            print("Using Fallback Governance")
            user = {
                '_id': 'gov_001',
                'name': 'Governance Head',
                'email': 'gov@jansetu.ai',
                'password': 'gov123',
                'role': 'governance'
            }
            role = 'governance'

        
        if user:
            # Check 'password_hash' primarily, fallback to 'password'
            stored_hash = user.get('password_hash')
            stored_pass = user.get('password')
            print(f"Stored Hash exists: {bool(stored_hash)}")
            print(f"Stored Pass exists: {bool(stored_pass)}")
            
            # Simple string comparison (for hackathon/demo)
            if (stored_hash and stored_hash == password) or (stored_pass and stored_pass == password):
                print(f"Success: Password match for {email} ({role})")
                
                # Ensure _id is string
                user_id = str(user['_id'])
                
                token = jwt.encode({
                    'user_id': user_id,
                    'role': role,
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
                }, Config.SECRET_KEY, algorithm="HS256")
                print("Token generated.")

                return jsonify({
                    'message': 'Login successful',
                    'token': token,
                    'user': {
                        'id': user_id,
                        'name': user['name'],
                        'email': user['email'],
                        'role': role,
                        # Fix: Workers use 'department_id', others use 'department'
                        # Frontend expects 'department' so we normalize it here
                        'department': user.get('department_id') or user.get('department')
                    }
                }), 200
            else:
                print(f"Failure: Password mismatch for {email}")
                print(f"Received: {password}")
                print(f"Expected: {stored_hash} or {stored_pass}")
                return jsonify({'error': 'Invalid credentials (Password mismatch)'}), 401
                
        else:
            print(f"Failure: User {email} not found in any collection.")
            return jsonify({'error': 'User not found'}), 401
            
    except Exception as e:
        print(f"CRITICAL ERROR in Login: {e}")
        return jsonify({'error': f'Server Error: {str(e)}'}), 500
