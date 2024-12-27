import fs from 'fs'
import path from 'path'

export function indexResources() {
  const resourceTypes = ['guides', 'tutorials']
  const indexedResources = {}

  const resourceMap = {
    'guides': [
      { 
        id: 'startup-basics', 
        title: 'Startup Basics: From Idea to Execution', 
        type: 'guides',
        categoryId: '01',
        path: '/resources/guides/startup-basics.md'
      }
    ],
    'tutorials': [
      { 
        id: 'vue-basics', 
        title: 'Vue.js Basics: Building Your First Application', 
        type: 'tutorials',
        categoryId: '05',
        path: '/resources/tutorials/vue-basics.md'
      }
    ]
  }

  resourceTypes.forEach(type => {
    indexedResources[type] = resourceMap[type]
  })

  return indexedResources
}

export function getResourceContent(resourcePath) {
  const resourceContents = {
    '/resources/guides/startup-basics.md': 
      `# Startup Basics: From Idea to Execution

## Overview
Starting a startup is an exciting journey that requires careful planning, resilience, and strategic thinking. This guide will walk you through the fundamental steps of transforming your innovative idea into a successful business.

## Key Stages of Startup Development

### 1. Ideation
- Identify a problem that needs solving
- Validate your solution's market potential
- Conduct initial market research

### 2. Business Planning
- Develop a comprehensive business plan
- Define your value proposition
- Create financial projections

### 3. Funding
- Explore funding options (bootstrapping, angel investors, venture capital)
- Prepare a compelling pitch deck
- Understand equity and investment terms

### 4. Product Development
- Build a minimum viable product (MVP)
- Iterate based on user feedback
- Focus on solving core user problems

### 5. Growth and Scaling
- Develop a marketing strategy
- Build a strong team
- Continuously adapt and pivot

## Recommended Resources
- [Lean Startup by Eric Ries](https://theleanstartup.com/)
- [Y Combinator Startup Library](https://www.ycombinator.com/library)
- [Startup School by Y Combinator](https://www.startupschool.org/)

## Conclusion
Success in startups is not about perfection, but about continuous learning, adaptation, and perseverance.`,
    '/resources/tutorials/vue-basics.md':
      `# Vue.js Basics: Building Your First Application

## Overview
Vue.js is a progressive JavaScript framework for building user interfaces. This tutorial will guide you through creating a simple Vue application from scratch.

## Prerequisites
- Basic JavaScript knowledge
- Node.js installed (version 14+)
- npm or yarn package manager

## Setting Up Your Development Environment

### 1. Install Vue CLI
\`\`\`bash
npm install -g @vue/cli
\`\`\`

### 2. Create a New Project
\`\`\`bash
vue create my-first-vue-app
cd my-first-vue-app
npm run serve
\`\`\`

## Core Vue Concepts

### Reactive Data
\`\`\`javascript
export default {
  data() {
    return {
      message: 'Hello Vue!'
    }
  }
}
\`\`\`

### Components and Props
Learn how to create reusable components and pass data between them.

### Vue Router
Implement client-side routing to create a single-page application.

## Best Practices
- Keep components small and focused
- Use computed properties and methods effectively
- Leverage Vue's reactivity system

## Conclusion
Vue.js provides a powerful and intuitive way to build modern web applications.`
  }

  return resourceContents[resourcePath] || ''
}
