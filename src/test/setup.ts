import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

const mockDefaultZones = [
  {
    zoneId: 'zone-1',
    name: 'Central Sector',
    city: 'Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    overallAQI: 165,
    dominantPollutant: 'pm25',
    category: 'Moderate',
    temperatureC: 18,
    humidityPercent: 62,
    windSpeedKmh: 7.2,
    isInversionActive: false,
    pollutants: {
      pm25: { code: 'pm25', name: 'Fine Particulates (PM2.5)', concentration: 85, unit: 'µg/m³', subIndex: 165, category: 'Moderate', healthImplications: 'Fine particulate', hourlyTrend: [80, 82, 85, 84, 85, 86, 85] },
      pm10: { code: 'pm10', name: 'Coarse Particulates (PM10)', concentration: 150, unit: 'µg/m³', subIndex: 133, category: 'Moderate', healthImplications: 'Coarse particulate', hourlyTrend: [140, 145, 150, 148, 150, 152, 150] },
      no2: { code: 'no2', name: 'Nitrogen Dioxide (NO2)', concentration: 45, unit: 'µg/m³', subIndex: 56, category: 'Satisfactory', healthImplications: 'Nitrogen dioxide', hourlyTrend: [40, 42, 45, 43, 45, 46, 45] },
      co: { code: 'co', name: 'Carbon Monoxide (CO)', concentration: 1.2, unit: 'mg/m³', subIndex: 60, category: 'Satisfactory', healthImplications: 'Carbon monoxide', hourlyTrend: [1.0, 1.1, 1.2, 1.1, 1.2, 1.2, 1.2] },
      o3: { code: 'o3', name: 'Ozone (O3)', concentration: 40, unit: 'µg/m³', subIndex: 40, category: 'Good', healthImplications: 'Ozone', hourlyTrend: [35, 38, 40, 39, 40, 41, 40] },
      so2: { code: 'so2', name: 'Sulfur Dioxide (SO2)', concentration: 15, unit: 'µg/m³', subIndex: 19, category: 'Good', healthImplications: 'Sulfur dioxide', hourlyTrend: [12, 14, 15, 14, 15, 15, 15] }
    },
    measuredAt: '2026-11-20T06:00:00.000Z',
    dataProvider: 'Open-Meteo Model',
    isDemoData: false,
    dataOrigin: 'live_model',
    freshnessMinutes: 10
  }
];

// Mock fetch for client-side component tests to avoid unhandled async network errors after unmount
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
  
  if (url.includes('/api/air-quality')) {
    return new Response(JSON.stringify({ success: true, data: mockDefaultZones }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (url.includes('/api/community/pledges') || url.includes('/api/community/initiatives')) {
    return new Response(JSON.stringify({
      success: true,
      data: {
        pledges: [],
        aggregates: {
          totalParticipants: 0,
          totalActivePledges: 0,
          totalActionsLogged: 0,
          cumulativeCO2SavedKg: 0,
          cumulativePM25AvoidedGrams: 0,
          lastUpdatedAt: new Date().toISOString()
        },
        isDemoData: true,
        dataOrigin: 'demo',
        methodologyStandards: { cpcb: true, ipcc: true }
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (originalFetch) {
    return originalFetch(input, init);
  }

  return new Response(JSON.stringify({ success: true, data: {} }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

afterEach(() => {
  cleanup();
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  } catch {}
});

// Mock window.matchMedia if needed in jsdom
if (typeof window !== 'undefined') {
  if (!window.location.origin || window.location.origin === 'null') {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost:5173'),
      writable: true
    });
  }

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    })
  });
}