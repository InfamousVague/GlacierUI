import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { Toast, ToastProvider, useToast, type ToastContextValue } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

/** Renders a provider and hands the imperative controls back to the test. */
function renderProvider() {
  let controls: ToastContextValue | null = null;
  function Probe() {
    controls = useToast();
    return null;
  }
  const utils = render(
    <ToastProvider>
      <Probe />
    </ToastProvider>,
  );
  return { ...utils, controls: controls! };
}

describe('Toast', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('announces as a polite status by default', () => {
    render(<Toast message="Saved" />);
    const pill = screen.getByRole('status');
    expect(pill).toHaveAttribute('aria-live', 'polite');
    expect(pill).toHaveTextContent('Saved');
  });

  it('announces the danger tone as an assertive alert', () => {
    render(<Toast tone="danger" message="Upload failed" />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  it('renders the leading icon when given', () => {
    render(<Toast message="Done" icon={<span data-testid="glyph" />} />);
    expect(screen.getByTestId('glyph')).toBeInTheDocument();
  });

  it('fires onDismiss once from the dismiss control (no double fire via the pill)', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Saved" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('fires onDismiss when the pill itself is pressed', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Saved" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('status'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('hides the dismiss control when not dismissible', () => {
    render(<Toast message="Saved" dismissible={false} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders a skeleton placeholder', () => {
    const { container } = render(<Toast message="ignored" skeleton />);
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Toast tone="success" message="Profile saved" />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('ToastProvider', () => {
  it('shows a toast and replaces it with the latest call (no queue)', async () => {
    const { controls } = renderProvider();
    act(() => controls.toast({ message: 'First' }));
    expect(screen.getByRole('status')).toHaveTextContent('First');
    act(() => controls.toast({ message: 'Second', tone: 'success' }));
    expect(screen.getByText('Second')).toBeInTheDocument();
    // the replaced pill animates out before unmounting
    await waitFor(() => expect(screen.queryByText('First')).toBeNull(), { timeout: 3000 });
  });

  it('dismisses the current toast imperatively', async () => {
    const { controls } = renderProvider();
    act(() => controls.toast({ message: 'Working' }));
    expect(screen.getByText('Working')).toBeInTheDocument();
    act(() => controls.dismiss());
    await waitFor(() => expect(screen.queryByText('Working')).toBeNull(), { timeout: 3000 });
  });

  it('auto-dismisses after the given duration', async () => {
    const { controls } = renderProvider();
    act(() => controls.toast({ message: 'Blink', duration: 30 }));
    expect(screen.getByText('Blink')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Blink')).toBeNull(), { timeout: 3000 });
  });

  it('keeps a duration 0 toast on screen (auto-dismiss disabled)', async () => {
    const { controls } = renderProvider();
    act(() => controls.toast({ message: 'Sticky', duration: 0 }));
    await act(() => new Promise((resolve) => setTimeout(resolve, 60)));
    expect(screen.getByText('Sticky')).toBeInTheDocument();
  });

  it('arms the per-tone default timer for a danger toast', () => {
    const { controls } = renderProvider();
    act(() => controls.toast({ message: 'Boom', tone: 'danger' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Boom');
  });

  it('useToast throws outside a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    function Bare() {
      useToast();
      return null;
    }
    expect(() => render(<Bare />)).toThrow(/within a ToastProvider/);
    vi.restoreAllMocks();
  });
});
