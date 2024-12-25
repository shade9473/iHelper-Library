import os
import json
import hashlib
from typing import Dict, List, Any

class ResourceDirectoryAnalyzer:
    def __init__(self, base_path: str):
        self.base_path = base_path
        self.analysis_report = {
            "total_directories": 0,
            "total_files": 0,
            "directory_breakdown": {},
            "file_type_distribution": {},
            "content_complexity": {},
            "potential_value_index": {}
        }

    def analyze_directory_structure(self) -> None:
        """
        Comprehensive analysis of directory structure and content
        """
        for dir_name in sorted(os.listdir(self.base_path)):
            full_path = os.path.join(self.base_path, dir_name)
            
            if os.path.isdir(full_path):
                self._analyze_single_directory(dir_name, full_path)

        self._calculate_potential_value_index()

    def _analyze_single_directory(self, dir_name: str, full_path: str) -> None:
        """
        Detailed analysis of a single directory
        """
        files = os.listdir(full_path)
        
        dir_analysis = {
            "total_files": len(files),
            "file_types": {},
            "content_summary": {}
        }

        for filename in files:
            file_path = os.path.join(full_path, filename)
            file_ext = os.path.splitext(filename)[1]
            
            # Track file types
            dir_analysis["file_types"][file_ext] = dir_analysis["file_types"].get(file_ext, 0) + 1
            
            # Analyze file content
            if os.path.isfile(file_path):
                self._analyze_file_content(file_path, dir_analysis)

        self.analysis_report["directory_breakdown"][dir_name] = dir_analysis
        self.analysis_report["total_directories"] += 1
        self.analysis_report["total_files"] += len(files)

    def _analyze_file_content(self, file_path: str, dir_analysis: Dict) -> None:
        """
        Analyze individual file content with robust error handling
        """
        try:
            # Determine file type
            file_ext = os.path.splitext(file_path)[1].lower()
            text_extensions = ['.md', '.txt', '.json', '.yaml', '.yml', '.html', '.css', '.js', '.py']
            
            if file_ext in text_extensions:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        # Content complexity metrics
                        complexity_metrics = {
                            "total_chars": len(content),
                            "total_words": len(content.split()),
                            "unique_words": len(set(content.split())),
                            "content_hash": hashlib.md5(content.encode()).hexdigest()
                        }

                        dir_analysis["content_summary"][os.path.basename(file_path)] = complexity_metrics
                except UnicodeDecodeError:
                    # Handle potential encoding issues
                    dir_analysis["content_summary"][os.path.basename(file_path)] = {
                        "error": "Encoding issue",
                        "file_size": os.path.getsize(file_path)
                    }
            else:
                # For binary files, just record metadata
                dir_analysis["content_summary"][os.path.basename(file_path)] = {
                    "file_type": file_ext,
                    "file_size": os.path.getsize(file_path)
                }

        except Exception as e:
            print(f"Error analyzing {file_path}: {e}")
            dir_analysis["content_summary"][os.path.basename(file_path)] = {
                "error": str(e)
            }

    def _calculate_potential_value_index(self) -> None:
        """
        Calculate a potential value index for each directory
        Based on file count, content complexity, and naming convention
        """
        priority_keywords = [
            'marketing', 'automation', 'business', 
            'productivity', 'strategy', 'development'
        ]

        for dir_name, dir_data in self.analysis_report["directory_breakdown"].items():
            value_score = 0
            
            # Directory name relevance
            value_score += sum(1 for keyword in priority_keywords if keyword in dir_name.lower()) * 10
            
            # File count impact
            value_score += dir_data["total_files"] * 2
            
            # Content complexity
            for file_summary in dir_data.get("content_summary", {}).values():
                value_score += min(file_summary.get("total_words", 0) / 100, 20)

            self.analysis_report["potential_value_index"][dir_name] = value_score

    def generate_report(self, output_path: str) -> None:
        """
        Generate a comprehensive JSON report
        """
        with open(output_path, 'w') as f:
            json.dump(self.analysis_report, f, indent=2)

def main():
    base_path = r"c:/Users/ihelp/Comprehensive_Resource_Library/Comp_Res_Lib_V2"
    analyzer = ResourceDirectoryAnalyzer(base_path)
    analyzer.analyze_directory_structure()
    analyzer.generate_report("c:/Users/ihelp/Comprehensive_Resource_Library/Comp_Res_Lib_V2/resource_directory_analysis_report.json")

if __name__ == "__main__":
    main()
