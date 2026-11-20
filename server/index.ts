/**
 * VAYUWISE AI - Express 5 Production Application Server
 * Breathe Smarter. Live Safer. Build Cleaner Communities.
 */

import express from 'express';
import path from 'node:path';
import dotenv from 'dotenv';
import { configureSecurityHeaders, configureCORS } from './middleware/security.js';
import { standardApiLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { initializeGenAI } from './services/aiService.js';
import { initializeFirebaseAdmin } from './services/firestoreService.js';

// Route handlers
import { healthRouter } from './routes/health.js';
import { airQualityRouter } from './routes/airQuality.js';
import { routinesRouter } from './routes/routines.js';
import { commuteRouter } from './routes/commute.js';
import { iaqRouter } from './routes/iaq.js';
import { communityRouter } from './routes/community.js';
import { advisoriesRouter } from './routes/advisories.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize external gateways
initializeGenAI();
initializeFirebaseAdmin();

// Security and parsing middleware
app.use(configureSecurityHeaders());
app.use(configureCORS());
// Express stream-level payload bounds strictly enforced against chunked or spoofed requests
app.use(express.json({ limit: '15kb' }));
app.use(express.urlencoded({ limit: '15kb', extended: true }));
app.use(standardApiLimiter);

// API route registrations
app.use('/api/health', healthRouter);
app.use('/api/air-quality', airQualityRouter);
app.use('/api', routinesRouter);
app.use('/api/commute', commuteRouter);
app.use('/api/iaq', iaqRouter);
app.use('/api/community', communityRouter);
app.use('/api/advisories', advisoriesRouter);
app.use('/api', advisoriesRouter); // Covers /api/emergency-advisory

// Static asset serving in production
const clientDistPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(clientDistPath));

// Fallback route for SPA client-side routing
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.path}`
    });
    return;
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // In dev mode when client has not been built to dist yet
      res.status(200).send('VAYUWISE AI Backend API is running. Start the Vite dev server for the frontend.');
    }
  });
});

// Centralized safe error middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`VAYUWISE AI Server running on port ${PORT} [NODE_ENV=${process.env.NODE_ENV || 'development'}]`);
  });
}

export default app;
