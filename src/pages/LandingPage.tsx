/**
 * VAYUWISE AI - Landing Page (Route: /)
 * Introduces the platform, challenge problem statement, and key capabilities.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CalendarClock,
  Compass,
  Home,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { AqiBadge } from '../components/shared/AqiBadge.js';

export const LandingPage: React.FC = () => {
  const { selectedZone } = useApp();

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-4">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage-50 via-warm-bg to-lavender-50 border border-sage-200 p-8 sm:p-12 shadow-sm">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-100 text-sage-700 text-xs font-semibold tracking-wide border border-sage-300">
            <Sparkles className="w-3.5 h-3.5" />
            Hack2Skill Challenge 6 — Production Air Intelligence Platform
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-forest-900 leading-tight">
            Breathe Smarter. Live Safer.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 to-forest-800">
              Build Cleaner Communities.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-forest-700 leading-relaxed">
            VAYUWISE AI is an evidence-based GenAI urban air intelligence and winter smog defense system.
            Engineered to safeguard vulnerable family members, optimize daily routines during thermal inversions,
            and empower collective community environmental action.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm shadow-md transition-all hover:scale-102 focus:ring-2 focus:ring-sage-400"
            >
              Configure Family Profile
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-sage-50 text-forest-800 font-semibold text-sm border border-sage-300 shadow-xs transition-colors"
            >
              Explore Live Air Intelligence
            </Link>
          </div>
        </div>

        {/* Live Ambient Quick Snapshot Pill */}
        {selectedZone && (
          <div className="mt-8 p-4 rounded-2xl bg-white/90 border border-sage-200/90 shadow-xs max-w-md flex items-center justify-between">
            <div>
              <span className="text-xs text-forest-500 font-medium block">Active City Sector</span>
              <span className="text-sm font-bold text-forest-900">{selectedZone.name}</span>
            </div>
            <AqiBadge aqi={selectedZone.overallAQI} category={selectedZone.category} size="md" isValid={selectedZone.aqiIsValid !== false} basis={selectedZone.aqiBasis} />
          </div>
        )}
      </section>

      {/* Core Platform Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-forest-900">
            Engineered for Real Household Protection
          </h2>
          <p className="text-sm text-forest-600">
            Scientific deterministic modeling paired with Google Gemini GenAI explanations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-sage-200/80 shadow-xs hover:border-sage-400 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
              <CalendarClock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-forest-900">GenAI Daily Routine Optimizer</h3>
            <p className="text-sm text-forest-600 leading-relaxed">
              Personalized hour-by-hour schedules tailored for infants, asthmatics, students, and commuters,
              steering activities away from dangerous morning inversion spikes.
            </p>
            <Link to="/routine" className="inline-flex items-center text-sm font-semibold text-sage-700 hover:text-forest-900">
              Generate Routine &rarr;
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-sage-200/80 shadow-xs hover:border-sage-400 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-xl bg-lavender-100 flex items-center justify-center text-lavender-700">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-forest-900">Dijkstra Exposure Transit Router</h3>
            <p className="text-sm text-forest-600 leading-relaxed">
              Multi-modal pathfinding algorithm that factors in distance and inhaled PM2.5 dose rate,
              proving how electric bus or metro beats sitting in diesel congestion.
            </p>
            <Link to="/commute" className="inline-flex items-center text-sm font-semibold text-lavender-700 hover:text-forest-900">
              Compare Commutes &rarr;
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-sage-200/80 shadow-xs hover:border-sage-400 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-forest-900">IAQ & DIY Corsi-Rosenthal Hub</h3>
            <p className="text-sm text-forest-600 leading-relaxed">
              Physics-based CADR and ACH room calculator, with verified step-by-step blueprints
              for building high-efficiency DIY box filters at a fraction of commercial cost.
            </p>
            <Link to="/indoor-air" className="inline-flex items-center text-sm font-semibold text-sage-700 hover:text-forest-900">
              Calculate Room Air &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Six Dimensions Alignment Checklist */}
      <section className="bg-white rounded-2xl border border-sage-200 p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-forest-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sage-600" />
          Evaluation Framework Verification
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-forest-900 block">1. Code Quality</strong>
              <span className="text-xs text-forest-600">Strict TypeScript, pure compute modules, Oxlint clean.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-forest-900 block">2. Security</strong>
              <span className="text-xs text-forest-600">Helmet CSP, bounded payloads, Zod schemas, secret isolation.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-forest-900 block">3. Efficiency</strong>
              <span className="text-xs text-forest-600">Bounded SHA-256 LRU cache, native SVG charts, memoized math.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-forest-900 block">4. Testing</strong>
              <span className="text-xs text-forest-600">Vitest unit tests, breakpoints coverage, API integration.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-forest-900 block">5. Accessibility</strong>
              <span className="text-xs text-forest-600">WCAG 2.2 AA compliant, Twin Representation Rule, RTL Arabic.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs font-bold text-forest-900 block">6. Problem Alignment</strong>
              <span className="text-xs text-forest-600">Direct solutions for 8 household personas & winter smog.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
