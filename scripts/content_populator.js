import fs from 'fs/promises';
import path from 'path';

const CONTENT_BASE_PATH = path.resolve(process.cwd(), 'content');

const CONTENT_TEMPLATES = {
  '01_Welcome_Message': [
    {
      filename: 'mission.md',
      content: `---
title: Our Mission
description: The purpose and vision of the iHelper Resource Library
---

# Empowering Entrepreneurs and Learners

The iHelper Resource Library is a community-driven platform dedicated to providing free, high-quality resources for personal and professional growth.

## Our Core Values
- Accessibility
- Continuous Learning
- Community Collaboration`
    },
    {
      filename: 'how_to_use.md',
      content: `---
title: How to Use the Resource Library
description: A guide to navigating and leveraging the iHelper platform
---

# Navigating the Resource Library

## Finding Resources
1. Browse by Category
2. Use the Search Function
3. Check Recently Added Resources`
    }
  ],
  '04_Quick_Start_Guides': [
    {
      filename: 'entrepreneurship_basics.md',
      content: `---
title: Entrepreneurship Fundamentals
description: Essential concepts for aspiring entrepreneurs
---

# Entrepreneurship 101

## Key Concepts
- Identifying Opportunities
- Developing a Business Model
- Understanding Market Validation`
    }
  ],
  '05_AI_Assistant_Tutorials': [
    {
      filename: 'ai_productivity.md',
      content: `---
title: Boosting Productivity with AI
description: Strategies for leveraging AI tools in your workflow
---

# AI-Powered Productivity

## Practical AI Applications
- Task Automation
- Creative Problem Solving
- Efficient Research Techniques`
    }
  ],
  '09_Workflow_Automation': [
    {
      filename: 'intro_to_automation.md',
      content: `---
title: Introduction to Workflow Automation
description: Streamlining processes for maximum efficiency
---

# Workflow Automation Fundamentals

## Why Automate?
- Reduce Repetitive Tasks
- Increase Productivity
- Minimize Human Error`
    }
  ],
  '36_Personal_Development': [
    {
      filename: 'growth_mindset.md',
      content: `---
title: Cultivating a Growth Mindset
description: Strategies for continuous personal and professional development
---

# The Growth Mindset

## Core Principles
- Embrace Challenges
- Learn from Criticism
- Find Inspiration in Others' Success`
    }
  ]
};

async function populateContent() {
  console.log('🌱 Starting Content Population Process');

  for (const [category, resources] of Object.entries(CONTENT_TEMPLATES)) {
    const categoryPath = path.join(CONTENT_BASE_PATH, category);
    
    try {
      // Ensure category directory exists
      await fs.mkdir(categoryPath, { recursive: true });

      // Write resource files
      for (const resource of resources) {
        const filePath = path.join(categoryPath, resource.filename);
        await fs.writeFile(filePath, resource.content);
        console.log(`✅ Created: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error populating ${category}:`, error);
    }
  }

  console.log('🏁 Content Population Complete');
}

// Run population if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateContent().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Content population failed:', error);
    process.exit(1);
  });
}

export default populateContent;
