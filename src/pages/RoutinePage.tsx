/**
 * VAYUWISE AI - GenAI Daily Routine & Exposure Optimizer (Route: /routine)
 */

import React, { useState } from 'react';
import {
  CalendarClock,
  Sparkles,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { SUPPORTED_PERSONAS } from '../lib/constants.js';
import { PersonaType, DailyPersonalizedRoutine } from '../types/routine.js';
import { apiRequest } from '../services/apiService.js';

export const RoutinePage: React.FC = () => {
  const { preferences, selectedZone, selectedPersona, setSelectedPersona } = useApp();

  const [wakeTime, setWakeTime] = useState('06:30');
  const [sleepTime, setSleepTime] = useState('22:00');
  const [isGenerating, setIsGenerating] = useState(false);
  const [routine, setRoutine] = useState<DailyPersonalizedRoutine | null>(null);
  const [, setError] = useState<string | null>(null);

  // Exposure Explainer Modal/State
  const [customActivity, setCustomActivity] = useState('');
  const [customDuration, setCustomDuration] = useState(45);
  const [customLocation] = useState<'indoor' | 'outdoor' | 'transit'>('outdoor');
  const [customMasked] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [explanationResult, setExplanationResult] = useState<{
    estimatedInhaledDose_ug: number | null;
    effectivePM25Concentration_ugm3?: number | null;
    isAvailable?: boolean;
    explanation: string;
    methodology: string;
  } | null>(null);

  const handleGenerateRoutine = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setError(null);

    const aqi = selectedZone ? selectedZone.overallAQI : 165;
    const dominant = selectedZone ? selectedZone.dominantPollutant : 'pm25';

    try {
      const data = await apiRequest<DailyPersonalizedRoutine>('/api/routine-insights', {
        method: 'POST',
        body: JSON.stringify({
          persona: selectedPersona,
          city: preferences.city,
          zoneId: selectedZone?.zoneId || 'zone-1',
          currentAQI: aqi,
          ambientPM25: selectedZone?.pollutants?.pm25?.concentration,
          dominantPollutant: dominant,
          wakeTime,
          sleepTime,
          language: preferences.language
        })
      });
      setRoutine(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate personalized routine');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExplainExposure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customActivity.trim()) return;
    setExplaining(true);
    try {
      const res = await apiRequest<{
        estimatedInhaledDose_ug: number | null;
        effectivePM25Concentration_ugm3?: number | null;
        isAvailable?: boolean;
        explanation: string;
        methodology: string;
      }>('/api/exposure/explain', {
        method: 'POST',
        body: JSON.stringify({
          activity: customActivity,
          durationMinutes: customDuration,
          locationType: customLocation,
          currentAQI: selectedZone?.overallAQI || 160,
          ambientPM25: selectedZone?.pollutants?.pm25?.concentration,
          pm25SubIndex: selectedZone?.pollutants?.pm25?.subIndex,
          standard: preferences.aqiStandard,
          isMasked: customMasked,
          language: preferences.language
        })
      });
      setExplanationResult(res);
    } catch (err: unknown) {
      console.warn('Explain failed', err);
    } finally {
      setExplaining(false);
    }
  };

  const personaProfile = SUPPORTED_PERSONAS[selectedPersona] || SUPPORTED_PERSONAS.child;

  return (
    <div className="space-y-8 py-2 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2 pb-2 border-b border-sage-200">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-7 h-7 text-sage-600" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-900 tracking-tight">
            GenAI Daily Routine & Inhaled Dose Optimizer
          </h1>
        </div>
        <p className="text-sm text-forest-600">
          Synthesizes morning thermal inversion soundings, peak diesel traffic curves, and physiological
          minute-ventilation rates to structure a safer daily schedule.
        </p>
      </div>

      {/* Persona Selector Tabs */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-forest-800 uppercase tracking-wider block">
          Select Protection Persona:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Object.entries(SUPPORTED_PERSONAS).map(([key, profile]) => {
            const pType = key as PersonaType;
            const isSelected = selectedPersona === pType;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedPersona(pType)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-sage-600 text-white border-sage-600 shadow-xs'
                    : 'bg-white text-forest-800 border-sage-200 hover:bg-sage-50'
                }`}
              >
                <span className="text-xs font-bold block">{profile.label}</span>
                <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-sage-100' : 'text-forest-500'}`}>
                  Vulnerability: {profile.vulnerabilityLevel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generation Parameters Card */}
      <form
        onSubmit={handleGenerateRoutine}
        className="bg-white rounded-2xl border border-sage-200 p-6 shadow-xs space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-forest-800 mb-1">
              Active Zone & AQI Baseline
            </label>
            <div className="p-2.5 bg-warm-bg rounded-xl border border-forest-200 text-xs font-semibold text-forest-900">
              {selectedZone ? `${selectedZone.name} (AQI ${selectedZone.overallAQI})` : 'Urban Default (AQI 165)'}
            </div>
          </div>

          <div>
            <label htmlFor="wake-time" className="block text-xs font-bold text-forest-800 mb-1">
              Wake Up Time
            </label>
            <input
              id="wake-time"
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full p-2 rounded-xl border border-forest-200 text-xs font-semibold text-forest-900 bg-warm-bg"
            />
          </div>

          <div>
            <label htmlFor="sleep-time" className="block text-xs font-bold text-forest-800 mb-1">
              Sleep Time
            </label>
            <input
              id="sleep-time"
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="w-full p-2 rounded-xl border border-forest-200 text-xs font-semibold text-forest-900 bg-warm-bg"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-sage-100">
          <span className="text-xs text-forest-500">
            Engineered with strict Gemini structured JSON schemas + deterministic fallback.
          </span>

          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm shadow-md transition-all focus:ring-2 focus:ring-sage-400 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Synthesizing Inversion Model...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate AI Routine for {personaProfile.label.split(' ')[0]}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Routine Display Schedule */}
      {routine && (
        <section className="space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-sage-50 to-lavender-50 border border-sage-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white font-bold text-forest-800 border border-sage-300">
                  {routine.generatedBy}
                </span>
                <span className="text-xs text-forest-600">
                  Target: {routine.targetDate} • Baseline AQI: {routine.baselineAQI}
                </span>
              </div>
              <p className="text-sm font-semibold text-forest-900 mt-2">
                {routine.overallHealthRiskSummary}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-sage-200 shrink-0 text-center max-w-[210px]">
              <span className="text-[11px] text-forest-500 font-medium block">Avoided PM2.5 Intake</span>
              {typeof routine.estimatedTotalDoseReductionUg === 'number' && routine.estimatedTotalDoseReductionUg > 0 ? (
                <span className="text-xl font-black text-sage-700">
                  ~{routine.estimatedTotalDoseReductionUg} µg
                </span>
              ) : (
                <div className="mt-1">
                  <span className="text-xs font-bold text-amber-800 block">Dose Unavailable</span>
                  <span className="text-[10px] text-forest-600 block leading-tight mt-0.5">
                    {routine.doseReductionExplanation || 'Requires verified PM2.5 concentration'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-forest-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sage-600" />
              Hour-by-Hour Exposure Schedule
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {routine.schedule.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-sage-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-warm-bg text-forest-900 font-mono text-xs font-bold border border-forest-200">
                        {item.timeWindow}
                      </span>
                      <h3 className="text-base font-bold text-forest-900">{item.activityName}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                          item.exposureRiskLevel === 'Severe'
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : item.exposureRiskLevel === 'High'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-sage-50 text-sage-700 border-sage-300'
                        }`}
                      >
                        Risk: {item.exposureRiskLevel}
                      </span>
                      <span className="text-xs text-forest-600 font-medium capitalize">
                        {item.locationType}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-forest-700 leading-relaxed">
                    <strong>Scientific Rationale: </strong> {item.scientificReasoning}
                  </p>

                  <div className="p-3 bg-sage-50/50 rounded-xl border border-sage-200/60 text-xs space-y-1">
                    <div className="text-forest-900 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                      Recommended Protocol: {item.actionableStep}
                    </div>
                    <div className="text-forest-600 pl-5">
                      Safer Alternative: {item.saferAlternative}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Inhaled Dose Exposure Calculator Widget */}
      <section className="bg-white rounded-2xl border border-sage-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-forest-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sage-600" />
          On-Demand Activity Exposure Calculator
        </h2>
        <p className="text-xs text-forest-600">
          Compute your exact lung particle intake for any planned outdoor exercise, dog walk, or school commute.
        </p>

        <form onSubmit={handleExplainExposure} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-forest-800 mb-1">Activity Name</label>
            <input
              type="text"
              value={customActivity}
              onChange={(e) => setCustomActivity(e.target.value)}
              placeholder="e.g. Morning 5km jog, school playground sports"
              className="w-full p-2 rounded-xl border border-forest-200 text-xs text-forest-900 bg-warm-bg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-800 mb-1">Duration (Mins)</label>
            <input
              type="number"
              min="5"
              max="360"
              value={customDuration}
              onChange={(e) => setCustomDuration(Number(e.target.value))}
              className="w-full p-2 rounded-xl border border-forest-200 text-xs text-forest-900 bg-warm-bg"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={explaining}
              className="w-full p-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs transition-colors"
            >
              {explaining ? 'Calculating...' : 'Calculate Inhaled Dose'}
            </button>
          </div>
        </form>

        {explanationResult && (
          <div className="p-4 rounded-xl bg-sage-50 border border-sage-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-forest-900 font-bold">Estimated Particle Intake:</strong>
              {typeof explanationResult.estimatedInhaledDose_ug === 'number' ? (
                <span className="font-mono font-bold text-sage-700 text-sm">
                  {explanationResult.estimatedInhaledDose_ug} µg PM2.5
                </span>
              ) : (
                <span className="font-bold text-amber-800 text-xs">
                  Unavailable (PM2.5 mass required)
                </span>
              )}
            </div>
            <p className="text-forest-700 leading-relaxed">{explanationResult.explanation}</p>
            <span className="text-[10px] text-forest-500 block font-mono">
              Formula: {explanationResult.methodology}
            </span>
          </div>
        )}
      </section>
    </div>
  );
};
