const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class NotificationManager {
  constructor() {
    this.config = {
      email: {
        enabled: false,
        from: 'alerts@ihelper.tech',
        to: [],
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        }
      },
      alertLevels: {
        CRITICAL: {
          email: true,
          color: '#FF0000',
          emoji: '🚨'
        },
        WARNING: {
          email: true,
          color: '#FFA500',
          emoji: '⚠️'
        },
        INFO: {
          email: false,
          color: '#0000FF',
          emoji: 'ℹ️'
        }
      }
    };

    this.transporter = null;
    this.notificationLog = path.join(__dirname, '../logs/notifications');
  }

  async initialize(config = {}) {
    this.config = { ...this.config, ...config };
    await fs.mkdir(this.notificationLog, { recursive: true });

    if (this.config.email.enabled) {
      this.transporter = nodemailer.createTransport(this.config.email.smtp);
      await this.verifyEmailConnection();
    }
  }

  async verifyEmailConnection() {
    try {
      await this.transporter.verify();
      console.log('📧 Email notification system ready');
      return true;
    } catch (error) {
      console.error('❌ Email system verification failed:', error.message);
      return false;
    }
  }

  async sendEmail(alert) {
    if (!this.config.email.enabled || !this.transporter) {
      return false;
    }

    const level = this.config.alertLevels[alert.level];
    if (!level.email) {
      return false;
    }

    const emailContent = this.generateEmailContent(alert);
    
    try {
      const info = await this.transporter.sendMail({
        from: this.config.email.from,
        to: this.config.email.to.join(', '),
        subject: `[${alert.level}] ${alert.title} - iHelper Library`,
        html: emailContent
      });

      await this.logNotification({
        type: 'email',
        alertId: alert.id,
        timestamp: new Date().toISOString(),
        success: true,
        messageId: info.messageId
      });

      return true;
    } catch (error) {
      await this.logNotification({
        type: 'email',
        alertId: alert.id,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      });

      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  generateEmailContent(alert) {
    const level = this.config.alertLevels[alert.level];
    const timestamp = new Date(alert.timestamp).toLocaleString();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .alert-header { 
            padding: 10px;
            background-color: ${level.color}20;
            border-left: 4px solid ${level.color};
          }
          .alert-title {
            color: ${level.color};
            font-size: 20px;
            font-weight: bold;
          }
          .alert-meta {
            color: #666;
            font-size: 14px;
          }
          .alert-message {
            margin: 20px 0;
            padding: 10px;
            background-color: #f5f5f5;
          }
          .metrics {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="alert-header">
          <div class="alert-title">
            ${level.emoji} ${alert.title}
          </div>
          <div class="alert-meta">
            Level: ${alert.level} | Time: ${timestamp}
          </div>
        </div>

        <div class="alert-message">
          ${alert.message}
        </div>

        ${alert.data ? `
          <div class="metrics">
            <h3>System Metrics at Time of Alert</h3>
            <pre>${JSON.stringify(alert.data, null, 2)}</pre>
          </div>
        ` : ''}

        <div class="footer">
          <p>This is an automated alert from the iHelper Library Monitoring System.</p>
          <p>View the monitoring dashboard: https://ihelper.tech/monitoring</p>
        </div>
      </body>
      </html>
    `;
  }

  async logNotification(data) {
    const logFile = path.join(
      this.notificationLog,
      `notifications-${new Date().toISOString().split('T')[0]}.json`
    );

    try {
      const existingLog = await fs.readFile(logFile, 'utf8')
        .then(JSON.parse)
        .catch(() => ({ notifications: [] }));

      existingLog.notifications.push(data);

      await fs.writeFile(logFile, JSON.stringify(existingLog, null, 2));
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  async getNotificationStats(since = new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    const stats = {
      total: 0,
      success: 0,
      failed: 0,
      byType: {},
      byLevel: {}
    };

    const files = await fs.readdir(this.notificationLog);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const logFile = path.join(this.notificationLog, file);
      const log = JSON.parse(await fs.readFile(logFile, 'utf8'));

      log.notifications
        .filter(n => new Date(n.timestamp) >= since)
        .forEach(notification => {
          stats.total++;
          stats.success += notification.success ? 1 : 0;
          stats.failed += notification.success ? 0 : 1;

          stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
          if (notification.level) {
            stats.byLevel[notification.level] = (stats.byLevel[notification.level] || 0) + 1;
          }
        });
    }

    return stats;
  }
}

module.exports = new NotificationManager();
