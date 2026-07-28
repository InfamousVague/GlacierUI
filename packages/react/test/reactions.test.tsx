import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import type { Reaction } from '@glacier/logic';
// Direct file paths: these components are not exported from @glacier/react yet.
import { ReactionPill } from '../src/atoms/inputs/ReactionPill/ReactionPill.tsx';
import { ReactionBar } from '../src/molecules/ReactionBar/ReactionBar.tsx';
import { ReactionPicker } from '../src/molecules/ReactionPicker/ReactionPicker.tsx';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };
const r = (emoji: string, actorId: string): Reaction => ({ emoji, actorId });

describe('ReactionPill', () => {
  it('names itself with the glyph, the tally, and the viewer state — not just the emoji', () => {
    render(<ReactionPill emoji="👍" count={3} reactedByViewer />);
    expect(screen.getByRole('button', { name: '👍, 3 reactions, you reacted' })).toBeInTheDocument();
  });

  it('uses the singular template at a count of one', () => {
    render(<ReactionPill emoji="🎉" count={1} />);
    expect(screen.getByRole('button', { name: '🎉, 1 reaction' })).toBeInTheDocument();
  });

  it('reports the viewer state through aria-pressed', () => {
    const { rerender } = render(<ReactionPill emoji="👍" count={1} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    rerender(<ReactionPill emoji="👍" count={2} reactedByViewer />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('asks for the opposite of what the viewer already did', () => {
    const onToggle = vi.fn();
    const { rerender } = render(<ReactionPill emoji="👍" count={1} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenLastCalledWith('👍', 'add');
    rerender(<ReactionPill emoji="👍" count={2} reactedByViewer onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenLastCalledWith('👍', 'remove');
  });

  it('shows the glyph and count visually but hides both from assistive tech', () => {
    render(<ReactionPill emoji="👍" count={3} />);
    // ...otherwise the pill reads as "👍 3, 👍, 3 reactions"
    expect(screen.getByText('3').closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole('button')).toHaveAccessibleName('👍, 3 reactions');
  });

  it('stays enabled and pressable while a toggle is in flight', () => {
    const onToggle = vi.fn();
    render(<ReactionPill emoji="👍" count={2} reactedByViewer pending onToggle={onToggle} />);
    const pill = screen.getByRole('button');
    // Emphasis only: disabling the control under a finger drops focus and
    // strands a keyboard user mid-row.
    expect(pill).toHaveAttribute('data-pending', 'true');
    expect(pill).not.toBeDisabled();
    // aria-pressed shows the OPTIMISTIC outcome, not the stale truth
    expect(pill).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(pill);
    expect(onToggle).toHaveBeenCalled();
  });

  it('takes an overridden name and translated templates', () => {
    const { rerender } = render(<ReactionPill emoji="👍" count={2} label="Two people agreed" />);
    expect(screen.getByRole('button', { name: 'Two people agreed' })).toBeInTheDocument();
    rerender(<ReactionPill emoji="👍" count={2} labels={{ other: '{emoji} : {count} réactions' }} />);
    expect(screen.getByRole('button', { name: '👍 : 2 réactions' })).toBeInTheDocument();
  });
});

describe('ReactionBar', () => {
  it('renders nothing at all — not an empty box — when there is nothing to show', () => {
    const { container } = render(<ReactionBar reactions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('tallies through the shared aggregate and keeps first-appearance order, not count order', () => {
    render(<ReactionBar reactions={[r('🎉', 'a'), r('👍', 'b'), r('👍', 'c')]} />);
    const names = screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'));
    // 🎉 has one reaction and 👍 has two, and 🎉 still comes first: a bar
    // sorted by count reshuffles under a finger already moving toward a chip.
    expect(names).toEqual(['🎉, 1 reaction', '👍, 2 reactions']);
  });

  it('marks the viewer’s own reaction as theirs', () => {
    render(<ReactionBar reactions={[r('👍', 'me'), r('👍', 'a')]} viewerId="me" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('is one toolbar with one tab stop, and the arrows move between pills', () => {
    render(<ReactionBar reactions={[r('👍', 'a'), r('🎉', 'b'), r('❤️', 'c')]} />);
    const bar = screen.getByRole('toolbar', { name: 'Reactions' });
    const pills = screen.getAllByRole('button');
    expect(pills.map((p) => p.tabIndex)).toEqual([0, -1, -1]);

    fireEvent.keyDown(bar, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(pills[1]);
    fireEvent.keyDown(bar, { key: 'End' });
    expect(document.activeElement).toBe(pills[2]);
    // wraps rather than dead-ending
    fireEvent.keyDown(bar, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(pills[0]);
  });

  it('leaves Enter and Space alone so the focused pill stays pressable', () => {
    const onToggle = vi.fn();
    render(<ReactionBar reactions={[r('👍', 'a')]} onToggle={onToggle} />);
    const bar = screen.getByRole('toolbar');
    const enter = fireEvent.keyDown(bar, { key: 'Enter' });
    // fireEvent returns false when the handler called preventDefault
    expect(enter).toBe(true);
  });

  it('folds the tail past the cap into a +N chip and expands in place', () => {
    const reactions = ['a', 'b', 'c', 'd', 'e'].map((e, i) => r(e, `u${i}`));
    render(<ReactionBar reactions={reactions} cap={3} />);
    // cap 3 keeps two pills and gives the third slot to the chip
    expect(screen.getAllByRole('button')).toHaveLength(3);
    const overflow = screen.getByRole('button', { name: 'Show 3 more reactions' });
    fireEvent.click(overflow);
    expect(screen.getAllByRole('button')).toHaveLength(5);
    expect(screen.queryByRole('button', { name: /more reactions/ })).toBeNull();
  });

  it('offers the add chip only once a message already carries a reaction', () => {
    const onAdd = vi.fn();
    const { rerender, container } = render(<ReactionBar reactions={[]} onAdd={onAdd} />);
    // On a bare message the MessageActions cluster owns the react affordance.
    expect(container.firstChild).toBeNull();

    rerender(<ReactionBar reactions={[r('👍', 'a')]} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add a reaction' }));
    expect(onAdd).toHaveBeenCalledTimes(1);

    rerender(<ReactionBar reactions={[]} add="always" onAdd={onAdd} />);
    expect(screen.getByRole('button', { name: 'Add a reaction' })).toBeInTheDocument();
  });

  it('never renders the add chip without a handler to run', () => {
    render(<ReactionBar reactions={[r('👍', 'a')]} add="always" />);
    expect(screen.queryByRole('button', { name: 'Add a reaction' })).toBeNull();
  });

  it('folds an in-flight add in at the end and paints it pending', () => {
    render(
      <ReactionBar
        reactions={[r('👍', 'a')]}
        viewerId="me"
        pending={[{ emoji: '🚀', intent: 'add' }]}
      />,
    );
    const pills = screen.getAllByRole('button');
    expect(pills[1]).toHaveAttribute('aria-label', '🚀, 1 reaction, you reacted');
    expect(pills[1]).toHaveAttribute('data-pending', 'true');
    expect(pills[0]).not.toHaveAttribute('data-pending');
  });

  it('resolves actor ids to names for the hover list', () => {
    render(<ReactionBar reactions={[r('👍', 'u1')]} resolveActor={() => 'Ana'} />);
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Ana');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <ReactionBar reactions={[r('👍', 'a'), r('🎉', 'b')]} viewerId="a" onAdd={() => undefined} />,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('ReactionPicker', () => {
  it('names every cell by its emoji name, never the glyph', () => {
    render(<ReactionPicker />);
    // a screen reader cannot read a picture and voice control cannot say one
    expect(screen.getAllByRole('button', { name: 'thumbs up' })).not.toHaveLength(0);
    expect(screen.queryByRole('button', { name: '👍' })).toBeNull();
  });

  it('opens on the frequent row and drops it the moment a query exists', () => {
    render(<ReactionPicker />);
    expect(screen.getByRole('group', { name: 'Frequently used' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'fire' } });
    expect(screen.queryByRole('group', { name: 'Frequently used' })).toBeNull();
    expect(screen.getAllByRole('button', { name: 'fire' })).toHaveLength(1);
  });

  it('shows one quiet line when a query matches nothing', () => {
    render(<ReactionPicker />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzzz' } });
    expect(screen.getByText('No emoji found')).toBeInTheDocument();
    // one line, not an illustration: a large empty state pushes the search
    // field off a phone screen, and retyping is the fix
    expect(screen.queryByRole('group', { name: 'All emoji' })).toBeNull();
  });

  it('reports the chosen glyph', () => {
    const onSelect = vi.fn();
    render(<ReactionPicker onSelect={onSelect} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'party popper' })[0] as HTMLElement);
    expect(onSelect).toHaveBeenCalledWith('🎉');
  });

  it('marks glyphs the viewer already used on this message', () => {
    render(<ReactionPicker reacted={['👍']} />);
    expect(screen.getAllByRole('button', { name: 'thumbs up' })[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('walks the grid a full row at a time, and the row and grid rove separately', () => {
    render(<ReactionPicker columns={4} emojis={Array.from({ length: 12 }, (_, i) => ({ emoji: `e${i}`, name: `n${i}` }))} frequent={[]} />);
    const grid = screen.getByRole('group', { name: 'All emoji' });
    const cells = screen.getAllByRole('button');
    expect(cells[0]?.tabIndex).toBe(0);
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(cells[4]);
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cells[5]);
    // clamps rather than wrapping vertically
    fireEvent.keyDown(grid, { key: 'ArrowUp' });
    fireEvent.keyDown(grid, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(cells[1]);
  });

  it('takes a caller-supplied emoji set, since the kit does not own the table', () => {
    render(<ReactionPicker emojis={[{ emoji: '🦕', name: 'dinosaur', keywords: ['rawr'] }]} frequent={[]} />);
    expect(screen.getByRole('button', { name: 'dinosaur' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'rawr' } });
    expect(screen.getByRole('button', { name: 'dinosaur' })).toBeInTheDocument();
  });

  it('holds its geometry while loading', () => {
    const { container } = render(<ReactionPicker skeleton />);
    expect(container.querySelectorAll('[data-skeleton]').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<ReactionPicker reacted={['👍']} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
