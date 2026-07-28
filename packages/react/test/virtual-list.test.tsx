import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { createRef } from 'react';
import { VirtualList, type VirtualListHandle } from '../src/index.ts';

/**
 * jsdom gives every element a zero client rect, so the viewport would measure 0
 * and render nothing. Pin clientHeight for the duration of a test so the
 * windowing arithmetic has a real viewport to work with.
 */
function withViewport(height: number, run: () => void) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: height });
  try {
    run();
  } finally {
    if (descriptor) Object.defineProperty(HTMLElement.prototype, 'clientHeight', descriptor);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight;
  }
}

const setup = (props: Partial<React.ComponentProps<typeof VirtualList>> = {}) =>
  render(
    <VirtualList
      count={10_000}
      itemSize={40}
      renderItem={(index) => <span>Row {index}</span>}
      aria-label="Rows"
      {...props}
    />,
  );

const rows = () => screen.queryAllByRole('option');

describe('VirtualList', () => {
  it('renders only a windowful of a huge list', () => {
    withViewport(400, () => {
      setup();
      // 10 visible plus overscan — not ten thousand.
      expect(rows().length).toBeGreaterThan(0);
      expect(rows().length).toBeLessThan(25);
    });
  });

  it('renders the rows from the top when unscrolled', () => {
    withViewport(400, () => {
      setup();
      expect(screen.getByText('Row 0')).toBeTruthy();
      expect(screen.queryByText('Row 500')).toBeNull();
    });
  });

  it('keeps the full scroll height so the scrollbar describes the data', () => {
    withViewport(400, () => {
      const { container } = setup();
      const canvas = container.querySelector('[class*="canvas"]') as HTMLElement;
      // 10,000 rows x 40px, not the rendered handful.
      expect(canvas.style.height).toBe('400000px');
    });
  });

  it('swaps the window as the viewport scrolls', () => {
    withViewport(400, () => {
      const { container } = setup();
      const viewport = container.firstChild as HTMLElement;
      Object.defineProperty(viewport, 'scrollTop', { configurable: true, value: 20_000 });
      fireEvent.scroll(viewport);
      expect(screen.getByText('Row 500')).toBeTruthy();
      expect(screen.queryByText('Row 0')).toBeNull();
    });
  });

  it('offsets the window so its rows sit where they belong', () => {
    withViewport(400, () => {
      const { container } = setup();
      const viewport = container.firstChild as HTMLElement;
      Object.defineProperty(viewport, 'scrollTop', { configurable: true, value: 20_000 });
      fireEvent.scroll(viewport);
      const win = container.querySelector('[class*="window"]') as HTMLElement;
      // 500 rows above, minus 3 overscan rows = row 497 at 19,880px.
      expect(win.style.transform).toBe('translateY(19880px)');
    });
  });

  it('names each row by its place in the whole list, not the window', () => {
    // Otherwise a screen reader announces "3 of 12" at item 40,000.
    withViewport(400, () => {
      setup();
      const first = rows()[0]!;
      expect(first.getAttribute('aria-setsize')).toBe('10000');
      expect(first.getAttribute('aria-posinset')).toBe('1');
    });
  });

  it('reports the visible window as it moves', () => {
    withViewport(400, () => {
      const onVisibleChange = vi.fn();
      const { container } = setup({ onVisibleChange });
      onVisibleChange.mockClear();
      const viewport = container.firstChild as HTMLElement;
      Object.defineProperty(viewport, 'scrollTop', { configurable: true, value: 4000 });
      fireEvent.scroll(viewport);
      expect(onVisibleChange).toHaveBeenCalledWith(97, 112);
    });
  });

  it('renders an empty message instead of an empty scroller', () => {
    withViewport(400, () => {
      setup({ count: 0, emptyLabel: 'Nothing here' });
      expect(screen.getByText('Nothing here')).toBeTruthy();
      expect(rows()).toHaveLength(0);
    });
  });

  it('gives the scroller focus so the keyboard can drive it', () => {
    withViewport(400, () => {
      const { container } = setup();
      // Rows are not tabbable; there could be thousands.
      expect((container.firstChild as HTMLElement).getAttribute('tabindex')).toBe('0');
      for (const row of rows()) expect(row.getAttribute('tabindex')).toBeNull();
    });
  });

  it('honours the overscan setting', () => {
    withViewport(400, () => {
      const { unmount } = setup({ overscan: 0 });
      const tight = rows().length;
      unmount();
      setup({ overscan: 5 });
      expect(rows().length).toBeGreaterThan(tight);
    });
  });

  describe('scrollToIndex', () => {
    it('scrolls a distant row into view', () => {
      withViewport(400, () => {
        const ref = createRef<VirtualListHandle>();
        const { container } = setup({ ref });
        const viewport = container.firstChild as HTMLElement;
        let scrollTop = 0;
        Object.defineProperty(viewport, 'scrollTop', {
          configurable: true,
          get: () => scrollTop,
          set: (v) => {
            scrollTop = v;
          },
        });
        ref.current!.scrollToIndex(500, 'start');
        expect(scrollTop).toBe(20_000);
      });
    });

    it('does nothing when the row is already visible', () => {
      // Scrolling anyway would yank the list under the user for no reason.
      withViewport(400, () => {
        const ref = createRef<VirtualListHandle>();
        const { container } = setup({ ref });
        const viewport = container.firstChild as HTMLElement;
        let scrollTop = 0;
        let writes = 0;
        Object.defineProperty(viewport, 'scrollTop', {
          configurable: true,
          get: () => scrollTop,
          set: (v) => {
            writes += 1;
            scrollTop = v;
          },
        });
        ref.current!.scrollToIndex(2);
        expect(writes).toBe(0);
      });
    });
  });

  it('renders placeholder rows at the real item height while loading', () => {
    withViewport(400, () => {
      const { container } = setup({ skeleton: true });
      const row = container.querySelector('[class*="row"]') as HTMLElement;
      // The scrollbar and row rhythm are already correct before data lands.
      expect(row.style.height).toBe('40px');
    });
  });

  it('has no axe violations', async () => {
    let container!: HTMLElement;
    withViewport(400, () => {
      container = setup().container;
    });
    const results = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
