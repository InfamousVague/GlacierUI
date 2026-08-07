import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { AudioEqualizer } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

// The chart is drawn in a 320x108 viewBox and stretched to its box, so giving
// the box those exact dimensions makes client coordinates and chart
// coordinates the same numbers - a drag can then be aimed in the units the
// component reasons in.
const CURVE_BOX = { x: 0, y: 0, width: 320, height: 108, top: 0, left: 0, right: 320, bottom: 108 };

const stretchCurve = () => {
  const surface = screen.getByTestId('eq-curve-surface');
  vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({
    ...CURVE_BOX,
    toJSON: () => CURVE_BOX,
  } as DOMRect);
  return surface;
};

/** Where a band's node sits: 8px of padding either side of 8 evenly spread bands. */
const nodeX = (index: number, count = 8) => 8 + (index / (count - 1)) * (320 - 16);

/** The y a gain sits at, for a default -12..+12 chart 12px in from top and bottom. */
const gainY = (gain: number) => 12 + ((12 - gain) / 24) * (108 - 24);

describe('AudioEqualizer', () => {
  it('renders one vertical slider per band', () => {
    render(<AudioEqualizer aria-label="Playback EQ" />);
    expect(screen.getAllByRole('slider')).toHaveLength(8);
    expect(screen.getByRole('slider', { name: '1kHz band' })).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('reports full gain array when one band moves', () => {
    let latest: number[] | null = null;
    render(
      <AudioEqualizer
        aria-label="Playback EQ"
        defaultValue={[0, 0, 0, 0, 0, 0, 0, 0]}
        onValueChange={(next) => {
          latest = next;
        }}
      />,
    );

    fireEvent.change(screen.getByRole('slider', { name: '1kHz band' }), { target: { value: '5' } });
    expect(latest).toEqual([0, 0, 0, 0, 0, 5, 0, 0]);
  });

  it('applies preset gains when a preset is selected', () => {
    render(<AudioEqualizer aria-label="Playback EQ" defaultValue={[0, 0, 0, 0, 0, 0, 0, 0]} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Bass boost' }));
    expect(screen.getByRole('slider', { name: '32Hz band' })).toHaveValue('6');
    expect(screen.getByRole('slider', { name: '4kHz band' })).toHaveValue('-4');
  });

  it('resets all gains to zero', () => {
    render(<AudioEqualizer aria-label="Playback EQ" defaultValue={[3, -2, 1, 4, -1, 5, -3, 2]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    for (const slider of screen.getAllByRole('slider')) expect(slider).toHaveValue('0');
  });

  it('supports controlled values', () => {
    const { rerender } = render(
      <AudioEqualizer aria-label="Playback EQ" value={[0, 0, 0, 0, 0, 0, 0, 0]} />,
    );

    fireEvent.change(screen.getByRole('slider', { name: '1kHz band' }), { target: { value: '7' } });
    expect(screen.getByRole('slider', { name: '1kHz band' })).toHaveValue('0');

    rerender(<AudioEqualizer aria-label="Playback EQ" value={[0, 0, 0, 0, 0, 7, 0, 0]} />);
    expect(screen.getByRole('slider', { name: '1kHz band' })).toHaveValue('7');
  });

  it('renders a visible curve and updates it when a band changes', () => {
    render(<AudioEqualizer aria-label="Playback EQ" defaultValue={[0, 0, 0, 0, 0, 0, 0, 0]} />);

    const curve = screen.getByTestId('eq-curve');
    const before = curve.getAttribute('d');
    fireEvent.change(screen.getByRole('slider', { name: '1kHz band' }), { target: { value: '6' } });
    const after = curve.getAttribute('d');

    expect(before).toBeTruthy();
    expect(after).toBeTruthy();
    expect(after).not.toBe(before);
  });

  it('sets a band by dragging its node on the curve', () => {
    let latest: number[] | null = null;
    render(
      <AudioEqualizer
        aria-label="Playback EQ"
        defaultValue={[0, 0, 0, 0, 0, 0, 0, 0]}
        onValueChange={(next) => {
          latest = next;
        }}
      />,
    );

    const surface = stretchCurve();
    fireEvent.pointerDown(surface, { clientX: nodeX(5), clientY: gainY(6) });
    fireEvent.pointerUp(surface);

    expect(latest).toEqual([0, 0, 0, 0, 0, 6, 0, 0]);
    expect(screen.getByRole('slider', { name: '1kHz band' })).toHaveValue('6');
  });

  it('keeps a drag on the band it started from, however far it travels sideways', () => {
    let latest: number[] | null = null;
    render(
      <AudioEqualizer
        aria-label="Playback EQ"
        defaultValue={[0, 0, 0, 0, 0, 0, 0, 0]}
        onValueChange={(next) => {
          latest = next;
        }}
      />,
    );

    const surface = stretchCurve();
    fireEvent.pointerDown(surface, { clientX: nodeX(0), clientY: gainY(0) });
    // across the whole chart and up: a neighbour is passed over, but the node
    // in hand is still the one that moves
    fireEvent.pointerMove(surface, { clientX: nodeX(7), clientY: gainY(9) });
    fireEvent.pointerUp(surface);

    expect(latest).toEqual([9, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('holds a dragged node inside the gain range', () => {
    render(<AudioEqualizer aria-label="Playback EQ" defaultValue={[0, 0, 0, 0, 0, 0, 0, 0]} />);

    const surface = stretchCurve();
    fireEvent.pointerDown(surface, { clientX: nodeX(0), clientY: -400 });
    fireEvent.pointerUp(surface);

    expect(screen.getByRole('slider', { name: '32Hz band' })).toHaveValue('12');
  });

  it('lands a dragged node on the step its slider can hold', () => {
    let latest: number[] | null = null;
    render(
      <AudioEqualizer
        aria-label="Playback EQ"
        step={3}
        defaultValue={[0, 0, 0, 0, 0, 0, 0, 0]}
        onValueChange={(next) => {
          latest = next;
        }}
      />,
    );

    const surface = stretchCurve();
    // 7dB is not a step from -12 in threes; the nearest one that is, is 6
    fireEvent.pointerDown(surface, { clientX: nodeX(2), clientY: gainY(7) });
    fireEvent.pointerUp(surface);

    expect(latest).toEqual([0, 0, 6, 0, 0, 0, 0, 0]);
  });

  it('drops the preset lock when a node is dragged', () => {
    const onPresetChange = vi.fn();
    render(
      <AudioEqualizer
        aria-label="Playback EQ"
        defaultPreset="bass-boost"
        defaultValue={[6, 5, 4, 2, 0, -2, -3, -4]}
        onPresetChange={onPresetChange}
      />,
    );

    const surface = stretchCurve();
    fireEvent.pointerDown(surface, { clientX: nodeX(3), clientY: gainY(-8) });
    fireEvent.pointerUp(surface);

    expect(onPresetChange).toHaveBeenCalledWith(undefined);
  });

  it('ignores curve drags while disabled', () => {
    const onValueChange = vi.fn();
    render(
      <AudioEqualizer
        aria-label="Playback EQ"
        disabled
        defaultValue={[0, 0, 0, 0, 0, 0, 0, 0]}
        onValueChange={onValueChange}
      />,
    );

    const surface = stretchCurve();
    fireEvent.pointerDown(surface, { clientX: nodeX(4), clientY: gainY(10) });
    fireEvent.pointerUp(surface);

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('leaves the curve out of the accessibility tree, since every band is a slider below it', () => {
    render(<AudioEqualizer aria-label="Playback EQ" />);

    const surface = screen.getByTestId('eq-curve-surface');
    const curve = surface.closest('[aria-hidden="true"]');
    expect(curve).toBeTruthy();
    // nothing on the chart can be tabbed to, so the bands are reached once
    expect(curve!.querySelectorAll('[tabindex], button, input')).toHaveLength(0);
    expect(screen.getAllByRole('slider')).toHaveLength(8);
  });

  it('draws its nodes outside the stretched chart, so they stay round at any width', () => {
    render(<AudioEqualizer aria-label="Playback EQ" />);

    const node = screen.getByTestId('eq-curve-node-0');
    // in the layer, not in the chart: inside the svg it would be scaled by a
    // different factor on each axis and come out an ellipse
    expect(node.closest('svg')).toBeNull();
    expect(node.parentElement).toBe(screen.getByTestId('eq-curve-surface'));
    // placed as a fraction of the box, which is what makes that possible
    expect(node.style.left.endsWith('%')).toBe(true);
    expect(node.style.top.endsWith('%')).toBe(true);
  });

  it('has no axe violations', async () => {
    const { container } = render(<AudioEqualizer aria-label="Playback EQ" />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
