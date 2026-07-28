import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { CallControlButton } from '../src/atoms/inputs/CallControlButton/CallControlButton.tsx';
import { CallControlBar } from '../src/molecules/CallControls/CallControlBar.tsx';
import { MicToggle } from '../src/molecules/CallControls/MicToggle.tsx';
import { CallTimer } from '../src/molecules/CallControls/CallTimer.tsx';
import { ConnectionQuality } from '../src/molecules/CallControls/ConnectionQuality.tsx';
import { RecordingIndicator } from '../src/molecules/CallControls/RecordingIndicator.tsx';

afterEach(() => {
  vi.useRealTimers();
});

describe('CallControlButton', () => {
  it('is labelled, and reports nothing about pressing until it is a toggle', () => {
    render(
      <CallControlButton aria-label="Share screen">
        <svg />
      </CallControlButton>,
    );
    const button = screen.getByRole('button', { name: 'Share screen' });
    // An action is not a switch: without `pressed` there is no aria-pressed to
    // mis-announce.
    expect(button).not.toHaveAttribute('aria-pressed');
    expect(button.dataset.state).toBe('idle');
  });

  it('keeps pressed and state independent, because engaged can mean alarming', () => {
    // A speaker that is ON: pressed and reassuring.
    const { rerender } = render(
      <CallControlButton aria-label="Speaker" pressed state="engaged">
        <svg />
      </CallControlButton>,
    );
    let button = screen.getByRole('button', { name: 'Speaker' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button.dataset.state).toBe('engaged');

    // A mic that is MUTED: equally pressed, and alarming.
    rerender(
      <CallControlButton aria-label="Unmute" pressed state="danger">
        <svg />
      </CallControlButton>,
    );
    button = screen.getByRole('button', { name: 'Unmute' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button.dataset.state).toBe('danger');
  });

  it('keeps the caption out of the accessibility tree', () => {
    render(
      <CallControlButton aria-label="Unmute" caption="Mute">
        <svg />
      </CallControlButton>,
    );
    // A caption reading "Mute" must never fight a label reading "Unmute".
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Unmute');
    expect(screen.getByText('Mute').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('blocks activation while disabled', () => {
    const onClick = vi.fn();
    render(
      <CallControlButton aria-label="Leave" state="danger" disabled onClick={onClick}>
        <svg />
      </CallControlButton>,
    );
    const button = screen.getByRole('button', { name: 'Leave' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loads as a circle at the exact diameter', () => {
    const { container } = render(
      <CallControlButton aria-label="Mute" skeleton>
        <svg />
      </CallControlButton>,
    );
    const bone = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(bone).not.toBeNull();
    // Sized from the size ramp, not control-height-*, so the placeholder cannot
    // be a different size from the control it stands in for.
    expect(bone.style.width).toBe('var(--glacier-size-3xl)');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <CallControlButton aria-label="Mute" caption="Mute" pressed={false}>
        <svg />
      </CallControlButton>,
    );
    expect((await axe.run(container)).violations).toEqual([]);
  });
});

describe('CallControlBar', () => {
  it('is a labelled group holding its controls in order', () => {
    render(
      <CallControlBar label="Call controls">
        <CallControlButton aria-label="Mute">
          <svg />
        </CallControlButton>
        <CallControlButton aria-label="Leave" state="danger">
          <svg />
        </CallControlButton>
      </CallControlBar>,
    );
    const group = screen.getByRole('group', { name: 'Call controls' });
    const buttons = screen.getAllByRole('button');
    expect(group).toBeTruthy();
    // The destructive control goes last, furthest from the ones pressed most.
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['Mute', 'Leave']);
  });

  it('leaves every control one Tab away rather than managing a roving tabindex', () => {
    render(
      <CallControlBar label="Call controls">
        <CallControlButton aria-label="Mute">
          <svg />
        </CallControlButton>
        <CallControlButton aria-label="Camera">
          <svg />
        </CallControlButton>
      </CallControlBar>,
    );
    // Not a composite widget: nothing is pulled out of the tab order, so every
    // control is one Tab away in a live call.
    for (const button of screen.getAllByRole('button')) expect(button.tabIndex).toBeGreaterThanOrEqual(0);
  });

  it('does not put a confirmation in front of the leave control', () => {
    // Hanging up is instantaneous, expected, and undone by calling back; a modal
    // thrown over a live call is worse than the mis-tap it prevents. The mis-tap
    // is answered with geometry: danger paint, the end of the row, a 48px target.
    const onLeave = vi.fn();
    render(
      <CallControlBar label="Call controls">
        <CallControlButton aria-label="Leave call" state="danger" onClick={onLeave}>
          <svg />
        </CallControlButton>
      </CallControlBar>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Leave call' }));
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('carries its variant, size, and alignment onto the row', () => {
    const { container } = render(
      <CallControlBar variant="glass" size="lg" align="between">
        <CallControlButton aria-label="Mute">
          <svg />
        </CallControlButton>
      </CallControlBar>,
    );
    const bar = container.querySelector('[data-variant]') as HTMLElement;
    expect(bar.dataset).toMatchObject({ variant: 'glass', size: 'lg', align: 'between' });
  });
});

describe('MicToggle', () => {
  it('paints MUTED as danger, the inverse of a normal toggle', () => {
    const onMutedChange = vi.fn();
    render(<MicToggle onMutedChange={onMutedChange} />);
    const button = screen.getByRole('button', { name: 'Mute' });
    // Live: available, unremarkable.
    expect(button.dataset.state).toBe('idle');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);

    expect(onMutedChange).toHaveBeenCalledWith(true);
    // Muted: pressed AND alarming. Talking into a muted mic is the failure this
    // whole component exists to prevent.
    expect(button.dataset.state).toBe('danger');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('is one button whose label names the ACTION, so focus survives the toggle', () => {
    render(<MicToggle />);
    const button = screen.getByRole('button', { name: 'Mute' });
    fireEvent.click(button);
    // Same element, now offering to unmute — the state is carried by aria-pressed.
    expect(screen.getByRole('button', { name: 'Unmute' })).toBe(button);
  });

  it('draws the level ring only while live, and hides it from screen readers', () => {
    const { container, rerender } = render(<MicToggle level={0.8} />);
    const ring = container.querySelector('[aria-hidden="true"][class*="ring"]') as HTMLElement;
    expect(ring).not.toBeNull();
    // Ring geometry comes from @glacier/logic, so both bindings swell alike.
    expect(ring.style.getPropertyValue('--mic-ring-scale')).not.toBe('');

    rerender(<MicToggle level={0.8} muted />);
    // A halo around a muted mic would be a lie, so there is no ring at all.
    expect(container.querySelector('[class*="ring"]')).toBeNull();
  });

  it('swells the ring with the level', () => {
    const scaleAt = (level: number) => {
      const { container, unmount } = render(<MicToggle level={level} />);
      const ring = container.querySelector('[class*="ring"]') as HTMLElement;
      const scale = Number(ring.style.getPropertyValue('--mic-ring-scale'));
      unmount();
      return scale;
    };
    expect(scaleAt(0.9)).toBeGreaterThan(scaleAt(0.1));
  });

  it('never samples a meter while muted or disabled', () => {
    const meter = vi.fn(() => 0.7);
    vi.useFakeTimers();
    const { rerender } = render(<MicToggle meter={meter} muted />);
    act(() => void vi.advanceTimersByTime(500));
    expect(meter).not.toHaveBeenCalled();

    rerender(<MicToggle meter={meter} disabled />);
    act(() => void vi.advanceTimersByTime(500));
    expect(meter).not.toHaveBeenCalled();

    // ...and does sample once it is live, so the ring is not decorative fiction
    rerender(<MicToggle meter={meter} />);
    act(() => void vi.advanceTimersByTime(500));
    expect(meter).toHaveBeenCalled();
  });

  it('takes translated labels', () => {
    render(<MicToggle labels={{ mute: 'Couper le micro', unmute: 'Réactiver le micro' }} />);
    const button = screen.getByRole('button', { name: 'Couper le micro' });
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: 'Réactiver le micro' })).toBe(button);
  });

  it('has no axe violations', async () => {
    const { container } = render(<MicToggle level={0.5} caption="Mic" />);
    expect((await axe.run(container)).violations).toEqual([]);
  });
});

describe('CallTimer', () => {
  it('reads a controlled duration through the kit-wide formatter', () => {
    render(<CallTimer seconds={84} />);
    expect(screen.getByText('1:24')).toBeTruthy();
  });

  it('rolls over to hours on a long call', () => {
    render(<CallTimer seconds={3661} />);
    expect(screen.getByText('1:01:01')).toBeTruthy();
  });

  it('ticks its own clock from a start time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:10Z'));
    render(<CallTimer startedAt={Date.parse('2026-01-01T00:00:00Z')} />);
    // Mounting mid-call shows the right time immediately rather than starting at zero.
    expect(screen.getByText('0:10')).toBeTruthy();
    // advanceTimersByTime moves the faked clock too, so this is three real seconds
    act(() => void vi.advanceTimersByTime(3000));
    expect(screen.getByText('0:13')).toBeTruthy();
  });

  it('freezes when the call is held rather than counting on', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:05Z'));
    render(<CallTimer startedAt={Date.parse('2026-01-01T00:00:00Z')} running={false} />);
    act(() => void vi.advanceTimersByTime(25000));
    expect(screen.getByText('0:05')).toBeTruthy();
  });

  it('is a timer that does not announce itself every second', () => {
    render(<CallTimer seconds={5} label="Call duration" />);
    const timer = screen.getByRole('timer', { name: 'Call duration' });
    // A live region here would make a screen reader unusable for the length of
    // the call; the duration is there to be asked for.
    expect(timer).toHaveAttribute('aria-live', 'off');
  });

  it('has no axe violations', async () => {
    const { container } = render(<CallTimer seconds={84} />);
    expect((await axe.run(container)).violations).toEqual([]);
  });
});

describe('ConnectionQuality', () => {
  it('names the level in words, so the grading does not depend on seeing hue', () => {
    render(<ConnectionQuality level={3} />);
    expect(screen.getByRole('img', { name: 'Connection quality: good' })).toBeTruthy();
  });

  it('speaks as one image, not four bars', () => {
    const { container } = render(<ConnectionQuality level={2} />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(container.querySelectorAll('[class*="bar"]').length).toBe(4);
  });

  it('fills one bar per level and grades the tone', () => {
    const read = (level: number) => {
      const { container, unmount } = render(<ConnectionQuality level={level} />);
      const root = container.querySelector('[data-level]') as HTMLElement;
      const filled = container.querySelectorAll('[class*="filled"]').length;
      const tone = root.dataset.tone;
      unmount();
      return { filled, tone };
    };
    expect(read(0)).toEqual({ filled: 0, tone: 'danger' });
    expect(read(1)).toEqual({ filled: 1, tone: 'danger' });
    expect(read(2)).toEqual({ filled: 2, tone: 'warning' });
    expect(read(4)).toEqual({ filled: 4, tone: 'success' });
  });

  it('says unknown rather than zero before the first measurement', () => {
    render(<ConnectionQuality />);
    // "Not measured" and "about to drop" lead to opposite decisions, so they
    // must not look — or sound — the same.
    const widget = screen.getByRole('img', { name: 'Connection quality unknown' });
    expect(widget.dataset.level).toBe('unknown');
    expect(widget.dataset.tone).toBe('neutral');
  });

  it('takes a null reading as unknown rather than crashing or drawing zero', () => {
    render(<ConnectionQuality level={null} />);
    expect(screen.getByRole('img', { name: 'Connection quality unknown' })).toBeTruthy();
  });

  it('takes translated descriptions', () => {
    render(<ConnectionQuality level={4} labels={{ level: () => 'Qualité : excellente' }} />);
    expect(screen.getByRole('img', { name: 'Qualité : excellente' })).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(<ConnectionQuality level={3} />);
    expect((await axe.run(container)).violations).toEqual([]);
  });
});

describe('RecordingIndicator', () => {
  it('announces politely, unlike the call clock', () => {
    render(<RecordingIndicator />);
    const status = screen.getByRole('status');
    // A recording starting IS worth interrupting for; polite lands it at the
    // next pause rather than cutting across speech.
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Recording')).toBeTruthy();
  });

  it('carries the state in words, not only in the pulse', () => {
    const { rerender } = render(<RecordingIndicator />);
    expect(screen.getByRole('status').dataset.state).toBe('recording');

    rerender(<RecordingIndicator paused />);
    expect(screen.getByText('Recording paused')).toBeTruthy();
    expect(screen.getByRole('status').dataset.state).toBe('paused');

    rerender(<RecordingIndicator recording={false} />);
    // Quiets in place rather than unmounting, so the header does not reflow.
    expect(screen.getByText('Not recording')).toBeTruthy();
    expect(screen.getByRole('status').dataset.state).toBe('stopped');
  });

  it('pulses only while actually capturing', () => {
    const pulsing = (props: { recording?: boolean; paused?: boolean }) => {
      const { container, unmount } = render(<RecordingIndicator {...props} />);
      const found = container.querySelector('[class*="pulse"]') !== null;
      unmount();
      return found;
    };
    expect(pulsing({})).toBe(true);
    expect(pulsing({ paused: true })).toBe(false);
    expect(pulsing({ recording: false })).toBe(false);
  });

  it('keeps the elapsed readout out of the live region', () => {
    render(<RecordingIndicator seconds={95} />);
    // Announcing it would re-fire the region every second.
    expect(screen.getByText('1:35').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('freezes the readout while paused', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:08Z'));
    render(<RecordingIndicator paused startedAt={Date.parse('2026-01-01T00:00:00Z')} />);
    act(() => void vi.advanceTimersByTime(52000));
    expect(screen.getByText('0:08')).toBeTruthy();
  });

  it('takes translated wording', () => {
    render(<RecordingIndicator labels={{ recording: 'Enregistrement' }} />);
    expect(screen.getByText('Enregistrement')).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(<RecordingIndicator startedAt={Date.now() - 5000} />);
    expect((await axe.run(container)).violations).toEqual([]);
  });
});

describe('a call screen, assembled', () => {
  it('composes the family into one bar with no axe violations', async () => {
    const { container } = render(
      <div>
        <RecordingIndicator seconds={125} />
        <CallTimer seconds={125} />
        <ConnectionQuality level={3} />
        <CallControlBar label="Call controls" variant="glass">
          <MicToggle caption="Mic" level={0.4} />
          <CallControlButton aria-label="Stop camera" pressed state="engaged" caption="Camera">
            <svg />
          </CallControlButton>
          <CallControlButton aria-label="Leave call" state="danger" size="lg" caption="Leave">
            <svg />
          </CallControlButton>
        </CallControlBar>
      </div>,
    );
    expect((await axe.run(container)).violations).toEqual([]);
  });
});
