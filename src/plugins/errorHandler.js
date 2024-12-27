import { ref } from 'vue'

export const globalErrorStore = ref({
  errors: [],
  logs: [],
  
  // Error Types
  ERROR_TYPES: {
    NETWORK: 'network',
    RESOURCE_LOAD: 'resource',
    VALIDATION: 'validation',
    UNEXPECTED: 'unexpected'
  },

  // Log an error with detailed tracking
  logError(error, type = 'unexpected', context = {}) {
    const errorEntry = {
      id: Date.now(),
      message: error.message || 'An unexpected error occurred',
      type,
      timestamp: new Date().toISOString(),
      stack: error.stack,
      context
    }

    // Add to error list
    this.errors.push(errorEntry)

    // Add to logs with more details
    this.logs.push({
      ...errorEntry,
      fullError: error
    })

    // Console logging for development
    console.error(`[${type.toUpperCase()} ERROR]`, errorEntry)

    // Optional: Send to monitoring service
    this.reportToMonitoringService(errorEntry)
  },

  // Clear specific or all errors
  clearErrors(id = null) {
    if (id) {
      this.errors = this.errors.filter(error => error.id !== id)
    } else {
      this.errors = []
    }
  },

  // Simulate error reporting to external service
  reportToMonitoringService(errorEntry) {
    // In a real-world scenario, this would send error to services like Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      try {
        // Placeholder for actual error reporting
        // window.Sentry?.captureException(new Error(errorEntry.message))
      } catch (reportError) {
        console.warn('Error reporting failed', reportError)
      }
    }
  },

  // Performance tracking
  performanceMetrics: {
    resourceLoadTimes: [],
    networkRequests: [],
    renderTimes: []
  },

  trackPerformance(metricType, data) {
    switch(metricType) {
      case 'resourceLoad':
        this.performanceMetrics.resourceLoadTimes.push(data)
        break
      case 'networkRequest':
        this.performanceMetrics.networkRequests.push(data)
        break
      case 'renderTime':
        this.performanceMetrics.renderTimes.push(data)
        break
    }

    // Trigger performance analysis if needed
    this.analyzePerformance()
  },

  analyzePerformance() {
    const metrics = this.performanceMetrics
    
    const avgResourceLoadTime = metrics.resourceLoadTimes.length 
      ? metrics.resourceLoadTimes.reduce((a, b) => a + b, 0) / metrics.resourceLoadTimes.length 
      : 0
    
    const slowResourceLoads = metrics.resourceLoadTimes.filter(time => time > 1000)
    
    if (slowResourceLoads.length > 0) {
      this.logError(
        new Error('Slow resource loading detected'), 
        'performance', 
        { avgLoadTime: avgResourceLoadTime, slowLoads: slowResourceLoads.length }
      )
    }
  }
})

// Global error handler for Vue
export function setupErrorHandling(app) {
  app.config.errorHandler = (error, instance, info) => {
    globalErrorStore.logError(error, 'vue', { 
      component: instance?.$options?.name || 'Unknown', 
      info 
    })
  }

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    globalErrorStore.logError(
      event.reason, 
      'promise', 
      { promise: event.promise }
    )
  })
}

// Composable for error handling
export function useErrorHandler() {
  return globalErrorStore
}
