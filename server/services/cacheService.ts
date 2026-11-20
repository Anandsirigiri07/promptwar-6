/**
 * VAYUWISE AI - Deterministic SHA-256 Bounded TTL LRU Cache
 * Implements genuine LRU (Least Recently Used) eviction policy with time-to-live expiration.
 * Keys are computed deterministically via cryptographic SHA-256.
 */

import { createHash } from 'node:crypto';
import { logger } from '../utils/logger.js';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
}

export class BoundedTTLLRUCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxEntries: number;
  private defaultTTLMs: number;

  constructor(maxEntries = 500, defaultTTLMs = 15 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.defaultTTLMs = defaultTTLMs;
  }

  public static generateKey(namespace: string, payload: unknown): string {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const hash = createHash('sha256').update(`${namespace}:${serialized}`).digest('hex');
    return `${namespace}:${hash}`;
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      logger.debug(`Cache key expired: ${key}`);
      return null;
    }

    // Refresh last accessed timestamp for LRU ordering
    entry.lastAccessed = now;
    // Move to end of Map to maintain insertion/access order
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  public set(key: string, value: T, ttlMs?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttlMs ?? this.defaultTTLMs);

    // Evict least recently used if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      let oldestKey: string | null = null;
      let oldestAccess = Infinity;

      for (const [k, v] of this.cache.entries()) {
        if (v.lastAccessed < oldestAccess) {
          oldestAccess = v.lastAccessed;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
        logger.debug(`Evicted LRU cache key: ${oldestKey}`);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt,
      lastAccessed: now
    });
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

// Global shared instances
export const aiResponseCache = new BoundedTTLLRUCache<unknown>(300, 30 * 60 * 1000); // 30 min TTL
export const telemetryCache = new BoundedTTLLRUCache<unknown>(100, 5 * 60 * 1000); // 5 min TTL
