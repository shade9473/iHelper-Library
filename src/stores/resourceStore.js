import { defineStore } from 'pinia'
import { indexResources, getResourceContent, searchResources } from '@/utils/resourceIndexer'

export const useResourceStore = defineStore('resources', {
  state: () => ({
    categories: [
      { 
        id: '01', 
        name: 'Welcome Message', 
        description: 'Introductory resources and onboarding materials',
        icon: 'welcome'
      },
      { 
        id: '04', 
        name: 'Quick Start Guides', 
        description: 'Rapid learning paths for key skills',
        icon: 'rocket'
      },
      { 
        id: '05', 
        name: 'AI Assistant Tutorials', 
        description: 'Advanced AI and assistant technology guides',
        icon: 'robot'
      },
      { 
        id: '09', 
        name: 'Workflow Automation', 
        description: 'Strategies and tools for efficient work processes',
        icon: 'automation'
      },
      { 
        id: '36', 
        name: 'Personal Development', 
        description: 'Resources for personal growth and skill enhancement',
        icon: 'growth'
      }
    ],
    resources: {},
    currentResource: null,
    loading: false,
    error: null,
    searchResults: [],
    filters: {
      category: null,
      tags: [],
      difficulty: null
    }
  }),
  getters: {
    getCategoryById: (state) => (id) => {
      return state.categories.find(category => category.id === id)
    },
    getResourcesByCategory: (state) => (categoryId) => {
      return Object.values(state.resources)
        .filter(resource => resource.categoryId === categoryId)
    },
    filteredResources: (state) => {
      return Object.values(state.resources).filter(resource => {
        const categoryMatch = !state.filters.category || 
          resource.categoryId === state.filters.category
        
        const tagMatch = state.filters.tags.length === 0 || 
          state.filters.tags.some(tag => resource.tags.includes(tag))
        
        const difficultyMatch = !state.filters.difficulty || 
          resource.difficulty === state.filters.difficulty
        
        return categoryMatch && tagMatch && difficultyMatch
      })
    }
  },
  actions: {
    async loadResources() {
      try {
        this.loading = true
        this.resources = indexResources()
        console.log('Resources loaded:', Object.keys(this.resources).length)
      } catch (error) {
        this.error = 'Failed to load resources'
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async loadResourceContent(resourcePath) {
      try {
        const content = await getResourceContent(resourcePath)
        this.currentResource = content
        return content
      } catch (error) {
        this.error = 'Failed to load resource content'
        console.error(error)
        return null
      }
    },
    async performSearch(query) {
      try {
        this.loading = true
        this.searchResults = searchResources(query)
      } catch (error) {
        this.error = 'Search failed'
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },
    resetFilters() {
      this.filters = {
        category: null,
        tags: [],
        difficulty: null
      }
    }
  }
})
