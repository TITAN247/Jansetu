from flask import Blueprint, request, jsonify
from database.mongo import get_db
from database.schemas import create_user, create_worker, create_dept_officer
import jwt
import datetime
from config import Config
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    db = get_db()
    data = request.json
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    email = data['email']
    password = data['password']
    # Hash password using bcrypt
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    role = data.get('role', 'Citizen') 
    
    # ===== PASSWORD FORMAT VALIDATION =====
    import re
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long.'}), 400
    if not re.search(r'[A-Z]', password):
        return jsonify({'error': 'Password must contain at least one uppercase letter.'}), 400
    if not re.search(r'[a-z]', password):
        return jsonify({'error': 'Password must contain at least one lowercase letter.'}), 400
    if not re.search(r'[0-9]', password):
        return jsonify({'error': 'Password must contain at least one digit.'}), 400
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password):
        return jsonify({'error': 'Password must contain at least one special character (!@#$%^&*).'}), 400
    
    print(f"[AUTH REGISTER] Attempting to register {email} as {role}")

    # Check if user exists in either collection
    if db.users.find_one({'email': email}) or db.workers.find_one({'email': email}) or db.dept_officers.find_one({'email': email}):
        print(f"[AUTH REGISTER] User {email} already exists.")
        return jsonify({'error': 'User with this email already exists'}), 400
    
    if role == 'Worker':
        # Frontend sends 'department', Schema expects 'department_id' (or we align them)
        dept = data.get('department') 
        new_worker = create_worker(
            name=data.get('name', 'Worker'),
            email=email,
            department_id=dept,
            password_hash=password_hash,
            role='Worker'
        )
        result = db.workers.insert_one(new_worker)
        user_id = str(result.inserted_id)
        collection = 'workers'
        
    elif role == 'dept_officer':
        dept = data.get('department')
        new_officer = create_dept_officer(
            name=data.get('name', 'Dept Officer'),
            email=email,
            department_id=dept,
            password_hash=password_hash,
            role='dept_officer'
        )
        result = db.dept_officers.insert_one(new_officer)
        user_id = str(result.inserted_id)
        collection = 'dept_officers'

    elif role in ['admin', 'governance']:
        # ===== ACCESS CODE VERIFICATION =====
        access_code = data.get('access_code', '').strip().upper()
        from routes.admin_routes import VALID_ADMIN_CODES
        if not access_code or access_code not in VALID_ADMIN_CODES:
            return jsonify({'error': 'Invalid or missing access code. Only developer-generated codes are accepted.'}), 403
        
        # Verify code matches the requested role
        if VALID_ADMIN_CODES[access_code] != role:
            return jsonify({'error': f'This access code is for {VALID_ADMIN_CODES[access_code]} role, not {role}.'}), 403

        # Create Admin/Governance Profile with district
        new_admin = {
            "name": data.get('name', 'Official'),
            "email": email,
            "password_hash": password_hash,
            "role": role,
            "department": data.get('department', 'Administration'),
            "district": data.get('district', ''),
            "access_code_used": access_code,
            "created_at": datetime.datetime.utcnow()
        }
        result = db.admins.insert_one(new_admin)
        user_id = str(result.inserted_id)
        collection = 'admins'

    else:
        new_user = create_user(
            name=data.get('name', 'Citizen'),
            email=email,
            password_hash=password_hash,
            role='Citizen'
        )
        result = db.users.insert_one(new_user)
        user_id = str(result.inserted_id)
        collection = 'users'
    
    # Map any guest complaints (submitted with this email before registration)
    try:
        mapped = db.complaints.update_many(
            {'email': email, 'user_id': 'Anonymous'},
            {'$set': {'user_id': user_id}}
        )
        if mapped.modified_count > 0:
            print(f"[AUTH REGISTER] Mapped {mapped.modified_count} guest complaint(s) to user {user_id}")
    except Exception as e:
        print(f"[AUTH REGISTER] Email mapping error: {e}")

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
        # context tells us from which portal the login is initiated
        # e.g. 'public' (citizen/worker/local authority) vs 'admin_portal'
        context = data.get('context', 'public')
        
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

         # 3. Check Dept Officers
        if not user:
            print("User not found in 'workers', checking 'dept_officers'...")
            user = db.dept_officers.find_one({'email': email})
            if user:
                role = 'dept_officer'
            print(f"Search Dept Officers Result: {user is not None}")

         # 4. Check Admins
        if not user:
             print("User not found in 'dept_officers', checking 'admins'...")
             user = db.admins.find_one({'email': email})
             if user:
                 role = user.get('role', 'admin')
             print(f"Search Admins Result: {user is not None}")
             
        # 4. Fallback Hardcoded Admin (Emergency Access for Demo)
        # These use pre-hashed passwords with bcrypt
        admin_hash = '$2b$12$k31P8s0FApU5LSekMmMWA.fhKPy8/3FNM9cQ9Ba45FhEEe2UwNRvu'  # admin123
        gov_hash = '$2b$12$G6HHCoECbuDCe73s1ubuGuJwBJbJTdxXB5ebZGhr/Ohqw1oFrYhW2'    # gov123
        
        if not user and email == 'admin@jansetu.ai':
            # Verify hardcoded admin with bcrypt
            if bcrypt.checkpw(password.encode('utf-8'), admin_hash.encode('utf-8')):
                print("Using Fallback Admin")
                user = {
                    '_id': 'admin_001',
                    'name': 'System Admin',
                    'email': 'admin@jansetu.ai',
                    'password_hash': admin_hash,
                    'role': 'admin'
                }
                role = 'admin'
            
        if not user and email == 'gov@jansetu.ai':
            # Verify hardcoded governance with bcrypt
            if bcrypt.checkpw(password.encode('utf-8'), gov_hash.encode('utf-8')):
                print("Using Fallback Governance")
                user = {
                    '_id': 'gov_001',
                    'name': 'Governance Head',
                    'email': 'gov@jansetu.ai',
                    'password_hash': gov_hash,
                    'role': 'governance'
                }
                role = 'governance'

        
        if user:
            # Check password using bcrypt
            stored_hash = user.get('password_hash')
            print(f"Stored Hash exists: {bool(stored_hash)}")
            
            # Verify password with bcrypt
            if stored_hash and bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
                print(f"Success: Password match for {email} ({role})")

                # Enforce role-wise portal access:
                #  - Administration roles ('admin', 'governance') must use the admin portal
                #  - Citizen / worker / dept_officer must NOT use the admin portal
                if context == 'public' and role in ['admin', 'governance']:
                    print(f"[AUTH LOGIN] Admin-type role attempted login via public portal: {email}")
                    return jsonify({'error': 'Administration roles must login via the administration portal.'}), 403

                if context == 'admin_portal' and role not in ['admin', 'governance']:
                    print(f"[AUTH LOGIN] Non-admin role attempted login via admin portal: {email} ({role})")
                    return jsonify({'error': 'Only administration roles can login from this portal.'}), 403
                
                # Ensure _id is string
                user_id = str(user['_id'])
                
                token = jwt.encode({
                    'user_id': user_id,
                    'role': role,
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
                }, Config.SECRET_KEY, algorithm="HS256")
                print("Token generated.")

                # Map any remaining guest complaints to this user
                try:
                    mapped = db.complaints.update_many(
                        {'email': user['email'], 'user_id': 'Anonymous'},
                        {'$set': {'user_id': user_id}}
                    )
                    if mapped.modified_count > 0:
                        print(f"[AUTH LOGIN] Mapped {mapped.modified_count} guest complaint(s) to {user_id}")
                except Exception as e:
                    print(f"[AUTH LOGIN] Email mapping error: {e}")

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
                        'department': user.get('department_id') or user.get('department'),
                        'district': user.get('district', '')
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
