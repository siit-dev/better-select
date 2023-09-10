import { jest } from '@jest/globals';

let listeners = [];
let matches = true;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    get matches() {
      return matches;
    },
    media: query,
    onchange: null,
    addListener: jest.fn(listener => listeners.push(listener)), // deprecated
    removeListener: jest.fn(listener => (listeners = listeners.filter(l => l !== listener))), // deprecated
    addEventListener: jest.fn(listener => listeners.push(listener)),
    removeEventListener: jest.fn(listener => (listeners = listeners.filter(l => l !== listener))),
    dispatchEvent: jest.fn(event => listeners.forEach(listener => listener(event))),
  })),
});

export const setMatchMedia = newMatches => {
  matches = newMatches;
  listeners.forEach(listener => listener({ matches }));
};
