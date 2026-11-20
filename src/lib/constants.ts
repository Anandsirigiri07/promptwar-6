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

export const URBAN_ZONES_DEFAULT = [
  { id: 'zone-1', name: 'Central Commercial & Tech Corridor', city: 'Bengaluru / Delhi NCR', latitude: 28.6139, longitude: 77.2090 },
  { id: 'zone-2', name: 'Industrial Hub & Logistics Zone', city: 'Bengaluru / Delhi NCR', latitude: 28.6500, longitude: 77.3000 },
  { id: 'zone-3', name: 'Dense Residential & School District', city: 'Bengaluru / Delhi NCR', latitude: 28.5500, longitude: 77.1800 },
  { id: 'zone-4', name: 'Green Ridge & Forest Foothills', city: 'Bengaluru / Delhi NCR', latitude: 28.5800, longitude: 77.1500 },
  { id: 'zone-5', name: 'High-Density Traffic Intersection', city: 'Bengaluru / Delhi NCR', latitude: 28.6300, longitude: 77.2400 }
];
