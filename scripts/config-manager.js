const fs = require('fs').promises;
const path = require('path');

class ConfigManager {
  constructor() {
    this.config = {
      cloudflare: {
        apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
        zoneId: process.env.CLOUDFLARE_ZONE_ID || '',
        domain: 'ihelper.tech',
        subdomains: ['www', 'api']
      },
      smtp: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        enabled: false
      },
      security: {
        sslMinVersion: 'TLS1.2',
        hstsMaxAge: 31536000,
        nodeEnv: process.env.NODE_ENV || 'production'
      },
      monitoring: {
        checkInterval: 300000,  // 5 minutes
        errorThreshold: 0.02,   // 2%
        latencyThreshold: 2000  // 2 seconds
      },
      content: {
        sourceDir: 'content/source',
        targetDir: 'content/processed',
        backupEnabled: true,
        validateContent: true
      },
      api: {
        rateLimit: 100,
        rateWindow: 900000,  // 15 minutes
        timeout: 30000       // 30 seconds
      },
      cache: {
        ttl: 14400,         // 4 hours
        staleTtl: 300       // 5 minutes
      }
    };
  }

  async initialize() {
    console.log('🔧 Initializing configuration...');
    
    // Verify required secrets
    this.verifyRequiredSecrets();
    
    // Create required directories
    await this.createDirectories();
    
    return this.config;
  }

  verifyRequiredSecrets() {
    const missingSecrets = [];
    
    // CloudFlare secrets
    if (!this.config.cloudflare.apiToken) {
      missingSecrets.push('CLOUDFLARE_API_TOKEN');
    }
    if (!this.config.cloudflare.zoneId) {
      missingSecrets.push('CLOUDFLARE_ZONE_ID');
    }

    // SMTP secrets (if enabled)
    if (this.config.smtp.enabled) {
      if (!this.config.smtp.user) {
        missingSecrets.push('SMTP_USER');
      }
      if (!this.config.smtp.pass) {
        missingSecrets.push('SMTP_PASS');
      }
    }

    if (missingSecrets.length > 0) {
      console.log('\n⚠️ Missing required secrets:');
      missingSecrets.forEach(secret => console.log(`  - ${secret}`));
      console.log('\nPlease add these secrets to your GitHub repository:');
      console.log('1. Go to your repository settings');
      console.log('2. Navigate to Secrets and Variables > Actions');
      console.log('3. Click "New repository secret"');
      console.log('4. Add each missing secret\n');
    }

    return missingSecrets.length === 0;
  }

  async createDirectories() {
    const dirs = [
      this.config.content.sourceDir,
      this.config.content.targetDir,
      'logs/cloudflare',
      'logs/monitoring',
      'logs/notifications'
    ];

    for (const dir of dirs) {
      const fullPath = path.join(__dirname, '..', dir);
      await fs.mkdir(fullPath, { recursive: true })
        .catch(err => console.error(`Failed to create directory ${dir}:`, err));
    }
  }

  getConfig() {
    return this.config;
  }

  async saveConfigStatus() {
    const statusFile = path.join(__dirname, '../logs/config-status.json');
    
    const status = {
      timestamp: new Date().toISOString(),
      environment: this.config.security.nodeEnv,
      cloudflareConfigured: !!this.config.cloudflare.apiToken,
      smtpConfigured: this.config.smtp.enabled && !!this.config.smtp.user,
      directories: {
        content: {
          source: await this.checkDirectory(this.config.content.sourceDir),
          target: await this.checkDirectory(this.config.content.targetDir)
        },
        logs: {
          cloudflare: await this.checkDirectory('logs/cloudflare'),
          monitoring: await this.checkDirectory('logs/monitoring'),
          notifications: await this.checkDirectory('logs/notifications')
        }
      }
    };

    await fs.writeFile(statusFile, JSON.stringify(status, null, 2))
      .catch(err => console.error('Failed to save config status:', err));

    return status;
  }

  async checkDirectory(dir) {
    try {
      await fs.access(path.join(__dirname, '..', dir));
      return true;
    } catch {
      return false;
    }
  }

  getSecretInstructions() {
    return `
# GitHub Actions Secrets Setup

## Required Secrets

### CloudFlare Configuration
- CLOUDFLARE_API_TOKEN
  - Get from: CloudFlare Dashboard > API Tokens
  - Permissions needed: Zone.SSL and DNS
  
- CLOUDFLARE_ZONE_ID
  - Get from: CloudFlare Dashboard > Domain Overview
  - Found in the API section

### SMTP Configuration (Optional)
- SMTP_USER
  - Your email address
  - Example: alerts@ihelper.tech
  
- SMTP_PASS
  - App-specific password
  - Generate from email provider

## Adding Secrets

1. Go to your repository settings
2. Navigate to Secrets and Variables > Actions
3. Click "New repository secret"
4. Add each secret with its value

## Verifying Secrets

Run the configuration check:
\`\`\`bash
node scripts/config-manager.js verify
\`\`\`

## Security Notes

- Never commit secrets to the repository
- Rotate secrets periodically
- Use minimal permission scopes
- Monitor secret usage in Actions
`;
  }
}

// Create and export singleton instance
const configManager = new ConfigManager();

// If run directly, initialize and show status
if (require.main === module) {
  configManager.initialize()
    .then(() => configManager.saveConfigStatus())
    .then(status => {
      console.log('\n📋 Configuration Status:');
      console.log(JSON.stringify(status, null, 2));
      
      if (process.argv[2] === 'instructions') {
        console.log(configManager.getSecretInstructions());
      }
    })
    .catch(console.error);
}

module.exports = configManager;
