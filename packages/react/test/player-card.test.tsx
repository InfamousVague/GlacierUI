import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { PlayerCard } from '../src/index.ts';

describe('PlayerCard', () => {
  it('groups the transport and names it by the title', () => {
    render(<PlayerCard title="Allegro" subtitle="Albinoni" duration={205} />);
    const group = screen.getByRole('group', { name: 'Allegro' });
    expect(group).toBeTruthy();
    expect(screen.getByText('Albinoni')).toBeTruthy();
  });

  it('shows the elapsed and total times, formatted', () => {
    render(<PlayerCard duration={205} value={84} />);
    expect(screen.getByText('1:24')).toBeTruthy();
    expect(screen.getByText('3:25')).toBeTruthy();
  });

  it('rolls the readout over to hours on a long track', () => {
    render(<PlayerCard duration={7325} value={3661} />);
    expect(screen.getByText('1:01:01')).toBeTruthy();
    expect(screen.getByText('2:02:05')).toBeTruthy();
  });

  it('toggles play through one button whose label changes', async () => {
    const onPlayingChange = vi.fn();
    render(<PlayerCard duration={205} onPlayingChange={onPlayingChange} />);
    const button = screen.getByRole('button', { name: 'Play' });
    await userEvent.click(button);
    expect(onPlayingChange).toHaveBeenCalledWith(true);
    // the same button is still there, now labelled Pause - focus survives
    expect(screen.getByRole('button', { name: 'Pause' })).toBe(button);
    await userEvent.click(button);
    expect(onPlayingChange).toHaveBeenLastCalledWith(false);
  });

  it('renders a control only when it can do something', () => {
    const { rerender } = render(<PlayerCard duration={205} />);
    // a bare card is just play/pause
    expect(screen.queryByRole('button', { name: 'Previous track' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Shuffle' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Repeat/ })).toBeNull();

    rerender(
      <PlayerCard
        duration={205}
        onSkipBack={() => undefined}
        onSkipForward={() => undefined}
        onShuffleChange={() => undefined}
        onRepeatChange={() => undefined}
      />,
    );
    expect(screen.getByRole('button', { name: 'Previous track' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next track' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Shuffle' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Repeat/ })).toBeTruthy();
  });

  it('reports shuffle state through aria-pressed', async () => {
    const onShuffleChange = vi.fn();
    render(<PlayerCard duration={205} onShuffleChange={onShuffleChange} />);
    const shuffle = screen.getByRole('button', { name: 'Shuffle' });
    expect(shuffle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(shuffle);
    expect(onShuffleChange).toHaveBeenCalledWith(true);
    expect(shuffle).toHaveAttribute('aria-pressed', 'true');
  });

  it('cycles repeat off, all, one, and names the mode in its label', async () => {
    const onRepeatChange = vi.fn();
    render(<PlayerCard duration={205} onRepeatChange={onRepeatChange} />);
    const repeat = screen.getByRole('button', { name: /Repeat/ });
    // a three-state control cannot be described by pressed alone
    expect(repeat).toHaveAttribute('aria-label', 'Repeat: off');
    await userEvent.click(repeat);
    expect(onRepeatChange).toHaveBeenLastCalledWith('all');
    expect(repeat).toHaveAttribute('aria-label', 'Repeat: all');
    await userEvent.click(repeat);
    expect(onRepeatChange).toHaveBeenLastCalledWith('one');
    await userEvent.click(repeat);
    expect(onRepeatChange).toHaveBeenLastCalledWith('off');
  });

  it('calls the skip handlers', async () => {
    const onSkipBack = vi.fn();
    const onSkipForward = vi.fn();
    render(<PlayerCard duration={205} onSkipBack={onSkipBack} onSkipForward={onSkipForward} />);
    await userEvent.click(screen.getByRole('button', { name: 'Previous track' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next track' }));
    expect(onSkipBack).toHaveBeenCalledTimes(1);
    expect(onSkipForward).toHaveBeenCalledTimes(1);
  });

  it('carries a seek bar that speaks the position', () => {
    render(<PlayerCard duration={205} value={84} />);
    const seek = screen.getByRole('slider', { name: 'Seek' });
    expect(seek).toHaveAttribute('aria-valuemax', '205');
    expect(seek).toHaveAttribute('aria-valuetext', '1:24');
  });

  it('keeps the readouts out of the accessibility tree', () => {
    render(<PlayerCard duration={205} value={84} />);
    // the seek bar already announces the position through aria-valuetext, so
    // the visible clock must sit inside an aria-hidden subtree or a screen
    // reader would hear the time twice
    const elapsed = screen.getByText('1:24');
    expect(elapsed.closest('[aria-hidden="true"]')).not.toBeNull();
    // ...and the bar is still the thing that speaks it
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '1:24');
  });

  it('blocks every control while disabled', async () => {
    const onPlayingChange = vi.fn();
    render(
      <PlayerCard duration={205} disabled onPlayingChange={onPlayingChange} onSkipBack={() => undefined} />,
    );
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(onPlayingChange).not.toHaveBeenCalled();
  });

  it('takes translated labels', () => {
    render(
      <PlayerCard
        duration={205}
        labels={{ play: 'Lecture', seek: 'Rechercher', repeat: (mode) => `Répéter : ${mode}` }}
        onRepeatChange={() => undefined}
      />,
    );
    expect(screen.getByRole('button', { name: 'Lecture' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Rechercher' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Répéter : off' })).toBeTruthy();
  });

  it('loads every part as its own placeholder, keeping the layout', () => {
    const { container } = render(
      <PlayerCard
        duration={205}
        title="Allegro"
        skeleton
        onSkipBack={() => undefined}
        onSkipForward={() => undefined}
        onShuffleChange={() => undefined}
        onRepeatChange={() => undefined}
      />,
    );
    // the seek bar still traces its shape...
    expect(container.querySelector('[data-skeleton]')).toBeTruthy();
    // ...and every control is still there, each a placeholder of its own, so
    // the card holds the exact layout it will settle into
    expect(container.querySelectorAll('[data-skeleton]').length).toBeGreaterThan(3);
    // a placeholder is not a group of controls yet
    expect(screen.queryByRole('group')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    // and the card itself recedes rather than showing as a solid slab
    expect(container.querySelector('[data-skeleton][data-layout]')).toBeTruthy();
  });

  it('lifts the seek rail by default, since the card is a raised surface', () => {
    const { container } = render(<PlayerCard duration={205} />);
    const bar = container.querySelector('[role="slider"]') as HTMLElement;
    // the muted rail is close enough to a card's surface to vanish
    expect(bar.dataset.rail).toBe('contrast');
  });

  it('steps its measurements with density', () => {
    const gapOf = (density: 'compact' | 'comfortable' | 'spacious') => {
      const { container, unmount } = render(
        <PlayerCard duration={205} density={density} />,
      );
      const card = container.querySelector('[data-density]') as HTMLElement;
      const gap = card.style.getPropertyValue('--player-gap');
      unmount();
      return gap;
    };
    // each density resolves to a different step of the space scale
    const gaps = [gapOf('compact'), gapOf('comfortable'), gapOf('spacious')];
    expect(new Set(gaps).size).toBe(3);
    expect(gaps.every((g) => g.startsWith('var(--glacier-space-'))).toBe(true);
  });

  it('places the artwork per layout', () => {
    for (const layout of ['stacked', 'inline', 'square'] as const) {
      const { container, unmount } = render(
        <PlayerCard duration={205} layout={layout} artwork={<img alt="" src="x" />} />,
      );
      const card = container.querySelector('[data-layout]') as HTMLElement;
      expect(card.dataset.layout).toBe(layout);
      expect(container.querySelector('img')).not.toBeNull();
      unmount();
    }
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <PlayerCard
        title="Allegro"
        subtitle="Albinoni"
        duration={205}
        value={84}
        onSkipBack={() => undefined}
        onSkipForward={() => undefined}
        onShuffleChange={() => undefined}
        onRepeatChange={() => undefined}
      />,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
