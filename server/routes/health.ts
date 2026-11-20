/**
 * VAYUWISE AI - Health Check Route
 */

import { Router, Request, Response } from 'express';

export const healthRouter = Router();

export function getHealthStatus() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'VAYUWISE AI Backend Gateway',
    version: '1.0.0',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_gemini_api_key')),
    firebaseConfigured: Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY)
  };
}

healthRouter.get('/', (_req: Request, res: Response) => {
  res.json(getHealthStatus());
});
