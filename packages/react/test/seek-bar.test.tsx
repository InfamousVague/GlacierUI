import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { SeekBar } from '../src/index.ts';
import type { SeekBarShape } from '../src/index.ts';

const SHAPES: SeekBarShape[] = ['line', 'wave', 'waveform', 'swell', 'zigzag', 'spikes', 'bars', 'mirror'];
const LEVELS = [0.2, 0.8, 0.4, 1, 0.1];

/** jsdom gives every element a zero-size box, so pointer math needs a real one. */
function stubWidth(el: HTMLElement, width = 200, left = 0) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    width,
    height: 32,
    left,
    right: left + width,
    top: 0,
    bottom: 32,
    x: left,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
}

describe('SeekBar', () => {
  it('exposes the position as a slider, spoken as a formatted time', () => {
    render(<SeekBar duration={174} value={84} aria-label="Seek" />);
    const bar = screen.getByRole('slider', { name: 'Seek' });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '174');
    expect(bar).toHaveAttribute('aria-valuenow', '84');
    // "1:24", not "84"
    expect(bar).toHaveAttribute('aria-valuetext', '1:24');
  });

  it('defaults to the swell: a squiggle that builds, then a flat rail', () => {
    const { container } = render(<SeekBar duration={100} value={50} aria-label="Seek" />);
    expect((container.querySelector('[role="slider"]') as HTMLElement).dataset.shape).toBe('swell');
    const paths = [...container.querySelectorAll('path')];
    const ysOf = (p: Element) =>
      [...(p.getAttribute('d') ?? '').matchAll(/-?[\d.]+ (-?[\d.]+)/g)].map((mm) => Number(mm[1]));
    const spreads = paths.map((p) => Math.max(...ysOf(p)) - Math.min(...ysOf(p))).sort((a, b) => a - b);
    // one run is the flat rail ahead, the other carries the building squiggle
    expect(spreads[0]).toBe(0);
    expect(spreads[1]).toBeGreaterThan(5);
  });

  it('honors a custom formatTime', () => {
    render(<SeekBar duration={174} value={84} formatTime={(s) => `${s} sec`} aria-label="Seek" />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '84 sec');
  });

  it('clamps a value outside the duration', () => {
    const { rerender } = render(<SeekBar duration={100} value={500} aria-label="Seek" />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '100');
    rerender(<SeekBar duration={100} value={-20} aria-label="Seek" />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
  });

  it('survives a zero duration without dividing by it', () => {
    render(<SeekBar duration={0} value={0} aria-label="Seek" />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
  });

  it.each(SHAPES)('%s paints a played and an ahead path', (shape) => {
    const { container } = render(
      <SeekBar duration={100} value={50} shape={shape} levels={LEVELS} aria-label="Seek" />,
    );
    expect(container.querySelectorAll('path')).toHaveLength(2);
  });

  it('drops the played path at the start and the ahead path at the end', () => {
    const { container, rerender } = render(<SeekBar duration={100} value={0} aria-label="Seek" />);
    expect(container.querySelectorAll('path')).toHaveLength(1);
    rerender(<SeekBar duration={100} value={100} aria-label="Seek" />);
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  it('flags the level marks for a butt cap and the waves for a round one', () => {
    const { container, rerender } = render(
      <SeekBar duration={100} value={50} shape="bars" levels={LEVELS} aria-label="Seek" />,
    );
    const bar = () => container.querySelector('[role="slider"]') as HTMLElement;
    expect(bar().dataset.cap).toBe('butt');
    expect(bar().dataset.weight).toBe('bar');
    rerender(<SeekBar duration={100} value={50} shape="wave" aria-label="Seek" />);
    expect(bar().dataset.cap).toBe('round');
    expect(bar().dataset.weight).toBe('rail');
  });

  it('drops the thumb on the mark shapes and keeps it on the waves', () => {
    const thumbs = (shape: SeekBarShape): number => {
      const { container, unmount } = render(
        <SeekBar duration={100} value={50} shape={shape} levels={LEVELS} aria-label="Seek" />,
      );
      // the thumb is the only span the bar renders; the paths live in the svg
      const count = container.querySelectorAll('[role="slider"] > span').length;
      unmount();
      return count;
    };
    for (const shape of ['bars', 'mirror'] as SeekBarShape[]) {
      expect(thumbs(shape)).toBe(0);
    }
    for (const shape of ['line', 'wave', 'waveform', 'swell', 'zigzag', 'spikes'] as SeekBarShape[]) {
      expect(thumbs(shape)).toBe(1);
    }
  });

  it('paints from the tone tokens and ramps only when asked', () => {
    const { container, rerender } = render(
      <SeekBar duration={100} value={50} shape="wave" tone="success" aria-label="Seek" />,
    );
    const bar = () => container.querySelector('[role="slider"]') as HTMLElement;
    const played = () => container.querySelectorAll('path')[1] as SVGPathElement;
    expect(bar().dataset.tone).toBe('success');
    // the flat colour reaches CSS as a token reference, never a literal
    expect(bar().style.getPropertyValue('--seek-from')).toBe('var(--glacier-success-solid)');
    // solid leaves the stroke to the stylesheet, so no paint server is attached
    expect(container.querySelector('linearGradient')).toBeNull();
    expect(played().getAttribute('stroke')).toBeNull();

    rerender(<SeekBar duration={100} value={50} shape="wave" tone="success" fill="blend" aria-label="Seek" />);
    const gradient = container.querySelector('linearGradient');
    expect(gradient).not.toBeNull();
    expect(played().getAttribute('stroke')).toBe(`url(#${gradient?.id})`);
    // the ramp runs along the bar, not across it
    expect(gradient?.getAttribute('x1')).toBe('0');
    expect(gradient?.getAttribute('y1')).toBe(gradient?.getAttribute('y2'));
  });

  it('builds every ramp from tokens, mixing the midpoint in OKLCH', () => {
    const stopsFor = (fill: 'tonal' | 'blend' | 'fade') => {
      const { container, unmount } = render(
        <SeekBar duration={100} value={50} tone="accent" fill={fill} aria-label="Seek" />,
      );
      const colors = [...container.querySelectorAll('stop')].map((s) => s.getAttribute('stop-color') ?? '');
      unmount();
      return colors;
    };

    // in-family: accent's own pair, with a mixed midpoint between them
    expect(stopsFor('tonal')).toEqual([
      'var(--glacier-accent-solid)',
      'color-mix(in oklch, var(--glacier-accent-solid), var(--glacier-accent-text) 50%)',
      'var(--glacier-accent-text)',
    ]);
    // cross-family: the hue actually travels, so the ramp reads as a gradient
    expect(stopsFor('blend')).toEqual([
      'var(--glacier-accent-solid)',
      'color-mix(in oklch, var(--glacier-accent-solid), var(--glacier-success-solid) 50%)',
      'var(--glacier-success-solid)',
    ]);
    // and fade dissolves the tone rather than travelling to another colour
    expect(stopsFor('fade')).toEqual([
      'var(--glacier-accent-solid)',
      'color-mix(in oklch, var(--glacier-accent-solid), transparent 85%)',
    ]);

    // nothing anywhere is a literal colour
    for (const fill of ['tonal', 'blend', 'fade'] as const) {
      for (const c of stopsFor(fill)) expect(c).not.toMatch(/#|rgb\(|oklch\(\s*[\d.]/);
    }
  });

  it('traces the shape while loading, rather than showing a plain bar', () => {
    const { container } = render(
      <SeekBar duration={100} shape="mirror" levels={LEVELS} skeleton aria-label="Seek" />,
    );
    // the placeholder is the shape: a mirror comb, one M/L pair per level,
    // split across the played and ahead runs at the placeholder's playhead
    const pairs = [...container.querySelectorAll('path')].reduce(
      (total, p) => total + ((p.getAttribute('d') || '').match(/M /g)?.length ?? 0),
      0,
    );
    expect(pairs).toBe(LEVELS.length);
    // and it carries the mark shape's own cap, not a generic box
    expect((container.querySelector('[data-skeleton]') as HTMLElement)?.dataset.cap).toBe('butt');
    expect(screen.queryByRole('slider')).toBeNull();
  });

  it('gives each bar its own gradient id, so two never collide', () => {
    const { container } = render(
      <>
        <SeekBar duration={100} value={50} fill="blend" aria-label="A" />
        <SeekBar duration={100} value={50} fill="blend" aria-label="B" />
      </>,
    );
    const ids = [...container.querySelectorAll('linearGradient')].map((g) => g.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('lifts the unplayed rail on request, for raised surfaces', () => {
    const { container, rerender } = render(<SeekBar duration={100} value={50} aria-label="Seek" />);
    const bar = () => container.querySelector('[role="slider"]') as HTMLElement;
    // the default suits the page surface
    expect(bar().dataset.rail).toBe('muted');
    expect(bar().style.getPropertyValue('--seek-rail')).toBe('var(--glacier-segment-track)');

    // contrast lifts it, and its hover lands a step above its own resting colour
    rerender(<SeekBar duration={100} value={50} rail="contrast" aria-label="Seek" />);
    expect(bar().dataset.rail).toBe('contrast');
    expect(bar().style.getPropertyValue('--seek-rail')).toBe('var(--glacier-border-strong)');
    expect(bar().style.getPropertyValue('--seek-rail-hover')).toBe('var(--glacier-text-subtle)');
  });

  it('keeps the waveform out of the accessibility tree', () => {
    const { container } = render(<SeekBar duration={100} value={50} shape="wave" aria-label="Seek" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('seeks to the pressed position', async () => {
    const onValueChange = vi.fn();
    render(<SeekBar duration={100} value={0} onValueChange={onValueChange} aria-label="Seek" />);
    const bar = screen.getByRole('slider');
    stubWidth(bar);
    await userEvent.pointer({ target: bar, keys: '[MouseLeft>]', coords: { clientX: 50, clientY: 16 } });
    // a quarter across a 200px bar over a 100s track
    expect(onValueChange).toHaveBeenCalledWith(25);
  });

  it('reports the released position once through onSeekEnd', async () => {
    const onSeekEnd = vi.fn();
    render(<SeekBar duration={100} defaultValue={0} onSeekEnd={onSeekEnd} aria-label="Seek" />);
    const bar = screen.getByRole('slider');
    stubWidth(bar);
    await userEvent.pointer([
      { target: bar, keys: '[MouseLeft>]', coords: { clientX: 20, clientY: 16 } },
      { target: bar, coords: { clientX: 100, clientY: 16 } },
      { target: bar, keys: '[/MouseLeft]', coords: { clientX: 100, clientY: 16 } },
    ]);
    expect(onSeekEnd).toHaveBeenCalledTimes(1);
    expect(onSeekEnd).toHaveBeenCalledWith(50);
  });

  it('steps with the arrow keys and jumps with Home and End', () => {
    const onValueChange = vi.fn();
    render(
      <SeekBar duration={100} defaultValue={50} step={5} onValueChange={onValueChange} aria-label="Seek" />,
    );
    const bar = screen.getByRole('slider');
    fireEvent.keyDown(bar, { key: 'ArrowRight' });
    expect(onValueChange).toHaveBeenLastCalledWith(55);
    fireEvent.keyDown(bar, { key: 'ArrowLeft' });
    expect(onValueChange).toHaveBeenLastCalledWith(50);
    fireEvent.keyDown(bar, { key: 'PageUp' });
    expect(onValueChange).toHaveBeenLastCalledWith(100);
    fireEvent.keyDown(bar, { key: 'Home' });
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(bar, { key: 'End' });
    expect(onValueChange).toHaveBeenLastCalledWith(100);
  });

  it('commits a keyed seek through onSeekEnd too', () => {
    const onSeekEnd = vi.fn();
    render(<SeekBar duration={100} defaultValue={50} onSeekEnd={onSeekEnd} aria-label="Seek" />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
    expect(onSeekEnd).toHaveBeenCalledWith(55);
  });

  it('does not run past either end of the track', () => {
    const onValueChange = vi.fn();
    render(<SeekBar duration={100} defaultValue={0} onValueChange={onValueChange} aria-label="Seek" />);
    const bar = screen.getByRole('slider');
    fireEvent.keyDown(bar, { key: 'ArrowLeft' });
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(bar, { key: 'End' });
    fireEvent.keyDown(bar, { key: 'ArrowRight' });
    expect(onValueChange).toHaveBeenLastCalledWith(100);
  });

  it('leaves keys it does not handle to the page', () => {
    const onValueChange = vi.fn();
    render(<SeekBar duration={100} defaultValue={50} onValueChange={onValueChange} aria-label="Seek" />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'Tab' });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('ignores pointer and keyboard input while disabled', async () => {
    const onValueChange = vi.fn();
    render(
      <SeekBar duration={100} value={10} onValueChange={onValueChange} disabled aria-label="Seek" />,
    );
    const bar = screen.getByRole('slider');
    stubWidth(bar);
    expect(bar).toHaveAttribute('tabindex', '-1');
    await userEvent.pointer({ target: bar, keys: '[MouseLeft]', coords: { clientX: 100, clientY: 16 } });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('renders a placeholder when skeleton', () => {
    const { container } = render(<SeekBar duration={100} skeleton aria-label="Seek" />);
    expect(container.querySelector('[data-skeleton]')).toBeTruthy();
    expect(screen.queryByRole('slider')).toBeNull();
  });

  it('draws the control at rest while loading: squiggle, flat rail, and a thumb', () => {
    const { container } = render(<SeekBar duration={100} shape="line" skeleton aria-label="Seek" />);
    const paths = [...container.querySelectorAll('path')];
    expect(paths).toHaveLength(2);

    const ysOf = (p: Element) =>
      [...(p.getAttribute('d') ?? '').matchAll(/-?[\d.]+ (-?[\d.]+)/g)].map((mm) => Number(mm[1]));
    const spread = (p: Element) => Math.max(...ysOf(p)) - Math.min(...ysOf(p));
    // one run is flat on the centerline, the other carries the squiggle
    const spreads = paths.map(spread).sort((a, b) => a - b);
    expect(spreads[0]).toBe(0);
    expect(spreads[1]).toBeGreaterThan(5);

    // and the playhead sits between them
    const thumb = container.querySelector('[data-skeleton] > span') as HTMLElement;
    expect(thumb).not.toBeNull();
    expect(thumb.style.left).toBe('50%');
  });

  it('leaves the thumb off a loading mark shape, as when loaded', () => {
    const { container } = render(<SeekBar duration={100} shape="bars" skeleton aria-label="Seek" />);
    expect(container.querySelectorAll('[data-skeleton] > span')).toHaveLength(0);
  });

  it('has no axe violations across the shapes', async () => {
    const { container } = render(
      <>
        {SHAPES.map((shape) => (
          <SeekBar key={shape} duration={100} value={40} shape={shape} levels={LEVELS} aria-label={`Seek ${shape}`} />
        ))}
      </>,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
