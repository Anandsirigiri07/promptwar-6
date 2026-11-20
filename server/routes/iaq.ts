/**
 * VAYUWISE AI - Indoor Air Quality & CADR Calculator Routes
 * Evaluates indoor clean air delivery, ACH deficits, and window ventilation safety.
 * Never silently injects arbitrary baseline weather or AQI values.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../middleware/validation.js';
import { IAQCalculateRequestSchema } from '../validators/user.schema.js';
import { calculateRoomIAQ, CORSI_ROSENTHAL_REFERENCE } from '../../src/lib/compute/cadrCalculations.js';
import { evaluateVentilationWindow, WeatherData, VentilationWindowAdvice } from '../../src/lib/compute/meteorology.js';
import { AirQualityProvider } from '../services/airQualityProvider.js';

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

      let ambientAQI: number | undefined = req.body.outdoorAQI;
      let weather: WeatherData | undefined;
      let sourceLabel = 'User-Supplied Input';

      if (typeof ambientAQI === 'number') {
        weather = {
          temperatureC: typeof req.body.temperatureC === 'number' ? req.body.temperatureC : 20,
          humidityPercent: typeof req.body.humidityPercent === 'number' ? req.body.humidityPercent : 50,
          windSpeedKmh: typeof req.body.windSpeedKmh === 'number' ? req.body.windSpeedKmh : 5.0
        };
      } else {
        // Query environmental provider for real or calibrated city telemetry
        try {
          const zones = await AirQualityProvider.getZoneTelemetryAsync(req.body.city || 'Delhi');
          if (zones && zones[0]) {
            ambientAQI = zones[0].overallAQI;
            weather = {
              temperatureC: zones[0].temperatureC,
              humidityPercent: zones[0].humidityPercent,
              windSpeedKmh: zones[0].windSpeedKmh
            };
            sourceLabel = zones[0].isDemoData ? 'Calibrated Offline Baseline Reference' : 'Live Environmental Telemetry';
          }
        } catch {
          // Weather stays undefined
        }
      }

      let ventilationAdvice: VentilationWindowAdvice;
      if (ambientAQI !== undefined && weather !== undefined) {
        ventilationAdvice = evaluateVentilationWindow(ambientAQI, weather);
      } else {
        ventilationAdvice = {
          action: 'Keep Windows Closed',
          recommendedHoursDescription: 'Outdoor air quality telemetry unavailable. Keep windows closed as a precautionary measure during severe winter smog episodes.',
          reason: 'Ventilation evaluation requires verified outdoor AQI and meteorological readings.',
          ambientAQI: 0,
          confidenceScore: 0
        };
      }

      res.json({
        success: true,
        data: {
          calculation: iaqResult,
          ventilationAdvice,
          ventilationConditions: {
            outdoorAQI: ambientAQI ?? null,
            temperatureC: weather?.temperatureC ?? null,
            humidityPercent: weather?.humidityPercent ?? null,
            windSpeedKmh: weather?.windSpeedKmh ?? null,
            source: sourceLabel,
            isAvailable: ambientAQI !== undefined
          },
          corsiRosenthalReference: CORSI_ROSENTHAL_REFERENCE
        }
      });
    } catch (err) {
      next(err);
    }
  }
);