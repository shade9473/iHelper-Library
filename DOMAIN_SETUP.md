# Custom Domain Configuration: ihelper.tech
Last Updated: 2024-12-22 23:32 PST

## 🔒 DNS Configuration

### 1. Domain Records
```dns
# Root Domain (ihelper.tech)
Type: CNAME
Name: @
Value: ihelper-library.pages.dev
Proxy: Yes

# WWW Subdomain
Type: CNAME
Name: www
Value: ihelper-library.pages.dev
Proxy: Yes

# API Subdomain
Type: CNAME
Name: api
Value: ihelper-library.pages.dev
Proxy: Yes
```

### 2. SSL/TLS Configuration
```yaml
SSL/TLS Mode: Full (Strict)
Always Use HTTPS: Yes
Minimum TLS Version: 1.2
TLS 1.3: Enabled
HSTS: Enabled
  - Max Age: 1 year
  - Include Subdomains: Yes
  - Preload: Yes
```

## 🔄 CloudFlare Pages Configuration

### 1. Custom Domain Setup
```yaml
Primary Domain: ihelper.tech
Aliases:
  - www.ihelper.tech
  - api.ihelper.tech
Branch: master
Environment: Production
```

### 2. Build Configuration
```yaml
Framework Preset: None
Build Command: npm run build
Build Output Directory: dist
Root Directory: /
Environment Variables:
  - NODE_VERSION: 20.x
  - CUSTOM_DOMAIN: ihelper.tech
```

## 🛡️ Security Settings

### 1. SSL/TLS Encryption
- Origin Server SSL Certificate: Auto-generated
- Client SSL Certificate: CloudFlare issued
- Certificate Validity: Auto-renewed

### 2. Security Headers
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self' *.ihelper.tech
```

## 📝 Domain Verification Steps

1. **DNS Propagation**
   - Check DNS records using: `dig ihelper.tech`
   - Verify CNAME records
   - Monitor propagation status

2. **SSL Verification**
   - Validate SSL certificate
   - Check HTTPS redirect
   - Test SSL rating

3. **Domain Accessibility**
   ```
   Primary: https://ihelper.tech
   WWW: https://www.ihelper.tech
   API: https://api.ihelper.tech
   ```

## 🔍 Monitoring

### 1. Health Checks
```yaml
Endpoint Monitoring:
  - https://ihelper.tech/health
  - https://api.ihelper.tech/health
Check Frequency: 60s
Alert Threshold: 30s
```

### 2. SSL Monitoring
```yaml
Certificate Expiry: Auto-monitored
SSL Version: Monitor TLS 1.3 usage
Protocol Support: Track client SSL/TLS versions
```

## 🚨 Important Notes

1. **DNS Propagation**
   - May take up to 24 hours
   - Monitor using multiple DNS checkers
   - Verify from different locations

2. **SSL Certificate**
   - Auto-renewed by CloudFlare
   - Universal SSL enabled
   - HTTPS enforced

3. **Redirects**
   - HTTP → HTTPS
   - non-www → www (if preferred)
   - Legacy URLs handled

## 📊 Performance Optimization

### 1. CDN Settings
```yaml
Cache TTL:
  Static Assets: 4 hours
  API Responses: 5 minutes
  HTML Pages: 2 hours
```

### 2. Origin Rules
```yaml
Origin Pull Protocol: HTTPS
Origin Connection: Keep-alive
Origin Response Timeout: 30s
```

## 🔄 Maintenance Tasks

1. **Weekly**
   - Monitor SSL certificate status
   - Check DNS resolution
   - Verify redirect rules

2. **Monthly**
   - Review security headers
   - Update CSP rules if needed
   - Check SSL configuration

3. **Quarterly**
   - SSL/TLS version review
   - Security scan
   - Performance audit
