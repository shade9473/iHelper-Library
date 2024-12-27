import { ref } from 'vue';

class LoggingConfig {
  constructor() {
    this.config = ref({
      // Simplified logging configuration
      logLevel: 'INFO',
      enableConsoleLogging: true,
      performanceTracking: {
        enabled: true,
        sampleRate: 0.5  // Track 50% of performance events
      },
      errorReporting: {
        enabled: true,
        maxErrorsPerSession: 20
      }
    });
  }

  // Get current configuration
  getConfig() {
    return this.config.value;
  }

  // Update configuration with minimal validation
  updateConfig(newConfig) {
    try {
      this.config.value = { 
        ...this.config.value, 
        ...newConfig 
      };
      return true;
    } catch (error) {
      console.warn('Configuration update failed', error);
      return false;
    }
  }

  // Simple feature toggle
  isFeatureEnabled(feature) {
    switch(feature) {
      case 'performanceTracking':
        return this.config.value.performanceTracking.enabled;
      case 'errorReporting':
        return this.config.value.errorReporting.enabled;
      default:
        return false;
    }
  }
}

export default new LoggingConfig();
