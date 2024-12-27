import { defineStore } from 'pinia'
import { indexResources, getResourceContent } from '@/utils/resourceIndexer'

export const useResourceStore = defineStore('resources', {
  state: () => ({
    categories: [
      { id: '01', name: 'Welcome Message' },
      { id: '04', name: 'Quick Start Guides' },
      { id: '05', name: 'AI Assistant Tutorials' },
      { id: '09', name: 'Workflow Automation' },
      { id: '36', name: 'Personal Development' }
    ],
    resources: {},
    currentResource: null,
    loading: false,
    error: null
  }),
  getters: {
    getCategoryById: (state) => (id) => {
      return state.categories.find(category => category.id === id)
    }
  },
  actions: {
    async loadResources() {
      try {
        this.loading = true
        // Use the indexResources function to get predefined resources
        this.resources = indexResources()
      } catch (error) {
        this.error = 'Failed to load resources'
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async loadResourceContent(resourcePath) {
      try {
        return getResourceContent(resourcePath)
      } catch (error) {
        this.error = 'Failed to load resource content'
        console.error(error)
        return null
      }
    }
  }
})
