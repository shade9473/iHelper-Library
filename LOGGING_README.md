# Logging in iHelper Resource Library

## 📝 Logging Overview

### Purpose
The logging system is designed to help developers understand application behavior, track performance, and diagnose issues during development and usage.

## 🚀 Features

### Log Levels
- **ERROR**: Critical issues that prevent normal operation
- **WARN**: Potential problems that don't stop the application
- **INFO**: General operational milestones
- **DEBUG**: Detailed diagnostic information

### Performance Tracking
- Tracks 50% of performance events
- Captures duration and key metrics for critical operations

### Error Reporting
- Limits error logging to prevent log spam
- Captures up to 20 errors per session

## 🔧 Configuration

### Basic Configuration
```javascript
{
  logLevel: 'INFO',
  enableConsoleLogging: true,
  performanceTracking: {
    enabled: true,
    sampleRate: 0.5
  },
  errorReporting: {
    enabled: true,
    maxErrorsPerSession: 20
  }
}
```

## 💻 Usage Examples

### Logging Messages
```javascript
import Logger from './utils/Logger';

// Different log levels
Logger.error('Something went wrong');
Logger.warn('Potential issue detected');
Logger.info('Operation completed');
Logger.debug('Detailed diagnostic info');
```

### Performance Tracking
```javascript
// Automatically tracks performance
Logger.startPerformanceTrack('loadContent');
// ... your operation ...
Logger.endPerformanceTrack('loadContent');
```

## 📊 Log History
- Maintains up to 500 log entries
- Accessible via `Logger.getLogHistory()`

## 🔍 Best Practices
- Use appropriate log levels
- Avoid logging sensitive information
- Keep log messages concise and informative

---

**Note**: This is an open-source, free directory. Logging is purely for developmental and user experience improvement purposes.
