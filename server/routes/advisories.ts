/**
 * VAYUWISE AI - Emergency Advisories & Multilingual AI Briefing Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../middleware/validation.js';
import { EmergencyAdvisoryRequestSchema } from '../validators/user.schema.js';
import { AIService } from '../services/aiService.js';
import { aiEndpointLimiter } from '../middleware/rateLimit.js';
import { LOCALIZATION_DATA } from '../../src/lib/localization.js';

export const advisoriesRouter = Router();

advisoriesRouter.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const defaultAdvisory = await AIService.generateEmergencyAdvisory({
        city: 'Bengaluru / Delhi NCR',
        aqi: 285,
        dominantPollutant: 'pm25',
        inversionStrength: 'Moderate',
        language: 'en'
      });

      res.json({
        success: true,
        data: {
          latestAdvisory: defaultAdvisory,
          officialHealthHotline: '1075 (National Health Advisory Helpline - India)',
          airQualityMonitoringAuthority: 'CPCB / SPCB Continuous Ambient Air Quality Monitoring Network (CAAQMS)',
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

advisoriesRouter.post(
  '/emergency-advisory',
  aiEndpointLimiter,
  validateBody(EmergencyAdvisoryRequestSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { city, aqi, dominantPollutant, inversionStrength, language } = req.body;

      const advisory = await AIService.generateEmergencyAdvisory({
        city,
        aqi,
        dominantPollutant,
        inversionStrength,
        language
      });

      const localizedStrings = LOCALIZATION_DATA[language as keyof typeof LOCALIZATION_DATA] || LOCALIZATION_DATA.en;

      res.json({
        success: true,
        data: {
          ...advisory,
          localizedStrings
        }
      });
    } catch (err) {
      next(err);
    }
  }
);
