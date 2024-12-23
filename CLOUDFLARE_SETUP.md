# CloudFlare Setup Guide
Last Updated: 2024-12-23

## 🔐 SSL Configuration

### 1. Environment Setup
```env
# Add to .env file
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id
```

### 2. DNS Configuration
```yaml
Root Domain (ihelper.tech):
  Type: CNAME
  Name: @
  Content: ihelper-library.pages.dev
  Proxy: Yes

WWW Subdomain:
  Type: CNAME
  Name: www
  Content: ihelper-library.pages.dev
  Proxy: Yes

API Subdomain:
  Type: CNAME
  Name: api
  Content: ihelper-library.pages.dev
  Proxy: Yes
```

### 3. SSL/TLS Settings
```yaml
SSL/TLS Mode: Full (Strict)
Minimum TLS Version: TLS 1.2
TLS 1.3: Enabled
Universal SSL: Enabled
```

### 4. Security Headers
```yaml
Strict-Transport-Security:
  enabled: true
  max_age: 31536000
  include_subdomains: true
  preload: true

Content-Security-Policy:
  mode: active
  value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"

Other Headers:
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: "1; mode=block"
```

## 🌐 DNS Configuration

### DNS Records
```javascript
[
  {
    "type": "CNAME",
    "name": "@",
    "content": "ihelper.pages.dev",
    "proxied": true
  },
  {
    "type": "CNAME",
    "name": "www",
    "content": "ihelper.pages.dev",
    "proxied": true
  },
  {
    "type": "CNAME",
    "name": "api",
    "content": "ihelper.pages.dev",
    "proxied": true
  }
]
```

### Origin Server Settings
```javascript
{
  "fallback_origin": {
    "value": "ihelper.pages.dev",
    "enabled": true
  },
  "always_use_https": "on",
  "automatic_https_rewrites": "on",
  "ssl": "strict",
  "origin_max_http_version": "2",
  "browser_cache_ttl": 14400
}
```

### Page Rules
1. **Redirect Pages.dev to Main Domain**
   ```
   URL: ihelper.pages.dev/*
   Forward to: https://ihelper.tech/$1
   Status: 301 (Permanent)
   ```

2. **Force HTTPS**
   ```
   URL: http://*ihelper.tech/*
   Setting: Always use HTTPS
   ```

### Verification Steps
1. **Check DNS Records**
   ```bash
   dig ihelper.tech
   dig www.ihelper.tech
   dig api.ihelper.tech
   ```
   Expected: All should point to CloudFlare's proxy

2. **Verify SSL**
   ```bash
   curl -I https://ihelper.tech
   ```
   Expected: SSL handshake successful

3. **Test Redirects**
   ```bash
   curl -I http://ihelper.tech
   curl -I https://ihelper.pages.dev
   ```
   Expected: 301 redirect to https://ihelper.tech

### Troubleshooting

#### DNS Issues
```
Problem: DNS_PROBE_FINISHED_NXDOMAIN
Fix: Verify CNAME records are correct
```

#### SSL Issues
```
Problem: ERR_SSL_PROTOCOL_ERROR
Fix: Check SSL/TLS configuration
```

#### Origin Connection
```
Problem: 522 Connection Timed Out
Fix: 
1. Verify fallback origin is set
2. Check origin server response
3. Increase connection timeout
```

## 🔒 Security Configuration

### HSTS (HTTP Strict Transport Security)
```javascript
{
  "enabled": true,
  "max_age": 31536000,        // 1 year
  "include_subdomains": true,
  "preload": true,
  "nosniff": true
}
```

### Content Security Policy (CSP)
```javascript
{
  "default-src": "'self'",
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://cdn.jsdelivr.net",
    "https://api.ihelper.tech"
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'",
    "https://cdn.jsdelivr.net"
  ],
  "img-src": "'self' data: https:",
  "font-src": "'self' https://cdn.jsdelivr.net",
  "connect-src": "'self' https://api.ihelper.tech",
  "media-src": "'self'",
  "object-src": "'none'",
  "frame-src": "'self'",
  "worker-src": "'self' blob:",
  "manifest-src": "'self'",
  "form-action": "'self'",
  "base-uri": "'self'",
  "upgrade-insecure-requests": "",
  "block-all-mixed-content": ""
}
```

