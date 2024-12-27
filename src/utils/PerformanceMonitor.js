import Logger from './Logger';

class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      enableProfiling: options.enableProfiling || false,
      profilingThreshold: options.profilingThreshold || 100, // ms
      metricsHistory: [],
      maxMetricsHistory: options.maxMetricsHistory || 100
    };

    // Performance tracking map
    this.activeTrackers = new Map();
  }

  /**
   * Start performance tracking for a specific operation
   * @param {string} operationName - Name of the operation to track
   * @returns {string} Unique tracker ID
   */
  start(operationName) {
    const trackerId = `${operationName}-${Date.now()}`;
    this.activeTrackers.set(trackerId, {
      start: performance.now(),
      name: operationName
    });
    return trackerId;
  }

  /**
   * End performance tracking and log metrics
   * @param {string} trackerId - Unique tracker ID
   * @returns {Object} Performance metrics
   */
  end(trackerId) {
    const tracker = this.activeTrackers.get(trackerId);
    if (!tracker) {
      Logger.warn('Performance tracker not found', { trackerId });
      return null;
    }

    const end = performance.now();
    const duration = end - tracker.start;

    const metrics = {
      name: tracker.name,
      duration,
      timestamp: new Date().toISOString()
    };

    // Log performance if above threshold
    if (duration > this.options.profilingThreshold) {
      Logger.warn('Performance threshold exceeded', metrics);
    }

    // Store metrics history
    this.storeMetrics(metrics);

    // Remove tracker
    this.activeTrackers.delete(trackerId);

    return metrics;
  }

  /**
   * Store performance metrics in history
   * @param {Object} metrics - Performance metrics
   */
  storeMetrics(metrics) {
    this.options.metricsHistory.push(metrics);

    // Trim history if exceeds max
    if (this.options.metricsHistory.length > this.options.maxMetricsHistory) {
      this.options.metricsHistory.shift();
    }
  }

  /**
   * Get performance metrics summary
   * @returns {Object} Performance summary
   */
  getSummary() {
    if (this.options.metricsHistory.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowestOperation: null
      };
    }

    const totalDuration = this.options.metricsHistory.reduce(
      (sum, metric) => sum + metric.duration, 0
    );

    const slowestOperation = this.options.metricsHistory.reduce(
      (slowest, current) => 
        (current.duration > (slowest?.duration || 0) ? current : slowest),
      null
    );

    return {
      totalOperations: this.options.metricsHistory.length,
      averageDuration: totalDuration / this.options.metricsHistory.length,
      slowestOperation
    };
  }

  /**
   * Wrap a function with performance tracking
   * @param {Function} fn - Function to wrap
   * @param {string} operationName - Name of the operation
   * @returns {Function} Wrapped function with performance tracking
   */
  track(fn, operationName) {
    return async (...args) => {
      const trackerId = this.start(operationName);
      try {
        return await fn(...args);
      } finally {
        this.end(trackerId);
      }
    };
  }

  /**
   * Generate performance report
   * @returns {string} Formatted performance report
   */
  generateReport() {
    const summary = this.getSummary();
    return `
Performance Report
------------------
Total Operations: ${summary.totalOperations}
Average Duration: ${summary.averageDuration.toFixed(2)}ms
Slowest Operation: ${summary.slowestOperation 
  ? `${summary.slowestOperation.name} (${summary.slowestOperation.duration.toFixed(2)}ms)`
  : 'N/A'}

Detailed Metrics:
${this.options.metricsHistory
  .map(metric => 
    `${metric.name}: ${metric.duration.toFixed(2)}ms at ${metric.timestamp}`
  )
  .join('\n')
}`;
  }
}

export default new PerformanceMonitor({
  enableProfiling: process.env.ENABLE_PERFORMANCE_PROFILING === 'true',
  profilingThreshold: Number(process.env.PERFORMANCE_THRESHOLD) || 100
});
