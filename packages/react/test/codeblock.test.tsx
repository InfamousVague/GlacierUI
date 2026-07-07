import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { CodeBlock } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('CodeBlock', () => {
  it('renders the code text', () => {
    render(<CodeBlock code="const answer = 42;" language="tsx" />);
    expect(screen.getByText('const answer = 42;')).toBeInTheDocument();
  });

  it('renders the copy button', () => {
    render(<CodeBlock code="npm install" />);
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('renders a skeleton placeholder', () => {
    const { container } = render(<CodeBlock code="ignored" skeleton />);
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <CodeBlock code="const answer = 42;" language="tsx" filename="answer.ts" />,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
