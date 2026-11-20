/**
 * VAYUWISE AI - Centralized Safe Error Handling Middleware
 * Prevents disclosure of stack traces, internal paths, or credentials to clients.
 * Properly handles 413 Payload Too Large and 400 Malformed JSON errors.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Check for body-parser payload limit exceeded
  const errObj = (err && typeof err === 'object') ? err as Record<string, unknown> : {};

  if (errObj.type === 'entity.too.large' || errObj.status === 413) {
    logger.warn('Request payload exceeded size limit', { path: req.path, ip: req.ip });
    res.status(413).json({
      success: false,
      error: 'Payload too large. Maximum allowed request size is 15 KB.',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Check for malformed JSON body
  if (err instanceof SyntaxError && 'body' in err && errObj.status === 400) {
    logger.warn('Malformed JSON syntax in request body', { path: req.path });
    res.status(400).json({
      success: false,
      error: 'Malformed JSON payload. Please verify request syntax.',
      timestamp: new Date().toISOString()
    });
    return;
  }

  const statusCode = typeof errObj.statusCode === 'number'
    ? errObj.statusCode
    : typeof errObj.status === 'number'
    ? errObj.status
    : 500;

  const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';

  // Sanitize error before logging: redact any bearer tokens or keys
  const safeMessage = errorMessage.replace(/(Bearer\s+[A-Za-z0-9._-]+)|(AIza[0-9A-Za-z-_]{35})/g, '[REDACTED]');
  logger.error(`Unhandled error during request [${req.method} ${req.path}]: ${safeMessage}`, {
    statusCode,
    path: req.path
  });

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'An unexpected server error occurred. Please try again later.' : safeMessage,
    timestamp: new Date().toISOString()
  });
}
