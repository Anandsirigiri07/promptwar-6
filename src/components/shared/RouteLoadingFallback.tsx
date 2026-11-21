/**
 * VAYUWISE AI - Route-Level Accessible Loading Fallback
 * Provides visual skeleton matching the sage/forest brand tokens and announces
 * route transition status to assistive technologies.
 */

import React from 'react';
import { Wind, RotateCw } from 'lucide-react';

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-6 max-w-4xl mx-auto"
    >
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sage-100 to-sage-200 flex items-center justify-center text-sage-700 shadow-xs animate-pulse">
          <Wind className="w-8 h-8" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-sage-400/40 border-t-sage-600 animate-spin" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-base font-bold text-forest-900 tracking-tight flex items-center justify-center gap-2">
          <span>Loading Air Intelligence Module</span>
          <RotateCw className="w-4 h-4 text-sage-600 animate-spin" />
        </h2>
        <p className="text-xs text-forest-600 max-w-sm">
          Preparing scientific calculations, atmospheric models, and family protection guidance...
        </p>
      </div>

      {/* Accessible Skeleton Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 pt-4" aria-hidden="true">
        <div className="h-28 rounded-2xl bg-white/70 border border-sage-200/60 p-4 space-y-3 animate-pulse">
          <div className="h-4 w-1/2 bg-sage-100 rounded-md" />
          <div className="h-8 w-3/4 bg-sage-50 rounded-md" />
        </div>
        <div className="h-28 rounded-2xl bg-white/70 border border-sage-200/60 p-4 space-y-3 animate-pulse">
          <div className="h-4 w-2/3 bg-sage-100 rounded-md" />
          <div className="h-8 w-1/2 bg-sage-50 rounded-md" />
        </div>
        <div className="h-28 rounded-2xl bg-white/70 border border-sage-200/60 p-4 space-y-3 animate-pulse">
          <div className="h-4 w-1/3 bg-sage-100 rounded-md" />
          <div className="h-8 w-2/3 bg-sage-50 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default RouteLoadingFallback;
