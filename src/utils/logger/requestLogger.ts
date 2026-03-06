import { v4 as uuidv4 } from 'uuid';
import pinoHttp from 'pino-http';
import { logger } from './index';

// 5. Use pino-http for request logging
// This middleware automatically logs all incoming HTTP requests and outgoing responses
// It also attaches a child logger to `req.log` containing the request context
export const requestLogger = pinoHttp({
  logger,
  
  // 4. Request ID support
  // Generates a unique UUID for each request if one isn't already provided by a load balancer
  genReqId: function (req, res) {
    const existingId = req.id || req.headers['x-request-id'] || req.headers['x-correlation-id'];
    if (existingId) return existingId;
    
    const id = uuidv4();
    res.setHeader('X-Request-Id', id);
    return id;
  },

  // Custom log levels based on HTTP status codes
  // This helps immediately identify warnings and errors in log dashboards
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn'; // Client errors (e.g. 404, 401)
    } else if (res.statusCode >= 500 || err) {
      return 'error'; // Server errors (e.g. 500)
    }
    // Optimize: successful health checks can be debug level to reduce noise
    if (req.url === '/health' && res.statusCode === 200) {
      return 'debug';
    }
    return 'info'; // Happy path (e.g. 200, 201)
  },

  // Customize the success message to be more readable
  customSuccessMessage: function (req, res) {
    return `${req.method} ${req.url} completed with status ${res.statusCode}`;
  },

  // Customize the error message
  customErrorMessage: function (req, res, err) {
    return `${req.method} ${req.url} failed with status ${res.statusCode}: ${err.message}`;
  },
  
  // Custom serializers to shape the req/res objects before logging
  // Keeping logs slim saves cost and makes reading them easier
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      // Intentionally omitting body to prevent PII leaks, 
      // body can be selectively logged in controllers if strictly necessary
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      responseTime: res.responseTime
    })
  }
});
