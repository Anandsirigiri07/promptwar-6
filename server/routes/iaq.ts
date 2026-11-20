/**
 * VAYUWISE AI - Indoor Air Quality & CADR Calculator Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../middleware/validation.js';
import { IAQCalculateRequestSchema } from '../validators/user.schema.js';
import { calculateRoomIAQ, CORSI_ROSENTHAL_REFERENCE } from '../../src/lib/compute/cadrCalculations.js';
import { evaluateVentilationWindow, WeatherData } from '../../src/lib/compute/meteorology.js';

export const iaqRouter = Router();

iaqRouter.post(
  '/calculate',
  validateBody(IAQCalculateRequestSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, lengthM, widthM, heightM, occupants, currentPurifierCADR, targetACH } = req.body;

      const iaqResult = calculateRoomIAQ({
        name,
        lengthM,
        widthM,
        heightM,
        occupants,
        currentPurifierCADR_m3h: currentPurifierCADR,
        targetACH
      });

      // Dynamic weather and outdoor air quality derivation
      const ambientAQI = req.body.outdoorAQI ?? 185;
      const weather: WeatherData = {
        temperatureC: req.body.temperatureC ?? 18,
        humidityPercent: req.body.humidityPercent ?? 65,
        windSpeedKmh: req.body.windSpeedKmh ?? 7.5
      };

      const ventilationAdvice = evaluateVentilationWindow(ambientAQI, weather);

      res.json({
        success: true,
        data: {
          calculation: iaqResult,
          ventilationAdvice,
          ventilationConditions: {
            outdoorAQI: ambientAQI,
            temperatureC: weather.temperatureC,
            humidityPercent: weather.humidityPercent,
            windSpeedKmh: weather.windSpeedKmh,
            source: req.body.outdoorAQI !== undefined ? 'User / Live Outdoor Telemetry' : 'Calibrated Winter Baseline Reference'
          },
          corsiRosenthalReference: CORSI_ROSENTHAL_REFERENCE
        }
      });
    } catch (err) {
      next(err);
    }
  }
);
