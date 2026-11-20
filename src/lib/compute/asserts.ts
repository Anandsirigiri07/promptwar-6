/**
 * VAYUWISE AI - Numerical Asserts and Input Validation Guards
 * Ensures physical quantities are finite, non-negative, and mathematically sound.
 */

export function assertFiniteNumber(val: unknown, fieldName: string, min = 0, max = 100000): number {
  if (typeof val !== 'number' || !Number.isFinite(val) || Number.isNaN(val)) {
    throw new Error(`Invalid numeric value for ${fieldName}: received ${String(val)}`);
  }
  if (val < min) {
    throw new Error(`Value for ${fieldName} (${val}) cannot be less than minimum allowed (${min})`);
  }
  if (val > max) {
    throw new Error(`Value for ${fieldName} (${val}) exceeds maximum allowed (${max})`);
  }
  return val;
}

export function safeDivision(numerator: number, denominator: number, fallback = 0): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return fallback;
  }
  return numerator / denominator;
}

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}
