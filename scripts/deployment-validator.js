#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

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
            const fullPath = path.resolve(process.cwd(), dir);
            if (!fs.existsSync(fullPath)) {
                this.logMessage('error', `Missing required directory: ${dir}`);
                this.criticalChecksPassed = false;
            } else {
                this.logMessage('info', `Directory validated: ${dir}`);
            }
        });
    }

    validatePackageJson() {
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const requiredScripts = [
                'dev', 'build', 'preview', 
                'test', 'lint', 'format'
            ];

            requiredScripts.forEach(script => {
                if (!packageJson.scripts[script]) {
                    this.logMessage('warn', `Missing script: ${script}`);
                }
            });
        } catch (error) {
            this.logMessage('error', `Package.json validation failed: ${error.message}`);
            this.criticalChecksPassed = false;
        }
    }

    validateViteConfig() {
        try {
            const viteConfig = require('../vite.config.js');
            if (!viteConfig.build || !viteConfig.build.outDir) {
                this.logMessage('warn', 'Incomplete Vite build configuration');
            }
        } catch (error) {
            this.logMessage('error', `Vite config validation failed: ${error.message}`);
            this.criticalChecksPassed = false;
        }
    }

    validateDependencies() {
        const criticalDependencies = [
            'vue', 'vite', 'fuse.js', 'marked'
        ];

        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            criticalDependencies.forEach(dep => {
                if (!packageJson.dependencies[dep]) {
                    this.logMessage('warn', `Critical dependency missing: ${dep}`);
                }
            });
        } catch (error) {
            this.logMessage('error', `Dependency validation failed: ${error.message}`);
            this.criticalChecksPassed = false;
        }
    }

    generateValidationReport() {
        const report = {
            timestamp: new Date().toISOString(),
            overallStatus: this.criticalChecksPassed ? 'PASSED' : 'FAILED',
            logs: this.validationLog
        };

        fs.writeFileSync('deployment-validation-report.json', JSON.stringify(report, null, 2));
        return this.criticalChecksPassed;
    }

    runFullValidation() {
        this.validateProjectStructure();
        this.validatePackageJson();
        this.validateViteConfig();
        this.validateDependencies();
        return this.generateValidationReport();
    }
}

const validator = new DeploymentValidator();
const validationResult = validator.runFullValidation();

process.exit(validationResult ? 0 : 1);
