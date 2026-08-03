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

  it('opens an update when it is given a select handler', () => {
    const onItemSelect = vi.fn();
    render(<Announcements items={items} autoPlay={false} onItemSelect={onItemSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Version 2.1 is now available./ }));
    expect(onItemSelect).toHaveBeenCalledWith(items[0], 0);
  });

  it('is read-only text without a select handler', () => {
    render(<Announcements items={items} autoPlay={false} />);
    expect(screen.queryByRole('button', { name: /Version 2.1/ })).toBeNull();
  });

  describe('marquee motion', () => {
    it('carries every update at once, and does not step', () => {
      vi.useFakeTimers();
      render(<Announcements items={items} motion="marquee" interval={1000} />);
      act(() => vi.advanceTimersByTime(5000));
      // Both are on the strip the whole time - nothing waits its turn, and no
      // interval swaps them out from under the reader.
      expect(screen.getAllByText('Version 2.1 is now available.').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Scheduled maintenance starts Friday.').length).toBeGreaterThan(0);
      // The step-only controls have nothing to mean here.
      expect(screen.queryByRole('button', { name: 'Next announcement' })).toBeNull();
      expect(screen.queryByText('1 of 2')).toBeNull();
    });

    it('travels for longer when there is more news, rather than faster', () => {
      const { container, rerender } = render(<Announcements items={items} motion="marquee" secondsPerItem={5} />);
      const strip = () => container.querySelector('section') as HTMLElement;
      expect(strip().style.getPropertyValue('--glacier-announcements-travel')).toBe('10s');
      rerender(<Announcements items={[...items, { id: 'third', content: 'And one more thing.' }]} motion="marquee" secondsPerItem={5} />);
      expect(strip().style.getPropertyValue('--glacier-announcements-travel')).toBe('15s');
    });

    it('reaches each update once, though it is painted twice', () => {
      const onItemSelect = vi.fn();
      render(<Announcements items={items} motion="marquee" onItemSelect={onItemSelect} />);
      // The seam-hiding duplicate is inert, so only the real run is reachable:
      // getByRole would throw on a duplicate match.
      fireEvent.click(screen.getByRole('button', { name: /Scheduled maintenance starts Friday./ }));
      expect(onItemSelect).toHaveBeenCalledWith(items[1], 1);
    });

    it('has no axe violations', async () => {
      const { container } = render(<Announcements items={items} motion="marquee" onItemSelect={() => {}} />);
      expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
    });
  });

  it('has no axe violations', async () => {
    const { container } = render(<Announcements items={items} autoPlay={false} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});