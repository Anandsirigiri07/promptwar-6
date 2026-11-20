/**
 * VAYUWISE AI - Daily Routine Request & Structured AI Response Schemas
 */

import { z } from 'zod';

export const RoutineRequestSchema = z.object({
  persona: z.enum([
    'child',
    'infant',
    'elderly',
    'respiratory_sensitive',
    'student',
    'office_commuter',
    'cyclist_athlete',
    'community_coordinator'
  ]),
  city: z.string().min(1).max(100),
  zoneId: z.string().min(1).max(50),
  currentAQI: z.number().min(0).max(1000),
  dominantPollutant: z.string().min(1).max(20).default('pm25'),
  wakeTime: z.string().regex(/^\d{2}:\d{2}$/).default('06:30'),
  sleepTime: z.string().regex(/^\d{2}:\d{2}$/).default('22:00'),
  workStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  workEndTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  schoolStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  language: z.enum(['en', 'hi', 'kn', 'ar', 'es']).default('en')
});

export const ActivityScheduleItemSchema = z.object({
  id: z.string(),
  timeWindow: z.string(),
  activityName: z.string(),
  locationType: z.enum(['indoor', 'outdoor', 'transit']),
  exposureRiskLevel: z.enum(['Low', 'Moderate', 'High', 'Severe']),
  scientificReasoning: z.string(),
  relevantPollutants: z.array(z.string()),
  saferAlternative: z.string(),
  estimatedInhaledDoseReductionPercent: z.number().min(0).max(100),
  actionableStep: z.string()
});

export const DailyRoutineResponseSchema = z.object({
  routineId: z.string(),
  persona: z.string(),
  targetDate: z.string(),
  baselineAQI: z.number(),
  overallHealthRiskSummary: z.string(),
  schedule: z.array(ActivityScheduleItemSchema).min(3).max(10),
  estimatedTotalDoseReductionUg: z.number().min(0),
  generatedBy: z.string(),
  generatedAt: z.string(),
  isFallback: z.boolean()
});

export const ExposureExplainRequestSchema = z.object({
  activity: z.string().min(1).max(150),
  durationMinutes: z.number().min(1).max(720),
  locationType: z.enum(['indoor', 'outdoor', 'transit']),
  currentAQI: z.number().min(0).max(1000),
  ambientPM25: z.number().min(0).max(1000).optional(),
  isMasked: z.boolean().default(false),
  language: z.enum(['en', 'hi', 'kn', 'ar', 'es']).default('en')
});
