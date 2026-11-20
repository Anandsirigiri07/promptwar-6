/**
 * VAYUWISE AI - Air Quality Telemetry & Simulator Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AirQualityProvider } from '../services/airQualityProvider.js';
import { validateQuery, validateBody } from '../middleware/validation.js';
import { AirQualityQuerySchema, ScenarioSimulationSchema } from '../validators/airQuality.schema.js';

export const airQualityRouter = Router();

airQualityRouter.get(
  '/',
  validateQuery(AirQualityQuerySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const city = (req.query.city as string) || 'Delhi';
      const scenario = (req.query.scenario as any) || 'realtime';
      const standard = (req.query.standard as any) || 'CPCB';
      const zones = await AirQualityProvider.getZoneTelemetryAsync(city, scenario, standard);

      const selectedZone = req.query.zoneId
        ? zones.find(z => z.zoneId === req.query.zoneId) || zones[0]
        : zones[0];

      res.json({
        success: true,
        data: {
          currentZone: selectedZone,
          city,
          standard,
          scenario,
          availableZonesCount: zones.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

airQualityRouter.get(
  '/zones',
  validateQuery(AirQualityQuerySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const city = (req.query.city as string) || 'Delhi';
      const scenario = (req.query.scenario as any) || 'realtime';
      const standard = (req.query.standard as any) || 'CPCB';
      const zones = await AirQualityProvider.getZoneTelemetryAsync(city, scenario, standard);

      res.json({
        success: true,
        data: zones
      });
    } catch (err) {
      next(err);
    }
  }
);

airQualityRouter.post(
  '/simulate',
  validateBody(ScenarioSimulationSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { scenario, targetZoneId } = req.body;
      const zones = AirQualityProvider.getZoneTelemetry('Bengaluru', scenario, 'CPCB');
      const targetZone = zones.find(z => z.zoneId === targetZoneId) || zones[0];

      res.json({
        success: true,
        data: {
          scenario,
          targetZone,
          allZones: zones,
          explanation: `Scenario simulation applied: ${scenario.replace(/_/g, ' ')}. Telemetry recalculated deterministically.`
        }
      });
    } catch (err) {
      next(err);
    }
  }
);
