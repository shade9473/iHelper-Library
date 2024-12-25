#!/bin/bash

# Comprehensive Resource Library Deployment Script
# Version: 1.0.0
# Date: 2024-12-24

# Set deployment variables
DEPLOYMENT_VERSION="1.0.0"
DEPLOYMENT_DATE=$(date +"%Y-%m-%d")
LOG_FILE="deployment_log_${DEPLOYMENT_DATE}.txt"

# Deployment Configuration
SOURCE_DIR="/c/Users/ihelp/Comprehensive_Resource_Library/Comp_Res_Lib_V2"
TARGET_DOMAIN="www.ihelper.com"

# Logging Function
log_message() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Pre-Deployment Checks
pre_deployment_checks() {
    log_message "Starting pre-deployment checks..."
    
    # Check required directories
    REQUIRED_DIRS=(
        "13_Online_Courses"
        "14_Ebook_Summaries"
        "15_Professional_Templates"
    )
    
    for dir in "${REQUIRED_DIRS[@]}"; do
        if [ ! -d "$SOURCE_DIR/$dir" ]; then
            log_message "ERROR: Directory $dir not found!"
            exit 1
        fi
    done
    
    log_message "Pre-deployment checks completed successfully."
}

# SEO and Performance Optimization
optimize_assets() {
    log_message "Optimizing static assets..."
    
    # Minify HTML
    find "$SOURCE_DIR" -name "*.html" -exec html-minifier --collapse-whitespace --remove-comments {} -o {} \;
    
    # Optimize images
    find "$SOURCE_DIR" -name "*.{jpg,png,svg}" -exec imageoptim {} \;
    
    log_message "Asset optimization completed."
}

# CloudFlare Deployment
cloudflare_deploy() {
    log_message "Initiating CloudFlare deployment..."
    
    # Validate CloudFlare configuration
    if [ ! -f "$SOURCE_DIR/cloudflare.toml" ]; then
        log_message "ERROR: CloudFlare configuration not found!"
        exit 1
    fi
    
    # Deploy to CloudFlare Pages
    cloudflare pages publish "$SOURCE_DIR" \
        --project-name="ihelper-resource-library" \
        --branch="main" \
        --commit-message="Deployment $DEPLOYMENT_VERSION on $DEPLOYMENT_DATE"
    
    log_message "CloudFlare deployment completed."
}

# Post-Deployment Validation
post_deployment_validation() {
    log_message "Performing post-deployment validation..."
    
    # Check deployment status
    curl -I "https://$TARGET_DOMAIN" | grep "200 OK"
    if [ $? -eq 0 ]; then
        log_message "Deployment successful! Site is live."
    else
        log_message "WARNING: Deployment may have issues. Manual verification required."
    fi
}

# Main Deployment Function
main() {
    log_message "Starting Comprehensive Resource Library Deployment"
    log_message "Version: $DEPLOYMENT_VERSION"
    log_message "Date: $DEPLOYMENT_DATE"
    
    pre_deployment_checks
    optimize_assets
    cloudflare_deploy
    post_deployment_validation
    
    log_message "Deployment process completed."
}

# Execute Main Deployment
main

exit 0
