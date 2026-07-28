import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { TypingIndicator } from '../src/atoms/feedback/TypingIndicator/TypingIndicator.tsx';
import { DeliveryStatus } from '../src/atoms/display/DeliveryStatus/DeliveryStatus.tsx';
import { SystemMessage } from '../src/atoms/display/SystemMessage/SystemMessage.tsx';
import { deliveryStatuses } from '@glacier/logic';

/**
 * motion's reduced-motion detection is a module-level singleton wired to
 * matchMedia at import time, so swapping the stub per test has no effect. The
 * hook itself is stubbed instead, which is the only seam that lets the
 * still-dots path be exercised at all.
 */
const motionPreference = vi.hoisted(() => ({ reduce: false }));
vi.mock('motion/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion/react')>();
  return { ...actual, useReducedMotion: () => motionPreference.reduce };
});

/**
 * The visible sentence, as opposed to the copy of it sitting in the live region.
 * Both are in the DOM on purpose — what is SHOWN and what is ANNOUNCED are
 * deliberately allowed to differ — so a plain text query would match twice.
 */
function visible(text: string): HTMLElement | undefined {
  return screen.getAllByText(text).find((el) => el.getAttribute('role') !== 'status');
}

describe('TypingIndicator', () => {
  it('spells one, two, and many typists from the shared state', () => {
    const { rerender } = render(<TypingIndicator names={['Ana']} />);
    expect(visible('Ana is typing')).toBeTruthy();

    rerender(<TypingIndicator names={['Ana', 'Bo']} />);
    expect(visible('Ana and Bo are typing')).toBeTruthy();

    // Past the row's budget one slot is given back to the summary phrase.
    rerender(<TypingIndicator names={['Ana', 'Bo', 'Cy']} />);
    expect(visible('Ana and 2 others are typing')).toBeTruthy();
  });

  it('drops a typist whose name has not loaded rather than leaving a gap', () => {
    render(<TypingIndicator names={['   ', 'Bo']} />);
    expect(visible('Bo is typing')).toBeTruthy();
  });

  it('renders nothing but the dots when nobody is typing', () => {
    const { container } = render(<TypingIndicator names={[]} />);
    expect(container.textContent).toBe('');
    expect(container.querySelector('[data-typing]')).toBeNull();
  });

  it('announces once at the rising edge and holds the sentence', () => {
    const live = () => screen.getByRole('status').textContent;
    const { rerender } = render(<TypingIndicator names={['Ana']} />);
    expect(live()).toBe('Ana is typing');

    // Bo joining changes what is SHOWN...
    rerender(<TypingIndicator names={['Ana', 'Bo']} />);
    expect(visible('Ana and Bo are typing')).toBeTruthy();
    // ...but not what is announced, so the region does not re-fire.
    expect(live()).toBe('Ana is typing');

    // Stopping empties the region, which announces nothing.
    rerender(<TypingIndicator names={[]} />);
    expect(live()).toBe('');
  });

  it('follows every change under announce="always"', () => {
    const { rerender } = render(<TypingIndicator names={['Ana']} announce="always" />);
    expect(screen.getByRole('status').textContent).toBe('Ana is typing');
    rerender(<TypingIndicator names={['Ana', 'Bo']} announce="always" />);
    expect(screen.getByRole('status').textContent).toBe('Ana and Bo are typing');
  });

  it('stays silent under announce="never" while still showing the row', () => {
    render(<TypingIndicator names={['Ana']} announce="never" />);
    expect(screen.getByRole('status').textContent).toBe('');
    expect(visible('Ana is typing')).toBeTruthy();
  });

  it('keeps the dots out of the accessibility tree', () => {
    const { container } = render(<TypingIndicator names={['Ana']} />);
    const dots = container.querySelector('[aria-hidden="true"]');
    // Three animated elements inside a live region is how a transcript stutters.
    expect(dots).not.toBeNull();
    expect(dots?.childElementCount).toBe(3);
  });

  it('rides the wave by default', () => {
    const { container } = render(<TypingIndicator names={['Ana']} />);
    expect(container.querySelector('[data-static]')).toBeNull();
  });

  it('stops the wave under reduced motion, and still says who is typing', () => {
    motionPreference.reduce = true;
    try {
      const { container } = render(<TypingIndicator names={['Ana']} />);
      // The motion stops; the words, which were always the content, do not.
      expect(container.querySelector('[data-static]')).not.toBeNull();
      expect(visible('Ana is typing')).toBeTruthy();
    } finally {
      motionPreference.reduce = false;
    }
  });

  it('takes an overridden sentence and its own templates', () => {
    const { rerender } = render(<TypingIndicator names={['Ana']} label={<span>tapant</span>} />);
    expect(screen.getByText('tapant')).toBeTruthy();

    rerender(<TypingIndicator names={['Ana']} templates={{ one: '{first} écrit' }} />);
    expect(visible('Ana écrit')).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(<TypingIndicator names={['Ana', 'Bo']} />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});

describe('DeliveryStatus', () => {
  it('draws a different silhouette for every state', () => {
    // The rule the component exists to hold: shape, not colour, is what survives
    // a monochrome display and a colour-blind reader.
    const shapes = new Set<string>();
    for (const status of deliveryStatuses) {
      const { container, unmount } = render(<DeliveryStatus status={status} />);
      shapes.add(container.querySelector('svg')?.innerHTML ?? '');
      unmount();
    }
    expect(shapes.size).toBe(deliveryStatuses.length);
  });

  it('names the state for a screen reader', () => {
    render(<DeliveryStatus status="read" />);
    expect(screen.getByRole('img', { name: 'Read' })).toBeTruthy();
  });

  it('reports, rather than interrupting', () => {
    // A transcript holds hundreds of these; live regions would re-read the
    // conversation every time a receipt landed.
    render(<DeliveryStatus status="delivered" />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('img')).toBeTruthy();
  });

  it('collapses a run to its least advanced state', () => {
    render(<DeliveryStatus statuses={['read', 'failed', 'sent']} />);
    // A stack holding one failed send says failed, not "read".
    expect(screen.getByRole('img', { name: 'Not sent' })).toBeTruthy();
  });

  it('skips messages with no outbound state', () => {
    render(<DeliveryStatus statuses={[undefined, 'sent', undefined]} />);
    expect(screen.getByRole('img', { name: 'Sent' })).toBeTruthy();
  });

  it('renders nothing without a status', () => {
    const { container } = render(<DeliveryStatus />);
    expect(container.firstChild).toBeNull();
  });

  it('goes silent only when told the bubble already speaks', () => {
    const { container } = render(<DeliveryStatus status="sent" decorative />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('takes a translated label', () => {
    render(<DeliveryStatus status="read" labels={{ read: 'Lu' }} />);
    expect(screen.getByRole('img', { name: 'Lu' })).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(<DeliveryStatus status="failed" />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});

describe('SystemMessage', () => {
  it('reads as content, not as a separator', () => {
    // role="separator" would make a screen reader announce "separator" and skip
    // the sentence, which is exactly backwards.
    render(<SystemMessage>Ana joined</SystemMessage>);
    expect(screen.queryByRole('separator')).toBeNull();
    expect(screen.getByText('Ana joined')).toBeTruthy();
  });

  it('is not a live region', () => {
    // It already sits in the transcript at the point it happened; announcing it
    // out of band would read it twice.
    const { container } = render(<SystemMessage kind="join">Ana joined</SystemMessage>);
    expect(container.querySelector('[aria-live]')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('draws a different glyph per kind, all hidden from assistive tech', () => {
    const glyphs = new Set<string>();
    for (const kind of ['info', 'join', 'leave', 'topic', 'call'] as const) {
      const { container, unmount } = render(<SystemMessage kind={kind}>x</SystemMessage>);
      const icon = container.querySelector('svg');
      glyphs.add(icon?.innerHTML ?? '');
      expect(icon?.closest('[aria-hidden="true"]')).not.toBeNull();
      unmount();
    }
    expect(glyphs.size).toBe(5);
  });

  it('drops the glyph when asked, and takes its own', () => {
    const { container, rerender } = render(<SystemMessage icon={null}>Topic changed</SystemMessage>);
    expect(container.querySelector('svg')).toBeNull();
    rerender(<SystemMessage icon={<span data-testid="own" />}>Topic changed</SystemMessage>);
    expect(screen.getByTestId('own')).toBeTruthy();
  });

  it('appends a timestamp inline', () => {
    render(<SystemMessage timestamp="9:41">Call ended</SystemMessage>);
    expect(screen.getByText('Call ended')).toBeTruthy();
    expect(screen.getByText('9:41')).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(<SystemMessage kind="call">Call ended</SystemMessage>);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
