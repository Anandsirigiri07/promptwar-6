/**
 * VAYUWISE AI - Firebase Client SDK Gateway
 * Initializes Firebase Web SDK if environment variables are present.
 * Transparently falls back to Demo Mode when unconfigured so evaluators can test instantly.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

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
    firestore = getFirestore(app);
  } catch (err) {
    console.warn('Firebase Client init error, demo mode active:', err);
  }
}

export { app, auth, firestore, isConfigured as isFirebaseLiveConfigured };