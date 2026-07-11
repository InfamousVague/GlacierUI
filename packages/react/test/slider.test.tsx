import { describe, expect, it, vi } from 'vitest';
import { Size } from '@glacier/react';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { HapticsProvider, Slider, Switch } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Slider', () => {
  it('renders a native range with the given bounds and reports changes', () => {
    let latest: number | null = null;
    render(
      <Slider aria-label="Volume" min={0} max={10} step={0.5} defaultValue={4} onValueChange={(v) => (latest = v)} />,
    );
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '10');
    expect(slider).toHaveValue('4');
    fireEvent.change(slider, { target: { value: '7.5' } });
    expect(latest).toBe(7.5);
    expect(slider).toHaveValue('7.5');
  });

  it('supports controlled usage', () => {
    const { rerender } = render(<Slider aria-label="Scale" value={1} min={0} max={2} step={0.05} />);
    const slider = screen.getByRole('slider', { name: 'Scale' });
    fireEvent.change(slider, { target: { value: '2' } });
    expect(slider).toHaveValue('1');
    rerender(<Slider aria-label="Scale" value={1.5} min={0} max={2} step={0.05} />);
    expect(slider).toHaveValue('1.5');
  });

  it('computes the fill percentage from the value', () => {
    render(<Slider aria-label="Fill" min={0} max={200} defaultValue={50} />);
    const slider = screen.getByRole('slider', { name: 'Fill' });
    expect(slider.style.getPropertyValue('--slider-fill')).toBe('25%');
  });

  it('marks the vertical orientation and still reports changes', () => {
    let latest: number | null = null;
    render(
      <Slider aria-label="Volume" orientation="vertical" defaultValue={20} onValueChange={(v) => (latest = v)} />,
    );
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider).toHaveAttribute('aria-orientation', 'vertical');
    fireEvent.change(slider, { target: { value: '80' } });
    expect(latest).toBe(80);
    expect(slider.style.getPropertyValue('--slider-fill')).toBe('80%');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Slider aria-label="Volume" defaultValue={30} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });

  it('has no axe violations when vertical', async () => {
    const { container } = render(<Slider aria-label="Volume" orientation="vertical" defaultValue={30} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('Slider haptics', () => {
  // Render inside a HapticsProvider with a stub engine so the kit's fire calls
  // are observable without a real motor. The slider is uncontrolled so each
  // change event moves the value the way a drag or arrow key would.
  function setup(props: Partial<Parameters<typeof Slider>[0]> = {}) {
    const impl = vi.fn();
    render(
      <HapticsProvider enabled impl={impl}>
        <Slider aria-label="Level" defaultValue={42} {...props} />
      </HapticsProvider>,
    );
    return { impl, slider: screen.getByRole('slider', { name: 'Level' }) };
  }

  it('ticks selection on a bucket crossing but not within a bucket', () => {
    const { impl, slider } = setup();
    fireEvent.change(slider, { target: { value: '44' } }); // still the 40s bucket
    expect(impl).not.toHaveBeenCalled();
    fireEvent.change(slider, { target: { value: '55' } }); // crosses into the 50s
    expect(impl).toHaveBeenCalledTimes(1);
    expect(impl).toHaveBeenLastCalledWith('selection');
    fireEvent.change(slider, { target: { value: '57' } }); // same bucket, silent
    expect(impl).toHaveBeenCalledTimes(1);
  });

  it('honors a custom hapticStep bucket width', () => {
    const { impl, slider } = setup({ hapticStep: 25, defaultValue: 10 });
    fireEvent.change(slider, { target: { value: '24' } }); // still 0-25
    expect(impl).not.toHaveBeenCalled();
    fireEvent.change(slider, { target: { value: '26' } }); // crosses 25
    expect(impl).toHaveBeenCalledTimes(1);
    expect(impl).toHaveBeenLastCalledWith('selection');
  });

  it('bumps medium once at an edge and re-arms after leaving it', () => {
    const { impl, slider } = setup({ defaultValue: 95 });
    fireEvent.change(slider, { target: { value: '100' } });
    expect(impl).toHaveBeenCalledTimes(1); // one medium, no selection stacked on it
    expect(impl).toHaveBeenLastCalledWith('medium');
    fireEvent.change(slider, { target: { value: '90' } }); // leaves the edge, re-arms
    fireEvent.change(slider, { target: { value: '100' } });
    expect(impl).toHaveBeenLastCalledWith('medium');
    expect(impl.mock.calls.filter(([kind]) => kind === 'medium')).toHaveLength(2);
  });

  it('bumps medium at min too', () => {
    const { impl, slider } = setup({ defaultValue: 8 });
    fireEvent.change(slider, { target: { value: '0' } });
    expect(impl).toHaveBeenCalledTimes(1);
    expect(impl).toHaveBeenLastCalledWith('medium');
  });

  it('hapticStep of 0 or less disables the ticks', () => {
    const { impl, slider } = setup({ hapticStep: 0 });
    fireEvent.change(slider, { target: { value: '90' } }); // would cross several default buckets
    expect(impl).not.toHaveBeenCalled();
  });

  it('data-haptic="none" silences ticks and edge bumps', () => {
    const { impl, slider } = setup({ 'data-haptic': 'none' });
    fireEvent.change(slider, { target: { value: '75' } });
    fireEvent.change(slider, { target: { value: '100' } });
    expect(impl).not.toHaveBeenCalled();
  });

  it('does not fire from prop-driven value changes', () => {
    const impl = vi.fn();
    const { rerender } = render(
      <HapticsProvider enabled impl={impl}>
        <Slider aria-label="Level" value={10} />
      </HapticsProvider>,
    );
    rerender(
      <HapticsProvider enabled impl={impl}>
        <Slider aria-label="Level" value={90} />
      </HapticsProvider>,
    );
    expect(impl).not.toHaveBeenCalled();
  });
});

describe('Switch sizes', () => {
  it('renders the small variant without changing semantics', () => {
    render(<Switch label="Wi-Fi" size={Size.Small} defaultChecked />);
    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).toBeChecked();
  });
});
