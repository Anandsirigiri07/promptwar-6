/**
 * VAYUWISE AI - AQI Piecewise Linear Interpolation Engine
 * Strictly implements:
 * 1. CPCB (Central Pollution Control Board - India National Air Quality Index)
 * 2. US EPA (Environmental Protection Agency)
 * 
 * Never mixes breakpoints or units between systems.
 * Uses piecewise linear interpolation:
 * I = [ (I_hi - I_lo) / (C_hi - C_lo) ] * (C - C_lo) + I_lo
 */

import { assertFiniteNumber } from './asserts.js';

export type AQIStandard = 'CPCB' | 'EPA';

export type PollutantType = 'pm25' | 'pm10' | 'no2' | 'co' | 'o3' | 'so2';

export interface BreakpointRange {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

export interface PollutantReading {
  pollutant: PollutantType;
  concentration: number; // in ug/m3, except CO which is in mg/m3
  unit: string;
}

export interface SubIndexResult {
  pollutant: PollutantType;
  concentration: number;
  subIndex: number;
  category: AQICategory;
  responsible: boolean;
}

export type AQICategory = 
  | 'Good'
  | 'Satisfactory' // CPCB
  | 'Moderate'
  | 'Poor'         // CPCB
  | 'Unhealthy for Sensitive Groups' // EPA
  | 'Unhealthy'    // EPA
  | 'Very Poor'    // CPCB
  | 'Very Unhealthy' // EPA
  | 'Severe'       // CPCB
  | 'Hazardous'    // EPA
  | 'Unavailable'; // No valid pollutant coverage

// CPCB Breakpoints (CPCB 2014 NAQI guidelines)
// Units: PM2.5 (ug/m3), PM10 (ug/m3), NO2 (ug/m3), CO (mg/m3), O3 (ug/m3), SO2 (ug/m3)
export const CPCB_BREAKPOINTS: Record<PollutantType, BreakpointRange[]> = {
  pm25: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
    { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
    { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
    { cLow: 431, cHigh: 600, iLow: 401, iHigh: 500 },
  ],
  no2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
    { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
    { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
    { cLow: 401, cHigh: 500, iLow: 401, iHigh: 500 },
  ],
  co: [
    { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
    { cLow: 1.1, cHigh: 2.0, iLow: 51, iHigh: 100 },
    { cLow: 2.1, cHigh: 10.0, iLow: 101, iHigh: 200 },
    { cLow: 10.1, cHigh: 17.0, iLow: 201, iHigh: 300 },
    { cLow: 17.1, cHigh: 34.0, iLow: 301, iHigh: 400 },
    { cLow: 34.1, cHigh: 50.0, iLow: 401, iHigh: 500 },
  ],
  o3: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200 },
    { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300 },
    { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400 },
    { cLow: 749, cHigh: 1000, iLow: 401, iHigh: 500 },
  ],
  so2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200 },
    { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300 },
    { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400 },
    { cLow: 1601, cHigh: 2000, iLow: 401, iHigh: 500 },
  ]
};

