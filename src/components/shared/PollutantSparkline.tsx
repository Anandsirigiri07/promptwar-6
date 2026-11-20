/**
 * VAYUWISE AI - Native SVG 7-Hour Pollutant Sparkline
 * Pure SVG with screen-reader text fallback fulfilling WCAG 2.2 Twin Representation.
 */

import React from 'react';

interface PollutantSparklineProps {
  data: number[];
  unit: string;
  pollutantName: string;
  width?: number;
  height?: number;
  strokeColor?: string;
}

export const PollutantSparkline: React.FC<PollutantSparklineProps> = ({
  data,
  unit,
  pollutantName,
  width = 160,
  height = 42,
  strokeColor = '#427A5B' // Sage 600
}) => {
  if (!data || data.length === 0) {
    return <span className="text-xs text-forest-400">No trend data</span>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 4;

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const currentVal = data[data.length - 1]!;
  const firstVal = data[0]!;
  const trendDescription = currentVal > firstVal 
    ? `rising from ${firstVal} to ${currentVal} ${unit}`
    : currentVal < firstVal 
    ? `declining from ${firstVal} to ${currentVal} ${unit}`
    : `steady at ${currentVal} ${unit}`;

  return (
    <div className="flex flex-col items-start gap-1">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        {/* Baseline grid */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#E2E8F0"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        {/* Trend Polyline */}
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Current Endpoint Dot */}
        {data.length > 0 && (
          <circle
            cx={(width - padding).toFixed(1)}
            cy={(height - padding - ((currentVal - min) / range) * (height - 2 * padding)).toFixed(1)}
            r="3.5"
            fill={strokeColor}
          />
        )}
      </svg>
      {/* Screen reader text alternative */}
      <span className="sr-only">
        {pollutantName} 7-hour trend is {trendDescription}. Current concentration: {currentVal} {unit}.
      </span>
    </div>
  );
};
