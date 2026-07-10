import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
// Imported from the source file until the kit index exports TitleBar.
import { TitleBar } from '../src/structures/TitleBar/TitleBar.tsx';

// region is a page-level landmark concern and the structure is tested in
// isolation, so the landmark rules do not apply here.
const AXE_RULES = {
  region: { enabled: false },
  'page-has-heading-one': { enabled: false },
};

describe('TitleBar', () => {
  it('renders a banner with title, slots, and centered children', () => {
    render(
      <TitleBar
        title="Untitled.md"
        start={<button type="button">Back</button>}
        end={<button type="button">Share</button>}
      >
        <input aria-label="Search" />
      </TitleBar>,
    );
    const bar = screen.getByRole('banner');
    expect(bar).toBeInTheDocument();
    expect(screen.getByText('Untitled.md')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('marks the bar and the title as Tauri drag regions, but not the slots', () => {
    render(
      <TitleBar title="Untitled.md" start={<button type="button">Back</button>}>
        <input aria-label="Search" />
      </TitleBar>,
    );
    expect(screen.getByRole('banner')).toHaveAttribute('data-tauri-drag-region');
    expect(screen.getByText('Untitled.md')).toHaveAttribute('data-tauri-drag-region');
    expect(screen.getByRole('button', { name: 'Back' })).not.toHaveAttribute('data-tauri-drag-region');
    expect(screen.getByRole('textbox', { name: 'Search' })).not.toHaveAttribute('data-tauri-drag-region');
  });

  it('keeps slot controls clickable', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(
      <TitleBar
        title="Untitled.md"
        start={
          <button type="button" onClick={onBack}>
            Back
          </button>
        }
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('defaults to surface and border, and reserves the traffic-light gutter on demand', () => {
    const { container, rerender } = render(<TitleBar trafficLightInset title="Notes" />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar).toHaveAttribute('data-inset');
    expect(bar).toHaveAttribute('data-surface');
    expect(bar).toHaveAttribute('data-border');

    rerender(<TitleBar surface={false} border={false} title="Notes" />);
    expect(bar).not.toHaveAttribute('data-inset');
    expect(bar).not.toHaveAttribute('data-surface');
    expect(bar).not.toHaveAttribute('data-border');
  });

  it('lets the host override the banner role', () => {
    render(<TitleBar role="group" aria-label="Window chrome" title="Notes" />);
    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.getByRole('group', { name: 'Window chrome' })).toBeInTheDocument();
  });

  it('skeleton replaces the content with a silent shimmer in the same geometry', () => {
    const { container } = render(
      <TitleBar skeleton title="Untitled.md" start={<button type="button">Back</button>} trafficLightInset />,
    );
    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByText('Untitled.md')).toBeNull();
    expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(1);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    // geometry attributes survive, and the window stays draggable while loading
    expect(bar).toHaveAttribute('data-inset');
    expect(bar).toHaveAttribute('data-tauri-drag-region');
  });

  it('forwards native props to the root', () => {
    render(<TitleBar data-testid="probe" id="chrome" title="Notes" />);
    const bar = screen.getByTestId('probe');
    expect(bar).toHaveAttribute('id', 'chrome');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <TitleBar
          trafficLightInset
          title="Untitled.md"
          start={
            <button type="button" aria-label="Back">
              {'<'}
            </button>
          }
          end={<button type="button">Share</button>}
        >
          <input aria-label="Search" />
        </TitleBar>
        <TitleBar skeleton />
      </>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
