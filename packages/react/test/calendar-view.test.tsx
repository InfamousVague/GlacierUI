import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import { CalendarView, type CalendarEvent } from '../src/index.ts';

// A fixed clock, so nothing here depends on the day the suite runs.
const TODAY = new Date(2026, 6, 15); // Wed 15 July 2026

const events: CalendarEvent[] = [
  { id: 'standup', title: 'Standup', start: new Date(2026, 6, 15, 9, 0) },
  { id: 'review', title: 'Design review', start: new Date(2026, 6, 15, 14, 0), tone: 'success' },
  { id: 'offsite', title: 'Offsite', start: new Date(2026, 6, 16), end: new Date(2026, 6, 18), allDay: true },
];

const setup = (props: Partial<React.ComponentProps<typeof CalendarView>> = {}) =>
  render(<CalendarView events={events} today={TODAY} defaultDate={TODAY} {...props} />);

const cells = () => screen.getAllByRole('gridcell');
const cellFor = (key: string) => document.querySelector(`[data-day="${key}"]`) as HTMLElement;

describe('CalendarView', () => {
  it('renders six rows of seven, so paging never changes its height', () => {
    setup();
    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(cells()).toHaveLength(42);
  });

  it('names the month it is showing', () => {
    setup();
    expect(screen.getByRole('heading', { level: 3 }).textContent).toContain('July');
    expect(screen.getByRole('heading', { level: 3 }).textContent).toContain('2026');
  });

  it('opens on the week containing the 1st', () => {
    setup();
    expect(cells()[0]?.getAttribute('data-day')).toBe('2026-06-28');
  });

  it('dims the days borrowed from adjacent months', () => {
    setup();
    expect(cellFor('2026-06-28').getAttribute('data-outside')).toBe('true');
    expect(cellFor('2026-07-01').getAttribute('data-outside')).toBeNull();
  });

  it('marks today, and only today', () => {
    setup();
    const marked = cells().filter((c) => c.getAttribute('aria-current') === 'date');
    expect(marked.map((c) => c.getAttribute('data-day'))).toEqual(['2026-07-15']);
  });

  it('names each cell by its full date, not a bare number', () => {
    setup();
    // "15" alone would be announced as a digit rather than a date.
    expect(cellFor('2026-07-15').getAttribute('aria-label')).toContain('15');
    expect(cellFor('2026-07-15').getAttribute('aria-label')).toContain('July');
  });

  it('lays events into their day', () => {
    setup();
    const cell = within(cellFor('2026-07-15'));
    expect(cell.getByText('Standup')).toBeTruthy();
    expect(cell.getByText('Design review')).toBeTruthy();
  });

  it('repeats a multi-day event on every day it spans', () => {
    setup();
    for (const key of ['2026-07-16', '2026-07-17', '2026-07-18']) {
      expect(within(cellFor(key)).getByText('Offsite')).toBeTruthy();
    }
    expect(within(cellFor('2026-07-19')).queryByText('Offsite')).toBeNull();
  });

  it('tints an event by its tone', () => {
    setup();
    const chip = screen.getByText('Design review').closest('[data-tone]');
    expect(chip?.getAttribute('data-tone')).toBe('success');
  });

  it('defaults an untoned event to accent', () => {
    setup();
    expect(screen.getByText('Standup').closest('[data-tone]')?.getAttribute('data-tone')).toBe('accent');
  });

  it('collapses a busy day into a "+N more" line', () => {
    const busy: CalendarEvent[] = Array.from({ length: 5 }, (_, i) => ({
      id: `e${i}`,
      title: `Event ${i}`,
      start: new Date(2026, 6, 15, 9 + i),
    }));
    setup({ events: busy });
    const cell = within(cellFor('2026-07-15'));
    // Two shown, and the third slot spent on the overflow line.
    expect(cell.getByText('+3 more')).toBeTruthy();
    expect(cell.queryByText('Event 2')).toBeNull();
  });

  it('pages forward a month', () => {
    setup();
    fireEvent.click(screen.getByLabelText('Next period'));
    expect(screen.getByRole('heading', { level: 3 }).textContent).toContain('August');
  });

  it('pages back a month', () => {
    setup();
    fireEvent.click(screen.getByLabelText('Previous period'));
    expect(screen.getByRole('heading', { level: 3 }).textContent).toContain('June');
  });

  it('returns to today', () => {
    setup();
    fireEvent.click(screen.getByLabelText('Next period'));
    fireEvent.click(screen.getByText('Today'));
    expect(screen.getByRole('heading', { level: 3 }).textContent).toContain('July');
  });

  it('reports the anchor as it pages', () => {
    const onDateChange = vi.fn();
    setup({ onDateChange });
    fireEvent.click(screen.getByLabelText('Next period'));
    expect(onDateChange).toHaveBeenCalled();
    expect(onDateChange.mock.calls[0]?.[0]?.getMonth()).toBe(7); // August
  });

  it('switches to the week view', () => {
    setup();
    fireEvent.click(screen.getByText('Week'));
    expect(cells()).toHaveLength(7);
  });

  it('shows the whole week regardless of month, undimmed', () => {
    // A week straddling two months would otherwise render half of itself grey.
    setup({ defaultDate: new Date(2026, 6, 1) });
    fireEvent.click(screen.getByText('Week'));
    expect(cells().filter((c) => c.getAttribute('data-outside'))).toHaveLength(0);
  });

  it('switches to the agenda, which is a list rather than a grid', () => {
    setup();
    fireEvent.click(screen.getByText('Agenda'));
    // An agenda has no second axis; announcing a grid would describe a
    // structure that is not there.
    expect(screen.queryByRole('grid')).toBeNull();
    expect(screen.getByText('Standup')).toBeTruthy();
  });

  it('says so when an agenda range is empty', () => {
    setup({ events: [] });
    fireEvent.click(screen.getByText('Agenda'));
    expect(screen.getByText('Nothing scheduled')).toBeTruthy();
  });

  it('accepts a custom empty label', () => {
    setup({ events: [], emptyLabel: 'Clear week' });
    fireEvent.click(screen.getByText('Agenda'));
    expect(screen.getByText('Clear week')).toBeTruthy();
  });

  it('reports the mode when the view switch is used', () => {
    const onModeChange = vi.fn();
    setup({ onModeChange });
    fireEvent.click(screen.getByText('Week'));
    expect(onModeChange).toHaveBeenCalledWith('week');
  });

  it('starts the week on Monday when asked', () => {
    setup({ weekStartsOn: 1 });
    expect(cells()[0]?.getAttribute('data-day')).toBe('2026-06-29');
  });

  it('leaves cells unpressable without a handler', () => {
    setup();
    expect(cellFor('2026-07-15').getAttribute('data-pressable')).toBeNull();
  });

  it('selects a day on press', () => {
    const onSelectDay = vi.fn();
    setup({ onSelectDay });
    fireEvent.click(cellFor('2026-07-20'));
    expect(onSelectDay.mock.calls[0]?.[0]?.getDate()).toBe(20);
  });

  it('marks the selected day distinctly from today', () => {
    // Selection tints the cell; today marks only its number. Conflating them
    // makes "the date it is" and "the date you picked" look alike.
    setup({ selected: new Date(2026, 6, 20), onSelectDay: vi.fn() });
    expect(cellFor('2026-07-20').getAttribute('data-selected')).toBe('true');
    expect(cellFor('2026-07-15').getAttribute('data-selected')).toBeNull();
    expect(cellFor('2026-07-15').getAttribute('data-today')).toBe('true');
  });

  it('reports the event, not the day, when a chip is pressed', () => {
    const onSelectEvent = vi.fn();
    const onSelectDay = vi.fn();
    setup({ onSelectEvent, onSelectDay });
    fireEvent.click(screen.getByText('Standup'));
    expect(onSelectEvent).toHaveBeenCalledWith(expect.objectContaining({ id: 'standup' }));
    expect(onSelectDay).not.toHaveBeenCalled();
  });

  describe('roving focus', () => {
    it('makes exactly one cell tabbable', () => {
      setup();
      expect(cells().filter((c) => c.getAttribute('tabindex') === '0')).toHaveLength(1);
    });

    it('seats the tab stop on today', () => {
      setup();
      expect(cellFor('2026-07-15').getAttribute('tabindex')).toBe('0');
    });

    it('seats it on the selected day when there is one', () => {
      setup({ selected: new Date(2026, 6, 20), onSelectDay: vi.fn() });
      expect(cellFor('2026-07-20').getAttribute('tabindex')).toBe('0');
      expect(cellFor('2026-07-15').getAttribute('tabindex')).toBe('-1');
    });

    it('moves a day with ArrowRight', () => {
      setup();
      fireEvent.keyDown(cellFor('2026-07-15'), { key: 'ArrowRight' });
      expect(cellFor('2026-07-16').getAttribute('tabindex')).toBe('0');
    });

    it('moves a week with ArrowDown', () => {
      setup();
      fireEvent.keyDown(cellFor('2026-07-15'), { key: 'ArrowDown' });
      expect(cellFor('2026-07-22').getAttribute('tabindex')).toBe('0');
    });

    it('jumps to the start of the week with Home', () => {
      setup();
      fireEvent.keyDown(cellFor('2026-07-15'), { key: 'Home' });
      expect(cellFor('2026-07-12').getAttribute('tabindex')).toBe('0');
    });

    it('jumps to the end of the week with End', () => {
      setup();
      fireEvent.keyDown(cellFor('2026-07-15'), { key: 'End' });
      expect(cellFor('2026-07-18').getAttribute('tabindex')).toBe('0');
    });

    it('pages with PageDown', () => {
      setup();
      fireEvent.keyDown(cellFor('2026-07-15'), { key: 'PageDown' });
      expect(screen.getByRole('heading', { level: 3 }).textContent).toContain('August');
    });

    it('pages when the arrows run off the end of the range', () => {
      setup();
      fireEvent.keyDown(cells()[41]!, { key: 'ArrowRight' });
      expect(screen.getByRole('heading', { level: 3 }).textContent).toContain('August');
    });

    it('selects the focused day with Enter', () => {
      const onSelectDay = vi.fn();
      setup({ onSelectDay });
      fireEvent.keyDown(cellFor('2026-07-20'), { key: 'Enter' });
      expect(onSelectDay.mock.calls[0]?.[0]?.getDate()).toBe(20);
    });

    it('does not select while merely moving', () => {
      // Arrowing through a month should not fire a selection per keystroke.
      const onSelectDay = vi.fn();
      setup({ onSelectDay });
      fireEvent.keyDown(cellFor('2026-07-15'), { key: 'ArrowRight' });
      expect(onSelectDay).not.toHaveBeenCalled();
    });
  });

  it('keeps the grid geometry while loading', () => {
    const { container } = setup({ skeleton: true });
    // Nothing should reflow when the real events land.
    expect(container.querySelectorAll('[class*="cell"]')).toHaveLength(42);
  });

  it('has no axe violations', async () => {
    const { container } = setup({ onSelectDay: vi.fn(), onSelectEvent: vi.fn() });
    const results = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});

describe('CalendarView editing', () => {
  const openEditorOn = (title: string) => fireEvent.click(screen.getByRole('button', { name: new RegExp(title) }));

  it('leaves every editing affordance off unless asked', () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Add event' })).toBeNull();
    fireEvent.doubleClick(cellFor('2026-07-20'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens a blank editor on the add control', () => {
    setup({ editable: true });
    fireEvent.click(screen.getByRole('button', { name: 'Add event' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByLabelText('Title')).toHaveProperty('value', '');
  });

  it('adds to the selected day rather than always to today', () => {
    setup({ editable: true, selected: new Date(2026, 6, 22) });
    fireEvent.click(screen.getByRole('button', { name: 'Add event' }));
    expect(screen.getByLabelText('Date')).toHaveProperty('value', '2026-07-22');
  });

  it('opens a blank editor on the day that was double-pressed', () => {
    setup({ editable: true });
    fireEvent.doubleClick(cellFor('2026-07-20'));
    expect(screen.getByLabelText('Date')).toHaveProperty('value', '2026-07-20');
  });

  it('opens an existing event filled in', () => {
    setup({ editable: true });
    openEditorOn('Design review');
    expect(screen.getByLabelText('Title')).toHaveProperty('value', 'Design review');
    expect(screen.getByLabelText('Starts')).toHaveProperty('value', '14:00');
  });

  it('reports a new event as a create', () => {
    const onEventCreate = vi.fn();
    const onEventChange = vi.fn();
    setup({ editable: true, onEventCreate, onEventChange, newEventId: () => 'minted' });
    fireEvent.doubleClick(cellFor('2026-07-20'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Lunch' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onEventChange).not.toHaveBeenCalled();
    const event = onEventCreate.mock.calls[0]![0] as CalendarEvent;
    expect(event.id).toBe('minted');
    expect(event.title).toBe('Lunch');
    // Local construction: the 20th, not the 19th, wherever the suite runs.
    expect(event.start.getDate()).toBe(20);
  });

  it('reports an edited event as a change, keeping its id', () => {
    const onEventCreate = vi.fn();
    const onEventChange = vi.fn();
    setup({ editable: true, onEventCreate, onEventChange });
    openEditorOn('Design review');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Design crit' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onEventCreate).not.toHaveBeenCalled();
    expect(onEventChange.mock.calls[0]![0]).toMatchObject({ id: 'review', title: 'Design crit' });
  });

  it('refuses to save a draft with no title, and says why', () => {
    const onEventCreate = vi.fn();
    setup({ editable: true, onEventCreate });
    fireEvent.click(screen.getByRole('button', { name: 'Add event' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onEventCreate).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog').textContent).toContain('Required');
  });

  it('says nothing about a field the user has not tried to save yet', () => {
    setup({ editable: true });
    fireEvent.click(screen.getByRole('button', { name: 'Add event' }));
    expect(screen.getByRole('dialog').textContent).not.toContain('Required');
  });

  it('hides the times when the event is all-day', () => {
    setup({ editable: true });
    fireEvent.click(screen.getByRole('button', { name: 'Add event' }));
    expect(screen.queryByLabelText('Starts')).toBeTruthy();
    fireEvent.click(screen.getByRole('switch', { name: 'All day' }));
    expect(screen.queryByLabelText('Starts')).toBeNull();
  });

  it('offers delete only for an event that exists', () => {
    setup({ editable: true, onEventDelete: vi.fn() });
    fireEvent.click(screen.getByRole('button', { name: 'Add event' }));
    expect(screen.queryByRole('button', { name: 'Delete event' })).toBeNull();
  });

  it('reports a delete by id and closes', () => {
    const onEventDelete = vi.fn();
    setup({ editable: true, onEventDelete });
    openEditorOn('Design review');
    fireEvent.click(screen.getByRole('button', { name: 'Delete event' }));
    expect(onEventDelete).toHaveBeenCalledWith('review');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('still tells a host about the press it asked for', () => {
    const onSelectEvent = vi.fn();
    setup({ editable: true, onSelectEvent });
    openEditorOn('Design review');
    expect(onSelectEvent).toHaveBeenCalled();
  });

  it('mints ids that do not collide across two new events', () => {
    const onEventCreate = vi.fn();
    setup({ editable: true, onEventCreate });
    for (const title of ['One', 'Two']) {
      fireEvent.click(screen.getByRole('button', { name: 'Add event' }));
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: title } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    }
    const [first, second] = onEventCreate.mock.calls.map((c) => (c[0] as CalendarEvent).id);
    expect(first).not.toBe(second);
  });
});

describe('CalendarView context menu', () => {
  const chipFor = (id: string) => document.querySelector(`[data-event-id="${id}"]`) as HTMLElement;
  const menu = () => screen.queryByRole('menu');
  const itemNames = () => screen.getAllByRole('menuitem').map((i) => i.textContent!.trim());

  it('stays out of the way unless editing is on', () => {
    setup();
    fireEvent.contextMenu(cellFor('2026-07-20'));
    expect(menu()).toBeNull();
  });

  it('offers add on empty day space', () => {
    setup({ editable: true });
    fireEvent.contextMenu(cellFor('2026-07-20'));
    expect(itemNames()).toEqual(['Add event']);
  });

  it('adds on the day that was right-clicked, not on today', () => {
    setup({ editable: true });
    fireEvent.contextMenu(cellFor('2026-07-20'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Add event' }));
    expect(screen.getByLabelText('Date')).toHaveProperty('value', '2026-07-20');
  });

  it('offers edit, delete, and add on an event', () => {
    setup({ editable: true, onEventDelete: vi.fn() });
    fireEvent.contextMenu(chipFor('review'));
    expect(itemNames()).toEqual(['Edit event', 'Delete event', 'Add event']);
  });

  it('drops delete when the host does not handle it', () => {
    setup({ editable: true });
    fireEvent.contextMenu(chipFor('review'));
    expect(itemNames()).toEqual(['Edit event', 'Add event']);
  });

  it('opens the right event for editing', () => {
    setup({ editable: true });
    fireEvent.contextMenu(chipFor('review'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit event' }));
    expect(screen.getByLabelText('Title')).toHaveProperty('value', 'Design review');
  });

  it('deletes by id from the menu', () => {
    const onEventDelete = vi.fn();
    setup({ editable: true, onEventDelete });
    fireEvent.contextMenu(chipFor('review'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete event' }));
    expect(onEventDelete).toHaveBeenCalledWith('review');
  });

  it('adds to the event’s own day when the press landed on a chip', () => {
    setup({ editable: true });
    fireEvent.contextMenu(chipFor('review'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Add event' }));
    // 'review' is on 15 July; the blank draft inherits that day, not today's.
    expect(screen.getByLabelText('Date')).toHaveProperty('value', '2026-07-15');
  });

  it('resolves a day in agenda mode, where there is no grid cell', () => {
    setup({ editable: true, defaultMode: 'agenda' });
    fireEvent.contextMenu(chipFor('standup'));
    expect(itemNames()).toContain('Edit event');
  });
});
