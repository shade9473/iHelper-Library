import os
import json
import uuid
from datetime import datetime, timedelta
import sqlite3
import hashlib
from typing import Dict, Any, List, Optional

class TrainingDataCollector:
    """
    Intelligent Training Data Collection Mechanism
    
    Design Philosophy: Ethical, privacy-preserving user interaction tracking
    Local Economic Context: Enhance professional resource discovery
    """
    
    def __init__(self, data_storage_path: str = None):
        """
        Initialize Training Data Collector
        
        Args:
            data_storage_path: Optional custom path for data storage
        """
        # Default storage in project root
        self.project_root = os.path.dirname(os.path.abspath(__file__))
        self.data_storage_path = data_storage_path or os.path.join(self.project_root, 'TRAINING_DATA')
        
        # Ensure data storage directory exists
        os.makedirs(self.data_storage_path, exist_ok=True)
        
        # Initialize SQLite database for secure, structured storage
        self.db_path = os.path.join(self.data_storage_path, 'user_interactions.db')
        self._initialize_database()
    
    def _initialize_database(self):
        """
        Create SQLite database schema for training data
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # User interaction tracking table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_interactions (
                    interaction_id TEXT PRIMARY KEY,
                    user_hash TEXT,
                    timestamp DATETIME,
                    current_directory TEXT,
                    target_directory TEXT,
                    professional_stage TEXT,
                    interaction_type TEXT,
                    interaction_duration REAL,
                    interaction_score REAL,
                    context_metadata TEXT
                )
            ''')
            
            # Consent and privacy tracking table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_consent (
                    user_hash TEXT PRIMARY KEY,
                    consent_timestamp DATETIME,
                    consent_version TEXT,
                    anonymization_level TEXT
                )
            ''')
            
            conn.commit()
    
    def _generate_user_hash(self, user_identifier: str) -> str:
        """
        Generate privacy-preserving user hash
        
        Args:
            user_identifier: Unique user identifier
        
        Returns:
            Anonymized user hash
        """
        # Salted hash for additional privacy
        salt = "PORT_TOWNSEND_PROFESSIONAL_LIBRARY_SALT"
        return hashlib.sha256(f"{user_identifier}{salt}".encode()).hexdigest()
    
    def record_user_interaction(
        self, 
        user_identifier: str, 
        current_directory: str, 
        target_directory: str,
        professional_stage: str,
        interaction_type: str = 'navigation',
        interaction_duration: float = 0.0,
        interaction_score: float = 0.5,
        context_metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Record user interaction for training data collection
        
        Args:
            user_identifier: Unique user identifier
            current_directory: Current navigation context
            target_directory: Targeted resource directory
            professional_stage: User's professional stage
            interaction_type: Type of user interaction
            interaction_duration: Duration of interaction
            interaction_score: Quality/relevance of interaction
            context_metadata: Additional contextual information
        
        Returns:
            Unique interaction ID
        """
        # Generate unique interaction ID
        interaction_id = str(uuid.uuid4())
        
        # Generate privacy-preserving user hash
        user_hash = self._generate_user_hash(user_identifier)
        
        # Prepare context metadata
        context_metadata = context_metadata or {}
        context_json = json.dumps(context_metadata)
        
        # Record interaction in database
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO user_interactions (
                    interaction_id, user_hash, timestamp, 
                    current_directory, target_directory, 
                    professional_stage, interaction_type, 
                    interaction_duration, interaction_score, 
                    context_metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                interaction_id, user_hash, datetime.now().isoformat(),
                current_directory, target_directory, 
                professional_stage, interaction_type,
                interaction_duration, interaction_score,
                context_json
            ))
            conn.commit()
        
        return interaction_id
    
    def get_training_data(
        self, 
        start_date: Optional[datetime] = None, 
        end_date: Optional[datetime] = None,
        professional_stages: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve training data with optional filtering
        
        Args:
            start_date: Optional start date for data retrieval
            end_date: Optional end date for data retrieval
            professional_stages: Optional list of professional stages
        
        Returns:
            List of training data entries
        """
        start_date = start_date or datetime.min
        end_date = end_date or datetime.now()
        
        query = '''
            SELECT 
                interaction_id, user_hash, timestamp, 
                current_directory, target_directory, 
                professional_stage, interaction_type, 
                interaction_duration, interaction_score, 
                context_metadata
            FROM user_interactions
            WHERE timestamp BETWEEN ? AND ?
        '''
        
        params = [start_date.isoformat(), end_date.isoformat()]
        
        if professional_stages:
            query += ' AND professional_stage IN ({})'.format(
                ','.join(['?'] * len(professional_stages))
            )
            params.extend(professional_stages)
        
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            
            training_data = []
            for row in cursor.fetchall():
                entry = dict(row)
                entry['context_metadata'] = json.loads(entry['context_metadata'])
                training_data.append(entry)
        
        return training_data
    
    def export_training_data(
        self, 
        output_path: Optional[str] = None, 
        format: str = 'json'
    ):
        """
        Export training data to specified format
        
        Args:
            output_path: Optional custom output path
            format: Export format (json or csv)
        """
        training_data = self.get_training_data()
        
        if not output_path:
            output_path = os.path.join(
                self.data_storage_path, 
                f'training_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
            )
        
        if format == 'json':
            with open(f'{output_path}.json', 'w') as f:
                json.dump(training_data, f, indent=2)
        elif format == 'csv':
            import csv
            with open(f'{output_path}.csv', 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=training_data[0].keys())
                writer.writeheader()
                writer.writerows(training_data)
        
        print(f"🗂️ Training data exported to {output_path}")

def main():
    """
    Demonstration of Training Data Collection Mechanism
    """
    print("🌐 Port Townsend Professional Resource Library - Training Data Collector")
    
    # Initialize collector
    collector = TrainingDataCollector()
    
    # Simulate user interactions
    interaction_scenarios = [
        {
            "user_identifier": "user_001",
            "current_directory": "04_Quick_Start_Guides",
            "target_directory": "19_Digital_Marketing",
            "professional_stage": "Entry-Level Professional"
        },
        {
            "user_identifier": "user_002",
            "current_directory": "36_Personal_Development",
            "target_directory": "09_Workflow_Automation",
            "professional_stage": "Mid-Career Professional"
        }
    ]
    
    # Record simulated interactions
    for scenario in interaction_scenarios:
        interaction_id = collector.record_user_interaction(**scenario)
        print(f"📝 Recorded interaction: {interaction_id}")
    
    # Export training data
    collector.export_training_data(format='json')
    collector.export_training_data(format='csv')

if __name__ == "__main__":
    main()
