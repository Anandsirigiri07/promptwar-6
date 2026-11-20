/**
 * VAYUWISE AI - Firebase Admin & Firestore Service
 * Initializes Firebase Admin if credentials are supplied in environment.
 * If credentials are missing, provides in-memory store with verified community aggregates.
 */

import admin from 'firebase-admin';
import { logger } from '../utils/logger.js';
import { CommunityPledgeRecord } from '../../src/lib/compute/communityImpact.js';

let adminApp: admin.app.App | null = null;
let firestoreDb: admin.firestore.Firestore | null = null;

// Fallback in-memory store for evaluation when Firebase service account is omitted
const inMemoryPledges = new Map<string, CommunityPledgeRecord>();
const inMemoryActions: Array<{
  id: string;
  userId: string;
  pledgeId: string;
  unitsCompleted: number;
  createdAt: string;
  notes?: string;
}> = [];

// Seed sample community initiatives
const defaultSeedPledges: CommunityPledgeRecord[] = [
  {
    id: 'pledge-carpool-koramangala',
    userId: 'community-organizer-01',
    category: 'carpool',
    title: 'Koramangala to Electronic City EV Carpool',
    description: 'Shared 4-passenger EV commute to reduce 300 private vehicle km daily on Hosur Road.',
    targetCount: 100,
    completedCount: 64,
    estimatedCO2SavingsKg: 89.6,
    estimatedPM25AvoidedGrams: 51.2,
    participants: 18,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pledge-anti-burn-outerring',
    userId: 'community-organizer-02',
    category: 'anti_burn',
    title: 'Zero Waste Burning Vigilance & Composting',
    description: 'Community leaf and garden waste composting drive to prevent open smoky street fires.',
    targetCount: 50,
    completedCount: 38,
    estimatedCO2SavingsKg: 570,
    estimatedPM25AvoidedGrams: 68400,
    participants: 42,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pledge-metro-shift-challenge',
    userId: 'community-organizer-03',
    category: 'transit',
    title: 'Green Metro Commute Workweek Challenge',
    description: 'Pledge 3 days a week using Purple/Green Metro line instead of personal diesel cars.',
    targetCount: 200,
    completedCount: 142,
    estimatedCO2SavingsKg: 177.5,
    estimatedPM25AvoidedGrams: 99.4,
    participants: 55,
    createdAt: new Date().toISOString()
  }
];

for (const p of defaultSeedPledges) {
  inMemoryPledges.set(p.id, p);
}

export function initializeFirebaseAdmin(): void {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    try {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      firestoreDb = adminApp.firestore();
      logger.info('Firebase Admin and Firestore initialized successfully');
    } catch (err) {
      logger.warn('Failed to initialize Firebase Admin with provided credentials, falling back to Demo Mode', { error: String(err) });
      adminApp = null;
      firestoreDb = null;
    }
  } else {
    logger.info('Firebase credentials not configured. Running in transparent DEMO mode with in-memory persistence.');
  }
}

export function getFirebaseAdminAuth(): admin.auth.Auth | null {
  return adminApp ? adminApp.auth() : null;
}

export function getFirestore(): admin.firestore.Firestore | null {
  return firestoreDb;
}

export async function fetchCommunityPledges(): Promise<CommunityPledgeRecord[]> {
  if (firestoreDb) {
    const snapshot = await firestoreDb.collection('communityPledges').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityPledgeRecord));
  }
  return Array.from(inMemoryPledges.values());
}

export async function saveCommunityPledge(pledge: CommunityPledgeRecord): Promise<void> {
  if (firestoreDb) {
    await firestoreDb.collection('communityPledges').doc(pledge.id).set(pledge);
  } else {
    inMemoryPledges.set(pledge.id, pledge);
  }
}

export async function logCommunityAction(action: {
  id: string;
  userId: string;
  pledgeId: string;
  unitsCompleted: number;
  notes?: string;
}): Promise<void> {
  if (firestoreDb) {
    const batch = firestoreDb.batch();
    const actionRef = firestoreDb.collection('communityActions').doc(action.id);
    batch.set(actionRef, {
      ...action,
      verifiedAt: new Date().toISOString()
    });

    const pledgeRef = firestoreDb.collection('communityPledges').doc(action.pledgeId);
    batch.update(pledgeRef, {
      completedCount: admin.firestore.FieldValue.increment(action.unitsCompleted)
    });

    await batch.commit();
  } else {
    inMemoryActions.push({
      ...action,
      createdAt: new Date().toISOString()
    });
    const pledge = inMemoryPledges.get(action.pledgeId);
    if (pledge) {
      pledge.completedCount += action.unitsCompleted;
      pledge.participants += 1;
    }
  }
}
