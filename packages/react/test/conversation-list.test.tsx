import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import { Avatar } from '../src/index.ts';
import {
  ConversationList,
  type ConversationItem,
} from '../src/molecules/ConversationList/ConversationList.tsx';
import { ConversationListItem } from '../src/molecules/ConversationList/ConversationListItem.tsx';
import { ConversationSkeleton } from '../src/molecules/ConversationList/ConversationSkeleton.tsx';

// Monday 27 July 2026, 14:30 — every timestamp in this file is read against it,
// so the suite does not change meaning when the clock does.
const NOW = new Date(2026, 6, 27, 14, 30);

const item = (over: Partial<ConversationItem> = {}): ConversationItem => ({
  id: 'ada',
  name: 'Ada Lovelace',
  snippet: 'The engine can arrange and combine numerical quantities.',
  timestamp: new Date(2026, 6, 27, 9, 5),
  ...over,
});

const items: ConversationItem[] = [
  item({ id: 'ada', name: 'Ada Lovelace', pinned: true }),
  item({ id: 'grace', name: 'Grace Hopper', unreadCount: 3 }),
  item({ id: 'alan', name: 'Alan Turing' }),
];

/** A bare row needs a listbox around it: an option cannot stand on its own. */
function Row(props: Parameters<typeof ConversationListItem>[0]) {
  return (
    <div role="listbox" aria-label="Conversations">
      <ul role="group" aria-label="All conversations" style={{ margin: 0, padding: 0 }}>
        <ConversationListItem {...props} />
      </ul>
    </div>
  );
}

