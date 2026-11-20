/**
 * VAYUWISE AI - Centralized Safe Error Handling Middleware
 * Prevents disclosure of stack traces, internal paths, or credentials to clients.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = (err && typeof err === 'object' && 'statusCode' in err && typeof err.statusCode === 'number')
    ? err.statusCode
    : 500;

  const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';

  logger.error(`Unhandled error during request [${req.method} ${req.path}]`, err);

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'An unexpected server error occurred. Please try again later.' : errorMessage,
    timestamp: new Date().toISOString()
  });
}
