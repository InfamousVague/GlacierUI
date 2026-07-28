import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { groupMessages, insertSeparators, type ChatMessage, type ChatSequenceItem } from '@glacier/logic';
import { MessageList, type MessageListHandle } from '../src/organisms/MessageList/MessageList.tsx';
import { DateSeparator } from '../src/organisms/MessageList/DateSeparator.tsx';
import { UnreadDivider } from '../src/organisms/MessageList/UnreadDivider.tsx';
import { ScrollToLatest } from '../src/organisms/MessageList/ScrollToLatest.tsx';

const DAY = 86_400_000;
const NOW = new Date(2026, 6, 27, 12, 0).getTime();

function msg(id: string, authorId: string, at: number, text = id): ChatMessage {
  return { id, authorId, at, text };
}

function sequence(messages: ChatMessage[], unreadAnchorId?: string): ChatSequenceItem[] {
  return insertSeparators(groupMessages(messages), unreadAnchorId ? { unreadAnchorId } : {});
}

const renderGroup = (group: { id: string; messages: ChatMessage[] }) => (
  <div data-testid={`group-${group.id}`}>{group.messages.map((m) => m.text).join(' / ')}</div>
);

/**
 * jsdom performs no layout, so every scroll measurement the component reads is
 * zero. These stubs are the viewport's geometry, backed by mutable numbers so a
 * test can grow the content between renders exactly as a real prepend would.
 */
function stubViewport(el: HTMLElement, initial: { scrollTop?: number; scrollHeight: number; clientHeight: number }) {
  const box = { scrollTop: initial.scrollTop ?? 0, scrollHeight: initial.scrollHeight, clientHeight: initial.clientHeight };
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => box.scrollHeight });
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => box.clientHeight });
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => box.scrollTop,
    set: (value: number) => {
      box.scrollTop = value;
    },
  });
  return box;
}

const viewportOf = (container: HTMLElement) => container.querySelector('[role="log"]') as HTMLElement;

afterEach(() => {
  vi.useRealTimers();
});

describe('MessageList — rendering', () => {
  const items = sequence([msg('a', 'ana', NOW - DAY), msg('b', 'bo', NOW), msg('c', 'bo', NOW + 1000)], 'b');

  it('renders every sequence kind through its own renderer', () => {
    render(<MessageList items={items} renderGroup={renderGroup} now={NOW} />);
    expect(screen.getByTestId('group-a')).toBeTruthy();
    expect(screen.getByTestId('group-b').textContent).toBe('b / c');
    // the defaults: a day row per day, and the unread rule against the anchor
    expect(screen.getByRole('separator', { name: 'Yesterday' })).toBeTruthy();
    expect(screen.getByRole('separator', { name: 'Today' })).toBeTruthy();
    expect(screen.getByRole('separator', { name: '2 new messages' })).toBeTruthy();
  });

  it('takes custom separator renderers', () => {
    render(
      <MessageList
        items={items}
        renderGroup={renderGroup}
        now={NOW}
        renderDay={(item) => <div data-testid="day">{item.dayKey}</div>}
        renderUnread={(item) => <div data-testid="unread">{item.count}</div>}
      />,
    );
    expect(screen.getAllByTestId('day')).toHaveLength(2);
    expect(screen.getByTestId('unread').textContent).toBe('2');
  });

  it('lets renderItem override all three', () => {
    render(<MessageList items={items} renderGroup={renderGroup} renderItem={(item) => <div data-testid="row">{item.kind}</div>} />);
    expect(screen.getAllByTestId('row')).toHaveLength(items.length);
    expect(screen.queryByTestId('group-a')).toBeNull();
  });

  it('numbers rows against the FULL sequence, so a windowed list stays truthful', () => {
    const { container } = render(<MessageList items={items} renderGroup={renderGroup} now={NOW} />);
    const rows = container.querySelectorAll('[role="listitem"]');
    expect(rows).toHaveLength(items.length);
    expect(rows[0]?.getAttribute('aria-setsize')).toBe(String(items.length));
    expect(rows[0]?.getAttribute('aria-posinset')).toBe('1');
    // the handle a virtualiser needs to map an index back to a mounted node
    expect(rows[0]?.getAttribute('data-index')).toBe('0');
  });

  it('tells the renderers which rows sit below the unread divider', () => {
    const seen: boolean[] = [];
    render(
      <MessageList
        items={items}
        renderGroup={renderGroup}
        renderItem={(item, context) => {
          seen.push(context.afterUnread);
          return <div key={item.key} />;
        }}
      />,
    );
    // false up to the divider, true from it down
    expect(seen.indexOf(true)).toBeGreaterThan(0);
    expect(seen.slice(seen.indexOf(true)).every(Boolean)).toBe(true);
  });

  it('places header and footer inside the scroll content, outside the list', () => {
    const { container } = render(
      <MessageList items={items} renderGroup={renderGroup} header={<p>older</p>} footer={<p>typing…</p>} />,
    );
    const list = container.querySelector('[role="list"]') as HTMLElement;
    // role=list may only hold listitems; a typing indicator is not one
    expect(list.contains(screen.getByText('typing…'))).toBe(false);
    expect(viewportOf(container).contains(screen.getByText('older'))).toBe(true);
  });
});

