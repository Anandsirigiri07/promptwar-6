/**
 * VAYUWISE AI - Air Quality Intelligence Dashboard (Route: /dashboard)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  RotateCw,
  CalendarClock,
  Layers
} from 'lucide-react';
import { useAirQuality } from '../hooks/useAirQuality.js';
import { AqiBadge } from '../components/shared/AqiBadge.js';
import { PollutantSparkline } from '../components/shared/PollutantSparkline.js';
import { UrbanMapSvg } from '../components/shared/UrbanMapSvg.js';
import { ScenarioType } from '../types/telemetry.js';
import { PollutantType } from '../lib/compute/aqiBreakpoints.js';

export const DashboardPage: React.FC = () => {
  const { zone, zones, scenario, selectZone, applyScenario, refresh, isLoading } = useAirQuality();

  if (!zone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <RotateCw className="w-8 h-8 text-sage-600 animate-spin" />
        <p className="text-sm text-forest-700">Connecting to metropolitan sensor network...</p>
      </div>
    );
  }

  const pollutants: PollutantType[] = ['pm25', 'pm10', 'no2', 'co', 'o3', 'so2'];

  return (
    <div className="space-y-8 py-2 max-w-7xl mx-auto">
      {/* Top Header & Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-sage-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-900 tracking-tight">
              Hyperlocal Air Quality Intelligence
            </h1>
            {zone.aqiIsValid === false ? (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-semibold">
                Incomplete AQI Coverage
              </span>
            ) : zone.dataOrigin === 'live_station' ? (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                Ground Station
              </span>
            ) : zone.isDemoData || zone.dataOrigin === 'demo' ? (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                Demo Simulation
              </span>
            ) : zone.dataOrigin === 'cached' ? (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300 font-semibold">
                Cached Telemetry
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                Live Model Observation
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-forest-600 mt-1">
            Sector: <strong className="text-forest-900">{zone.name}</strong> • City: {zone.city} • Source: {zone.dataProvider} • Time: {new Date(zone.measuredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refresh()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-sage-300 text-xs font-semibold text-forest-700 hover:bg-sage-50 focus:outline-none focus:ring-2 focus:ring-sage-400"
            aria-label="Refresh live sensor readings"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <Link
            to="/routine"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold shadow-xs"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Build AI Daily Routine
          </Link>
        </div>
      </div>

      {/* Atmospheric Inversion Status Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          zone.isInversionActive === true
            ? 'bg-amber-50/70 border-amber-300 text-amber-950'
            : zone.isInversionActive === false
            ? 'bg-sage-50/60 border-sage-300 text-forest-900'
            : 'bg-warm-bg border-sage-200 text-forest-800'
        }`}
        role="region"
        aria-label="Atmospheric dispersion and thermal inversion condition"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              zone.isInversionActive === true
                ? 'bg-amber-200 text-amber-800'
                : zone.isInversionActive === false
                ? 'bg-sage-200 text-sage-800'
                : 'bg-forest-100 text-forest-600'
            }`}
          >
            {zone.isInversionActive === true ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Wind className="w-5 h-5" />
            )}
          </div>
          <div>
            <strong className="text-sm font-bold block">
              {zone.isInversionActive === true
                ? 'Thermal Inversion Active: Pollutant Dispersion Restricted'
                : zone.isInversionActive === false
                ? 'Normal Atmospheric Dispersion Rate'
                : 'Thermal Inversion State: Sounding Telemetry Unavailable'}
            </strong>
            <p className="text-xs text-forest-700 mt-0.5">
              {zone.isInversionActive === true
                ? 'Cold surface air is trapped beneath a warm aloft layer, causing fine particulate matter (PM2.5) to accumulate rapidly at ground level. Outdoor exertion discouraged.'
                : zone.isInversionActive === false
                ? 'Moderate convective mixing allows vertical dilution of vehicle emissions into the planetary boundary layer.'
                : 'Planetary boundary layer soundings are not reported for this sector. Observe general winter smog guidelines.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
          <span className="flex items-center gap-1">
            <Thermometer className="w-4 h-4 text-forest-500" />
            {zone.temperatureC !== null && zone.temperatureC !== undefined ? `${zone.temperatureC}°C` : 'N/A'}
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="w-4 h-4 text-forest-500" />
            {zone.humidityPercent !== null && zone.humidityPercent !== undefined ? `${zone.humidityPercent}% RH` : 'N/A'}
          </span>
          <span className="flex items-center gap-1">
            <Wind className="w-4 h-4 text-forest-500" />
            {zone.windSpeedKmh !== null && zone.windSpeedKmh !== undefined ? `${zone.windSpeedKmh} km/h` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Main Grid: Sector Map & Zone Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Sector SVG Map (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-sage-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-forest-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sage-600" />
              Urban Monitoring Network & Airshed Map
            </h2>
            <span className="text-xs text-forest-500">5 Continuous Stations</span>
          </div>

          <UrbanMapSvg
            zones={zones}
            selectedZoneId={zone.zoneId}
            onSelectZone={(id) => selectZone(id)}
          />

          {/* Scenario Simulator Buttons */}
          <div className="pt-2 border-t border-sage-100">
            <span className="text-xs font-bold text-forest-800 block mb-2">
              Simulate Meteorological Scenarios:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'realtime', label: 'Normal Baseline' },
                { id: 'winter_smog_spike', label: 'Winter Smog Spike' },
                { id: 'inversion_trap', label: 'Inversion Trap' },
                { id: 'improved_dispersion', label: 'Wind Dispersion' },
                { id: 'calm_evening_fog', label: 'Calm Fog' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => applyScenario(s.id as ScenarioType)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    scenario === s.id
                      ? 'bg-forest-800 text-white border-forest-800'
                      : 'bg-warm-bg text-forest-700 border-forest-200 hover:bg-sage-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected Sector Hero Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-sage-200 p-6 shadow-xs space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-forest-500 uppercase tracking-wider block">
                Selected Sector
              </span>
              <h2 className="text-lg font-bold text-forest-900">{zone.name}</h2>
            </div>
            <AqiBadge aqi={zone.overallAQI} category={zone.category} size="lg" isValid={zone.aqiIsValid !== false} basis={zone.aqiBasis} />
          </div>

          <div className="p-4 rounded-xl bg-sage-50/70 border border-sage-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-forest-600 font-medium">Dominant Risk Driver:</span>
              <strong className="text-forest-900 font-bold uppercase">
                {zone.pollutants[zone.dominantPollutant]?.name || zone.dominantPollutant}
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-forest-600 font-medium">Concentration:</span>
              <strong className="text-forest-900 font-bold">
                {zone.pollutants[zone.dominantPollutant]?.concentration ?? 'Unavailable'}{' '}
                {zone.pollutants[zone.dominantPollutant]?.concentration !== null ? zone.pollutants[zone.dominantPollutant]?.unit : ''}
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-forest-600 font-medium">Sub-Index:</span>
              <strong className="text-forest-900 font-bold">
                {zone.pollutants[zone.dominantPollutant]?.subIndex ?? 'Unavailable'}
              </strong>
            </div>
          </div>

          {/* PM2.5 7-Hour Historical Trend Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-forest-800">Fine PM2.5 Hourly Trend</span>
              <span className="text-forest-500 font-mono text-[11px]">Last 7 Hours</span>
            </div>
            <div className="p-3 bg-warm-bg rounded-xl border border-sage-200 flex items-center justify-center">
              <PollutantSparkline
                data={zone.pollutants.pm25.hourlyTrend}
                unit="µg/m³"
                pollutantName="PM2.5"
                width={260}
                height={55}
                strokeColor="#C23330"
              />
            </div>
          </div>

          <div className="text-[11px] text-forest-500 border-t border-sage-100 pt-3 flex items-center justify-between">
            <span>Provider: {zone.dataProvider}</span>
            <span className="font-mono">{new Date(zone.measuredAt).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Pollutant Detail Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-forest-900">
            Individual Pollutant Sub-Indices & Trends
          </h2>
          <span className="text-xs text-forest-500">
            Documented CPCB piecewise interpolation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pollutants.map((code) => {
            const p = zone.pollutants[code];
            if (!p) return null;

            return (
              <div
                key={code}
                className="bg-white rounded-2xl border border-sage-200 p-4 shadow-xs hover:border-sage-300 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-forest-500 uppercase tracking-wider block">
                      {p.code.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-forest-900">{p.name}</h3>
                  </div>
                  {p.subIndex !== null ? (
                    <AqiBadge aqi={p.subIndex} category={p.category} size="sm" showCategoryText={false} />
                  ) : (
                    <span className="text-xs text-slate-500">Sub-index unavailable</span>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-forest-900 font-mono">
                    {p.concentration ?? 'Unavailable'}
                  </span>
                  <span className="text-xs font-semibold text-forest-600">{p.unit}</span>
                </div>

                <p className="text-xs text-forest-600 line-clamp-2">
                  {p.healthImplications}
                </p>

                <div className="pt-2 border-t border-sage-100 flex items-center justify-between">
                  <span className="text-[11px] text-forest-500">7-Hour Sparkline</span>
                  <PollutantSparkline
                    data={p.hourlyTrend}
                    unit={p.unit}
                    pollutantName={p.name}
                    width={110}
                    height={30}
                    strokeColor="#427A5B"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
