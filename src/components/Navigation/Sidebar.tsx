/**
 * VAYUWISE AI - Responsive Sidebar Navigation
 * Provides true multi-page navigation across all 9 application routes.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarClock,
  Compass,
  Home,
  Users2,
  AlertOctagon,
  UserCheck,
  Settings,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { LOCALIZATION_DATA } from '../../lib/localization.js';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { preferences, selectedZone } = useApp();
  const strings = LOCALIZATION_DATA[preferences.language] || LOCALIZATION_DATA.en;

  const navItems = [
    { to: '/', label: 'Overview', icon: Sparkles, exact: true },
    { to: '/onboarding', label: strings.nav.onboarding, icon: UserCheck },
    { to: '/dashboard', label: strings.nav.dashboard, icon: LayoutDashboard },
    { to: '/routine', label: strings.nav.routine, icon: CalendarClock },
    { to: '/commute', label: strings.nav.commute, icon: Compass },
    { to: '/indoor-air', label: strings.nav.indoorAir, icon: Home },
    { to: '/community', label: strings.nav.community, icon: Users2 },
    { to: '/advisories', label: strings.nav.advisories, icon: AlertOctagon },
    { to: '/profile', label: strings.nav.profile, icon: Settings }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-forest-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-sage-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main Navigation"
      >
        <div className="p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold tracking-wider text-forest-400 uppercase">
            Platform Modules
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sage-600 text-white shadow-xs font-semibold'
                        : 'text-forest-700 hover:bg-sage-50 hover:text-forest-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Ambient summary widget at bottom of sidebar */}
        <div className="p-4 border-t border-sage-200/60 bg-warm-bg">
          <div className="p-3 bg-white rounded-xl border border-sage-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-forest-600 mb-1">
              <span className="font-medium">Active Zone Air</span>
              <Info className="w-3.5 h-3.5 text-sage-600" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-forest-900">
                {selectedZone ? (selectedZone.aqiIsValid === false ? 'AQI unavailable' : `${selectedZone.aqiBasis === 'instantaneous_estimate' ? 'Indicative AQI' : selectedZone.aqiBasis === 'scenario' ? 'Scenario AQI' : 'AQI'} ${selectedZone.overallAQI}`) : '--'}
              </span>
              <span className="text-xs font-semibold text-forest-700">
                {selectedZone?.aqiIsValid === false ? 'Insufficient data' : selectedZone?.category || 'Unavailable'}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-forest-500 flex items-center justify-between">
              <span>Dominant: {selectedZone?.dominantPollutant.toUpperCase()}</span>
              <span>{selectedZone?.temperatureC !== null && selectedZone?.temperatureC !== undefined ? `${selectedZone.temperatureC}°C` : 'Weather N/A'}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