### Additional Security Headers
```javascript
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

### Permissions Policy
```javascript
{
  "accelerometer": "()",
  "camera": "()",
  "geolocation": "()",
  "gyroscope": "()",
  "magnetometer": "()",
  "microphone": "()",
  "payment": "()",
  "usb": "()"
}
```

### SSL/TLS Configuration
```javascript
{
  "ssl_mode": "strict",
  "min_tls_version": "1.2",
  "tls_1_3": "on",
  "automatic_https_rewrites": true,
  "opportunistic_encryption": true,
  "universal_ssl": true
}
```

### Security Verification
```bash
# Run security configuration check
node scripts/cloudflare-manager.js

# Expected output:
✅ HSTS enabled
✅ Security headers configured
✅ SSL settings verified
```

### Security Best Practices
1. **SSL/TLS**
   - Use TLS 1.2 or higher
   - Enable HSTS preloading
   - Configure Universal SSL

2. **Headers**
   - Implement strict CSP
   - Enable XSS protection
   - Set frame options
   - Configure referrer policy

3. **Monitoring**
   - Regular security scans
   - Header verification
   - SSL certificate monitoring
   - DNS record validation

4. **Maintenance**
   - Update security policies
   - Rotate API tokens
   - Review access logs
   - Monitor security events

## 🔑 CloudFlare API Token Setup

### Step 1: Access API Tokens Page
1. Log in to [CloudFlare Dashboard](https://dash.cloudflare.com)
2. Click your profile icon in top right
3. Select "My Profile"
4. Click "API Tokens" in the left sidebar

### Step 2: Create API Token
1. Click "Create Token"
2. Select "Create Custom Token"
3. Configure token settings:
   ```
   Token name: iHelper-Resource-Library
   
   Permissions:
   - Zone | SSL and Certificates | Edit
   - Zone | DNS | Edit
   - Zone | Settings | Edit
   
   Zone Resources:
   - Include | Specific zone | ihelper.tech
   
   Client IP Address Filtering:
   - Not required (leave blank)
   
   TTL:
   - No expiration
   ```
4. Click "Continue to summary"
5. Review permissions
6. Click "Create Token"
7. **IMPORTANT**: Copy the token immediately
   - It will only be shown once
   - Format: `[a-z0-9]{40}`

### Step 3: Get Zone ID
1. Go to [CloudFlare Dashboard](https://dash.cloudflare.com)
2. Select domain: `ihelper.tech`
3. Scroll to bottom of Overview page
4. Find "Zone ID" in API section
   - Format: `[a-f0-9]{32}`
   - Example: `8f6fae229d44dece`

### Step 4: Add Secrets to GitHub
1. Go to your GitHub repository
2. Click "Settings" tab
3. Navigate to "Secrets and variables" > "Actions"
4. Click "New repository secret"
5. Add API Token:
   ```
   Name: CLOUDFLARE_API_TOKEN
   Value: [your-token-from-step-2]
   ```
6. Add Zone ID:
   ```
   Name: CLOUDFLARE_ZONE_ID
   Value: [your-zone-id-from-step-3]
   ```

### Step 5: Verify Setup
1. Run configuration check:
   ```bash
   node scripts/config-manager.js
   ```
2. Expected output:
   ```
   🔧 Initializing configuration...
   ✅ CloudFlare API Token verified
   ✅ Zone ID verified
   ```

### Security Notes
- Never share or commit your API token
- Token has limited permissions for security
- Monitor token usage in CloudFlare
- Rotate token if compromised
- Use IP filtering for production

### Troubleshooting

#### Invalid Token
```
Error: Authentication error (Code: 9109)
Fix: Verify token was copied correctly
```

#### Invalid Zone ID
```
Error: Unknown zone (Code: 7003)
Fix: Check zone ID matches domain
```

#### Permission Denied
```
Error: Access denied (Code: 9000)
Fix: Verify token permissions
```

## 🚀 Quick Start

```bash
# Configure CloudFlare settings
node scripts/cloudflare-manager.js
```

## 📋 Verification Checklist

### 1. DNS Records
- [ ] Root domain CNAME configured
- [ ] WWW subdomain CNAME configured
- [ ] API subdomain CNAME configured
- [ ] DNS propagation verified

### 2. SSL/TLS
- [ ] Universal SSL enabled
- [ ] Minimum TLS version set
- [ ] HSTS configured
- [ ] Certificate valid

### 3. Security
- [ ] Security headers enabled
- [ ] CSP configured
- [ ] Browser integrity check enabled
- [ ] WAF rules reviewed

## 🔄 Automated Tasks

### Daily Checks
- SSL certificate status
- DNS record verification
- Security header validation
- WAF activity monitoring

### Weekly Tasks
- Review security settings
- Check DNS propagation
- Verify SSL configuration
- Update security policies

### Monthly Reviews
- SSL certificate expiration
- Security header updates
- WAF rule optimization
- Performance metrics

## 🚨 Troubleshooting

### Common Issues

1. **SSL Not Working**
   - Verify DNS records
   - Check SSL mode
   - Confirm CNAME setup
   - Wait for propagation (up to 24h)

2. **Security Headers Missing**
   - Run configuration script
   - Check CloudFlare rules
   - Verify page rules
   - Update SSL settings

3. **DNS Issues**
   - Verify nameservers
   - Check CNAME records
   - Wait for propagation
   - Run DNS verification

## 📈 Monitoring

### Metrics Tracked
- SSL status
- DNS health
- Security scores
- Performance data

### Alert Thresholds
```yaml
SSL Certificate:
  Warning: 30 days before expiry
  Critical: 7 days before expiry

