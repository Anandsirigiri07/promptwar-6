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

/**
 * Inverts CPCB NAQI breakpoints for PM2.5 to derive physically grounded concentration.
 * Avoids unscientific fixed scalar multipliers like AQI * 0.75.
 */
function invertCPCBPM25(aqi: number): number {
  if (aqi <= 50) return Math.round((aqi / 50) * 30);
  if (aqi <= 100) return Math.round(31 + ((aqi - 51) / 49) * 29);
  if (aqi <= 200) return Math.round(61 + ((aqi - 101) / 99) * 29);
  if (aqi <= 300) return Math.round(91 + ((aqi - 201) / 99) * 29);
  if (aqi <= 400) return Math.round(121 + ((aqi - 301) / 99) * 129);
  return Math.round(251 + ((Math.min(500, aqi) - 401) / 99) * 249);
}

routinesRouter.post(
  '/exposure/explain',
  aiEndpointLimiter,
  validateBody(ExposureExplainRequestSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { activity, durationMinutes, locationType, currentAQI, ambientPM25, isMasked } = req.body;
      const hours = durationMinutes / 60;

      // Use actual observed PM2.5 concentration when provided; otherwise invert CPCB breakpoints
      const effectivePM25 = typeof ambientPM25 === 'number' ? ambientPM25 : invertCPCBPM25(currentAQI);
      const isDerived = typeof ambientPM25 !== 'number';

      const ventilationRate = activity.toLowerCase().includes('run') || activity.toLowerCase().includes('cycl') ? 1.8 : 0.55;
      const penetration = isMasked ? 0.10 : (locationType === 'indoor' ? 0.40 : 1.0);
      const inhaledDose = Math.round(effectivePM25 * hours * ventilationRate * penetration * 10) / 10;

      res.json({
        success: true,
        data: {
          activity,
          durationMinutes,
          locationType,
          effectivePM25Concentration_ugm3: effectivePM25,
          pm25Source: isDerived
            ? 'Inverted CPCB NAQI piecewise polynomial (Dominant PM2.5 assumption)'
            : 'Direct station/provider PM2.5 measurement',
          estimatedInhaledDose_ug: inhaledDose,
          isMasked,
          explanation: `During ${durationMinutes} mins of ${activity} (${locationType}) under ${effectivePM25} µg/m³ PM2.5, an estimated ${inhaledDose} µg of particulates enters the pulmonary tract. ${
            isMasked ? 'Wearing an N95 respirator reduced your particulate deposition by ~90%.' : 'An N95 respirator or indoor filtered air can reduce lung deposition by 60%–90%.'
          }`,
          methodology: 'Inhaled Dose = PM2.5 (µg/m³) × Duration (h) × Respiration Rate (m³/h) × (1 - Filtration Efficiency)'
        }
      });
    } catch (err) {
      next(err);
    }
  }
);
