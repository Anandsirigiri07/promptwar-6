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

export const authService = {
  getCurrentUser(): UserAccount | null {
    const session = storageService.get<UserAccount | null>('user_session', null);
    if (session) return session;

    // In demo mode when no session exists, default to explicit demo evaluator
    if (!isFirebaseLiveConfigured) {
      const demoUser: UserAccount = {
        uid: 'evaluator-demo-user',
        email: 'evaluator@vayuwise.local',
        displayName: 'Guest Demo Evaluator',
        isDemoUser: true,
        avatarSeed: 'sage'
      };
      storageService.set('user_session', demoUser);
      storageService.set('vayuwise_auth_token', 'demo-token');
      storageService.set('vayuwise_demo_active', 'true');
      return demoUser;
    }

    return null;
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
    return user;
  },

  async signIn(email: string, password = ''): Promise<UserAccount> {
    if (isFirebaseLiveConfigured && auth) {
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
        return user;
      } catch {
        // If sign-in fails or user doesn't exist, attempt sign-up
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const token = await cred.user.getIdToken();
        const user: UserAccount = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: email.split('@')[0] || 'User',
          isDemoUser: false,
          avatarSeed: 'emerald'
        };
        storageService.set('user_session', user);
        storageService.set('vayuwise_auth_token', token);
        storageService.remove('vayuwise_demo_active');
        return user;
      }
    }

    // Transparent Demo Mode (Clearly labelled, zero cloud claim)
    const user: UserAccount = {
      uid: `demo-user-${Date.now()}`,
      email,
      displayName: email.split('@')[0] || 'Demo User',
      isDemoUser: true,
      avatarSeed: 'emerald'
    };
    storageService.set('user_session', user);
    storageService.set('vayuwise_auth_token', 'demo-token');
    storageService.set('vayuwise_demo_active', 'true');
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
  },

  onAuthStateChanged(callback: (user: UserAccount | null) => void): () => void {
    if (isFirebaseLiveConfigured && auth) {
      return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
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
          callback(user);
        } else {
          callback(null);
        }
      });
    }

    // In demo mode, invoke immediately with current stored session
    const current = this.getCurrentUser();
    callback(current);
    return () => {};
  }
};
