from services.image_ai import image_ai

class VerificationAI:
    def verify(self, image_before_path, image_after_path):
        """
        Compares the issues detected in the 'before' image vs the 'after' image.
        If 'after' image has significantly fewer issues, it is verified.
        """
        
        # Analyze Before Image
        before_result = image_ai.analyze(image_before_path)
        before_issue_count = len(before_result.get('objects', []))
        
        # Analyze After Image
        after_result = image_ai.analyze(image_after_path)
        after_issue_count = len(after_result.get('objects', []))
        
        # Logic: If issues reduced to 0 or significantly dropped
        if before_issue_count > 0 and after_issue_count == 0:
            return {
                "status": "Verified", 
                "confidence": 0.95, 
                "details": "All issues resolved.",
                "before_analysis": before_result,
                "after_analysis": after_result
            }
        elif before_issue_count > after_issue_count:
            return {
                "status": "Partially Done", 
                "confidence": 0.5, 
                "details": "Some issues remain.",
                "before_analysis": before_result,
                "after_analysis": after_result
            }
        elif before_issue_count == 0:
             return {
                 "status": "Verified", 
                 "confidence": 1.0, 
                 "details": "No issues detected initially.",
                 "before_analysis": before_result,
                 "after_analysis": after_result
             }
        else:
            return {
                "status": "Not Verified", 
                "confidence": 0.1, 
                "details": "Issues still detected.",
                "before_analysis": before_result,
                "after_analysis": after_result
            }

verification_ai = VerificationAI()
