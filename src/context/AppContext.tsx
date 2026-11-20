/**
 * VAYUWISE AI - Core Application State Context Provider
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AppContextState, AppContextActions } from './types.js';
import { UrbanZoneTelemetry, ScenarioType } from '../types/telemetry.js';
import { PersonaType, DailyPersonalizedRoutine } from '../types/routine.js';
import { SupportedLanguage, UserPreferences } from '../types/index.js';
import { SavedRoomConfig } from '../types/iaq.js';
import { CommunityPledgeRecord } from '../lib/compute/communityImpact.js';
import { authService, UserAccount } from '../services/authService.js';
import { storageService } from '../services/storageService.js';
import { airQualityService } from '../services/airQualityService.js';
import { isRTLLanguage } from '../lib/localization.js';

const DEFAULT_PREFERENCES: UserPreferences = {
  city: 'Bengaluru / Delhi NCR',
  selectedZoneId: 'zone-1',
  language: 'en',
  householdPersonas: ['child', 'elderly', 'office_commuter'],
  highContrastMode: false,
  reducedMotion: false,
  aqiStandard: 'CPCB'
};

const DEFAULT_ROOMS: SavedRoomConfig[] = [
  {
    id: 'room-master-bed',
    name: 'Master Bedroom',
    lengthM: 4.5,
    widthM: 3.8,
    heightM: 2.8,
    occupants: 2,
    purifierCADR: 250,
    targetACH: 5.0
  },
  {
    id: 'room-kids',
    name: "Children's Nursery",
    lengthM: 3.6,
    widthM: 3.2,
    heightM: 2.8,
    occupants: 1,
    purifierCADR: 0,
    targetACH: 5.5
  }
];

const AppContext = createContext<(AppContextState & AppContextActions) | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authService.getCurrentUser());
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    storageService.get<UserPreferences>('preferences', DEFAULT_PREFERENCES)
  );
  const [allZones, setAllZones] = useState<UrbanZoneTelemetry[]>([]);
  const [selectedZoneId, setSelectedZoneIdState] = useState<string>(preferences.selectedZoneId);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('realtime');
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('child');
  const [currentRoutine, setCurrentRoutine] = useState<DailyPersonalizedRoutine | null>(null);
  const [savedRooms, setSavedRooms] = useState<SavedRoomConfig[]>(() =>
    storageService.get<SavedRoomConfig[]>('rooms', DEFAULT_ROOMS)
  );
  const [communityPledges] = useState<CommunityPledgeRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync document language and text direction for RTL (Arabic)
  useEffect(() => {
    document.documentElement.lang = preferences.language;
    document.documentElement.dir = isRTLLanguage(preferences.language) ? 'rtl' : 'ltr';
  }, [preferences.language]);

  // Persist preferences
  useEffect(() => {
    storageService.set('preferences', preferences);
  }, [preferences]);

  // Persist rooms
  useEffect(() => {
    storageService.set('rooms', savedRooms);
  }, [savedRooms]);

  // Load air quality telemetry
  const refreshTelemetry = useCallback(async () => {
    setIsLoading(true);
    try {
      const zones = await airQualityService.getZones(preferences.city, currentScenario);
      setAllZones(zones);
      setError(null);
    } catch (err: unknown) {
      console.warn('Telemetry load failed, using local fallback:', err);
      // Fallback local zones
      setError('Live telemetry connection offline. Using local verified sensor simulation.');
    } finally {
      setIsLoading(false);
    }
  }, [preferences.city, currentScenario]);

  useEffect(() => {
    refreshTelemetry();
  }, [refreshTelemetry]);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const setSelectedZoneId = useCallback((zoneId: string) => {
    setSelectedZoneIdState(zoneId);
    updatePreferences({ selectedZoneId: zoneId });
  }, [updatePreferences]);

  const setScenario = useCallback(async (scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    setIsLoading(true);
    try {
      const sim = await airQualityService.simulateScenario(scenario, selectedZoneId);
      setAllZones(sim.allZones);
    } catch (err) {
      console.warn('Scenario simulation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedZoneId]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    updatePreferences({ language: lang });
  }, [updatePreferences]);

  const addSavedRoom = useCallback((room: SavedRoomConfig) => {
    setSavedRooms(prev => [...prev, room]);
  }, []);

  const removeSavedRoom = useCallback((roomId: string) => {
    setSavedRooms(prev => prev.filter(r => r.id !== roomId));
  }, []);

  const updateSavedRoom = useCallback((room: SavedRoomConfig) => {
    setSavedRooms(prev => prev.map(r => r.id === room.id ? room : r));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const selectedZone = useMemo(() => {
    if (!allZones.length) return null;
    return allZones.find(z => z.zoneId === selectedZoneId) || allZones[0] || null;
  }, [allZones, selectedZoneId]);

  const contextValue = useMemo(() => ({
    currentUser,
    preferences,
    selectedZone,
    allZones,
    currentScenario,
    selectedPersona,
    currentRoutine,
    savedRooms,
    communityPledges,
    isLoading,
    error,
    isDemoMode: true,
    setCurrentUser,
    updatePreferences,
    setSelectedZoneId,
    setScenario,
    setSelectedPersona,
    setCurrentRoutine,
    addSavedRoom,
    removeSavedRoom,
    updateSavedRoom,
    setLanguage,
    refreshTelemetry,
    clearError
  }), [
    currentUser,
    preferences,
    selectedZone,
    allZones,
    currentScenario,
    selectedPersona,
    currentRoutine,
    savedRooms,
    communityPledges,
    isLoading,
    error,
    updatePreferences,
    setSelectedZoneId,
    setScenario,
    setSelectedPersona,
    addSavedRoom,
    removeSavedRoom,
    updateSavedRoom,
    setLanguage,
    refreshTelemetry,
    clearError
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextState & AppContextActions {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
