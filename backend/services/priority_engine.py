class PriorityEngine:
    def calculate_priority(self, text_priority, image_confidence):
        """
        Combines text-based priority (from sentiment) and image confidence
        to determine the final priority.
        """
        
        # Base priority from text analysis (Sentiment Model)
        final_priority = text_priority # 'High', 'Medium', 'Low'
        
        # Escalate if image confidence is very high (indicating clear visual damage)
        if image_confidence > 0.85:
            if final_priority == "Low":
                final_priority = "Medium"
            elif final_priority == "Medium":
                final_priority = "High"
                
        return final_priority

priority_engine = PriorityEngine()
