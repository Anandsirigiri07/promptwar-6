/**
 * VAYUWISE AI - Meteorology & Inversion Dispersion Calculations
 * Computes:
 * 1. Boundary layer thermal inversion risk
 * 2. Wind dispersion dilution index
 * 3. Ventilation safety index for home windows
 */

import { assertFiniteNumber } from './asserts.js';

export interface WeatherData {
  temperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  boundaryLayerHeightMeters?: number;
  surfaceTemperatureC?: number;
  aloftTemperatureC?: number; // 500m above surface
}

export interface InversionAnalysis {
  isInversionPresent: boolean;
  inversionStrength: 'None' | 'Weak' | 'Moderate' | 'Severe';
  dispersionFactor: number; // 0 (trapped smog) to 1 (high dispersion)
  description: string;
}

export interface VentilationWindowAdvice {
  action: 'Keep Windows Closed' | 'Ventilate Briefly' | 'Safe for Cross-Ventilation';
  recommendedHoursDescription: string;
  reason: string;
  ambientAQI: number;
  confidenceScore: number;
}

export function analyzeThermalInversion(weather: WeatherData): InversionAnalysis {
  const surfaceTemp = weather.surfaceTemperatureC ?? weather.temperatureC;
  // If aloft temperature is known, true inversion is when dT/dz > 0 (aloft is warmer than surface)
  let isInversion = false;
  let strength: 'None' | 'Weak' | 'Moderate' | 'Severe' = 'None';

  if (weather.aloftTemperatureC !== undefined) {
    const tempDiff = weather.aloftTemperatureC - surfaceTemp;
    if (tempDiff > 4) {
      isInversion = true;
      strength = 'Severe';
    } else if (tempDiff > 1.5) {
      isInversion = true;
      strength = 'Moderate';
    } else if (tempDiff > 0) {
      isInversion = true;
      strength = 'Weak';
    }
  } else {
    // Winter morning meteorological heuristic: calm winds (< 5 km/h) + low temp (< 14C) + high humidity (> 75%)
    if (weather.windSpeedKmh < 4 && weather.temperatureC < 14 && weather.humidityPercent > 75) {
      isInversion = true;
      strength = 'Severe';
    } else if (weather.windSpeedKmh < 8 && weather.temperatureC < 18) {
      isInversion = true;
      strength = 'Moderate';
    } else if (weather.windSpeedKmh < 12) {
      isInversion = false;
      strength = 'Weak';
    }
  }

  // Dispersion factor calculation: proportional to wind speed and inversely to inversion
  const windFactor = Math.min(1.0, weather.windSpeedKmh / 25);
  let inversionPenalty = 0;
  if (strength === 'Severe') inversionPenalty = 0.7;
  else if (strength === 'Moderate') inversionPenalty = 0.4;
  else if (strength === 'Weak') inversionPenalty = 0.15;

  const dispersionFactor = Math.max(0.05, Math.round((windFactor * (1 - inversionPenalty)) * 100) / 100);

  let description = '';
  if (strength === 'Severe') {
    description = 'Severe thermal inversion layer detected. Cold ground air is trapped beneath warm air aloft, preventing pollutant dispersion.';
  } else if (strength === 'Moderate') {
    description = 'Moderate nocturnal inversion present. Particulate matter accumulating near street level.';
  } else {
    description = 'Normal atmospheric lapse rate. Smog particles are dispersing vertically with ambient breeze.';
  }

  return {
    isInversionPresent: isInversion,
    inversionStrength: strength,
    dispersionFactor,
    description
  };
}

export function evaluateVentilationWindow(
  currentAQI: number,
  weather: WeatherData,
  hourOfDay: number = new Date().getHours()
): VentilationWindowAdvice {
  assertFiniteNumber(currentAQI, 'Current AQI', 0, 1000);

  // Inversions are worst from 22:00 to 09:00. Midday (12:00 to 15:30) typically has peak solar heating and lowest ground concentration.
  const isMiddaySolarMixing = hourOfDay >= 12 && hourOfDay <= 15;
  const inversion = analyzeThermalInversion(weather);

  if (currentAQI > 250 || inversion.inversionStrength === 'Severe') {
    return {
      action: 'Keep Windows Closed',
      recommendedHoursDescription: 'Do not open windows today; outdoor air exceeds hazardous toxicity thresholds.',
      reason: 'Ambient fine particulate matter and inversion lid will contaminate indoor air immediately.',
      ambientAQI: currentAQI,
      confidenceScore: 0.95
    };
  }

  if (currentAQI > 120) {
    if (isMiddaySolarMixing && weather.windSpeedKmh > 8) {
      return {
        action: 'Ventilate Briefly',
        recommendedHoursDescription: 'Open for 15-20 minutes between 12:30 PM - 2:30 PM to clear indoor CO2, then reseal and run HEPA.',
        reason: 'Midday vertical atmospheric mixing temporarily reduces ground-level PM2.5 concentrations.',
        ambientAQI: currentAQI,
        confidenceScore: 0.85
      };
    } else {
      return {
        action: 'Keep Windows Closed',
        recommendedHoursDescription: 'Wait until midday thermal mixing (12 PM - 2 PM) before any ventilation.',
        reason: 'Current atmospheric conditions show shallow boundary layer and trapped particulates.',
        ambientAQI: currentAQI,
        confidenceScore: 0.88
      };
    }
  }

  return {
    action: 'Safe for Cross-Ventilation',
    recommendedHoursDescription: 'Optimal ventilation window open now. Refresh indoor air for 30-45 minutes.',
    reason: 'Ambient air quality is satisfactory and wind dispersion is active.',
    ambientAQI: currentAQI,
    confidenceScore: 0.90
  };
}
