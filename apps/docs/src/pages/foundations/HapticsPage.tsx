import { Button, Heading, Row, Size, Text, TextTone, Variant, useHaptics, useT, type HapticKind } from '@glacier/react';
import { Example, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

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
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.hapName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.hapLede))}
      </Text>

      <Heading level={2}>{t(m.hapSecVibrates)}</Heading>
      <Text tone={TextTone.Muted}>
        {t(m.hapVibratesIntro)}
      </Text>
      <div className="propsTableWrap">
        <table className="tokenTable">
          <thead>
            <tr>
              <th>{t(m.hapTh1Platform)}</th>
              <th>{t(m.hapTh1Mechanism)}</th>
              <th>{t(m.hapTh1Fidelity)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t(m.hapPlatAndroid)}</td>
              <td>{prose(t(m.hapAndroidMech))}</td>
              <td>{t(m.hapAndroidFidelity)}</td>
            </tr>
            <tr>
              <td>{t(m.hapPlatIos)}</td>
              <td>{prose(t(m.hapIosMech))}</td>
              <td>{t(m.hapIosFidelity)}</td>
            </tr>
            <tr>
              <td>{t(m.hapPlatDesktop)}</td>
              <td>{t(m.hapDesktopMech)}</td>
              <td>{t(m.hapDesktopFidelity)}</td>
            </tr>
            <tr>
              <td>{t(m.hapPlatNative)}</td>
              <td>{prose(t(m.hapNativeMech))}</td>
              <td>{t(m.hapNativeFidelity)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2}>{t(m.hapSecKinds)}</Heading>
      <Text tone={TextTone.Muted}>
        {t(m.hapKindsIntro)}
      </Text>
      <div className="propsTableWrap">
        <table className="tokenTable">
          <thead>
            <tr>
              <th>{t(m.hapTh2Kind)}</th>
              <th>{t(m.hapTh2Pattern)}</th>
              <th>{t(m.hapTh2MeantFor)}</th>
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
              <td>{t(m.hapKindSelection)}</td>
            </tr>
            <tr>
              <td>
                <code>light</code>
              </td>
              <td>
                <code>10</code>
              </td>
              <td>{t(m.hapKindLight)}</td>
            </tr>
            <tr>
              <td>
                <code>medium</code>
              </td>
              <td>
                <code>18</code>
              </td>
              <td>{t(m.hapKindMedium)}</td>
            </tr>
            <tr>
              <td>
                <code>heavy</code>
              </td>
              <td>
                <code>26</code>
              </td>
              <td>{t(m.hapKindHeavy)}</td>
            </tr>
            <tr>
              <td>
                <code>success</code>
              </td>
              <td>
                <code>12, 40, 14</code>
              </td>
              <td>{t(m.hapKindSuccess)}</td>
            </tr>
            <tr>
              <td>
                <code>warning</code>
              </td>
              <td>
                <code>16, 60, 16</code>
              </td>
              <td>{t(m.hapKindWarning)}</td>
            </tr>
            <tr>
              <td>
                <code>error</code>
              </td>
              <td>
                <code>22, 40, 22, 40, 22</code>
              </td>
              <td>{t(m.hapKindError)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2}>{t(m.hapSecComponents)}</Heading>
      <Text tone={TextTone.Muted}>
        {prose(t(m.hapComponentsIntro))}
      </Text>
      <div className="propsTableWrap">
        <table className="tokenTable">
          <thead>
            <tr>
              <th>{t(m.hapTh3Interaction)}</th>
              <th>{t(m.hapTh3Haptic)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t(m.hapIntPressable)}</td>
              <td>{prose(t(m.hapHapPressable))}</td>
            </tr>
            <tr>
              <td>{t(m.hapIntToggles)}</td>
              <td>{prose(t(m.hapHapToggles))}</td>
            </tr>
            <tr>
              <td>{t(m.hapticsSlider)}</td>
              <td>{prose(t(m.hapHapSlider))}</td>
            </tr>
            <tr>
              <td>{t(m.hapticsNumberInput)}</td>
              <td>{prose(t(m.hapHapNumberInput))}</td>
            </tr>
            <tr>
              <td>{t(m.hapticsRating)}</td>
              <td>{prose(t(m.hapHapRating))}</td>
            </tr>
            <tr>
              <td>{t(m.hapticsResizableSplitPane)}</td>
              <td>{prose(t(m.hapHapSplitPane))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2}>{t(m.hapSecOptOut)}</Heading>
      <Text tone={TextTone.Muted}>
        {prose(t(m.hapOptOut1))}
      </Text>
      <Text tone={TextTone.Muted}>
        {prose(t(m.hapOptOut2))}
      </Text>

      <Heading level={2}>{t(m.hapSecTryIt)}</Heading>
      <Example
        title={t(m.hapExTitle)}
        description={prose(t(m.hapExDesc))}
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
