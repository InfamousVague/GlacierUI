import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { deliveryStatuses, groupMessages, type ChatMessage } from '@glacier/logic';
import { messageTail } from '@glacier/logic';
import { MessageBubble } from '../src/molecules/MessageBubble/MessageBubble.tsx';
import { MessageGroup } from '../src/molecules/MessageBubble/MessageGroup.tsx';
import { MessageMeta } from '../src/molecules/MessageBubble/MessageMeta.tsx';

/** 9:41 on a fixed local day, so nothing here depends on when the suite runs. */
const AT = new Date(2024, 2, 3, 9, 41).getTime();
const NOW = new Date(2024, 2, 3, 12, 0).getTime();

const message = (over: Partial<ChatMessage> & Pick<ChatMessage, 'id'>): ChatMessage => ({
  authorId: 'ana',
  at: AT,
  text: 'hello',
  ...over,
});

const run = (count: number, over: Partial<ChatMessage> = {}) =>
  groupMessages(
    Array.from({ length: count }, (_, i) =>
      message({ id: `m${i}`, at: AT + i * 1000, text: `line ${i}`, ...over }),
    ),
  )[0]!;

const corner = (el: HTMLElement, name: string) => el.style.getPropertyValue(`--message-corner-${name}`);

describe('MessageBubble', () => {
  it('puts the viewer on the trailing edge and everyone else on the leading one', () => {
    const { container, unmount } = render(<MessageBubble own>mine</MessageBubble>);
    expect(container.querySelector('[data-side]')).toHaveAttribute('data-side', 'end');
    unmount();
    const { container: theirs } = render(<MessageBubble>yours</MessageBubble>);
    expect(theirs.querySelector('[data-side]')).toHaveAttribute('data-side', 'start');
  });

  it('routes its corner geometry through the run position, not through its own guess', () => {
    const radii = (position: 'only' | 'first' | 'middle' | 'last') => {
      const { container, unmount } = render(
        <MessageBubble own position={position}>
          x
        </MessageBubble>,
      );
      const el = container.querySelector('[data-position]') as HTMLElement;
      const outer = [corner(el, 'start-end'), corner(el, 'end-end')].join(' ');
      const inner = [corner(el, 'start-start'), corner(el, 'end-start')].join(' ');
      unmount();
      return { outer, inner };
    };

    // an only bubble is fully round
    expect(radii('only').outer).toBe('var(--glacier-radius-xl) var(--glacier-radius-xl)');
    // a middle bubble has both stacked corners flattened
    expect(radii('middle').outer).toBe('var(--glacier-radius-xs) var(--glacier-radius-xs)');
    // first and last each flatten only the side facing their neighbour
    expect(radii('first').outer).toBe('var(--glacier-radius-xl) var(--glacier-radius-xs)');
    expect(radii('last').outer).toBe('var(--glacier-radius-xs) var(--glacier-radius-xl)');
    // and the free edge stays round throughout, which is what gives a run its
    // silhouette
    for (const position of ['only', 'first', 'middle', 'last'] as const)
      expect(radii(position).inner).toBe('var(--glacier-radius-xl) var(--glacier-radius-xl)');
  });

  it('draws the tail from the shared path and squares the corner it grows out of', () => {
    const { container } = render(
      <MessageBubble own position="last" tail>
        x
      </MessageBubble>,
    );
    const path = container.querySelector('svg path');
    expect(path).toHaveAttribute('d', messageTail.path);
    // decoration: the corner geometry already says where the run ends
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    const el = container.querySelector('[data-tail]') as HTMLElement;
    expect(corner(el, 'end-end')).toBe('var(--glacier-radius-none)');
  });

  it('flips the tail with the side, since an SVG path has no writing direction', () => {
    const scaleOf = (own: boolean) => {
      const { container, unmount } = render(
        <MessageBubble own={own} tail>
          x
        </MessageBubble>,
      );
      const value = (container.querySelector('[data-tail]') as HTMLElement).style.getPropertyValue(
        '--message-tail-scale',
      );
      unmount();
      return value;
    };
    expect(scaleOf(true)).toBe('1');
    expect(scaleOf(false)).toBe('-1');
  });

  it('never grows a tail in row layout, where there is no bubble to grow it from', () => {
    const { container } = render(
      <MessageBubble layout="row" tail>
        x
      </MessageBubble>,
    );
    expect(container.querySelector('svg')).toBeNull();
    expect(container.querySelector('[data-layout]')).not.toHaveAttribute('data-tail');
  });

  it('reserves the gutter in row layout whether or not it holds an avatar', () => {
    const { container } = render(
      <MessageBubble layout="row" header={<span>Ana</span>}>
        x
      </MessageBubble>,
    );
    // the column is always there, so a message with no avatar still lines up
    // with the one above it
    expect(container.querySelector('[data-layout="row"]')?.firstElementChild).toBeTruthy();
    expect(screen.getByText('Ana')).toBeTruthy();
  });

  it('takes reactions, attachments, and a quoted reply as slots it does not build', () => {
    render(
      <MessageBubble
        replyTo={<div>quoted</div>}
        attachments={<div>files</div>}
        reactions={<div>reactions</div>}
      >
        body
      </MessageBubble>,
    );
    for (const text of ['quoted', 'files', 'reactions', 'body']) expect(screen.getByText(text)).toBeTruthy();
  });

  it('forwards data-testid to the DOM', () => {
    render(<MessageBubble data-testid="probe">x</MessageBubble>);
    expect(screen.getByTestId('probe')).toBeTruthy();
  });
});

