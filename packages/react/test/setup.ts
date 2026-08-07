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

// jsdom has no PointerEvent, so Testing Library falls back to a bare Event for
// pointerdown/move/up - which silently drops clientX/clientY and leaves any
// component doing pointer math reading NaN. A MouseEvent carries exactly the
// coordinates those components want; the pointer fields are the few extras a
// handler is likely to read.
if (!window.PointerEvent) {
  class PointerEventPolyfill extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;
    readonly isPrimary: boolean;

    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? 'mouse';
      this.isPrimary = init.isPrimary ?? true;
    }
  }

  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
