import { useState } from 'react';
import { Button, IconButton } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

const plusIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M8 3v10M3 8h10" />
  </svg>
);

export function ButtonPage() {
  const [saving, setSaving] = useState(false);

  return (
    <>
      <h1>Button</h1>
      <p className="lede">
        Buttons trigger actions. Use <code>Button</code> for labeled actions and{' '}
        <code>IconButton</code> for compact, icon-only controls such as toolbars and card corners.
      </p>

      <h2>Examples</h2>

      <Example
        title="Variants"
        description={
          <>
            Six variants cover the full emphasis range. <code>solid</code> is the default and marks
            the primary action. <code>glass</code> is a translucent blurred material for use over
            imagery or other glass surfaces.
          </>
        }
        code={`import { Button, IconButton } from '@perfect/react';

<Button>Solid</Button>
<Button variant="soft">Soft</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="glass">Glass</Button>
<Button variant="danger">Danger</Button>`}
      >
        <div className="row">
          <Button>Solid</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="glass">Glass</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </Example>

      <Example
        title="Sizes"
        description={
          <>
            Three sizes share one height scale with every other control. <code>md</code> is the
            default.
          </>
        }
        code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`}
      >
        <div className="row" style={{ alignItems: 'center' }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
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
        <div className="row">
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
        </div>
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
<Button variant="soft" fullWidth>
  Sign in instead
</Button>`}
      >
        <div className="stack" style={{ maxWidth: 320, width: '100%' }}>
          <Button fullWidth>Create account</Button>
          <Button variant="soft" fullWidth>
            Sign in instead
          </Button>
        </div>
      </Example>

      <Example
        title="IconButton"
        description={
          <>
            A square button for a single icon. <code>aria-label</code> is required because there is
            no visible text. The default variant is <code>ghost</code>.
          </>
        }
        code={`const plus = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
    aria-hidden="true">
    <path d="M8 3v10M3 8h10" />
  </svg>
);

<IconButton aria-label="Add item">{plus}</IconButton>
<IconButton aria-label="Add item" variant="solid">{plus}</IconButton>
<IconButton aria-label="Add item" variant="outline" size="sm">{plus}</IconButton>
<IconButton aria-label="Add item" variant="soft" size="lg">{plus}</IconButton>`}
      >
        <div className="row" style={{ alignItems: 'center' }}>
          <IconButton aria-label="Add item">{plusIcon}</IconButton>
          <IconButton aria-label="Add item" variant="solid">
            {plusIcon}
          </IconButton>
          <IconButton aria-label="Add item" variant="outline" size="sm">
            {plusIcon}
          </IconButton>
          <IconButton aria-label="Add item" variant="soft" size="lg">
            {plusIcon}
          </IconButton>
        </div>
      </Example>

      <Example
        title="Skeleton"
        description="The skeleton prop renders a placeholder with the button's exact geometry, so nothing shifts when the real control mounts."
        code={`<Button skeleton />
<Button skeleton size="lg" />
<Button skeleton fullWidth />
<IconButton skeleton aria-label="Add item" />`}
      >
        <Button skeleton />
        <Button skeleton size="lg" />
        <IconButton skeleton aria-label="Add item" />
      </Example>

      <h2>Props</h2>

      <h3>Button</h3>
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

      <h3>IconButton</h3>
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

      <h2>Accessibility</h2>
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

      <h2>Usage</h2>
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
