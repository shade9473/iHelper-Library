import { ref } from 'vue'

export const accessibilityManager = {
  // Accessibility state
  state: ref({
    highContrastMode: false,
    fontSize: 'medium',
    reducedMotion: false,
    screenReaderMode: false
  }),

  // Color contrast configurations
  colorProfiles: {
    default: {
      background: '#FFFFFF',
      text: '#1F2937',
      primary: '#3B82F6',
      secondary: '#10B981'
    },
    highContrast: {
      background: '#000000',
      text: '#FFFFFF',
      primary: '#FFFF00',
      secondary: '#00FF00'
    }
  },

  // Font size mappings
  fontSizeMap: {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '20px'
  },

  // Keyboard navigation handler
  setupKeyboardNavigation() {
    window.addEventListener('keydown', (event) => {
      // Skip if typing in an input
      if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return

      switch(event.key) {
        case 'h':
          // Home navigation
          if (event.altKey) window.location.href = '/'
          break
        case 'c':
          // Categories navigation
          if (event.altKey) window.location.href = '/categories'
          break
        case 'r':
          // Resources navigation
          if (event.altKey) window.location.href = '/resources'
          break
      }
    })
  },

  // Screen reader optimization
  optimizeForScreenReaders() {
    // Add ARIA attributes to improve screen reader experience
    document.querySelectorAll('a, button').forEach(element => {
      if (!element.getAttribute('aria-label')) {
        const text = element.textContent || element.getAttribute('title')
        element.setAttribute('aria-label', text)
      }
    })

    // Ensure proper heading hierarchy
    let headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `section-${index + 1}`
      }
    })
  },

  // Performance and accessibility tracking
  performanceMetrics: ref({
    accessibilityScore: 0,
    keyboardNavigationEvents: 0,
    screenReaderCompatibility: true
  }),

  // Toggle high contrast mode
  toggleHighContrast() {
    this.state.value.highContrastMode = !this.state.value.highContrastMode
    this.applyAccessibilityStyles()
  },

  // Apply accessibility styles
  applyAccessibilityStyles() {
    const root = document.documentElement
    const profile = this.state.value.highContrastMode 
      ? this.colorProfiles.highContrast 
      : this.colorProfiles.default

    // Apply color styles
    root.style.setProperty('--background-color', profile.background)
    root.style.setProperty('--text-color', profile.text)
    root.style.setProperty('--primary-color', profile.primary)
    root.style.setProperty('--secondary-color', profile.secondary)

    // Apply font size
    root.style.fontSize = this.fontSizeMap[this.state.value.fontSize]

    // Reduced motion
    root.style.setProperty(
      'scroll-behavior', 
      this.state.value.reducedMotion ? 'auto' : 'smooth'
    )
  },

  // Initialize accessibility features
  initialize() {
    // Check system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches

    this.state.value.reducedMotion = prefersReducedMotion
    this.state.value.highContrastMode = prefersHighContrast

    this.setupKeyboardNavigation()
    this.optimizeForScreenReaders()
    this.applyAccessibilityStyles()

    // Periodically check and update accessibility
    setInterval(() => {
      this.performanceMetrics.value.accessibilityScore = this.calculateAccessibilityScore()
    }, 60000)
  },

  // Calculate an accessibility score
  calculateAccessibilityScore() {
    let score = 100

    // Deduct points for potential accessibility issues
    const missingAriaLabels = document.querySelectorAll('a:not([aria-label]), button:not([aria-label])')
    score -= missingAriaLabels.length * 5

    const poorContrastElements = document.querySelectorAll('.low-contrast')
    score -= poorContrastElements.length * 10

    return Math.max(0, Math.min(100, score))
  }
}

export function useAccessibility() {
  return accessibilityManager
}
