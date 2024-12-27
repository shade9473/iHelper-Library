import fs from 'fs'
import path from 'path'

export function indexResources(baseDir) {
  const resourceTypes = ['guides', 'tutorials']
  const indexedResources = {}

  resourceTypes.forEach(type => {
    // In browser, we'll use a predefined list of resources
    const resourceMap = {
      'guides': [
        { id: 'startup-basics', title: 'Startup Basics: From Idea to Execution', type: 'guides' }
      ],
      'tutorials': [
        { id: 'vue-basics', title: 'Vue.js Basics: Building Your First Application', type: 'tutorials' }
      ]
    }

    indexedResources[type] = resourceMap[type]
  })

  return indexedResources
}

export function getResourceContent(resourcePath) {
  // In browser, we'll use a simple mapping
  const resourceContents = {
    'c:/Users/ihelp/Comprehensive_Resource_Library/Comp_Res_Lib_V2/resources/guides/startup-basics.md': 
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
    'c:/Users/ihelp/Comprehensive_Resource_Library/Comp_Res_Lib_V2/resources/tutorials/vue-basics.md':
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

### Components
\`\`\`vue
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: ['message']
}
</script>
\`\`\`

### Methods and Event Handling
\`\`\`vue
<template>
  <button @click="incrementCounter">Click me</button>
  <p>Counter: {{ count }}</p>
</template>

<script>
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    incrementCounter() {
      this.count++
    }
  }
}
</script>
\`\`\`

## Best Practices
- Use composition API for complex components
- Keep components small and focused
- Leverage Vue's reactivity system
- Use TypeScript for larger projects

## Recommended Resources
- [Official Vue Documentation](https://vuejs.org/)
- [Vue Mastery Free Courses](https://www.vuemastery.com/)
- [Vue.js Fundamentals on Frontend Masters](https://frontendmasters.com/)`
  }

  return resourceContents[resourcePath] || ''
}
