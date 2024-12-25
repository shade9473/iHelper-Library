import os
import json
from typing import Dict, List

class DirectoryOptimizer:
    def __init__(self, base_path: str):
        self.base_path = base_path
        self.structure_report = {}

    def analyze_directory_structure(self) -> Dict:
        """
        Analyze the current directory structure and generate optimization insights.
        """
        structure = {}
        for root, dirs, files in os.walk(self.base_path):
            # Skip version control and system directories
            if any(skip in root for skip in ['.git', 'node_modules', 'dist']):
                continue
            
            relative_path = os.path.relpath(root, self.base_path)
            structure[relative_path] = {
                'total_files': len(files),
                'subdirectories': len(dirs),
                'file_types': self._analyze_file_types(files)
            }
        
        return structure

    def _analyze_file_types(self, files: List[str]) -> Dict:
        """
        Analyze file types within a directory.
        """
        file_types = {}
        for file in files:
            ext = os.path.splitext(file)[1]
            file_types[ext] = file_types.get(ext, 0) + 1
        return file_types

    def generate_optimization_recommendations(self):
        """
        Generate recommendations for directory structure optimization.
        """
        recommendations = []
        
        # Check for empty or near-empty directories
        for path, details in self.structure_report.items():
            if details['total_files'] < 2:
                recommendations.append(f"Consider consolidating {path} - too few files")
        
        # Check for inconsistent file type distribution
        for path, details in self.structure_report.items():
            if len(details['file_types']) > 3:
                recommendations.append(f"Standardize file types in {path}")
        
        return recommendations

    def run_optimization(self):
        """
        Main optimization workflow.
        """
        self.structure_report = self.analyze_directory_structure()
        recommendations = self.generate_optimization_recommendations()
        
        # Generate optimization report
        optimization_report = {
            'total_directories': len(self.structure_report),
            'recommendations': recommendations,
            'structure_details': self.structure_report
        }
        
        # Save optimization report
        with open(os.path.join(self.base_path, 'DIRECTORY_OPTIMIZATION_REPORT.json'), 'w') as f:
            json.dump(optimization_report, f, indent=2)
        
        return optimization_report

def main():
    base_path = r'c:/Users/ihelp/Comprehensive_Resource_Library/Comp_Res_Lib_V2'
    optimizer = DirectoryOptimizer(base_path)
    report = optimizer.run_optimization()
    print("Directory Optimization Complete. Report generated.")

if __name__ == '__main__':
    main()
