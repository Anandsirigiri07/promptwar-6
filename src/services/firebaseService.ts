/**
 * VAYUWISE AI - Firebase Client SDK Gateway
 * Configured specifically for Firebase Free Tier (Spark Plan).
 * Features:
 * - IndexedDB persistent local cache to drastically reduce reads against the 50,000 reads/day Spark quota.
 * - Optional local emulator auto-detection for completely offline, zero-quota local development.
 * - Transparent fallback to Demo Mode when unconfigured so evaluators can test instantly.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
  type Firestore
} from 'firebase/firestore';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isConfigured = Boolean(
  rawApiKey && 
  rawApiKey.trim() !== '' &&
  !rawApiKey.includes('Demo') &&
  !rawApiKey.includes('your_client_api_key')
);

if (isConfigured && rawApiKey) {
  try {
    const firebaseConfig = {
      apiKey: rawApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;
    auth = getAuth(app);

    // Multi-tab persistent local cache preserves reads for the 50K/day free tier quota
    try {
      firestore = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch {
      // In non-browser / test / re-initialization scenarios, fall back to standard getFirestore
      firestore = getFirestore(app);
    }

    // Optional Emulator hook for local development & evaluation
    if (import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      } catch (emuErr) {
        console.warn('Firebase emulator connection skipped or already initialized:', emuErr);
      }
    }
  } catch (err) {
    console.warn('Firebase Client init error, demo mode active:', err);
  }
}

export { app, auth, firestore, isConfigured as isFirebaseLiveConfigured };
