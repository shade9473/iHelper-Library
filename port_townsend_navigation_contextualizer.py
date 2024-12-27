import os
import json
import re
from typing import Dict, List, Any

class PortTownsendNavigationContextualizer:
    """
    Port Townsend Economic Landscape Navigation Contextualizer
    
    Design Philosophy: Practical, locally-aligned resource navigation
    Core Objective: Integrate local economic nuances into navigation
    """
    
    def __init__(self, root_directory: str = None):
        """
        Initialize Port Townsend Navigation Contextualizer
        
        Args:
            root_directory: Root directory of the resource library
        """
        self.root_directory = root_directory or os.path.dirname(os.path.abspath(__file__))
        
        # Local economic context keywords and themes
        self.local_economic_themes = {
            "maritime_economy": [
                "marine resources", "fishing", "boat building", 
                "maritime services", "coastal tourism"
            ],
            "creative_economy": [
                "arts", "crafts", "creative industries", 
                "cultural entrepreneurship", "design"
            ],
            "sustainable_development": [
                "green economy", "renewable energy", "environmental conservation", 
                "sustainable business", "eco-tourism"
            ],
            "small_business_ecosystem": [
                "local entrepreneurship", "small business support", 
                "startup resources", "business networking"
            ],
            "technology_adaptation": [
                "digital skills", "remote work", "tech integration", 
                "innovation", "digital transformation"
            ]
        }
    
    def analyze_local_economic_context(self) -> Dict[str, Any]:
        """
        Analyze and map local economic context to navigation structure
        
        Returns:
            Local economic context mapping
        """
        economic_context_mapping = {
            "themes": self.local_economic_themes,
            "directory_economic_alignment": {},
            "navigation_economic_insights": {}
        }
        
        # Analyze directory structure for economic theme alignment
        for root, dirs, files in os.walk(self.root_directory):
            relative_path = os.path.relpath(root, self.root_directory)
            path_components = relative_path.split(os.sep)
            
            if 1 <= len(path_components) <= 2 and path_components[0] != '.':
                directory_name = path_components[-1].lower()
                
                # Identify economic theme alignment
                aligned_themes = []
                for theme, keywords in self.local_economic_themes.items():
                    if any(keyword in directory_name for keyword in keywords):
                        aligned_themes.append(theme)
                
                if aligned_themes:
                    economic_context_mapping["directory_economic_alignment"][directory_name] = {
                        "aligned_themes": aligned_themes,
                        "files": [f for f in files if f.endswith('.md') or f.endswith('.html')]
                    }
        
        # Generate navigation economic insights
        economic_context_mapping["navigation_economic_insights"] = self._generate_economic_navigation_insights(
            economic_context_mapping["directory_economic_alignment"]
        )
        
        return economic_context_mapping
    
    def _generate_economic_navigation_insights(self, directory_alignment: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Generate economic navigation insights and connections
        
        Args:
            directory_alignment: Existing directory economic alignment
        
        Returns:
            Economic navigation insights
        """
        economic_navigation_insights = {}
        
        # Define economic theme connection rules
        theme_connection_rules = {
            "maritime_economy": ["small_business_ecosystem", "sustainable_development"],
            "creative_economy": ["small_business_ecosystem", "technology_adaptation"],
            "sustainable_development": ["maritime_economy", "technology_adaptation"],
            "small_business_ecosystem": ["creative_economy", "technology_adaptation"],
            "technology_adaptation": ["sustainable_development", "creative_economy"]
        }
        
        for directory, details in directory_alignment.items():
            aligned_themes = details.get("aligned_themes", [])
            
            # Find connected economic themes
            connected_themes = []
            for theme in aligned_themes:
                connected_themes.extend(
                    theme_connection_rules.get(theme, [])
                )
            
            economic_navigation_insights[directory] = list(set(connected_themes))
        
        return economic_navigation_insights
    
    def generate_economic_navigation_metadata(self) -> Dict[str, Any]:
        """
        Generate comprehensive economic navigation metadata
        
        Returns:
            Economic navigation metadata
        """
        economic_context = self.analyze_local_economic_context()
        
        economic_navigation_metadata = {
            "local_economic_themes": self.local_economic_themes,
            "directory_economic_alignment": economic_context["directory_economic_alignment"],
            "navigation_economic_insights": economic_context["navigation_economic_insights"]
        }
        
        return economic_navigation_metadata
    
    def save_economic_navigation_metadata(self, metadata: Dict[str, Any]) -> str:
        """
        Save economic navigation metadata to a JSON file
        
        Args:
            metadata: Economic navigation metadata dictionary
        
        Returns:
            Path to saved metadata file
        """
        metadata_path = os.path.join(self.root_directory, 'PORT_TOWNSEND_ECONOMIC_NAVIGATION_METADATA.json')
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ Port Townsend Economic Navigation Metadata Generated: {metadata_path}")
        return metadata_path

def main():
    """
    Demonstration of Port Townsend Navigation Contextualizer
    """
    print("🌊 Port Townsend Professional Resource Library - Economic Navigation Contextualizer")
    
    # Initialize and execute economic navigation contextualization
    navigation_contextualizer = PortTownsendNavigationContextualizer()
    economic_navigation_metadata = navigation_contextualizer.generate_economic_navigation_metadata()
    
    # Save metadata
    navigation_contextualizer.save_economic_navigation_metadata(economic_navigation_metadata)
    
    # Print key insights
    print("\n🔍 Economic Navigation Insights:")
    print(f"Total Economic Themes: {len(economic_navigation_metadata['local_economic_themes'])}")
    print(f"Directories Economically Aligned: {len(economic_navigation_metadata['directory_economic_alignment'])}")
    print(f"Economic Navigation Connections: {len(economic_navigation_metadata['navigation_economic_insights'])}")

if __name__ == "__main__":
    main()
