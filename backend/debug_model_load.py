import datetime

print(f"[{datetime.datetime.now()}] Starting Model Debug Script...")

try:
    print(f"[{datetime.datetime.now()}] Importing ultralytics...")
    from ultralytics import YOLO
    print(f"[{datetime.datetime.now()}] Import Successful.")
    
    print(f"[{datetime.datetime.now()}] Loading YOLO('yolov8n.pt')...")
    # Using 'yolov8n.pt' (nano) as it matches default. 
    # Or 'best.pt' if user has custom?
    # services/image_ai_service.py likely uses 'best.pt' or 'yolov8n.pt'.
    # I'll try standard first.
    model = YOLO('yolov8n.pt') 
    
    print(f"[{datetime.datetime.now()}] Model Loaded Successfully.")
    
    print(f"[{datetime.datetime.now()}] Running dummy inference...")
    results = model('https://ultralytics.com/images/bus.jpg')
    print(f"[{datetime.datetime.now()}] Inference Done.")
    
except Exception as e:
    print(f"[{datetime.datetime.now()}] ERROR: {e}")
    import traceback
    traceback.print_exc()
