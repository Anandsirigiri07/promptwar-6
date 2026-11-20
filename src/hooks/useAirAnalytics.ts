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
    const rankedPollutants = [...pollutantsList]
      .filter(pollutant => pollutant.subIndex !== null)
      .sort((a, b) => (b.subIndex ?? -1) - (a.subIndex ?? -1));
    const dominant = rankedPollutants[0] ?? pollutantsList[0]!;

    const pm25Trend = selectedZone.pollutants.pm25.hourlyTrend;
    const pm25Min = pm25Trend.length ? Math.min(...pm25Trend) : null;
    const pm25Max = pm25Trend.length ? Math.max(...pm25Trend) : null;
    const pm25Delta = pm25Trend.length >= 2 ? pm25Trend[pm25Trend.length - 1]! - pm25Trend[0]! : null;

    return {
      dominantPollutant: dominant,
      highestSubIndex: dominant.subIndex,
      rankedPollutants,
      pm25Summary: {
        current: selectedZone.pollutants.pm25.concentration,
        min: pm25Min,
        max: pm25Max,
        isWorsening: pm25Delta !== null && pm25Delta > 0,
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
