/**
 * VAYUWISE AI - Accessible AQI Category Badge
 * Adheres to WCAG 2.2 AA Twin Representation Rule:
 * Never uses color alone to convey hazard; pairs color with explicit text, numeric value, and semantic badge.
 */

import React from 'react';
import { AQICategory, getAQIColorHex } from '../../lib/compute/aqiBreakpoints.js';

interface AqiBadgeProps {
  aqi: number;
  category: AQICategory;
  size?: 'sm' | 'md' | 'lg';
  showCategoryText?: boolean;
  isValid?: boolean;
  basis?: 'instantaneous_estimate' | 'scenario';
}

export const AqiBadge: React.FC<AqiBadgeProps> = ({
  aqi,
  category,
  size = 'md',
  showCategoryText = true,
  isValid = true,
  basis
}) => {
  const colorHex = isValid ? getAQIColorHex(aqi, 'CPCB') : '#64748B';
  const indexLabel = basis === 'instantaneous_estimate' ? 'Indicative AQI' : basis === 'scenario' ? 'Scenario AQI' : 'AQI';
  const accessibleIndexLabel = basis === 'instantaneous_estimate' ? 'Indicative AQI' : basis === 'scenario' ? 'Scenario AQI' : 'Air Quality Index';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5 font-bold'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium shadow-xs border ${sizeClasses}`}
      style={{
        backgroundColor: `${colorHex}15`,
        borderColor: `${colorHex}40`,
        color: colorHex
      }}
      role="status"
      aria-label={isValid ? `${accessibleIndexLabel}: ${aqi}, Category: ${category}` : 'Air Quality Index unavailable because pollutant coverage is incomplete'}
    >
      <span
        className="w-2 h-2 rounded-full inline-block shrink-0"
        style={{ backgroundColor: colorHex }}
        aria-hidden="true"
      />
      <span className="font-semibold">{isValid ? `${aqi} ${indexLabel}` : 'AQI unavailable'}</span>
      {showCategoryText && (
        <span className="text-forest-700 font-normal border-l border-forest-200 pl-1.5">
          {isValid ? category : 'Insufficient data'}
        </span>
      )}
    </span>
  );
};
