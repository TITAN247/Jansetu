class DepartmentMapper:
    def __init__(self):
        self.mapping = {
            "Roads": "Road",
            "Road": "Road", # Added singular
            "Potholes": "Road",
            "Pothole": "Road", # Added singular
            "Sanitation": "Sanitation",
            "Garbage": "Sanitation",
            "Electricity": "Electricity",
            "Street Light": "Electricity",
            "Water": "Water",
            "Leakage": "Water",
            "Sewage": "Water"
        }

    def map_complaint(self, category):
        """
        Maps a complaint category to a specific government department.
        Default: General Administration
        """
        return self.mapping.get(category, "General Administration")

department_mapper = DepartmentMapper()
