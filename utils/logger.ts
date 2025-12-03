/**
 * Logger Utility
 * Centralized logging for authentication and user actions
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  metadata?: Record<string, any>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  /**
   * Log an event
   */
  private log(level: LogLevel, category: string, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata,
    };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output with formatting
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${category}]`;
    const logMessage = metadata
      ? `${prefix} ${message} ${JSON.stringify(metadata, null, 2)}`
      : `${prefix} ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'debug':
        if (__DEV__) {
          console.log(logMessage);
        }
        break;
      default:
        console.log(logMessage);
    }

    // In production, you could send logs to a logging service
    // Example: Sentry, LogRocket, etc.
    if (!__DEV__ && level === 'error') {
      // Send error logs to external service
      // this.sendToLoggingService(entry);
    }
  }

  /**
   * Log info level
   */
  info(category: string, message: string, metadata?: Record<string, any>) {
    this.log('info', category, message, metadata);
  }

  /**
   * Log warning level
   */
  warn(category: string, message: string, metadata?: Record<string, any>) {
    this.log('warn', category, message, metadata);
  }

  /**
   * Log error level
   */
  error(category: string, message: string, metadata?: Record<string, any>) {
    this.log('error', category, message, metadata);
  }

  /**
   * Log debug level (only in development)
   */
  debug(category: string, message: string, metadata?: Record<string, any>) {
    this.log('debug', category, message, metadata);
  }

  /**
   * Get recent logs
   */
  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    if (category) {
      filtered = filtered.filter(log => log.category === category);
    }

    return filtered;
  }

  /**
   * Clear all logs
   */
  clear() {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions for common categories
export const authLogger = {
  signIn: (email: string, success: boolean, error?: string) => {
    logger.info('AUTH', 'Sign in attempt', {
      email,
      success,
      error,
      action: 'sign_in',
    });
  },
  signUp: (email: string, success: boolean, userId?: string, error?: string) => {
    logger.info('AUTH', 'Sign up attempt', {
      email,
      success,
      userId,
      error,
      action: 'sign_up',
    });
  },
  signOut: (userId?: string) => {
    logger.info('AUTH', 'Sign out', {
      userId,
      action: 'sign_out',
    });
  },
  profileCreated: (userId: string, email: string) => {
    logger.info('AUTH', 'Profile created', {
      userId,
      email,
      action: 'profile_created',
    });
  },
  profileUpdate: (userId: string, fields: string[]) => {
    logger.info('USER', 'Profile updated', {
      userId,
      fields,
      action: 'profile_update',
    });
  },
  profileLoaded: (userId: string, profileData: {
    displayName: string;
    hasAvatar: boolean;
    hasBio: boolean;
    city?: string | null;
    country?: string | null;
    learningLanguagesCount: number;
    teachingLanguagesCount: number;
  }) => {
    logger.info('AUTH', 'Profile loaded after login', {
      userId,
      ...profileData,
      action: 'profile_loaded',
    });
  },
  sessionEstablished: (userId: string, email: string) => {
    logger.info('AUTH', 'Session established', {
      userId,
      email,
      action: 'session_established',
    });
  },
};

