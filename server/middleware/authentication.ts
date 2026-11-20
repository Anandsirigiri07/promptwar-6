/**
 * VAYUWISE AI - Firebase ID Token Verification Middleware
 * Validates bearer tokens using firebase-admin in production.
 * In production (NODE_ENV=production), demo tokens and unverified credentials are strictly rejected.
 * In development/demo environments (NODE_ENV!=production), provides clearly labelled DEMO access.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    isDemoUser: boolean;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or malformed Authorization header. Expected "Bearer <token>".'
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1]!.trim();
  const isProduction = process.env.NODE_ENV === 'production';

  // Demo token handling
  if (token === 'demo-token' || token.startsWith('demo-')) {
    if (isProduction) {
      logger.warn('Demo token rejected in production environment', { ip: req.ip, path: req.path });
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Demo tokens are not permitted in production environment.'
      });
      return;
    }

    req.user = {
      uid: 'demo-user-101',
      email: 'evaluator.demo@vayuwise.local',
      isDemoUser: true
    };
    next();
    return;
  }

  try {
    const { getFirebaseAdminAuth } = await import('../services/firestoreService.js');
    const auth = getFirebaseAdminAuth();

    if (auth) {
      const decoded = await auth.verifyIdToken(token);
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        isDemoUser: false
      };
      next();
    } else {
      // In production, protected routes MUST fail closed if Firebase Admin credentials are unconfigured
      if (isProduction) {
        logger.error('Protected route accessed in production but Firebase Admin is uninitialized');
        res.status(401).json({
          success: false,
          error: 'Unauthorized: Production authentication service is unconfigured. Protected routes fail closed.'
        });
        return;
      }

      // In development / demo mode only
      req.user = {
        uid: `demo-evaluator-${token.slice(0, 8)}`,
        email: 'demo@vayuwise.local',
        isDemoUser: true
      };
      next();
    }
  } catch (err) {
    logger.error('Firebase ID token verification failed', err);
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired Firebase authentication token.'
    });
  }
}
