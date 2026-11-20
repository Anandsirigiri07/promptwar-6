/**
 * VAYUWISE AI - API Rate Limiting Middleware
 * Protects server and GenAI quota from abuse.
 */

import rateLimit from 'express-rate-limit';

export const standardApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  limit: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again in one minute.'
  }
});

export const aiEndpointLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  limit: 30, // 30 requests per minute strictly bounded
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI analysis quota limit reached. Please wait 60 seconds before generating new advice.'
  }
});
