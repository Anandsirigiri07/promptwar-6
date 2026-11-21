/**
 * VAYUWISE AI - Route-Level Error Boundary Component
 * Gracefully isolates component render failures, prevents total application crashes,
 * and presents accessible recovery actions.
 */

import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertOctagon, RotateCw, LayoutDashboard, Home } from 'lucide-react';

interface RouteErrorBoundaryProps {
  error?: Error;
  onReset?: () => void;
}

export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ error: propError, onReset }) => {
  let routerError: unknown = null;
  try {
    routerError = useRouteError();
  } catch {
    routerError = null;
  }
  const effectiveError = propError || routerError;

  let title = 'Air Intelligence Module Temporarily Interrupted';
  let message = 'An unexpected error occurred while rendering this module. Your other session preferences remain safe.';

  if (isRouteErrorResponse(effectiveError)) {
    if (effectiveError.status === 404) {
      title = 'Module Route Not Found (404)';
      message = 'The requested air intelligence module route does not exist. Please use the navigation sidebar.';
    } else {
      title = `Application Error (${effectiveError.status})`;
      message = effectiveError.statusText || message;
    }
  } else if (effectiveError instanceof Error) {
    message = effectiveError.message;
  }

  const handleReload = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-[50vh] flex flex-col items-center justify-center p-6 max-w-xl mx-auto space-y-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-300 text-amber-700 flex items-center justify-center shadow-xs">
        <AlertOctagon className="w-8 h-8" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-forest-900 tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-forest-600 leading-relaxed">
          {message}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleReload}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs shadow-xs transition-colors focus:ring-2 focus:ring-sage-400"
        >
          <RotateCw className="w-4 h-4" />
          <span>Reload Module</span>
        </button>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-sage-50 text-forest-800 border border-sage-300 font-semibold text-xs shadow-xs transition-colors focus:ring-2 focus:ring-sage-400"
        >
          <LayoutDashboard className="w-4 h-4 text-sage-600" />
          <span>Return to Dashboard</span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warm-bg hover:bg-sage-100 text-forest-700 border border-forest-200 font-semibold text-xs shadow-xs transition-colors focus:ring-2 focus:ring-sage-400"
        >
          <Home className="w-4 h-4 text-forest-500" />
          <span>Overview</span>
        </Link>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
