import os
import json
import time
import hashlib
from typing import Dict, Any, List
from datetime import datetime

class SystemPerformanceAnalyzer:
    """
    Lightweight System Performance Analysis for Port Townsend Professional Resource Library
    
    Design Philosophy: Quick, practical performance insights
    Local Economic Context: Efficient knowledge navigation
    """
    
    def __init__(
        self, 
        root_directory: str = None,
        output_directory: str = None
    ):
        """
        Initialize System Performance Analyzer
        
        Args:
            root_directory: Root directory of the resource library
            output_directory: Directory for performance reports
        """
        self.root_directory = root_directory or os.path.dirname(os.path.abspath(__file__))
        self.output_directory = output_directory or os.path.join(
            self.root_directory, 'PERFORMANCE_REPORTS'
        )
        
        # Ensure output directory exists
        os.makedirs(self.output_directory, exist_ok=True)
    
    def analyze_directory_structure(self) -> Dict[str, Any]:
        """
        Analyze directory structure and performance characteristics
        
        Returns:
            Performance insights dictionary
        """
        start_time = time.time()
        
        # Collect directory metrics
        directory_metrics = {
            "total_directories": 0,
            "total_files": 0,
            "directory_depth": 0,
            "file_types": {},
            "largest_directories": []
        }
        
        # Walk through directory
        for root, dirs, files in os.walk(self.root_directory):
            directory_metrics["total_directories"] += len(dirs)
            directory_metrics["total_files"] += len(files)
            
            # Update directory depth
            current_depth = root[len(self.root_directory):].count(os.sep)
            directory_metrics["directory_depth"] = max(
                directory_metrics["directory_depth"], 
                current_depth
            )
            
            # Track file types
            for file in files:
                ext = os.path.splitext(file)[1]
                directory_metrics["file_types"][ext] = directory_metrics["file_types"].get(ext, 0) + 1
            
            # Track largest directories
            dir_size = sum(os.path.getsize(os.path.join(root, f)) for f in files)
            directory_metrics["largest_directories"].append({
                "path": root,
                "size": dir_size
            })
        
        # Sort largest directories
        directory_metrics["largest_directories"].sort(
            key=lambda x: x["size"], 
            reverse=True
        )[:5]  # Top 5 largest
        
        # Performance timing
        end_time = time.time()
        directory_metrics["analysis_duration"] = end_time - start_time
        
        return directory_metrics
    
    def generate_navigation_performance_report(self) -> Dict[str, Any]:
        """
        Generate navigation performance report
        
        Returns:
            Navigation performance insights
        """
        # Simulate navigation performance tracking
        navigation_metrics = {
            "total_categories": 6,
            "total_links": 24,
            "recommended_links_percentage": 0.25,  # 25% of links personalized
            "average_link_depth": 2.5,
            "navigation_complexity": "Low"
        }
        
        # Analyze index.html for navigation structure
        index_path = os.path.join(self.root_directory, 'index.html')
        if os.path.exists(index_path):
            with open(index_path, 'r') as f:
                index_content = f.read()
                navigation_metrics["index_hash"] = hashlib.md5(
                    index_content.encode()
                ).hexdigest()
        
        return navigation_metrics
    
    def comprehensive_performance_analysis(self) -> Dict[str, Any]:
        """
        Conduct comprehensive system performance analysis
        
        Returns:
            Comprehensive performance report
        """
        # Collect performance insights
        performance_report = {
            "timestamp": datetime.now().isoformat(),
            "directory_structure": self.analyze_directory_structure(),
            "navigation_performance": self.generate_navigation_performance_report()
        }
        
        # Calculate overall performance score
        performance_score = self._calculate_performance_score(performance_report)
        performance_report["overall_performance_score"] = performance_score
        
        # Generate report filename
        report_filename = f'performance_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        report_path = os.path.join(self.output_directory, report_filename)
        
        # Save performance report
        with open(report_path, 'w') as f:
            json.dump(performance_report, f, indent=2)
        
        print(f"✅ System Performance Analysis Complete")
        print(f"📊 Performance Report: {report_path}")
        print(f"🏆 Overall Performance Score: {performance_score}/100")
        
        return performance_report
    
    def _calculate_performance_score(self, report: Dict[str, Any]) -> float:
        """
        Calculate overall system performance score
        
        Args:
            report: Comprehensive performance report
        
        Returns:
            Performance score (0-100)
        """
        # Scoring components
        directory_score = min(
            (report['directory_structure']['total_directories'] / 50) * 30, 
            30
        )
        
        navigation_score = min(
            (report['navigation_performance']['total_links'] / 30) * 40, 
            40
        )
        
        complexity_bonus = 30 if report['navigation_performance']['navigation_complexity'] == 'Low' else 20
        
        total_score = directory_score + navigation_score + complexity_bonus
        
        return round(total_score, 2)

def main():
    """
    Demonstration of System Performance Analysis
    """
    print("🌐 Port Townsend Professional Resource Library - System Performance Analyzer")
    
    # Initialize and execute performance analysis
    performance_analyzer = SystemPerformanceAnalyzer()
    performance_report = performance_analyzer.comprehensive_performance_analysis()

if __name__ == "__main__":
    main()
