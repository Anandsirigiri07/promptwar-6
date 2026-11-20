/**
 * VAYUWISE AI - Sustainable Commute & Dijkstra Exposure Optimizer (Route: /commute)
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Train,
  Bus,
  Car,
  Bike,
  Footprints,
  ShieldCheck,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { useExposureRouting } from '../hooks/useExposureRouting.js';
import { CommuteMode } from '../lib/compute/commuteDose.js';

export const CommutePage: React.FC = () => {
  const { selectedZone } = useApp();
  const {
    calculateCommute,
    comparisons,
    recommendedMode,
    exposureOptimizedRoute,
    tradeoffSummary
  } = useExposureRouting();

  const [origin, setOrigin] = useState('Indiranagar Residential Colony');
  const [destination, setDestination] = useState('Cyber Tech Park');
  const [distanceKm, setDistanceKm] = useState(12.5);
  const [hasN95, setHasN95] = useState(false);

  const ambientPM25 = selectedZone?.pollutants.pm25.concentration || 145;

  useEffect(() => {
    calculateCommute({
      origin,
      destination,
      distanceKm,
      ambientPM25,
      hasN95Mask: hasN95
    });
  }, [origin, destination, distanceKm, ambientPM25, hasN95, calculateCommute]);

  const getModeIcon = (mode: CommuteMode) => {
    switch (mode) {
      case 'metro':
        return <Train className="w-5 h-5 text-indigo-600" />;
      case 'electric_bus':
      case 'diesel_bus':
        return <Bus className="w-5 h-5 text-emerald-600" />;
      case 'ev_car':
      case 'petrol_car':
        return <Car className="w-5 h-5 text-blue-600" />;
      case 'cycling':
        return <Bike className="w-5 h-5 text-amber-600" />;
      case 'walking':
        return <Footprints className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-8 py-2 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2 pb-2 border-b border-sage-200">
        <div className="flex items-center gap-2">
          <Compass className="w-7 h-7 text-sage-600" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-900 tracking-tight">
            Low-Emission Commute & Dijkstra Exposure Optimizer
          </h1>
        </div>
        <p className="text-sm text-forest-600">
          Evaluates multi-modal travel routes using cumulative inhaled PM2.5 dose physics and carbon impact.
        </p>
      </div>

      {/* Route Parameters Form */}
      <div className="bg-white rounded-2xl border border-sage-200 p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-forest-800 mb-1">Starting Origin</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-forest-200 text-xs font-semibold text-forest-900 bg-warm-bg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-800 mb-1">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-forest-200 text-xs font-semibold text-forest-900 bg-warm-bg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-800 mb-1">Distance (km)</label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="150"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-forest-200 text-xs font-semibold text-forest-900 bg-warm-bg"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setHasN95(!hasN95)}
              className={`w-full p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                hasN95
                  ? 'bg-sage-600 text-white border-sage-600 shadow-xs'
                  : 'bg-warm-bg text-forest-700 border-forest-200 hover:bg-sage-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              N95 Respirator {hasN95 ? 'ON (90% Filter)' : 'OFF'}
            </button>
          </div>
        </div>

        {tradeoffSummary && (
          <div className="p-3.5 bg-sage-50/70 border border-sage-200 rounded-xl text-xs text-forest-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
            <span>
              <strong>Algorithmic Insight: </strong>
              {tradeoffSummary}
            </span>
          </div>
        )}
      </div>

      {/* Commute Mode Comparisons Table */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-forest-900 flex items-center gap-2">
          Transportation Mode Tradeoff Matrix
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisons.map((c) => {
            const isRecommended = c.mode === recommendedMode;

            return (
              <div
                key={c.mode}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all relative ${
                  isRecommended
                    ? 'border-sage-600 ring-2 ring-sage-400 bg-sage-50/20'
                    : 'border-sage-200 hover:border-sage-300'
                }`}
              >
                {isRecommended && (
                  <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-forest-800 text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    Recommended Mode
                  </span>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-warm-bg border border-sage-200 flex items-center justify-center">
                    {getModeIcon(c.mode)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-forest-900">{c.label}</h3>
                    <span className="text-xs text-forest-500 font-mono">
                      {c.durationMinutes} mins • {c.distanceKm} km
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-sage-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-forest-600">Inhaled PM2.5 Dose:</span>
                    <strong className="font-mono text-forest-900 font-bold">
                      {c.inhaledDose_ug} µg
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-forest-600">Carbon Footprint:</span>
                    <strong className="font-mono text-forest-900 font-bold">
                      {c.co2Emitted_grams} g CO₂
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-forest-600">Cabin/Mask Filtration:</span>
                    <span className="font-semibold text-sage-700">
                      {Math.round(c.effectiveProtectionFactor * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-forest-600">Relative Risk Score:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        c.relativeInhaledRiskScore > 5
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {c.relativeInhaledRiskScore} / 10
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-forest-600 bg-warm-bg p-2.5 rounded-lg border border-forest-100 line-clamp-2">
                  {c.recommendationReason}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dijkstra Route Steps Visualizer */}
      {exposureOptimizedRoute && (
        <section className="bg-white rounded-2xl border border-sage-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-forest-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-sage-600" />
              Dijkstra Lowest-Exposure Path Solution
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-sage-100 text-sage-800">
              Total Inhaled Dose: {exposureOptimizedRoute.estimatedPM25Dose_ug} µg
            </span>
          </div>

          <div className="space-y-3">
            {exposureOptimizedRoute.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-warm-bg rounded-xl border border-sage-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest-800 text-white font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-forest-900 block">
                      {step.fromNode.replace('node-', '').toUpperCase()} &rarr; {step.toNode.replace('node-', '').toUpperCase()}
                    </span>
                    <span className="text-forest-500 capitalize">
                      Via {step.mode.replace('_', ' ')} • {step.distanceKm} km
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-forest-900 block font-mono">
                    {step.stepDurationMinutes} mins
                  </span>
                  <span className="text-[10px] text-forest-500 font-mono">
                    Ambient AQI {step.ambientAQI}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
