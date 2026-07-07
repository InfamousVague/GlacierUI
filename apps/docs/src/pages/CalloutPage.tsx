import { Box, Callout, Stack } from '@perfect/react';
import { ComponentBlueprint } from '../Blueprint.tsx';
import { Example, PropsTable } from '../docs-ui.tsx';

export function CalloutPage() {
  return (
    <>
      <h1>Callout</h1>
      <p className="lede">
        An admonition box for notes, tips, and warnings. A Callout draws the eye to a short aside
        without pulling the reader out of the flow, tinting its surface and border by tone.
      </p>

      <h2>Anatomy</h2>
      <p>An inspection with the exact spec measurements labelled on the box.</p>
      <ComponentBlueprint specId="callout" />

      <h2>Examples</h2>

      <Example
        title="Tones"
        description={
          <>
            Five tones set the meaning. <code>note</code> is the neutral default on a sunken surface.{' '}
            <code>info</code> and <code>success</code> annotate and confirm, while{' '}
            <code>warning</code> and <code>danger</code> flag risk and carry an assertive role.
          </>
        }
        code={`import { Callout } from '@perfect/react';

<Callout title="Note">A neutral aside on the default surface.</Callout>
<Callout tone="info" title="Info">Extra context that is good to know.</Callout>
<Callout tone="success" title="Success">Your changes were saved.</Callout>
<Callout tone="warning" title="Warning">This will overwrite existing data.</Callout>
<Callout tone="danger" title="Danger">This action cannot be undone.</Callout>`}
      >
        <Stack gap={4} style={{ width: '100%', maxWidth: '34rem' }}>
          <Callout title="Note">A neutral aside on the default surface.</Callout>
          <Callout tone="info" title="Info">
            Extra context that is good to know.
          </Callout>
          <Callout tone="success" title="Success">
            Your changes were saved.
          </Callout>
          <Callout tone="warning" title="Warning">
            This will overwrite existing data.
          </Callout>
          <Callout tone="danger" title="Danger">
            This action cannot be undone.
          </Callout>
        </Stack>
      </Example>

      <Example
        title="With an icon"
        description={
          <>
            Pass any node as <code>icon</code> to lead the callout with a glyph. The icon sits in a
            fixed leading column so the title and body align regardless of length.
          </>
        }
        code={`<Callout tone="info" title="Keyboard shortcut" icon={<span aria-hidden>💡</span>}>
  Press <kbd>⌘K</kbd> anywhere to open the command palette.
</Callout>`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <Callout tone="info" title="Keyboard shortcut" icon={<span aria-hidden>💡</span>}>
            Press the command key with K anywhere to open the command palette.
          </Callout>
        </Box>
      </Example>

      <Example
        title="Body only"
        description="The title is optional. Omit it for a single line of guidance where a heading would add noise."
        code={`<Callout tone="success">Everything is up to date.</Callout>`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <Callout tone="success">Everything is up to date.</Callout>
        </Box>
      </Example>

      <Example
        title="Skeleton"
        description={
          <>
            <code>skeleton</code> renders a shimmer block at the callout's radius and a representative
            height, so the surrounding layout holds while content loads.
          </>
        }
        code={`<Callout skeleton />
<Callout tone="info" title="Info">Loaded content.</Callout>`}
      >
        <Stack gap={4} style={{ width: '100%', maxWidth: '34rem' }}>
          <Callout skeleton />
          <Callout tone="info" title="Info">
            Loaded content.
          </Callout>
        </Stack>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          {
            name: 'tone',
            type: "'note' | 'info' | 'success' | 'warning' | 'danger'",
            default: "'note'",
            description:
              'Semantic color of the box. warning and danger also set an assertive alert role.',
          },
          {
            name: 'title',
            type: 'ReactNode',
            description: 'Optional bold line above the body.',
          },
          {
            name: 'icon',
            type: 'ReactNode',
            description: 'Optional glyph rendered in a leading column.',
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'Body content of the callout.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          Note, info, and success callouts render with <code>role="note"</code>. Warning and danger
          callouts render with <code>role="alert"</code>, so assistive technology announces them
          promptly.
        </li>
        <li>
          Reserve <code>role="alert"</code> tones for content that genuinely needs immediate
          attention. Overusing warning and danger trains users to ignore them.
        </li>
        <li>
          Do not rely on tone color alone to carry meaning. The title and body text should state the
          message on their own, and any <code>icon</code> is decorative.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>
          Use a Callout for a short, self-contained aside next to the main flow: a tip, a caveat, a
          prerequisite. For long-form content, use ordinary body text.
        </li>
        <li>
          Keep callouts to a sentence or two. If the message needs several paragraphs, it belongs in
          the body of the page, not an admonition.
        </li>
        <li>
          Match the tone to the stakes. Use <code>note</code> and <code>info</code> for context,{' '}
          <code>success</code> for confirmation, and reserve <code>warning</code> and{' '}
          <code>danger</code> for risk.
        </li>
      </ul>
    </>
  );
}
