/**
 * VAYUWISE AI - Community Action & Verified Aggregates Types
 */

export interface CommunityActionLog {
  id: string;
  userId: string;
  userName: string;
  pledgeId: string;
  category: string;
  units: number;
  verifiedAt: string;
  notes?: string;
}

export interface CommunityGlobalAggregates {
  totalParticipants: number;
  totalActivePledges: number;
  totalActionsLogged: number;
  cumulativeCO2SavedKg: number;
  cumulativePM25AvoidedGrams: number;
  lastUpdatedAt: string;
}
