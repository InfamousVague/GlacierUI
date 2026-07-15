import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Announcements } from '../src/atoms/feedback/Announcements/Announcements.tsx';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };
const items = [
  { id: 'release', label: 'Release', content: 'Version 2.1 is now available.' },
  { id: 'maintenance', label: 'Maintenance', content: 'Scheduled maintenance starts Friday.' },
];

afterEach(() => vi.useRealTimers());

describe('Announcements', () => {
  it('renders the current update in a labelled region', () => {
    render(<Announcements items={items} />);
    expect(screen.getByRole('region', { name: 'Announcements' })).toHaveTextContent('Version 2.1 is now available.');
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });

  it('rotates updates at the configured interval', () => {
    vi.useFakeTimers();
    render(<Announcements items={items} interval={1000} />);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Scheduled maintenance starts Friday.')).toBeInTheDocument();
  });

  it('pauses and resumes automatic rotation', () => {
    vi.useFakeTimers();
    render(<Announcements items={items} interval={1000} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause announcements' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Version 2.1 is now available.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resume announcements' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Scheduled maintenance starts Friday.')).toBeInTheDocument();
  });

  it('lets users move through updates manually', () => {
    render(<Announcements items={items} autoPlay={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next announcement' }));
    expect(screen.getByText('Scheduled maintenance starts Friday.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous announcement' }));
    expect(screen.getByText('Version 2.1 is now available.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Announcements items={items} autoPlay={false} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});