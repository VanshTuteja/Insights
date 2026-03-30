import config from '../config';

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  meta?: any;
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = config.nodeEnv === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private normalizeMeta(meta?: any): any {
    if (meta instanceof Error) {
      return {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
        ...(meta as any).cause ? { cause: (meta as any).cause } : {},
      };
    }

    if (Array.isArray(meta)) {
      return meta.map((item) => this.normalizeMeta(item));
    }

    if (!meta || typeof meta !== 'object') {
      return meta;
    }

    const normalized: Record<string, any> = {};
    for (const [key, value] of Object.entries(meta)) {
      normalized[key] = value instanceof Error ? this.normalizeMeta(value) : value;
    }
    return normalized;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const normalizedMeta = this.normalizeMeta(meta);
    const logEntry: LogEntry = {
      level: level.toUpperCase(),
      message,
      timestamp,
      ...(normalizedMeta && { meta: normalizedMeta }),
    };

    if (config.nodeEnv === 'production') {
      return JSON.stringify(logEntry);
    }

    // Development formatting with colors
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[35m', // Magenta
      RESET: '\x1b[0m',  // Reset
    };

    const color = colors[level.toUpperCase() as keyof typeof colors] || colors.RESET;
    let formatted = `${color}[${timestamp}] ${level.toUpperCase()}:${colors.RESET} ${message}`;

    if (normalizedMeta) {
      formatted += `\n${colors.DEBUG}Meta:${colors.RESET} ${JSON.stringify(normalizedMeta, null, 2)}`;
    }

    return formatted;
  }

  private log(level: LogLevel, levelName: string, message: string, meta?: any): void {
    if (level <= this.logLevel) {
      const formatted = this.formatMessage(levelName, message, meta);
      
      if (level === LogLevel.ERROR) {
        console.error(formatted);
      } else if (level === LogLevel.WARN) {
        console.warn(formatted);
      } else {
        console.log(formatted);
      }
    }
  }

  error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, meta);
  }

  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, meta);
  }

  // HTTP request logging
  request(method: string, url: string, statusCode: number, responseTime: number, userAgent?: string): void {
    const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;
    const meta = { method, url, statusCode, responseTime, userAgent };
    
    if (statusCode >= 500) {
      this.error(message, meta);
    } else if (statusCode >= 400) {
      this.warn(message, meta);
    } else {
      this.info(message, meta);
    }
  }

  // Database operation logging
  database(operation: string, collection: string, duration: number, error?: Error): void {
    const message = `DB ${operation} on ${collection} - ${duration}ms`;
    const meta = { operation, collection, duration };

    if (error) {
      this.error(`${message} - FAILED`, { ...meta, error: error.message, stack: error.stack });
    } else {
      this.debug(message, meta);
    }
  }

  // Authentication logging
  auth(action: string, userId?: string, email?: string, success: boolean = true, error?: string): void {
    const message = `Auth ${action} ${success ? 'SUCCESS' : 'FAILED'}`;
    const meta = { action, userId, email, success, ...(error && { error }) };

    if (success) {
      this.info(message, meta);
    } else {
      this.warn(message, meta);
    }
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
