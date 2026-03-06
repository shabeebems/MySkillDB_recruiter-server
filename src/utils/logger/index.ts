import pino from 'pino';

// 1. Environment-based log levels: development = debug, production = info
const isProduction = process.env.NODE_ENV === 'production';
const logLevel = isProduction ? 'info' : 'debug';

// 2. Base logger configuration
export const logger = pino({
  level: logLevel,
  // Ensure timestamps are included, using standard ISO format for better parsing in log aggregators (e.g., Datadog, ELK)
  timestamp: pino.stdTimeFunctions.isoTime,
  
  // 3. Output pretty logs in development, JSON in production
  // pino-pretty should only be used in dev to prevent performance overhead in production
  ...(isProduction ? {} : {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname'
      }
    }
  }),
  
  formatters: {
    // Standardize log levels to string (e.g., 'info' instead of 30) for easier querying in Cloud Logging/Datadog
    level: (label) => {
      return { level: label };
    },
  },
  
  // Redact sensitive information to prevent PII exposure in logs
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'req.body.token'],
    censor: '***REDACTED***'
  }
});

/**
 * Creates a child logger bound to a specific module or context.
 * Best practice for this architecture: Use this in services/controllers
 * to automatically attach module names to all logs from that file.
 * 
 * @param moduleName - Name of the file/module/service
 * @example
 * const log = createChildLogger('AuthService');
 * log.info('User logged in'); // Output will include {"module": "AuthService"}
 */
export const createChildLogger = (moduleName: string) => {
  return logger.child({ module: moduleName });
};
