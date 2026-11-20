/**
 * VAYUWISE AI - useUserPreferences Hook
 */

import { useApp } from '../context/AppContext.js';
import { SUPPORTED_PERSONAS } from '../lib/constants.js';
import { PersonaType } from '../types/routine.js';

export function useUserPreferences() {
  const { preferences, updatePreferences, selectedPersona, setSelectedPersona } = useApp();

  const toggleHouseholdPersona = (persona: PersonaType) => {
    const current = preferences.householdPersonas;
    const exists = current.includes(persona);
    const updated = exists ? current.filter(p => p !== persona) : [...current, persona];
    updatePreferences({ householdPersonas: updated });
  };

  const activePersonaProfile = SUPPORTED_PERSONAS[selectedPersona] || SUPPORTED_PERSONAS.child;

  return {
    preferences,
    updatePreferences,
    selectedPersona,
    setSelectedPersona,
    activePersonaProfile,
    allProfiles: SUPPORTED_PERSONAS,
    toggleHouseholdPersona
  };
}
