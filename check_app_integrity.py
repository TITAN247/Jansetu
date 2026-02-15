import sys
import os

# Set path to current directory to mimic running from backend root?
# No, running from project root.

try:
    print("Attempting to import app...")
    from backend.app import app
    print("SUCCESS: App imported correctly.")
except Exception as e:
    print(f"CRITICAL: App Import Failed: {e}")
    import traceback
    traceback.print_exc()
