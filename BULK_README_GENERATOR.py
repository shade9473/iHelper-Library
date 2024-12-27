import os
import re

def sanitize_directory_name(dir_name):
    """Convert directory name to a readable title."""
    # Remove numbers and underscores, capitalize words
    return ' '.join(re.sub(r'^\d+_', '', dir_name).split('_'))

def generate_readme(directory_path):
    """Generate a README.md file for a given directory."""
    dir_name = os.path.basename(directory_path)
    title = sanitize_directory_name(dir_name)
    
    readme_content = f"""# {title}: Comprehensive Resource Guide

## Port Townsend Economic Context 🌊
**Local Focus**: {title} in Port Townsend's Dynamic Professional Landscape
- Population: ~10,000
- Key Economic Characteristics:
  * Adaptable small-market professional ecosystem
  * Strong community-driven learning networks
  * Low-overhead skill development opportunities

## Overview 🎯
A comprehensive, locally-tailored resource guide for Port Townsend professionals seeking to excel in {title.lower()} through targeted, context-aware strategies.

## Key Features 💡
- Detailed, actionable resources
- Step-by-step implementation guides
- Best practices and industry standards
- Practical tips and recommendations
- **Local Optimization**: Strategies aligned with Port Townsend's economic dynamics

## Unique Local Challenges 🚧
### {title}-Specific Considerations
- Limited traditional professional infrastructure
- High dependency on adaptive skill sets
- Need for cost-effective professional development
- Strategies for navigating small-market constraints

## Content Structure 📋
1. **Introduction**
   - Understanding {title} in a small market context
   - Setting development objectives
   - Creating an adaptive professional mindset

2. **Main Content**
   - Comprehensive resource collection
   - Implementation guides
   - Best practice strategies
   - Action planning methods

3. **Resources**
   - Curated resource collection
   - Assessment tools
   - Learning materials
   - Progress tracking mechanisms

## Local Professional Strategies 🌟
### Recommended Approaches
- Leverage community learning networks
- Prioritize transferable skills
- Minimize investment, maximize impact
- Build resilient professional capabilities

## Key Takeaways 🔑
- Adaptability is your primary professional asset
- Community connections drive personal growth
- Continuous learning trumps traditional credentials
- **Thrive in Port Townsend's evolving economic landscape**

## Next Steps 🚀
1. Review available resources
2. Identify personal development goals
3. Connect with local professional networks
4. Implement adaptive learning strategies

## Local Professional Empowerment Principles 💪
1. **Flexibility**: Adapt to changing market demands
2. **Community-Driven Learning**: Leverage local knowledge networks
3. **Cost-Effectiveness**: Maximize growth with minimal investment
4. **Holistic Development**: Balance personal and professional growth
5. **Resilience**: Build skills that transcend traditional career paths

## Support and Resources 🤝
- Local mentorship programs
- Community skill-sharing workshops
- Online and in-person learning opportunities
- Port Townsend professional development forums

## Cross-Referencing 🔗
### Related Resources
- [Quick Start Guides](/04_Quick_Start_Guides)
- [Workflow Automation](/09_Workflow_Automation)
- [Digital Marketing](/19_Digital_Marketing)
- [Personal Development](/36_Personal_Development)

---

*Part of the Comprehensive Resource Library - Your Guide to Success in Port Townsend's Dynamic Professional Landscape*

## Metadata
- **Last Updated**: 2024-12-26
- **Version**: 1.0
- **Maintainer**: Comprehensive Resource Library Team"""
    
    readme_path = os.path.join(directory_path, 'README.md')
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    print(f"Generated README for {directory_path}")

def main():
    base_path = r'c:/Users/ihelp/Comprehensive_Resource_Library/Comp_Res_Lib_V2'
    directories_to_process = [
        '01_Welcome_Message', '02_Purpose_of_Library', '03_Navigation_Guide',
        '05_AI_Assistant_Tutorials', '05_Basic_Tutorials', '06_Email_Marketing',
        '07_Social_Media', '08_SEO_Checklists', '10_Blog_Templates',
        '11_Video_Scripts', '12_Graphic_Design', '13_Online_Courses',
        '14_Ebook_Summaries', '15_Professional_Templates', '16_Whitepaper_Summaries',
        '17_AI_Tutorials', '18_AI_Case_Studies', '20_Success_Stories',
        '21_Business_Plans', '22_Networking_Tips', '23_Discussion_Forum',
        '24_AMA_Guidelines', '25_Interview_Frameworks', '26_Monthly_Updates',
        '27_Newsletter_Drafts', '28_Feedback_Forms', '29_Real_Life_Examples',
        '30_Success_Metrics', '31_Prompt_Toolkit', '32_Free_Tools',
        '33_Offer_Templates', '34_Final_Words', '35_Remote_Work',
        '37_Project_Management', '38_Time_Management', '39_Leadership_Skills',
        '40_Feedback_Forms', '41_Interview_Prep', '42_Code_Review',
        '43_System_Design', '44_Documentation', '45_Best_Practices'
    ]
    
    for directory in directories_to_process:
        full_path = os.path.join(base_path, directory)
        generate_readme(full_path)

if __name__ == '__main__':
    main()
