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
