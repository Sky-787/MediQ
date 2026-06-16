import '@testing-library/jest-dom';

// Prevent jsdom from performing real network XHR requests during tests
// which can cause unpredictable failures (preflight/403). We stub the
// XMLHttpRequest interface to be a no-op for the test environment.
globalThis.XMLHttpRequest = class {
	open() {}
	send() {}
	setRequestHeader() {}
	abort() {}
};

// Mock localStorage and sessionStorage for environments (like Node v25+) where
// global localStorage is defined natively but crippled (clear/getItem/setItem are undefined)
const createMockStorage = () => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    key: vi.fn((index) => Object.keys(store)[index] || null),
    get length() { return Object.keys(store).length; }
  };
};

if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.clear) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createMockStorage(),
    configurable: true,
    writable: true
  });
}

if (typeof globalThis.sessionStorage === 'undefined' || !globalThis.sessionStorage.clear) {
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: createMockStorage(),
    configurable: true,
    writable: true
  });
}

