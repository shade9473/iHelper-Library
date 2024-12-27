import json
import os
import math
from typing import Dict, List, Any, Tuple

class RecommendationScoringEngine:
    """
    Advanced Recommendation Scoring Engine for Port Townsend Professional Resource Library
    
    Design Philosophy: Adaptive, context-aware resource recommendation
    Local Economic Context: Maximize professional growth, minimize resource investment
    """
    
    def __init__(self, metadata_path: str):
        """
        Initialize recommendation scoring engine
        
        Args:
            metadata_path: Path to cross-referencing metadata
        """
        self.metadata = self._load_metadata(metadata_path)
        self.scoring_weights = {
            "direct_connection": 0.4,
            "context_similarity": 0.3,
            "professional_pathway_alignment": 0.2,
            "local_economic_relevance": 0.1
        }
    
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
    
    def calculate_context_similarity(self, source_dir: str, target_dir: str) -> float:
        """
        Calculate contextual similarity between directories
        
        Args:
            source_dir: Source directory
            target_dir: Target directory
        
        Returns:
            Similarity score (0-1)
        """
        dir_relationships = self.metadata.get('directory_relationships', {})
        
        source_tags = set(dir_relationships.get(source_dir, {}).get('context_tags', []))
        target_tags = set(dir_relationships.get(target_dir, {}).get('context_tags', []))
        
        # Jaccard similarity coefficient
        intersection = len(source_tags.intersection(target_tags))
        union = len(source_tags.union(target_tags))
        
        return intersection / union if union > 0 else 0
    
    def assess_professional_pathway_alignment(self, current_stage: str, target_dir: str) -> float:
        """
        Assess alignment with professional growth pathways
        
        Args:
            current_stage: Current professional stage
            target_dir: Target directory
        
        Returns:
            Pathway alignment score (0-1)
        """
        pathways = self.metadata.get('professional_growth_pathways', {})
        
        for pathway_name, pathway_data in pathways.items():
            if current_stage == pathway_name:
                recommended_resources = set(pathway_data.get('recommended_resources', []))
                return 1.0 if target_dir in recommended_resources else 0.0
        
        return 0.5  # Default neutral score
    
    def evaluate_local_economic_relevance(self, target_dir: str) -> float:
        """
        Evaluate local economic relevance of a directory
        
        Args:
            target_dir: Target directory
        
        Returns:
            Economic relevance score (0-1)
        """
        local_economic_context = self.metadata.get('local_economic_context', {})
        ecosystem_characteristics = local_economic_context.get('port_townsend_professional_ecosystem', {}).get('key_characteristics', [])
        
        # Simple relevance mapping
        relevance_map = {
            "04_Quick_Start_Guides": 0.9,
            "09_Workflow_Automation": 0.8,
            "19_Digital_Marketing": 0.9,
            "36_Personal_Development": 0.7
        }
        
        return relevance_map.get(target_dir, 0.5)
    
    def calculate_recommendation_score(self, current_dir: str, target_dir: str, current_stage: str) -> float:
        """
        Calculate comprehensive recommendation score
        
        Args:
            current_dir: Current directory
            target_dir: Target directory
            current_stage: Current professional stage
        
        Returns:
            Comprehensive recommendation score (0-1)
        """
        # Direct connection score
        dir_relationships = self.metadata.get('directory_relationships', {})
        direct_connections = set(dir_relationships.get(current_dir, {}).get('primary_connections', []))
        direct_connection_score = 1.0 if target_dir in direct_connections else 0.0
        
        # Calculate weighted scores
        context_similarity = self.calculate_context_similarity(current_dir, target_dir)
        pathway_alignment = self.assess_professional_pathway_alignment(current_stage, target_dir)
        economic_relevance = self.evaluate_local_economic_relevance(target_dir)
        
        # Weighted scoring
        total_score = (
            self.scoring_weights['direct_connection'] * direct_connection_score +
            self.scoring_weights['context_similarity'] * context_similarity +
            self.scoring_weights['professional_pathway_alignment'] * pathway_alignment +
            self.scoring_weights['local_economic_relevance'] * economic_relevance
        )
        
        return min(max(total_score, 0), 1)  # Ensure score is between 0 and 1
    
    def generate_recommendations(self, current_dir: str, current_stage: str, max_recommendations: int = 5) -> List[Tuple[str, float]]:
        """
        Generate ranked recommendations
        
        Args:
            current_dir: Current directory
            current_stage: Current professional stage
            max_recommendations: Maximum number of recommendations
        
        Returns:
            List of recommended directories with scores
        """
        all_directories = list(self.metadata.get('directory_relationships', {}).keys())
        
        # Calculate scores for all directories
        recommendations = [
            (dir, self.calculate_recommendation_score(current_dir, dir, current_stage))
            for dir in all_directories if dir != current_dir
        ]
        
        # Sort by score in descending order and limit recommendations
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return recommendations[:max_recommendations]

def main():
    """
    Demonstration of Recommendation Scoring Engine
    """
    metadata_path = os.path.join(os.path.dirname(__file__), 'CROSS_REFERENCING_METADATA.json')
    engine = RecommendationScoringEngine(metadata_path)
    
    print("🌐 Port Townsend Professional Resource Library - Recommendation Scoring Prototype")
    
    # Example recommendation scenarios
    scenarios = [
        ("04_Quick_Start_Guides", "Entry-Level Professional"),
        ("19_Digital_Marketing", "Mid-Career Professional"),
        ("36_Personal_Development", "Leadership Track")
    ]
    
    for current_dir, current_stage in scenarios:
        print(f"\n📘 Recommendations for {current_dir} ({current_stage}):")
        recommendations = engine.generate_recommendations(current_dir, current_stage)
        
        for dir, score in recommendations:
            print(f"  → {dir} (Score: {score:.2f})")

if __name__ == "__main__":
    main()
