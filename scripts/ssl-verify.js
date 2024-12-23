const https = require('https');
const dns = require('dns').promises;
const tls = require('tls');

class SSLVerification {
  constructor() {
    this.domain = 'ihelper.tech';
    this.subdomains = ['www', 'api'];
    this.expectedCNAME = 'ihelper-library.pages.dev';
    this.minimumTLSVersion = 'TLSv1.2';
  }

  async verifyDNS() {
    console.log('🔍 Verifying DNS records...');
    const results = {
      root: await this.verifyCNAME(this.domain),
      subdomains: {}
    };

    for (const subdomain of this.subdomains) {
      results.subdomains[subdomain] = await this.verifyCNAME(`${subdomain}.${this.domain}`);
    }

    return results;
  }

  async verifyCNAME(hostname) {
    try {
      const records = await dns.resolveCname(hostname);
      const isValid = records.some(record => record === this.expectedCNAME);
      
      console.log(`${hostname}: ${isValid ? '✅' : '❌'} ${records.join(', ')}`);
      
      return {
        valid: isValid,
        records,
        error: null
      };
    } catch (error) {
      console.error(`❌ DNS error for ${hostname}:`, error.message);
      return {
        valid: false,
        records: [],
        error: error.message
      };
    }
  }

  async verifySSL(hostname) {
    return new Promise((resolve) => {
      const options = {
        host: hostname,
        port: 443,
        method: 'HEAD',
        rejectUnauthorized: true,
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate();
        const protocol = res.socket.getProtocol();
        
        const result = {
          valid: true,
          protocol,
          issuer: cert.issuer,
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          daysRemaining: this.calculateDaysRemaining(cert.valid_to),
          securityHeaders: this.parseSecurityHeaders(res.headers)
        };

        resolve(result);
      });

      req.on('error', (error) => {
        resolve({
          valid: false,
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          valid: false,
          error: 'Connection timeout'
        });
      });

      req.end();
    });
  }

  calculateDaysRemaining(validTo) {
    const expiryDate = new Date(validTo);
    const now = new Date();
    const diffTime = expiryDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  parseSecurityHeaders(headers) {
    const securityHeaders = {
      'Strict-Transport-Security': headers['strict-transport-security'],
      'Content-Security-Policy': headers['content-security-policy'],
      'X-Content-Type-Options': headers['x-content-type-options'],
      'X-Frame-Options': headers['x-frame-options'],
      'X-XSS-Protection': headers['x-xss-protection']
    };

    return Object.entries(securityHeaders).reduce((acc, [header, value]) => {
      acc[header] = {
        present: !!value,
        value: value || null
      };
      return acc;
    }, {});
  }

  async verifyAll() {
    console.log('🔒 Starting SSL verification...');
    console.log('=====================================');

    // Verify DNS first
    const dnsResults = await this.verifyDNS();
    
    // Verify SSL for all domains
    const sslResults = {
      root: await this.verifySSL(this.domain)
    };

    for (const subdomain of this.subdomains) {
      sslResults[subdomain] = await this.verifySSL(`${subdomain}.${this.domain}`);
    }

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      dns: dnsResults,
      ssl: sslResults,
      recommendations: this.generateRecommendations(dnsResults, sslResults)
    };

    console.log('\n📋 Verification Report');
    console.log('=====================================');
    this.printReport(report);

    return report;
  }

  generateRecommendations(dnsResults, sslResults) {
    const recommendations = [];

    // Check DNS
    if (!dnsResults.root.valid) {
      recommendations.push('❗ Root domain CNAME record is incorrect or missing');
    }

    Object.entries(dnsResults.subdomains).forEach(([subdomain, result]) => {
      if (!result.valid) {
        recommendations.push(`❗ ${subdomain} subdomain CNAME record is incorrect or missing`);
      }
    });

    // Check SSL
    Object.entries(sslResults).forEach(([domain, result]) => {
      if (!result.valid) {
        recommendations.push(`❗ SSL verification failed for ${domain}: ${result.error}`);
      } else {
        if (result.daysRemaining < 30) {
          recommendations.push(`⚠️ SSL certificate for ${domain} expires in ${result.daysRemaining} days`);
        }

        // Check security headers
        const headers = result.securityHeaders;
        if (!headers['Strict-Transport-Security']?.present) {
          recommendations.push(`⚠️ HSTS not configured for ${domain}`);
        }
        if (!headers['Content-Security-Policy']?.present) {
          recommendations.push(`⚠️ CSP not configured for ${domain}`);
        }
      }
    });

    return recommendations;
  }

  printReport(report) {
    // DNS Status
    console.log('\n🌐 DNS Configuration:');
    console.log(`Root Domain: ${report.dns.root.valid ? '✅' : '❌'}`);
    Object.entries(report.dns.subdomains).forEach(([subdomain, result]) => {
      console.log(`${subdomain}: ${result.valid ? '✅' : '❌'}`);
    });

    // SSL Status
    console.log('\n🔒 SSL Status:');
    Object.entries(report.ssl).forEach(([domain, result]) => {
      if (result.valid) {
        console.log(`\n${domain}:`);
        console.log(`  Protocol: ${result.protocol}`);
        console.log(`  Valid Until: ${result.validTo}`);
        console.log(`  Days Remaining: ${result.daysRemaining}`);
      } else {
        console.log(`\n${domain}: ❌ ${result.error}`);
      }
    });

    // Recommendations
    if (report.recommendations.length > 0) {
      console.log('\n📝 Recommendations:');
      report.recommendations.forEach(rec => console.log(rec));
    }
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new SSLVerification();
  verifier.verifyAll().catch(console.error);
}

module.exports = SSLVerification;
