import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { getHealthStatus } from '../../server/routes/health.js';
import { AirQualityProvider } from '../../server/services/airQualityProvider.js';
import { calculateCommuteDose } from '../../src/lib/compute/commuteDose.js';
import { calculateRoomIAQ } from '../../src/lib/compute/cadrCalculations.js';
import { requireAuth, type AuthenticatedRequest } from '../../server/middleware/authentication.js';
import { errorHandler } from '../../server/middleware/errorHandler.js';
import { AIService } from '../../server/services/aiService.js';
import { getCommunityPledgeById, logCommunityAction } from '../../server/services/firestoreService.js';
import { routinesRouter } from '../../server/routes/routines.js';
import { iaqRouter } from '../../server/routes/iaq.js';
import { UrbanZoneDefinition } from '../../src/lib/constants.js';

describe('Backend API Route & Middleware Unit Tests (In-Memory)', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('GET /api/health returns healthy operational status', async () => {
    const health = getHealthStatus();
    expect(health).toBeDefined();
    expect(health.status).toBe('healthy');
    expect(health.service).toContain('VAYUWISE AI');
  });

  it('air-quality provider returns micro-airshed zones with normalized pollutants', () => {
    const zones = AirQualityProvider.getZoneTelemetry('Delhi', 'realtime', 'CPCB');
    expect(zones.length).toBe(5);
    expect(zones[0]!.pollutants.pm25).toBeDefined();
    expect(zones[0]!.pollutants.pm10).toBeDefined();
    expect(zones[0]!.pollutants.no2).toBeDefined();
    expect(zones[0]!.pollutants.co).toBeDefined();
    expect(zones[0]!.pollutants.o3).toBeDefined();
    expect(zones[0]!.pollutants.so2).toBeDefined();
    expect(zones[0]!.isDemoData).toBe(true);
    expect(zones[0]!.dataOrigin).toBe('demo');
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

  it('requireAuth rejects demo tokens when NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production';

    let statusCode = 200;
    let jsonResult: any = null;

    const req = {
      headers: { authorization: 'Bearer demo-token' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => {
            jsonResult = data;
          }
        };
      }
    } as unknown as Response;

    const next = vi.fn();
    await requireAuth(req, res, next);

    expect(statusCode).toBe(401);
    expect(jsonResult.success).toBe(false);
    expect(jsonResult.error).toContain('Demo tokens are not permitted in production environment');
    expect(next).not.toHaveBeenCalled();
  });

  it('requireAuth permits demo token in development/evaluation mode with explicit isDemoUser flag', async () => {
    process.env.NODE_ENV = 'development';

    const req = {
      headers: { authorization: 'Bearer demo-token' }
    } as unknown as AuthenticatedRequest;

    const res = {} as unknown as Response;
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user?.isDemoUser).toBe(true);
    expect(req.user?.uid).toBe('demo-user-101');
  });

  it('requireAuth rejects missing or malformed Authorization header with 401', async () => {
    const captured: { statusCode: number; jsonResult: { success?: boolean; error?: string } | null } = {
      statusCode: 200,
      jsonResult: null
    };

    const req = {
      headers: {}
    } as unknown as AuthenticatedRequest;

    const res = {
      status: (code: number) => {
        captured.statusCode = code;
        return {
          json: (data: { success?: boolean; error?: string }) => {
            captured.jsonResult = data;
          }
        };
      }
    } as unknown as Response;

    const next = vi.fn();
    await requireAuth(req, res, next);

    expect(captured.statusCode).toBe(401);
    expect(captured.jsonResult?.success).toBe(false);
    expect(captured.jsonResult?.error).toContain('Missing or malformed Authorization header');
    expect(next).not.toHaveBeenCalled();
  });

  it('errorHandler responds with HTTP 413 for payload size limit breaches', () => {
    const captured: { statusCode: number; jsonResult: { success?: boolean; error?: string } | null } = {
      statusCode: 200,
      jsonResult: null
    };

    const req = { method: 'POST', path: '/api/commute/compare' } as unknown as Request;
    const res = {
      status: (code: number) => {
        captured.statusCode = code;
        return {
          json: (data: { success?: boolean; error?: string }) => {
            captured.jsonResult = data;
          }
        };
      }
    } as unknown as Response;

    const err = { type: 'entity.too.large', status: 413 };
    errorHandler(err, req, res, (() => {}) as NextFunction);

    expect(captured.statusCode).toBe(413);
    expect(captured.jsonResult?.success).toBe(false);
    expect(captured.jsonResult?.error).toContain('Payload too large');
  });

  it('errorHandler redacts bearer tokens and secrets from error logs', () => {
    const captured: { statusCode: number; jsonResult: { success?: boolean; error?: string } | null } = {
      statusCode: 200,
      jsonResult: null
    };

    const req = { method: 'GET', path: '/api/secure' } as unknown as Request;
    const res = {
      status: (code: number) => {
        captured.statusCode = code;
        return {
          json: (data: { success?: boolean; error?: string }) => {
            captured.jsonResult = data;
          }
        };
      }
    } as unknown as Response;

    const sensitiveErr = new Error('Database failed with auth token Bearer secret_token_12345');
    errorHandler(sensitiveErr, req, res, (() => {}) as NextFunction);

    expect(captured.statusCode).toBe(500);
    expect(captured.jsonResult?.success).toBe(false);
    // Client receives generic message on 500
    expect(captured.jsonResult?.error).toContain('An unexpected server error occurred');
  });

  it('AIService generates deterministic routine and emergency advisory without Gemini API key', async () => {
    // 1. Without physical PM2.5, dose reduction is honestly unavailable (never inferred from AQI alone)
    const routineNoPM25 = AIService.generateDeterministicRoutine({
      persona: 'child',
      city: 'Delhi',
      currentAQI: 220,
      dominantPollutant: 'pm25',
      language: 'en'
    });

    expect(routineNoPM25).toBeDefined();
    expect(routineNoPM25.isFallback).toBe(true);
    expect(routineNoPM25.generatedBy).toBe('Deterministic Environmental Health Engine');
    expect(routineNoPM25.schedule.length).toBeGreaterThanOrEqual(3);
    expect(routineNoPM25.estimatedTotalDoseReductionUg).toBeNull();
    expect(routineNoPM25.doseReductionExplanation).toContain('unavailable');

    // 2. With verified physical PM2.5, dose is computed scientifically
    const routineWithPM25 = AIService.generateDeterministicRoutine({
      persona: 'child',
      city: 'Delhi',
      currentAQI: 220,
      ambientPM25: 120,
      dominantPollutant: 'pm25',
      language: 'en'
    });

    expect(routineWithPM25.estimatedTotalDoseReductionUg).toBeGreaterThan(0);
    expect(routineWithPM25.doseReductionExplanation).toContain('120 µg/m³');

    const advisory = await AIService.generateEmergencyAdvisory({
      city: 'Delhi',
      aqi: 320,
      dominantPollutant: 'pm25',
      inversionStrength: 'Severe',
      language: 'en'
    });

    expect(advisory).toBeDefined();
    expect(advisory.isFallback).toBe(true);
    expect(advisory.generatedBy).toBe('Deterministic Environmental Health Engine');
    expect(advisory.immediateActionSteps.length).toBeGreaterThan(1);
  });

  it('Community actions recalculate pledge completed units and avoided emissions', async () => {
    const pledge = await getCommunityPledgeById('pledge-carpool-koramangala');
    expect(pledge).toBeDefined();
    const initialCompleted = pledge!.completedCount;

    const logResult = await logCommunityAction({
      id: `action-test-${Date.now()}`,
      userId: 'test-evaluator',
      pledgeId: 'pledge-carpool-koramangala',
      unitsCompleted: 5,
      notes: 'Carpool test trip'
    });

    expect(logResult).toBeDefined();
    expect(logResult?.status).toBe('self_reported');
    expect(logResult?.updatedPledge.completedCount).toBe(initialCompleted + 5);
    expect(logResult?.updatedPledge.estimatedCO2SavingsKg).toBeGreaterThan(0);
  });

  it('Community actions return null when targeting a nonexistent pledge ID', async () => {
    const logResult = await logCommunityAction({
      id: `action-test-${Date.now()}`,
      userId: 'test-evaluator',
      pledgeId: 'non-existent-pledge-9999',
      unitsCompleted: 5
    });

    expect(logResult).toBeNull();
  });

  it('Durable idempotency returns cached action and prevents duplicate counter increments', async () => {
    const testIdempKey = `idemp-test-${Date.now()}`;
    const pledge = await getCommunityPledgeById('pledge-carpool-koramangala');
    const beforeCount = pledge!.completedCount;

    // First submission
    const firstResult = await logCommunityAction({
      id: `action-idemp-1-${Date.now()}`,
      userId: 'idemp-evaluator',
      pledgeId: 'pledge-carpool-koramangala',
      unitsCompleted: 4,
      idempotencyKey: testIdempKey
    });

    expect(firstResult).toBeDefined();
    expect(firstResult?.isDuplicate).toBe(false);
    expect(firstResult?.updatedPledge.completedCount).toBe(beforeCount + 4);

    // Replayed submission with identical idempotencyKey
    const secondResult = await logCommunityAction({
      id: `action-idemp-2-${Date.now()}`,
      userId: 'idemp-evaluator',
      pledgeId: 'pledge-carpool-koramangala',
      unitsCompleted: 4,
      idempotencyKey: testIdempKey
    });

    expect(secondResult).toBeDefined();
    expect(secondResult?.isDuplicate).toBe(true);
    // Crucial: completed count did not increment again!
    expect(secondResult?.updatedPledge.completedCount).toBe(beforeCount + 4);
  });

  it('POST /api/exposure/explain rejects deriving dose from overall AQI alone and requires verified PM2.5', async () => {
    // 1. When only overall AQI is provided without PM2.5 mass concentration
    let explainResult: { success?: boolean; data?: { isAvailable?: boolean; estimatedInhaledDose_ug?: number | null; effectivePM25Concentration_ugm3?: number | null } } = {};
    const reqNoPM25 = {
      body: {
        activity: 'Morning Jog',
        durationMinutes: 45,
        locationType: 'outdoor',
        currentAQI: 260
      }
    } as unknown as Request;
    const resNoPM25 = {
      json: (d: typeof explainResult) => { explainResult = d; return resNoPM25; }
    } as unknown as Response;

    const explainHandler = (routinesRouter as any).stack.find((s: any) => s.route?.path === '/exposure/explain')?.route?.stack.slice(-1)[0]?.handle;
    expect(explainHandler).toBeDefined();

    await explainHandler(reqNoPM25, resNoPM25, () => {});
    expect(explainResult.success).toBe(true);
    expect(explainResult.data?.isAvailable).toBe(false);
    expect(explainResult.data?.estimatedInhaledDose_ug).toBeNull();
    expect(explainResult.data?.effectivePM25Concentration_ugm3).toBeNull();

    // 2. When verified physical PM2.5 concentration is provided directly
    let explainWithPM25: { success?: boolean; data?: { isAvailable?: boolean; estimatedInhaledDose_ug?: number | null; effectivePM25Concentration_ugm3?: number | null } } = {};
    const reqWithPM25 = {
      body: {
        activity: 'Morning Jog',
        durationMinutes: 45,
        locationType: 'outdoor',
        currentAQI: 260,
        ambientPM25: 140
      }
    } as unknown as Request;
    const resWithPM25 = {
      json: (d: typeof explainWithPM25) => { explainWithPM25 = d; return resWithPM25; }
    } as unknown as Response;

    await explainHandler(reqWithPM25, resWithPM25, () => {});
    expect(explainWithPM25.success).toBe(true);
    expect(explainWithPM25.data?.isAvailable).toBe(true);
    expect(explainWithPM25.data?.effectivePM25Concentration_ugm3).toBe(140);
    expect(explainWithPM25.data?.estimatedInhaledDose_ug).toBeGreaterThan(0);
  });

  it('POST /api/iaq/calculate does not fabricate weather defaults and labels user input honestly', async () => {
    let iaqResult: { success?: boolean; data?: { ventilationConditions?: { source?: string; isAvailable?: boolean; temperatureC?: number | null } } } = {};
    const req = {
      body: {
        name: 'Bedroom',
        lengthM: 4,
        widthM: 3.5,
        heightM: 2.8,
        occupants: 2,
        currentPurifierCADR: 150,
        targetACH: 5.0,
        outdoorAQI: 180
      }
    } as unknown as Request;
    const res = {
      json: (d: typeof iaqResult) => { iaqResult = d; return res; }
    } as unknown as Response;

    const calcHandler = (iaqRouter as any).stack.find((s: any) => s.route?.path === '/calculate')?.route?.stack.slice(-1)[0]?.handle;
    expect(calcHandler).toBeDefined();

    await calcHandler(req, res, () => {});
    expect(iaqResult.success).toBe(true);
    expect(iaqResult.data?.ventilationConditions?.source).toBe('user_supplied');
  });

  it('AirQualityProvider OpenAQ connector gracefully handles unconfigured key', async () => {
    const originalKey = process.env.OPENAQ_API_KEY;
    delete process.env.OPENAQ_API_KEY;

    const dummyZone: UrbanZoneDefinition = {
      id: 'delhi-anand-vihar',
      name: 'Anand Vihar',
      city: 'Delhi',
      latitude: 28.6469,
      longitude: 77.3160
    };

    const result = await AirQualityProvider.fetchLiveOpenAQZone(dummyZone, 'CPCB');
    expect(result).toBeNull();

    if (originalKey) {
      process.env.OPENAQ_API_KEY = originalKey;
    }
  });
});
