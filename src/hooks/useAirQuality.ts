/**
 * VAYUWISE AI - useAirQuality Hook
 */

import { useApp } from '../context/AppContext.js';
import { PollutantType } from '../lib/compute/aqiBreakpoints.js';

export function useAirQuality() {
  const {
    selectedZone,
    allZones,
    currentScenario,
    setSelectedZoneId,
    setScenario,
    refreshTelemetry,
    isLoading,
    error
  } = useApp();

  const getPollutant = (code: PollutantType) => {
    return selectedZone?.pollutants[code] || null;
  };

  return {
    zone: selectedZone,
    zones: allZones,
    scenario: currentScenario,
    selectZone: setSelectedZoneId,
    applyScenario: setScenario,
    refresh: refreshTelemetry,
    getPollutant,
    isLoading,
    error
  };
}