describe('MessageMeta', () => {
  it('prints the clock and names the delivery status in words', () => {
    render(<MessageMeta at={AT} now={NOW} locale="en-US" status="read" />);
    expect(screen.getByText(/9:41/)).toBeTruthy();
    // the glyph says nothing out loud, so the word has to be there too
    expect(screen.getByText('Read')).toBeTruthy();
  });

  it('draws a different silhouette for every state', () => {
    // The line used to draw "delivered" and "read" as the same double tick in
    // two colours, which is one mark to a colour-blind reader, a monochrome
    // display, or a phone in sunlight. It now renders the DeliveryStatus atom,
    // whose whole rule is that no two states share a shape.
    const shapes = new Set<string>();
    for (const status of deliveryStatuses) {
      const { container, unmount } = render(<MessageMeta status={status} />);
      shapes.add(container.querySelector('svg')?.innerHTML ?? '');
      unmount();
    }
    expect(shapes.size).toBe(deliveryStatuses.length);
  });

  it('announces the status once, not once for the word and once for the mark', () => {
    render(<MessageMeta status="read" />);
    expect(screen.getByText('Read')).toBeTruthy();
    // The mark is decorative here precisely because the word above it is not.
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('reports the least advanced status of a run, not the last one', () => {
    // a stack whose final message was read still holds a failed send, and that
    // is the only thing the user can act on
    render(<MessageMeta statuses={['read', 'failed', 'delivered']} />);
    expect(screen.getByText('Not delivered')).toBeTruthy();
    expect(screen.queryByText('Read')).toBeNull();
  });

  it('skips messages with no status, since a received message has no outbox', () => {
    render(<MessageMeta statuses={[undefined, 'sent', undefined]} />);
    expect(screen.getByText('Sent')).toBeTruthy();
  });

  it('says nothing at all when there is nothing to report', () => {
    const { container } = render(<MessageMeta />);
    expect(container.textContent).toBe('');
  });

  it('marks an edited message', () => {
    render(<MessageMeta at={AT} now={NOW} locale="en-US" edited />);
    expect(screen.getByText('Edited')).toBeTruthy();
  });
});

describe('MessageGroup', () => {
  it('says the avatar and the name once, not once per message', () => {
    render(
      <MessageGroup
        group={run(3)}
        avatar={<img alt="Ana" src="a.png" />}
        authorName="Ana"
        now={NOW}
        locale="en-US"
      />,
    );
    expect(screen.getAllByAltText('Ana')).toHaveLength(1);
    expect(screen.getAllByText('Ana')).toHaveLength(1);
    expect(screen.getByText('line 0')).toBeTruthy();
    expect(screen.getByText('line 2')).toBeTruthy();
  });

  it('collapses the per-message timestamps to one stamp for the run', () => {
    render(<MessageGroup group={run(4)} authorName="Ana" now={NOW} locale="en-US" />);
    expect(screen.getAllByText(/9:41/)).toHaveLength(1);
  });

  it('suppresses the repeated avatar on a continued run but keeps its gutter', () => {
    const whole = run(3);
    const continued = { ...whole, continued: true };
    const { container } = render(
      <MessageGroup group={continued} avatar={<img alt="Ana" src="a.png" />} authorName="Ana" now={NOW} />,
    );
    // one author must not read as two just because a divider cut their run
    expect(screen.queryByAltText('Ana')).toBeNull();
    expect(screen.queryByText('Ana')).toBeNull();
    // ...and the column is still reserved, so the text stays on the same line
    const group = container.querySelector('[data-continued]') as HTMLElement;
    expect(group.firstElementChild).toBeTruthy();
    // the run is still announced as its author's, even with the name hidden
    expect(screen.getByRole('group', { name: 'Ana' })).toBeTruthy();
  });

  it('gives the run exactly one tail, at its foot', () => {
    const { container } = render(<MessageGroup group={run(3)} own authorName="Ana" now={NOW} />);
    expect(container.querySelectorAll('svg')).toHaveLength(1);
    expect(container.querySelectorAll('[data-tail]')).toHaveLength(1);
    expect(container.querySelector('[data-tail]')).toHaveAttribute('data-position', 'last');
  });

  it('reports the run status as the least advanced of its members', () => {
    const group = groupMessages([
      message({ id: 'a', at: AT, status: 'read' }),
      message({ id: 'b', at: AT + 1000, status: 'failed' }),
      message({ id: 'c', at: AT + 2000, status: 'read' }),
    ])[0]!;
    render(<MessageGroup group={group} own authorName="Ana" now={NOW} locale="en-US" />);
    expect(screen.getByText('Not delivered')).toBeTruthy();
  });

  it('derives authorship from the viewer rather than being told twice', () => {
    const { container } = render(<MessageGroup group={run(2)} viewerId="ana" now={NOW} />);
    expect(container.querySelector('[data-side]')).toHaveAttribute('data-side', 'end');
  });

  it('never grows a tail on a standalone notice, which is not a person talking', () => {
    const group = groupMessages([message({ id: 's', breaksGroup: true, text: 'Ana joined' })])[0]!;
    const { container } = render(<MessageGroup group={group} now={NOW} />);
    expect(container.querySelector('svg')).toBeNull();
    expect(container.querySelector('[data-standalone]')).toBeTruthy();
  });

  it('puts the time in the header in row layout, where alignment says nothing', () => {
    render(<MessageGroup group={run(2)} layout="row" authorName="Ana" now={NOW} locale="en-US" />);
    const header = screen.getByText('Ana').parentElement as HTMLElement;
    expect(header.textContent).toMatch(/9:41/);
  });

  it('hands each message to the slot renderers with its place in the run', () => {
    const seen: string[] = [];
    render(
      <MessageGroup
        group={run(3)}
        now={NOW}
        renderReactions={(context) => {
          seen.push(`${context.index}:${context.position}:${context.last}`);
          return <span>{`r${context.index}`}</span>;
        }}
      />,
    );
    expect(seen).toEqual(['0:first:false', '1:middle:false', '2:last:true']);
    expect(screen.getByText('r2')).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <MessageGroup
        group={run(3)}
        avatar={<img alt="Ana" src="a.png" />}
        authorName="Ana"
        now={NOW}
        locale="en-US"
      />,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});

describe('the stylesheet holds the two decisions the DOM cannot show', () => {
  // Read from the runner's root rather than from import.meta.url: under jsdom
  // the module URL is an http one and cannot be turned into a path.
  const css = readFileSync(
    resolve(process.cwd(), 'packages/react/src/molecules/MessageBubble/MessageBubble.module.css'),
    'utf8',
  );

  it('lets a transcript be selected, unlike a control such as PlayerCard', () => {
    expect(css).toMatch(/user-select: text/);
  });

  it('breaks an unbroken URL rather than letting one message widen the transcript', () => {
    expect(css).toMatch(/overflow-wrap: anywhere/);
  });

  it('inverts the tail exactly once for a right-to-left page', () => {
    // two separate rules, so a browser without :dir() drops only the second
    expect(css).toMatch(/:dir\(rtl\) \.tail/);
    expect(css).toMatch(/\[dir='rtl'\] \.tail/);
  });
});
