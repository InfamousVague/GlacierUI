import { Button, Row, Stack, Toast, ToastProvider, useToast, Heading, Text, Size, TextTone, Tone, Variant } from '@glacier/react';
import { Check } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';

function ToneDemo() {
  const { toast } = useToast();
  return (
    <Row gap={3} wrap>
      <Button variant={Variant.Soft} onClick={() => toast({ message: 'Draft saved to your library.' })}>
        Neutral
      </Button>
      <Button variant={Variant.Soft} onClick={() => toast({ tone: 'info', message: 'A new version is available.' })}>
        Info
      </Button>
      <Button variant={Variant.Soft} onClick={() => toast({ tone: 'success', message: 'Your changes were published.' })}>
        Success
      </Button>
      <Button variant={Variant.Soft} onClick={() => toast({ tone: 'warning', message: 'You are close to your storage limit.' })}>
        Warning
      </Button>
      <Button variant={Variant.Soft} onClick={() => toast({ tone: 'danger', message: 'Could not reach the server.' })}>
        Danger
      </Button>
    </Row>
  );
}

function IconDemo() {
  const { toast } = useToast();
  return (
    <Button
      variant={Variant.Soft}
      onClick={() =>
        toast({ tone: 'success', message: 'Copied to clipboard.', icon: <Check size={16} /> })
      }
    >
      Show toast with icon
    </Button>
  );
}

function LatestWinsDemo() {
  const { toast } = useToast();
  return (
    <Button
      variant={Variant.Soft}
      onClick={() => {
        toast({ message: 'Uploading photo 1 of 3' });
        setTimeout(() => toast({ message: 'Uploading photo 2 of 3' }), 600);
        setTimeout(() => toast({ tone: 'success', message: 'All 3 photos uploaded' }), 1200);
      }}
    >
      Run a burst
    </Button>
  );
}

function StickyDemo() {
  const { toast, dismiss } = useToast();
  return (
    <Row gap={3} wrap>
      <Button
        variant={Variant.Soft}
        onClick={() => toast({ tone: 'warning', message: 'Reconnecting to the network...', duration: 0 })}
      >
        Show sticky toast
      </Button>
      <Button variant={Variant.Ghost} onClick={dismiss}>
        Dismiss it
      </Button>
    </Row>
  );
}

