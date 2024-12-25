import fs from 'fs';
import path from 'path';

class ResourceTemplateGenerator {
    constructor(rootDir) {
        this.rootDir = rootDir;
    }

    generateTemplate(categoryName, templateData) {
        const categoryPath = path.join(this.rootDir, categoryName);
        
        // Ensure category directory exists
        if (!fs.existsSync(categoryPath)) {
            fs.mkdirSync(categoryPath, { recursive: true });
        }

        // Standard template files
        const files = [
            { 
                name: 'overview.md', 
                content: this.generateOverview(categoryName, templateData) 
            },
            { 
                name: 'local_insights.md', 
                content: this.generateLocalInsights(categoryName, templateData) 
            },
            { 
                name: 'practical_guide.md', 
                content: this.generatePracticalGuide(categoryName, templateData) 
            }
        ];

        files.forEach(file => {
            const filePath = path.join(categoryPath, file.name);
            fs.writeFileSync(filePath, file.content);
        });
    }

    generateOverview(categoryName, data) {
        return `# ${categoryName} - Comprehensive Overview

## Purpose
${data.purpose || 'Providing actionable insights for professionals'}

## Key Objectives
${(data.objectives || []).map(obj => `- ${obj}`).join('\n')}

## Local Context (Port Townsend)
Tailored strategies and resources specific to the Port Townsend business ecosystem.
`;
    }

    generateLocalInsights(categoryName, data) {
        return `# Local ${categoryName} Insights for Port Townsend

## Regional Landscape
Unique opportunities and challenges in the Olympic Peninsula business environment.

## Case Studies
1. Local business success story
2. Regional entrepreneurial achievement
3. Community-driven innovation example

## Networking Opportunities
- Local business associations
- Regional professional networks
- Community workshops and events
`;
    }

    generatePracticalGuide(categoryName, data) {
        return `# Practical Guide: ${categoryName}

## Step-by-Step Approach
${(data.steps || []).map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Tools and Resources
- Recommended local tools
- Free resources
- Cost-effective solutions

## Common Challenges and Solutions
${(data.challenges || []).map(challenge => `### ${challenge.title}
${challenge.solution}`).join('\n\n')}
`;
    }

    batchGenerateTemplates() {
        const priorityCategories = [
            '04_Quick_Start_Guides',
            '06_Email_Marketing',
            '09_Workflow_Automation',
            '19_Digital_Marketing',
            '21_Business_Plans',
            '36_Personal_Development',
            '37_Project_Management'
        ];

        priorityCategories.forEach(category => {
            this.generateTemplate(category, {
                purpose: 'Empowering Port Townsend professionals',
                objectives: [
                    'Provide actionable, locally-relevant strategies',
                    'Support regional business growth',
                    'Offer practical, implementable insights'
                ],
                steps: [
                    'Understand local market dynamics',
                    'Identify unique value propositions',
                    'Develop targeted implementation strategy'
                ],
                challenges: [
                    {
                        title: 'Limited Resources',
                        solution: 'Leverage community networks and cost-effective digital tools'
                    },
                    {
                        title: 'Market Competition',
                        solution: 'Focus on niche expertise and local differentiation'
                    }
                ]
            });
        });
    }
}

// Usage
const generator = new ResourceTemplateGenerator('/path/to/resource/directories');
generator.batchGenerateTemplates();

export default ResourceTemplateGenerator;
