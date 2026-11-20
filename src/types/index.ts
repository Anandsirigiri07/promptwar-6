/**
 * VAYUWISE AI - Central Types Export
 */

export * from './telemetry.js';
export * from './routine.js';
export * from './commute.js';
export * from './iaq.js';
export * from './community.js';

export type SupportedLanguage = 'en' | 'hi' | 'kn' | 'ar' | 'es';

export interface UserPreferences {
  city: string;
  selectedZoneId: string;
  language: SupportedLanguage;
  householdPersonas: string[];
  highContrastMode: boolean;
  reducedMotion: boolean;
  aqiStandard: 'CPCB' | 'EPA';
}
