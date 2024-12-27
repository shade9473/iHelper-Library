#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class DeploymentDiagnostics {
    constructor() {
        this.diagnosticLog = [];
        this.criticalIssuesDetected = false;
    }

    log(level, message, metadata = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            metadata
        };
        this.diagnosticLog.push(logEntry);
        console[level](JSON.stringify(logEntry, null, 2));
    }

    validateProjectStructure() {
        const requiredPaths = [
            'src',
            'dist',
            'node_modules',
            'vite.config.js',
            'package.json'
        ];

        requiredPaths.forEach(relativePath => {
            const fullPath = path.resolve(process.cwd(), relativePath);
            const exists = fs.existsSync(fullPath);
            
            this.log(exists ? 'info' : 'error', 
                `Path validation: ${relativePath}`, 
                { 
                    path: fullPath, 
                    exists 
                }
            );

            if (!exists && !relativePath.includes('.')) {
                this.criticalIssuesDetected = true;
            }
        });
    }

    validatePackageConfiguration() {
        try {
            const packageJsonPath = path.resolve(process.cwd(), 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

            const criticalFields = [
                'name', 
                'version', 
                'type', 
                'scripts.build', 
                'scripts.dev'
            ];

            criticalFields.forEach(field => {
                const value = field.split('.').reduce((obj, key) => obj?.[key], packageJson);
                
                if (!value) {
                    this.log('warn', `Missing critical configuration: ${field}`);
                    this.criticalIssuesDetected = true;
                }
            });

            // Dependency health check
            const criticalDependencies = [
                'vue', 'vite', 'vue-router', 
                'pinia', 'fuse.js'
            ];

            criticalDependencies.forEach(dep => {
                const inDependencies = packageJson.dependencies?.[dep];
                const inDevDependencies = packageJson.devDependencies?.[dep];

                if (!inDependencies && !inDevDependencies) {
                    this.log('error', `Critical dependency missing: ${dep}`);
                    this.criticalIssuesDetected = true;
                }
            });

        } catch (error) {
            this.log('error', 'Package configuration validation failed', { 
                errorMessage: error.message 
            });
            this.criticalIssuesDetected = true;
        }
    }

    generateDiagnosticReport() {
        const report = {
            timestamp: new Date().toISOString(),
            status: this.criticalIssuesDetected ? 'DEPLOYMENT_BLOCKED' : 'READY_FOR_DEPLOYMENT',
            diagnostics: this.diagnosticLog
        };

        const reportPath = path.resolve(process.cwd(), 'deployment-diagnostic-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        return !this.criticalIssuesDetected;
    }

    runDiagnostics() {
        this.validateProjectStructure();
        this.validatePackageConfiguration();
        return this.generateDiagnosticReport();
    }
}

function main() {
    const diagnostics = new DeploymentDiagnostics();
    const deploymentReady = diagnostics.runDiagnostics();
    process.exit(deploymentReady ? 0 : 1);
}

main();
