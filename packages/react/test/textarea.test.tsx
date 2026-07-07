import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { Textarea } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Textarea', () => {
  it('renders a textbox and accepts input', () => {
    render(<Textarea aria-label="Notes" />);
    const textbox = screen.getByRole('textbox', { name: 'Notes' });
    expect(textbox.tagName).toBe('TEXTAREA');
    fireEvent.change(textbox, { target: { value: 'hello there' } });
    expect(textbox).toHaveValue('hello there');
  });

  it('renders a skeleton with no textbox', () => {
    const { container } = render(<Textarea aria-label="Notes" skeleton />);
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Textarea aria-label="Notes" />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
