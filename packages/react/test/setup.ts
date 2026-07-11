import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// vitest runs without injected globals, so RTL's auto-cleanup never registers
afterEach(cleanup);

// jsdom implements neither matchMedia nor ResizeObserver; uPlot (TimeSeriesChart)
// touches both at import/observe time. Static stubs: no media query ever matches
// and no resize ever fires, which is exactly the inert behavior tests want.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
