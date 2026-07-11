import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Steps } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Steps', () => {
  it('renders one dot per step with a translated position label', () => {
    render(<Steps count={5} active={2} />);
    const group = screen.getByRole('group', { name: 'Step 3 of 5' });
    expect(group.children).toHaveLength(5);
  });

  describe('connected variant', () => {
    it('joins markers with one connector between each pair', () => {
      render(<Steps variant="connected" count={4} active={0} />);
      const group = screen.getByRole('group', { name: 'Step 1 of 4' });
      // 4 markers + 3 connectors
      expect(group.children).toHaveLength(7);
    });

    it('draws a check on every completed step', () => {
      const { container } = render(<Steps variant="connected" count={5} active={3} />);
      expect(container.querySelectorAll('svg')).toHaveLength(3);
    });

    it('numbers the current and upcoming markers when numbered', () => {
      render(<Steps variant="connected" numbered count={4} active={2} />);
      // steps 1 and 2 are completed checks; 3 is current, 4 upcoming
      expect(screen.queryByText('1')).toBeNull();
      expect(screen.queryByText('2')).toBeNull();
      expect(screen.getByText('3')).toBeDefined();
      expect(screen.getByText('4')).toBeDefined();
    });

    it('shows no numerals when not numbered', () => {
      render(<Steps variant="connected" count={4} active={2} />);
      expect(screen.queryByText('3')).toBeNull();
      expect(screen.queryByText('4')).toBeNull();
    });

    it('skeleton keeps the marker and connector footprint', () => {
      const { container } = render(<Steps variant="connected" count={4} skeleton />);
      expect(screen.queryByRole('group')).toBeNull();
      // 4 marker bones + 3 connector bones
      expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(7);
    });
  });

  it('has no axe violations in either variant', async () => {
    render(
      <>
        <Steps count={4} active={1} />
        <Steps variant="connected" numbered count={4} active={1} />
      </>,
    );
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
