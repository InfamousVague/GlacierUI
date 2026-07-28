import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import type { ChatMessage } from '@glacier/logic';
import { conversationSkeletonRuns } from '../../logic/src/conversation-view.ts';
import { ConversationView } from '../src/organisms/ConversationView/ConversationView.tsx';

/** A fixed local day, so nothing here depends on when the suite runs. */
const AT = new Date(2024, 2, 3, 9, 41).getTime();
const NOW = new Date(2024, 2, 3, 12, 0).getTime();
const VIEWER = 'ana';

const message = (over: Partial<ChatMessage> & Pick<ChatMessage, 'id'>): ChatMessage => ({
  authorId: VIEWER,
  at: AT,
  text: 'hello',
  ...over,
});

const view = (messages: ChatMessage[], props: Record<string, unknown> = {}) =>
  render(<ConversationView messages={messages} viewerId={VIEWER} now={NOW} locale="en-US" {...props} />);

const runs = (container: HTMLElement) => [...container.querySelectorAll('[data-authorship]')];
const scrollerOf = (container: HTMLElement) => container.firstElementChild as HTMLElement;

/**
 * jsdom performs no layout: `scrollTop` is a no-op setter and both heights read
 * zero, so a scroll test would silently assert nothing. These four numbers are
 * the entire contract the component has with a scroller, so stubbing exactly
 * them tests the real decision rather than a mock of it.
 */
function stubScroller(el: HTMLElement, { content, viewport, top }: { content: number; viewport: number; top: number }) {
  let scrollTop = top;
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => content });
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => viewport });
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
    set: (value: number) => {
      scrollTop = value;
    },
  });
  return { get top() { return scrollTop; } };
}

