import { Banner, Box, Button, Stack, Heading, Text, Size, TextTone, Tone, Variant } from '@glacier/react';
import { TriangleAlert } from '@glacier/icons';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable } from '../../docs-ui.tsx';

export function BannerPage() {
  const [dismissed, setDismissed] = useState(false);
  return (
    <>
      <Heading level={1}>Banner</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A full-width inline alert strip for app chrome. A Banner announces a system message across the
        top of a view or region, pairing a short message with an optional action and a dismiss control,
        tinting its surface and border by tone.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="banner" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Tones"
        description={
          <>
            Six tones set the meaning. <code>info</code> is the neutral-informational default.{' '}
            <code>neutral</code> and <code>accent</code> carry context, <code>success</code> confirms,
            and <code>warning</code> and <code>danger</code> flag risk and carry an assertive role.
          </>
        }
        code={`import { Banner } from '@glacier/react';

<Banner tone={Tone.Info}>A new version is available.</Banner>
<Banner tone={Tone.Neutral}>Read-only mode is on.</Banner>
<Banner tone={Tone.Accent}>You are on the early access plan.</Banner>
<Banner tone={Tone.Success}>Your changes were published.</Banner>
<Banner tone={Tone.Warning}>Your trial ends in three days.</Banner>
<Banner tone={Tone.Danger}>We could not reach the server.</Banner>`}
      >
        <Stack gap={3} style={{ width: '100%', maxWidth: '38rem' }}>
          <Banner tone={Tone.Info}>A new version is available.</Banner>
          <Banner tone={Tone.Neutral}>Read-only mode is on.</Banner>
          <Banner tone={Tone.Accent}>You are on the early access plan.</Banner>
          <Banner tone={Tone.Success}>Your changes were published.</Banner>
          <Banner tone={Tone.Warning}>Your trial ends in three days.</Banner>
          <Banner tone={Tone.Danger}>We could not reach the server.</Banner>
        </Stack>
      </Example>

      <Example
        title="With an icon"
        description={
          <>
            Pass any node as <code>icon</code> to lead the strip with a glyph. The icon sits in a fixed
            leading slot, centered with the message.
          </>
        }
        code={`<Banner tone={Tone.Warning} icon={<TriangleAlert size={18} />}>
  Your trial ends in three days.
</Banner>`}
      >
        <Box style={{ width: '100%', maxWidth: '38rem' }}>
          <Banner tone={Tone.Warning} icon={<TriangleAlert size={18} />}>
            Your trial ends in three days.
          </Banner>
        </Box>
      </Example>

      <Example
        title="With an action"
        description={
          <>
            The <code>action</code> slot holds a trailing control, typically a Button. Keep it to a
            single, low-emphasis affordance so the message stays the focus.
          </>
        }
        code={`<Banner tone={Tone.Info} action={<Button size={Size.Small} variant={Variant.Soft}>Update</Button>}>
  A new version is available.
</Banner>`}
      >
        <Box style={{ width: '100%', maxWidth: '38rem' }}>
          <Banner
            tone={Tone.Info}
            action={
              <Button size={Size.Small} variant={Variant.Soft}>
                Update
              </Button>
            }
          >
            A new version is available.
          </Banner>
        </Box>
      </Example>

      <Example
        title="Dismissible"
        description={
          <>
            Pass <code>onDismiss</code> to render a trailing close IconButton. The strip is app chrome,
            so dismissal is the caller's job: hide the Banner in response.
          </>
        }
        code={`const [dismissed, setDismissed] = useState(false);

{!dismissed && (
  <Banner tone={Tone.Success} onDismiss={() => setDismissed(true)}>
    Your changes were published.
  </Banner>
)}`}
      >
        <Box style={{ width: '100%', maxWidth: '38rem', minHeight: '3rem' }}>
          {dismissed ? (
            <Button size={Size.Small} variant={Variant.Ghost} onClick={() => setDismissed(false)}>
              Restore banner
            </Button>
          ) : (
            <Banner tone={Tone.Success} onDismiss={() => setDismissed(true)}>
              Your changes were published.
            </Banner>
          )}
        </Box>
      </Example>

      <Example
        title="Skeleton"
        description={
          <>
            <code>skeleton</code> renders a shimmer block at the banner's radius and a representative
            height, so the surrounding layout holds while content loads.
          </>
        }
        code={`<Banner skeleton />
<Banner tone={Tone.Info}>Loaded content.</Banner>`}
      >
        <Stack gap={3} style={{ width: '100%', maxWidth: '38rem' }}>
          <Banner skeleton />
          <Banner tone={Tone.Info}>Loaded content.</Banner>
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          {
            name: 'tone',
            type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'",
            default: "'info'",
            description:
              'Semantic color of the strip. warning and danger also set an assertive alert role.',
          },
          {
            name: 'icon',
            type: 'ReactNode',
            description: 'Optional glyph rendered in a leading slot.',
          },
          {
            name: 'action',
            type: 'ReactNode',
            description: 'Optional trailing slot, typically a Button.',
          },
          {
            name: 'onDismiss',
            type: '() => void',
            description: 'When set, renders a trailing close IconButton that calls this.',
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'Message content of the banner.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          Neutral, accent, success, and info banners render with <code>role="status"</code>, a polite
          live region. Warning and danger banners render with <code>role="alert"</code>, so assistive
          technology announces them promptly.
        </li>
        <li>
          Reserve <code>role="alert"</code> tones for content that genuinely needs immediate attention.
          Overusing warning and danger trains users to ignore them.
        </li>
        <li>
          The dismiss control is an IconButton labelled <code>Dismiss</code>, so it is reachable and
          announced. Removing the Banner from the flow is the caller's responsibility.
        </li>
        <li>
          Do not rely on tone color alone to carry meaning. The message text should state the point on
          its own, and any <code>icon</code> is decorative.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Use a Banner for a system message that spans a view or region: a maintenance notice, a plan
          status, a connection problem. For an aside inside prose, use a Callout instead.
        </li>
        <li>
          Keep the message to a single line where you can, and pair it with at most one action. A Banner
          is a strip, not a dialog.
        </li>
        <li>
          Match the tone to the stakes. Use <code>neutral</code>, <code>accent</code>, and{' '}
          <code>info</code> for context, <code>success</code> for confirmation, and reserve{' '}
          <code>warning</code> and <code>danger</code> for risk.
        </li>
      </ul>
    </>
  );
}
