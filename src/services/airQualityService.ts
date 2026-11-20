/**
 * VAYUWISE AI - Air Quality Client Service
 */

import { apiRequest } from './apiService.js';
import { UrbanZoneTelemetry, ScenarioType } from '../types/telemetry.js';

export const airQualityService = {
  async getZones(city = 'Delhi', scenario: ScenarioType = 'realtime'): Promise<UrbanZoneTelemetry[]> {
    return apiRequest<UrbanZoneTelemetry[]>(`/api/air-quality/zones?city=${encodeURIComponent(city)}&scenario=${scenario}`);
  },

  async getCurrentZone(city = 'Delhi', zoneId = 'zone-delhi-1', scenario: ScenarioType = 'realtime') {
    return apiRequest<{
      currentZone: UrbanZoneTelemetry;
      city: string;
      standard: string;
      scenario: string;
      lastUpdated: string;
    }>(`/api/air-quality?city=${encodeURIComponent(city)}&zoneId=${encodeURIComponent(zoneId)}&scenario=${scenario}`);
  },

  async simulateScenario(scenario: ScenarioType, targetZoneId: string) {
    return apiRequest<{
      scenario: ScenarioType;
      targetZone: UrbanZoneTelemetry;
      allZones: UrbanZoneTelemetry[];
      explanation: string;
    }>('/api/air-quality/simulate', {
      method: 'POST',
      body: JSON.stringify({ scenario, targetZoneId })
    });
  }
};
