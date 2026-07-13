import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  Button,
  VisualFeedbackProvider,
  emitFeedback,
  haptic,
  useVisualFeedback,
} from '../src/index.ts';

// jsdom drops pointerType/coords on synthetic events; dispatch a native one
// with them defined so the delegated listener sees a real press.
function press(el: Element, pointerType: 'touch' | 'mouse' = 'mouse', x = 40, y = 60) {
  const event = new Event('pointerdown', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType, configurable: true });
  Object.defineProperty(event, 'clientX', { value: x, configurable: true });
  Object.defineProperty(event, 'clientY', { value: y, configurable: true });
  el.dispatchEvent(event);
}

// The effects are portalled to document.body; each carries a stable data-kind.
const effects = () => document.body.querySelectorAll('span[data-kind]');

describe('VisualFeedbackProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    // Testing Library unmounts the tree (and its portal) between tests, which
    // also clears the provider's pending removal timers.
    vi.useRealTimers();
  });

  it('paints an effect at the press point, for mouse and touch alike', () => {
    render(
      <VisualFeedbackProvider enabled>
        <Button>Go</Button>
      </VisualFeedbackProvider>,
    );
    const button = screen.getByRole('button', { name: 'Go' });

    act(() => press(button, 'mouse', 40, 60));
    expect(effects()).toHaveLength(1);
    const span = effects()[0] as HTMLElement;
    expect(span).toHaveStyle({ left: '40px', top: '60px' });
    // unlike haptics, a mouse press counts: this is the desktop stand-in.

    act(() => press(button, 'touch', 10, 10));
    expect(effects()).toHaveLength(2);
  });

  it('does nothing when disabled', () => {
    render(
      <VisualFeedbackProvider enabled={false}>
        <Button>Go</Button>
      </VisualFeedbackProvider>,
    );
    act(() => press(screen.getByRole('button', { name: 'Go' })));
    expect(effects()).toHaveLength(0);
  });

  it('respects data-haptic="none" as an opt-out', () => {
    render(
      <VisualFeedbackProvider enabled>
        <button type="button" data-haptic="none">
          Silent
        </button>
      </VisualFeedbackProvider>,
    );
    act(() => press(screen.getByText('Silent')));
    expect(effects()).toHaveLength(0);
  });

  it('colors the effect by the pressed control kind', () => {
    render(
      <VisualFeedbackProvider enabled>
        <button type="button" data-haptic="error">
          Delete
        </button>
      </VisualFeedbackProvider>,
    );
    act(() => press(screen.getByText('Delete')));
    expect(effects()[0]).toHaveAttribute('data-kind', 'error');
  });

  it('paints a centered effect for programmatic feedback on the bus', () => {
    render(
      <VisualFeedbackProvider enabled>
        <div>content</div>
      </VisualFeedbackProvider>,
    );
    // A component haptic during a drag, or a success toast: emitted, not pressed.
    act(() => emitFeedback({ kind: 'success' }));
    expect(effects()).toHaveLength(1);
    expect(effects()[0]).toHaveAttribute('data-kind', 'success');
  });

  it('haptic() drives a visual even when the device motor is off', () => {
    render(
      <VisualFeedbackProvider enabled>
        <div>content</div>
      </VisualFeedbackProvider>,
    );
    act(() => haptic('warning'));
    expect(effects()).toHaveLength(1);
    expect(effects()[0]).toHaveAttribute('data-kind', 'warning');
  });

  it('suppresses a bus event right after a press, so a component press does not double', () => {
    render(
      <VisualFeedbackProvider enabled>
        <Button data-haptic="selection">Step</Button>
      </VisualFeedbackProvider>,
    );
    // Press paints one; the component's own haptic() on that press must not add a second.
    act(() => {
      press(screen.getByRole('button', { name: 'Step' }));
      haptic('selection');
    });
    expect(effects()).toHaveLength(1);
  });

  it('exposes a manual fire through useVisualFeedback', () => {
    let fire: ReturnType<typeof useVisualFeedback> | null = null;
    function Probe() {
      fire = useVisualFeedback();
      return null;
    }
    render(
      <VisualFeedbackProvider enabled>
        <Probe />
      </VisualFeedbackProvider>,
    );
    act(() => fire!('heavy', { x: 5, y: 5 }));
    expect(effects()).toHaveLength(1);
    expect(effects()[0]).toHaveStyle({ left: '5px', top: '5px' });
  });

  it('clears an effect after its lifetime when animationend never fires', () => {
    render(
      <VisualFeedbackProvider enabled>
        <Button>Go</Button>
      </VisualFeedbackProvider>,
    );
    act(() => press(screen.getByRole('button', { name: 'Go' })));
    expect(effects()).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(effects()).toHaveLength(0);
  });

  it('nudge kicks the app imperatively and paints no overlay', () => {
    const animate = vi.fn(() => ({ finished: Promise.resolve() }));
    // jsdom has no element.animate; provide a spy so the nudge path runs.
    (HTMLDivElement.prototype as unknown as { animate: unknown }).animate = animate;
    render(
      <VisualFeedbackProvider enabled variant="nudge">
        <Button>Go</Button>
      </VisualFeedbackProvider>,
    );
    act(() => press(screen.getByRole('button', { name: 'Go' })));
    expect(animate).toHaveBeenCalledTimes(1);
    expect(effects()).toHaveLength(0);
    delete (HTMLDivElement.prototype as unknown as { animate?: unknown }).animate;
  });
});
