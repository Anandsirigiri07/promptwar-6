/**
 * VAYUWISE AI - Commute, IAQ, and Community Action Schemas
 */

import { z } from 'zod';

export const CommuteCompareRequestSchema = z.object({
  origin: z.string().min(1).max(150),
  destination: z.string().min(1).max(150),
  distanceKm: z.number().min(0.2).max(500),
  ambientPM25: z.number().min(0).max(1000),
  hasN95Mask: z.boolean().default(false),
  preferredMode: z.enum([
    'metro',
    'electric_bus',
    'diesel_bus',
    'ev_car',
    'petrol_car',
    'cycling',
    'walking'
  ]).optional()
});

export const IAQCalculateRequestSchema = z.object({
  name: z.string().min(1).max(100).default('Primary Living Area'),
  lengthM: z.number().min(1.0).max(100),
  widthM: z.number().min(1.0).max(100),
  heightM: z.number().min(1.5).max(30),
  occupants: z.number().int().min(1).max(100).default(3),
  currentPurifierCADR: z.number().min(0).max(10000).default(0),
  targetACH: z.number().min(1.0).max(15.0).default(5.0),
  outdoorAQI: z.number().min(0).max(1000).optional(),
  outdoorPM25: z.number().min(0).max(1000).optional(),
  temperatureC: z.number().min(-30).max(60).optional(),
  humidityPercent: z.number().min(0).max(100).optional(),
  windSpeedKmh: z.number().min(0).max(150).optional()
});

export const CommunityPledgeRequestSchema = z.object({
  category: z.enum(['carpool', 'transit', 'anti_burn', 'clean_energy', 'green_neighborhood']),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(500),
  targetCount: z.number().int().min(1).max(10000)
});

export const CommunityActionLogRequestSchema = z.object({
  pledgeId: z.string().min(1).max(100),
  unitsCompleted: z.number().int().min(1).max(100),
  notes: z.string().max(250).optional()
});

export const EmergencyAdvisoryRequestSchema = z.object({
  city: z.string().min(1).max(100),
  aqi: z.number().min(0).max(1000),
  dominantPollutant: z.string().min(1).max(20).default('pm25'),
  inversionStrength: z.enum(['None', 'Weak', 'Moderate', 'Severe']).default('Moderate'),
  language: z.enum(['en', 'hi', 'kn', 'ar', 'es']).default('en')
});
