import os
import re
import json
from datetime import datetime
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

class FeedbackAnalyzer:
    def __init__(self, feedback_dir):
        self.feedback_dir = Path(feedback_dir)
        self.results_dir = self.feedback_dir / 'analysis_results'
        self.results_dir.mkdir(exist_ok=True)
        
    def parse_feedback_file(self, file_path):
        """Parse a feedback markdown file into structured data"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Extract ratings (1-5 scale)
        ratings = re.findall(r'Rating: \[(\d)\]', content)
        ratings = [int(r) for r in ratings if r.isdigit()]
        
        # Extract yes/no responses
        yes_no = re.findall(r'\[ \] Yes \[ \] No', content)
        
        # Extract comments
        comments = re.findall(r'Comments: (.*?)\\n', content)
        
        return {
            'file_name': file_path.name,
            'timestamp': datetime.fromtimestamp(os.path.getctime(file_path)),
            'ratings': ratings,
            'yes_no_questions': len(yes_no),
            'comments': comments,
            'raw_content': content
        }
    
    def analyze_feedback(self):
        """Analyze all feedback files and generate reports"""
        feedback_data = []
        
        # Process all markdown files
        for file_path in self.feedback_dir.glob('*.md'):
            if file_path.name.startswith('README'):
                continue
            try:
                data = self.parse_feedback_file(file_path)
                feedback_data.append(data)
            except Exception as e:
                print(f"Error processing {file_path}: {str(e)}")
        
        if not feedback_data:
            return "No feedback data found to analyze."
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame(feedback_data)
        
        # Generate reports
        self.generate_summary_report(df)
        self.generate_visualizations(df)
        
        return "Analysis complete. Check the analysis_results directory for reports."
    
    def generate_summary_report(self, df):
        """Generate a summary report of feedback analysis"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_feedback_count': len(df),
            'average_ratings': sum(len(r) for r in df['ratings']) / len(df) if len(df) > 0 else 0,
            'feedback_by_type': df['file_name'].value_counts().to_dict(),
            'latest_feedback': df['timestamp'].max().isoformat() if len(df) > 0 else None
        }
        
        # Save report
        report_path = self.results_dir / f'summary_report_{datetime.now().strftime("%Y%m%d")}.json'
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
    
    def generate_visualizations(self, df):
        """Generate visualizations of feedback data"""
        # Ratings distribution
        plt.figure(figsize=(10, 6))
        ratings_flat = [r for ratings in df['ratings'] for r in ratings]
        plt.hist(ratings_flat, bins=5, range=(1, 6))
        plt.title('Distribution of Ratings')
        plt.xlabel('Rating')
        plt.ylabel('Frequency')
        plt.savefig(self.results_dir / 'ratings_distribution.png')
        plt.close()
        
        # Feedback volume over time
        plt.figure(figsize=(10, 6))
        df['timestamp'].value_counts().sort_index().plot()
        plt.title('Feedback Volume Over Time')
        plt.xlabel('Date')
        plt.ylabel('Number of Feedback Items')
        plt.savefig(self.results_dir / 'feedback_volume.png')
        plt.close()

if __name__ == '__main__':
    analyzer = FeedbackAnalyzer('.')
    result = analyzer.analyze_feedback()
    print(result)
