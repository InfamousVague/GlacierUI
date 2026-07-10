import { describe, expect, it, vi } from 'vitest';
import { Size } from '@glacier/react';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Rating } from '../src/index.ts';

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
