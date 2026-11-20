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

      // Sample weather for ventilation window calculation
      const weather: WeatherData = {
        temperatureC: 18,
        humidityPercent: 65,
        windSpeedKmh: 7.5
      };

      const ventilationAdvice = evaluateVentilationWindow(185, weather);

      res.json({
        success: true,
        data: {
          calculation: iaqResult,
          ventilationAdvice,
          corsiRosenthalReference: CORSI_ROSENTHAL_REFERENCE
        }
      });
    } catch (err) {
      next(err);
    }
  }
);
