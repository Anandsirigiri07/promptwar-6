/**
 * VAYUWISE AI - Telemetry & Environmental Data Types
 */

import { PollutantType, AQICategory } from '../lib/compute/aqiBreakpoints.js';

export interface PollutantDetail {
  code: PollutantType;
  name: string;
  concentration: number | null;
  unit: string;
  subIndex: number | null;
  category: AQICategory | 'Unavailable';
  measuredAt?: string | null;
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
  /** False when the available pollutant set does not satisfy the selected AQI standard. */
  aqiIsValid?: boolean;
  /** Live single-time readings are indicative only; regulatory averaging periods are not verified. */
  aqiBasis?: 'instantaneous_estimate' | 'scenario';
  aqiComplianceNotice?: string | null;
  dominantPollutant: PollutantType;
  category: AQICategory;
  temperatureC: number | null;
  humidityPercent: number | null;
  windSpeedKmh: number | null;
  isInversionActive: boolean | null;
  weatherSource?: string | null;
  weatherMeasuredAt?: string | null;
  pollutants: Record<PollutantType, PollutantDetail>;
  measuredAt: string;
  dataProvider: string;
  isDemoData: boolean;
  dataOrigin: 'live_station' | 'live_model' | 'cached' | 'demo';
  freshnessMinutes?: number;
}

export type ScenarioType = 
  | 'realtime'
  | 'winter_smog_spike'
  | 'inversion_trap'
  | 'improved_dispersion'
  | 'calm_evening_fog';
