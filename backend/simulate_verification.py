import os
import cv2
import numpy as np
from services.verification_service import verification_service
from config import Config

def create_dummy_image(name, color=(0,0,0)):
    path = os.path.join(Config.UPLOAD_FOLDER, name)
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    img[:] = color
    cv2.imwrite(path, img)
    return path

def run_simulation():
    print("--- Starting AI Verification Simulation ---")
    
    upload_dir = Config.UPLOAD_FOLDER
    if not os.path.exists(upload_dir):
        print(f"Error: Upload directory {upload_dir} not found.")
        return

    # 1. Find a real image (Before Image)
    files = [f for f in os.listdir(upload_dir) if f.lower().endswith(('.jpg', '.png', '.jpeg'))]
    if not files:
        print("No images found in uploads folder to test with.")
        # Create one?
        dummy_path = create_dummy_image("test_pothole.jpg", (100, 100, 100))
        real_image_path = dummy_path
        print(f"Created dummy test image: {real_image_path}")
    else:
        real_image_path = os.path.join(upload_dir, files[0])
        print(f"Using Real Image: {files[0]}")

    # 2. Test Case A: Same Image (Should FAIL -> "Issue still detected" OR "No issue initially")
    print(f"\n[Test A] Verifying Image Against Itself...")
    result_a = verification_service.verify(real_image_path, real_image_path)
    print(f"Result: {result_a['status']}")
    print(f"Reason: {result_a.get('reason')}")
    print(f"Confidence: {result_a.get('confidence')}")

    # 3. Test Case B: Different Image (Should FAIL -> "Low Similarity")
    dummy_clean = create_dummy_image("test_clean.jpg", (255, 255, 255))
    print(f"\n[Test B] Verifying Real Image Against Blank Image...")
    result_b = verification_service.verify(real_image_path, dummy_clean)
    print(f"Result: {result_b['status']}")
    print(f"Reason: {result_b.get('reason')}")
    print(f"Confidence: {result_b.get('confidence')}")
    
    # Cleanup
    if os.path.exists(dummy_clean): os.remove(dummy_clean)
    # Don't remove real image

if __name__ == "__main__":
    try:
        run_simulation()
    except Exception as e:
        print(f"Simulation Crashed: {e}")
        import traceback
        traceback.print_exc()
