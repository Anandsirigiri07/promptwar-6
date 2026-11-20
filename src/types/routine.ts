/**
 * VAYUWISE AI - Daily Routine & Exposure Engine Types
 */

export type PersonaType = 
  | 'child'
  | 'infant'
  | 'elderly'
  | 'respiratory_sensitive'
  | 'student'
  | 'office_commuter'
  | 'cyclist_athlete'
  | 'community_coordinator';

export interface PersonaProfile {
  type: PersonaType;
  label: string;
  iconName: string;
  vulnerabilityLevel: 'High' | 'Moderate' | 'Standard';
  keyVulnerabilities: string[];
  recommendedMaxExposureAQI: number;
}

export interface ActivityScheduleItem {
  id: string;
  timeWindow: string; // e.g. "06:30 - 07:30"
  activityName: string;
  locationType: 'indoor' | 'outdoor' | 'transit';
  exposureRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  scientificReasoning: string;
  relevantPollutants: string[];
  saferAlternative: string;
  estimatedInhaledDoseReductionPercent: number;
  actionableStep: string;
}

export interface DailyPersonalizedRoutine {
  routineId: string;
  persona: PersonaType;
  targetDate: string;
  baselineAQI: number;
  overallHealthRiskSummary: string;
  schedule: ActivityScheduleItem[];
  estimatedTotalDoseReductionUg: number;
  generatedBy: 'Gemini-3.1-Flash-Lite' | 'Deterministic-Engine-Fallback';
  generatedAt: string;
  isFallback: boolean;
}
