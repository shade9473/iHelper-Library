import json
import os
from typing import Dict, List, Any

class CrossReferencingEngine:
    def __init__(self, metadata_path: str):
        """
        Initialize the Cross-Referencing Engine for Port Townsend Professional Resource Library
        
        Local Economic Context: Adaptive, community-driven knowledge navigation
        Design Philosophy: Maximize skill transferability, minimize resource investment
        """
        self.metadata_path = metadata_path
        self.metadata = self._load_metadata()
        
    def _load_metadata(self) -> Dict[str, Any]:
        """
        Load cross-referencing metadata with error handling
        
        Ensures robust metadata loading and provides meaningful feedback
        """
        try:
            with open(self.metadata_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ Metadata file not found: {self.metadata_path}")
            return {}
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON in metadata file: {self.metadata_path}")
            return {}
    
    def get_recommended_resources(self, current_directory: str, professional_stage: str = None) -> List[str]:
        """
        Generate contextually relevant resource recommendations
        
        Args:
            current_directory: Current navigation context
            professional_stage: Optional professional growth stage
        
        Returns:
            List of recommended resource directories
        """
        recommendations = []
        
        # Direct connections from metadata
        if current_directory in self.metadata.get('directory_relationships', {}):
            direct_connections = self.metadata['directory_relationships'][current_directory].get('primary_connections', [])
            recommendations.extend(direct_connections)
        
        # Professional growth pathway recommendations
        if professional_stage:
            pathway = self.metadata.get('professional_growth_pathways', {}).get(professional_stage, {})
            recommended_resources = pathway.get('recommended_resources', [])
            recommendations.extend(recommended_resources)
        
        # Remove duplicates and current directory
        recommendations = list(set(recommendations) - {current_directory})
        
        return recommendations
    
    def generate_breadcrumb(self, current_directory: str) -> List[Dict[str, str]]:
        """
        Generate contextual breadcrumb navigation with local economic insights
        
        Args:
            current_directory: Current navigation context
        
        Returns:
            Breadcrumb navigation with local context
        """
        breadcrumb = [
            {
                "name": current_directory.replace('_', ' ').title(),
                "path": f"/{current_directory}",
                "context": self._get_directory_context(current_directory)
            }
        ]
        return breadcrumb
    
    def _get_directory_context(self, directory: str) -> str:
        """
        Extract local economic context for a specific directory
        
        Provides micro-insights into professional development context
        """
        context_map = {
            "04_Quick_Start_Guides": "Entry-level skill acceleration in Port Townsend's adaptive economy",
            "09_Workflow_Automation": "Digital collaboration strategies for local professionals",
            "19_Digital_Marketing": "Community-driven marketing for Port Townsend businesses",
            "36_Personal_Development": "Holistic professional growth in a dynamic local ecosystem"
        }
        return context_map.get(directory, "Professional resource navigation")
    
    def analyze_interconnections(self) -> Dict[str, Any]:
        """
        Comprehensive analysis of resource interconnections
        
        Provides insights into the resource library's structural relationships
        """
        interconnection_analysis = {
            "total_directories": len(self.metadata.get('directory_relationships', {})),
            "professional_pathways": list(self.metadata.get('professional_growth_pathways', {}).keys()),
            "cross_referencing_rules": self.metadata.get('cross_referencing_rules', {})
        }
        return interconnection_analysis

def main():
    """
    Demonstration of Cross-Referencing Engine capabilities
    
    Showcases the adaptive, context-aware navigation system
    """
    metadata_path = os.path.join(os.path.dirname(__file__), 'CROSS_REFERENCING_METADATA.json')
    engine = CrossReferencingEngine(metadata_path)
    
    # Example usage scenarios
    print("🌐 Port Townsend Professional Resource Library - Cross-Referencing Prototype")
    
    # Scenario 1: Recommendations for Quick Start Guides
    quick_start_recommendations = engine.get_recommended_resources(
        "04_Quick_Start_Guides", 
        professional_stage="Entry-Level Professional"
    )
    print("\n📘 Quick Start Guides Recommendations:")
    for resource in quick_start_recommendations:
        print(f"  → {resource}")
    
    # Scenario 2: Breadcrumb for Digital Marketing
    digital_marketing_breadcrumb = engine.generate_breadcrumb("19_Digital_Marketing")
    print("\n🗺️ Digital Marketing Breadcrumb:")
    for crumb in digital_marketing_breadcrumb:
        print(f"  → {crumb['name']} (Context: {crumb['context']})")
    
    # Scenario 3: Interconnection Analysis
    interconnection_insights = engine.analyze_interconnections()
    print("\n🔍 Interconnection Analysis:")
    print(f"  Total Directories: {interconnection_insights['total_directories']}")
    print(f"  Professional Pathways: {', '.join(interconnection_insights['professional_pathways'])}")

if __name__ == "__main__":
    main()
