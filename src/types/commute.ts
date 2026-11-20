/**
 * VAYUWISE AI - Commute & Transit Optimization Types
 */

import { CommuteMode, CommuteDoseOutput } from '../lib/compute/commuteDose.js';
import { PlannedPathResult } from '../lib/compute/dijkstraRouter.js';

export interface CommuteComparisonReport {
  origin: string;
  destination: string;
  distanceKm: number;
  ambientPM25: number;
  modeComparisons: CommuteDoseOutput[];
  recommendedMode: CommuteMode;
  pathOptimization?: PlannedPathResult;
  timestamp: string;
}
