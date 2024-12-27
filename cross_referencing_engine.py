import os
import json
import re
from typing import Dict, List, Any, Optional

class CrossReferencingEngine:
    """
    Intelligent Cross-Referencing Engine for Port Townsend Professional Resource Library
    
    Design Philosophy: Practical, user-centric navigation enhancement
    Core Objective: Create seamless, intuitive resource connections
    """
    
    def __init__(self, root_directory: str = None):
        """
        Initialize Cross-Referencing Engine
        
        Args:
            root_directory: Root directory of the resource library
        """
        self.root_directory = root_directory or os.path.dirname(os.path.abspath(__file__))
        self.cross_reference_map = {}
        self.navigation_categories = [
            "Getting Started",
            "AI & Technology",
            "Business Development",
            "Professional Skills",
            "Career Development",
            "Content & Communication",
            "Community Resources"
        ]
    
    def generate_cross_reference_metadata(self) -> Dict[str, Any]:
        """
        Generate comprehensive cross-referencing metadata
        
        Returns:
            Cross-referencing metadata dictionary
        """
        cross_reference_metadata = {
            "navigation_categories": self.navigation_categories,
            "directory_relationships": {},
            "content_connections": {}
        }
        
        # Analyze directory structure
        for root, dirs, files in os.walk(self.root_directory):
            # Skip hidden directories and specific system directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['__pycache__', '.git']]
            
            # Process only tier 1 and tier 2 directories
            relative_path = os.path.relpath(root, self.root_directory)
            path_components = relative_path.split(os.sep)
            
            if 1 <= len(path_components) <= 2 and path_components[0] != '.':
                directory_name = path_components[-1]
                
                # Categorize directories
                for category in self.navigation_categories:
                    if any(keyword.lower() in directory_name.lower() for keyword in category.split()):
                        cross_reference_metadata["directory_relationships"][directory_name] = {
                            "primary_category": category,
                            "files": [f for f in files if f.endswith('.md') or f.endswith('.html')],
                            "subdirectories": dirs
                        }
                        break
        
        # Generate content connections
        cross_reference_metadata["content_connections"] = self._generate_content_connections(
            cross_reference_metadata["directory_relationships"]
        )
        
        return cross_reference_metadata
    
    def _generate_content_connections(self, directory_relationships: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Generate intelligent content connections between directories
        
        Args:
            directory_relationships: Existing directory relationships
        
        Returns:
            Dictionary of content connections
        """
        content_connections = {}
        
        # Define connection rules based on professional growth and thematic similarity
        connection_rules = {
            "Getting Started": ["Quick Start Guides", "Personal Development"],
            "AI & Technology": ["AI Tutorials", "Prompt Toolkit", "Digital Marketing"],
            "Business Development": ["Networking Tips", "Success Metrics", "Digital Marketing"],
            "Professional Skills": ["Project Management", "Time Management", "Leadership Skills"],
            "Career Development": ["Interview Frameworks", "Code Review", "Best Practices"],
            "Content & Communication": ["Blog Templates", "Newsletter Drafts", "Video Scripts"],
            "Community Resources": ["Discussion Forum", "Feedback Forms", "Remote Work"]
        }
        
        for directory, details in directory_relationships.items():
            primary_category = details.get("primary_category", "")
            
            # Find connected directories
            connected_dirs = connection_rules.get(primary_category, [])
            content_connections[directory] = [
                dir_name for dir_name, dir_details in directory_relationships.items()
                if dir_details.get("primary_category") in connected_dirs
            ]
        
        return content_connections
    
    def generate_navigation_graph(self) -> Dict[str, Any]:
        """
        Generate a comprehensive navigation graph
        
        Returns:
            Navigation graph with hierarchical and thematic connections
        """
        cross_reference_metadata = self.generate_cross_reference_metadata()
        
        navigation_graph = {
            "hierarchical_structure": {},
            "thematic_connections": cross_reference_metadata["content_connections"]
        }
        
        # Build hierarchical structure
        for directory, details in cross_reference_metadata["directory_relationships"].items():
            navigation_graph["hierarchical_structure"][directory] = {
                "category": details.get("primary_category"),
                "files": details.get("files", []),
                "subdirectories": details.get("subdirectories", [])
            }
        
        return navigation_graph
    
    def save_cross_reference_metadata(self, metadata: Dict[str, Any]) -> str:
        """
        Save cross-referencing metadata to a JSON file
        
        Args:
            metadata: Cross-referencing metadata dictionary
        
        Returns:
            Path to saved metadata file
        """
        metadata_path = os.path.join(self.root_directory, 'CROSS_REFERENCING_METADATA.json')
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ Cross-Referencing Metadata Generated: {metadata_path}")
        return metadata_path

def main():
    """
    Demonstration of Cross-Referencing Engine
    """
    print("🌐 Port Townsend Professional Resource Library - Cross-Referencing Engine")
    
    # Initialize and execute cross-referencing
    cross_ref_engine = CrossReferencingEngine()
    cross_reference_metadata = cross_ref_engine.generate_cross_reference_metadata()
    navigation_graph = cross_ref_engine.generate_navigation_graph()
    
    # Save metadata
    cross_ref_engine.save_cross_reference_metadata(cross_reference_metadata)
    
    # Print key insights
    print("\n🔍 Navigation Insights:")
    print(f"Total Categories: {len(cross_reference_metadata['navigation_categories'])}")
    print(f"Directories Mapped: {len(cross_reference_metadata['directory_relationships'])}")
    print(f"Content Connections: {len(cross_reference_metadata['content_connections'])}")

if __name__ == "__main__":
    main()
