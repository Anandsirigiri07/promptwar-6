/**
 * VAYUWISE AI - Indoor Air Quality & Clean Air Delivery Rate (CADR) Calculator
 * Implements physical room volume, Air Changes per Hour (ACH), CADR requirements,
 * first-order particle decay clearance model, and Corsi-Rosenthal DIY box filter specifications.
 * 
 * Clearance time formula (first-order decay):
 * C(t) = C0 * exp(-lambda * t)
 * where lambda = ACH_total = ACH_ventilation + ACH_purification
 * t = -ln(C(t) / C0) / lambda
 */

import { assertFiniteNumber, safeDivision } from './asserts.js';

export interface RoomDimensions {
  name: string;
  lengthM: number;
  widthM: number;
  heightM: number;
  occupants?: number;
  currentPurifierCADR_m3h?: number; // m3/h
  targetACH?: number; // Default recommended: 5 ACH for health protection
}

export interface CADRCalculationResult {
  roomName: string;
  floorAreaM2: number;
  roomVolumeM3: number;
  targetACH: number;
  requiredCADR_m3h: number;
  currentPurifierCADR_m3h: number;
  actualACH: number;
  cadrDeficit_m3h: number;
  status: 'Adequate' | 'Deficient' | 'Optimal';
  clearanceTime80PercentMinutes: number; // Time to reduce indoor PM2.5 by 80%
  clearanceTime95PercentMinutes: number; // Time to reduce indoor PM2.5 by 95%
  diyCorsiRosenthalRecommended: boolean;
  corsiRosenthalUnitsNeeded: number;
}

export interface DIYCorsiRosenthalSpecs {
  name: string;
  estimatedCADR_m3h: number; // Standard 20" box fan with 4 or 5 MERV 13 filters ~ 500-750 m3/h
  estimatedCostINR: number;
  filterType: string;
  filterCount: number;
  fanSizeInches: number;
  lifespanMonths: number;
  noiseLevelDb: number;
  energyWatts: number;
}

export const CORSI_ROSENTHAL_REFERENCE: DIYCorsiRosenthalSpecs = {
  name: 'Standard 4-Filter Corsi-Rosenthal Box Air Cleaner',
  estimatedCADR_m3h: 580, // ~340 CFM = 578 m3/h
  estimatedCostINR: 4200, // ~50 USD equivalent
  filterType: 'MERV 13 (16"x25"x1" or 20"x20"x1")',
  filterCount: 4,
  fanSizeInches: 20,
  lifespanMonths: 6,
  noiseLevelDb: 48,
  energyWatts: 65
};

export function calculateRoomIAQ(params: RoomDimensions): CADRCalculationResult {
  const length = assertFiniteNumber(params.lengthM, 'Room length (m)', 0.5, 100);
  const width = assertFiniteNumber(params.widthM, 'Room width (m)', 0.5, 100);
  const height = assertFiniteNumber(params.heightM, 'Room height (m)', 1.0, 30);
  const targetACH = params.targetACH ?? 5.0; // 5 ACH is ASHRAE/CDC standard during smog
  const currentCADR = params.currentPurifierCADR_m3h ?? 0;

  const floorAreaM2 = Math.round(length * width * 10) / 10;
  const roomVolumeM3 = Math.round(floorAreaM2 * height * 10) / 10;

  const requiredCADR_m3h = Math.round(roomVolumeM3 * targetACH);
  const actualACH = Math.round(safeDivision(currentCADR, roomVolumeM3, 0) * 10) / 10;
  const cadrDeficit_m3h = Math.max(0, requiredCADR_m3h - currentCADR);

  let status: 'Adequate' | 'Deficient' | 'Optimal' = 'Deficient';
  if (actualACH >= targetACH * 1.2) {
    status = 'Optimal';
  } else if (actualACH >= targetACH) {
    status = 'Adequate';
  }

  // First-order decay: ln(C(t)/C0) = -lambda * t
  // For 80% reduction: C(t)/C0 = 0.20 => -ln(0.20) ~= 1.6094
  // For 95% reduction: C(t)/C0 = 0.05 => -ln(0.05) ~= 2.9957
  // ACH is per hour, convert t to minutes: t_mins = (ln(C0/Ct) / ACH) * 60
  // Background natural settling ACH ~= 0.3 ACH
  const effectiveACH = Math.max(0.3, actualACH + 0.3);
  const clearanceTime80PercentMinutes = Math.round((1.6094 / effectiveACH) * 60);
  const clearanceTime95PercentMinutes = Math.round((2.9957 / effectiveACH) * 60);

  const diyNeeded = cadrDeficit_m3h > 0;
  const unitsNeeded = diyNeeded 
    ? Math.ceil(cadrDeficit_m3h / CORSI_ROSENTHAL_REFERENCE.estimatedCADR_m3h) 
    : 0;

  return {
    roomName: params.name || 'Living Area',
    floorAreaM2,
    roomVolumeM3,
    targetACH,
    requiredCADR_m3h,
    currentPurifierCADR_m3h: currentCADR,
    actualACH,
    cadrDeficit_m3h,
    status,
    clearanceTime80PercentMinutes,
    clearanceTime95PercentMinutes,
    diyCorsiRosenthalRecommended: diyNeeded,
    corsiRosenthalUnitsNeeded: unitsNeeded
  };
}