DNS Health:
  Warning: Propagation > 12h
  Critical: Propagation > 24h

Security Score:
  Warning: < 90%
  Critical: < 80%
```

## 🔐 Security Best Practices

1. **SSL/TLS**
   - Use Full (Strict) mode
   - Enable TLS 1.3
   - Configure HSTS
   - Enable Universal SSL

2. **DNS Security**
   - Enable DNSSEC
   - Use proxied records
   - Configure CAA records
   - Enable DANE

3. **WAF Configuration**
   - Enable managed rules
   - Configure rate limiting
   - Set security level
   - Enable browser integrity

## 📝 Maintenance Tasks

### Daily
- Monitor SSL status
- Check DNS health
- Review security logs
- Verify endpoints

### Weekly
- Update security rules
- Check DNS changes
- Review access logs
- Update configurations

### Monthly
- SSL certificate review
- Security policy update
- Performance optimization
- Configuration backup

## Required API Token Configuration

### 1. Create API Token for GitHub Actions
1. Go to CloudFlare Dashboard > Account > API Tokens
2. Click "Create Token"
3. Select the following templates:

#### Required Permissions:
- Account Settings
  - `Workers Scripts: Edit`
  - `Workers Routes: Edit`
  - `Pages: Edit`
- Zone Settings
  - `Zone Settings: Read`
  - `DNS: Edit`
  - `SSL and Certificates: Edit`

### 2. Token Settings
- Token name: `iHelper-Library-Deploy`
- Permissions: As listed above
- Account Resources: Include all accounts
- Zone Resources: Include all zones
- Client IP Address Filtering: Not required
- TTL: No expiration

## GitHub Repository Configuration

### 1. Add CloudFlare Secrets
Go to GitHub repository settings:
`https://github.com/shade9473/iHelper-Library/settings/secrets/actions`

Add the following secrets:
1. `CLOUDFLARE_API_TOKEN`
   - Value: Your generated API token
2. `CLOUDFLARE_ACCOUNT_ID`
   - Found in CloudFlare Dashboard URL: `https://dash.cloudflare.com/<account-id>`

## Deployment Configuration

### 1. CloudFlare Pages Settings
- Project name: `ihelper-library`
- Production branch: `master`
- Build settings:
  - Framework preset: None
  - Build command: `npm run build`
  - Build output directory: `dist`
  - Root directory: `/`

### 2. Environment Variables
Add the following in CloudFlare Pages > Settings > Environment variables:
```
NODE_VERSION=18
NPM_VERSION=9
```

## Verification Steps

1. Check GitHub Actions:
   - Go to Actions tab in repository
   - Verify workflow runs successfully

2. Check CloudFlare Pages:
   - Verify deployment success
   - Check build logs
   - Confirm site is accessible

## Troubleshooting

### Common Issues:
1. **Build Failures**
   - Check Node.js version in `package.json`
   - Verify all dependencies are listed
   - Review build logs for errors

2. **Deployment Issues**
   - Confirm API token permissions
   - Check account ID is correct
   - Verify GitHub secrets are set

3. **DNS Issues**
   - Ensure CloudFlare DNS is properly configured
   - Check SSL/TLS settings
   - Verify domain settings

## Support Resources
- CloudFlare Pages Documentation: https://developers.cloudflare.com/pages
- GitHub Actions Documentation: https://docs.github.com/en/actions
- Project Issues: https://github.com/shade9473/iHelper-Library/issues
