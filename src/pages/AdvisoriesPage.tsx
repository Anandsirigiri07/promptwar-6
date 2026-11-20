/**
 * VAYUWISE AI - GenAI Emergency Advisory Center (Route: /advisories)
 */

import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  PhoneCall,
  Languages,
  RotateCw,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { LOCALIZATION_DATA } from '../lib/localization.js';
import { SupportedLanguage } from '../types/index.js';
import { apiRequest } from '../services/apiService.js';

export const AdvisoriesPage: React.FC = () => {
  const { preferences, setLanguage, selectedZone } = useApp();
  const strings = LOCALIZATION_DATA[preferences.language] || LOCALIZATION_DATA.en;

  const [advisory, setAdvisory] = useState<{
    headline: string;
    severityLabel: string;
    meteorologicalContext: string;
    immediateActionSteps: string[];
    vulnerableGuidance: string[];
    officialNotice: string;
    generatedBy: string;
    isFallback: boolean;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const loadAdvisory = async () => {
    if (!selectedZone || selectedZone.aqiIsValid === false) {
      setAdvisory(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiRequest<any>('/api/emergency-advisory', {
        method: 'POST',
        body: JSON.stringify({
          city: preferences.city,
          aqi: selectedZone.overallAQI,
          dominantPollutant: selectedZone.dominantPollutant,
          inversionStrength: selectedZone.isInversionActive === true ? 'Moderate' : selectedZone.isInversionActive === false ? 'None' : 'Unknown',
          language: preferences.language
        })
      });
      setAdvisory(res);
    } catch (err) {
      console.warn('Advisory generation failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisory();
  }, [preferences.language, selectedZone?.overallAQI, selectedZone?.aqiIsValid]);

  return (
    <div className="space-y-8 py-2 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-red-50/80 border border-red-200 text-red-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">
              City Air-Quality Briefing
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-red-950">
              {advisory?.headline || 'Current air-quality advisory unavailable'}
            </h1>
            <p className="text-xs text-red-800 mt-1">
              {selectedZone?.aqiBasis === 'instantaneous_estimate' ? 'Indicative AQI' : selectedZone?.aqiBasis === 'scenario' ? 'Scenario AQI' : 'AQI'}: <strong className="font-mono">{selectedZone?.aqiIsValid === false ? 'Unavailable' : selectedZone?.overallAQI ?? 'Unavailable'}</strong> • Sector:{' '}
              {selectedZone?.name || 'Select a zone'}
            </p>
          </div>
        </div>

        {/* Language Quick Switcher */}
        <div className="bg-white/80 p-2.5 rounded-xl border border-red-200 shrink-0 text-xs space-y-1">
          <span className="font-bold text-forest-900 block flex items-center gap-1">
            <Languages className="w-3.5 h-3.5 text-sage-600" />
            Advisory Language:
          </span>
          <select
            value={preferences.language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-transparent font-medium text-forest-800 focus:outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="ar">العربية (Arabic - RTL)</option>
            <option value="es">Español (Spanish)</option>
          </select>
        </div>
      </div>

      {/* Official Government & Medical Disclaimers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Government Alert Distinction:</strong>
            {strings.emergency.officialDisclaimer}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
          <HeartHandshake className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Medical Safety Notice:</strong>
            {strings.emergency.medicalDisclaimer}
          </div>
        </div>
      </div>

      {/* Main Advisory Content */}
      {advisory && (
        <div className="space-y-6">
          {/* Action Steps Card */}
          <div className="bg-white rounded-2xl border border-sage-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-forest-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              {strings.emergency.actionStepsTitle}
            </h2>

            <ul className="space-y-2.5">
              {advisory.immediateActionSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-forest-800">
                  <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Vulnerable Households Guidance */}
          <div className="bg-white rounded-2xl border border-sage-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-forest-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-sage-600" />
              {strings.emergency.vulnerableGuidanceTitle}
            </h2>

            <ul className="space-y-2.5">
              {advisory.vulnerableGuidance.map((guidance, idx) => (
                <li key={idx} className="p-3 bg-warm-bg rounded-xl border border-sage-200 text-xs text-forest-800">
                  {guidance}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Emergency Hotlines Widget */}
      <div className="p-5 rounded-2xl bg-white border border-sage-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <strong className="text-xs font-bold text-forest-900 block flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-sage-600" />
            Official Emergency Contacts & Hotlines
          </strong>
          <span className="text-xs text-forest-600">
            National Health Helpline: <strong>1075</strong> • Ambulance Emergency: <strong>108 / 112</strong>
          </span>
        </div>

        <button
          onClick={loadAdvisory}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-800 text-white text-xs font-semibold hover:bg-forest-900"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Regenerate AI Briefing
        </button>
      </div>
    </div>
  );
};
