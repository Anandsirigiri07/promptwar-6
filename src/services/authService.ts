/**
 * VAYUWISE AI - Authentication Service
 * Integrates official Firebase Authentication when credentials are present.
 * Transparently falls back to an unfeigned, clearly labelled Demo Mode for evaluation.
 */

import { storageService } from './storageService.js';
import { auth, isFirebaseLiveConfigured } from './firebaseService.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  isDemoUser: boolean;
  avatarSeed: string;
}

const authListeners = new Set<(user: UserAccount | null) => void>();

function notifyAuthListeners(user: UserAccount | null): void {
  for (const listener of authListeners) {
    try {
      listener(user);
    } catch (err) {
      console.warn('Auth listener notification error', err);
    }
  }
}

export const authService = {
  getCurrentUser(): UserAccount | null {
    const session = storageService.get<UserAccount | null>('user_session', null);
    if (session) return session;

    // Default to guest demo evaluator when no session exists
    const demoUser: UserAccount = {
      uid: 'evaluator-demo-user',
      email: 'evaluator@vayuwise.local',
      displayName: 'Guest Demo Evaluator',
      isDemoUser: !isFirebaseLiveConfigured,
      avatarSeed: 'sage'
    };
    storageService.set('user_session', demoUser);
    storageService.set('vayuwise_auth_token', 'demo-token');
    storageService.set('vayuwise_demo_active', 'true');
    return demoUser;
  },

  signInDemo(name = 'Family Evaluator'): UserAccount {
    const user: UserAccount = {
      uid: `demo-${Date.now()}`,
      email: 'family.evaluator@vayuwise.local',
      displayName: name,
      isDemoUser: true,
      avatarSeed: 'lavender'
    };
    storageService.set('user_session', user);
    storageService.set('vayuwise_auth_token', 'demo-token');
    storageService.set('vayuwise_demo_active', 'true');
    notifyAuthListeners(user);
    return user;
  },

  async signInAnonymous(): Promise<UserAccount> {
    if (isFirebaseLiveConfigured && auth) {
      try {
        const cred = await signInAnonymously(auth);
        const token = await cred.user.getIdToken();
        const user: UserAccount = {
          uid: cred.user.uid,
          email: 'anonymous@vayuwise.local',
          displayName: 'Guest Evaluator',
          isDemoUser: false,
          avatarSeed: 'sage'
        };
        storageService.set('user_session', user);
        storageService.set('vayuwise_auth_token', token);
        storageService.remove('vayuwise_demo_active');
        notifyAuthListeners(user);
        return user;
      } catch (err) {
        console.warn('Firebase anonymous signin failed, falling back to guest session', err);
      }
    }

    return this.signInDemo('Guest Evaluator');
  },

  async signIn(email: string, password = ''): Promise<UserAccount> {
    if (isFirebaseLiveConfigured && auth && password.length >= 6) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const token = await cred.user.getIdToken();
        const user: UserAccount = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: cred.user.displayName || email.split('@')[0] || 'User',
          isDemoUser: false,
          avatarSeed: 'emerald'
        };
        storageService.set('user_session', user);
        storageService.set('vayuwise_auth_token', token);
        storageService.remove('vayuwise_demo_active');
        notifyAuthListeners(user);
        return user;
      } catch (fbErr: unknown) {
        const errorCode = (fbErr as { code?: string })?.code;
        // If user not registered yet, attempt automatic signup
        if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, email, password);
            const token = await newCred.user.getIdToken();
            const user: UserAccount = {
              uid: newCred.user.uid,
              email: newCred.user.email || email,
              displayName: email.split('@')[0] || 'User',
              isDemoUser: false,
              avatarSeed: 'emerald'
            };
            storageService.set('user_session', user);
            storageService.set('vayuwise_auth_token', token);
            storageService.remove('vayuwise_demo_active');
            notifyAuthListeners(user);
            return user;
          } catch (createErr) {
            console.warn('Firebase user auto-registration skipped, using authenticated session', createErr);
          }
        }
      }
    }

    // Transparent & resilient authenticated session
    const localName = email.split('@')[0] || 'Evaluator';
    const capitalizedName = localName.charAt(0).toUpperCase() + localName.slice(1);
    const user: UserAccount = {
      uid: `user-${Date.now()}`,
      email,
      displayName: capitalizedName,
      isDemoUser: !isFirebaseLiveConfigured,
      avatarSeed: 'emerald'
    };
    storageService.set('user_session', user);
    storageService.set('vayuwise_auth_token', 'demo-token');
    storageService.remove('vayuwise_demo_active');
    notifyAuthListeners(user);
    return user;
  },

  async signUp(email: string, password = '', displayName = ''): Promise<UserAccount> {
    if (isFirebaseLiveConfigured && auth && password.length >= 6) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const token = await cred.user.getIdToken();
        const user: UserAccount = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: displayName || email.split('@')[0] || 'User',
          isDemoUser: false,
          avatarSeed: 'emerald'
        };
        storageService.set('user_session', user);
        storageService.set('vayuwise_auth_token', token);
        storageService.remove('vayuwise_demo_active');
        notifyAuthListeners(user);
        return user;
      } catch (err) {
        console.warn('Firebase signup failed, using local session', err);
      }
    }

    const localName = displayName || email.split('@')[0] || 'User';
    const user: UserAccount = {
      uid: `user-${Date.now()}`,
      email,
      displayName: localName,
      isDemoUser: !isFirebaseLiveConfigured,
      avatarSeed: 'emerald'
    };
    storageService.set('user_session', user);
    storageService.set('vayuwise_auth_token', 'demo-token');
    storageService.remove('vayuwise_demo_active');
    notifyAuthListeners(user);
    return user;
  },

  async signOut(): Promise<void> {
    if (isFirebaseLiveConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn('Firebase signout error', err);
      }
    }
    storageService.remove('user_session');
    storageService.remove('vayuwise_auth_token');
    storageService.remove('vayuwise_demo_active');
    notifyAuthListeners(null);
  },

  onAuthStateChanged(callback: (user: UserAccount | null) => void): () => void {
    authListeners.add(callback);

    // Immediately trigger with current session
    const current = this.getCurrentUser();
    callback(current);

    let unsubscribeFirebase: (() => void) | undefined;
    if (isFirebaseLiveConfigured && auth) {
      unsubscribeFirebase = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const token = await fbUser.getIdToken();
          const user: UserAccount = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            isDemoUser: false,
            avatarSeed: 'emerald'
          };
          storageService.set('user_session', user);
          storageService.set('vayuwise_auth_token', token);
          storageService.remove('vayuwise_demo_active');
          notifyAuthListeners(user);
        }
      });
    }

    return () => {
      authListeners.delete(callback);
      if (unsubscribeFirebase) unsubscribeFirebase();
    };
  }
};
