import { describe, it, expect } from 'vitest';
import {
  calculateSubIndex,
  calculateOverallAQI,
  getAQICategory,
  getAQIColorHex,
  PollutantReading
} from '../lib/compute/aqiBreakpoints.js';

describe('AQI Piecewise Linear Interpolation & Standard Compliance', () => {
  it('calculates CPCB sub-index for PM2.5 accurately across all breakpoint ranges', () => {
    // Good: 0-30 => 0-50
    expect(calculateSubIndex('pm25', 15, 'CPCB')).toBe(25);
    // Satisfactory: 31-60 => 51-100
    expect(calculateSubIndex('pm25', 45, 'CPCB')).toBe(75);
    // Moderate: 61-90 => 101-200
    expect(calculateSubIndex('pm25', 75, 'CPCB')).toBe(149);
    // Poor: 91-120 => 201-300
    expect(calculateSubIndex('pm25', 105, 'CPCB')).toBe(249);
    // Very Poor: 121-250 => 301-400
    expect(calculateSubIndex('pm25', 185, 'CPCB')).toBe(350);
    // Severe: 251-500 => 401-500
    expect(calculateSubIndex('pm25', 375, 'CPCB')).toBe(450);
  });

  it('calculates CPCB sub-index for PM10 accurately', () => {
    expect(calculateSubIndex('pm10', 25, 'CPCB')).toBe(25);
    expect(calculateSubIndex('pm10', 75, 'CPCB')).toBe(75);
    expect(calculateSubIndex('pm10', 175, 'CPCB')).toBe(150);
    expect(calculateSubIndex('pm10', 300, 'CPCB')).toBe(250);
  });

  it('calculates CPCB sub-index for gaseous pollutants (NO2, CO, O3, SO2)', () => {
    expect(calculateSubIndex('no2', 20, 'CPCB')).toBe(25);
    expect(calculateSubIndex('no2', 60, 'CPCB')).toBe(75);
    expect(calculateSubIndex('co', 0.5, 'CPCB')).toBe(25);
    expect(calculateSubIndex('co', 1.5, 'CPCB')).toBe(73);
    expect(calculateSubIndex('o3', 25, 'CPCB')).toBe(25);
    expect(calculateSubIndex('so2', 20, 'CPCB')).toBe(25);
  });

  it('calculates US EPA sub-index accurately without mixing CPCB breakpoints', () => {
    // EPA PM2.5 Good: 0.0 - 9.0 => 0 - 50
    expect(calculateSubIndex('pm25', 4.5, 'EPA')).toBe(25);
    // EPA PM2.5 Moderate: 9.1 - 35.4 => 51 - 100
    expect(calculateSubIndex('pm25', 20.0, 'EPA')).toBe(71);
  });

  it('determines overall AQI based on maximum sub-index', () => {
    const readings: PollutantReading[] = [
      { pollutant: 'pm25', concentration: 185, unit: 'µg/m³' }, // subIndex ~350
      { pollutant: 'pm10', concentration: 75, unit: 'µg/m³' },  // subIndex ~75
      { pollutant: 'no2', concentration: 30, unit: 'µg/m³' },   // subIndex ~38
      { pollutant: 'co', concentration: 0.8, unit: 'mg/m³' }    // subIndex ~40
    ];

    const result = calculateOverallAQI(readings, 'CPCB');
    expect(result.overallAQI).toBe(350);
    expect(result.dominantPollutant).toBe('pm25');
    expect(result.category).toBe('Very Poor');
    expect(result.subIndices.find(s => s.pollutant === 'pm25')?.responsible).toBe(true);
  });

  it('caps values above maximum breakpoints gracefully', () => {
    expect(calculateSubIndex('pm25', 750, 'CPCB')).toBe(500);
    expect(calculateSubIndex('pm10', 900, 'CPCB')).toBe(500);
  });

  it('returns appropriate category labels and contrast hex colors', () => {
    expect(getAQICategory(35, 'CPCB')).toBe('Good');
    expect(getAQICategory(85, 'CPCB')).toBe('Satisfactory');
    expect(getAQICategory(150, 'CPCB')).toBe('Moderate');
    expect(getAQICategory(250, 'CPCB')).toBe('Poor');
    expect(getAQICategory(350, 'CPCB')).toBe('Very Poor');
    expect(getAQICategory(450, 'CPCB')).toBe('Severe');

    expect(getAQIColorHex(35)).toBe('#1B8A5A');
    expect(getAQIColorHex(450)).toBe('#7E1E5C');
  });

  it('correctly handles fractional concentrations without returning zero in transition intervals', () => {
    // 30.4 ug/m3 PM2.5 in CPCB rounds to 30 -> Good (SubIndex 50)
    expect(calculateSubIndex('pm25', 30.4, 'CPCB')).toBe(50);
    // 30.5 ug/m3 PM2.5 in CPCB rounds to 31 -> Satisfactory (SubIndex 51)
    expect(calculateSubIndex('pm25', 30.5, 'CPCB')).toBe(51);
    // 60.5 ug/m3 PM2.5 in CPCB rounds to 61 -> Moderate (SubIndex 101)
    expect(calculateSubIndex('pm25', 60.5, 'CPCB')).toBe(101);

    // US EPA fractional precision truncation test
    // 9.05 ug/m3 truncates to 9.0 -> Good (SubIndex 50)
    expect(calculateSubIndex('pm25', 9.05, 'EPA')).toBe(50);
    // 9.15 ug/m3 truncates to 9.1 -> Moderate (SubIndex 51)
    expect(calculateSubIndex('pm25', 9.15, 'EPA')).toBe(51);
  });

  it('enforces CPCB minimum 3 monitored pollutants and particulate criteria', () => {
    // 1. Only 2 pollutants provided -> isValidStandard is false
    const partialReadings: PollutantReading[] = [
      { pollutant: 'pm25', concentration: 75, unit: 'µg/m³' },
      { pollutant: 'no2', concentration: 40, unit: 'µg/m³' }
    ];
    const partialResult = calculateOverallAQI(partialReadings, 'CPCB');
    expect(partialResult.isValidStandard).toBe(false);
    expect(partialResult.standardComplianceNotice).toContain('at least 3 monitored pollutants');

    // 2. 3 pollutants provided but NO particulate (no PM2.5 and no PM10) -> isValidStandard is false
    const gasOnlyReadings: PollutantReading[] = [
      { pollutant: 'no2', concentration: 50, unit: 'µg/m³' },
      { pollutant: 'co', concentration: 1.2, unit: 'mg/m³' },
      { pollutant: 'so2', concentration: 25, unit: 'µg/m³' }
    ];
    const gasOnlyResult = calculateOverallAQI(gasOnlyReadings, 'CPCB');
    expect(gasOnlyResult.isValidStandard).toBe(false);
    expect(gasOnlyResult.standardComplianceNotice).toContain('either PM2.5 or PM10');

    // 3. 3 pollutants provided including PM2.5 -> isValidStandard is true
    const validReadings: PollutantReading[] = [
      { pollutant: 'pm25', concentration: 75, unit: 'µg/m³' },
      { pollutant: 'no2', concentration: 40, unit: 'µg/m³' },
      { pollutant: 'co', concentration: 0.8, unit: 'mg/m³' }
    ];
    const validResult = calculateOverallAQI(validReadings, 'CPCB');
    expect(validResult.isValidStandard).toBe(true);
    expect(validResult.standardComplianceNotice).toBeUndefined();
  });
});
