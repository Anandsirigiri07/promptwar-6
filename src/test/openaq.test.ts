import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AirQualityProvider } from '../../server/services/airQualityProvider.js';
import { UrbanZoneDefinition } from '../lib/constants.js';

describe('OpenAQ v3 Ground Station Provider Unit & Contract Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  const mockZone: UrbanZoneDefinition = {
    id: 'zone-delhi-1',
    name: 'Central Secretariat',
    city: 'Delhi',
    latitude: 28.615,
    longitude: 77.212
  };

  it('returns null immediately when OPENAQ_API_KEY is unset or placeholder', async () => {
    delete process.env.OPENAQ_API_KEY;
    const result = await AirQualityProvider.fetchLiveOpenAQZone(mockZone, 'CPCB');
    expect(result).toBeNull();

    process.env.OPENAQ_API_KEY = 'your_openaq_api_key_here';
    const result2 = await AirQualityProvider.fetchLiveOpenAQZone(mockZone, 'CPCB');
    expect(result2).toBeNull();
  });

  it('gracefully handles location endpoint HTTP failure without throwing', async () => {
    process.env.OPENAQ_API_KEY = 'valid-test-key-12345';
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden'
    } as any);

    const result = await AirQualityProvider.fetchLiveOpenAQZone(mockZone, 'CPCB');
    expect(result).toBeNull();
  });

  it('filters out locations with monitor=false or 0 sensors', async () => {
    process.env.OPENAQ_API_KEY = 'valid-test-key-12345';
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 101,
            name: 'Mobile Sensor Unit',
            isMonitor: false,
            coordinates: { latitude: 28.61, longitude: 77.21 },
            sensors: []
          }
        ]
      })
    } as any);

    const result = await AirQualityProvider.fetchLiveOpenAQZone(mockZone, 'CPCB');
    expect(result).toBeNull();
  });

  it('correctly parses authentic OpenAQ v3 ground measurements with accurate provenance', async () => {
    process.env.OPENAQ_API_KEY = 'valid-test-key-12345';

    const recentDate = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 mins ago

    // Mock 1: /v3/locations response
    const mockLocationsResponse = {
      results: [
        {
          id: 9999,
          name: 'Mandir Marg Continuous Station',
          isMonitor: true,
          coordinates: { latitude: 28.62, longitude: 77.20 },
          sensors: [
            { id: 1, parameter: { name: 'pm25', units: 'ug/m3' } },
            { id: 2, parameter: { name: 'pm10', units: 'ug/m3' } },
            { id: 3, parameter: { name: 'no2', units: 'ug/m3' } },
            { id: 4, parameter: { name: 'co', units: 'mg/m3' } }
          ]
        }
      ]
    };

    // Mock 2: /v3/locations/:id/latest response
    const mockLatestResponse = {
      results: [
        { locationsId: 9999, sensorsId: 1, value: 85.5, datetime: { utc: recentDate } },
        { locationsId: 9999, sensorsId: 2, value: 145.0, datetime: { utc: recentDate } },
        { locationsId: 9999, sensorsId: 3, value: 62.0, datetime: { utc: recentDate } },
        { locationsId: 9999, sensorsId: 4, value: 1.8, datetime: { utc: recentDate } }
      ]
    };

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLocationsResponse
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLatestResponse
      } as any);

    const telemetry = await AirQualityProvider.fetchLiveOpenAQZone(mockZone, 'CPCB');

    expect(telemetry).not.toBeNull();
    expect(telemetry?.dataOrigin).toBe('live_station');
    expect(telemetry?.isDemoData).toBe(false);
    expect(telemetry?.dataProvider).toContain('OpenAQ v3 Ground Station');
    expect(telemetry?.pollutants.pm25.concentration).toBe(85.5);
    expect(telemetry?.pollutants.pm10.concentration).toBe(145.0);
    expect(telemetry?.pollutants.no2.concentration).toBe(62.0);
    expect(telemetry?.pollutants.co.concentration).toBe(1.8);
    // Never fabricates weather fields when using OpenAQ
    expect(telemetry?.temperatureC).toBeNull();
    expect(telemetry?.humidityPercent).toBeNull();
    expect(telemetry?.windSpeedKmh).toBeNull();
  });

  it('rejects stale observations older than 6 hours', async () => {
    process.env.OPENAQ_API_KEY = 'valid-test-key-12345';
    const staleDate = new Date(Date.now() - 10 * 3600 * 1000).toISOString(); // 10 hours ago

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 8888,
              name: 'Stale Station',
              isMonitor: true,
              coordinates: { latitude: 28.62, longitude: 77.20 },
              sensors: [{ id: 1, parameter: { name: 'pm25', units: 'ug/m3' } }]
            }
          ]
        })
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            { locationsId: 8888, sensorsId: 1, value: 95.0, datetime: { utc: staleDate } }
          ]
        })
      } as any);

    const result = await AirQualityProvider.fetchLiveOpenAQZone(mockZone, 'CPCB');
    expect(result).toBeNull();
  });
});