describe('ConversationListItem', () => {
  it('is an option, not a link or a button, so a listbox can own it', () => {
    render(<Row item={item()} now={NOW} />);
    const option = screen.getByRole('option');
    expect(option.tagName).toBe('LI');
    // an option must not contain interactive descendants
    expect(within(option).queryByRole('button')).toBeNull();
    expect(within(option).queryByRole('link')).toBeNull();
  });

  it('shows the name, the truncated snippet, and a today timestamp', () => {
    render(<Row item={item()} now={NOW} locale="en-US" />);
    expect(screen.getByText('Ada Lovelace')).toBeTruthy();
    expect(screen.getByText(/The engine can arrange/)).toBeTruthy();
    expect(screen.getByText('9:05 AM')).toBeTruthy();
  });

  it('prefixes the snippet with the sender in a group chat', () => {
    render(<Row item={item({ sender: 'Grace', snippet: 'shipping tonight' })} now={NOW} />);
    expect(screen.getByText('Grace: shipping tonight')).toBeTruthy();
  });

  it('takes the avatar as a slot, so a group chat can hand it an avatar group', () => {
    render(<Row item={item({ avatar: <Avatar name="Ada Lovelace" /> })} now={NOW} />);
    // the slot is decorative: the name beside it identifies the conversation
    expect(screen.getByRole('option').querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('carries every marker at once, each in its own slot', () => {
    render(
      <Row
        item={item({ pinned: true, muted: true, draft: true, failed: true, unreadCount: 120 })}
        now={NOW}
      />,
    );
    const option = screen.getByRole('option');
    // the prefix slot goes to the failed send, which outranks the draft
    expect(within(option).getByText('Not delivered')).toBeTruthy();
    expect(within(option).queryByText('Draft')).toBeNull();
    // the badge still shows the count, capped
    expect(within(option).getByText('99+')).toBeTruthy();
    // and the row is still marked muted, so the badge can be demoted
    expect(option.dataset.muted).toBe('true');
  });

  it('does not carry unread by colour or position alone', () => {
    render(<Row item={item({ unreadCount: 3 })} now={NOW} />);
    const option = screen.getByRole('option');
    // a machine-readable flag the stylesheet weights the name from...
    expect(option.dataset.unread).toBe('');
    // ...and a phrase a screen reader can actually hear
    expect(option.textContent).toContain('3 unread');
  });

  it('spells out muted, pinned, and the full timestamp for assistive tech', () => {
    render(<Row item={item({ muted: true, pinned: true })} now={NOW} locale="en-US" />);
    const text = screen.getByRole('option').textContent ?? '';
    expect(text).toContain('Muted');
    expect(text).toContain('Pinned');
    // "Mon" is useless out of context, so the hidden phrase says it in full
    expect(text).toContain('2026');
  });

  it('keeps the counter badge out of the accessibility tree', () => {
    render(<Row item={item({ unreadCount: 3 })} now={NOW} />);
    // CounterBadge is a live region; inside an option it would announce twice,
    // so the count reaches assistive tech through the row's phrase instead
    expect(screen.getByText('3').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('activates on click and on Enter or Space', () => {
    const onSelect = vi.fn();
    render(<Row item={item()} now={NOW} onSelect={onSelect} />);
    const option = screen.getByRole('option');
    fireEvent.click(option);
    fireEvent.keyDown(option, { key: 'Enter' });
    fireEvent.keyDown(option, { key: ' ' });
    expect(onSelect).toHaveBeenCalledTimes(3);
    expect(onSelect).toHaveBeenCalledWith('ada');
  });

  it('reports selection through aria-selected, not only paint', () => {
    render(<Row item={item()} selected now={NOW} />);
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
  });

  it('takes translated labels', () => {
    render(
      <Row item={item({ failed: true })} now={NOW} labels={{ failed: 'Non distribué', muted: 'Muet' }} />,
    );
    expect(screen.getByText('Non distribué')).toBeTruthy();
  });

  it('steps its measurements with density', () => {
    const heightOf = (density: 'compact' | 'comfortable') => {
      const { container, unmount } = render(<Row item={item()} density={density} now={NOW} />);
      const row = container.querySelector('[data-density]') as HTMLElement;
      const height = row.style.getPropertyValue('--conversation-height');
      unmount();
      return height;
    };
    const heights = [heightOf('compact'), heightOf('comfortable')];
    expect(new Set(heights).size).toBe(2);
    expect(heights.every((h) => h.startsWith('var(--glacier-'))).toBe(true);
  });

  it('forwards data-testid to the DOM', () => {
    render(<Row item={item()} now={NOW} data-testid="probe" />);
    expect(screen.getByTestId('probe')).toBeInTheDocument();
  });
});

describe('ConversationList', () => {
  it('is a listbox of options', () => {
    render(<ConversationList items={items} now={NOW} />);
    expect(screen.getByRole('listbox', { name: 'Conversations' })).toBeTruthy();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('lifts pinned conversations into their own labelled group', () => {
    render(<ConversationList items={items} now={NOW} />);
    const pinned = screen.getByRole('group', { name: 'Pinned' });
    const all = screen.getByRole('group', { name: 'All conversations' });
    expect(within(pinned).getAllByRole('option')).toHaveLength(1);
    expect(within(all).getAllByRole('option')).toHaveLength(2);
  });

  it('renders one flat run when ungrouped', () => {
    render(<ConversationList items={items} grouped={false} now={NOW} />);
    expect(screen.queryByRole('group', { name: 'Pinned' })).toBeNull();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('numbers every row against the whole list, across section boundaries', () => {
    render(<ConversationList items={items} now={NOW} />);
    const options = screen.getAllByRole('option');
    // the pinned row is 1 of 3, not 1 of 1 — which is what keeps the
    // announcement honest once only a window of rows is in the DOM
    expect(options.map((o) => o.getAttribute('aria-posinset'))).toEqual(['1', '2', '3']);
    expect(options.every((o) => o.getAttribute('aria-setsize') === '3')).toBe(true);
  });

  it('owns selection', () => {
    const onValueChange = vi.fn();
    render(<ConversationList items={items} onValueChange={onValueChange} now={NOW} />);
    const grace = screen.getByRole('option', { name: /Grace Hopper/ });
    fireEvent.click(grace);
    expect(onValueChange).toHaveBeenCalledWith('grace');
    expect(grace).toHaveAttribute('aria-selected', 'true');
  });

  it('stays put when controlled by a parent that does not move', () => {
    const onValueChange = vi.fn();
    render(<ConversationList items={items} value="ada" onValueChange={onValueChange} now={NOW} />);
    fireEvent.click(screen.getByRole('option', { name: /Grace Hopper/ }));
    expect(onValueChange).toHaveBeenCalledWith('grace');
    expect(screen.getByRole('option', { name: /Ada Lovelace/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('moves focus with the arrows, across sections, without opening', () => {
    const onValueChange = vi.fn();
    render(<ConversationList items={items} onValueChange={onValueChange} now={NOW} />);
    const [ada, grace] = screen.getAllByRole('option');
    ada!.focus();
    fireEvent.keyDown(ada!, { key: 'ArrowDown' });
    // the pinned section's last row steps into the next section
    expect(document.activeElement).toBe(grace);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('clamps at the ends and jumps with Home and End', () => {
    render(<ConversationList items={items} now={NOW} />);
    const options = screen.getAllByRole('option');
    const first = options[0]!;
    const last = options[2]!;
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: 'End' });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: 'Home' });
    expect(document.activeElement).toBe(first);
  });

  it('opens as it moves when selection follows focus', () => {
    const onValueChange = vi.fn();
    render(<ConversationList items={items} selectionFollowsFocus onValueChange={onValueChange} now={NOW} />);
    const first = screen.getAllByRole('option')[0]!;
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(onValueChange).toHaveBeenCalledWith('grace');
  });

  it('leaves keys it does not own to the page', () => {
    render(<ConversationList items={items} now={NOW} />);
    const first = screen.getAllByRole('option')[0]!;
    const event = fireEvent.keyDown(first, { key: 'k' });
    // fireEvent returns false only when the handler called preventDefault
    expect(event).toBe(true);
  });

  it('holds exactly one tab stop, on the open conversation', () => {
    render(<ConversationList items={items} value="alan" now={NOW} />);
    const tabbable = screen.getAllByRole('option').filter((o) => o.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveTextContent('Alan Turing');
  });

  it('puts the tab stop on the first row when nothing is open', () => {
    render(<ConversationList items={items} now={NOW} />);
    const tabbable = screen.getAllByRole('option').filter((o) => o.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveTextContent('Ada Lovelace');
  });

  it('emits the windowing struts even while it renders every row', () => {
    const { container } = render(<ConversationList items={items} now={NOW} />);
    const listbox = screen.getByRole('listbox');
    // the seam: two struts are already in the tree, at zero height, waiting for
    // a windowing strategy to inflate them
    const struts = Array.from(listbox.children).filter((el) => el.getAttribute('aria-hidden') === 'true');
    expect(struts).toHaveLength(2);
    expect((struts[0] as HTMLElement).style.height).toBe('0px');
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(3);
  });

  it('shows the empty slot instead of sections when there is nothing to list', () => {
    render(<ConversationList items={[]} empty="No conversations yet" now={NOW} />);
    expect(screen.getByText('No conversations yet')).toBeTruthy();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('caps itself in a scroll area when given a max height', () => {
    const { container } = render(<ConversationList items={items} maxHeight={240} now={NOW} />);
    expect(container.querySelector('[data-orientation="vertical"]')).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <ConversationList
        items={[
          item({ id: 'ada', name: 'Ada Lovelace', pinned: true, muted: true }),
          item({ id: 'grace', name: 'Grace Hopper', unreadCount: 120, failed: true }),
          item({ id: 'alan', name: 'Alan Turing', draft: true }),
        ]}
        value="grace"
        now={NOW}
      />,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});

describe('ConversationSkeleton', () => {
  it('loads every part as its own placeholder, not one grey slab', () => {
    const { container } = render(<ConversationSkeleton count={3} />);
    // avatar disc, name line, timestamp, snippet line, badge — five per row
    expect(container.querySelectorAll('[data-skeleton]').length).toBe(3 * 5 + 3);
  });

  it('holds the geometry the real row will settle into', () => {
    const { container: loading } = render(<ConversationSkeleton count={1} density="compact" />);
    const { container: loaded } = render(<ConversationList items={[item()]} density="compact" now={NOW} />);
    const bone = loading.querySelector('[data-density]') as HTMLElement;
    const row = loaded.querySelector('[data-density]') as HTMLElement;
    // same row box, resolved from the same density metrics
    for (const prop of ['--conversation-height', '--conversation-padding-inline', '--conversation-gap'])
      expect(bone.style.getPropertyValue(prop)).toBe(row.style.getPropertyValue(prop));
  });

  it('is not a list of options yet', () => {
    render(<ConversationSkeleton count={3} />);
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('draws nothing for a nonsense count', () => {
    const { container } = render(<ConversationSkeleton count={-2} />);
    expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(0);
  });
});
