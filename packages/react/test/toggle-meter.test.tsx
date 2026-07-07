import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { Meter, Toggle } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Toggle', () => {
  it('toggles aria-pressed on click and reports changes', () => {
    let latest: boolean | null = null;
    render(
      <Toggle aria-label="Show password" onPressedChange={(v) => (latest = v)}>
        Reveal
      </Toggle>,
    );
    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(latest).toBe(true);
  });

  it('supports controlled usage', () => {
    const { rerender } = render(<Toggle aria-label="Bold" pressed={false} />);
    const toggle = screen.getByRole('button', { name: 'Bold' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    rerender(<Toggle aria-label="Bold" pressed />);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('still calls a consumer onClick', () => {
    let clicks = 0;
    render(<Toggle aria-label="Pin" onClick={() => clicks++} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pin' }));
    expect(clicks).toBe(1);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Toggle aria-label="Show password">Reveal</Toggle>);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('Meter', () => {
  it('exposes meter semantics and fills segments', () => {
    const { container } = render(<Meter aria-label="Strength" value={2} segments={4} />);
    const meter = screen.getByRole('meter', { name: 'Strength' });
    expect(meter).toHaveAttribute('aria-valuenow', '2');
    expect(meter).toHaveAttribute('aria-valuemax', '4');
    expect(container.querySelectorAll('[data-filled]')).toHaveLength(2);
  });

  it('grades the auto tone by level', () => {
    const { container, rerender } = render(<Meter aria-label="Strength" value={1} segments={4} />);
    const classesAt = () => (container.firstElementChild as HTMLElement).className;
    expect(classesAt()).toContain('danger');
    rerender(<Meter aria-label="Strength" value={2} segments={4} />);
    expect(classesAt()).toContain('warning');
    rerender(<Meter aria-label="Strength" value={4} segments={4} />);
    expect(classesAt()).toContain('success');
  });

  it('respects an explicit tone and a decoupled max', () => {
    const { container } = render(
      <Meter aria-label="Quota" value={50} max={100} segments={5} tone="accent" />,
    );
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuemax', '100');
    // 50/100 across 5 segments rounds to 3 filled
    expect(container.querySelectorAll('[data-filled]')).toHaveLength(3);
    expect((container.firstElementChild as HTMLElement).className).not.toContain('warning');
  });

  it('clamps out-of-range values', () => {
    render(<Meter aria-label="Strength" value={99} segments={4} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '4');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Meter aria-label="Password strength" value={3} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
