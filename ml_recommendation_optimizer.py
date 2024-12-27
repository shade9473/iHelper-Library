import json
import os
import numpy as np
from typing import Dict, List, Any, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import mean_squared_error, r2_score

class MLRecommendationOptimizer:
    """
    Machine Learning Recommendation Optimization Engine
    
    Design Philosophy: Adaptive, intelligent resource recommendation
    Local Economic Context: Maximize professional growth, minimize resource investment
    """
    
    def __init__(self, metadata_path: str, training_data_path: str = None):
        """
        Initialize ML Recommendation Optimizer
        
        Args:
            metadata_path: Path to cross-referencing metadata
            training_data_path: Optional path to historical interaction data
        """
        self.metadata = self._load_metadata(metadata_path)
        self.training_data = self._load_training_data(training_data_path) if training_data_path else self._generate_synthetic_training_data()
        
        self.model = None
        self.scaler = StandardScaler()
    
    def _load_metadata(self, metadata_path: str) -> Dict[str, Any]:
        """
        Load cross-referencing metadata with robust error handling
        
        Args:
            metadata_path: Path to metadata JSON file
        
        Returns:
            Parsed metadata dictionary
        """
        try:
            with open(metadata_path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"❌ Metadata Loading Error: {e}")
            return {}
    
    def _load_training_data(self, training_data_path: str) -> List[Dict[str, Any]]:
        """
        Load historical interaction data
        
        Args:
            training_data_path: Path to training data JSON
        
        Returns:
            List of training data entries
        """
        try:
            with open(training_data_path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            print("❌ Training data not found. Generating synthetic data.")
            return self._generate_synthetic_training_data()
    
    def _generate_synthetic_training_data(self) -> List[Dict[str, Any]]:
        """
        Generate synthetic training data for model initialization
        
        Returns:
            List of synthetic training data entries
        """
        synthetic_data = []
        directories = list(self.metadata.get('directory_relationships', {}).keys())
        professional_stages = list(self.metadata.get('professional_growth_pathways', {}).keys())
        
        np.random.seed(42)  # Ensure reproducibility
        
        for _ in range(1000):  # Generate 1000 synthetic interactions
            current_dir = np.random.choice(directories)
            target_dir = np.random.choice([d for d in directories if d != current_dir])
            current_stage = np.random.choice(professional_stages)
            
            # Simulate interaction score (0-1)
            interaction_score = np.random.random()
            
            synthetic_data.append({
                "current_directory": current_dir,
                "target_directory": target_dir,
                "current_stage": current_stage,
                "interaction_score": interaction_score
            })
        
        return synthetic_data
    
    def prepare_training_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare training data for machine learning model
        
        Returns:
            Tuple of feature matrix and target vector
        """
        # Extract features
        features = []
        targets = []
        
        for entry in self.training_data:
            # Feature engineering
            feature_vector = [
                self._encode_directory(entry['current_directory']),
                self._encode_directory(entry['target_directory']),
                self._encode_professional_stage(entry['current_stage'])
            ]
            features.append(feature_vector)
            targets.append(entry['interaction_score'])
        
        # Scale features
        features_scaled = self.scaler.fit_transform(features)
        
        return features_scaled, np.array(targets)
    
    def _encode_directory(self, directory: str) -> float:
        """
        Encode directory as a numerical feature
        
        Args:
            directory: Directory name
        
        Returns:
            Encoded numerical representation
        """
        directories = list(self.metadata.get('directory_relationships', {}).keys())
        return directories.index(directory) / len(directories) if directory in directories else 0.5
    
    def _encode_professional_stage(self, stage: str) -> float:
        """
        Encode professional stage as a numerical feature
        
        Args:
            stage: Professional stage
        
        Returns:
            Encoded numerical representation
        """
        stages = list(self.metadata.get('professional_growth_pathways', {}).keys())
        return stages.index(stage) / len(stages) if stage in stages else 0.5
    
    def train_recommendation_model(self):
        """
        Train neural network for recommendation optimization
        """
        X, y = self.prepare_training_data()
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Initialize and train model
        self.model = MLPRegressor(
            hidden_layer_sizes=(10, 5),  # Two hidden layers
            activation='relu',
            solver='adam',
            max_iter=1000,
            random_state=42
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print("🧠 ML Recommendation Model Performance:")
        print(f"  Mean Squared Error: {mse:.4f}")
        print(f"  R² Score: {r2:.4f}")
    
    def optimize_recommendations(self, current_dir: str, current_stage: str, candidates: List[str]) -> List[Tuple[str, float]]:
        """
        Optimize recommendations using trained ML model
        
        Args:
            current_dir: Current directory
            current_stage: Current professional stage
            candidates: List of candidate directories
        
        Returns:
            Ranked recommendations with ML-optimized scores
        """
        if not self.model:
            self.train_recommendation_model()
        
        optimized_recommendations = []
        
        for target_dir in candidates:
            # Prepare feature vector
            feature_vector = [
                self._encode_directory(current_dir),
                self._encode_directory(target_dir),
                self._encode_professional_stage(current_stage)
            ]
            
            # Scale feature vector
            feature_scaled = self.scaler.transform([feature_vector])
            
            # Predict interaction score
            ml_score = self.model.predict(feature_scaled)[0]
            
            optimized_recommendations.append((target_dir, ml_score))
        
        # Sort recommendations by ML-optimized score
        optimized_recommendations.sort(key=lambda x: x[1], reverse=True)
        
        return optimized_recommendations

def main():
    """
    Demonstration of ML Recommendation Optimization
    """
    metadata_path = os.path.join(os.path.dirname(__file__), 'CROSS_REFERENCING_METADATA.json')
    optimizer = MLRecommendationOptimizer(metadata_path)
    
    print("🌐 Port Townsend Professional Resource Library - ML Recommendation Optimizer")
    
    # Train initial model
    optimizer.train_recommendation_model()
    
    # Example recommendation scenarios
    scenarios = [
        ("04_Quick_Start_Guides", "Entry-Level Professional"),
        ("19_Digital_Marketing", "Mid-Career Professional"),
        ("36_Personal_Development", "Leadership Track")
    ]
    
    for current_dir, current_stage in scenarios:
        print(f"\n📘 ML-Optimized Recommendations for {current_dir} ({current_stage}):")
        
        # Get candidate directories (excluding current directory)
        candidates = [
            dir for dir in optimizer.metadata.get('directory_relationships', {}).keys()
            if dir != current_dir
        ]
        
        recommendations = optimizer.optimize_recommendations(current_dir, current_stage, candidates)
        
        for dir, score in recommendations[:5]:  # Top 5 recommendations
            print(f"  → {dir} (ML Score: {score:.2f})")

if __name__ == "__main__":
    main()
