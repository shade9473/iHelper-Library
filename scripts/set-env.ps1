# Set CloudFlare environment variables
$env:CLOUDFLARE_API_TOKEN = $args[0]
$env:CLOUDFLARE_ZONE_ID = $args[1]
$env:CLOUDFLARE_ACCOUNT_ID = $args[2]

# Set domain variables
$env:DOMAIN = "ihelper.tech"
$env:SUBDOMAIN_WWW = "www.ihelper.tech"
$env:SUBDOMAIN_API = "api.ihelper.tech"

# Set security variables
$env:SSL_MIN_VERSION = "TLS1.2"
$env:HSTS_MAX_AGE = "31536000"

# Run CloudFlare manager
Write-Host "Running CloudFlare manager..."
node scripts/cloudflare-manager.js
