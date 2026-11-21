import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIService, initializeGenAI } from '../../server/services/aiService.js';

describe('Gemini AI Service & Deterministic Gateway Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('generates high-fidelity deterministic routines tailored for different vulnerability personas', () => {
    const routineCommuter = AIService.generateDeterministicRoutine({
      persona: 'office_commuter',
      city: 'Delhi',
      currentAQI: 275,
      dominantPollutant: 'pm25',
      language: 'en'
    });

    expect(routineCommuter.persona).toBe('office_commuter');
    expect(routineCommuter.baselineAQI).toBe(275);
    expect(routineCommuter.schedule.length).toBeGreaterThanOrEqual(4);
    expect(routineCommuter.isFallback).toBe(true);
    // Never fabricates an arbitrary dose reduction number without person-specific measurements
    expect(routineCommuter.estimatedTotalDoseReductionUg).toBeNull();
    expect(routineCommuter.doseReductionExplanation).toContain('person-specific');

    const routineStudent = AIService.generateDeterministicRoutine({
      persona: 'student',
      city: 'Bengaluru',
      currentAQI: 120,
      dominantPollutant: 'pm10',
      language: 'en'
    });

    expect(routineStudent.persona).toBe('student');
    expect(routineStudent.schedule.some(s => s.activityName.toLowerCase().includes('school'))).toBe(true);
  });

  it('generates multilingual emergency advisory briefings based on AQI severity', async () => {
    const severeAdvisory = await AIService.generateEmergencyAdvisory({
      city: 'Delhi NCR',
      aqi: 380,
      dominantPollutant: 'pm25',
      inversionStrength: 'Severe',
      language: 'en'
    });

    expect(severeAdvisory.severityLabel).toContain('Stage IV');
    expect(severeAdvisory.headline).toContain('High Particulate Inversion');
    expect(severeAdvisory.immediateActionSteps.length).toBeGreaterThanOrEqual(3);
    expect(severeAdvisory.immediateActionSteps.some(step => step.includes('N95'))).toBe(true);

    const moderateAdvisory = await AIService.generateEmergencyAdvisory({
      city: 'Bengaluru',
      aqi: 140,
      dominantPollutant: 'pm10',
      inversionStrength: 'None',
      language: 'en'
    });

    expect(moderateAdvisory.severityLabel).toContain('Moderate');
  });

  it('seamlessly falls back to deterministic engine when GEMINI_API_KEY is not configured', async () => {
    delete process.env.GEMINI_API_KEY;
    initializeGenAI();

    const routine = await AIService.generatePersonalizedRoutine({
      persona: 'asthmatic',
      city: 'Delhi',
      zoneId: 'zone-1',
      currentAQI: 310,
      dominantPollutant: 'pm25',
      wakeTime: '06:00',
      sleepTime: '22:00',
      language: 'en'
    });

    expect(routine).toBeDefined();
    expect(routine.isFallback).toBe(true);
    expect(routine.persona).toBe('asthmatic');
    expect(routine.estimatedTotalDoseReductionUg).toBeNull();
  });
});
