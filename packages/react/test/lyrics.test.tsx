import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Lyrics } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const LINES = [
  { time: 0, text: 'First line' },
  { time: 12.5, text: 'Second line' },
  { time: 30, text: 'Third line' },
];

describe('Lyrics', () => {
  it('lights the last line at or before the position, and only it', () => {
    render(<Lyrics lines={LINES} position={13} onLineSelect={() => {}} aria-label="Lyrics" />);
    expect(screen.getByRole('button', { name: 'Second line' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: 'First line' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: 'Third line' })).not.toHaveAttribute('aria-current');
  });

  it('moves the light as the position advances past each line time', () => {
    const { rerender } = render(<Lyrics lines={LINES} position={0} onLineSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'First line' })).toHaveAttribute('aria-current', 'true');
    rerender(<Lyrics lines={LINES} position={30} onLineSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Third line' })).toHaveAttribute('aria-current', 'true');
  });

  it('lights nothing before the first line, or without a position at all', () => {
    const { rerender, container } = render(
      <Lyrics lines={[{ time: 5, text: 'Late start' }]} position={2} onLineSelect={() => {}} />,
    );
    expect(container.querySelector('[aria-current]')).toBeNull();
    rerender(<Lyrics lines={LINES} onLineSelect={() => {}} />);
    expect(container.querySelector('[aria-current]')).toBeNull();
  });

  it('hands the pressed line to the host, time and all - the seek', () => {
    const onLineSelect = vi.fn();
    render(<Lyrics lines={LINES} position={0} onLineSelect={onLineSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Third line' }));
    expect(onLineSelect).toHaveBeenCalledWith({ time: 30, text: 'Third line' });
  });

  it('renders plain text, not buttons, when the host cannot seek', () => {
    render(<Lyrics lines={LINES} position={13} />);
    expect(screen.queryByRole('button')).toBeNull();
    // the highlight still works: unsynced hosts pass no position instead
    expect(screen.getByText('Second line')).toHaveAttribute('aria-current', 'true');
  });

  it('shows the empty message when there are no lines', () => {
    render(<Lyrics lines={[]} emptyLabel="Nothing to sing" />);
    expect(screen.getByText('Nothing to sing')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Lyrics lines={LINES} position={13} onLineSelect={() => {}} aria-label="Lyrics" />,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
