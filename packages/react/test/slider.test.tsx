import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { Slider, Switch } from '../src/index.ts';

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

  it('has no axe violations', async () => {
    const { container } = render(<Slider aria-label="Volume" defaultValue={30} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('Switch sizes', () => {
  it('renders the small variant without changing semantics', () => {
    render(<Switch label="Wi-Fi" size="sm" defaultChecked />);
    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).toBeChecked();
  });
});
