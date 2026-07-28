import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { QuotedMessage } from '../src/molecules/QuotedMessage/QuotedMessage.tsx';
import { ThreadIndicator } from '../src/molecules/ThreadIndicator/ThreadIndicator.tsx';
import { ChatHeader } from '../src/structures/ChatHeader/ChatHeader.tsx';
import { ConnectionBanner } from '../src/molecules/ConnectionBanner/ConnectionBanner.tsx';
import { CONNECTION_RECONNECTED_MS, QUOTED_SNIPPET_MAX } from '@glacier/logic';
import { formatMessageTimestamp, messageTimestamp } from '@glacier/logic';

/** A fixed "now", so the timestamp ladder is not clock-dependent. */
const NOW = new Date('2026-07-27T09:41:00Z').getTime();

describe('QuotedMessage', () => {
  it('shows who is being answered and what they said', () => {
    render(<QuotedMessage author="Ana" text="on my way" />);
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByText('on my way')).toBeTruthy();
  });

  it('cuts the snippet in the string, not only in the layout', () => {
    // A visually clipped line still reads out in full to a screen reader; the
    // string has to be cut so what is heard matches what is seen.
    const long = `${'word '.repeat(60)}end`;
    const { container } = render(<QuotedMessage author="Ana" text={long} />);
    const text = container.textContent ?? '';
    expect(text).toContain('…');
    expect(text.length).toBeLessThan(long.length);
    expect(text.length).toBeLessThanOrEqual(QUOTED_SNIPPET_MAX + 'Ana'.length + 2);
  });

  it('collapses a multi-line quote to one line', () => {
    render(<QuotedMessage author="Ana" text={'first\n\nsecond'} />);
    expect(screen.getByText('first second')).toBeTruthy();
  });

  it('stands in for a quote with no text', () => {
    render(<QuotedMessage author="Ana" placeholder="Photo" />);
    expect(screen.getByText('Photo')).toBeTruthy();
  });

  it('is inert without a jump handler', () => {
    // A focus stop in a transcript that does nothing when activated is worse
    // than no affordance at all.
    render(<QuotedMessage author="Ana" text="on my way" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('names where it goes when it can jump', () => {
    const onPress = vi.fn();
    render(<QuotedMessage author="Ana" text="on my way" onPress={onPress} />);
    const button = screen.getByRole('button', { name: /Ana/ });
    expect(button.getAttribute('aria-label')).toContain('on my way');
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('takes an overridden name', () => {
    render(<QuotedMessage author="Ana" text="hi" label="Aller au message" onPress={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Aller au message' })).toBeTruthy();
  });

  it('carries the tone through to the markup', () => {
    const { container } = render(<QuotedMessage author="Ana" text="hi" tone="neutral" />);
    expect(container.querySelector('[data-tone="neutral"]')).not.toBeNull();
  });

  it('holds its geometry while loading', () => {
    const { container } = render(<QuotedMessage author="Ana" text="hi" skeleton />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByText('Ana')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <QuotedMessage author="Ana" text="on my way" preview={<span />} onPress={() => undefined} />,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});

describe('ThreadIndicator', () => {
  it('counts replies in words, not only as a badge', () => {
    const { rerender } = render(<ThreadIndicator count={3} />);
    expect(screen.getByText('3 replies')).toBeTruthy();
    rerender(<ThreadIndicator count={1} />);
    expect(screen.getByText('1 reply')).toBeTruthy();
    rerender(<ThreadIndicator count={0} />);
    expect(screen.getByText('0 replies')).toBeTruthy();
  });

  it('spells the last activity with the shared timestamp ladder', () => {
    const at = NOW - 60_000;
    // Same day: the clock — exactly what a bubble beside it would print, which
    // is the point of reading the ladder rather than formatting here.
    const expected = formatMessageTimestamp(messageTimestamp(at, NOW), 'en');
    render(<ThreadIndicator count={2} lastActivityAt={at} now={NOW} />);
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it('is one target, with the faces hidden from it', () => {
    const onPress = vi.fn();
    render(
      <ThreadIndicator
        count={3}
        participants={<span data-testid="faces" />}
        lastActivityAt={NOW - 60_000}
        now={NOW}
        onPress={onPress}
      />,
    );
    // Five extra tab stops under every threaded message is the failure this avoids.
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByTestId('faces').closest('[aria-hidden="true"]')).not.toBeNull();

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toContain('3 replies');
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('names itself without a time when there is no last activity', () => {
    render(<ThreadIndicator count={2} onPress={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Open thread, 2 replies' })).toBeTruthy();
  });

  it('is inert without a handler', () => {
    render(<ThreadIndicator count={2} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('marks unread in the markup, so weight can carry it as well as colour', () => {
    const { container } = render(<ThreadIndicator count={2} unread />);
    expect(container.querySelector('[data-unread]')).not.toBeNull();
  });

  it('takes its own wording', () => {
    render(<ThreadIndicator count={5} label="5 réponses" />);
    expect(screen.getByText('5 réponses')).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <ThreadIndicator count={3} participants={<span />} lastActivityAt={NOW} now={NOW} onPress={() => undefined} />,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});

describe('ChatHeader', () => {
  it('makes the conversation name a real heading', () => {
    render(<ChatHeader title="Ana Ruiz" subtitle="Online" />);
    // A screen reader jumps to it, and it says what the transcript belongs to.
    expect(screen.getByRole('heading', { level: 2, name: 'Ana Ruiz' })).toBeTruthy();
    expect(screen.getByText('Online')).toBeTruthy();
  });

  it('takes a heading level, since a chat pane usually sits inside a page', () => {
    render(<ChatHeader title="Ana Ruiz" headingLevel={3} />);
    expect(screen.getByRole('heading', { level: 3 })).toBeTruthy();
  });

  it('hides the avatar from assistive tech', () => {
    // The title beside it already names the conversation.
    render(<ChatHeader title="Ana Ruiz" avatar={<span data-testid="avatar" />} />);
    expect(screen.getByTestId('avatar').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('renders the trailing actions as given', () => {
    render(<ChatHeader title="Ana Ruiz" actions={<button type="button">Call</button>} />);
    expect(screen.getByRole('button', { name: 'Call' })).toBeTruthy();
  });

  it('draws a back control only when it can go back', () => {
    const onBack = vi.fn();
    const { rerender } = render(<ChatHeader title="Ana Ruiz" />);
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();

    rerender(<ChatHeader title="Ana Ruiz" onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('puts the details button inside the heading, not around it', () => {
    const onTitlePress = vi.fn();
    render(<ChatHeader title="Ana Ruiz" onTitlePress={onTitlePress} />);
    const heading = screen.getByRole('heading', { level: 2 });
    const button = screen.getByRole('button', { name: 'Ana Ruiz' });
    // The heading survives; the button is one tab stop inside it.
    expect(heading.contains(button)).toBe(true);
    fireEvent.click(button);
    expect(onTitlePress).toHaveBeenCalledTimes(1);
  });

  it('keeps the subtitle out of the live-region business', () => {
    // Presence and typing change constantly, above a transcript that is already
    // announcing messages.
    const { container } = render(<ChatHeader title="Ana Ruiz" subtitle="typing…" />);
    expect(container.querySelector('[aria-live]')).toBeNull();
  });

  it('holds the bar geometry while loading', () => {
    const { container } = render(<ChatHeader title="Ana Ruiz" skeleton />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <ChatHeader
        title="Ana Ruiz"
        subtitle="Online"
        avatar={<span />}
        onBack={() => undefined}
        onTitlePress={() => undefined}
        actions={<button type="button">Call</button>}
      />,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});

describe('ConnectionBanner', () => {
  it('says nothing while the connection is healthy', () => {
    // A "Connected" strip at the top of every chat app is a strip nobody reads.
    const { container } = render(<ConnectionBanner state="online" />);
    expect(container.firstChild).toBeNull();
  });

  it('takes the one-boolean shorthand', () => {
    const { container, rerender } = render(<ConnectionBanner online />);
    expect(container.firstChild).toBeNull();
    rerender(<ConnectionBanner online={false} />);
    expect(screen.getByText('You are offline')).toBeTruthy();
  });

  it('interrupts only for offline', () => {
    const { rerender } = render(<ConnectionBanner state="offline" />);
    expect(screen.getByRole('alert')).toBeTruthy();

    // "Still trying" is a progress report on a problem already announced.
    rerender(<ConnectionBanner state="reconnecting" />);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('status')).toBeTruthy();

    rerender(<ConnectionBanner state="reconnected" />);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('carries the state in words, never only in the tone', () => {
    const { rerender } = render(<ConnectionBanner state="reconnecting" />);
    expect(screen.getByText('Reconnecting…')).toBeTruthy();
    rerender(<ConnectionBanner state="reconnected" />);
    expect(screen.getByText('Back online')).toBeTruthy();
  });

  it('offers a retry only while offline', () => {
    const onRetry = vi.fn();
    const { rerender } = render(<ConnectionBanner state="offline" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    // Nothing to retry mid-attempt, and nothing to retry once it worked — so a
    // focused control never disappears out from under the keyboard.
    rerender(<ConnectionBanner state="reconnecting" onRetry={onRetry} />);
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });

  it('settles the confirmation itself, and nothing else', () => {
    vi.useFakeTimers();
    try {
      const onSettle = vi.fn();
      const { rerender } = render(<ConnectionBanner state="offline" onSettle={onSettle} />);
      act(() => {
        vi.advanceTimersByTime(CONNECTION_RECONNECTED_MS * 2);
      });
      expect(onSettle).not.toHaveBeenCalled();

      rerender(<ConnectionBanner state="reconnected" onSettle={onSettle} />);
      act(() => {
        vi.advanceTimersByTime(CONNECTION_RECONNECTED_MS - 1);
      });
      expect(onSettle).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(onSettle).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('takes translated wording', () => {
    render(<ConnectionBanner state="offline" onRetry={() => undefined} labels={{ offline: 'Sin conexión', retry: 'Reintentar' }} />);
    expect(screen.getByText('Sin conexión')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(<ConnectionBanner state="offline" onRetry={() => undefined} />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
