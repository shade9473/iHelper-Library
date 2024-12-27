import { defineStore } from 'pinia'
import axios from 'axios'
import { indexResources, getResourceContent } from '@/utils/resourceIndexer'

export const useResourceStore = defineStore('resources', {
  state: () => ({
    categories: [],
    resources: [],
    learningPaths: [],
    skillAssessments: [],
    currentResource: null,
    loading: false,
    error: null
  }),
  getters: {
    getCategoryById: (state) => (id) => {
      return state.categories.find(category => category.id === id)
    },
    getResourcesByCategory: (state) => (categoryId) => {
      return state.resources.filter(resource => resource.categoryId === categoryId)
    },
    getFilteredResources: (state) => (filters) => {
      return state.resources.filter(resource => {
        return Object.entries(filters).every(([key, value]) => resource[key] === value)
      })
    }
  },
  actions: {
    async fetchCategories() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/api/categories')
        this.categories = response.data
      } catch (error) {
        this.error = 'Failed to fetch categories'
        console.error('Categories fetch failed', error)
      } finally {
        this.loading = false
      }
    },
    async fetchResources(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/api/resources', { params })
        this.resources = response.data
      } catch (error) {
        this.error = 'Failed to fetch resources'
        console.error('Resource fetch failed', error)
      } finally {
        this.loading = false
      }
    },
    async fetchResourceById(id) {
      const existingResource = this.resources.find(r => r.id === id)
      if (existingResource) return existingResource

      try {
        const response = await axios.get(`/api/resources/${id}`)
        const resource = response.data
        
        if (!resource) {
          throw new Error(`Resource with id ${id} not found`)
        }
        
        // Optionally add to resources if not already present
        if (!this.resources.some(r => r.id === id)) {
          this.resources.push(resource)
        }
        
        return resource
      } catch (error) {
        this.error = `Failed to fetch resource with id ${id}`
        console.error(this.error, error)
        throw error
      }
    },
    async fetchLearningPaths() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/api/learning-paths')
        this.learningPaths = response.data
      } catch (error) {
        this.error = 'Failed to fetch learning paths'
        console.error('Learning paths fetch failed', error)
      } finally {
        this.loading = false
      }
    },
    async submitSkillAssessment(assessmentData) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post('/api/skill-assessments', assessmentData)
        this.skillAssessments.push(response.data)
        return response.data
      } catch (error) {
        this.error = 'Failed to submit skill assessment'
        console.error('Skill assessment submission failed', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async loadResources() {
      try {
        this.loading = true
        const baseDir = path.resolve(__dirname, '../../resources')
        this.resources = indexResources(baseDir)
      } catch (error) {
        this.error = 'Failed to load resources'
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async loadResourceContent(resourcePath) {
      try {
        this.loading = true
        this.currentResource = getResourceContent(resourcePath)
      } catch (error) {
        this.error = 'Failed to load resource content'
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    resetError() {
      this.error = null
    }
  }
})
