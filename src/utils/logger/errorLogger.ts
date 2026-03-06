import { Request, Response, NextFunction } from 'express';
import { logger } from './index';

/**
 * Global Error Logger Middleware
 * Captures any unhandled errors in the Express pipeline and logs them with the request context.
 * 
 * Usage: Should be placed AFTER all routes and controllers in server.ts
 */
export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Use the pino-http child logger if available to maintain Request ID tracing
  const reqLogger = req.log || logger;

  // Log the full error stack trace alongside minimal request details
  reqLogger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name
      },
      // Include context of where the error happened
      context: {
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
      }
    },
    'Unhandled exception caught by global error logger'
  );

  // Pass the error to the next error handling middleware (if any)
  // or default Express error handler
  next(err);
};
