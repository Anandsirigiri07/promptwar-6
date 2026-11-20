import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Mock window.matchMedia if needed in jsdom
if (typeof window !== 'undefined') {
  if (!window.location.origin || window.location.origin === 'null') {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost:5173'),
      writable: true
    });
  }

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    })
  });
}
