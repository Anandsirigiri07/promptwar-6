/**
 * VAYUWISE AI - Zod Request Validation Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = (result.error as ZodError).issues.map(i => ({
        path: i.path.join('.'),
        message: i.message
      }));
      logger.warn('Validation error on request body', { issues, path: req.path });
      res.status(400).json({
        success: false,
        error: 'Validation failed for request payload',
        details: issues
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const issues = (result.error as ZodError).issues.map(i => ({
        path: i.path.join('.'),
        message: i.message
      }));
      res.status(400).json({
        success: false,
        error: 'Validation failed for query parameters',
        details: issues
      });
      return;
    }
    // In Express 5, req.query has only a getter on the request prototype.
    // Safely assign validated properties onto the query object without reassigning the reference.
    if (req.query && typeof req.query === 'object') {
      Object.assign(req.query, result.data);
    }
    res.locals.validatedQuery = result.data;
    next();
  };
}
