const https = require('https');
const fs = require('fs').promises;
const path = require('path');
const alertManager = require('./alert-manager');

const MONITORING_CONFIG = {
  interval: 5 * 60 * 1000, // 5 minutes
  timeout: 30000, // 30 seconds
  endpoints: [
    {
      name: 'Main Website',
      url: 'https://ihelper.tech',
      expectedStatus: 200,
      expectedLatency: 1000
    },
    {
      name: 'API Health',
      url: 'https://api.ihelper.tech/health',
      expectedStatus: 200,
      expectedLatency: 500
    },
    {
      name: 'Search API',
      url: 'https://api.ihelper.tech/search?q=test',
      expectedStatus: 200,
      expectedLatency: 1000
    }
  ],
  thresholds: {
    errorRate: 0.01, // 1% error rate threshold
    latency: {
      p95: 1000,
      p99: 2000
    },
    availability: 0.995 // 99.5% uptime required
  }
};

class HealthMonitor {
  constructor() {
    this.metrics = {
      checks: 0,
      errors: 0,
      latencies: [],
      availability: 1,
      lastCheck: null,
      incidents: []
    };
    
    this.logPath = path.join(__dirname, '../logs/health');
  }

  async initialize() {
    await alertManager.initialize();
    console.log('🚀 Alert Manager initialized');
  }

  async checkEndpoint(endpoint) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const req = https.get(endpoint.url, {
        timeout: MONITORING_CONFIG.timeout
      }, (res) => {
        const latency = Date.now() - startTime;
        const success = res.statusCode === endpoint.expectedStatus;
        
        resolve({
          endpoint: endpoint.name,
          url: endpoint.url,
          success,
          statusCode: res.statusCode,
          latency,
          timestamp: new Date().toISOString(),
          headers: res.headers
        });
      });

      req.on('error', (error) => {
        resolve({
          endpoint: endpoint.name,
          url: endpoint.url,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  async logMetrics(results) {
    const logFile = path.join(
      this.logPath,
      `health-${new Date().toISOString().split('T')[0]}.json`
    );

    try {
      await fs.mkdir(this.logPath, { recursive: true });
      
      const existingLog = await fs.readFile(logFile, 'utf8')
        .then(JSON.parse)
        .catch(() => ({ checks: [] }));

      existingLog.checks.push({
        timestamp: new Date().toISOString(),
        results
      });

      await fs.writeFile(logFile, JSON.stringify(existingLog, null, 2));
    } catch (error) {
      console.error('Error logging metrics:', error);
    }
  }

  calculateMetrics(results) {
    const total = results.length;
    const failures = results.filter(r => !r.success).length;
    const latencies = results
      .filter(r => r.success && r.latency)
      .map(r => r.latency);

    latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);

    return {
      timestamp: new Date().toISOString(),
      availability: (total - failures) / total,
      errorRate: failures / total,
      latency: {
        p95: latencies[p95Index] || 0,
        p99: latencies[p99Index] || 0,
        avg: latencies.reduce((a, b) => a + b, 0) / latencies.length || 0
      },
      endpoints: results.map(r => ({
        name: r.endpoint,
        status: r.success ? 'healthy' : 'failing',
        latency: r.latency,
        statusCode: r.statusCode,
        error: r.error
      }))
    };
  }

  async check() {
    console.log('\n🏥 Running Health Check:', new Date().toISOString());
    console.log('=====================================');

    const results = await Promise.all(
      MONITORING_CONFIG.endpoints.map(this.checkEndpoint)
    );

    const metrics = this.calculateMetrics(results);
    await this.logMetrics(results);

    // Generate alerts
    const alerts = alertManager.evaluateMetrics(metrics);
    
    if (alerts.length > 0) {
      console.log('\n🚨 New Alerts Generated:', alerts.length);
    }

    // Print results
    console.log('\n📊 Health Metrics:');
    console.log(`Availability: ${(metrics.availability * 100).toFixed(2)}%`);
    console.log(`Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
    console.log(`Average Latency: ${metrics.latency.avg.toFixed(2)}ms`);
    console.log(`P95 Latency: ${metrics.latency.p95}ms`);
    console.log(`P99 Latency: ${metrics.latency.p99}ms`);

    console.log('\n🎯 Endpoint Status:');
    metrics.endpoints.forEach(endpoint => {
      const icon = endpoint.status === 'healthy' ? '✅' : '❌';
      console.log(`${icon} ${endpoint.name}:`);
      console.log(`   Status: ${endpoint.status}`);
      if (endpoint.latency) console.log(`   Latency: ${endpoint.latency}ms`);
      if (endpoint.error) console.log(`   Error: ${endpoint.error}`);
    });

    // Check against thresholds
    const thresholdAlerts = [];
    if (metrics.errorRate > MONITORING_CONFIG.thresholds.errorRate) {
      thresholdAlerts.push(`High Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
    }
    if (metrics.latency.p95 > MONITORING_CONFIG.thresholds.latency.p95) {
      thresholdAlerts.push(`High P95 Latency: ${metrics.latency.p95}ms`);
    }
    if (metrics.availability < MONITORING_CONFIG.thresholds.availability) {
      thresholdAlerts.push(`Low Availability: ${(metrics.availability * 100).toFixed(2)}%`);
    }

    if (thresholdAlerts.length > 0) {
      console.log('\n⚠️ Alerts:');
      thresholdAlerts.forEach(alert => console.log(`- ${alert}`));
    }

    return metrics;
  }

  async start() {
    console.log('🚀 Starting Health Monitoring');
    await this.initialize();
    
    console.log(`Checking ${MONITORING_CONFIG.endpoints.length} endpoints every ${MONITORING_CONFIG.interval / 1000} seconds`);
    
    // Initial check
    await this.check();

    // Schedule regular checks
    setInterval(() => this.check(), MONITORING_CONFIG.interval);
    
    // Schedule daily alert report
    setInterval(async () => {
      const report = await alertManager.generateAlertReport();
      console.log('\n📊 Daily Alert Report Generated');
      console.log(`Active Alerts: ${report.activeAlerts.length}`);
      console.log(`24h Alerts: ${report.last24Hours.length}`);
    }, 24 * 60 * 60 * 1000);
  }
}

// Start monitoring if run directly
if (require.main === module) {
  const monitor = new HealthMonitor();
  monitor.start().catch(console.error);
}