describe('MessageList — scroll anchoring', () => {
  const older = [msg('x', 'ana', NOW - 2 * DAY), msg('y', 'ana', NOW - 2 * DAY + 1000)];
  const live = [msg('a', 'bo', NOW), msg('b', 'bo', NOW + 1000)];

  it('opens at the bottom', () => {
    const { container } = render(<MessageList items={sequence(live)} renderGroup={renderGroup} />);
    const viewport = viewportOf(container);
    // jsdom reports 0 for everything, so the assertion is that the component
    // wrote scrollHeight into scrollTop rather than that the pixels are right
    expect(viewport.scrollTop).toBe(viewport.scrollHeight);
  });

  it('sticks to the bottom when a message arrives while the reader is there', () => {
    const { container, rerender } = render(<MessageList items={sequence(live)} renderGroup={renderGroup} />);
    const viewport = viewportOf(container);
    const box = stubViewport(viewport, { scrollTop: 700, scrollHeight: 1000, clientHeight: 300 });
    fireEvent.scroll(viewport);

    box.scrollHeight = 1600;
    rerender(<MessageList items={sequence([...live, msg('c', 'ana', NOW + 2000)])} renderGroup={renderGroup} />);
    expect(viewport.scrollTop).toBe(1600);
  });

  it('does NOT yank the viewport when a message arrives while the reader is scrolled up', () => {
    const { container, rerender } = render(<MessageList items={sequence(live)} renderGroup={renderGroup} />);
    const viewport = viewportOf(container);
    const box = stubViewport(viewport, { scrollTop: 200, scrollHeight: 1000, clientHeight: 300 });
    fireEvent.scroll(viewport);

    box.scrollHeight = 1600;
    rerender(<MessageList items={sequence([...live, msg('c', 'ana', NOW + 2000)])} renderGroup={renderGroup} />);
    // the anchor did not move and it was not a prepend, so nothing is corrected
    expect(viewport.scrollTop).toBe(200);
  });

  it('holds the reader\'s place when older history lands above them', () => {
    const { container, rerender } = render(<MessageList items={sequence(live)} renderGroup={renderGroup} />);
    const viewport = viewportOf(container);
    const box = stubViewport(viewport, { scrollTop: 200, scrollHeight: 1000, clientHeight: 300 });
    fireEvent.scroll(viewport);

    // A page of history arrives above; the content grows by 600px, so the
    // viewport must move down by exactly 600px for nothing to appear to move.
    box.scrollHeight = 1600;
    rerender(<MessageList items={sequence([...older, ...live])} renderGroup={renderGroup} />);
    expect(viewport.scrollTop).toBe(800);
  });

  it('scrolls to the newest message on demand through the ref', () => {
    const handle = { current: null } as { current: MessageListHandle | null };
    const { container } = render(<MessageList ref={handle} items={sequence(live)} renderGroup={renderGroup} />);
    const viewport = viewportOf(container);
    stubViewport(viewport, { scrollTop: 100, scrollHeight: 1000, clientHeight: 300 });
    fireEvent.scroll(viewport);
    handle.current?.scrollToBottom();
    expect(viewport.scrollTop).toBe(1000);
  });
});

