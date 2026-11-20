/**
 * VAYUWISE AI - Native SVG Urban Zone Air Quality Map
 * Interactive 5-zone sector visualization with accessibility table companion.
 */

import React from 'react';
import { UrbanZoneTelemetry } from '../../types/telemetry.js';
import { getAQIColorHex } from '../../lib/compute/aqiBreakpoints.js';

interface UrbanMapSvgProps {
  zones: UrbanZoneTelemetry[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
}

export const UrbanMapSvg: React.FC<UrbanMapSvgProps> = ({
  zones,
  selectedZoneId,
  onSelectZone
}) => {
  // SVG coordinates for 5 urban nodes
  const nodePositions: Record<string, { cx: number; cy: number; label: string }> = {
    'zone-1': { cx: 200, cy: 150, label: 'Tech Corridor' },
    'zone-2': { cx: 320, cy: 90, label: 'Industrial Hub' },
    'zone-3': { cx: 120, cy: 220, label: 'Residential Core' },
    'zone-4': { cx: 90, cy: 100, label: 'Green Ridge' },
    'zone-5': { cx: 260, cy: 240, label: 'Traffic Junction' }
  };

  return (
    <div className="w-full bg-sage-50/50 rounded-2xl p-4 border border-sage-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-forest-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sage-600 animate-pulse" />
          Metropolitan Micro-Airshed Sectors
        </h3>
        <span className="text-xs text-forest-600 bg-white px-2 py-0.5 rounded-md border border-forest-200">
          Click any zone to inspect
        </span>
      </div>

      <svg
        viewBox="0 0 400 300"
        className="w-full h-auto max-h-[320px] select-none"
        role="img"
        aria-label="Urban monitoring sectors map showing AQI levels across 5 city zones"
      >
        {/* Background contour rings representing urban thermal airsheds */}
        <circle cx="200" cy="160" r="130" fill="#E8F3EE" fillOpacity="0.4" stroke="#C4DFD1" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="200" cy="160" r="85" fill="#EFEAF8" fillOpacity="0.3" stroke="#DDD5F1" strokeWidth="1" />

        {/* Arterial transport vectors */}
        <line x1="90" y1="100" x2="200" y2="150" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="200" y1="150" x2="320" y2="90" stroke="#CBD5E1" strokeWidth="2" />
        <line x1="120" y1="220" x2="200" y2="150" stroke="#CBD5E1" strokeWidth="2" />
        <line x1="200" y1="150" x2="260" y2="240" stroke="#CBD5E1" strokeWidth="2" />
        <line x1="120" y1="220" x2="260" y2="240" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />

        {/* Zone Nodes */}
        {zones.map((zone) => {
          const pos = nodePositions[zone.zoneId] || { cx: 200, cy: 150, label: zone.name };
          const isSelected = zone.zoneId === selectedZoneId;
          const aqiColor = zone.aqiIsValid === false ? '#64748B' : getAQIColorHex(zone.overallAQI, 'CPCB');

          return (
            <g
              key={zone.zoneId}
              onClick={() => onSelectZone(zone.zoneId)}
              className="cursor-pointer transition-transform duration-200 hover:scale-105"
              tabIndex={0}
              role="button"
              aria-label={zone.aqiIsValid === false
                ? `Sector: ${zone.name}, AQI unavailable because monitored pollutant coverage is incomplete. Click to select.`
                : `Sector: ${zone.name}, ${zone.aqiBasis === 'instantaneous_estimate' ? 'Indicative AQI' : zone.aqiBasis === 'scenario' ? 'Scenario AQI' : 'AQI'}: ${zone.overallAQI}, Category: ${zone.category}. Click to select.`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectZone(zone.zoneId);
                }
              }}
            >
              {/* Outer halo for selected node */}
              {isSelected && (
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r="34"
                  fill="none"
                  stroke="#336148"
                  strokeWidth="3"
                  strokeDasharray="4 2"
                  className="animate-spin"
                  style={{ transformOrigin: `${pos.cx}px ${pos.cy}px` }}
                />
              )}
              {/* Node body */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r="24"
                fill={aqiColor}
                stroke="#FFFFFF"
                strokeWidth="3"
                className="shadow-md"
              />
              {/* AQI text inside circle */}
              <text
                x={pos.cx}
                y={pos.cy + 5}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {zone.aqiIsValid === false ? '—' : zone.overallAQI}
              </text>
              {/* Label below node */}
              <rect
                x={pos.cx - 50}
                y={pos.cy + 28}
                width="100"
                height="18"
                rx="4"
                fill="#FFFFFF"
                fillOpacity="0.9"
                stroke="#E2E8F0"
              />
              <text
                x={pos.cx}
                y={pos.cy + 41}
                textAnchor="middle"
                fill="#1C2721"
                fontSize="10"
                fontWeight="600"
                className="pointer-events-none"
              >
                {pos.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Accessible screen reader summary table */}
      <table className="sr-only">
        <caption>Air quality summary across urban monitoring sectors</caption>
        <thead>
          <tr>
            <th scope="col">Sector</th>
            <th scope="col">AQI</th>
            <th scope="col">Category</th>
            <th scope="col">PM2.5 (µg/m³)</th>
            <th scope="col">Dominant Pollutant</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((z) => (
            <tr key={z.zoneId}>
              <td>{z.name}</td>
              <td>{z.aqiIsValid === false ? 'Unavailable' : z.overallAQI}</td>
              <td>{z.category}</td>
              <td>{z.pollutants.pm25.concentration ?? 'Unavailable'}</td>
              <td>{z.dominantPollutant.toUpperCase()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
