const https = require('https');
const fs = require('fs').promises;
const path = require('path');

class CloudflareManager {
  constructor() {
    this.config = {
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
      zoneId: process.env.CLOUDFLARE_ZONE_ID,
      baseUrl: 'api.cloudflare.com',
      apiVersion: 'v4'
    };

    this.securityHeaders = {
      // HSTS Configuration
      'Strict-Transport-Security': {
        value: 'max-age=31536000; includeSubDomains; preload',
        description: 'Force HTTPS for one year, include subdomains, and allow preloading'
      },
      // Content Security Policy
      'Content-Security-Policy': {
        value: this.generateCSP(),
        description: 'Strict CSP to prevent XSS and other injection attacks'
      },
      // Additional Security Headers
      'X-Content-Type-Options': {
        value: 'nosniff',
        description: 'Prevent MIME type sniffing'
      },
      'X-Frame-Options': {
        value: 'SAMEORIGIN',
        description: 'Prevent clickjacking attacks'
      },
      'X-XSS-Protection': {
        value: '1; mode=block',
        description: 'Enable XSS filtering'
      },
      'Referrer-Policy': {
        value: 'strict-origin-when-cross-origin',
        description: 'Control information sent in referrer header'
      },
      'Permissions-Policy': {
        value: this.generatePermissionsPolicy(),
        description: 'Control browser features and APIs'
      }
    };
  }

  generateCSP() {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://api.ihelper.tech",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "img-src 'self' data: https:",
      "font-src 'self' https://cdn.jsdelivr.net",
      "connect-src 'self' https://api.ihelper.tech",
      "media-src 'self'",
      "object-src 'none'",
      "frame-src 'self'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ].join('; ');
  }

  generatePermissionsPolicy() {
    return [
      'accelerometer=()',
      'camera=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()'
    ].join(', ');
  }

  async configureSecurityHeaders() {
    console.log('🔒 Configuring security headers...');
    
    const zones = ['ihelper.tech', 'www.ihelper.tech', 'api.ihelper.tech'];
    const results = [];

    for (const zone of zones) {
      try {
        const result = await this.setZoneHeaders(zone);
        results.push({ zone, success: true, result });
        console.log(`✅ Configured headers for ${zone}`);
      } catch (error) {
        results.push({ zone, success: false, error: error.message });
        console.error(`❌ Failed to configure headers for ${zone}:`, error.message);
      }
    }

    return results;
  }

  async configureHSTS() {
    console.log('🔒 Configuring HSTS...');

    const hstsSettings = {
      enabled: true,
      max_age: 31536000,
      include_subdomains: true,
      preload: true,
      nosniff: true
    };

    try {
      const result = await this.makeRequest('/zones/' + this.config.zoneId + '/settings/security_header', 'PATCH', {
        value: JSON.stringify({
          strict_transport_security: hstsSettings
        })
      });

      console.log('✅ HSTS configured successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to configure HSTS:', error.message);
      throw error;
    }
  }

  async setZoneHeaders(zone) {
    const headers = {};
    for (const [name, config] of Object.entries(this.securityHeaders)) {
      headers[name] = config.value;
    }

    return this.makeRequest('/zones/' + this.config.zoneId + '/workers/routes', 'POST', {
      pattern: `*${zone}/*`,
      script: {
        handlers: [{
          type: 'response',
          code: this.generateHeaderScript(headers)
        }]
      }
    });
  }

  generateHeaderScript(headers) {
    return `
      addEventListener('fetch', event => {
        event.respondWith(handleRequest(event.request))
      })

      async function handleRequest(request) {
        const response = await fetch(request)
        const newResponse = new Response(response.body, response)
        
        ${Object.entries(headers)
          .map(([name, value]) => `newResponse.headers.set('${name}', '${value}')`)
          .join('\n        ')}
        
        return newResponse
      }
    `;
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    const options = {
      hostname: this.config.baseUrl,
      path: '/' + this.config.apiVersion + endpoint,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + this.config.apiToken,
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`API request failed: ${res.statusCode} ${data}`));
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  async verifyConfiguration() {
    console.log('🔍 Verifying security configuration...');

    const checks = [
      this.verifyHSTS(),
      this.verifySecurityHeaders(),
      this.verifySSLSettings()
    ];

    const results = await Promise.all(checks);
    await this.logResults(results);

    return results;
  }

  async verifyHSTS() {
    try {
      const response = await this.makeRequest('/zones/' + this.config.zoneId + '/settings/security_header');
      const hstsEnabled = response.result.value.includes('max-age=31536000');
      return {
        check: 'HSTS',
        status: hstsEnabled ? 'enabled' : 'disabled',
        success: hstsEnabled
      };
    } catch (error) {
      return {
        check: 'HSTS',
        status: 'error',
        success: false,
        error: error.message
      };
    }
  }

  async verifySecurityHeaders() {
    const results = [];
    const domains = ['ihelper.tech', 'www.ihelper.tech', 'api.ihelper.tech'];

    for (const domain of domains) {
      try {
        const response = await this.makeRequest('/zones/' + this.config.zoneId + '/workers/routes');
        const hasHeaders = response.result.some(route => route.pattern.includes(domain));
        results.push({
          domain,
          status: hasHeaders ? 'configured' : 'missing',
          success: hasHeaders
        });
      } catch (error) {
        results.push({
          domain,
          status: 'error',
          success: false,
          error: error.message
        });
      }
    }

    return {
      check: 'Security Headers',
      domains: results
    };
  }

