import { ref } from 'vue'

export const performanceOptimizer = {
  // Lazy loading configuration
  lazyLoadConfig: {
    threshold: 0.5, // Intersection observer threshold
    rootMargin: '50px 0px' // Preload slightly before entering viewport
  },

  // Caching mechanism
  cache: new Map(),

  // Resource prefetching
  prefetchQueue: [],
  
  // Performance metrics
  metrics: ref({
    totalLoadTime: 0,
    resourceLoadTimes: [],
    cachedResourceHits: 0,
    prefetchedResources: 0
  }),

  // Lazy load images with intersection observer
  lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.removeAttribute('data-src')
              observer.unobserve(img)
            }
          }
        })
      }, this.lazyLoadConfig)

      document.querySelectorAll('img[data-src]').forEach(img => {
        observer.observe(img)
      })
    }
  },

  // Implement resource caching
  cacheResource(key, resource, ttl = 3600000) { // Default 1-hour cache
    const cacheEntry = {
      data: resource,
      timestamp: Date.now(),
      ttl
    }
    this.cache.set(key, cacheEntry)
  },

  getCachedResource(key) {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if cache is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    this.metrics.value.cachedResourceHits++
    return entry.data
  },

  // Prefetch resources
  prefetchResources(resources) {
    resources.forEach(resource => {
      if (!this.getCachedResource(resource.id)) {
        this.prefetchQueue.push(resource)
      }
    })

    this.processPrefetchQueue()
  },

  processPrefetchQueue() {
    const maxConcurrentPrefetches = 3
    const prefetchPromises = this.prefetchQueue
      .splice(0, maxConcurrentPrefetches)
      .map(async (resource) => {
        try {
          const start = performance.now()
          const fetchedResource = await this.fetchResource(resource)
          const end = performance.now()

          this.cacheResource(resource.id, fetchedResource)
          
          this.metrics.value.resourceLoadTimes.push(end - start)
          this.metrics.value.prefetchedResources++
        } catch (error) {
          console.error('Prefetch failed:', error)
        }
      })

    return Promise.all(prefetchPromises)
  },

  async fetchResource(resource) {
    // Simulate resource fetching - replace with actual implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(resource)
      }, 100)
    })
  },

  // Performance tracking
  startPerformanceTracking() {
    if (window.performance) {
      const navigationEntries = performance.getEntriesByType('navigation')
      if (navigationEntries.length > 0) {
        const navigationTiming = navigationEntries[0]
        this.metrics.value.totalLoadTime = navigationTiming.loadEventEnd - navigationTiming.startTime
      }
    }
  },

  // Optimization initializer
  initialize() {
    // Lazy load images
    this.lazyLoadImages()

    // Start performance tracking
    this.startPerformanceTracking()

    // Optional: Prefetch initial resources
    // this.prefetchResources(initialResources)
  }
}

export function usePerformanceOptimizer() {
  return performanceOptimizer
}
