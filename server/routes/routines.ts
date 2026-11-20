/**
 * VAYUWISE AI - Personalized Routine & Exposure Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AIService } from '../services/aiService.js';
import { validateBody } from '../middleware/validation.js';
import { RoutineRequestSchema, ExposureExplainRequestSchema } from '../validators/routine.schema.js';
import { aiEndpointLimiter } from '../middleware/rateLimit.js';
import { invertPM25SubIndex } from '../../src/lib/compute/aqiBreakpoints.js';

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
      const { activity, durationMinutes, locationType, currentAQI, ambientPM25, pm25SubIndex, standard, isMasked } = req.body;
      const hours = durationMinutes / 60;

      let effectivePM25: number | null = null;
      let pm25Source = 'Unavailable';
      let isDerived = false;

      // Request fields originate in the browser and are not independently verified here.
      // Never label a client-provided concentration as a confirmed station measurement.
      if (typeof ambientPM25 === 'number' && Number.isFinite(ambientPM25) && ambientPM25 >= 0) {
        effectivePM25 = ambientPM25;
        pm25Source = 'Client-provided PM2.5 value (source not independently verified by server)';
      } else if (typeof pm25SubIndex === 'number' && Number.isFinite(pm25SubIndex) && pm25SubIndex >= 0) {
        const inverted = invertPM25SubIndex(pm25SubIndex, standard || 'CPCB');
        if (inverted !== null) {
          effectivePM25 = inverted;
          pm25Source = `Client-provided PM2.5 sub-index, converted using ${standard || 'CPCB'} breakpoints (not source-verified)`;
          isDerived = true;
        }
      }

      // If PM2.5 cannot be determined (e.g. only overall AQI provided without pollutant sub-index)
      if (effectivePM25 === null) {
        res.json({
          success: true,
          data: {
            activity,
            durationMinutes,
            locationType,
            effectivePM25Concentration_ugm3: null,
            pm25Source: 'Unavailable',
            estimatedInhaledDose_ug: null,
            isAvailable: false,
            isMasked,
            explanation: `Inhaled PM2.5 particulate mass dose cannot be determined from overall AQI alone (${currentAQI ?? 'unknown'}). Overall AQI is determined by the highest sub-index among all criteria pollutants (PM10, NO2, SO2, CO, O3) and does not identify PM2.5 mass concentration. Direct PM2.5 concentration (µg/m³) or explicit PM2.5 sub-index is required for physical inhalation calculations.`,
            methodology: 'Not calculated because a valid PM2.5 concentration or PM2.5 sub-index is unavailable.'
          }
        });
        return;
      }

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
          pm25Source,
          isDerived,
          isAvailable: true,
          estimatedInhaledDose_ug: inhaledDose,
          isMasked,
          explanation: `Illustrative scenario estimate for ${durationMinutes} minutes of ${activity} (${locationType}) using ${effectivePM25} µg/m³ PM2.5. Source: ${pm25Source}. The simplified result (${inhaledDose} µg) assumes a generic breathing rate and fixed penetration factor; it is not a personal measurement, lung-deposited dose or clinical outcome. N95 benefit depends on respirator quality, fit and consistent use.`,
          methodology: 'Inhaled Dose = PM2.5 (µg/m³) × Duration (h) × Respiration Rate (m³/h) × (1 - Filtration Efficiency)'
        }
      });
    } catch (err) {
      next(err);
    }
  }
);
