import json
import os
import sys
import unittest
from typing import Dict, List, Any

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from cross_reference_prototype import CrossReferencingEngine

class CrossReferencingValidator:
    """
    Comprehensive validation framework for Port Townsend Professional Resource Library
    
    Design Philosophy: Rigorous testing to ensure navigation system reliability and effectiveness
    Local Economic Context: Adaptive validation that reflects Port Townsend's dynamic professional ecosystem
    """
    
    def __init__(self, metadata_path: str):
        """
        Initialize validator with cross-referencing metadata
        
        Args:
            metadata_path: Path to cross-referencing metadata JSON
        """
        self.engine = CrossReferencingEngine(metadata_path)
        self.validation_report = {
            "timestamp": "2024-12-26T22:21:36-08:00",
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "test_results": []
        }
    
    def validate_resource_recommendations(self) -> bool:
        """
        Validate resource recommendation logic
        
        Ensures recommendations are contextually relevant and diverse
        
        Returns:
            Boolean indicating overall recommendation validation status
        """
        test_cases = [
            {
                "directory": "04_Quick_Start_Guides",
                "professional_stage": "Entry-Level Professional",
                "expected_min_recommendations": 2,
                "expected_max_recommendations": 5
            },
            {
                "directory": "19_Digital_Marketing",
                "professional_stage": "Mid-Career Professional",
                "expected_min_recommendations": 2,
                "expected_max_recommendations": 5
            }
        ]
        
        test_passed = True
        
        for case in test_cases:
            recommendations = self.engine.get_recommended_resources(
                case["directory"], 
                case["professional_stage"]
            )
            
            # Validate recommendation count
            recommendation_count = len(recommendations)
            if not (case["expected_min_recommendations"] <= recommendation_count <= case["expected_max_recommendations"]):
                print(f"❌ Recommendation Test Failed for {case['directory']}")
                print(f"   Expected: {case['expected_min_recommendations']}-{case['expected_max_recommendations']} recommendations")
                print(f"   Actual: {recommendation_count} recommendations")
                test_passed = False
            else:
                print(f"✅ Recommendation Test Passed for {case['directory']}")
        
        return test_passed
    
    def validate_breadcrumb_generation(self) -> bool:
        """
        Validate breadcrumb navigation generation
        
        Ensures breadcrumbs provide meaningful context and navigation support
        
        Returns:
            Boolean indicating breadcrumb validation status
        """
        test_directories = [
            "04_Quick_Start_Guides",
            "19_Digital_Marketing",
            "36_Personal_Development"
        ]
        
        test_passed = True
        
        for directory in test_directories:
            breadcrumbs = self.engine.generate_breadcrumb(directory)
            
            # Validate breadcrumb structure
            if not breadcrumbs or len(breadcrumbs) != 1:
                print(f"❌ Breadcrumb Test Failed for {directory}")
                print("   Invalid breadcrumb generation")
                test_passed = False
            else:
                breadcrumb = breadcrumbs[0]
                
                # Validate breadcrumb components
                if not all([
                    breadcrumb.get('name'),
                    breadcrumb.get('path'),
                    breadcrumb.get('context')
                ]):
                    print(f"❌ Breadcrumb Test Failed for {directory}")
                    print("   Missing breadcrumb components")
                    test_passed = False
                else:
                    print(f"✅ Breadcrumb Test Passed for {directory}")
        
        return test_passed
    
    def validate_interconnection_analysis(self) -> bool:
        """
        Validate resource interconnection analysis
        
        Ensures comprehensive mapping of resource relationships
        
        Returns:
            Boolean indicating interconnection analysis validation status
        """
        interconnection_analysis = self.engine.analyze_interconnections()
        
        validation_criteria = {
            "minimum_directories": 5,
            "minimum_professional_pathways": 3,
            "required_cross_referencing_rules": [
                "linking_criteria",
                "recommendation_weights"
            ]
        }
        
        test_passed = True
        
        # Validate directory count
        if interconnection_analysis.get('total_directories', 0) < validation_criteria['minimum_directories']:
            print("❌ Interconnection Analysis Failed: Insufficient directories")
            test_passed = False
        
        # Validate professional pathways
        professional_pathways = interconnection_analysis.get('professional_pathways', [])
        if len(professional_pathways) < validation_criteria['minimum_professional_pathways']:
            print("❌ Interconnection Analysis Failed: Insufficient professional pathways")
            test_passed = False
        
        # Validate cross-referencing rules
        cross_referencing_rules = interconnection_analysis.get('cross_referencing_rules', {})
        for rule in validation_criteria['required_cross_referencing_rules']:
            if rule not in cross_referencing_rules:
                print(f"❌ Interconnection Analysis Failed: Missing {rule}")
                test_passed = False
        
        if test_passed:
            print("✅ Interconnection Analysis Passed")
        
        return test_passed
    
    def run_comprehensive_validation(self) -> Dict[str, Any]:
        """
        Execute comprehensive validation of cross-referencing system
        
        Performs multiple validation checks and generates a detailed report
        
        Returns:
            Validation report with test results and overall status
        """
        print("\n🔍 Port Townsend Professional Resource Library - Validation Report")
        
        validation_checks = [
            ("Resource Recommendations", self.validate_resource_recommendations),
            ("Breadcrumb Navigation", self.validate_breadcrumb_generation),
            ("Interconnection Analysis", self.validate_interconnection_analysis)
        ]
        
        overall_passed = True
        
        for check_name, validation_func in validation_checks:
            print(f"\n📋 Validating: {check_name}")
            check_result = validation_func()
            
            self.validation_report['total_tests'] += 1
            if check_result:
                self.validation_report['passed_tests'] += 1
            else:
                self.validation_report['failed_tests'] += 1
                overall_passed = False
            
            self.validation_report['test_results'].append({
                "check_name": check_name,
                "passed": check_result
            })
        
        # Generate final validation status
        self.validation_report['overall_status'] = "PASSED" if overall_passed else "FAILED"
        
        # Save validation report
        report_path = os.path.join(os.path.dirname(__file__), 'VALIDATION_REPORT.json')
        with open(report_path, 'w') as f:
            json.dump(self.validation_report, f, indent=2)
        
        print("\n📊 Validation Summary:")
        print(f"Total Tests: {self.validation_report['total_tests']}")
        print(f"Passed Tests: {self.validation_report['passed_tests']}")
        print(f"Failed Tests: {self.validation_report['failed_tests']}")
        print(f"Overall Status: {self.validation_report['overall_status']}")
        
        return self.validation_report

def main():
    """
    Main execution point for cross-referencing system validation
    """
    metadata_path = os.path.join(os.path.dirname(__file__), 'CROSS_REFERENCING_METADATA.json')
    validator = CrossReferencingValidator(metadata_path)
    validator.run_comprehensive_validation()

if __name__ == "__main__":
    main()
