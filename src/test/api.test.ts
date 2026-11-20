import { describe, it, expect } from 'vitest';
import { Request, Response } from 'express';
import { getHealthStatus } from '../../server/routes/health.js';
import { AirQualityProvider } from '../../server/services/airQualityProvider.js';
import { calculateCommuteDose } from '../../src/lib/compute/commuteDose.js';
import { calculateRoomIAQ } from '../../src/lib/compute/cadrCalculations.js';
import { requestSizeLimit } from '../../server/middleware/security.js';

describe('Backend API Route & Middleware Unit Tests (In-Memory)', () => {
  it('GET /api/health returns healthy operational status', async () => {
    const health = getHealthStatus();
    expect(health).toBeDefined();
    expect(health.status).toBe('healthy');
    expect(health.service).toContain('VAYUWISE AI');
  });

  it('air-quality provider returns 5 micro-airshed zones with normalized pollutants', () => {
    const zones = AirQualityProvider.getZoneTelemetry('Bengaluru', 'realtime', 'CPCB');
    expect(zones.length).toBe(5);
    expect(zones[0]!.pollutants.pm25).toBeDefined();
    expect(zones[0]!.pollutants.pm10).toBeDefined();
    expect(zones[0]!.pollutants.no2).toBeDefined();
    expect(zones[0]!.pollutants.co).toBeDefined();
    expect(zones[0]!.pollutants.o3).toBeDefined();
    expect(zones[0]!.pollutants.so2).toBeDefined();
    expect(zones[0]!.isDemoData).toBe(true);
  });

  it('POST /api/commute/compare computes inhaled dose and emissions across modes', () => {
    const metro = calculateCommuteDose({
      mode: 'metro',
      distanceKm: 12,
      ambientPM25_ugm3: 150,
      hasN95Mask: false
    });

    const cycling = calculateCommuteDose({
      mode: 'cycling',
      distanceKm: 12,
      ambientPM25_ugm3: 150,
      hasN95Mask: false
    });

    // In severe smog, metro cabin filtration reduces inhaled PM2.5 compared to cycling
    expect(metro.inhaledDose_ug).toBeLessThan(cycling.inhaledDose_ug);
    expect(metro.co2Emitted_grams).toBeGreaterThanOrEqual(0);
  });

  it('POST /api/iaq/calculate evaluates room dimensions and CADR requirements', () => {
    const result = calculateRoomIAQ({
      name: 'Test Office',
      lengthM: 6,
      widthM: 5,
      heightM: 3,
      currentPurifierCADR_m3h: 300,
      targetACH: 5
    });

    expect(result.roomVolumeM3).toBe(90);
    expect(result.requiredCADR_m3h).toBe(450);
    expect(result.cadrDeficit_m3h).toBe(150);
    expect(result.actualACH).toBe(3.3);
  });

  it('requestSizeLimit rejects payloads exceeding 15KB with HTTP 413', () => {
    const limiter = requestSizeLimit(15 * 1024);
    let statusCode = 200;
    let jsonResponse: any = null;

    const req = {
      headers: {
        'content-length': '20000' // 20 KB
      }
    } as unknown as Request;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => {
            jsonResponse = data;
          }
        };
      }
    } as unknown as Response;

    limiter(req, res, () => {});

    expect(statusCode).toBe(413);
    expect(jsonResponse.success).toBe(false);
    expect(jsonResponse.error).toContain('Payload too large');
  });
});
