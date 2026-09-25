#!/usr/bin/env node

/**
 * SpendWise Personal - Production Health Monitor
 * Monitors authentication, API endpoints, and system health
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://spendwise-personal.onrender.com';
const MONITOR_INTERVAL = 5 * 60 * 1000; // 5 minutes
const LOG_FILE = path.join(__dirname, '..', 'logs', 'health_monitor.log');

class ProductionMonitor {
    constructor() {
        this.results = [];
        this.alerts = [];
        this.isRunning = false;
        
        // Ensure logs directory exists
        const logDir = path.dirname(LOG_FILE);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}`;
        
        console.log(logEntry);
        
        // Append to log file
        fs.appendFileSync(LOG_FILE, logEntry + '\n', 'utf8');
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const req = https.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: data,
                        size: Buffer.byteLength(data, 'utf8')
                    });
                });
            });
            
            req.on('error', reject);
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            if (options.body) {
                req.write(options.body);
            }
            
            req.end();
        });
    }

    async checkEndpoint(name, url, options = {}) {
        const startTime = Date.now();
        
        try {
            const response = await this.makeRequest(url, options);
            const duration = Date.now() - startTime;
            const success = response.status >= 200 && response.status < 400;
            
            const result = {
                name,
                url: url.replace(BASE_URL, ''),
                status: response.status,
                success,
                duration,
                size: response.size,
                timestamp: new Date().toISOString()
            };
            
            if (success) {
                this.log(`✅ ${name}: ${response.status} (${duration}ms)`);
            } else {
                this.log(`❌ ${name}: ${response.status} (${duration}ms)`, 'ERROR');
                this.alerts.push(`${name} failed with status ${response.status}`);
            }
            
            return result;
        } catch (err) {
            const duration = Date.now() - startTime;
            this.log(`❌ ${name}: ${err.message} (${duration}ms)`, 'ERROR');
            this.alerts.push(`${name} error: ${err.message}`);
            
            return {
                name,
                url: url.replace(BASE_URL, ''),
                status: 'ERROR',
                success: false,
                duration,
                error: err.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async checkHealthEndpoints() {
        this.log('🔍 Checking health endpoints...');
        
        const checks = [
            ['Health Check', `${BASE_URL}/health`],
            ['API Health', `${BASE_URL}/api/health`],
        ];
        
        const results = await Promise.all(
            checks.map(([name, url]) => this.checkEndpoint(name, url))
        );
        
        return results;
    }

    async checkAuthentication() {
        this.log('🔐 Testing authentication flow...');
        
        // Test demo login
        const loginResult = await this.checkEndpoint(
            'Demo Login',
            `${BASE_URL}/api/auth/login`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'demo@example.com',
                    password: 'demo123'
                })
            }
        );
        
        if (loginResult.success) {
            try {
                const loginData = JSON.parse(loginResult.body || '{}');
                const token = loginData.token;
                
                if (token) {
                    // Test token verification
                    const verifyResult = await this.checkEndpoint(
                        'Token Verification',
                        `${BASE_URL}/api/auth/me`,
                        {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }
                    );
                    
                    // Test dashboard access
                    const dashboardResult = await this.checkEndpoint(
                        'Dashboard Access',
                        `${BASE_URL}/api/dashboard/overview`,
                        {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }
                    );
                    
                    return [loginResult, verifyResult, dashboardResult];
                }
            } catch (e) {
                this.log(`❌ Login response parsing failed: ${e.message}`, 'ERROR');
            }
        }
        
        return [loginResult];
    }

    async checkPages() {
        this.log('📄 Checking page accessibility...');
        
        const pages = [
            ['Main App', `${BASE_URL}/`],
            ['Demo Page', `${BASE_URL}/demo.html`],
            ['Standalone Demo', `${BASE_URL}/standalone-demo`],
            ['No Auth Demo', `${BASE_URL}/no-auth-demo`]
        ];
        
        const results = await Promise.all(
            pages.map(([name, url]) => this.checkEndpoint(name, url))
        );
        
        return results;
    }

    async runHealthCheck() {
        this.log('🚀 Starting health check cycle...');
        this.alerts = [];
        
        const startTime = Date.now();
        
        try {
            // Run all checks
            const [healthResults, authResults, pageResults] = await Promise.all([
                this.checkHealthEndpoints(),
                this.checkAuthentication(),
                this.checkPages()
            ]);
            
            // Combine all results
            const allResults = [...healthResults, ...authResults, ...pageResults];
            this.results = allResults;
            
            // Calculate summary
            const totalChecks = allResults.length;
            const successCount = allResults.filter(r => r.success).length;
            const failureCount = totalChecks - successCount;
            const successRate = Math.round((successCount / totalChecks) * 100);
            
            const totalDuration = Date.now() - startTime;
            
            this.log(`📊 Health Check Complete: ${successCount}/${totalChecks} passed (${successRate}%) in ${totalDuration}ms`);
            
            // Log alerts if any
            if (this.alerts.length > 0) {
                this.log(`⚠️ ${this.alerts.length} alerts generated:`, 'WARN');
                this.alerts.forEach(alert => this.log(`   - ${alert}`, 'WARN'));
            }
            
            // Save results to file
            this.saveResults({
                timestamp: new Date().toISOString(),
                summary: {
                    totalChecks,
                    successCount,
                    failureCount,
                    successRate,
                    duration: totalDuration
                },
                results: allResults,
                alerts: this.alerts
            });
            
            return {
                success: failureCount === 0,
                successRate,
                alerts: this.alerts
            };
            
        } catch (err) {
            this.log(`❌ Health check failed: ${err.message}`, 'ERROR');
            return {
                success: false,
                successRate: 0,
                alerts: [`Health check system error: ${err.message}`]
            };
        }
    }

    saveResults(data) {
        const resultsFile = path.join(__dirname, '..', 'logs', 'health_results.json');
        
        // Load existing results
        let history = [];
        if (fs.existsSync(resultsFile)) {
            try {
                const existing = fs.readFileSync(resultsFile, 'utf8');
                history = JSON.parse(existing);
            } catch (e) {
                this.log(`Warning: Could not load existing results: ${e.message}`, 'WARN');
            }
        }
        
        // Add new result and keep last 100 entries
        history.push(data);
        if (history.length > 100) {
            history = history.slice(-100);
        }
        
        // Save updated history
        fs.writeFileSync(resultsFile, JSON.stringify(history, null, 2), 'utf8');
    }

    async startMonitoring() {
        if (this.isRunning) {
            this.log('Monitor is already running', 'WARN');
            return;
        }
        
        this.isRunning = true;
        this.log('🎯 Starting continuous monitoring...');
        this.log(`   Interval: ${MONITOR_INTERVAL / 1000 / 60} minutes`);
        this.log(`   Log file: ${LOG_FILE}`);
        
        // Initial health check
        await this.runHealthCheck();
        
        // Set up interval monitoring
        const intervalId = setInterval(async () => {
            if (!this.isRunning) {
                clearInterval(intervalId);
                return;
            }
            
            await this.runHealthCheck();
        }, MONITOR_INTERVAL);
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            this.log('🛑 Received SIGINT, stopping monitor...');
            this.isRunning = false;
            clearInterval(intervalId);
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            this.log('🛑 Received SIGTERM, stopping monitor...');
            this.isRunning = false;
            clearInterval(intervalId);
            process.exit(0);
        });
    }

    stopMonitoring() {
        this.isRunning = false;
        this.log('🛑 Monitoring stopped');
    }
}

// CLI interface
if (require.main === module) {
    const monitor = new ProductionMonitor();
    
    const args = process.argv.slice(2);
    const command = args[0] || 'check';
    
    switch (command) {
        case 'check':
        case 'test':
            monitor.runHealthCheck().then(result => {
                process.exit(result.success ? 0 : 1);
            });
            break;
            
        case 'monitor':
        case 'start':
            monitor.startMonitoring();
            break;
            
        case 'help':
            console.log(`
SpendWise Personal - Production Monitor

Usage:
  node production_monitor.js [command]

Commands:
  check    Run single health check (default)
  monitor  Start continuous monitoring
  help     Show this help

Examples:
  node production_monitor.js check           # Single health check
  node production_monitor.js monitor         # Continuous monitoring
            `);
            break;
            
        default:
            console.log(`Unknown command: ${command}`);
            console.log('Use "node production_monitor.js help" for usage information');
            process.exit(1);
    }
}

module.exports = ProductionMonitor;