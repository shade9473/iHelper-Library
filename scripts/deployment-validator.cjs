#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeploymentValidator {
    constructor() {
        this.validationLog = [];
        this.criticalChecksPassed = true;
    }

    logMessage(level, message) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message
        };
        this.validationLog.push(logEntry);
        console[level](JSON.stringify(logEntry, null, 2));
    }

    validateProjectStructure() {
        const requiredDirectories = [
            'src',
            'src/scripts',
            'dist',
            'node_modules'
        ];

        requiredDirectories.forEach(dir => {
            const fullPath = path.resolve(__dirname, '..', dir);
            if (!fs.existsSync(fullPath)) {
                this.logMessage('error', `Missing required directory: ${dir}`);
                this.criticalChecksPassed = false;
            } else {
                this.logMessage('info', `Directory validated: ${dir}`);
            }
        });
    }

    async validateViteConfig() {
        try {
            const viteConfigPath = path.resolve(__dirname, '..', 'vite.config.js');
            const viteConfigUrl = `file:///${viteConfigPath.replace(/\\/g, '/')}`;
            const { default: viteConfig } = await import(viteConfigUrl);
            
            if (!viteConfig || !viteConfig.build) {
                this.logMessage('warn', 'Incomplete Vite configuration detected');
                this.criticalChecksPassed = false;
            }
        } catch (error) {
            this.logMessage('error', `Vite config validation failed: ${error.message}`);
            this.criticalChecksPassed = false;
        }
    }

    validatePackageJson() {
        try {
            const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            const requiredScripts = [
                'dev', 'build', 'preview', 
                'test', 'lint', 'format'
            ];

            requiredScripts.forEach(script => {
                if (!packageJson.scripts[script]) {
                    this.logMessage('warn', `Missing critical script: ${script}`);
                }
            });

            const criticalDependencies = [
                'vue', 'vite', 'fuse.js', 'marked', 
                'vue-router', 'pinia'
            ];

            criticalDependencies.forEach(dep => {
                if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
                    this.logMessage('error', `Critical dependency missing: ${dep}`);
                    this.criticalChecksPassed = false;
                }
            });
        } catch (error) {
            this.logMessage('error', `Package.json validation failed: ${error.message}`);
            this.criticalChecksPassed = false;
        }
    }

    generateValidationReport() {
        const report = {
            timestamp: new Date().toISOString(),
            overallStatus: this.criticalChecksPassed ? 'PASSED' : 'FAILED',
            logs: this.validationLog
        };

        const reportPath = path.resolve(__dirname, '..', 'deployment-validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        return this.criticalChecksPassed;
    }

    async runFullValidation() {
        this.validateProjectStructure();
        this.validatePackageJson();
        await this.validateViteConfig();
        return this.generateValidationReport();
    }
}

async function main() {
    const validator = new DeploymentValidator();
    const validationResult = await validator.runFullValidation();
    process.exit(validationResult ? 0 : 1);
}

main().catch(error => {
    console.error('Deployment validation failed:', error);
    process.exit(1);
});
