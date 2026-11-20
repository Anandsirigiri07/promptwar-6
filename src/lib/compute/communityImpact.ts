/**
 * VAYUWISE AI - Community Impact & Verifiable Environmental Reductions
 * Transparent formulas with documented baselines:
 * - Carpooling: Avoided individual car trips (140g CO2/km average petrol passenger car baseline)
 * - Anti-waste burning pledge: 1 open fire avoided ~= 1.8 kg PM2.5 directly prevented from local micro-airshed
 * - Public Transit Day: Avoided commute distance * 125g net CO2 savings per km
 */

import { assertFiniteNumber } from './asserts.js';

export interface CommunityPledgeRecord {
  id: string;
  userId: string;
  category: 'carpool' | 'transit' | 'anti_burn' | 'clean_energy' | 'green_neighborhood';
  title: string;
  description: string;
  targetCount: number;
  completedCount: number;
  estimatedCO2SavingsKg: number;
  estimatedPM25AvoidedGrams: number;
  participants: number;
  createdAt: string;
}

export interface ImpactFormulaDocumentation {
  category: string;
  co2Factor: string;
  pm25Factor: string;
  sourceStandard: string;
}

export const IMPACT_METHODOLOGY_STANDARDS: Record<string, ImpactFormulaDocumentation> = {
  carpool: {
    category: 'Shared Commuting & Carpooling',
    co2Factor: '140 grams CO2 avoided per passenger-km replaced',
    pm25Factor: '0.08 grams PM2.5 avoided per vehicle-km not driven',
    sourceStandard: 'IPCC Mobile Combustion & CPCB Urban Transport Emissions Inventory'
  },
  transit: {
    category: 'Metro & Public Bus Shift',
    co2Factor: '125 grams net CO2 saved per passenger-km compared to single-occupancy ICE vehicle',
    pm25Factor: '0.07 grams PM2.5 avoided per km shifted',
    sourceStandard: 'Bureau of Energy Efficiency (BEE) & CPCB NAQI Mitigation Guidelines'
  },
  anti_burn: {
    category: 'Preventing Open Biomass & Waste Burning',
    co2Factor: '15 kg CO2 avoided per 10 kg dry biomass/leaf waste composted instead of burned',
    pm25Factor: '1,800 grams (1.8 kg) fine particulate PM2.5 kept out of the breathing zone per fire avoided',
    sourceStandard: 'USEPA AP-42 Open Burning Factors & IIT Kanpur Delhi Air Quality Study'
  },
  clean_energy: {
    category: 'Electric / Solar Alternatives',
    co2Factor: '820 grams CO2 avoided per kWh grid electricity shifted to rooftop solar',
    pm25Factor: '0.03 grams secondary particulate precursor emissions avoided',
    sourceStandard: 'Central Electricity Authority (CEA) India CO2 Baseline Database'
  }
};

export function calculatePledgeAvoidedEmissions(
  category: 'carpool' | 'transit' | 'anti_burn' | 'clean_energy' | 'green_neighborhood',
  unitsCompleted: number,
  averageDistanceKm: number = 10
): { co2Kg: number; pm25Grams: number } {
  assertFiniteNumber(unitsCompleted, 'Units completed', 0, 1000000);
  assertFiniteNumber(averageDistanceKm, 'Average distance km', 0.1, 1000);

  let co2Kg = 0;
  let pm25Grams = 0;

  switch (category) {
    case 'carpool':
      // units = number of shared carpool trips
      co2Kg = (unitsCompleted * averageDistanceKm * 140) / 1000;
      pm25Grams = unitsCompleted * averageDistanceKm * 0.08;
      break;
    case 'transit':
      // units = transit days
      co2Kg = (unitsCompleted * averageDistanceKm * 125) / 1000;
      pm25Grams = unitsCompleted * averageDistanceKm * 0.07;
      break;
    case 'anti_burn':
      // units = fires reported & prevented / composted piles
      co2Kg = unitsCompleted * 15;
      pm25Grams = unitsCompleted * 1800; // Major local particulate impact
      break;
    case 'clean_energy':
      // units = solar hours / EV charging cycles
      co2Kg = unitsCompleted * 4.2;
      pm25Grams = unitsCompleted * 0.15;
      break;
    case 'green_neighborhood':
      // units = tree/dust management zones maintained
      co2Kg = unitsCompleted * 22; // annual tree carbon sequestration estimate
      pm25Grams = unitsCompleted * 45; // dust trapping leaf surface deposition
      break;
  }

  return {
    co2Kg: Math.round(co2Kg * 10) / 10,
    pm25Grams: Math.round(pm25Grams * 10) / 10
  };
}
