import os
import json
import sqlite3
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional

class ProfessionalStageDetector:
    """
    Intelligent Professional Stage Detection Mechanism
    
    Design Philosophy: Context-aware, adaptive professional growth tracking
    Local Economic Context: Port Townsend Professional Ecosystem
    """
    
    PROFESSIONAL_STAGES = [
        "Entry-Level Professional",
        "Mid-Career Professional", 
        "Leadership Track",
        "Entrepreneurial Innovator",
        "Community Impact Professional"
    ]
    
    STAGE_PROGRESSION_CRITERIA = {
        "Entry-Level Professional": {
            "indicators": [
                "learning_intensity", 
                "skill_acquisition_rate", 
                "mentorship_engagement"
            ],
            "thresholds": {
                "learning_intensity": (0.0, 0.4),
                "skill_acquisition_rate": (0.0, 0.5),
                "mentorship_engagement": (0.0, 0.3)
            }
        },
        "Mid-Career Professional": {
            "indicators": [
                "project_complexity", 
                "leadership_potential", 
                "cross_domain_expertise"
            ],
            "thresholds": {
                "project_complexity": (0.4, 0.7),
                "leadership_potential": (0.3, 0.6),
                "cross_domain_expertise": (0.4, 0.7)
            }
        },
        "Leadership Track": {
            "indicators": [
                "strategic_thinking", 
                "team_impact", 
                "organizational_influence"
            ],
            "thresholds": {
                "strategic_thinking": (0.7, 1.0),
                "team_impact": (0.6, 1.0),
                "organizational_influence": (0.5, 1.0)
            }
        },
        "Entrepreneurial Innovator": {
            "indicators": [
                "innovation_rate", 
                "risk_tolerance", 
                "market_adaptation"
            ],
            "thresholds": {
                "innovation_rate": (0.6, 1.0),
                "risk_tolerance": (0.7, 1.0),
                "market_adaptation": (0.5, 0.9)
            }
        },
        "Community Impact Professional": {
            "indicators": [
                "social_initiative", 
                "collaborative_networks", 
                "community_engagement"
            ],
            "thresholds": {
                "social_initiative": (0.5, 1.0),
                "collaborative_networks": (0.6, 1.0),
                "community_engagement": (0.7, 1.0)
            }
        }
    }
    
    def __init__(
        self, 
        training_data_path: str = None,
        metadata_path: str = None,
        output_dir: str = None
    ):
        """
        Initialize Professional Stage Detector
        
        Args:
            training_data_path: Path to user interaction database
            metadata_path: Path to cross-referencing metadata
            output_dir: Directory for stage detection outputs
        """
        self.project_root = os.path.dirname(os.path.abspath(__file__))
        
        # Configuration paths
        self.training_data_path = training_data_path or os.path.join(
            self.project_root, 'TRAINING_DATA', 'user_interactions.db'
        )
        self.metadata_path = metadata_path or os.path.join(
            self.project_root, 'CROSS_REFERENCING_METADATA.json'
        )
        self.output_dir = output_dir or os.path.join(
            self.project_root, 'PROFESSIONAL_STAGE_INSIGHTS'
        )
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Load metadata
        self.metadata = self._load_metadata()
    
    def _load_metadata(self) -> Dict[str, Any]:
        """
        Load cross-referencing metadata
        
        Returns:
            Metadata dictionary
        """
        try:
            with open(self.metadata_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ Metadata not found. Using default configuration.")
            return {}
    
    def _load_training_data(self) -> pd.DataFrame:
        """
        Load user interaction training data from SQLite database
        
        Returns:
            Pandas DataFrame with user interactions
        """
        try:
            with sqlite3.connect(self.training_data_path) as conn:
                query = "SELECT * FROM user_interactions"
                df = pd.read_sql_query(query, conn)
                
                # Parse context metadata
                df['context_metadata'] = df['context_metadata'].apply(
                    lambda x: json.loads(x) if x else {}
                )
                
                return df
        except Exception as e:
            print(f"❌ Error loading training data: {e}")
            return pd.DataFrame()
    
    def _compute_professional_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Compute professional growth indicators
        
        Args:
            df: Input DataFrame with user interactions
        
        Returns:
            DataFrame with computed professional indicators
        """
        # Compute indicators based on interaction metadata
        indicators = pd.DataFrame()
        
        # Learning Intensity
        indicators['learning_intensity'] = df['context_metadata'].apply(
            lambda x: x.get('learning_depth', 0) / 10.0
        )
        
        # Skill Acquisition Rate
        indicators['skill_acquisition_rate'] = df['context_metadata'].apply(
            lambda x: x.get('skill_breadth', 0) / 10.0
        )
        
        # Project Complexity
        indicators['project_complexity'] = df['context_metadata'].apply(
            lambda x: x.get('project_sophistication', 0) / 10.0
        )
        
        # Leadership Potential
        indicators['leadership_potential'] = df['context_metadata'].apply(
            lambda x: x.get('leadership_engagement', 0) / 10.0
        )
        
        # Innovation Rate
        indicators['innovation_rate'] = df['context_metadata'].apply(
            lambda x: x.get('innovative_thinking', 0) / 10.0
        )
        
        # Community Engagement
        indicators['community_engagement'] = df['context_metadata'].apply(
            lambda x: x.get('community_involvement', 0) / 10.0
        )
        
        return indicators
    
    def detect_professional_stages(self) -> Dict[str, List[str]]:
        """
        Detect professional stages based on interaction indicators
        
        Returns:
            Dictionary mapping professional stages to user identifiers
        """
        # Load training data
        df = self._load_training_data()
        
        if df.empty:
            print("❌ No training data available for stage detection.")
            return {}
        
        # Compute professional indicators
        indicators = self._compute_professional_indicators(df)
        
        # Stage classification
        stage_classifications = {stage: [] for stage in self.PROFESSIONAL_STAGES}
        
        for idx, row in indicators.iterrows():
            detected_stage = self._classify_professional_stage(row)
            stage_classifications[detected_stage].append(df.loc[idx, 'user_id'])
        
        # Generate insights report
        insights_report = {
            "timestamp": pd.Timestamp.now().isoformat(),
            "professional_stage_distribution": {
                stage: len(users) for stage, users in stage_classifications.items()
            },
            "stage_classifications": stage_classifications
        }
        
        # Save insights report
        report_filename = f'professional_stage_insights_{pd.Timestamp.now().strftime("%Y%m%d_%H%M%S")}.json'
        report_path = os.path.join(self.output_dir, report_filename)
        
        with open(report_path, 'w') as f:
            json.dump(insights_report, f, indent=2)
        
        print(f"✅ Professional Stage Detection Complete")
        print(f"📊 Insights Report: {report_path}")
        
        return stage_classifications
    
    def _classify_professional_stage(self, indicators: pd.Series) -> str:
        """
        Classify professional stage based on computed indicators
        
        Args:
            indicators: Series of professional growth indicators
        
        Returns:
            Detected professional stage
        """
        for stage, stage_config in self.STAGE_PROGRESSION_CRITERIA.items():
            stage_match = all(
                thresholds[0] <= indicators[indicator] <= thresholds[1]
                for indicator, thresholds in zip(
                    stage_config['indicators'], 
                    [stage_config['thresholds'][ind] for ind in stage_config['indicators']]
                )
            )
            
            if stage_match:
                return stage
        
        # Default to Entry-Level if no match
        return "Entry-Level Professional"

def main():
    """
    Demonstration of Professional Stage Detection
    """
    print("🌐 Port Townsend Professional Resource Library - Professional Stage Detector")
    
    # Initialize and execute stage detection
    stage_detector = ProfessionalStageDetector()
    stage_classifications = stage_detector.detect_professional_stages()
    
    # Print stage distribution
    print("\n🔍 Professional Stage Distribution:")
    for stage, users in stage_classifications.items():
        print(f"{stage}: {len(users)} users")

if __name__ == "__main__":
    main()
