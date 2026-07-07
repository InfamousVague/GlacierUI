import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Avatar } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Avatar', () => {
  it('renders initials from name when there is no src', () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByLabelText('Ada Lovelace')).toHaveTextContent('AL');
  });

  it('renders an img with alt when src is set', () => {
    render(<Avatar src="/ada.png" alt="Ada Lovelace" />);
    const img = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(img).toHaveAttribute('src', '/ada.png');
  });

  it('renders a skeleton placeholder', () => {
    const { container } = render(<Avatar name="Ada Lovelace" skeleton />);
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Avatar name="Ada Lovelace" />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
