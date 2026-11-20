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
import { MeteorologyProvider } from '../services/meteorologyProvider.js';
import { getZonesForCity } from '../../src/lib/constants.js';

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
      let sourceLabel = 'unavailable';

      if (typeof ambientAQI === 'number') {
        sourceLabel = 'user_supplied';
        // Validate whether user actually provided weather readings; never silently inject arbitrary defaults
        if (
          typeof req.body.temperatureC === 'number' &&
          typeof req.body.humidityPercent === 'number' &&
          typeof req.body.windSpeedKmh === 'number'
        ) {
          weather = {
            temperatureC: req.body.temperatureC,
            humidityPercent: req.body.humidityPercent,
            windSpeedKmh: req.body.windSpeedKmh
          };
        } else {
          // Attempt to fetch independent live meteorology for city coordinates
          try {
            const cityZones = getZonesForCity(req.body.city || 'Delhi');
            const firstZone = cityZones[0];
            if (firstZone) {
              const live = await MeteorologyProvider.fetchLiveWeatherForCoordinatesAsync(firstZone.latitude, firstZone.longitude);
              if (live) {
                weather = live.weather;
              }
            }
          } catch {
            weather = undefined;
          }
        }
      } else {
        // Query environmental provider for real or calibrated city telemetry
        try {
          const zones = await AirQualityProvider.getZoneTelemetryAsync(req.body.city || 'Delhi');
          if (zones && zones[0]) {
            ambientAQI = zones[0].overallAQI;
            sourceLabel = zones[0].dataOrigin;
            if (
              zones[0].temperatureC !== null &&
              zones[0].humidityPercent !== null &&
              zones[0].windSpeedKmh !== null
            ) {
              weather = {
                temperatureC: zones[0].temperatureC,
                humidityPercent: zones[0].humidityPercent,
                windSpeedKmh: zones[0].windSpeedKmh
              };
            }
          }
        } catch {
          weather = undefined;
        }
      }

      let ventilationAdvice: VentilationWindowAdvice;
      if (ambientAQI !== undefined && weather !== undefined) {
        ventilationAdvice = evaluateVentilationWindow(ambientAQI, weather);
      } else {
        ventilationAdvice = {
          action: 'Keep Windows Closed',
          recommendedHoursDescription: 'Insufficient local meteorological observations. Keep windows closed as a precautionary measure during winter smog periods.',
          reason: 'Ventilation evaluation requires verified outdoor AQI and meteorological readings (temperature, humidity, and wind speed). Do not open windows based on unmeasured assumptions.',
          ambientAQI: ambientAQI ?? 0,
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
            isAvailable: ambientAQI !== undefined && weather !== undefined
          },
          corsiRosenthalReference: CORSI_ROSENTHAL_REFERENCE
        }
      });
    } catch (err) {
      next(err);
    }
  }
);