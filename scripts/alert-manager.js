const fs = require('fs').promises;
const path = require('path');

const ALERT_LEVELS = {
  CRITICAL: {
    name: 'CRITICAL',
    threshold: 0,
    color: '\x1b[31m', // Red
    emoji: '🚨'
  },
  WARNING: {
    name: 'WARNING',
    threshold: 1,
    color: '\x1b[33m', // Yellow
    emoji: '⚠️'
  },
  INFO: {
    name: 'INFO',
    threshold: 2,
    color: '\x1b[36m', // Cyan
    emoji: 'ℹ️'
  }
};

const ALERT_RULES = {
  availability: {
    critical: 0.99,   // 99%
    warning: 0.995    // 99.5%
  },
  latency: {
    critical: 2000,   // 2s
    warning: 1000     // 1s
  },
  errorRate: {
    critical: 0.02,   // 2%
    warning: 0.01     // 1%
  },
  ssl: {
    critical: true    // Must be valid
  },
  securityHeaders: {
    warning: true     // Should be present
  }
};

class AlertManager {
  constructor() {
    this.alertsPath = path.join(__dirname, '../logs/alerts');
    this.activeAlerts = new Map();
    this.alertHistory = [];
  }

  async initialize() {
    await fs.mkdir(this.alertsPath, { recursive: true });
    await this.loadAlertHistory();
  }

  async loadAlertHistory() {
    const historyFile = path.join(this.alertsPath, 'alert-history.json');
    try {
      const data = await fs.readFile(historyFile, 'utf8');
      this.alertHistory = JSON.parse(data);
    } catch (error) {
      this.alertHistory = [];
    }
  }

  async saveAlertHistory() {
    const historyFile = path.join(this.alertsPath, 'alert-history.json');
    await fs.writeFile(
      historyFile,
      JSON.stringify(this.alertHistory, null, 2)
    );
  }

  evaluateMetrics(metrics) {
    const alerts = [];

    // Check availability
    if (metrics.availability < ALERT_RULES.availability.critical) {
      alerts.push(this.createAlert(
        'CRITICAL',
        'Availability Critical',
        `Availability dropped to ${(metrics.availability * 100).toFixed(2)}%`,
        metrics
      ));
    } else if (metrics.availability < ALERT_RULES.availability.warning) {
      alerts.push(this.createAlert(
        'WARNING',
        'Availability Warning',
        `Availability at ${(metrics.availability * 100).toFixed(2)}%`,
        metrics
      ));
    }

    // Check latency
    if (metrics.latency.p95 > ALERT_RULES.latency.critical) {
      alerts.push(this.createAlert(
        'CRITICAL',
        'High Latency Critical',
        `P95 latency at ${metrics.latency.p95}ms`,
        metrics
      ));
    } else if (metrics.latency.p95 > ALERT_RULES.latency.warning) {
      alerts.push(this.createAlert(
        'WARNING',
        'High Latency Warning',
        `P95 latency at ${metrics.latency.p95}ms`,
        metrics
      ));
    }

    // Check error rate
    if (metrics.errorRate > ALERT_RULES.errorRate.critical) {
      alerts.push(this.createAlert(
        'CRITICAL',
        'High Error Rate Critical',
        `Error rate at ${(metrics.errorRate * 100).toFixed(2)}%`,
        metrics
      ));
    } else if (metrics.errorRate > ALERT_RULES.errorRate.warning) {
      alerts.push(this.createAlert(
        'WARNING',
        'High Error Rate Warning',
        `Error rate at ${(metrics.errorRate * 100).toFixed(2)}%`,
        metrics
      ));
    }

    return alerts;
  }

  createAlert(level, title, message, data) {
    const alert = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      level,
      title,
      message,
      timestamp: new Date().toISOString(),
      data
    };

    this.activeAlerts.set(alert.id, alert);
    this.alertHistory.push(alert);
    this.notifyAlert(alert);
    this.saveAlertHistory().catch(console.error);

    return alert;
  }

  resolveAlert(alertId) {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.resolvedAt = new Date().toISOString();
      this.activeAlerts.delete(alertId);
      this.saveAlertHistory().catch(console.error);
      return true;
    }
    return false;
  }

  getActiveAlerts() {
    return Array.from(this.activeAlerts.values());
  }

  getAlertHistory(options = {}) {
    let alerts = [...this.alertHistory];
    
    if (options.level) {
      alerts = alerts.filter(a => a.level === options.level);
    }
    
    if (options.since) {
      alerts = alerts.filter(a => new Date(a.timestamp) > new Date(options.since));
    }
    
    return alerts;
  }

  notifyAlert(alert) {
    const level = ALERT_LEVELS[alert.level];
    const timestamp = new Date(alert.timestamp).toLocaleString();
    
    console.log(`\n${level.emoji} ${level.color}[${alert.level}]\x1b[0m ${timestamp}`);
    console.log(`${level.color}${alert.title}\x1b[0m`);
    console.log(alert.message);
    
    if (alert.data) {
      console.log('\nMetrics at time of alert:');
      console.log(JSON.stringify(alert.data, null, 2));
    }
  }

  async generateAlertReport() {
    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    
    const report = {
      timestamp: now.toISOString(),
      activeAlerts: this.getActiveAlerts(),
      last24Hours: this.getAlertHistory({ since: last24h }),
      statistics: {
        critical: this.alertHistory.filter(a => a.level === 'CRITICAL').length,
        warning: this.alertHistory.filter(a => a.level === 'WARNING').length,
        info: this.alertHistory.filter(a => a.level === 'INFO').length
      }
    };

    const reportFile = path.join(
      this.alertsPath,
      `alert-report-${now.toISOString().split('T')[0]}.json`
    );

    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    return report;
  }
}

module.exports = new AlertManager();
