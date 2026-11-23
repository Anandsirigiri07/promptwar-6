/**
 * VAYUWISE AI - Firebase Admin & Firestore Service
 * Initializes Firebase Admin if credentials are supplied in environment.
 * If credentials are missing, provides safe local demo data explicitly labeled as demo.
 * Uses atomic Firestore transactions for pledge progress and impact recalculation.
 */

import { logger } from '../utils/logger.js';
import { CommunityPledgeRecord, calculatePledgeAvoidedEmissions } from '../../src/lib/compute/communityImpact.js';
import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore, Transaction, QueryDocumentSnapshot } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

// Fallback in-memory store for evaluation when Firebase service account is omitted
const inMemoryPledges = new Map<string, CommunityPledgeRecord>();
const inMemoryIdempotencyKeys = new Map<string, {
  actionId: string;
  updatedPledge: CommunityPledgeRecord;
  status: 'self_reported';
}>();
const inMemoryActions: Array<{
  id: string;
  userId: string;
  pledgeId: string;
  unitsCompleted: number;
  status: 'self_reported' | 'verified';
  createdAt: string;
  notes?: string;
}> = [];

// Seed sample community initiatives for offline evaluation
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
    createdAt: '2026-11-01T08:00:00.000Z'
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
    createdAt: '2026-11-02T08:00:00.000Z'
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
    createdAt: '2026-11-03T08:00:00.000Z'
  }
];

for (const p of defaultSeedPledges) {
  inMemoryPledges.set(p.id, p);
}

export async function initializeFirebaseAdmin(): Promise<void> {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

  try {
    const { initializeApp, cert } = await import('firebase-admin/app');
    const { getFirestore: getAdminFirestore } = await import('firebase-admin/firestore');
    
    // Support local Firebase emulator for 100% offline development without private keys
    if (emulatorHost) {
      try {
        adminApp = initializeApp({ projectId: projectId || 'vayuwise-dev' });
        firestoreDb = getAdminFirestore(adminApp);
        logger.info('Firebase Admin initialized with local Firestore Emulator', { emulatorHost });
        return;
      } catch (err) {
        logger.warn('Failed to initialize Firebase Admin with emulator', { error: String(err) });
      }
    }

    if (projectId && clientEmail && privateKey && !projectId.includes('vayuwise-demo')) {
      try {
        adminApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey
          })
        });
        firestoreDb = getAdminFirestore(adminApp);
        
        try {
          const authModule = await import('firebase-admin/auth');
          firebaseAuth = authModule.getAuth(adminApp);
        } catch (authErr) {
          logger.warn('Firebase Admin Auth lazy load skipped due to runtime ESM constraint', { error: String(authErr) });
        }

        logger.info('Firebase Admin and Firestore initialized successfully');
      } catch (err) {
        logger.warn('Failed to initialize Firebase Admin with provided credentials, falling back to Demo Mode', { error: String(err) });
        adminApp = null;
        firestoreDb = null;
      }
    } else {
      logger.info('Firebase credentials not configured. Running in transparent DEMO mode with in-memory persistence.');
    }
  } catch (loadErr) {
    logger.warn('Firebase Admin packages unavailable or incompatible with runtime environment. Operating in zero-dependency Demo Mode.', { error: String(loadErr) });
  }
}

export function getFirebaseAdminAuth(): Auth | null {
  return firebaseAuth;
}

export function getFirestore(): Firestore | null {
  return firestoreDb;
}

export async function fetchCommunityPledges(): Promise<{
  pledges: CommunityPledgeRecord[];
  isDemoData: boolean;
}> {
  if (firestoreDb) {
    try {
      // Bound query with limit(50) for Firebase Free Tier (Spark Plan) to prevent exhausting the 50,000 reads/day quota
      const snapshot = await firestoreDb.collection('communityPledges').limit(50).get();
      if (!snapshot.empty) {
        const pledges = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as CommunityPledgeRecord));
        return { pledges, isDemoData: false };
      }
      return { pledges: Array.from(inMemoryPledges.values()), isDemoData: true };
    } catch (err) {
      logger.warn('Firestore fetch failed or database not yet provisioned, falling back to Demo Mode', { error: String(err) });
    }
  }
  return { pledges: Array.from(inMemoryPledges.values()), isDemoData: true };
}

export async function getCommunityPledgeById(pledgeId: string): Promise<CommunityPledgeRecord | null> {
  if (firestoreDb) {
    try {
      const doc = await firestoreDb.collection('communityPledges').doc(pledgeId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as CommunityPledgeRecord;
      }
    } catch (err) {
      logger.warn('Firestore getPledge failed, falling back to Demo Mode', { error: String(err) });
    }
  }
  return inMemoryPledges.get(pledgeId) || null;
}

