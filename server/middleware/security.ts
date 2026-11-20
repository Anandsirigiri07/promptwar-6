/**
 * VAYUWISE AI - Security Headers, CORS, and Payload Limiter
 * Implements strict CSP via Helmet and granular CORS origin control.
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import { logger } from '../utils/logger.js';

export function configureSecurityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline only for Vite hot reload / injected script tags
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com', 'https://firestore.googleapis.com'],
        fontSrc: ["'self'", 'https:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xContentTypeOptions: true,
    dnsPrefetchControl: { allow: false }
  });
}

export function configureCORS() {
  const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3001')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin server requests)
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Rejected CORS request from unauthorized origin: ${origin}`);
        callback(new Error('Not allowed by CORS policy'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400
  };

  return cors(corsOptions);
}

/**
 * Bounds JSON payload size to 15KB standard baseline to prevent payload DOS
 */
export function requestSizeLimit(limitBytes = 15 * 1024) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > limitBytes) {
      res.status(413).json({
        success: false,
        error: `Payload too large. Maximum allowed size is ${limitBytes / 1024} KB.`
      });
      return;
    }
    next();
  };
}
