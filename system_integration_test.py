import os
import sys
import json
import unittest
from typing import Dict, Any, List

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import project modules
from cross_reference_prototype import CrossReferencingEngine
from recommendation_scoring_engine import RecommendationScoringEngine
from ml_recommendation_optimizer import MLRecommendationOptimizer

class SystemIntegrationTestSuite(unittest.TestCase):
    """
    Comprehensive System Integration Test Suite
    
    Design Philosophy: Holistic validation of navigation and recommendation systems
    Local Economic Context: Ensure robust, adaptive resource discovery
    """
    
    @classmethod
    def setUpClass(cls):
        """
        Set up test environment and load necessary configurations
        """
        # Paths to key configuration and metadata files
        cls.project_root = os.path.dirname(os.path.abspath(__file__))
        cls.metadata_path = os.path.join(cls.project_root, 'CROSS_REFERENCING_METADATA.json')
        
        # Load metadata for consistent testing
        with open(cls.metadata_path, 'r') as f:
            cls.metadata = json.load(f)
        
        # Initialize system components
        cls.cross_referencing_engine = CrossReferencingEngine(cls.metadata_path)
        cls.recommendation_scoring_engine = RecommendationScoringEngine(cls.metadata_path)
        cls.ml_recommendation_optimizer = MLRecommendationOptimizer(cls.metadata_path)
    
    def test_metadata_consistency(self):
        """
        Validate consistency across metadata and system components
        """
        # Check metadata loading
        self.assertIsNotNone(self.metadata, "Metadata should be successfully loaded")
        
        # Validate key metadata sections
        required_sections = [
            'directory_relationships',
            'professional_growth_pathways',
            'local_economic_context'
        ]
        
        for section in required_sections:
            self.assertIn(section, self.metadata, f"{section} must exist in metadata")
            self.assertTrue(len(self.metadata[section]) > 0, f"{section} cannot be empty")
    
    def test_cross_referencing_integration(self):
        """
        Test integration of cross-referencing mechanisms
        """
        test_scenarios = [
            ("04_Quick_Start_Guides", "Entry-Level Professional"),
            ("19_Digital_Marketing", "Mid-Career Professional"),
            ("36_Personal_Development", "Leadership Track")
        ]
        
        for current_dir, current_stage in test_scenarios:
            # Test cross-referencing recommendations
            cross_ref_recommendations = self.cross_referencing_engine.get_recommended_resources(
                current_dir, 
                current_stage
            )
            
            # Test recommendation scoring
            scoring_recommendations = self.recommendation_scoring_engine.generate_recommendations(
                current_dir, 
                current_stage
            )
            
            # Test ML optimization
            candidates = [
                dir for dir in self.metadata.get('directory_relationships', {}).keys()
                if dir != current_dir
            ]
            ml_recommendations = self.ml_recommendation_optimizer.optimize_recommendations(
                current_dir, 
                current_stage, 
                candidates
            )
            
            # Validation checks
            self.assertTrue(len(cross_ref_recommendations) > 0, 
                            f"Cross-referencing should generate recommendations for {current_dir}")
            self.assertTrue(len(scoring_recommendations) > 0, 
                            f"Scoring engine should generate recommendations for {current_dir}")
            self.assertTrue(len(ml_recommendations) > 0, 
                            f"ML optimizer should generate recommendations for {current_dir}")
    
    def test_breadcrumb_navigation(self):
        """
        Validate breadcrumb navigation across different directories
        """
        test_directories = [
            "04_Quick_Start_Guides",
            "19_Digital_Marketing", 
            "36_Personal_Development"
        ]
        
        for directory in test_directories:
            breadcrumbs = self.cross_referencing_engine.generate_breadcrumb(directory)
            
            # Validation checks
            self.assertTrue(len(breadcrumbs) > 0, f"Breadcrumb generation failed for {directory}")
            
            for breadcrumb in breadcrumbs:
                self.assertIn('name', breadcrumb, f"Breadcrumb missing name for {directory}")
                self.assertIn('path', breadcrumb, f"Breadcrumb missing path for {directory}")
                self.assertIn('context', breadcrumb, f"Breadcrumb missing context for {directory}")
    
    def test_local_economic_context_integration(self):
        """
        Validate local economic context integration across components
        """
        local_economic_context = self.metadata.get('local_economic_context', {})
        
        # Check key economic context characteristics
        required_characteristics = [
            'port_townsend_professional_ecosystem'
        ]
        
        for characteristic in required_characteristics:
            self.assertIn(characteristic, local_economic_context, 
                          f"Missing {characteristic} in local economic context")
        
        ecosystem = local_economic_context.get('port_townsend_professional_ecosystem', {})
        
        # Validate ecosystem key characteristics
        self.assertTrue(len(ecosystem.get('key_characteristics', [])) > 0, 
                        "Ecosystem must have key characteristics")
        self.assertTrue(len(ecosystem.get('strategic_focus', [])) > 0, 
                        "Ecosystem must have strategic focus")
    
    def test_professional_pathway_mapping(self):
        """
        Validate professional growth pathway mappings
        """
        professional_pathways = self.metadata.get('professional_growth_pathways', {})
        
        # Required pathway characteristics
        required_keys = ['recommended_resources', 'skill_focus']
        
        for pathway_name, pathway_data in professional_pathways.items():
            for key in required_keys:
                self.assertIn(key, pathway_data, 
                              f"Pathway {pathway_name} missing {key}")
                self.assertTrue(len(pathway_data[key]) > 0, 
                                f"Pathway {pathway_name} {key} cannot be empty")

def generate_integration_test_report(test_suite_result):
    """
    Generate comprehensive integration test report
    
    Args:
        test_suite_result: unittest.TestResult object
    """
    report_path = os.path.join(os.path.dirname(__file__), 'SYSTEM_INTEGRATION_TEST_REPORT.json')
    
    test_report = {
        "timestamp": "2024-12-26T22:27:08-08:00",
        "total_tests": test_suite_result.testsRun,
        "passed_tests": test_suite_result.testsRun - len(test_suite_result.failures) - len(test_suite_result.errors),
        "failed_tests": len(test_suite_result.failures) + len(test_suite_result.errors),
        "test_details": {
            "failures": [str(failure) for failure in test_suite_result.failures],
            "errors": [str(error) for error in test_suite_result.errors]
        },
        "overall_status": "PASSED" if len(test_suite_result.failures) + len(test_suite_result.errors) == 0 else "FAILED"
    }
    
    with open(report_path, 'w') as f:
        json.dump(test_report, f, indent=2)
    
    print("\n🔍 System Integration Test Report:")
    print(f"Total Tests: {test_report['total_tests']}")
    print(f"Passed Tests: {test_report['passed_tests']}")
    print(f"Failed Tests: {test_report['failed_tests']}")
    print(f"Overall Status: {test_report['overall_status']}")

def main():
    """
    Execute system integration test suite
    """
    print("🌐 Port Townsend Professional Resource Library - System Integration Test")
    
    # Create test suite
    test_suite = unittest.TestLoader().loadTestsFromTestCase(SystemIntegrationTestSuite)
    
    # Run tests
    test_result = unittest.TextTestRunner(verbosity=2).run(test_suite)
    
    # Generate test report
    generate_integration_test_report(test_result)

if __name__ == "__main__":
    main()
