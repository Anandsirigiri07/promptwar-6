/**
 * VAYUWISE AI - Application Context State Definitions
 */

import { UrbanZoneTelemetry, ScenarioType } from '../types/telemetry.js';
import { PersonaType, DailyPersonalizedRoutine } from '../types/routine.js';
import { SupportedLanguage, UserPreferences } from '../types/index.js';
import { SavedRoomConfig } from '../types/iaq.js';
import { CommunityPledgeRecord } from '../lib/compute/communityImpact.js';
import { UserAccount } from '../services/authService.js';

export interface AppContextState {
  currentUser: UserAccount | null;
  preferences: UserPreferences;
  selectedZone: UrbanZoneTelemetry | null;
  allZones: UrbanZoneTelemetry[];
  currentScenario: ScenarioType;
  selectedPersona: PersonaType;
  currentRoutine: DailyPersonalizedRoutine | null;
  savedRooms: SavedRoomConfig[];
  communityPledges: CommunityPledgeRecord[];
  isLoading: boolean;
  error: string | null;
  isDemoMode: boolean;
}

export interface AppContextActions {
  setCurrentUser: (user: UserAccount | null) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  setSelectedZoneId: (zoneId: string) => void;
  setScenario: (scenario: ScenarioType) => Promise<void>;
  setSelectedPersona: (persona: PersonaType) => void;
  setCurrentRoutine: (routine: DailyPersonalizedRoutine | null) => void;
  addSavedRoom: (room: SavedRoomConfig) => void;
  removeSavedRoom: (roomId: string) => void;
  updateSavedRoom: (room: SavedRoomConfig) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  refreshTelemetry: () => Promise<void>;
  clearError: () => void;
}
