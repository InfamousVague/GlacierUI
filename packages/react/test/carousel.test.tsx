import { describe, expect, it, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { Carousel, Card } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

// jsdom has no layout engine or ResizeObserver; stub the observer and let each
// test drive scroll geometry by defining the relevant HTMLElement props.
beforeAll(() => {
  class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', RO);
});

/** Make the scroller report a fixed overflow and scroll position. */
function mockScroller(scrollWidth: number, clientWidth: number, scrollLeft: number) {
  const el = screen.getByRole('group');
  Object.defineProperty(el, 'scrollWidth', { configurable: true, value: scrollWidth });
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: clientWidth });
  Object.defineProperty(el, 'scrollLeft', { configurable: true, writable: true, value: scrollLeft });
  return el as HTMLElement;
}

const items = ['A', 'B', 'C', 'D'];

describe('Carousel', () => {
  it('renders a labelled, focusable scroll region holding its children', () => {
    render(
      <Carousel aria-label="Featured">
        {items.map((i) => (
          <Card key={i}>{i}</Card>
        ))}
      </Carousel>,
    );
    const group = screen.getByRole('group', { name: 'Featured' });
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('tabindex', '0');
    for (const i of items) expect(screen.getByText(i)).toBeInTheDocument();
  });

  it('omits controls by default', () => {
    render(
      <Carousel aria-label="Featured">
        <Card>A</Card>
      </Carousel>,
    );
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
  });

  it('renders prev/next controls when showControls is set', () => {
    render(
      <Carousel showControls aria-label="Featured">
        {items.map((i) => (
          <Card key={i}>{i}</Card>
        ))}
      </Carousel>,
    );
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('disables prev at the start and enables next while overflowing', () => {
    render(
      <Carousel showControls aria-label="Featured">
        {items.map((i) => (
          <Card key={i}>{i}</Card>
        ))}
      </Carousel>,
    );
    const scroller = mockScroller(1000, 300, 0);
    fireEvent.scroll(scroller);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('disables next once scrolled to the end', () => {
    render(
      <Carousel showControls aria-label="Featured">
        {items.map((i) => (
          <Card key={i}>{i}</Card>
        ))}
      </Carousel>,
    );
    const scroller = mockScroller(1000, 300, 700); // 700 === scrollWidth - clientWidth
    fireEvent.scroll(scroller);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
  });

  it('pages the scroller on control click', () => {
    render(
      <Carousel showControls aria-label="Featured">
        {items.map((i) => (
          <Card key={i}>{i}</Card>
        ))}
      </Carousel>,
    );
    const scroller = mockScroller(1000, 300, 0);
    const scrollBy = vi.fn();
    scroller.scrollBy = scrollBy as unknown as typeof scroller.scrollBy;
    fireEvent.scroll(scroller);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    expect(scrollBy.mock.calls[0]?.[0].left).toBeGreaterThan(0);
  });

  it('translates vertical wheel movement into horizontal scroll', () => {
    render(
      <Carousel aria-label="Featured">
        {items.map((i) => (
          <Card key={i}>{i}</Card>
        ))}
      </Carousel>,
    );
    const scroller = mockScroller(1000, 300, 0);
    fireEvent.wheel(scroller, { deltaY: 120, deltaX: 0 });
    expect(scroller.scrollLeft).toBe(120);
  });

  it('has no axe violations', async () => {
    render(
      <Carousel showControls aria-label="Featured">
        {items.map((i) => (
          <Card key={i}>{i}</Card>
        ))}
      </Carousel>,
    );
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
