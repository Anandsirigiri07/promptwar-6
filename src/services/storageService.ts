/**
 * VAYUWISE AI - Local Storage Service
 * Handles persistence for user preferences, room configurations, and cached plans.
 */

export const storageService = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`vayuwise_${key}`);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`vayuwise_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`vayuwise_${key}`);
    } catch {}
  }
};
