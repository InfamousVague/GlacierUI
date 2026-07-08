import { useState } from 'react';
import { Button, IconButton, Row, Stack, Heading, Text, Size, TextTone, Variant } from '@glacier/react';
import { Plus } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const plusIcon = <Plus size={16} />;

export function ButtonPage() {
  const [saving, setSaving] = useState(false);

  return (
    <>
      <Heading level={1}>Button</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        Buttons trigger actions. Use <code>Button</code> for labeled actions and{' '}
        <code>IconButton</code> for compact, icon-only controls such as toolbars and card corners.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="button" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Variants"
        description={
          <>
            Six variants cover the full emphasis range. <code>solid</code> is the default and marks
            the primary action. <code>glass</code> is a translucent blurred material for use over
            imagery or other glass surfaces.
          </>
        }
        code={`import { Button, IconButton } from '@glacier/react';

<Button>Solid</Button>
<Button variant={Variant.Soft}>Soft</Button>
<Button variant={Variant.Outline}>Outline</Button>
<Button variant={Variant.Ghost}>Ghost</Button>
<Button variant={Variant.Glass}>Glass</Button>
<Button variant={Variant.Danger}>Danger</Button>`}
      >
        <Row gap={4} wrap>
          <Button>Solid</Button>
          <Button variant={Variant.Soft}>Soft</Button>
          <Button variant={Variant.Outline}>Outline</Button>
          <Button variant={Variant.Ghost}>Ghost</Button>
          <Button variant={Variant.Glass}>Glass</Button>
          <Button variant={Variant.Danger}>Danger</Button>
        </Row>
      </Example>

      <Example
        title="Sizes"
        description={
          <>
            Three sizes share one height scale with every other control. <code>md</code> is the
            default.
          </>
        }
        code={`<Button size={Size.Small}>Small</Button>
<Button size={Size.Medium}>Medium</Button>
<Button size={Size.Large}>Large</Button>`}
      >
        <Row gap={4} wrap>
          <Button size={Size.Small}>Small</Button>
          <Button size={Size.Medium}>Medium</Button>
          <Button size={Size.Large}>Large</Button>
        </Row>
      </Example>

      <Example
        title="Loading and disabled"
        description={
          <>
            <code>loading</code> shows a spinner and disables the button so it cannot be activated
            while an async action is pending. Click the first button to see the state. Disabled
            buttons skip the press animation.
          </>
        }
        code={`const [saving, setSaving] = useState(false);

<Button
  loading={saving}
  onClick={() => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  }}
>
  Save changes
</Button>
<Button loading>Loading</Button>
<Button disabled>Disabled</Button>`}
      >
        <Row gap={4} wrap>
          <Button
            loading={saving}
            onClick={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 1500);
            }}
          >
            Save changes
          </Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Row>
      </Example>

      <Example
        title="Full width"
        description={
          <>
            <code>fullWidth</code> stretches the button to its container. Use it in narrow layouts
            such as forms, dialogs, and mobile sheets.
          </>
        }
        code={`<Button fullWidth>Create account</Button>
<Button variant={Variant.Soft} fullWidth>
  Sign in instead
</Button>`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <Button fullWidth>Create account</Button>
          <Button variant={Variant.Soft} fullWidth>
            Sign in instead
          </Button>
        </Stack>
      </Example>

      <Example
        title="IconButton"
        description={
          <>
            A square button for a single icon. <code>aria-label</code> is required because there is
            no visible text. The default variant is <code>ghost</code>.
          </>
        }
        code={`import { Plus } from '@glacier/icons';

<IconButton aria-label="Add item"><Plus size={16} /></IconButton>
<IconButton aria-label="Add item" variant={Variant.Solid}><Plus size={16} /></IconButton>
<IconButton aria-label="Add item" variant={Variant.Outline} size={Size.Small}><Plus size={16} /></IconButton>
<IconButton aria-label="Add item" variant={Variant.Soft} size={Size.Large}><Plus size={16} /></IconButton>`}
      >
        <Row gap={4} wrap>
          <IconButton aria-label="Add item">{plusIcon}</IconButton>
          <IconButton aria-label="Add item" variant={Variant.Solid}>
            {plusIcon}
          </IconButton>
          <IconButton aria-label="Add item" variant={Variant.Outline} size={Size.Small}>
            {plusIcon}
          </IconButton>
          <IconButton aria-label="Add item" variant={Variant.Soft} size={Size.Large}>
            {plusIcon}
          </IconButton>
        </Row>
      </Example>

      <Example
        title="Skeleton"
        description="The skeleton prop renders a placeholder with the button's exact geometry, so nothing shifts when the real control mounts."
        code={`<Button skeleton />
<Button skeleton size={Size.Large} />
<Button skeleton fullWidth />
<IconButton skeleton aria-label="Add item" />`}
      >
        <Button skeleton />
        <Button skeleton size={Size.Large} />
        <IconButton skeleton aria-label="Add item" />
      </Example>

      <Heading level={2}>Props</Heading>

      <Heading level={3}>Button</Heading>
      <PropsTable
        props={[
          {
            name: 'variant',
            type: "'solid' | 'soft' | 'outline' | 'ghost' | 'glass' | 'danger'",
            default: "'solid'",
            description: 'Visual emphasis. glass is a translucent blurred material.',
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Control height and padding, shared with the other form controls.',
          },
          {
            name: 'loading',
            type: 'boolean',
            default: 'false',
            description: 'Shows a spinner and disables the button while pending.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'fullWidth',
            type: 'boolean',
            default: 'false',
            description: 'Stretches the button to fill its container.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: 'Disables the button. All other native button props are forwarded.',
          },
        ]}
      />

      <Heading level={3}>IconButton</Heading>
      <PropsTable
        props={[
          {
            name: 'aria-label',
            type: 'string',
            description: 'Required. Names the control for assistive technology.',
          },
          {
            name: 'variant',
            type: "'solid' | 'soft' | 'outline' | 'ghost' | 'glass' | 'danger'",
            default: "'ghost'",
            description: 'Visual emphasis, same set as Button.',
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Square dimension matching the Button height scale.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: 'Disables the button. All other native button props are forwarded.',
          },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          Both components render a native <code>button</code> element with{' '}
          <code>type="button"</code>, so Enter and Space activate them and focus follows platform
          conventions.
        </li>
        <li>
          <code>loading</code> sets the native <code>disabled</code> attribute, which prevents
          activation and removes the button from the tab order while pending. The spinner is{' '}
          <code>aria-hidden</code>.
        </li>
        <li>
          <code>IconButton</code> requires <code>aria-label</code> because it has no visible text.
          Pass icons with <code>aria-hidden</code> so screen readers announce only the label.
        </li>
        <li>
          The press micro-animation is skipped when <code>prefers-reduced-motion</code> is set, and
          for disabled or loading buttons.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Use <code>solid</code> for the primary action and keep one primary action per view. Use{' '}
          <code>soft</code> or <code>outline</code> for secondary actions next to it.
        </li>
        <li>
          Use <code>ghost</code> for low-emphasis actions in dense areas such as toolbars and table
          rows. Use <code>glass</code> only over imagery or other translucent surfaces where a
          solid fill would look heavy.
        </li>
        <li>
          Reserve <code>danger</code> for destructive actions, and pair it with a confirmation step
          when the action cannot be undone.
        </li>
        <li>
          Prefer <code>loading</code> over manually disabling the button during async work. It
          keeps the label visible and communicates progress.
        </li>
        <li>
          Use <code>IconButton</code> only when the icon meaning is unambiguous, for example close,
          add, or settings. Otherwise use a <code>Button</code> with a text label.
        </li>
      </ul>
    </>
  );
}
