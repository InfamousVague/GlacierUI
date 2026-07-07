import { Button, IconButton, Kbd, Row, Tooltip } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function TooltipPage() {
  return (
    <>
      <h1>Tooltip</h1>
      <p className="lede">
        Tooltip is a short hover and focus label anchored to a trigger. Use it for a name, a
        keyboard shortcut, or a one-line hint. The bubble portals to the body so it is never clipped,
        and it stays non-interactive so it can never trap the cursor.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="Wrap any single element and pass the label as content. Hovering or focusing the trigger reveals the bubble; leaving, blurring, or pressing Escape hides it."
        code={`import { Button, Tooltip } from '@perfect/react';

<Tooltip content="Saved to your library">
  <Button>Save</Button>
</Tooltip>`}
      >
        <Tooltip content="Saved to your library">
          <Button>Save</Button>
        </Tooltip>
      </Example>

      <Example
        title="Placements"
        description="The placement prop sets the side the bubble opens from. Each bubble still flips and clamps if it would run past the edge of the screen."
        code={`<Tooltip content="Opens above" placement="top">
  <Button>Top</Button>
</Tooltip>
<Tooltip content="Opens below" placement="bottom">
  <Button>Bottom</Button>
</Tooltip>
<Tooltip content="Opens to the left" placement="left">
  <Button>Left</Button>
</Tooltip>
<Tooltip content="Opens to the right" placement="right">
  <Button>Right</Button>
</Tooltip>`}
      >
        <Row gap={3} wrap>
          <Tooltip content="Opens above" placement="top">
            <Button>Top</Button>
          </Tooltip>
          <Tooltip content="Opens below" placement="bottom">
            <Button>Bottom</Button>
          </Tooltip>
          <Tooltip content="Opens to the left" placement="left">
            <Button>Left</Button>
          </Tooltip>
          <Tooltip content="Opens to the right" placement="right">
            <Button>Right</Button>
          </Tooltip>
        </Row>
      </Example>

      <Example
        title="On an icon button"
        description="An icon-only control is the classic case for a tooltip: the bubble supplies the visible label to sighted pointer users, while aria-label still names the button for assistive tech."
        code={`<Tooltip content="Copy link">
  <IconButton aria-label="Copy link">🔗</IconButton>
</Tooltip>`}
      >
        <Tooltip content="Copy link">
          <IconButton aria-label="Copy link">🔗</IconButton>
        </Tooltip>
      </Example>

      <Example
        title="Rich content"
        description="content takes any node, so a hint can pair text with a Kbd for a shortcut. Keep it to a line or two; anything richer or interactive belongs in a Popover."
        code={`<Tooltip
  content={
    <span>
      Open the palette <Kbd>⌘K</Kbd>
    </span>
  }
>
  <Button variant="outline">Commands</Button>
</Tooltip>`}
      >
        <Tooltip
          content={
            <span>
              Open the palette <Kbd>⌘K</Kbd>
            </span>
          }
        >
          <Button variant="outline">Commands</Button>
        </Tooltip>
      </Example>

      <Example
        title="Instant open"
        description="delay is the hover intent in milliseconds before the bubble opens. Set it to 0 for an immediate tooltip; focus always opens without delay."
        code={`<Tooltip content="No wait" delay={0}>
  <Button variant="ghost">Instant</Button>
</Tooltip>`}
      >
        <Tooltip content="No wait" delay={0}>
          <Button variant="ghost">Instant</Button>
        </Tooltip>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          {
            name: 'content',
            type: 'ReactNode',
            description: 'The bubble content: a short label, a shortcut, or a one-line hint.',
          },
          {
            name: 'children',
            type: 'ReactElement',
            description:
              'The single element the tooltip describes. Its ref, pointer and focus handlers, and aria-describedby are wired automatically.',
          },
          {
            name: 'placement',
            type: 'Side | `${Side}-${Alignment}`',
            default: "'top'",
            description:
              'Side and alignment the bubble opens from, such as top, right, or bottom-end. The bubble flips and clamps if it would leave the viewport.',
          },
          {
            name: 'delay',
            type: 'number',
            default: '300',
            description:
              'Milliseconds of hover intent before the bubble opens. Focus opens the bubble immediately regardless of this value.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: 'Suppresses the tooltip entirely. The trigger renders untouched.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'className',
            type: 'string',
            description: 'Extra class applied to the bubble.',
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          The bubble renders with <code>role="tooltip"</code>, and the trigger gains{' '}
          <code>aria-describedby</code> pointing at it while it is shown, so assistive technology
          announces the content as a description of the control.
        </li>
        <li>
          The tooltip opens on focus as well as hover, so keyboard users reach it. It hides on blur,
          on pointer leave, and on <code>Escape</code>.
        </li>
        <li>
          A tooltip only supplements the trigger. Never make it the only place a control is named or
          its meaning stated; an icon button still needs its own <code>aria-label</code>.
        </li>
        <li>
          The bubble is non-interactive, so it holds no links or buttons and never traps the cursor.
          For content that needs interaction, use a Popover.
        </li>
        <li>
          Under <code>prefers-reduced-motion</code> the bubble fades in place instead of scaling.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>
          Reach for a Tooltip to name an icon-only control or to add a short hint or shortcut. For
          anything that needs real content or interaction, use a Popover.
        </li>
        <li>
          The bubble portals to the body, so it is never clipped by an overflow-hidden ancestor like
          a card or a scrolling toolbar.
        </li>
        <li>
          Pass a single element as the child. Wrapping it in a fragment or extra element breaks the
          ref and event wiring.
        </li>
        <li>
          Keep the label to a line or two. If the message needs a heading or several sentences, it
          belongs in the page, not a tooltip.
        </li>
        <li>
          Tooltips do not open reliably on touch, so never hide essential information behind one on a
          mobile-first surface.
        </li>
      </ul>
    </>
  );
}
