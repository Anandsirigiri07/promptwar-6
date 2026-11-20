/**
 * VAYUWISE AI - useExposureRouting Hook
 */

import { useState, useCallback } from 'react';
import { CommuteDoseOutput, CommuteMode } from '../lib/compute/commuteDose.js';
import { PlannedPathResult } from '../lib/compute/dijkstraRouter.js';
import { apiRequest } from '../services/apiService.js';

export function useExposureRouting() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [comparisons, setComparisons] = useState<CommuteDoseOutput[]>([]);
  const [recommendedMode, setRecommendedMode] = useState<CommuteMode>('metro');
  const [exposureOptimizedRoute, setExposureOptimizedRoute] = useState<PlannedPathResult | null>(null);
  const [tradeoffSummary, setTradeoffSummary] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const calculateCommute = useCallback(async (params: {
    origin: string;
    destination: string;
    distanceKm: number;
    ambientPM25: number;
    hasN95Mask: boolean;
  }) => {
    setIsCalculating(true);
    setError(null);
    try {
      const result = await apiRequest<{
        comparisons: CommuteDoseOutput[];
        recommendedMode: CommuteMode;
        dijkstraExposureOptimized: PlannedPathResult;
        tradeoffSummary: string;
      }>('/api/commute/compare', {
        method: 'POST',
        body: JSON.stringify(params)
      });

      setComparisons(result.comparisons);
      setRecommendedMode(result.recommendedMode);
      setExposureOptimizedRoute(result.dijkstraExposureOptimized);
      setTradeoffSummary(result.tradeoffSummary);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to calculate commute routes');
    } finally {
      setIsCalculating(false);
    }
  }, []);

  return {
    calculateCommute,
    comparisons,
    recommendedMode,
    exposureOptimizedRoute,
    tradeoffSummary,
    isCalculating,
    error
  };
}
