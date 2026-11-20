import { describe, it, expect } from 'vitest';
import {
  analyzeThermalInversion,
  evaluateVentilationWindow,
  WeatherData
} from '../lib/compute/meteorology.js';

describe('Meteorology & Thermal Inversion Dispersion Models', () => {
  it('detects severe thermal inversion when aloft air is warmer than surface', () => {
    const weather: WeatherData = {
      temperatureC: 10,
      humidityPercent: 85,
      windSpeedKmh: 3,
      surfaceTemperatureC: 9.5,
      aloftTemperatureC: 15.0 // Warm lid aloft (+5.5C)
    };

    const inversion = analyzeThermalInversion(weather);
    expect(inversion.isInversionPresent).toBe(true);
    expect(inversion.inversionStrength).toBe('Severe');
    expect(inversion.dispersionFactor).toBeLessThanOrEqual(0.35);
    expect(inversion.description).toContain('Severe thermal inversion');
  });

  it('detects moderate inversion under nocturnal calm winter conditions', () => {
    const weather: WeatherData = {
      temperatureC: 13,
      humidityPercent: 80,
      windSpeedKmh: 3.5 // calm winds
    };

    const inversion = analyzeThermalInversion(weather);
    expect(inversion.isInversionPresent).toBe(true);
    expect(inversion.inversionStrength).toBe('Severe');
  });

  it('detects clean atmospheric dispersion during strong daytime winds', () => {
    const weather: WeatherData = {
      temperatureC: 25,
      humidityPercent: 40,
      windSpeedKmh: 22,
      surfaceTemperatureC: 25,
      aloftTemperatureC: 19 // Normal adiabatic lapse rate
    };

    const inversion = analyzeThermalInversion(weather);
    expect(inversion.isInversionPresent).toBe(false);
    expect(inversion.inversionStrength).toBe('None');
    expect(inversion.dispersionFactor).toBeGreaterThan(0.7);
  });

  it('recommends keeping windows closed when AQI exceeds hazardous thresholds', () => {
    const weather: WeatherData = {
      temperatureC: 12,
      humidityPercent: 85,
      windSpeedKmh: 2.0
    };

    const advice = evaluateVentilationWindow(320, weather, 13);
    expect(advice.action).toBe('Keep Windows Closed');
    expect(advice.confidenceScore).toBeGreaterThanOrEqual(0.9);
  });

  it('identifies safe midday brief ventilation window when solar mixing is active', () => {
    const weather: WeatherData = {
      temperatureC: 20,
      humidityPercent: 55,
      windSpeedKmh: 10.0
    };

    const advice = evaluateVentilationWindow(140, weather, 13); // 13:00 midday
    expect(advice.action).toBe('Ventilate Briefly');
    expect(advice.recommendedHoursDescription).toContain('12:30 PM');
  });

  it('allows safe cross-ventilation when ambient air is clean', () => {
    const weather: WeatherData = {
      temperatureC: 22,
      humidityPercent: 50,
      windSpeedKmh: 12.0
    };

    const advice = evaluateVentilationWindow(45, weather, 10);
    expect(advice.action).toBe('Safe for Cross-Ventilation');
  });

  it('does not fabricate inversion when meteorological inputs are neutral', () => {
    const neutralWeather: WeatherData = {
      temperatureC: 22,
      humidityPercent: 50,
      windSpeedKmh: 14.0
    };

    const inversion = analyzeThermalInversion(neutralWeather);
    expect(inversion.isInversionPresent).toBe(false);
    expect(inversion.inversionStrength).toBe('None');
  });
});