describe('MessageList — reported state and the jump control', () => {
  const items = sequence([msg('a', 'ana', NOW), msg('b', 'bo', NOW + 1000), msg('c', 'bo', NOW + 2000)], 'b');

  it('reports at-bottom on mount and after every move', () => {
    const onScrollStateChange = vi.fn();
    const { container } = render(
      <MessageList items={items} renderGroup={renderGroup} onScrollStateChange={onScrollStateChange} />,
    );
    expect(onScrollStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ atBottom: true, unreadBelow: 0, showScrollToLatest: false }),
    );

    const viewport = viewportOf(container);
    stubViewport(viewport, { scrollTop: 100, scrollHeight: 1000, clientHeight: 300 });
    fireEvent.scroll(viewport);
    expect(onScrollStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ atBottom: false, distanceFromBottom: 600, unreadBelow: 2, showScrollToLatest: true }),
    );
  });

  it('shows the jump control with the waiting count folded into its name', () => {
    const { container } = render(<MessageList items={items} renderGroup={renderGroup} />);
    expect(screen.queryByRole('button')).toBeNull();

    const viewport = viewportOf(container);
    stubViewport(viewport, { scrollTop: 100, scrollHeight: 1000, clientHeight: 300 });
    fireEvent.scroll(viewport);
    const jump = screen.getByRole('button', { name: 'Scroll to latest messages, 2 new messages' });

    fireEvent.click(jump);
    expect(viewport.scrollTop).toBe(1000);
    // reaching the bottom is the one event that clears it
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('overrides the derived tally when the app tracks read state itself', () => {
    const { container } = render(<MessageList items={items} renderGroup={renderGroup} unreadCount={41} />);
    const viewport = viewportOf(container);
    stubViewport(viewport, { scrollTop: 100, scrollHeight: 1000, clientHeight: 300 });
    fireEvent.scroll(viewport);
    expect(screen.getByRole('button', { name: /41 new messages/ })).toBeTruthy();
  });

  it('can be told to report state without rendering its own control', () => {
    const { container } = render(<MessageList items={items} renderGroup={renderGroup} scrollToLatest={false} />);
    const viewport = viewportOf(container);
    stubViewport(viewport, { scrollTop: 100, scrollHeight: 1000, clientHeight: 300 });
    fireEvent.scroll(viewport);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('MessageList — paging older history', () => {
  const items = sequence([msg('a', 'ana', NOW), msg('b', 'bo', NOW + 1000)]);

  it('asks once per approach and re-arms only after the reader leaves', () => {
    const onReachTop = vi.fn();
    const { container } = render(
      <MessageList items={items} renderGroup={renderGroup} onReachTop={onReachTop} reachTopOffset={100} />,
    );
    const viewport = viewportOf(container);
    const box = stubViewport(viewport, { scrollTop: 900, scrollHeight: 2000, clientHeight: 500 });
    fireEvent.scroll(viewport);
    expect(onReachTop).not.toHaveBeenCalled();

    box.scrollTop = 40;
    fireEvent.scroll(viewport);
    box.scrollTop = 20;
    fireEvent.scroll(viewport);
    // latched: dragging around near the top is one request, not one per frame
    expect(onReachTop).toHaveBeenCalledTimes(1);

    box.scrollTop = 900;
    fireEvent.scroll(viewport);
    box.scrollTop = 10;
    fireEvent.scroll(viewport);
    expect(onReachTop).toHaveBeenCalledTimes(2);
  });

  it('stays quiet while a page is already in flight', () => {
    const onReachTop = vi.fn();
    const { container } = render(
      <MessageList items={items} renderGroup={renderGroup} onReachTop={onReachTop} reachTopOffset={100} loadingOlder />,
    );
    const viewport = viewportOf(container);
    const box = stubViewport(viewport, { scrollTop: 900, scrollHeight: 2000, clientHeight: 500 });
    fireEvent.scroll(viewport);
    box.scrollTop = 10;
    fireEvent.scroll(viewport);
    expect(onReachTop).not.toHaveBeenCalled();
    expect(viewport.getAttribute('aria-busy')).toBe('true');
  });
});

describe('MessageList — announcements', () => {
  const live = [msg('a', 'ana', NOW), msg('b', 'bo', NOW + 1000)];

  it('keeps the log navigable but not live, and speaks a coalesced count instead', () => {
    const { container, rerender } = render(<MessageList items={sequence(live)} renderGroup={renderGroup} />);
    const viewport = viewportOf(container);
    // role=log is implicitly polite; a busy channel would interrupt itself on
    // every arrival, so it is explicitly switched off
    expect(viewport.getAttribute('aria-live')).toBe('off');

    rerender(
      <MessageList
        items={sequence([...live, msg('c', 'ana', NOW + 2000), msg('d', 'ana', NOW + 3000)])}
        renderGroup={renderGroup}
      />,
    );
    const status = container.querySelector('[role="status"]') as HTMLElement;
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toBe('2 new messages');
  });

  it('coalesces a burst rather than announcing each message', () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<MessageList items={sequence(live)} renderGroup={renderGroup} />);
    const status = container.querySelector('[role="status"]') as HTMLElement;

    rerender(<MessageList items={sequence([...live, msg('c', 'ana', NOW + 2000)])} renderGroup={renderGroup} />);
    expect(status.textContent).toBe('1 new messages');

    // three more inside the interval: the region must not restart itself
    rerender(
      <MessageList
        items={sequence([
          ...live,
          msg('c', 'ana', NOW + 2000),
          msg('d', 'ana', NOW + 3000),
          msg('e', 'ana', NOW + 4000),
          msg('f', 'ana', NOW + 5000),
        ])}
        renderGroup={renderGroup}
      />,
    );
    expect(status.textContent).toBe('1 new messages');

    // the drain timer fires a state update, so it has to be flushed like any other
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(status.textContent).toBe('3 new messages');
  });

  it('announces nothing when older history is paged in', () => {
    const { container, rerender } = render(<MessageList items={sequence(live)} renderGroup={renderGroup} />);
    const status = container.querySelector('[role="status"]') as HTMLElement;
    rerender(
      <MessageList
        items={sequence([msg('x', 'ana', NOW - DAY), msg('y', 'ana', NOW - DAY + 1), ...live])}
        renderGroup={renderGroup}
      />,
    );
    expect(status.textContent).toBe('');
  });

  it('hands the job back to the log when asked', () => {
    const { container } = render(<MessageList items={sequence(live)} renderGroup={renderGroup} announce="messages" />);
    expect(viewportOf(container).getAttribute('aria-live')).toBe('polite');
  });

  it('says nothing at all in off mode', () => {
    const { container, rerender } = render(
      <MessageList items={sequence(live)} renderGroup={renderGroup} announce="off" />,
    );
    rerender(
      <MessageList items={sequence([...live, msg('c', 'ana', NOW + 2000)])} renderGroup={renderGroup} announce="off" />,
    );
    expect((container.querySelector('[role="status"]') as HTMLElement).textContent).toBe('');
  });
});

describe('DateSeparator', () => {
  it('spells the day from the shared ladder', () => {
    const { rerender } = render(<DateSeparator at={NOW} now={NOW} />);
    expect(screen.getByRole('separator', { name: 'Today' })).toBeTruthy();
    rerender(<DateSeparator at={NOW - DAY} now={NOW} />);
    expect(screen.getByRole('separator', { name: 'Yesterday' })).toBeTruthy();
    rerender(<DateSeparator at={new Date(2026, 2, 3).getTime()} now={NOW} locale="en-US" />);
    expect(screen.getByRole('separator', { name: 'Mar 3' })).toBeTruthy();
  });

  it('takes translated words for the two relative rungs', () => {
    render(<DateSeparator at={NOW} now={NOW} labels={{ today: "Aujourd'hui" }} />);
    expect(screen.getByRole('separator', { name: "Aujourd'hui" })).toBeTruthy();
  });

  it('hides its own text from assistive tech, since the name carries the day', () => {
    const { container } = render(<DateSeparator label="Today" />);
    // otherwise a reader that does announce separator contents says it twice
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    expect(screen.getByText('Today').getAttribute('aria-hidden')).toBe('true');
  });

  it('pins as a chip, because a rule would strike through the message beneath it', () => {
    const { container } = render(<DateSeparator label="Today" variant="chip" sticky />);
    const row = container.firstElementChild as HTMLElement;
    expect(row.dataset.variant).toBe('chip');
    expect(row.dataset.sticky).toBe('true');
  });

  it('is what MessageList pins, and only when sticky days are on', () => {
    const items = sequence([msg('a', 'ana', NOW)]);
    const { container, rerender } = render(<MessageList items={items} renderGroup={renderGroup} now={NOW} />);
    const dayRow = container.querySelector('[data-kind="day"]') as HTMLElement;
    expect(dayRow.className).toMatch(/sticky/);
    rerender(<MessageList items={items} renderGroup={renderGroup} now={NOW} stickyDays={false} />);
    expect((container.querySelector('[data-kind="day"]') as HTMLElement).className).not.toMatch(/sticky/);
  });
});

describe('UnreadDivider', () => {
  it('folds the count into one accessible name rather than leaving a stray number', () => {
    render(<UnreadDivider count={7} />);
    expect(screen.getByRole('separator', { name: '7 new messages' })).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
  });

  it('reads as a plain rule with nothing unread', () => {
    render(<UnreadDivider />);
    expect(screen.getByRole('separator', { name: 'New messages' })).toBeTruthy();
  });

  it('is never sticky, however it is placed in the transcript', () => {
    const items = sequence([msg('a', 'ana', NOW), msg('b', 'bo', NOW + 1000)], 'b');
    const { container } = render(<MessageList items={items} renderGroup={renderGroup} now={NOW} />);
    const row = container.querySelector('[data-kind="unread"]') as HTMLElement;
    // its job is to mark a place in the transcript; pinned, it would follow the
    // reader down the page and mark nothing
    expect(row.className).not.toMatch(/sticky/);
  });

  it('is visually distinct from a date row, not just differently worded', () => {
    const items = sequence([msg('a', 'ana', NOW), msg('b', 'bo', NOW + 1000)], 'b');
    const { container } = render(<MessageList items={items} renderGroup={renderGroup} now={NOW} />);
    const day = container.querySelector('[data-kind="day"] > div') as HTMLElement;
    const unread = container.querySelector('[data-kind="unread"] > div') as HTMLElement;
    expect(day.className).not.toBe(unread.className);
  });
});

describe('ScrollToLatest', () => {
  it('renders nothing while hidden, so it cannot be tabbed to', () => {
    const { container } = render(<ScrollToLatest onClick={() => undefined} />);
    expect(container.innerHTML).toBe('');
  });

  it('caps the badge and still names the true count', () => {
    render(<ScrollToLatest visible count={140} onClick={() => undefined} />);
    expect(screen.getByRole('button', { name: /140 new messages/ })).toBeTruthy();
    expect(screen.getByText('99+')).toBeTruthy();
  });

  it('keeps the badge out of the accessibility tree', () => {
    const { container } = render(<ScrollToLatest visible count={3} onClick={() => undefined} />);
    // the number is already in the button's name; announcing it twice is noise
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });
});

describe('accessibility', () => {
  it('has no axe violations', async () => {
    const items = sequence(
      [msg('a', 'ana', NOW - DAY), msg('b', 'bo', NOW), msg('c', 'bo', NOW + 1000)],
      'b',
    );
    const { container } = render(
      <MessageList items={items} renderGroup={renderGroup} now={NOW} header={<p>Start of conversation</p>} />,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations with the jump control showing', async () => {
    const items = sequence([msg('a', 'ana', NOW), msg('b', 'bo', NOW + 1000)], 'b');
    const { container } = render(<MessageList items={items} renderGroup={renderGroup} now={NOW} />);
    const viewport = viewportOf(container);
    stubViewport(viewport, { scrollTop: 100, scrollHeight: 1000, clientHeight: 300 });
    fireEvent.scroll(viewport);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
