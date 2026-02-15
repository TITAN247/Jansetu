import random
import string
import time

def generate_complaint_id(category="GEN"):
    """
    Generates a complaint ID in the format: JAN-CAT-YYYY-XXXX
    Example: JAN-ROAD-2024-X92A
    """
    year = time.strftime("%Y")
    # Get first 3-4 chars of category uppercase
    cat_code = category[:4].upper() if category else "GEN"
    
    # Generate random suffix
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    
    return f"JAN-{cat_code}-{year}-{suffix}"

def generate_worker_id(department="GEN"):
    """
    Generates a worker ID: WRK-DEPT-XXXX
    """
    dept_code = department[:3].upper()
    suffix = ''.join(random.choices(string.digits, k=4))
    return f"WRK-{dept_code}-{suffix}"
