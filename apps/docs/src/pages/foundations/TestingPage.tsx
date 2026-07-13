import { Callout, Heading, Text, Size, TextTone, Tone, useT } from '@glacier/react';
import { HighlightedCode, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

export function TestingPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.testName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.testLede))}
      </Text>

      <Heading level={2}>{t(m.testSec1)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.testSec1Body))}</Text>
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

      <Heading level={2}>{t(m.testSec2)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.testSec2Body))}</Text>
      <HighlightedCode
        language="tsx"
        code={`<StatTile data-testid="revenue" value="$48.2k" label="Revenue" />;

// in a test
const tile = screen.getByTestId('revenue');`}
      />

      <Heading level={2}>{t(m.testSec3)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.testSec3Body)}</Text>
      <HighlightedCode
        language="tsx"
        code={`import { within } from '@testing-library/react';

await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
const menu = screen.getByRole('menu');
await userEvent.click(within(menu).getByRole('menuitem', { name: 'Edit' }));`}
      />

      <Callout tone={Tone.Info} title={t(m.testCalloutTitle)}>
        {prose(t(m.testCalloutBody))}
      </Callout>

      <Heading level={2}>{t(m.testSec4)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.testSec4Body)}</Text>
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
