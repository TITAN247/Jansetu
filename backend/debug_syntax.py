try:
    from services.verification_service import verification_service
    print("Verification Service imported successfully.")
except Exception as e:
    print(f"Error importing verification_service: {e}")
    import traceback
    traceback.print_exc()
