const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

class HealthCheck {
  constructor() {
    this.config = {
      endpoints: [
        {
          url: 'https://www.ihelper.tech',
          name: 'WWW',
          expectedStatus: 200,
          timeout: 30000
        },
        {
          url: 'https://api.ihelper.tech',
          name: 'API',
          expectedStatus: 200,
          timeout: 30000
        }
      ],
      originServer: {
        host: process.env.ORIGIN_SERVER || 'localhost',
        port: process.env.ORIGIN_PORT || 3000,
        protocol: process.env.ORIGIN_PROTOCOL || 'http'
      },
      checkInterval: 60000, // 1 minute
      logPath: path.join(__dirname, '../logs/health')
    };

    this.stats = {
      checks: 0,
      failures: 0,
      lastCheck: null,
      incidents: []
    };
  }

  async initialize() {
    await fs.mkdir(this.config.logPath, { recursive: true });
    console.log('🏥 Health Check System Initialized');
  }

  checkEndpoint(endpoint) {
    return new Promise((resolve) => {
      const start = Date.now();
      const url = new URL(endpoint.url);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'HEAD',
        timeout: endpoint.timeout,
        headers: {
          'User-Agent': 'iHelper-HealthCheck/1.0'
        }
      };

      const req = https.request(options, (res) => {
        const duration = Date.now() - start;
        
        resolve({
          endpoint: endpoint.name,
          url: endpoint.url,
          status: res.statusCode,
          duration,
          headers: res.headers,
          success: res.statusCode === endpoint.expectedStatus,
          timestamp: new Date().toISOString()
        });
      });

      req.on('error', (error) => {
        resolve({
          endpoint: endpoint.name,
          url: endpoint.url,
          error: error.message,
          success: false,
          timestamp: new Date().toISOString()
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          endpoint: endpoint.name,
          url: endpoint.url,
          error: 'Connection timeout',
          success: false,
          timestamp: new Date().toISOString()
        });
      });

      req.end();
    });
  }

  async checkOriginServer() {
    return new Promise((resolve) => {
      const start = Date.now();
      
      const options = {
        hostname: this.config.originServer.host,
        port: this.config.originServer.port,
        path: '/health',
        method: 'GET',
        timeout: 5000
      };

      const protocol = this.config.originServer.protocol === 'https' ? https : http;

      const req = protocol.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const duration = Date.now() - start;
          
          resolve({
            type: 'origin',
            status: res.statusCode,
            duration,
            data: this.safeParseJSON(data),
            success: res.statusCode === 200,
            timestamp: new Date().toISOString()
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          type: 'origin',
          error: error.message,
          success: false,
          timestamp: new Date().toISOString()
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          type: 'origin',
          error: 'Connection timeout',
          success: false,
          timestamp: new Date().toISOString()
        });
      });

      req.end();
    });
  }

  safeParseJSON(data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async diagnoseIssue(results) {
    const issues = [];
    const originResult = results.find(r => r.type === 'origin');
    
    // Check origin server
    if (originResult && !originResult.success) {
      issues.push({
        severity: 'CRITICAL',
        message: `Origin server error: ${originResult.error || 'Unknown error'}`,
        recommendation: 'Check server logs and restart if necessary'
      });
    }

    // Check endpoints
    results.filter(r => r.endpoint).forEach(result => {
      if (!result.success) {
        if (result.error === 'Connection timeout') {
          issues.push({
            severity: 'CRITICAL',
            message: `Connection timeout for ${result.endpoint}`,
            recommendation: 'Verify server resources and connection settings'
          });
        } else if (result.status === 522) {
          issues.push({
            severity: 'CRITICAL',
            message: 'CloudFlare Error 522: Connection timed out',
            recommendation: [
              'Check origin server health',
              'Verify firewall settings',
              'Check for resource exhaustion',
              'Increase connection timeout settings'
            ]
          });
        }
      }
    });

    return issues;
  }

  async check() {
    console.log('\n🏥 Running Health Check:', new Date().toISOString());
    
    const results = await Promise.all([
      this.checkOriginServer(),
      ...this.config.endpoints.map(endpoint => this.checkEndpoint(endpoint))
    ]);

    const issues = await this.diagnoseIssue(results);
    
    // Log results
    await this.logResults({
      timestamp: new Date().toISOString(),
      results,
      issues
    });

    // Print summary
    this.printSummary(results, issues);

    return {
      results,
      issues
    };
  }

  async logResults(data) {
    const logFile = path.join(
      this.config.logPath,
      `health-${new Date().toISOString().split('T')[0]}.json`
    );

    try {
      const existing = await fs.readFile(logFile, 'utf8')
        .then(JSON.parse)
        .catch(() => ({ checks: [] }));

      existing.checks.push(data);

      await fs.writeFile(logFile, JSON.stringify(existing, null, 2));
    } catch (error) {
      console.error('Failed to log results:', error);
    }
  }

  printSummary(results, issues) {
    console.log('\n📊 Health Check Summary');
    console.log('=====================');

    // Print endpoint results
    results.forEach(result => {
      if (result.type === 'origin') {
        console.log(`\nOrigin Server: ${result.success ? '✅' : '❌'}`);
        if (!result.success) {
          console.log(`Error: ${result.error}`);
        }
      } else {
        console.log(`\n${result.endpoint}: ${result.success ? '✅' : '❌'}`);
        console.log(`Status: ${result.status || 'N/A'}`);
        if (result.duration) {
          console.log(`Response Time: ${result.duration}ms`);
        }
        if (result.error) {
          console.log(`Error: ${result.error}`);
        }
      }
    });

    // Print issues
    if (issues.length > 0) {
      console.log('\n⚠️ Issues Detected:');
      issues.forEach(issue => {
        console.log(`\n[${issue.severity}] ${issue.message}`);
        if (Array.isArray(issue.recommendation)) {
          console.log('Recommendations:');
          issue.recommendation.forEach(rec => console.log(`- ${rec}`));
        } else {
          console.log(`Recommendation: ${issue.recommendation}`);
        }
      });
    }
  }

  async start() {
    await this.initialize();
    
    // Initial check
    await this.check();

    // Schedule regular checks
    setInterval(() => this.check(), this.config.checkInterval);
  }
}

// Start health checks if run directly
if (require.main === module) {
  const checker = new HealthCheck();
  checker.start().catch(console.error);
}

module.exports = HealthCheck;
