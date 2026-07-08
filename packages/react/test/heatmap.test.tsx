import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import { Heatmap } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const points = [
  { date: '2026-01-01', value: 0 },
  { date: '2026-01-02', value: 5 },
  { date: '2026-01-03', value: 10 },
];

describe('Heatmap', () => {
  it('renders as a named role="img" with one cell per value', () => {
    render(<Heatmap aria-label="Contributions" data={points} rows={3} />);
    const img = screen.getByRole('img', { name: 'Contributions' });
    expect(img).toBeInTheDocument();
    // three points → three titled cells
    expect(within(img).getByTitle('2026-01-01: 0')).toBeInTheDocument();
    expect(within(img).getByTitle('2026-01-02: 5')).toBeInTheDocument();
    expect(within(img).getByTitle('2026-01-03: 10')).toBeInTheDocument();
  });

  it('buckets values onto levels: zero is empty, the max is the top level', () => {
    render(<Heatmap aria-label="Grid" data={points} rows={3} levels={5} />);
    const img = screen.getByRole('img');
    expect(within(img).getByTitle('2026-01-01: 0')).toHaveAttribute('data-level', '0');
    // 10 is the data max → top step (levels - 1 = 4)
    expect(within(img).getByTitle('2026-01-03: 10')).toHaveAttribute('data-level', '4');
    // 5 of 10 lands in the middle of the ramp, strictly between empty and top
    const mid = within(img).getByTitle('2026-01-02: 5');
    const midLevel = Number(mid.getAttribute('data-level'));
    expect(midLevel).toBeGreaterThan(0);
    expect(midLevel).toBeLessThan(4);
  });

  it('accepts a 2D array, titling cells by value alone', () => {
    render(
      <Heatmap
        aria-label="Matrix"
        data={[
          [1, 3],
          [6, 2],
        ]}
      />,
    );
    const img = screen.getByRole('img');
    // four numeric cells, titled by value with no date prefix
    expect(within(img).getByTitle('1')).toBeInTheDocument();
    expect(within(img).getByTitle('3')).toBeInTheDocument();
    expect(within(img).getByTitle('2')).toBeInTheDocument();
    // 6 is the data max → top step
    expect(within(img).getByTitle('6')).toHaveAttribute('data-level', '4');
  });

  it('shows a less→more legend that describes the grid when requested', () => {
    render(<Heatmap aria-label="Contributions" data={points} rows={3} legend />);
    const img = screen.getByRole('img', { name: 'Contributions' });
    expect(img).toHaveAttribute('aria-describedby');
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('omits the legend by default', () => {
    render(<Heatmap aria-label="Contributions" data={points} rows={3} />);
    expect(screen.queryByText('Less')).not.toBeInTheDocument();
    expect(screen.getByRole('img')).not.toHaveAttribute('aria-describedby');
  });

  it('renders nothing to plot for empty data without crashing', () => {
    render(<Heatmap aria-label="Empty" data={[]} />);
    expect(screen.getByRole('img', { name: 'Empty' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    render(<Heatmap aria-label="Contributions in the last weeks" data={points} rows={3} legend />);
    await screen.findByRole('img');
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
