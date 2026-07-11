import { describe, expect, it, vi } from 'vitest';
import { Size } from '@glacier/react';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { HapticsProvider, Rating } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Rating', () => {
  it('renders an interactive radio group of max stars', () => {
    render(<Rating aria-label="Rate" />);
    expect(screen.getByRole('radiogroup', { name: 'Rate' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('honors a custom max', () => {
    render(<Rating max={10} aria-label="Rate" />);
    expect(screen.getAllByRole('radio')).toHaveLength(10);
  });

  it('calls onChange with the picked value', () => {
    const onChange = vi.fn();
    render(<Rating onChange={onChange} aria-label="Rate" />);
    fireEvent.click(screen.getByRole('radio', { name: '4' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('reflects the controlled value as the checked radio', () => {
    render(<Rating value={3} aria-label="Rate" />);
    expect(screen.getByRole('radio', { name: '3' })).toBeChecked();
  });

  it('renders read-only as an image with the value as its label', () => {
    render(<Rating readOnly value={4} aria-label="Rated 4 of 5" />);
    expect(screen.getByRole('img', { name: 'Rated 4 of 5' })).toBeInTheDocument();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  it('disables every star when disabled', () => {
    render(<Rating disabled aria-label="Rate" />);
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
  });

  it('applies the size class', () => {
    const { container } = render(<Rating readOnly value={3} size={Size.Large} aria-label="Rated 3 of 5" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/lg/);
  });

  it('renders one star-shaped bone per star and no controls when skeleton', () => {
    const { container } = render(<Rating skeleton max={4} aria-label="Rate" />);
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(4);
  });

  it('has no axe violations', async () => {
    render(
      <div>
        <Rating defaultValue={4} aria-label="Rate this book" />
        <Rating readOnly value={4.3} aria-label="Rated 4.3 of 5" />
      </div>,
    );
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('Rating haptics', () => {
  // Render inside a HapticsProvider with a stub engine so the kit's fire calls
  // are observable without a real motor. React derives mouseenter/mouseleave
  // from mouseover/mouseout, so the scrub is driven with those.
  function setup(props: Partial<Parameters<typeof Rating>[0]> = {}) {
    const impl = vi.fn();
    render(
      <HapticsProvider enabled impl={impl}>
        <Rating aria-label="Rate" defaultValue={2} {...props} />
      </HapticsProvider>,
    );
    return { impl, group: screen.getByRole('radiogroup', { name: 'Rate' }) };
  }
  const star = (n: number) => screen.getByRole('radio', { name: String(n) }).closest('label')!;

  it('ticks selection once per previewed star change while scrubbing', () => {
    const { impl, group } = setup();
    fireEvent.mouseOver(star(2)); // preview equals the committed value: silent
    expect(impl).not.toHaveBeenCalled();
    fireEvent.mouseOver(star(3));
    expect(impl).toHaveBeenCalledTimes(1);
    expect(impl).toHaveBeenLastCalledWith('selection');
    fireEvent.mouseOver(star(3)); // same star again: no repeat tick
    expect(impl).toHaveBeenCalledTimes(1);
    fireEvent.mouseOver(star(5));
    expect(impl).toHaveBeenCalledTimes(2);
    expect(impl).toHaveBeenLastCalledWith('selection');
    fireEvent.mouseOut(group); // preview falls back to the committed value: silent
    expect(impl).toHaveBeenCalledTimes(2);
  });

  it('fires light on a pointer commit', () => {
    const { impl, group } = setup();
    fireEvent.pointerDown(group);
    fireEvent.click(screen.getByRole('radio', { name: '4' }));
    expect(impl).toHaveBeenCalledTimes(1);
    expect(impl).toHaveBeenLastCalledWith('light');
  });

  it('ticks selection per keyboard arrow change', () => {
    const { impl } = setup();
    // jsdom does not rove native radio selection on arrows, so fire the keydown
    // and then the change the browser would land on the next radio.
    fireEvent.keyDown(screen.getByRole('radio', { name: '2' }), { key: 'ArrowRight' });
    fireEvent.click(screen.getByRole('radio', { name: '3' }));
    expect(impl).toHaveBeenCalledTimes(1);
    expect(impl).toHaveBeenLastCalledWith('selection');
  });

  it('data-haptic="none" silences scrubs and commits', () => {
    const { impl, group } = setup({ 'data-haptic': 'none' });
    fireEvent.mouseOver(star(4));
    fireEvent.pointerDown(group);
    fireEvent.click(screen.getByRole('radio', { name: '5' }));
    expect(impl).not.toHaveBeenCalled();
  });
});
