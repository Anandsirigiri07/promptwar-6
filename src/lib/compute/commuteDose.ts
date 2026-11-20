/**
 * VAYUWISE AI - Commute Exposure & Inhaled PM2.5 Dose Model
 * Implements deterministic calculation of:
 * 1. Inhaled Particulate Dose:
 *    Dose (ug) = PM2.5_Concentration (ug/m3) * Duration (hours) * VentilationRate (m3/h) * (1 - ProtectionFactor)
 * 2. Carbon Footprint (g CO2 / passenger-km)
 * 3. Relative Risk Multiplier
 */

import { assertFiniteNumber } from './asserts.js';

export type CommuteMode = 
  | 'metro'
  | 'electric_bus'
  | 'diesel_bus'
  | 'ev_car'
  | 'petrol_car'
  | 'cycling'
  | 'walking';

export interface CommuteModeProfile {
  mode: CommuteMode;
  label: string;
  averageSpeedKmh: number;
  breathingRateM3PerHour: number; // Physical exertion ventilation rate
  defaultVehicleFiltration: number; // Cabin HEPA / recirculation protection factor [0..1]
  co2GramsPerPassengerKm: number;
  isZeroTailpipeEmission: boolean;
}

export const COMMUTE_PROFILES: Record<CommuteMode, CommuteModeProfile> = {
  metro: {
    mode: 'metro',
    label: 'Underground / Elevated Metro',
    averageSpeedKmh: 35,
    breathingRateM3PerHour: 0.55, // Light resting/standing
    defaultVehicleFiltration: 0.60, // Pressurized HVAC with air filters
    co2GramsPerPassengerKm: 14,
    isZeroTailpipeEmission: true
  },
  electric_bus: {
    mode: 'electric_bus',
    label: 'Electric City Bus (AC)',
    averageSpeedKmh: 20,
    breathingRateM3PerHour: 0.55,
    defaultVehicleFiltration: 0.50,
    co2GramsPerPassengerKm: 22,
    isZeroTailpipeEmission: true
  },
  diesel_bus: {
    mode: 'diesel_bus',
    label: 'Standard Diesel Bus',
    averageSpeedKmh: 18,
    breathingRateM3PerHour: 0.60,
    defaultVehicleFiltration: 0.20, // Windows frequently open, drafty
    co2GramsPerPassengerKm: 68,
    isZeroTailpipeEmission: false
  },
  ev_car: {
    mode: 'ev_car',
    label: 'Electric Car (Recirculation AC)',
    averageSpeedKmh: 28,
    breathingRateM3PerHour: 0.50, // Seated driver/passenger
    defaultVehicleFiltration: 0.75, // Good cabin filter with recirculation
    co2GramsPerPassengerKm: 42,
    isZeroTailpipeEmission: true
  },
  petrol_car: {
    mode: 'petrol_car',
    label: 'Petrol / Gasoline Car',
    averageSpeedKmh: 26,
    breathingRateM3PerHour: 0.50,
    defaultVehicleFiltration: 0.65,
    co2GramsPerPassengerKm: 165,
    isZeroTailpipeEmission: false
  },
  cycling: {
    mode: 'cycling',
    label: 'Bicycle / E-Bike',
    averageSpeedKmh: 15,
    breathingRateM3PerHour: 1.80, // High physical exertion! Heavy breathing
    defaultVehicleFiltration: 0.00, // Direct outdoor exposure unless wearing N95
    co2GramsPerPassengerKm: 0,
    isZeroTailpipeEmission: true
  },
  walking: {
    mode: 'walking',
    label: 'Walking / Pedestrian',
    averageSpeedKmh: 4.5,
    breathingRateM3PerHour: 1.20, // Moderate exertion
    defaultVehicleFiltration: 0.00, // Direct outdoor exposure unless wearing N95
    co2GramsPerPassengerKm: 0,
    isZeroTailpipeEmission: true
  }
};

export interface CommuteDoseInput {
  mode: CommuteMode;
  distanceKm: number;
  ambientPM25_ugm3: number;
  hasN95Mask?: boolean; // N95 provides ~90% protection factor if fitted properly
  customSpeedKmh?: number;
}

export interface CommuteDoseOutput {
  mode: CommuteMode;
  label: string;
  distanceKm: number;
  durationMinutes: number;
  durationHours: number;
  ambientPM25_ugm3: number;
  effectiveProtectionFactor: number;
  inhaledDose_ug: number; // Micrograms of PM2.5 deposited in lungs
  co2Emitted_grams: number;
  relativeInhaledRiskScore: number; // Normalized 1-10 scale
  recommendationReason: string;
}

export function calculateCommuteDose(input: CommuteDoseInput): CommuteDoseOutput {
  const distanceKm = assertFiniteNumber(input.distanceKm, 'Commute distance (km)', 0.1, 500);
  const ambientPM25 = assertFiniteNumber(input.ambientPM25_ugm3, 'Ambient PM2.5 (ug/m3)', 0, 1000);
  const profile = COMMUTE_PROFILES[input.mode];

  if (!profile) {
    throw new Error(`Unknown commute mode: ${input.mode}`);
  }

  const speed = input.customSpeedKmh && input.customSpeedKmh > 0 
    ? input.customSpeedKmh 
    : profile.averageSpeedKmh;

  const durationHours = distanceKm / speed;
  const durationMinutes = Math.round(durationHours * 60);

  // Compute effective protection factor:
  // Combined penetration: (1 - cabinFilter) * (1 - maskFilter)
  const cabinPenetration = 1 - profile.defaultVehicleFiltration;
  const maskPenetration = input.hasN95Mask ? (1 - 0.90) : 1.0;
  const totalPenetration = cabinPenetration * maskPenetration;
  const effectiveProtectionFactor = Math.round((1 - totalPenetration) * 100) / 100;

  // Inhaled Dose = Concentration * VolumeOfAirInhaled * Penetration
  // VolumeOfAir = durationHours * breathingRate
  const inhaledDose_ug = Math.round(
    ambientPM25 * (durationHours * profile.breathingRateM3PerHour) * totalPenetration * 100
  ) / 100;

  const co2Emitted_grams = Math.round(distanceKm * profile.co2GramsPerPassengerKm);

  // Relative inhaled risk normalized against daily WHO guideline (15 ug/m3 * 24h * 0.5 = 180 ug reference)
  const relativeInhaledRiskScore = Math.min(10, Math.max(1, Math.round((inhaledDose_ug / 15) * 10) / 10));

  let recommendationReason = '';
  if (input.mode === 'metro') {
    recommendationReason = 'Fastest, zero direct emissions, and high air-conditioned cabin filtration.';
  } else if (input.mode === 'cycling' && ambientPM25 > 150) {
    recommendationReason = 'High breathing rate during severe smog significantly increases lung particle deposition. N95 strongly advised or consider metro.';
  } else if (input.mode === 'electric_bus') {
    recommendationReason = 'Clean transit alternative reducing road congestion and personal exposure.';
  } else if (input.mode === 'petrol_car') {
    recommendationReason = 'Protects passenger via cabin filter but produces high CO2 emissions.';
  } else {
    recommendationReason = `Balanced journey for ${distanceKm} km.`;
  }

  return {
    mode: input.mode,
    label: profile.label,
    distanceKm,
    durationMinutes,
    durationHours: Math.round(durationHours * 100) / 100,
    ambientPM25_ugm3: ambientPM25,
    effectiveProtectionFactor,
    inhaledDose_ug,
    co2Emitted_grams,
    relativeInhaledRiskScore,
    recommendationReason
  };
}
