/**
 * VAYUWISE AI - User Onboarding & Family Profile Setup (Route: /onboarding)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.js';
import { SUPPORTED_PERSONAS } from '../lib/constants.js';
import { PersonaType } from '../types/routine.js';
import { Users, MapPin, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, updatePreferences, setSelectedPersona } = useApp();

  const [cityInput, setCityInput] = useState(preferences.city);
  const [selectedPersonas, setSelectedPersonas] = useState<PersonaType[]>(
    preferences.householdPersonas as PersonaType[]
  );
  const [primaryPersona, setPrimaryPersona] = useState<PersonaType>('child');
  const [successSaved, setSuccessSaved] = useState(false);

  const togglePersona = (p: PersonaType) => {
    setSelectedPersonas(prev =>
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      city: cityInput.trim() || 'Bengaluru / Delhi NCR',
      householdPersonas: selectedPersonas
    });
    setSelectedPersona(primaryPersona);
    setSuccessSaved(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-forest-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-sage-600" />
          Family Profile & Air Protection Setup
        </h1>
        <p className="text-sm text-forest-600">
          Configure your household's vulnerable members and local metropolitan zone to receive personalized GenAI smog schedules.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-sage-200 p-6 sm:p-8 shadow-xs space-y-8">
        {/* Step 1: City & Location */}
        <section className="space-y-3">
          <label htmlFor="city-input" className="block text-sm font-bold text-forest-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-sage-600" />
            Metropolitan City / Region
          </label>
          <input
            id="city-input"
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="e.g. Bengaluru, Delhi NCR, Mumbai, Hyderabad"
            className="w-full max-w-md px-4 py-2.5 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm text-forest-900 bg-warm-bg"
            required
          />
          <p className="text-xs text-forest-500">
            No GPS permissions required; location selection respects your privacy and runs completely on configured urban stations.
          </p>
        </section>

        {/* Step 2: Select Household Personas */}
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-forest-900">Select Household Members to Protect</h2>
            <p className="text-xs text-forest-500">
              VAYUWISE AI models specific physiological inhalation risks for each category.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(SUPPORTED_PERSONAS).map(([key, profile]) => {
              const pType = key as PersonaType;
              const isSelected = selectedPersonas.includes(pType);

              return (
                <div
                  key={key}
                  onClick={() => togglePersona(pType)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-sage-50/80 border-sage-600 shadow-xs ring-1 ring-sage-400'
                      : 'bg-warm-bg border-sage-200 hover:border-sage-300'
                  }`}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      togglePersona(pType);
                    }
                  }}
                >
                  <div className="space-y-1 pr-2">
                    <span className="text-sm font-bold text-forest-900 block">{profile.label}</span>
                    <span className="text-xs text-forest-600 line-clamp-2">
                      {profile.keyVulnerabilities.join(' • ')}
                    </span>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-forest-700 bg-white px-2 py-0.5 rounded border border-forest-200">
                      Threshold: &lt; {profile.recommendedMaxExposureAQI} AQI
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-sage-600 border-sage-600 text-white' : 'border-forest-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 3: Primary Persona Focus */}
        <section className="space-y-2">
          <label htmlFor="primary-persona-select" className="block text-sm font-bold text-forest-900">
            Primary Persona for Daily Dashboard
          </label>
          <select
            id="primary-persona-select"
            value={primaryPersona}
            onChange={(e) => setPrimaryPersona(e.target.value as PersonaType)}
            className="w-full max-w-md px-4 py-2.5 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm text-forest-900 bg-warm-bg"
          >
            {selectedPersonas.map((p) => (
              <option key={p} value={p}>
                {SUPPORTED_PERSONAS[p]?.label}
              </option>
            ))}
          </select>
        </section>

        {/* Action Button */}
        <div className="pt-4 flex items-center justify-between border-t border-sage-200">
          <span className="text-xs text-forest-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-sage-600" />
            Settings saved locally in persistent browser storage.
          </span>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-sm font-semibold shadow-md transition-all focus:ring-2 focus:ring-sage-400"
          >
            {successSaved ? 'Profile Saved!' : 'Save & Open Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
