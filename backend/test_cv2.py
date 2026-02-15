import cv2
import numpy as np
import sys

print(f"Python: {sys.version}")
print(f"CV2 Version: {cv2.__version__}")

try:
    # Create dummy black image
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    print("Dummy image created.")
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    print("Converted to gray.")
    
    orb = cv2.ORB_create(nfeatures=1000)
    print("ORB Created.")
    
    kp, des = orb.detectAndCompute(gray, None)
    print(f"ORB Computed. Keypoints: {len(kp)}")
    
    print("CV2 Test Passed Successfully.")
except Exception as e:
    print(f"CV2 Test Failed: {e}")
    import traceback
    traceback.print_exc()
