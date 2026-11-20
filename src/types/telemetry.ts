/**
 * VAYUWISE AI - Telemetry & Environmental Data Types
 */

import { PollutantType, AQICategory } from '../lib/compute/aqiBreakpoints.js';

export interface PollutantDetail {
  code: PollutantType;
  name: string;
  concentration: number;
  unit: string;
  subIndex: number;
  category: AQICategory;
  healthImplications: string;
  hourlyTrend: number[]; // Last 7 hours
}

export interface UrbanZoneTelemetry {
  zoneId: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  overallAQI: number;
  dominantPollutant: PollutantType;
  category: AQICategory;
  temperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  isInversionActive: boolean;
  pollutants: Record<PollutantType, PollutantDetail>;
  measuredAt: string;
  dataProvider: string;
  isDemoData: boolean;
}

export type ScenarioType = 
  | 'realtime'
  | 'winter_smog_spike'
  | 'inversion_trap'
  | 'improved_dispersion'
  | 'calm_evening_fog';
