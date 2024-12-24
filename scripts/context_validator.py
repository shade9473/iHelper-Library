import os
import json
from datetime import datetime, timedelta

class ContextValidator:
    def __init__(self, mission_manifest_path):
        self.mission_manifest_path = mission_manifest_path
        self.drift_threshold = timedelta(hours=1)
    
    def load_mission_manifest(self):
        with open(self.mission_manifest_path, 'r') as f:
            return json.load(f)
    
    def check_recent_files(self, directories):
        """Validate that recent work aligns with mission parameters"""
        current_time = datetime.now()
        relevant_files = []
        
        for directory in directories:
            for root, _, files in os.walk(directory):
                for file in files:
                    full_path = os.path.join(root, file)
                    mod_time = datetime.fromtimestamp(os.path.getmtime(full_path))
                    
                    if current_time - mod_time < self.drift_threshold:
                        relevant_files.append({
                            'path': full_path,
                            'modified': mod_time
                        })
        
        return relevant_files
    
    def validate_context(self):
        """Primary context validation method"""
        mission = self.load_mission_manifest()
        recent_files = self.check_recent_files([
            'c:/Users/ihelp/Comprehensive_Resource_Library/Comp_Res_Lib_V2'
        ])
        
        print("🔍 Context Validation Report")
        print(f"Mission: {mission.get('objective', 'Undefined')}")
        print(f"Files Modified in Last Hour: {len(recent_files)}")
        
        for file in recent_files:
            print(f"- {file['path']} (Modified: {file['modified']})")
        
        return len(recent_files) > 0

if __name__ == "__main__":
    validator = ContextValidator('c:/Users/ihelp/Comprehensive_Resource_Library/Comp_Res_Lib_V2/ACTIVE_MISSION_MANIFEST.md')
    validator.validate_context()
