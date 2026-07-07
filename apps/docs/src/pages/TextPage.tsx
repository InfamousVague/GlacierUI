import { Text, Heading, Label, Link, Kbd, Input, Stack } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function TextPage() {
  return (
    <>
      <h1>Text &amp; Headings</h1>
      <p className="lede">
        The typography atoms put every piece of copy on the kit's type scale. <code>Text</code> and{' '}
        <code>Heading</code> cover body copy and titles, while <code>Label</code>,{' '}
        <code>Link</code>, and <code>Kbd</code> handle form captions, anchors, and keyboard keys.
      </p>

      <h2>Examples</h2>

      <Example
        title="Sizes and tones"
        description={
          <>
            Four sizes map to the fluid type scale, and seven tones map to the semantic color
            ramps. <code>muted</code> and <code>subtle</code> step down contrast for secondary and
            tertiary copy.
          </>
        }
        code={`import { Text, Heading, Label, Link, Kbd, Input } from '@perfect/react';

<Text size="lg">Large body text for intros.</Text>
<Text>Default body text at the base size.</Text>
<Text size="sm" tone="muted">Small muted text for secondary copy.</Text>
<Text size="xs" tone="subtle">Extra small subtle text for fine print.</Text>
<Text tone="accent">Accent tone for emphasis.</Text>
<Text tone="danger">Danger tone for errors.</Text>
<Text tone="success">Success tone for confirmations.</Text>
<Text tone="warning">Warning tone for cautions.</Text>`}
      >
        <Stack gap={4}>
          <Text size="lg">Large body text for intros.</Text>
          <Text>Default body text at the base size.</Text>
          <Text size="sm" tone="muted">
            Small muted text for secondary copy.
          </Text>
          <Text size="xs" tone="subtle">
            Extra small subtle text for fine print.
          </Text>
          <Text tone="accent">Accent tone for emphasis.</Text>
          <Text tone="danger">Danger tone for errors.</Text>
          <Text tone="success">Success tone for confirmations.</Text>
          <Text tone="warning">Warning tone for cautions.</Text>
        </Stack>
      </Example>

      <Example
        title="Weights"
        description={
          <>
            Four weights, all on the same size. Use <code>as="span"</code> or{' '}
            <code>as="strong"</code> to change the rendered element without leaving the scale.
          </>
        }
        code={`<Text weight="regular">Regular is the default weight.</Text>
<Text weight="medium">Medium adds gentle emphasis.</Text>
<Text weight="semibold">Semibold suits inline labels.</Text>
<Text as="strong" weight="bold">Bold renders a strong element here.</Text>`}
      >
        <Stack gap={4}>
          <Text weight="regular">Regular is the default weight.</Text>
          <Text weight="medium">Medium adds gentle emphasis.</Text>
          <Text weight="semibold">Semibold suits inline labels.</Text>
          <Text as="strong" weight="bold">
            Bold renders a strong element here.
          </Text>
        </Stack>
      </Example>

      <Example
        title="Heading levels"
        description={
          <>
            <code>level</code> sets both the rendered <code>h</code> tag and the visual size.
            Level 6 renders as an uppercase subtle eyebrow, useful above cards and sections.
          </>
        }
        code={`<Heading level={1}>Heading one</Heading>
<Heading level={2}>Heading two</Heading>
<Heading level={3}>Heading three</Heading>
<Heading level={4}>Heading four</Heading>
<Heading level={5}>Heading five</Heading>
<Heading level={6}>Heading six eyebrow</Heading>`}
      >
        <Stack gap={4}>
          <Heading level={1}>Heading one</Heading>
          <Heading level={2}>Heading two</Heading>
          <Heading level={3}>Heading three</Heading>
          <Heading level={4}>Heading four</Heading>
          <Heading level={5}>Heading five</Heading>
          <Heading level={6}>Heading six eyebrow</Heading>
        </Stack>
      </Example>

      <Example
        title="Semantic vs visual level"
        description={
          <>
            <code>visualLevel</code> overrides the size while <code>level</code> keeps the correct
            place in the document outline. Both headings below are <code>h3</code> elements.
          </>
        }
        code={`<Heading level={3} visualLevel={1}>
  An h3 that displays at h1 size
</Heading>
<Heading level={3} visualLevel={6}>
  An h3 styled as an eyebrow
</Heading>`}
      >
        <Stack gap={4}>
          <Heading level={3} visualLevel={1}>
            An h3 that displays at h1 size
          </Heading>
          <Heading level={3} visualLevel={6}>
            An h3 styled as an eyebrow
          </Heading>
        </Stack>
      </Example>

      <Example
        title="Label with an input"
        description={
          <>
            <code>Label</code> renders a native label element. Connect it to its control with{' '}
            <code>htmlFor</code>, and set <code>required</code> to append the required marker.
          </>
        }
        code={`<Label htmlFor="email" required>
  Email address
</Label>
<Input id="email" type="email" placeholder="you@example.com" />`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <Label htmlFor="email" required>
            Email address
          </Label>
          <Input id="email" type="email" placeholder="you@example.com" />
        </Stack>
      </Example>

      <Example
        title="Inline links and keys"
        description={
          <>
            <code>Link</code> and <code>Kbd</code> sit inside running text. <code>Kbd</code>{' '}
            scales with the surrounding font size, so it works at any <code>Text</code> size.
          </>
        }
        code={`<Text>
  Read the <Link href="#">release notes</Link>, then press{' '}
  <Kbd>Cmd</Kbd> <Kbd>K</Kbd> to open the command palette.
</Text>
<Text size="sm" tone="muted">
  Undo with <Kbd>Cmd</Kbd> <Kbd>Z</Kbd> at any time.
</Text>`}
      >
        <Stack gap={4}>
          <Text>
            Read the <Link href="#">release notes</Link>, then press <Kbd>Cmd</Kbd> <Kbd>K</Kbd> to
            open the command palette.
          </Text>
          <Text size="sm" tone="muted">
            Undo with <Kbd>Cmd</Kbd> <Kbd>Z</Kbd> at any time.
          </Text>
        </Stack>
      </Example>

      <Example
        title="Skeleton"
        description={
          <>
            Every typography atom takes a <code>skeleton</code> prop that renders a shimmer line at
            the same font size as the real element, so copy does not shift when it arrives.{' '}
            <code>Kbd</code> renders a small key cap block instead of a line.
          </>
        }
        code={`<Heading level={3} skeleton />
<Heading level={3}>Release notes</Heading>
<Text skeleton />
<Text>Default body text at the base size.</Text>
<Label skeleton />
<Label>Email address</Label>
<Text>
  Press <Kbd skeleton /> or read the <Link skeleton />.
</Text>`}
      >
        <Stack gap={4}>
          <Heading level={3} skeleton />
          <Heading level={3}>Release notes</Heading>
          <Text skeleton />
          <Text>Default body text at the base size.</Text>
          <Label skeleton />
          <Label>Email address</Label>
          <Text>
            Press <Kbd skeleton /> or read the <Link skeleton />.
          </Text>
        </Stack>
      </Example>

      <h2>Props</h2>

      <h3>Text</h3>
      <PropsTable
        props={[
          {
            name: 'as',
            type: "'p' | 'span' | 'div' | 'strong' | 'em' | 'small'",
            default: "'p'",
            description: 'Rendered element. Styling stays the same across all of them.',
          },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Font size step on the fluid type scale.',
          },
          {
            name: 'tone',
            type: "'default' | 'muted' | 'subtle' | 'accent' | 'danger' | 'success' | 'warning'",
            default: "'default'",
            description: 'Text color from the semantic ramps.',
          },
          {
            name: 'weight',
            type: "'regular' | 'medium' | 'semibold' | 'bold'",
            default: "'regular'",
            description: 'Font weight.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'native props',
            type: "ComponentProps<'p'>",
            description: 'All native props of the rendered element pass through.',
          },
        ]}
      />

      <h3>Heading</h3>
      <PropsTable
        props={[
          {
            name: 'level',
            type: '1 | 2 | 3 | 4 | 5 | 6',
            default: '2',
            description:
              'Semantic heading level. Sets the rendered h tag and, unless visualLevel is given, the visual size. Level 6 renders in an uppercase subtle eyebrow style.',
          },
          {
            name: 'visualLevel',
            type: '1 | 2 | 3 | 4 | 5 | 6',
            description: 'Visual size override when the document outline and the looks disagree.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'native props',
            type: "ComponentProps<'h2'>",
            description: 'All native heading props pass through.',
          },
        ]}
      />

      <h3>Label</h3>
      <PropsTable
        props={[
          {
            name: 'required',
            type: 'boolean',
            default: 'false',
            description: 'Appends a required marker after the label text.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'native props',
            type: "ComponentProps<'label'>",
            description: 'All native label props pass through, including htmlFor.',
          },
        ]}
      />

      <h3>Link</h3>
      <PropsTable
        props={[
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'native props',
            type: "ComponentProps<'a'>",
            description:
              'All native anchor props pass through, including href, target, and rel. Accent colored, underlines on hover, shows a focus ring.',
          },
        ]}
      />

      <h3>Kbd</h3>
      <PropsTable
        props={[
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'native props',
            type: "ComponentProps<'kbd'>",
            description:
              'All native kbd props pass through. Monospace key cap style that scales with the surrounding font size.',
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          <code>Heading</code> always renders a real <code>h1</code> through <code>h6</code>{' '}
          element, so screen readers and the document outline see the semantic level even when{' '}
          <code>visualLevel</code> changes the size.
        </li>
        <li>
          <code>Label</code> renders a native <code>label</code> element. With <code>htmlFor</code>{' '}
          it names the control and clicking it moves focus to the input. The required marker is{' '}
          <code>aria-hidden</code>, so mark the input itself with <code>required</code> or{' '}
          <code>aria-required</code>.
        </li>
        <li>
          <code>Link</code> renders a native anchor with a visible focus ring. Give links that open
          in a new tab <code>rel="noreferrer"</code>.
        </li>
        <li>
          <code>Kbd</code> renders a native <code>kbd</code> element, which assistive technology
          announces as keyboard input.
        </li>
        <li>
          The <code>muted</code> and <code>subtle</code> tones reduce contrast. Keep them for
          secondary copy and do not set body text below <code>sm</code> in <code>subtle</code>.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>
          Use <code>Text</code> instead of raw <code>p</code> or <code>span</code> elements so all
          copy sits on the type scale and picks up theme tones.
        </li>
        <li>
          Keep one <code>h1</code> per page: a single <code>Heading level={'{1}'}</code> for the
          page title, then <code>level={'{2}'}</code> and below for sections.
        </li>
        <li>
          Reach for <code>visualLevel</code> whenever the document outline and the desired size
          disagree, for example a card title that must be an <code>h3</code> but should read small.
        </li>
        <li>
          Use <code>tone</code> to carry meaning: <code>danger</code> for errors,{' '}
          <code>success</code> for confirmations, <code>warning</code> for cautions. Avoid using
          tones purely as decoration.
        </li>
        <li>
          Pair every form control with a <code>Label</code> and <code>htmlFor</code>. For full
          field layouts with help and error text, use the <code>Field</code> molecule instead.
        </li>
      </ul>
    </>
  );
}
