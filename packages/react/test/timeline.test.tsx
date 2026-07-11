import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { Timeline, type TimelineItem } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const ITEMS: TimelineItem[] = [
  { id: 1, title: 'Deployed v2.1.0', tone: 'success', timestamp: '2h ago' },
  { id: 2, title: 'Build passed', tone: 'info', description: 'All 412 tests green.' },
  { id: 3, title: 'Opened pull request', timestamp: 'yesterday' },
];

describe('Timeline', () => {
  it('renders a named ordered list with one listitem per event, in items order', () => {
    render(<Timeline aria-label="Activity" items={ITEMS} />);
    const list = screen.getByRole('list', { name: 'Activity' });
    expect(list.tagName).toBe('OL');
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.textContent)).toEqual([
      'Deployed v2.1.02h ago',
      'Build passedAll 412 tests green.',
      'Opened pull requestyesterday',
    ]);
  });

  it('lands the tone on the marker, defaulting to neutral', () => {
    const { container } = render(<Timeline aria-label="Activity" items={ITEMS} />);
    const markers = container.querySelectorAll('[data-tone]');
    expect(markers).toHaveLength(3);
    expect(markers[0]).toHaveAttribute('data-tone', 'success');
    expect(markers[1]).toHaveAttribute('data-tone', 'info');
    expect(markers[2]).toHaveAttribute('data-tone', 'neutral');
  });

  it('renders the icon inside the marker and drops the plain dot', () => {
    const items: TimelineItem[] = [
      { id: 'a', title: 'Alert fired', tone: 'danger', icon: <svg data-testid="glyph" /> },
    ];
    const { container } = render(<Timeline aria-label="Activity" items={items} />);
    const marker = container.querySelector('[data-tone="danger"]')!;
    expect(marker).toHaveAttribute('data-icon', 'true');
    expect(marker.contains(screen.getByTestId('glyph'))).toBe(true);
    expect(marker.querySelector('[class*="dot"]')).toBeNull();
  });

  it('renders a plain dot marker when there is no icon', () => {
    const { container } = render(<Timeline aria-label="Activity" items={ITEMS} />);
    const marker = container.querySelector('[data-tone="success"]')!;
    expect(marker).not.toHaveAttribute('data-icon');
    expect(marker.querySelector('span')).not.toBeNull();
  });

  it('renders the actor, timestamp, description, media, and actions slots', () => {
    const onAction = vi.fn();
    const items: TimelineItem[] = [
      {
        id: 1,
        title: 'Commented on the RFC',
        actor: <span>Ada Lovelace</span>,
        timestamp: <time dateTime="2026-07-11">Jul 11</time>,
        description: 'Left three suggestions.',
        media: <img alt="Diff preview" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />,
        actions: (
          <button type="button" onClick={onAction}>
            Reply
          </button>
        ),
      },
    ];
    render(<Timeline aria-label="Discussion" items={items} />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Jul 11')).toBeInTheDocument();
    expect(screen.getByText('Left three suggestions.')).toBeInTheDocument();
    expect(screen.getByAltText('Diff preview')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reply' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('marks only the last item with the no-connector hook', () => {
    render(<Timeline aria-label="Activity" items={ITEMS} />);
    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).not.toHaveAttribute('data-last');
    expect(rows[1]).not.toHaveAttribute('data-last');
    expect(rows[2]).toHaveAttribute('data-last');
  });

  it('draws a connector below every marker except the last', () => {
    const { container } = render(<Timeline aria-label="Activity" items={ITEMS} />);
    const rows = Array.from(container.querySelectorAll('li'));
    const connectorsIn = (row: Element) => row.querySelectorAll('[class*="connector"]').length;
    expect(connectorsIn(rows[0]!)).toBe(1);
    expect(connectorsIn(rows[1]!)).toBe(1);
    expect(connectorsIn(rows[2]!)).toBe(0);
  });

  it('hides the marker rail from assistive tech', () => {
    const { container } = render(<Timeline aria-label="Activity" items={ITEMS} />);
    const marker = container.querySelector('[data-tone]')!;
    expect(marker.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('exposes the density hook, defaulting to comfortable', () => {
    const { rerender } = render(<Timeline aria-label="Activity" items={ITEMS} />);
    expect(screen.getByRole('list')).toHaveAttribute('data-density', 'comfortable');
    rerender(<Timeline aria-label="Activity" items={ITEMS} density="compact" />);
    expect(screen.getByRole('list')).toHaveAttribute('data-density', 'compact');
  });

  it('renders skeletonCount placeholder rows and hides the items', () => {
    const { container } = render(
      <Timeline aria-label="Activity" items={ITEMS} skeleton skeletonCount={5} />,
    );
    const root = container.querySelector('ol')!;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root.querySelectorAll('li')).toHaveLength(5);
    expect(root.querySelectorAll('[data-skeleton="true"]').length).toBeGreaterThan(0);
    expect(screen.queryByText('Deployed v2.1.0')).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('defaults the skeleton to four rows and keeps the rail geometry', () => {
    const { container } = render(<Timeline aria-label="Activity" items={[]} skeleton />);
    const rows = Array.from(container.querySelectorAll('li'));
    expect(rows).toHaveLength(4);
    expect(rows[0]!.querySelectorAll('[class*="connector"]')).toHaveLength(1);
    expect(rows[3]!.querySelectorAll('[class*="connector"]')).toHaveLength(0);
  });

  it('forwards rest props like data-testid to the list', () => {
    render(<Timeline aria-label="Activity" items={ITEMS} data-testid="probe" />);
    expect(screen.getByTestId('probe')).toBe(screen.getByRole('list'));
  });

  it('keeps an explicit role list so WebKit does not strip semantics', () => {
    render(<Timeline aria-label="Activity" items={[{ id: 1, title: 'Deployed' }]} />);
    const feed = screen.getByRole('list', { name: 'Activity' });
    expect(feed.tagName).toBe('OL');
    expect(feed).toHaveAttribute('role', 'list');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Timeline
        aria-label="Activity"
        items={[
          ...ITEMS,
          {
            id: 4,
            title: 'Review requested',
            tone: 'warning',
            icon: <svg aria-hidden="true" />,
            actor: <span>Grace Hopper</span>,
            actions: <button type="button">Approve</button>,
          },
        ]}
      />,
    );
    const results = await axe.run(container, { rules: AXE_RULES });
    expect(results.violations).toEqual([]);
  });
});
