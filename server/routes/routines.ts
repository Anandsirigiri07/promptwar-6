/**
 * VAYUWISE AI - Personalized Routine & Exposure Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AIService } from '../services/aiService.js';
import { validateBody } from '../middleware/validation.js';
import { RoutineRequestSchema, ExposureExplainRequestSchema } from '../validators/routine.schema.js';
import { aiEndpointLimiter } from '../middleware/rateLimit.js';

export const routinesRouter = Router();

routinesRouter.post(
  '/routine-insights',
  aiEndpointLimiter,
  validateBody(RoutineRequestSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const routine = await AIService.generatePersonalizedRoutine(req.body);
      res.json({
        success: true,
        data: routine
      });
    } catch (err) {
      next(err);
    }
  }
);

routinesRouter.post(
  '/exposure/explain',
  aiEndpointLimiter,
  validateBody(ExposureExplainRequestSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { activity, durationMinutes, locationType, currentAQI, isMasked } = req.body;
      const hours = durationMinutes / 60;
      const approximatePM25 = currentAQI * 0.75;
      const ventilationRate = activity.toLowerCase().includes('run') || activity.toLowerCase().includes('cycl') ? 1.8 : 0.55;
      const penetration = isMasked ? 0.10 : (locationType === 'indoor' ? 0.40 : 1.0);
      const inhaledDose = Math.round(approximatePM25 * hours * ventilationRate * penetration * 10) / 10;

      res.json({
        success: true,
        data: {
          activity,
          durationMinutes,
          locationType,
          estimatedInhaledDose_ug: inhaledDose,
          isMasked,
          explanation: `During ${durationMinutes} mins of ${activity} (${locationType}), an estimated ${inhaledDose} µg of PM2.5 would be inhaled. ${
            isMasked ? 'Wearing an N95 respirator reduced your particulate deposition by ~90%.' : 'Consider an N95 mask or shifting to indoor filtered air to reduce lung deposition.'
          }`,
          methodology: 'Inhaled Dose = Ambient Concentration × Duration (h) × Respiration Rate (m³/h) × (1 - Filtration Efficiency)'
        }
      });
    } catch (err) {
      next(err);
    }
  }
);