export async function saveCommunityPledge(pledge: CommunityPledgeRecord): Promise<void> {
  if (firestoreDb) {
    try {
      await firestoreDb.collection('communityPledges').doc(pledge.id).set(pledge);
      return;
    } catch (err) {
      logger.warn('Firestore savePledge failed, falling back to in-memory store', { error: String(err) });
    }
  }
  inMemoryPledges.set(pledge.id, pledge);
}

export async function logCommunityAction(action: {
  id: string;
  userId: string;
  pledgeId: string;
  unitsCompleted: number;
  notes?: string;
  idempotencyKey?: string;
}): Promise<{
  actionId: string;
  updatedPledge: CommunityPledgeRecord;
  status: 'self_reported';
  isDuplicate?: boolean;
} | null> {
  if (firestoreDb) {
    try {
      const pledgeRef = firestoreDb.collection('communityPledges').doc(action.pledgeId);
      const actionRef = firestoreDb.collection('communityActions').doc(action.id);
      const idempotencyRef = action.idempotencyKey
        ? firestoreDb.collection('idempotencyKeys').doc(action.idempotencyKey)
        : null;

      return await firestoreDb.runTransaction(async (transaction: Transaction) => {
        // 1. Check idempotency record within transaction
        if (idempotencyRef) {
          const idempDoc = await transaction.get(idempotencyRef);
          if (idempDoc.exists) {
            const cached = idempDoc.data() as {
              actionId: string;
              updatedPledge: CommunityPledgeRecord;
              status: 'self_reported';
            };
            return {
              ...cached,
              isDuplicate: true
            };
          }
        }

        const pledgeDoc = await transaction.get(pledgeRef);
        if (!pledgeDoc.exists) {
          return null;
        }

        const pledgeData = pledgeDoc.data() as CommunityPledgeRecord;
        const newCompletedCount = (pledgeData.completedCount || 0) + action.unitsCompleted;
        const updatedImpact = calculatePledgeAvoidedEmissions(pledgeData.category, newCompletedCount);

        const updatedPledge: CommunityPledgeRecord = {
          ...pledgeData,
          completedCount: newCompletedCount,
          participants: (pledgeData.participants || 0) + 1,
          estimatedCO2SavingsKg: updatedImpact.co2Kg,
          estimatedPM25AvoidedGrams: updatedImpact.pm25Grams
        };

        // Record the logged action as self_reported (never claiming external verification)
        transaction.set(actionRef, {
          ...action,
          status: 'self_reported',
          loggedAt: new Date().toISOString()
        });

        transaction.update(pledgeRef, {
          completedCount: updatedPledge.completedCount,
          participants: updatedPledge.participants,
          estimatedCO2SavingsKg: updatedPledge.estimatedCO2SavingsKg,
          estimatedPM25AvoidedGrams: updatedPledge.estimatedPM25AvoidedGrams
        });

        if (idempotencyRef) {
          transaction.set(idempotencyRef, {
            actionId: action.id,
            pledgeId: action.pledgeId,
            userId: action.userId,
            unitsCompleted: action.unitsCompleted,
            updatedPledge,
            createdAt: new Date().toISOString()
          });
        }

        return {
          actionId: action.id,
          updatedPledge,
          status: 'self_reported' as const,
          isDuplicate: false
        };
      });
    } catch (err) {
      logger.warn('Firestore transaction failed, falling back to in-memory store', { error: String(err) });
    }
  }

  // In-Memory Idempotency check for demo mode
  if (action.idempotencyKey && inMemoryIdempotencyKeys.has(action.idempotencyKey)) {
    const cached = inMemoryIdempotencyKeys.get(action.idempotencyKey)!;
    return {
      ...cached,
      isDuplicate: true
    };
  }

  const pledge = inMemoryPledges.get(action.pledgeId);
  if (!pledge) {
    return null;
  }

  pledge.completedCount += action.unitsCompleted;
  pledge.participants += 1;
  const updatedImpact = calculatePledgeAvoidedEmissions(pledge.category, pledge.completedCount);
  pledge.estimatedCO2SavingsKg = updatedImpact.co2Kg;
  pledge.estimatedPM25AvoidedGrams = updatedImpact.pm25Grams;

  inMemoryActions.push({
    ...action,
    status: 'self_reported',
    createdAt: new Date().toISOString()
  });

  const result = {
    actionId: action.id,
    updatedPledge: { ...pledge },
    status: 'self_reported' as const,
    isDuplicate: false
  };

  if (action.idempotencyKey) {
    inMemoryIdempotencyKeys.set(action.idempotencyKey, {
      actionId: action.id,
      updatedPledge: { ...pledge },
      status: 'self_reported'
    });
  }

  return result;
}
