import { describe, it, expect } from 'vitest';
import { calculatePledgeAvoidedEmissions, IMPACT_METHODOLOGY_STANDARDS } from '../lib/compute/communityImpact.js';

describe('Community Action & Avoided Emission Baseline Computations', () => {
  it('computes carpooling avoided emissions with IPCC 140g/km coefficient', () => {
    const impact = calculatePledgeAvoidedEmissions('carpool', 10, 15); // 10 trips * 15km = 150 km
    // 150 km * 140g CO2 = 21,000g = 21 kg CO2
    expect(impact.co2Kg).toBe(21.0);
    // 150 km * 0.08g PM2.5 = 12g PM2.5
    expect(impact.pm25Grams).toBe(12.0);
  });

  it('computes public transit shift emissions with BEE standard baseline', () => {
    const impact = calculatePledgeAvoidedEmissions('transit', 5, 20); // 100 passenger-km
    // 100 * 125g CO2 = 12.5 kg CO2
    expect(impact.co2Kg).toBe(12.5);
    // 100 * 0.07g PM2.5 = 7g PM2.5
    expect(impact.pm25Grams).toBe(7.0);
  });

  it('computes open burning avoidance with USEPA AP-42 & IIT Kanpur baseline', () => {
    const impact = calculatePledgeAvoidedEmissions('anti_burn', 3);
    // 3 fires * 1.8 kg PM2.5 = 5.4 kg = 5400 g PM2.5
    expect(impact.pm25Grams).toBe(5400);
    expect(impact.co2Kg).toBe(45);
  });

  it('maintains transparent methodology records with documented sources', () => {
    expect(IMPACT_METHODOLOGY_STANDARDS['carpool']!.sourceStandard).toContain('IPCC');
    expect(IMPACT_METHODOLOGY_STANDARDS['anti_burn']!.sourceStandard).toContain('IIT Kanpur');
  });
});