  async verifySSLSettings() {
    try {
      const response = await this.makeRequest('/zones/' + this.config.zoneId + '/settings/ssl');
      return {
        check: 'SSL Settings',
        mode: response.result.value,
        success: response.result.value === 'strict'
      };
    } catch (error) {
      return {
        check: 'SSL Settings',
        status: 'error',
        success: false,
        error: error.message
      };
    }
  }

  async logResults(results) {
    const logDir = path.join(__dirname, '../logs/cloudflare');
    await fs.mkdir(logDir, { recursive: true });

    const logFile = path.join(logDir, `security-config-${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(logFile, JSON.stringify(results, null, 2));
  }

  async configureDNS() {
    console.log('🌐 Configuring DNS settings...');

    const records = [
      {
        type: 'CNAME',
        name: '@',
        content: 'ihelper.pages.dev',
        proxied: true
      },
      {
        type: 'CNAME',
        name: 'www',
        content: 'ihelper.pages.dev',
        proxied: true
      },
      {
        type: 'CNAME',
        name: 'api',
        content: 'ihelper.pages.dev',
        proxied: true
      }
    ];

    for (const record of records) {
      try {
        await this.makeRequest(`/zones/${this.config.zoneId}/dns_records`, 'POST', record);
        console.log(`✅ Added DNS record: ${record.name}.ihelper.tech -> ${record.content}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          // Update existing record
          const existing = await this.findDNSRecord(record.name);
          if (existing) {
            await this.makeRequest(
              `/zones/${this.config.zoneId}/dns_records/${existing.id}`,
              'PATCH',
              record
            );
            console.log(`✅ Updated DNS record: ${record.name}.ihelper.tech -> ${record.content}`);
          }
        } else {
          console.error(`❌ Failed to configure DNS record for ${record.name}:`, error.message);
        }
      }
    }
  }

  async configureOriginServer() {
    console.log('🔧 Configuring origin server settings...');

    const settings = {
      // Enable fallback origin with correct timeout
      fallback_origin: {
        value: 'ihelper.pages.dev',
        enabled: true
      },
      origin_max_http_version: {
        value: '2'
      },
      // Increase timeouts
      origin_read_timeout: {
        value: 100
      },
      origin_connect_timeout: {
        value: 60
      },
      // SSL settings - Use Flexible for Pages.dev
      ssl: {
        value: 'flexible'
      },
      // Always use HTTPS
      always_use_https: {
        value: 'on'
      },
      // Automatic HTTPS rewrites
      automatic_https_rewrites: {
        value: 'on'
      },
      // Browser cache TTL
      browser_cache_ttl: {
        value: 14400
      }
    };

    for (const [setting, config] of Object.entries(settings)) {
      try {
        await this.makeRequest(
          `/zones/${this.config.zoneId}/settings/${setting}`,
          'PATCH',
          { value: config.value }
        );
        console.log(`✅ Configured ${setting}`);
      } catch (error) {
        console.error(`❌ Failed to configure ${setting}:`, error.message);
      }
    }
  }

  async configurePageRules() {
    console.log('📋 Configuring page rules...');

    const rules = [
      {
        targets: [
          {
            target: 'url',
            constraint: {
              operator: 'matches',
              value: 'ihelper.pages.dev/*'
            }
          }
        ],
        actions: [
          {
            id: 'forwarding_url',
            value: {
              url: 'https://ihelper.tech/$1',
              status_code: 301
            }
          }
        ],
        priority: 1,
        status: 'active'
      },
      {
        targets: [
          {
            target: 'url',
            constraint: {
              operator: 'matches',
              value: 'http://*ihelper.tech/*'
            }
          }
        ],
        actions: [
          {
            id: 'always_use_https',
            value: 'on'
          }
        ],
        priority: 2,
        status: 'active'
      }
    ];

    for (const rule of rules) {
      try {
        await this.makeRequest(`/zones/${this.config.zoneId}/pagerules`, 'POST', rule);
        console.log(`✅ Added page rule for ${rule.targets[0].constraint.value}`);
      } catch (error) {
        console.error(`❌ Failed to add page rule:`, error.message);
      }
    }
  }

  async findDNSRecord(name) {
    try {
      const response = await this.makeRequest(`/zones/${this.config.zoneId}/dns_records`);
      return response.result.find(record => 
        record.name === (name === '@' ? 'ihelper.tech' : `${name}.ihelper.tech`)
      );
    } catch (error) {
      console.error('Failed to find DNS record:', error.message);
      return null;
    }
  }

  async configureAll() {
    console.log('🚀 Starting CloudFlare configuration...');
    console.log('=====================================');

    try {
      // Configure DNS first
      await this.configureDNS();

      // Configure origin server
      await this.configureOriginServer();

      // Configure page rules
      await this.configurePageRules();

      // Configure security settings
      await this.configureSecurityHeaders();
      await this.configureHSTS();

      // Verify configuration
      const results = await this.verifyConfiguration();
      console.log('\n📋 Final Configuration Results:');
      console.log(JSON.stringify(results, null, 2));

    } catch (error) {
      console.error('❌ Configuration failed:', error.message);
      throw error;
    }
  }
}

// Create and export singleton instance
const manager = new CloudflareManager();

// If run directly, configure and verify
if (require.main === module) {
  (async () => {
    try {
      await manager.configureAll();
    } catch (error) {
      console.error('❌ Configuration failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = manager;
