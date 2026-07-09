import { Callout, Heading, Text, Size, TextTone, Tone } from '@glacier/react';
import { HighlightedCode } from '../../docs-ui.tsx';

export function TestingPage() {
  return (
    <>
      <Heading level={1}>Testing</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        GlacierUI is built to be tested the way people use it. Query by role and label first, and
        reach for a <code>data-testid</code> only when you need a stable hook the DOM does not already
        give you — there is no bespoke <code>testID</code> prop to learn.
      </Text>

      <Heading level={2}>Query by role and label first</Heading>
      <Text tone={TextTone.Muted}>
        Every component ships real semantics — roles, accessible names, <code>aria-pressed</code>,{' '}
        <code>aria-expanded</code>, and friends — so Testing Library&rsquo;s semantic queries work out
        of the box and assert accessibility at the same time. This is how the kit&rsquo;s own suite is
        written.
      </Text>
      <HighlightedCode
        language="tsx"
        code={`import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterChip } from '@glacier/react';

test('chip toggles on click', async () => {
  render(<FilterChip count={3}>Open</FilterChip>);
  const chip = screen.getByRole('button', { name: /open/i });
  expect(chip).toHaveAttribute('aria-pressed', 'false');
  await userEvent.click(chip);
  expect(chip).toHaveAttribute('aria-pressed', 'true');
});`}
      />

      <Heading level={2}>The data-testid escape hatch</Heading>
      <Text tone={TextTone.Muted}>
        When semantics cannot disambiguate — one tile among a grid of identical tiles — every
        component forwards unknown props (<code>data-*</code>, <code>id</code>, <code>aria-*</code>)
        straight through to its root element. A conformance test keeps that guarantee true across the
        whole kit, so <code>data-testid</code> is always there when you need it.
      </Text>
      <HighlightedCode
        language="tsx"
        code={`<StatTile data-testid="revenue" value="$48.2k" label="Revenue" />;

// in a test
const tile = screen.getByTestId('revenue');`}
      />

      <Heading level={2}>Overlay and portaled components</Heading>
      <Text tone={TextTone.Muted}>
        Modal, Popover, Menu, Tooltip, Toast, Spotlight, FloatingPanel, and TabbedModal render into a
        portal and only while open, so they carry no persistent root to tag. Query them by role
        instead — each exposes the right one.
      </Text>
      <HighlightedCode
        language="tsx"
        code={`import { within } from '@testing-library/react';

await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
const menu = screen.getByRole('menu');
await userEvent.click(within(menu).getByRole('menuitem', { name: 'Edit' }));`}
      />

      <Callout tone={Tone.Info} title="Rule of thumb">
        Reach for <code>getByRole</code> and <code>getByLabelText</code> first, <code>getByText</code>{' '}
        for content, and <code>data-testid</code> last. The more a test reads like how a person uses
        the UI, the less it breaks when you refactor the markup.
      </Callout>

      <Heading level={2}>Roles at a glance</Heading>
      <Text tone={TextTone.Muted}>The query that targets each interactive component:</Text>
      <HighlightedCode
        language="tsx"
        code={`// Button, IconButton, FilterChip, Toggle
getByRole('button', { name })

// Checkbox / Switch / Radio / Slider
getByRole('checkbox')   getByRole('switch')   getByRole('radio')   getByRole('slider')

// Input, SearchField, Textarea (or getByLabelText); NumberInput
getByRole('textbox')    getByRole('spinbutton')

// Select — trigger, then options
getByRole('button')     getByRole('option', { name })

// Tabs / TabbedPanel / TabStrip
getByRole('tab')        getByRole('tabpanel')

// Menu items; Modal / TabbedModal; Tooltip; Toast / labelled StatusDot
getByRole('menuitem')   getByRole('dialog')   getByRole('tooltip')   getByRole('status')`}
      />
    </>
  );
}
