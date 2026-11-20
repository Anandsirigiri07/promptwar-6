/**
 * VAYUWISE AI - Application Constants and Persona Profiles
 */

import { PersonaProfile, PersonaType } from '../types/routine.js';

export const APP_NAME = 'VAYUWISE AI';
export const APP_TAGLINE = 'Breathe Smarter. Live Safer. Build Cleaner Communities.';

export const SUPPORTED_PERSONAS: Record<PersonaType, PersonaProfile> = {
  child: {
    type: 'child',
    label: 'Child (Ages 1-12)',
    iconName: 'Baby',
    vulnerabilityLevel: 'High',
    keyVulnerabilities: ['Developing lung alveolar tissue', 'Higher respiration rate per kg bodyweight', 'Frequent outdoor play'],
    recommendedMaxExposureAQI: 100
  },
  infant: {
    type: 'infant',
    label: 'Infant (< 1 Year)',
    iconName: 'ShieldAlert',
    vulnerabilityLevel: 'High',
    keyVulnerabilities: ['Immature immune barriers', 'Extreme particulate penetration vulnerability', 'Cannot wear N95 masks safely'],
    recommendedMaxExposureAQI: 60
  },
  elderly: {
    type: 'elderly',
    label: 'Senior Citizen (65+)',
    iconName: 'HeartPulse',
    vulnerabilityLevel: 'High',
    keyVulnerabilities: ['Elevated cardiovascular stroke risk during particulate spikes', 'Reduced lung elasticity', 'Pre-existing hypertension'],
    recommendedMaxExposureAQI: 120
  },
  respiratory_sensitive: {
    type: 'respiratory_sensitive',
    label: 'Asthma / COPD / Bronchitis',
    iconName: 'Activity',
    vulnerabilityLevel: 'High',
    keyVulnerabilities: ['Airway hyper-reactivity to SO2 and PM2.5', 'Severe bronchospasm risk', 'Requires rapid access to rescue inhaler'],
    recommendedMaxExposureAQI: 80
  },
  student: {
    type: 'student',
    label: 'School / College Student',
    iconName: 'GraduationCap',
    vulnerabilityLevel: 'Moderate',
    keyVulnerabilities: ['Morning commute smog peak', 'School assembly exposure', 'Physical education exertion'],
    recommendedMaxExposureAQI: 150
  },
  office_commuter: {
    type: 'office_commuter',
    label: 'Daily Office Commuter',
    iconName: 'Briefcase',
    vulnerabilityLevel: 'Standard',
    keyVulnerabilities: ['Peak traffic rush-hour diesel soot exposure', 'Long wait at bus stops / traffic junctions'],
    recommendedMaxExposureAQI: 200
  },
  cyclist_athlete: {
    type: 'cyclist_athlete',
    label: 'Cyclist / Outdoor Runner',
    iconName: 'Bike',
    vulnerabilityLevel: 'High',
    keyVulnerabilities: ['Up to 4x higher minute-ventilation rate', 'Deep alveolar PM2.5 deposition during aerobic exertion'],
    recommendedMaxExposureAQI: 100
  },
  community_coordinator: {
    type: 'community_coordinator',
    label: 'Community Clean-Air Champion',
    iconName: 'Users',
    vulnerabilityLevel: 'Standard',
    keyVulnerabilities: ['Organizing neighborhood awareness', 'Auditing waste burning and leaf burning hotspots'],
    recommendedMaxExposureAQI: 200
  }
};

export interface UrbanZoneDefinition {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
}

export const DELHI_ZONES: UrbanZoneDefinition[] = [
  { id: 'zone-delhi-1', name: 'Connaught Place & Central Corridor', city: 'Delhi', latitude: 28.6315, longitude: 77.2167 },
  { id: 'zone-delhi-2', name: 'Anand Vihar & Industrial Cluster', city: 'Delhi', latitude: 28.6469, longitude: 77.3160 },
  { id: 'zone-delhi-3', name: 'RK Puram & Residential District', city: 'Delhi', latitude: 28.5660, longitude: 77.1767 },
  { id: 'zone-delhi-4', name: 'Southern Ridge & Green Corridor', city: 'Delhi', latitude: 28.5200, longitude: 77.1600 },
  { id: 'zone-delhi-5', name: 'ITO & Ring Road Congestion Junction', city: 'Delhi', latitude: 28.6289, longitude: 77.2406 }
];

export const BENGALURU_ZONES: UrbanZoneDefinition[] = [
  { id: 'zone-blr-1', name: 'MG Road & Central Tech District', city: 'Bengaluru', latitude: 12.9756, longitude: 77.6066 },
  { id: 'zone-blr-2', name: 'Peenya Industrial & Logistics Area', city: 'Bengaluru', latitude: 13.0285, longitude: 77.5197 },
  { id: 'zone-blr-3', name: 'Indiranagar & Residential Neighborhood', city: 'Bengaluru', latitude: 12.9784, longitude: 77.6408 },
  { id: 'zone-blr-4', name: 'Cubbon Park & Botanical Green Belt', city: 'Bengaluru', latitude: 12.9763, longitude: 77.5929 },
  { id: 'zone-blr-5', name: 'Silk Board & Outer Ring Road Transit Hub', city: 'Bengaluru', latitude: 12.9177, longitude: 77.6238 }
];

export const URBAN_ZONES_DEFAULT: UrbanZoneDefinition[] = DELHI_ZONES;

export function getZonesForCity(city: string): UrbanZoneDefinition[] {
  const normalized = city.toLowerCase();
  if (normalized.includes('delhi') || normalized.includes('ncr')) {
    return DELHI_ZONES;
  }
  if (normalized.includes('bengaluru') || normalized.includes('bangalore')) {
    return BENGALURU_ZONES;
  }
  return DELHI_ZONES;
}
