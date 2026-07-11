import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Sparkline, TimeSeriesChart, TimelineScrubber } from '../src/index.ts';

async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      region: { enabled: false },
      'page-has-heading-one': { enabled: false },
    },
  });
  expect(results.violations).toEqual([]);
}

describe('Sparkline', () => {
  it('is an img named by its label, and holds one mark path per shape', () => {
    const { container, rerender } = render(
      <Sparkline data={[1, 5, 2, 8]} aria-label="CPU, last minute" />,
    );
    expect(screen.getByRole('img', { name: 'CPU, last minute' })).toBeInTheDocument();
    expect(container.querySelectorAll('path')).toHaveLength(1);

    rerender(<Sparkline data={[1, 5, 2, 8]} shape="area" aria-label="CPU, last minute" />);
    expect(container.querySelectorAll('path')).toHaveLength(2); // fill + line

    rerender(<Sparkline data={[1, 5, 2, 8]} shape="bars" aria-label="CPU, last minute" />);
    expect(container.querySelectorAll('path')).toHaveLength(0);
    expect(container.querySelectorAll('span[style]').length).toBeGreaterThanOrEqual(4);
  });

  it('omits the mark below two samples but keeps the box', () => {
    const { container } = render(<Sparkline data={[42]} aria-label="Trend" />);
    expect(screen.getByRole('img', { name: 'Trend' })).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('pins the domain: a flat series at max hugs the top, not the middle', () => {
    const { container } = render(
      <Sparkline data={[100, 100, 100]} min={0} max={100} aria-label="Pegged" />,
    );
    const d = container.querySelector('path')?.getAttribute('d') ?? '';
    // y=0 is the top of the 0-100 viewBox
    expect(d.startsWith('M 0 0')).toBe(true);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} aria-label="Trend" />);
    await expectNoAxeViolations(container);
  });
});

describe('TimelineScrubber', () => {
  const window = { start: 0, end: 60_000 };

  it('exposes slider semantics with the formatted time as valuetext', () => {
    render(
      <TimelineScrubber
        {...window}
        value={30_000}
        formatTime={(t) => `t+${t / 1000}s`}
        aria-label="Recorded activity"
      />,
    );
    const slider = screen.getByRole('slider', { name: 'Recorded activity' });
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '60000');
    expect(slider).toHaveAttribute('aria-valuenow', '30000');
    expect(slider).toHaveAttribute('aria-valuetext', 't+30s');
  });

  it('speaks the live label and presses the live button when pinned to live', () => {
    render(<TimelineScrubber {...window} liveLabel="Live" aria-label="Recorded activity" />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', 'Live');
    expect(screen.getByRole('button', { name: 'Live' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('steps with arrows, jumps Home, and returns to live from End and the button', () => {
    const onChange = vi.fn();
    render(
      <TimelineScrubber {...window} value={30_000} step={1000} onChange={onChange} aria-label="Recorded activity" />,
    );
    const slider = screen.getByRole('slider');

    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(29_000);

    fireEvent.keyDown(slider, { key: 'PageDown' });
    expect(onChange).toHaveBeenLastCalledWith(20_000);

    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith(0);

    fireEvent.keyDown(slider, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith(null);

    fireEvent.click(screen.getByRole('button', { name: 'Live' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('stepping past the trailing edge pins to live', () => {
    const onChange = vi.fn();
    render(
      <TimelineScrubber {...window} value={59_500} step={1000} onChange={onChange} aria-label="Recorded activity" />,
    );
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('ignores input while disabled', () => {
    const onChange = vi.fn();
    render(
      <TimelineScrubber {...window} value={30_000} disabled onChange={onChange} aria-label="Recorded activity" />,
    );
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Live' })).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <TimelineScrubber {...window} value={30_000} aria-label="Recorded activity" />,
    );
    await expectNoAxeViolations(container);
  });
});

describe('TimeSeriesChart', () => {
  const twoSeries = {
    times: [0, 1000, 2000],
    series: [
      { id: 'user', label: 'User', values: [10, 20, 15] },
      { id: 'system', label: 'System', values: [5, 8, 6] },
    ],
  };

  it('is an img named by its label', () => {
    render(<TimeSeriesChart {...twoSeries} aria-label="CPU usage" />);
    expect(screen.getByRole('img', { name: 'CPU usage' })).toBeInTheDocument();
  });

  it('legend appears for two series, toggles with aria-pressed, and never renames survivors', () => {
    render(<TimeSeriesChart {...twoSeries} aria-label="CPU usage" />);
    const user = screen.getByRole('button', { name: 'User' });
    expect(user).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(user);
    expect(user).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('hides the legend for a single series', () => {
    render(
      <TimeSeriesChart
        times={[0, 1000]}
        series={[{ id: 'cpu', label: 'CPU', values: [1, 2] }]}
        aria-label="CPU usage"
      />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows the empty label when there are no samples', () => {
    render(<TimeSeriesChart times={[]} series={[]} emptyLabel="No samples yet" aria-label="CPU usage" />);
    expect(screen.getByText('No samples yet')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<TimeSeriesChart {...twoSeries} aria-label="CPU usage" />);
    await expectNoAxeViolations(container);
  });
});
