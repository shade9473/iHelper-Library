#!/bin/bash

# Deployment Rollback Protocol
# Version: 1.0.0
# Date: 2024-12-24

# Logging Function
log_message() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a rollback.log
}

# Backup Configurations
BACKUP_DIR="/tmp/ihelper_rollback_$(date +%Y%m%d_%H%M%S)"
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Rollback Stages
rollback_stage() {
    local stage_name="$1"
    local backup_file="$2"
    local original_file="$3"

    log_message "Attempting to rollback $stage_name..."
    
    if [ -f "$backup_file" ]; then
        cp "$backup_file" "$original_file"
        log_message "$stage_name rollback successful"
    else
        log_message "ERROR: No backup found for $stage_name"
        return 1
    fi
}

# Main Rollback Function
main_rollback() {
    log_message "Starting Comprehensive Rollback Protocol"
    
    # Create Backup Directory
    mkdir -p "$BACKUP_DIR"
    log_message "Backup directory created: $BACKUP_DIR"

    # Backup Critical Configuration Files
    cp "$CURRENT_DIR/vite.config.js" "$BACKUP_DIR/vite.config.js.bak"
    cp "$CURRENT_DIR/.github/workflows/deploy.yml" "$BACKUP_DIR/deploy.yml.bak"
    cp "$CURRENT_DIR/package.json" "$BACKUP_DIR/package.json.bak"

    # Rollback Stages
    rollback_stage "Vite Configuration" "$BACKUP_DIR/vite.config.js.bak" "$CURRENT_DIR/vite.config.js"
    rollback_stage "GitHub Actions Workflow" "$BACKUP_DIR/deploy.yml.bak" "$CURRENT_DIR/.github/workflows/deploy.yml"
    rollback_stage "Package Configuration" "$BACKUP_DIR/package.json.bak" "$CURRENT_DIR/package.json"

    # Revert Git Changes
    git reset --hard HEAD^
    log_message "Git repository reset to previous commit"

    # Optional: Redeploy Previous Version
    npm run build
    
    log_message "Rollback Protocol Completed"
}

# Error Handling
trap 'log_message "Rollback Failed. Manual intervention required."' ERR

# Execute Rollback
main_rollback

exit 0
