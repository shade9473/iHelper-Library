class Logger {
  constructor(options = {}) {
    this.options = {
      logLevel: options.logLevel || 'info',
      enableConsole: options.enableConsole !== false,
      enableFile: options.enableFile || false,
      maxLogFiles: options.maxLogFiles || 5,
      logDirectory: options.logDirectory || './logs'
    };

    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    this.initializeFileLogging();
  }

  initializeFileLogging() {
    if (this.options.enableFile) {
      const fs = require('fs');
      const path = require('path');

      // Ensure log directory exists
      if (!fs.existsSync(this.options.logDirectory)) {
        fs.mkdirSync(this.options.logDirectory, { recursive: true });
      }

      // Rotate log files
      this.rotateLogFiles();
    }
  }

  rotateLogFiles() {
    const fs = require('fs');
    const path = require('path');

    const logFiles = fs.readdirSync(this.options.logDirectory)
      .filter(file => file.endsWith('.log'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(this.options.logDirectory, a));
        const statB = fs.statSync(path.join(this.options.logDirectory, b));
        return statB.mtime.getTime() - statA.mtime.getTime();
      });

    // Remove excess log files
    while (logFiles.length >= this.options.maxLogFiles) {
      const oldestLogFile = logFiles.pop();
      fs.unlinkSync(path.join(this.options.logDirectory, oldestLogFile));
    }
  }

  _log(level, message, metadata = {}) {
    // Check if log level is enabled
    if (this.logLevels[level] > this.logLevels[this.options.logLevel]) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata
    };

    // Console logging
    if (this.options.enableConsole) {
      this._consoleLog(logEntry);
    }

    // File logging
    if (this.options.enableFile) {
      this._fileLog(logEntry);
    }
  }

  _consoleLog(logEntry) {
    const consoleMethod = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    }[logEntry.level];

    consoleMethod(
      `[${logEntry.level.toUpperCase()}] ${logEntry.timestamp}: ${logEntry.message}`,
      logEntry.metadata
    );
  }

  _fileLog(logEntry) {
    const fs = require('fs');
    const path = require('path');

    const logFilePath = path.join(
      this.options.logDirectory, 
      `${new Date().toISOString().split('T')[0]}.log`
    );

    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      fs.appendFileSync(logFilePath, logLine);
    } catch (error) {
      console.error('Failed to write log file:', error);
    }
  }

  error(message, metadata = {}) {
    this._log('error', message, metadata);
  }

  warn(message, metadata = {}) {
    this._log('warn', message, metadata);
  }

  info(message, metadata = {}) {
    this._log('info', message, metadata);
  }

  debug(message, metadata = {}) {
    this._log('debug', message, metadata);
  }

  // Performance tracking method
  trackPerformance(operation, startTime) {
    const duration = Date.now() - startTime;
    this.info(`Performance: ${operation}`, { duration });
    return duration;
  }

  // Error tracking with optional error reporting
  captureError(error, context = {}) {
    this.error('Captured Error', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context
    });

    // Potential integration with error reporting service
    this._reportError(error, context);
  }

  _reportError(error, context) {
    // Placeholder for external error reporting 
    // Could integrate with services like Sentry, LogRocket, etc.
    if (process.env.ERROR_REPORTING_ENABLED) {
      // Hypothetical error reporting logic
      console.log('Reporting error to external service');
    }
  }
}

export default new Logger({
  logLevel: process.env.LOG_LEVEL || 'info',
  enableConsole: process.env.ENABLE_CONSOLE_LOGS !== 'false',
  enableFile: process.env.ENABLE_FILE_LOGS === 'true'
});
