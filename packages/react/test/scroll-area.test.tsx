import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { ScrollArea } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

/** jsdom reports 0 for layout metrics; stub them so the fade logic has data. */
function stubMetrics(
  el: HTMLElement,
  metrics: Partial<Record<'scrollHeight' | 'clientHeight' | 'scrollWidth' | 'clientWidth' | 'scrollTop' | 'scrollLeft', number>>,
) {
  for (const [key, value] of Object.entries(metrics)) {
    Object.defineProperty(el, key, { configurable: true, writable: true, value });
  }
}

const viewport = () => screen.getByRole('group');
const root = () => viewport().parentElement as HTMLElement;

describe('ScrollArea', () => {
  it('renders a focusable viewport wrapping its children', () => {
    render(
      <ScrollArea aria-label="Notes">
        <p>Item one</p>
        <p>Item two</p>
      </ScrollArea>,
    );
    const vp = viewport();
    expect(vp).toHaveAttribute('tabindex', '0');
    expect(vp).toHaveTextContent('Item one');
    expect(root()).toHaveAttribute('aria-label', 'Notes');
    expect(root()).toHaveAttribute('data-orientation', 'vertical');
  });

  it('caps the viewport height with maxHeight when vertical', () => {
    render(
      <ScrollArea maxHeight={200}>
        <p>Tall content</p>
      </ScrollArea>,
    );
    expect(root()).toHaveStyle({ maxHeight: '200px' });
  });

  it('caps the width with maxHeight when horizontal', () => {
    render(
      <ScrollArea orientation="horizontal" maxHeight={300}>
        <p>Wide content</p>
      </ScrollArea>,
    );
    expect(root()).toHaveStyle({ maxWidth: '300px' });
    expect(root()).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('fades only the end edge at the top of scrollable vertical content', () => {
    render(
      <ScrollArea maxHeight={100}>
        <p>Overflowing</p>
      </ScrollArea>,
    );
    const vp = viewport();
    stubMetrics(vp, { scrollHeight: 400, clientHeight: 100, scrollTop: 0 });
    fireEvent.scroll(vp);
    expect(root()).not.toHaveAttribute('data-fade-start');
    expect(root()).toHaveAttribute('data-fade-end', 'true');
  });

  it('fades both edges when scrolled to the middle', () => {
    render(
      <ScrollArea maxHeight={100}>
        <p>Overflowing</p>
      </ScrollArea>,
    );
    const vp = viewport();
    stubMetrics(vp, { scrollHeight: 400, clientHeight: 100, scrollTop: 150 });
    fireEvent.scroll(vp);
    expect(root()).toHaveAttribute('data-fade-start', 'true');
    expect(root()).toHaveAttribute('data-fade-end', 'true');
  });

  it('clears the end fade at the bottom', () => {
    render(
      <ScrollArea maxHeight={100}>
        <p>Overflowing</p>
      </ScrollArea>,
    );
    const vp = viewport();
    stubMetrics(vp, { scrollHeight: 400, clientHeight: 100, scrollTop: 300 });
    fireEvent.scroll(vp);
    expect(root()).toHaveAttribute('data-fade-start', 'true');
    expect(root()).not.toHaveAttribute('data-fade-end');
  });

  it('tracks the horizontal axis when orientation is horizontal', () => {
    render(
      <ScrollArea orientation="horizontal" maxHeight={100}>
        <p>Wide</p>
      </ScrollArea>,
    );
    const vp = viewport();
    stubMetrics(vp, { scrollWidth: 500, clientWidth: 100, scrollLeft: 200 });
    fireEvent.scroll(vp);
    expect(root()).toHaveAttribute('data-fade-start', 'true');
    expect(root()).toHaveAttribute('data-fade-end', 'true');
  });

  it('has no axe violations', async () => {
    render(
      <ScrollArea aria-label="Release notes" maxHeight={160}>
        <p>Some scrollable content that overflows its bounds.</p>
      </ScrollArea>,
    );
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