export function ToastPage() {
  return (
    <>
      <Heading level={1}>Toast</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        Toast is a single-slot notification that slides up from the bottom center of the screen. It
        holds one message at a time: a new toast replaces the current one rather than stacking, a
        deliberate latest-wins design that keeps the corner quiet. Each toast dismisses itself on a
        tone-based timer, or on a click.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>
        Wrap your app once in a <code>ToastProvider</code>. It holds the current toast in state,
        portals it to <code>document.body</code>, and runs the auto-dismiss timer. Anywhere inside,
        call <code>useToast</code> to get a <code>toast()</code> function.
      </Text>

      <Heading level={2}>Examples</Heading>

      <ToastProvider>
        <Example
          title="Tones"
          description={
            <>
              Five tones set the meaning. <code>neutral</code> is the low-emphasis default. Reach
              for <code>success</code> to confirm and <code>danger</code> to report a failure. A
              danger toast announces assertively.
            </>
          }
          code={`import { ToastProvider, useToast } from '@glacier/react';

function Publish() {
  const { toast } = useToast();
  return (
    <Button onClick={() => toast({ tone: 'success', message: 'Your changes were published.' })}>
      Publish
    </Button>
  );
}

// Wrap the app once, near the root.
<ToastProvider>
  <Publish />
</ToastProvider>`}
        >
          <ToneDemo />
        </Example>

        <Example
          title="With an icon"
          description={
            <>
              Pass any node as <code>icon</code> to lead the pill with a glyph. The icon is
              decorative, so the message text should carry the meaning on its own.
            </>
          }
          code={`const { toast } = useToast();

toast({
  tone: 'success',
  message: 'Copied to clipboard.',
  icon: <Check size={16} />,
});`}
        >
          <IconDemo />
        </Example>

        <Example
          title="Latest wins"
          description={
            <>
              There is no queue. Firing several toasts in a row shows only the most recent one, so a
              burst of progress updates collapses to the latest state instead of piling up.
            </>
          }
          code={`const { toast } = useToast();

toast({ message: 'Uploading photo 1 of 3' });
setTimeout(() => toast({ message: 'Uploading photo 2 of 3' }), 600);
setTimeout(() => toast({ tone: 'success', message: 'All 3 photos uploaded' }), 1200);`}
        >
          <LatestWinsDemo />
        </Example>

        <Example
          title="Sticky and manual dismiss"
          description={
            <>
              A <code>duration</code> of <code>0</code> disables the auto-dismiss timer, so the
              toast stays until you dismiss it. Call <code>dismiss()</code> to clear it, or let the
              user press the pill.
            </>
          }
          code={`const { toast, dismiss } = useToast();

toast({ tone: 'warning', message: 'Reconnecting to the network...', duration: 0 });
// later
dismiss();`}
        >
          <StickyDemo />
        </Example>
      </ToastProvider>

      <Example
        title="The pill on its own"
        description={
          <>
            The visual <code>Toast</code> pill is exported too, for static previews. In an app you
            almost always drive it through the provider rather than rendering it directly.
          </>
        }
        code={`<Toast tone={Tone.Success} message="Your changes were published." />
<Toast tone={Tone.Danger} message="Could not reach the server." />
<Toast skeleton message="" />`}
      >
        <Stack gap={3} style={{ width: '100%', maxWidth: '28rem' }}>
          <Toast tone={Tone.Success} message="Your changes were published." dismissible={false} />
          <Toast tone={Tone.Danger} message="Could not reach the server." dismissible={false} />
          <Toast skeleton message="" />
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <Text tone={TextTone.Muted}>
        <code>useToast().toast(options)</code> accepts the options below. The <code>Toast</code> pill
        component takes the same visual props plus <code>message</code>.
      </Text>
      <PropsTable
        props={[
          {
            name: 'message',
            type: 'ReactNode',
            description: 'The notification content. Required.',
          },
          {
            name: 'tone',
            type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
            default: "'neutral'",
            description: 'Semantic color of the pill. danger also announces as an assertive alert.',
          },
          {
            name: 'icon',
            type: 'ReactNode',
            description: 'Optional decorative glyph rendered before the message.',
          },
          {
            name: 'duration',
            type: 'number',
            default: '3500 to 7000 by tone',
            description:
              'Auto-dismiss delay in milliseconds. Success defaults to 3500, danger to 7000, others to 4500. 0 disables the timer.',
          },
          {
            name: 'dismissible',
            type: 'boolean',
            default: 'true',
            description: 'Whether a trailing close control is shown. The whole pill is clickable regardless.',
          },
          {
            name: 'glass',
            type: 'boolean',
            default: 'false',
            description: 'Renders the frosted glass material instead of a solid tone surface.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the pill's exact geometry (Toast component only).",
          },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          A danger toast renders with <code>role="alert"</code> and <code>aria-live="assertive"</code>,
          so assistive technology announces failures promptly. Other tones use <code>role="status"</code>{' '}
          with <code>aria-live="polite"</code>.
        </li>
        <li>
          Do not rely on tone color alone to carry meaning. The message text should state the outcome
          on its own, and any <code>icon</code> is decorative.
        </li>
        <li>
          The dismiss control carries <code>aria-label="Dismiss"</code>. The whole pill is also
          clickable, so a pointer press anywhere on it clears the toast.
        </li>
        <li>
          Because a toast is transient, avoid putting an action a user must take inside it. If a
          message needs a response, use a Modal or an inline Callout instead.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Mount one <code>ToastProvider</code> near the root of the app. A single provider owns the
          one slot, so toasts fired from anywhere share it and the latest one wins.
        </li>
        <li>
          Keep the message to a short sentence. A toast confirms a background result; it is not the
          place for a paragraph or a form.
        </li>
        <li>
          Match the tone to the stakes. Use <code>neutral</code> and <code>info</code> for quiet
          confirmations, <code>success</code> for completed work, and reserve <code>warning</code> and{' '}
          <code>danger</code> for problems.
        </li>
        <li>
          Lengthen <code>duration</code> for messages that need more reading time, or set it to{' '}
          <code>0</code> for a state the user should acknowledge, then clear it with{' '}
          <code>dismiss()</code>.
        </li>
      </ul>
    </>
  );
}
