import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Tooltip } from '../src/index.ts';

describe('Tooltip', () => {
  it('opens instantly on focus, wires aria-describedby, and hides on blur', async () => {
    render(
      <Tooltip content="Saves the document">
        <button type="button">Save</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Save' });
    expect(screen.queryByRole('tooltip')).toBeNull();

    fireEvent.focus(trigger);
    const bubble = await screen.findByRole('tooltip');
    expect(bubble).toHaveTextContent('Saves the document');
    expect(trigger).toHaveAttribute('aria-describedby', bubble.id);

    fireEvent.blur(trigger);
    await waitFor(() => expect(trigger).not.toHaveAttribute('aria-describedby'));
  });

  it('hides on Escape without moving focus', async () => {
    render(
      <Tooltip content="Saves the document">
        <button type="button">Save</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Save' });
    fireEvent.focus(trigger);
    await screen.findByRole('tooltip');
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(trigger).not.toHaveAttribute('aria-describedby'));
  });
});

describe('Tooltip in RTL', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('aligns a start placement to the trigger right edge and stamps dir', async () => {
    render(
      <div dir="rtl">
        <Tooltip content="Saves the document" placement="bottom-start">
          <button type="button">Save</button>
        </Tooltip>
      </div>,
    );
    // jsdom has no layout: stub the trigger rect and the bubble's offset size
    const trigger = screen.getByRole('button', { name: 'Save' });
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      left: 100, top: 10, width: 100, height: 20, right: 200, bottom: 30, x: 100, y: 10, toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(120);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(40);

    fireEvent.focus(trigger);
    const bubble = await screen.findByRole('tooltip');
    expect(bubble.style.left).toBe('80px'); // trigger right 200 - bubble width 120
    expect(bubble.style.top).toBe('40px'); // trigger bottom 30 + offset 10
    expect(bubble).toHaveAttribute('dir', 'rtl'); // carried past the body portal
  });

  it('keeps the centered default placement direction-neutral', async () => {
    render(
      <div dir="rtl">
        <Tooltip content="Saves the document">
          <button type="button">Save</button>
        </Tooltip>
      </div>,
    );
    const trigger = screen.getByRole('button', { name: 'Save' });
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      left: 100, top: 100, width: 100, height: 20, right: 200, bottom: 120, x: 100, y: 100, toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(120);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(40);

    fireEvent.focus(trigger);
    const bubble = await screen.findByRole('tooltip');
    expect(bubble.style.left).toBe('90px'); // 100 + 50 - 60, same in both directions
    expect(bubble.style.top).toBe('50px'); // above: trigger top 100 - offset 10 - height 40
  });
});
