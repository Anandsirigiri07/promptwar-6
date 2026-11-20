import { describe, it, expect } from 'vitest';
import { assertFiniteNumber, safeDivision, clamp } from '../lib/compute/asserts.js';

describe('Calculations & Numeric Assertion Guards', () => {
  it('validates physical positive numbers correctly', () => {
    expect(assertFiniteNumber(42, 'testField')).toBe(42);
    expect(assertFiniteNumber(0, 'zeroField')).toBe(0);
    expect(assertFiniteNumber(150.5, 'floatField')).toBe(150.5);
  });

  it('rejects NaN, Infinity, and non-numeric inputs', () => {
    expect(() => assertFiniteNumber(NaN, 'nanVal')).toThrow(/Invalid numeric value/);
    expect(() => assertFiniteNumber(Infinity, 'infVal')).toThrow(/Invalid numeric value/);
    expect(() => assertFiniteNumber(-Infinity, 'negInfVal')).toThrow(/Invalid numeric value/);
    expect(() => assertFiniteNumber('42', 'stringVal')).toThrow(/Invalid numeric value/);
    expect(() => assertFiniteNumber(null, 'nullVal')).toThrow(/Invalid numeric value/);
  });

  it('enforces min and max boundaries strictly', () => {
    expect(() => assertFiniteNumber(-5, 'subzero', 0, 100)).toThrow(/cannot be less than minimum/);
    expect(() => assertFiniteNumber(105, 'overflow', 0, 100)).toThrow(/exceeds maximum/);
  });

  it('handles safeDivision gracefully avoiding division by zero', () => {
    expect(safeDivision(10, 2)).toBe(5);
    expect(safeDivision(10, 0, 0)).toBe(0);
    expect(safeDivision(10, -1, 0)).toBe(0);
    expect(safeDivision(NaN, 5, 0)).toBe(0);
  });

  it('clamps values within bounds', () => {
    expect(clamp(50, 0, 100)).toBe(50);
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(NaN, 0, 100)).toBe(0);
  });
});
