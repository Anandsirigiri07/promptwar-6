/**
 * VAYUWISE AI - Air Quality Query & Telemetry Schemas
 */

import { z } from 'zod';

export const PollutantTypeSchema = z.enum(['pm25', 'pm10', 'no2', 'co', 'o3', 'so2']);

export const AirQualityQuerySchema = z.object({
  city: z.string().min(1).max(100).default('Bengaluru'),
  zoneId: z.string().min(1).max(50).optional(),
  standard: z.enum(['CPCB', 'EPA']).default('CPCB'),
  scenario: z.enum(['realtime', 'winter_smog_spike', 'inversion_trap', 'improved_dispersion', 'calm_evening_fog']).default('realtime')
});

export const ScenarioSimulationSchema = z.object({
  scenario: z.enum(['winter_smog_spike', 'inversion_trap', 'improved_dispersion', 'calm_evening_fog']),
  targetZoneId: z.string().min(1).max(50).default('zone-1'),
  intensityMultiplier: z.number().min(0.5).max(3.0).default(1.0)
});
