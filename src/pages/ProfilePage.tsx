/**
 * VAYUWISE AI - User Profile & Saved Preferences (Route: /profile)
 */

import React, { useState } from 'react';
import {
  Settings,
  User,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { authService } from '../services/authService.js';
import { SupportedLanguage } from '../types/index.js';

export const ProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser, preferences, updatePreferences } = useApp();
  const [emailInput, setEmailInput] = useState(currentUser?.email || '');
  const [, setSaveMessage] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    try {
      const user = await authService.signIn(emailInput.trim());
      setCurrentUser(user);
      setSaveMessage(true);
      setTimeout(() => setSaveMessage(false), 2000);
    } catch (err) {
      console.warn('Sign in error', err);
    }
  };

  const handleDemoSignIn = () => {
    const demoUser = authService.signInDemo('Competition Evaluator');
    setCurrentUser(demoUser);
    setEmailInput(demoUser.email);
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 2000);
  };

  const handleSignOut = () => {
    authService.signOut();
    setCurrentUser(null);
    setEmailInput('');
  };

  return (
    <div className="space-y-8 py-2 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2 pb-2 border-b border-sage-200">
        <div className="flex items-center gap-2">
          <Settings className="w-7 h-7 text-sage-600" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-900 tracking-tight">
            User Account & Preferences
          </h1>
        </div>
        <p className="text-sm text-forest-600">
          Manage your environmental standards, localization settings, and authentication state.
        </p>
      </div>

      {/* Account Authentication Card */}
      <div className="bg-white rounded-2xl border border-sage-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-forest-900">
                {currentUser?.displayName || 'Guest User'}
              </h2>
              <span className="text-xs text-forest-500">
                {currentUser?.email || 'Unauthenticated Session'}
              </span>
            </div>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
              currentUser?.isDemoUser
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            {currentUser?.isDemoUser ? 'Demo Mode (Local Persistence)' : 'Firebase Authenticated'}
          </span>
        </div>

        {currentUser ? (
          <div className="pt-2 flex items-center justify-between border-t border-sage-100">
            <span className="text-xs text-forest-500">
              Session active. All preferences and rooms are persisted to local storage.
            </span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl border border-forest-200 text-xs font-semibold text-forest-700 hover:bg-sage-50"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4 pt-2 border-t border-sage-100">
            <div>
              <label className="block text-xs font-bold text-forest-800 mb-1">Email Address</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="evaluator@vayuwise.local"
                className="w-full max-w-md p-2.5 rounded-xl border border-forest-200 text-xs text-forest-900 bg-warm-bg"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-forest-800 text-white text-xs font-semibold hover:bg-forest-900"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="px-4 py-2 rounded-xl bg-sage-100 text-sage-800 text-xs font-semibold hover:bg-sage-200 border border-sage-300"
              >
                Continue as Demo Evaluator
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Standards & Accessibility Settings */}
      <div className="bg-white rounded-2xl border border-sage-200 p-6 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-forest-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-sage-600" />
          Standards & Accessibility Preferences
        </h2>

        <div className="space-y-4 text-xs">
          {/* AQI Standard Choice */}
          <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-xl border border-sage-200">
            <div>
              <strong className="text-forest-900 block font-bold">AQI Calculation Methodology</strong>
              <span className="text-forest-500">
                Choose between India CPCB NAQI standard or US EPA methodology.
              </span>
            </div>
            <select
              value={preferences.aqiStandard}
              onChange={(e) => updatePreferences({ aqiStandard: e.target.value as 'CPCB' | 'EPA' })}
              className="p-2 rounded-lg border border-forest-200 bg-white font-semibold text-forest-900 focus:outline-none"
            >
              <option value="CPCB">India CPCB (0-500 Scale)</option>
              <option value="EPA">US EPA (0-500 Scale)</option>
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between p-3.5 bg-warm-bg rounded-xl border border-sage-200">
            <div>
              <strong className="text-forest-900 block font-bold">Platform Language & Text Direction</strong>
              <span className="text-forest-500">
                Arabic activates bidirectional RTL layout automatically.
              </span>
            </div>
            <select
              value={preferences.language}
              onChange={(e) => updatePreferences({ language: e.target.value as SupportedLanguage })}
              className="p-2 rounded-lg border border-forest-200 bg-white font-semibold text-forest-900 focus:outline-none"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ar">العربية (Arabic - RTL)</option>
              <option value="es">Español (Spanish)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
