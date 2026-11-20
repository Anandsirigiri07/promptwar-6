/**
 * VAYUWISE AI - Indoor Air Quality & DIY Types
 */

import { CADRCalculationResult, DIYCorsiRosenthalSpecs } from '../lib/compute/cadrCalculations.js';
import { VentilationWindowAdvice } from '../lib/compute/meteorology.js';

export interface SavedRoomConfig {
  id: string;
  name: string;
  lengthM: number;
  widthM: number;
  heightM: number;
  occupants: number;
  purifierCADR: number;
  targetACH: number;
  lastCalculated?: CADRCalculationResult;
}

export interface IAQDashboardState {
  rooms: SavedRoomConfig[];
  selectedRoomId: string;
  ventilationAdvice: VentilationWindowAdvice;
  corsiRosenthalSpecs: DIYCorsiRosenthalSpecs;
}
