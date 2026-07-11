import { Button, Heading, Row, Size, Text, TextTone, Variant, useHaptics, type HapticKind } from '@glacier/react';
import { Example } from '../../docs-ui.tsx';

const KINDS: HapticKind[] = ['selection', 'light', 'medium', 'heavy', 'success', 'warning', 'error'];

// The demo fires through the same hook every component uses, so it goes through
// the master preference gate and any injected native impl.
function KindButtons() {
  const fire = useHaptics();
  return (
    <Row gap={2} wrap>
      {KINDS.map((kind) => (
        <Button key={kind} variant={Variant.Outline} size={Size.Small} onClick={() => fire(kind)}>
          {kind}
        </Button>
      ))}
    </Row>
  );
}

export function HapticsPage() {
  return (
    <>
      <Heading level={1}>Haptics</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        Components describe feedback with semantic kinds - <code>selection</code>, <code>light</code>,{' '}
        <code>success</code> - and <code>HapticsProvider</code> decides whether and how to buzz. The
        whole engine is gated behind one user preference (off by default), so call sites fire
        unconditionally and stay silent until the user opts in.
      </Text>

      <Heading level={2}>What actually vibrates</Heading>
      <Text tone={TextTone.Muted}>
        The web platform is honest about very little here, so the kit is honest instead. Rich impact
        haptics only exist in native shells; on the web the engine degrades per platform and is a
        clean no-op where nothing can vibrate.
      </Text>
      <div className="propsTableWrap">
        <table className="tokenTable">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Mechanism</th>
              <th>Fidelity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Android (Chrome, Firefox)</td>
              <td>
                <code>navigator.vibrate()</code> with per-kind durations and patterns
              </td>
              <td>Intensity approximated by duration; patterns for success, warning, and error.</td>
            </tr>
            <tr>
              <td>iOS Safari 17.4+</td>
              <td>
                Toggling a hidden <code>&lt;input switch&gt;</code> pulses the Taptic Engine
              </td>
              <td>A single fixed tap. Every kind feels the same; patterns are ignored.</td>
            </tr>
            <tr>
              <td>Desktop</td>
              <td>None</td>
              <td>A no-op. No motor, no buzz, no errors.</td>
            </tr>
            <tr>
              <td>Native shells</td>
              <td>
                An injected <code>impl</code> replaces the web engine
              </td>
              <td>Real impact haptics (UIKit, Vibrator, and so on) with no call-site changes.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2}>The seven kinds</Heading>
      <Text tone={TextTone.Muted}>
        Kinds are semantic, not physical. The web engine maps them to Vibration API durations and
        patterns (milliseconds, alternating buzz and pause); a native shell maps them to whatever its
        platform calls an impact.
      </Text>
      <div className="propsTableWrap">
        <table className="tokenTable">
          <thead>
            <tr>
              <th>Kind</th>
              <th>Pattern (ms)</th>
              <th>Meant for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>selection</code>
              </td>
              <td>
                <code>8</code>
              </td>
              <td>The faintest tick. Value changes while scrubbing: slider steps, stars, steppers.</td>
            </tr>
            <tr>
              <td>
                <code>light</code>
              </td>
              <td>
                <code>10</code>
              </td>
              <td>A press. The default for any pressable element.</td>
            </tr>
            <tr>
              <td>
                <code>medium</code>
              </td>
              <td>
                <code>18</code>
              </td>
              <td>Hitting a boundary: a slider end, a min or max, a resize clamp.</td>
            </tr>
            <tr>
              <td>
                <code>heavy</code>
              </td>
              <td>
                <code>26</code>
              </td>
              <td>A significant, deliberate action. Rare by design.</td>
            </tr>
            <tr>
              <td>
                <code>success</code>
              </td>
              <td>
                <code>12, 40, 14</code>
              </td>
              <td>A double tap for a completed operation.</td>
            </tr>
            <tr>
              <td>
                <code>warning</code>
              </td>
              <td>
                <code>16, 60, 16</code>
              </td>
              <td>A slower double tap for something needing attention.</td>
            </tr>
            <tr>
              <td>
                <code>error</code>
              </td>
              <td>
                <code>22, 40, 22, 40, 22</code>
              </td>
              <td>A triple buzz for a failure.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2}>What each component does</Heading>
      <Text tone={TextTone.Muted}>
        Presses are free: <code>HapticsProvider</code> installs one delegated <code>pointerdown</code>{' '}
        listener that fires <code>light</code> for any touch press on a pressable element, so no
        component wires its own press feedback. Components only add ticks for value changes and
        refine the kind where the interaction has real semantics.
      </Text>
      <div className="propsTableWrap">
        <table className="tokenTable">
          <thead>
            <tr>
              <th>Interaction</th>
              <th>Haptic</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Any pressable (buttons, links, menu items, options, tabs...)</td>
              <td>
                <code>light</code> on touch press, via the delegated listener
              </td>
            </tr>
            <tr>
              <td>State toggles: Checkbox, Radio, Switch, Toggle, Filter Chip, Segmented Control, Tabs</td>
              <td>
                <code>selection</code> when the value changes
              </td>
            </tr>
            <tr>
              <td>Slider</td>
              <td>
                <code>selection</code> every <code>hapticStep</code> percent while dragging (default{' '}
                <code>10</code>), <code>medium</code> at the ends
              </td>
            </tr>
            <tr>
              <td>Number Input</td>
              <td>
                <code>selection</code> per integer step, including hold-to-repeat; <code>light</code>{' '}
                when a typed value commits; <code>medium</code> at min or max
              </td>
            </tr>
            <tr>
              <td>Rating</td>
              <td>
                <code>selection</code> per star while scrubbing, <code>light</code> on commit
              </td>
            </tr>
            <tr>
              <td>Resizable Split Pane</td>
              <td>
                <code>medium</code> when the drag hits the clamp
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2}>Opting out and overriding</Heading>
      <Text tone={TextTone.Muted}>
        The <code>data-haptic</code> attribute tunes a single element without touching the engine.{' '}
        <code>data-haptic=&quot;none&quot;</code> silences it entirely - both the delegated press
        feedback and the component&rsquo;s own programmatic ticks. Any kind name (
        <code>data-haptic=&quot;heavy&quot;</code>) changes what the press fires instead. The
        attribute also marks otherwise unrecognized elements as pressable, so a custom control can
        opt in with it too.
      </Text>
      <Text tone={TextTone.Muted}>
        Native shells replace the whole web engine through the provider&rsquo;s <code>impl</code>{' '}
        prop: pass a <code>(kind) =&gt; void</code> that calls the platform&rsquo;s real haptics
        (Capacitor, React Native, a Tauri plugin) and every component in the kit fires it instead of{' '}
        <code>navigator.vibrate</code>, with no call-site changes.
      </Text>

      <Heading level={2}>Try it</Heading>
      <Example
        title="Fire each kind"
        description={
          <>
            These buttons call <code>fire(kind)</code> from <code>useHaptics()</code>. You will feel
            nothing on a desktop - there is no motor - and on iOS every kind is the same single tap.
            Enable Haptics in Preferences first, then try it on a phone.
          </>
        }
        code={`import { Button, useHaptics, type HapticKind } from '@glacier/react';

const KINDS: HapticKind[] = ['selection', 'light', 'medium', 'heavy', 'success', 'warning', 'error'];

function KindButtons() {
  const fire = useHaptics();
  return KINDS.map((kind) => (
    <Button key={kind} onClick={() => fire(kind)}>
      {kind}
    </Button>
  ));
}`}
      >
        <KindButtons />
      </Example>
    </>
  );
}