// US EPA Breakpoints (Revised standard)
export const EPA_BREAKPOINTS: Record<PollutantType, BreakpointRange[]> = {
  pm25: [
    { cLow: 0.0, cHigh: 9.0, iLow: 0, iHigh: 50 },
    { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
    { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
    { cLow: 225.5, cHigh: 500.0, iLow: 301, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
    { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
    { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
    { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
    { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
  ],
  no2: [
    { cLow: 0, cHigh: 53, iLow: 0, iHigh: 50 },
    { cLow: 54, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 360, iLow: 101, iHigh: 150 },
    { cLow: 361, cHigh: 649, iLow: 151, iHigh: 200 },
    { cLow: 650, cHigh: 1249, iLow: 201, iHigh: 300 },
    { cLow: 1250, cHigh: 2049, iLow: 301, iHigh: 500 },
  ],
  co: [
    { cLow: 0.0, cHigh: 4.4, iLow: 0, iHigh: 50 },
    { cLow: 4.5, cHigh: 9.4, iLow: 51, iHigh: 100 },
    { cLow: 9.5, cHigh: 12.4, iLow: 101, iHigh: 150 },
    { cLow: 12.5, cHigh: 15.4, iLow: 151, iHigh: 200 },
    { cLow: 15.5, cHigh: 30.4, iLow: 201, iHigh: 300 },
    { cLow: 30.5, cHigh: 50.4, iLow: 301, iHigh: 500 },
  ],
  o3: [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 70, iLow: 51, iHigh: 100 },
    { cLow: 71, cHigh: 85, iLow: 101, iHigh: 150 },
    { cLow: 86, cHigh: 105, iLow: 151, iHigh: 200 },
    { cLow: 106, cHigh: 200, iLow: 201, iHigh: 300 },
    { cLow: 201, cHigh: 500, iLow: 301, iHigh: 500 },
  ],
  so2: [
    { cLow: 0, cHigh: 35, iLow: 0, iHigh: 50 },
    { cLow: 36, cHigh: 75, iLow: 51, iHigh: 100 },
    { cLow: 76, cHigh: 185, iLow: 101, iHigh: 150 },
    { cLow: 186, cHigh: 304, iLow: 151, iHigh: 200 },
    { cLow: 305, cHigh: 604, iLow: 201, iHigh: 300 },
    { cLow: 605, cHigh: 1004, iLow: 301, iHigh: 500 },
  ]
};

/**
 * Normalizes pollutant concentration per standard-specific precision rules:
 * - CPCB: PM2.5, PM10, NO2, SO2, O3 rounded to nearest integer; CO to 1 decimal place.
 * - US EPA: PM2.5 to 1 decimal place (truncated); PM10, NO2, SO2, O3 truncated to integer; CO to 1 decimal place.
 */
export function normalizeConcentration(
  pollutant: PollutantType,
  rawConcentration: number,
  standard: AQIStandard = 'CPCB'
): number {
  const conc = assertFiniteNumber(rawConcentration, `concentration of ${pollutant}`, 0, 5000);

  if (standard === 'CPCB') {
    if (pollutant === 'co') {
      return Math.round(conc * 10) / 10;
    }
    return Math.round(conc);
  } else {
    // US EPA truncation rules
    if (pollutant === 'pm25' || pollutant === 'co') {
      return Math.floor(conc * 10) / 10;
    }
    return Math.floor(conc);
  }
}

export function calculateSubIndex(
  pollutant: PollutantType,
  rawConcentration: number,
  standard: AQIStandard = 'CPCB'
): number {
  const concentration = normalizeConcentration(pollutant, rawConcentration, standard);
  const breakpoints = (standard === 'CPCB' ? CPCB_BREAKPOINTS : EPA_BREAKPOINTS)[pollutant];

  if (!breakpoints || breakpoints.length === 0) {
    throw new Error(`Unsupported pollutant: ${pollutant}`);
  }

  // Exact piecewise search across breakpoints
  for (let i = 0; i < breakpoints.length; i++) {
    const bp = breakpoints[i]!;
    // For CPCB and EPA, check if concentration falls in or between this range
    // If concentration is between previous bp.cHigh and this bp.cLow, it belongs to this range
    const lowerBound = i === 0 ? 0 : breakpoints[i - 1]!.cHigh;
    if (concentration >= lowerBound && concentration <= bp.cHigh) {
      const slope = (bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow);
      const subIndex = slope * (concentration - bp.cLow) + bp.iLow;
      return Math.max(0, Math.min(500, Math.round(subIndex)));
    }
  }

  // Beyond upper boundary, clamp to 500
  const highestBp = breakpoints[breakpoints.length - 1]!;
  if (concentration > highestBp.cHigh) {
    return highestBp.iHigh;
  }

  return 0;
}

export function getAQICategory(aqi: number, standard: AQIStandard = 'CPCB'): AQICategory {
  assertFiniteNumber(aqi, 'AQI value', 0, 1000);

  if (standard === 'CPCB') {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Satisfactory';
    if (aqi <= 200) return 'Moderate';
    if (aqi <= 300) return 'Poor';
    if (aqi <= 400) return 'Very Poor';
    return 'Severe';
  } else {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }
}

export function getAQIColorHex(aqi: number, standard: AQIStandard = 'CPCB'): string {
  if (standard === 'CPCB') {
    if (aqi <= 50) return '#1B8A5A'; // Good
    if (aqi <= 100) return '#489938'; // Satisfactory
    if (aqi <= 200) return '#C48B08'; // Moderate
    if (aqi <= 300) return '#D9601A'; // Poor
    if (aqi <= 400) return '#C23330'; // Very Poor
    return '#7E1E5C'; // Severe
  } else {
    if (aqi <= 50) return '#1B8A5A';
    if (aqi <= 100) return '#C48B08';
    if (aqi <= 150) return '#D9601A';
    if (aqi <= 200) return '#C23330';
    if (aqi <= 300) return '#7E1E5C';
    return '#4D1236';
  }
}

export interface ComprehensiveAQIResult {
  overallAQI: number;
  dominantPollutant: PollutantType;
  category: AQICategory;
  standard: AQIStandard;
  colorHex: string;
  subIndices: SubIndexResult[];
  isValidStandard: boolean;
  standardComplianceNotice?: string;
}

/**
 * Calculates overall AQI using max sub-index algorithm per standard regulations
 * Requirement: Needs at least 3 pollutants in CPCB including PM2.5 or PM10
 */
export function calculateOverallAQI(
  readings: PollutantReading[],
  standard: AQIStandard = 'CPCB'
): ComprehensiveAQIResult {
  if (!readings || readings.length === 0) {
    throw new Error('Readings array cannot be empty');
  }

  let isValidStandard = true;
  let standardComplianceNotice: string | undefined;

  if (standard === 'CPCB') {
    const hasParticulate = readings.some(r => r.pollutant === 'pm25' || r.pollutant === 'pm10');
    if (readings.length < 3 || !hasParticulate) {
      isValidStandard = false;
      standardComplianceNotice = `CPCB NAQI requires at least 3 monitored pollutants, including either PM2.5 or PM10 (Monitored count: ${readings.length}, particulate present: ${hasParticulate})`;
    }
  }

  let maxSubIndex = 0;
  let dominant: PollutantType = readings[0]!.pollutant;

  const subIndices: SubIndexResult[] = readings.map((r) => {
    const subIdx = calculateSubIndex(r.pollutant, r.concentration, standard);
    const category = getAQICategory(subIdx, standard);
    if (subIdx > maxSubIndex) {
      maxSubIndex = subIdx;
      dominant = r.pollutant;
    }
    return {
      pollutant: r.pollutant,
      concentration: r.concentration,
      subIndex: subIdx,
      category,
      responsible: false
    };
  });

  // Mark dominant
  for (const s of subIndices) {
    if (s.pollutant === dominant) {
      s.responsible = true;
    }
  }

  return {
    overallAQI: maxSubIndex,
    dominantPollutant: dominant,
    category: getAQICategory(maxSubIndex, standard),
    standard,
    colorHex: getAQIColorHex(maxSubIndex, standard),
    subIndices,
    isValidStandard,
    standardComplianceNotice
  };
}

/**
 * Inverts an explicit PM2.5 sub-index back to its physical mass concentration (µg/m³).
 * Strictly requires that the input is a PM2.5 sub-index (not overall AQI).
 * Uses the piecewise linear equation:
 * C = C_lo + [ (I - I_lo) * (C_hi - C_lo) ] / (I_hi - I_lo)
 */
export function invertPM25SubIndex(subIndex: number, standard: AQIStandard = 'CPCB'): number | null {
  if (typeof subIndex !== 'number' || isNaN(subIndex) || !isFinite(subIndex) || subIndex < 0) {
    return null;
  }

  const breakpoints = standard === 'CPCB' ? CPCB_BREAKPOINTS.pm25 : EPA_BREAKPOINTS.pm25;
  const maxIHigh = breakpoints[breakpoints.length - 1]?.iHigh ?? 500;
  if (subIndex > maxIHigh) {
    return null; // Out of supported standard range
  }

  const range = breakpoints.find(b => subIndex >= b.iLow && subIndex <= b.iHigh);
  if (!range) return null;

  const concentration = range.cLow + ((subIndex - range.iLow) * (range.cHigh - range.cLow)) / (range.iHigh - range.iLow);
  return Math.round(concentration * 10) / 10;
}