describe('the two axes', () => {
  it('derives authorship from the viewer, so the caller never pre-tags a message', () => {
    const { container } = view([message({ id: 'a' }), message({ id: 'b', authorId: 'bo' })]);
    expect(runs(container).map((r) => r.getAttribute('data-authorship'))).toEqual(['local', 'remote']);
    // and the edge follows from it: mine trails, theirs leads
    expect(runs(container).map((r) => r.querySelector('[data-side]')?.getAttribute('data-side'))).toEqual([
      'end',
      'start',
    ]);
  });

  it('never shows a delivery mark on a remote run, even when the data carries one', () => {
    // The invariant the whole component exists to hold. A synced transcript
    // that stamps every row `read` is ordinary; the tick would be a claim about
    // OUR outbox with nothing behind it.
    const { container } = view([message({ id: 'a', authorId: 'bo', status: 'read' })]);
    const remote = runs(container)[0] as HTMLElement;
    expect(remote).toHaveAttribute('data-authorship', 'remote');
    expect(remote).not.toHaveAttribute('data-ack');
    expect(remote.querySelector('[data-status]')).toBeNull();
    expect(screen.queryByText('Read')).toBeNull();
  });

  it('always shows one on a local run, including when the caller modelled no statuses', () => {
    const { container } = view([message({ id: 'a' })]);
    const local = runs(container)[0] as HTMLElement;
    expect(local).toHaveAttribute('data-ack', 'confirmed');
    expect(local.querySelector('[data-status="sent"]')).toBeTruthy();
    // the word, not the glyph, is what a screen reader gets
    expect(screen.getByText('Sent')).toBeTruthy();
  });

  it('draws an unacknowledged send as provisional rather than as a fault', () => {
    const { container } = view([message({ id: 'a', status: 'sending' })]);
    const local = runs(container)[0] as HTMLElement;
    expect(local).toHaveAttribute('data-ack', 'optimistic');
    expect(local).toHaveAttribute('data-provisional');
    // one alpha and the delivery atom's clock; no spinner
    expect(local.querySelector('[data-status="sending"]')).toBeTruthy();
    expect(local.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('leaves a failed send at full strength, since it is the row asking to be acted on', () => {
    const { container } = view([message({ id: 'a', status: 'failed' })]);
    const local = runs(container)[0] as HTMLElement;
    expect(local).toHaveAttribute('data-ack', 'failed');
    expect(local).not.toHaveAttribute('data-provisional');
    expect(local.querySelector('[data-status="failed"]')).toBeTruthy();
  });

  it('keeps the axes independent: a confirmed local run is not de-emphasised', () => {
    const { container } = view([
      message({ id: 'a', status: 'read' }),
      message({ id: 'b', authorId: 'bo', at: AT + 60_000 }),
    ]);
    const [local, remote] = runs(container) as HTMLElement[];
    expect(local).toHaveAttribute('data-ack', 'confirmed');
    expect(local).not.toHaveAttribute('data-provisional');
    expect(remote).not.toHaveAttribute('data-provisional');
  });

  it('reports a run by its least advanced member, so a stalled send is not hidden', () => {
    const { container } = view([
      message({ id: 'a', status: 'read' }),
      message({ id: 'b', at: AT + 1000, status: 'sending' }),
    ]);
    expect(runs(container)[0]).toHaveAttribute('data-ack', 'optimistic');
  });
});

describe('scrolling', () => {
  it('follows the live end when the reader is already parked at it', () => {
    const { container, rerender } = view([message({ id: 'a' })]);
    const el = scrollerOf(container);
    const state = stubScroller(el, { content: 1000, viewport: 100, top: 900 });
    fireEvent.scroll(el);

    rerender(
      <ConversationView
        messages={[message({ id: 'a' }), message({ id: 'b', at: AT + 60_000 })]}
        viewerId={VIEWER}
        now={NOW}
      />,
    );
    expect(state.top).toBe(1000);
  });

  it('does not yank a reader who has scrolled up', () => {
    const { container, rerender } = view([message({ id: 'a' })]);
    const el = scrollerOf(container);
    const state = stubScroller(el, { content: 1000, viewport: 100, top: 0 });
    fireEvent.scroll(el);

    rerender(
      <ConversationView
        messages={[message({ id: 'a' }), message({ id: 'b', at: AT + 60_000 })]}
        viewerId={VIEWER}
        now={NOW}
      />,
    );
    expect(state.top).toBe(0);
  });

  it('reports arriving at and leaving the live end, once per crossing', () => {
    const onAtBottomChange = vi.fn();
    const { container } = view([message({ id: 'a' })], { onAtBottomChange });
    const el = scrollerOf(container);
    const state = stubScroller(el, { content: 1000, viewport: 100, top: 900 });

    fireEvent.scroll(el);
    expect(onAtBottomChange).not.toHaveBeenCalled(); // already there; nothing crossed

    el.scrollTop = 0;
    fireEvent.scroll(el);
    expect(onAtBottomChange).toHaveBeenLastCalledWith(false);

    el.scrollTop = 900;
    fireEvent.scroll(el);
    expect(onAtBottomChange).toHaveBeenLastCalledWith(true);
    expect(onAtBottomChange).toHaveBeenCalledTimes(2);
    expect(state.top).toBe(900);
  });

  it('leaves the viewport alone entirely when sticking is off', () => {
    const { container, rerender } = view([message({ id: 'a' })], { stick: false });
    const el = scrollerOf(container);
    const state = stubScroller(el, { content: 1000, viewport: 100, top: 900 });
    fireEvent.scroll(el);
    rerender(
      <ConversationView
        messages={[message({ id: 'a' }), message({ id: 'b', at: AT + 60_000 })]}
        viewerId={VIEWER}
        now={NOW}
        stick={false}
      />,
    );
    expect(state.top).toBe(900);
  });
});

describe('empty and loading', () => {
  it('says the conversation is empty rather than showing a blank pane', () => {
    const { container } = view([]);
    expect(scrollerOf(container)).toHaveAttribute('data-empty');
    expect(screen.getByText('No messages yet')).toBeTruthy();
  });

  it("takes a caller's own empty state", () => {
    view([], { empty: <p>Say hello to Bo</p> });
    expect(screen.getByText('Say hello to Bo')).toBeTruthy();
  });

  it('holds the geometry it will settle into while loading', () => {
    const { container } = view([], { skeleton: true });
    const placeholder = runs(container);
    expect(placeholder).toHaveLength(conversationSkeletonRuns.length);
    expect(placeholder.map((r) => r.getAttribute('data-authorship'))).toEqual(
      conversationSkeletonRuns.map((r) => (r.own ? 'local' : 'remote')),
    );
    // both edges are represented before any data lands
    expect(new Set([...container.querySelectorAll('[data-side]')].map((r) => r.getAttribute('data-side')))).toEqual(
      new Set(['start', 'end']),
    );
  });

  it('claims no delivery state while loading, and is not announced as a log yet', () => {
    const { container } = view([], { skeleton: true });
    const el = scrollerOf(container);
    expect(el.querySelector('[data-status]')).toBeNull();
    expect(el).not.toHaveAttribute('role');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    // a focusable node inside an aria-hidden one is a dead end
    expect(el).not.toHaveAttribute('tabindex');
  });
});

describe('accessibility', () => {
  it('is a focusable, named, politely-live log', () => {
    const { container } = view([message({ id: 'a' })], { label: 'Chat with Bo' });
    const el = scrollerOf(container);
    expect(el).toHaveAttribute('role', 'log');
    expect(el).toHaveAttribute('aria-live', 'polite');
    expect(el).toHaveAttribute('tabindex', '0');
    expect(el).toHaveAttribute('aria-label', 'Chat with Bo');
  });

  it('has no axe violations', async () => {
    const { container } = view(
      [
        message({ id: 'a', authorId: 'bo', text: 'morning' }),
        message({ id: 'b', at: AT + 60_000, status: 'sending' }),
      ],
      {
        label: 'Chat with Bo',
        avatarFor: (id: string) => <img alt={id} src={`${id}.png`} />,
        authorNameFor: (id: string) => id,
      },
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations while empty or loading', async () => {
    const { container, rerender } = view([]);
    expect((await axe.run(container)).violations).toEqual([]);
    rerender(<ConversationView messages={[]} viewerId={VIEWER} now={NOW} skeleton />);
    expect((await axe.run(container)).violations).toEqual([]);
  });
});
