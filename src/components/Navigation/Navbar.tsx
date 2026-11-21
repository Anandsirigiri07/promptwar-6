/**
 * VAYUWISE AI - Top Navigation Bar
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Wind, Shield, Globe2, AlertTriangle, Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { SupportedLanguage } from '../../types/index.js';
import { ScenarioType } from '../../types/telemetry.js';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { preferences, setLanguage, currentScenario, setScenario, selectedZone, isDemoMode } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sage-200/80 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3 md:w-56 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-forest-700 hover:bg-sage-100 focus:outline-none focus:ring-2 focus:ring-sage-400"
            aria-label={isSidebarOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sage-600 to-forest-700 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-forest-900 group-hover:text-sage-700 transition-colors">
                VAYUWISE <span className="text-sage-600 font-medium">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] text-forest-600 font-medium tracking-wide">
                Breathe Smarter • Live Safer
              </span>
            </div>
          </Link>
        </div>

        {/* Live Scenario Simulator Quick Selector */}
        <div className="hidden lg:flex items-center gap-2 bg-sage-50 px-3 py-1.5 rounded-full border border-sage-200 text-xs">
          <span className="font-semibold text-forest-700 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Scenario:
          </span>
          <select
            value={currentScenario}
            onChange={(e) => setScenario(e.target.value as ScenarioType)}
            className="bg-transparent font-medium text-forest-800 focus:outline-none cursor-pointer"
            aria-label="Select Environmental Condition Scenario"
          >
            <option value="realtime">Normal Winter Urban AQI</option>
            <option value="winter_smog_spike">Winter Smog Spike (Severe)</option>
            <option value="inversion_trap">Thermal Inversion Trap</option>
            <option value="improved_dispersion">Active Wind Dispersion</option>
            <option value="calm_evening_fog">Calm Evening Fog</option>
          </select>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Active Sector Indicator */}
          {selectedZone && (
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-forest-800">
                {selectedZone.name.split('&')[0]}
              </span>
              <span className="text-[11px] text-forest-600">
                {selectedZone.aqiIsValid === false
                  ? 'AQI unavailable (insufficient pollutant coverage)'
                  : `${selectedZone.aqiBasis === 'instantaneous_estimate' ? 'Indicative AQI' : selectedZone.aqiBasis === 'scenario' ? 'Scenario AQI' : 'AQI'} ${selectedZone.overallAQI} (${selectedZone.category})`}
              </span>
            </div>
          )}

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-lavender-50 px-2.5 py-1.5 rounded-lg border border-lavender-200 text-xs font-medium text-forest-800">
            <Globe2 className="w-3.5 h-3.5 text-lavender-600" aria-hidden="true" />
            <select
              value={preferences.language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent focus:outline-none cursor-pointer font-medium"
              aria-label="Select Language"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ar">العربية (Arabic - RTL)</option>
              <option value="es">Español (Spanish)</option>
            </select>
          </div>

          {/* Authentication & Environment State Badge */}
          {isDemoMode ? (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300"
              title="Running in local evaluation mode without cloud credentials"
            >
              <Shield className="w-3 h-3 text-amber-600" />
              <span className="hidden sm:inline">Demo</span> Mode
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-300"
              title="Authenticated with Firebase Cloud Account"
            >
              <Shield className="w-3 h-3 text-emerald-600" />
              <span className="hidden sm:inline">Firebase</span> Authenticated
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
