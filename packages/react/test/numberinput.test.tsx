import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { HapticsProvider, NumberInput } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('NumberInput', () => {
  it('increments and decrements via the buttons and reports changes', () => {
    let latest: number | null = null;
    render(<NumberInput aria-label="Quantity" defaultValue={5} onValueChange={(v) => (latest = v)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(latest).toBe(6);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(latest).toBe(5);
  });

  it('clamps to max and disables the increase button at the bound', () => {
    let latest: number | null = null;
    render(
      <NumberInput aria-label="Quantity" defaultValue={9} max={10} onValueChange={(v) => (latest = v)} />,
    );
    const increase = screen.getByRole('button', { name: 'Increase' });
    fireEvent.click(increase);
    expect(latest).toBe(10);
    expect(increase).toBeDisabled();
  });

  it('supports controlled usage', () => {
    const { rerender } = render(<NumberInput aria-label="Count" value={2} />);
    const input = screen.getByRole('spinbutton', { name: 'Count' });
    expect(input).toHaveValue(2);
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(input).toHaveValue(2);
    rerender(<NumberInput aria-label="Count" value={4} />);
    expect(input).toHaveValue(4);
  });

  it('renders a skeleton with no interactive control', () => {
    const { container } = render(<NumberInput aria-label="Quantity" defaultValue={5} skeleton />);
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
    expect(screen.queryByRole('spinbutton')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<NumberInput aria-label="Quantity" defaultValue={3} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });

  describe('press-and-hold auto-repeat', () => {
    afterEach(() => vi.useRealTimers());

    it('steps once on press, then accelerates while held, and stops on release', () => {
      vi.useFakeTimers();
      let latest = 0;
      render(<NumberInput aria-label="Quantity" defaultValue={0} onValueChange={(v) => (latest = v)} />);
      const increase = screen.getByRole('button', { name: 'Increase' });

      fireEvent.pointerDown(increase, { button: 0 });
      expect(latest).toBe(1); // immediate step on press

      vi.advanceTimersByTime(400); // HOLD_DELAY: the first auto-repeat fires
      expect(latest).toBe(2);

      vi.advanceTimersByTime(1000); // a burst of accelerating repeats
      const held = latest;
      expect(held).toBeGreaterThan(4);

      fireEvent.pointerUp(increase);
      vi.advanceTimersByTime(2000);
      expect(latest).toBe(held); // release stops the repeat
    });

    it('a quick tap without the hold delay steps exactly once', () => {
      vi.useFakeTimers();
      let latest = 0;
      render(<NumberInput aria-label="Quantity" defaultValue={0} onValueChange={(v) => (latest = v)} />);
      const increase = screen.getByRole('button', { name: 'Increase' });
      fireEvent.pointerDown(increase, { button: 0 });
      fireEvent.pointerUp(increase); // released before HOLD_DELAY
      vi.advanceTimersByTime(2000);
      expect(latest).toBe(1);
    });

    it('stops the hold at a bound instead of looping forever', () => {
      vi.useFakeTimers();
      let latest = 0;
      render(<NumberInput aria-label="Quantity" defaultValue={8} max={10} onValueChange={(v) => (latest = v)} />);
      fireEvent.pointerDown(screen.getByRole('button', { name: 'Increase' }), { button: 0 });
      vi.advanceTimersByTime(5000);
      expect(latest).toBe(10);
    });
  });
});

describe('NumberInput haptics', () => {
  // Render inside a HapticsProvider with a stub engine so the kit's fire calls
  // are observable without a real motor. jsdom pointer events carry no
  // pointerType, so the provider's delegated touch-press haptic stays quiet and
  // only the component's value-change ticks reach the stub.
  function setup(props: Partial<Parameters<typeof NumberInput>[0]> = {}) {
    const impl = vi.fn();
    render(
      <HapticsProvider enabled impl={impl}>
        <NumberInput aria-label="Quantity" defaultValue={5} {...props} />
      </HapticsProvider>,
    );
    return {
      impl,
      increase: screen.getByRole('button', { name: 'Increase' }),
      decrease: screen.getByRole('button', { name: 'Decrease' }),
      input: screen.getByRole('spinbutton', { name: 'Quantity' }),
    };
  }
  afterEach(() => vi.useRealTimers());

  it('ticks selection once per button step', () => {
    const { impl, increase, decrease } = setup();
    fireEvent.click(increase);
    expect(impl).toHaveBeenCalledTimes(1);
    expect(impl).toHaveBeenLastCalledWith('selection');
    fireEvent.click(decrease);
    expect(impl).toHaveBeenCalledTimes(2);
    expect(impl).toHaveBeenLastCalledWith('selection');
  });

  it('ticks selection on every hold-repeat step', () => {
    vi.useFakeTimers();
    let latest = 0;
    const { impl, increase } = setup({ defaultValue: 0, onValueChange: (v: number) => (latest = v) });
    fireEvent.pointerDown(increase, { button: 0 });
    vi.advanceTimersByTime(1400);
    fireEvent.pointerUp(increase);
    expect(latest).toBeGreaterThan(3); // the press plus a burst of repeats
    expect(impl).toHaveBeenCalledTimes(latest); // one tick per committed step
    for (const call of impl.mock.calls) expect(call[0]).toBe('selection');
  });

  it('bumps medium once when a step clamps at the bound', () => {
    const { impl, increase } = setup({ defaultValue: 9, max: 10, step: 2 });
    fireEvent.click(increase); // 9 + 2 clamps to 10
    expect(impl).toHaveBeenCalledTimes(1);
    expect(impl).toHaveBeenLastCalledWith('medium');
  });

  it('a hold that reaches the bound ticks each step and bumps medium once', () => {
    vi.useFakeTimers();
    const { impl, increase } = setup({ defaultValue: 8, max: 10 });
    fireEvent.pointerDown(increase, { button: 0 });
    vi.advanceTimersByTime(5000);
    expect(impl.mock.calls.filter((c) => c[0] === 'selection')).toHaveLength(2); // 9 and 10
    expect(impl.mock.calls.filter((c) => c[0] === 'medium')).toHaveLength(1); // the wall
  });

  it('ticks selection on ArrowUp and ArrowDown', () => {
    const { impl, input } = setup();
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(impl).toHaveBeenCalledTimes(1);
    expect(impl).toHaveBeenLastCalledWith('selection');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(impl).toHaveBeenCalledTimes(2);
    expect(impl).toHaveBeenLastCalledWith('selection');
  });

  it('an arrow pinned at the bound bumps medium once and re-arms after leaving', () => {
    const { impl, input } = setup({ defaultValue: 10, max: 10 });
    fireEvent.keyDown(input, { key: 'ArrowUp' }); // pinned at max
    expect(impl).toHaveBeenCalledTimes(1);
    expect(impl).toHaveBeenLastCalledWith('medium');
    fireEvent.keyDown(input, { key: 'ArrowUp' }); // still pinned: no repeat bump
    expect(impl).toHaveBeenCalledTimes(1);
    // step off the bound (jsdom does not run the native step, so land the
    // change the browser would)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(impl).toHaveBeenLastCalledWith('selection');
    fireEvent.change(input, { target: { value: '9' } });
    fireEvent.keyDown(input, { key: 'ArrowUp' }); // 9 to 10 lands exactly: a plain tick
    expect(impl).toHaveBeenLastCalledWith('selection');
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.keyDown(input, { key: 'ArrowUp' }); // pinned again: the bump re-armed
    expect(impl).toHaveBeenLastCalledWith('medium');
    expect(impl.mock.calls.filter((c) => c[0] === 'medium')).toHaveLength(2);
  });

  it('typed digits are silent and the blur-commit fires one light', () => {
    const { impl, input } = setup();
    fireEvent.change(input, { target: { value: '42' } });
    expect(impl).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(impl).toHaveBeenCalledTimes(1);
    expect(impl).toHaveBeenLastCalledWith('light');
    fireEvent.blur(input); // nothing typed since: silent
    expect(impl).toHaveBeenCalledTimes(1);
  });

  it('a blur with no typed edit is silent', () => {
    const { impl, increase, input } = setup();
    fireEvent.click(increase);
    fireEvent.blur(input);
    expect(impl).toHaveBeenCalledTimes(1); // just the step's selection tick
    expect(impl).toHaveBeenLastCalledWith('selection');
  });

  it('data-haptic="none" silences steps, arrows, and blur commits', () => {
    const { impl, increase, input } = setup({ 'data-haptic': 'none' });
    fireEvent.click(increase);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.blur(input);
    expect(impl).not.toHaveBeenCalled();
  });

  it('the step buttons opt out of the delegated press haptic', () => {
    const { increase, decrease } = setup();
    expect(increase).toHaveAttribute('data-haptic', 'none');
    expect(decrease).toHaveAttribute('data-haptic', 'none');
  });
});
