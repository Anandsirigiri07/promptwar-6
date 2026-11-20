/**
 * VAYUWISE AI - Local Storage Service
 * Handles persistence for user preferences, room configurations, and cached plans.
 * Lifecycle-safe: guards against SSR and torn-down DOM test environments.
 */

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export const storageService = {
  get<T>(key: string, defaultValue: T): T {
    try {
      if (!hasLocalStorage()) return defaultValue;
      const item = localStorage.getItem(`vayuwise_${key}`);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      if (!hasLocalStorage()) return;
      localStorage.setItem(`vayuwise_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  },

  remove(key: string): void {
    try {
      if (!hasLocalStorage()) return;
      localStorage.removeItem(`vayuwise_${key}`);
    } catch {}
  }
};