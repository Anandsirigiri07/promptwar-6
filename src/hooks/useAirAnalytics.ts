/**
 * VAYUWISE AI - useAirAnalytics Hook
 * Calculates summary metrics, worst pollutants, and trends.
 */

import { useMemo } from 'react';
import { useApp } from '../context/AppContext.js';

export function useAirAnalytics() {
  const { selectedZone } = useApp();

  const analytics = useMemo(() => {
    if (!selectedZone) return null;

    const pollutantsList = Object.values(selectedZone.pollutants);
    const sortedBySubIndex = [...pollutantsList].sort((a, b) => b.subIndex - a.subIndex);
    const dominant = sortedBySubIndex[0]!;

    const pm25Trend = selectedZone.pollutants.pm25.hourlyTrend;
    const pm25Min = Math.min(...pm25Trend);
    const pm25Max = Math.max(...pm25Trend);
    const pm25Delta = pm25Trend[pm25Trend.length - 1]! - pm25Trend[0]!;

    return {
      dominantPollutant: dominant,
      highestSubIndex: dominant.subIndex,
      rankedPollutants: sortedBySubIndex,
      pm25Summary: {
        current: selectedZone.pollutants.pm25.concentration,
        min: pm25Min,
        max: pm25Max,
        isWorsening: pm25Delta > 0,
        trend: pm25Trend
      },
      inversionRisk: selectedZone.isInversionActive === true
        ? 'Active Thermal Inversion'
        : selectedZone.isInversionActive === false
        ? 'Normal Atmospheric Lapse Rate'
        : 'Atmospheric Inversion State Unknown'
    };
  }, [selectedZone]);

  return analytics;
}
