import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Performance and Error Handling
import { setupErrorHandling } from './plugins/errorHandler'
import { performanceOptimizer } from './plugins/performanceOptimizer'
import { accessibilityManager } from './plugins/accessibilityEnhancer'

// Tailwind CSS
import './assets/tailwind.css'

// Ensure process and environment are defined
if (typeof process === 'undefined') {
  window.process = {
    env: {
      ...import.meta.env,
      NODE_ENV: import.meta.env.MODE,
      VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
      VITE_PERFORMANCE_MODE: import.meta.env.VITE_PERFORMANCE_MODE || 'standard'
    }
  }
}

// Log environment for debugging
console.log('Environment:', {
  mode: import.meta.env.MODE,
  env: import.meta.env
})

const app = createApp(App)
const pinia = createPinia()

// Setup global plugins
app.use(pinia)
app.use(router)

// Initialize error handling
setupErrorHandling(app)

// Initialize performance optimizer
performanceOptimizer.initialize()

// Initialize accessibility features
accessibilityManager.initialize()

// Mount the app
app.mount('#app')
