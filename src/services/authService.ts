/**
 * VAYUWISE AI - Authentication Service
 */

import { storageService } from './storageService.js';

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  isDemoUser: boolean;
  avatarSeed: string;
}

export const authService = {
  getCurrentUser(): UserAccount | null {
    return storageService.get<UserAccount | null>('user_session', {
      uid: 'evaluator-demo-user',
      email: 'evaluator@vayuwise.local',
      displayName: 'Evaluator Guest',
      isDemoUser: true,
      avatarSeed: 'sage'
    });
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
    storageService.set('auth_token', 'demo-token');
    return user;
  },

  signIn(email: string): UserAccount {
    const user: UserAccount = {
      uid: `usr-${Date.now()}`,
      email,
      displayName: email.split('@')[0] || 'User',
      isDemoUser: false,
      avatarSeed: 'emerald'
    };
    storageService.set('user_session', user);
    storageService.set('auth_token', `token-${Date.now()}`);
    return user;
  },

  signOut(): void {
    storageService.remove('user_session');
    storageService.remove('auth_token');
  }
};
