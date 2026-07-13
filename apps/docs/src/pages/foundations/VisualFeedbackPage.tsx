import { useState } from 'react';
import {
  Button,
  Callout,
  Heading,
  Row,
  SegmentedControl,
  Text,
  Size,
  TextTone,
  Variant,
  VisualFeedbackProvider,
  useT,
  type HapticKind,
  type VisualFeedbackIntensity,
  type VisualFeedbackVariant,
} from '@glacier/react';
import { m } from '../../i18n.ts';

const KINDS: HapticKind[] = ['selection', 'light', 'medium', 'heavy', 'success', 'warning', 'error'];

function Playground() {
  const t = useT();
  const [variant, setVariant] = useState<VisualFeedbackVariant>('shockwave');
  const [intensity, setIntensity] = useState<VisualFeedbackIntensity>('normal');

  const VARIANTS: { value: VisualFeedbackVariant; label: string }[] = [
    { value: 'shockwave', label: t(m.visualfeedbackShockwave) },
    { value: 'pulse', label: t(m.visualfeedbackPulse) },
    { value: 'glow', label: t(m.visualfeedbackGlow) },
    { value: 'nudge', label: t(m.visualfeedbackNudge) },
  ];

  const INTENSITIES: { value: VisualFeedbackIntensity; label: string }[] = [
    { value: 'subtle', label: t(m.visualfeedbackSubtle) },
    { value: 'normal', label: t(m.visualfeedbackNormal) },
    { value: 'strong', label: t(m.visualfeedbackStrong) },
  ];

  return (
    <VisualFeedbackProvider enabled variant={variant} intensity={intensity}>
      <div style={{ display: 'grid', gap: 'var(--glacier-space-4)' }}>
        <Row gap={6} wrap>
          <div style={{ display: 'grid', gap: 'var(--glacier-space-2)' }}>
            <Text size={Size.Small} tone={TextTone.Muted}>
              {t(m.visualfeedbackEffect)}
            </Text>
            <SegmentedControl
              aria-label={t(m.visualfeedbackEffectVariant)}
              value={variant}
              onValueChange={(value) => setVariant(value as VisualFeedbackVariant)}
              options={VARIANTS}
            />
          </div>
          <div style={{ display: 'grid', gap: 'var(--glacier-space-2)' }}>
            <Text size={Size.Small} tone={TextTone.Muted}>
              {t(m.visualfeedbackIntensity)}
            </Text>
            <SegmentedControl
              aria-label={t(m.visualfeedbackEffectIntensity)}
              value={intensity}
              onValueChange={(value) => setIntensity(value as VisualFeedbackIntensity)}
              options={INTENSITIES}
            />
          </div>
        </Row>
        <Text size={Size.Small} tone={TextTone.Muted}>
          {t(m.visualfeedbackPressAKindTheEffect)}
        </Text>
        <Row gap={2} wrap>
          {KINDS.map((kind) => (
            <Button key={kind} variant={Variant.Outline} size={Size.Small} data-haptic={kind}>
              {kind}
            </Button>
          ))}
        </Row>
      </div>
    </VisualFeedbackProvider>
  );
}

export function VisualFeedbackPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.visualfeedbackVisualFeedback)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.visualfeedbackTheOnScreenCounterpartTo)} <code>HapticsProvider</code> {t(m.visualfeedbackBuzzesTheMotor)}{' '}
        <code>VisualFeedbackProvider</code> {t(m.visualfeedbackPaintsASubtleEffectAt)}
      </Text>

      <Heading level={2}>{t(m.visualfeedbackTryIt)}</Heading>
      <Text tone={TextTone.Muted}>
        {t(m.visualfeedbackPickAnEffectAndAn)}
      </Text>
      <Playground />

      <Heading level={2}>{t(m.visualfeedbackTheFourEffects)}</Heading>
      <div className="propsTableWrap">
        <table className="tokenTable">
          <thead>
            <tr>
              <th>{t(m.visualfeedbackEffect)}</th>
              <th>{t(m.visualfeedbackWhatItDoes)}</th>
              <th>{t(m.visualfeedbackBestFor)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>shockwave</code>
              </td>
              <td>{t(m.visualfeedbackARingExpandsAndFades)}</td>
              <td>{t(m.visualfeedbackTheDefaultSpatialTiedTo)}</td>
            </tr>
            <tr>
              <td>
                <code>pulse</code>
              </td>
              <td>{t(m.visualfeedbackASoftTintedBloomRadiates)}</td>
              <td>{t(m.visualfeedbackAWarmerMoreDiffuseCue)}</td>
            </tr>
            <tr>
              <td>
                <code>glow</code>
              </td>
              <td>{t(m.visualfeedbackTheViewportEdgesGlowBriefly)}</td>
              <td>{t(m.visualfeedbackAmbientFeedbackThatNeverCove)}</td>
            </tr>
            <tr>
              <td>
                <code>nudge</code>
              </td>
              <td>{t(m.visualfeedbackTheWholeAppKicksA)}</td>
              <td>{t(m.visualfeedbackAPhysicalImpulseThatMimics)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2}>{t(m.visualfeedbackInLockstepWithHaptics)}</Heading>
      <Text tone={TextTone.Muted}>
        {t(m.visualfeedbackBothFeedbackLayersShareOne)}{' '}
        <code>pointerdown</code>{t(m.visualfeedbackAndAProgrammatic)} <code>haptic(&apos;success&apos;)</code> {t(m.visualfeedbackReachesBothAtOnceSo)} <code>selection</code> {t(m.visualfeedbackBarelyWhispersWhileAn)} <code>error</code> {t(m.visualfeedbackLandsHardAndControlsOpt)} <code>data-haptic=&quot;none&quot;</code>.
      </Text>

      <Callout tone="info" title={t(m.visualfeedbackReducedMotion)}>
        {t(m.visualfeedbackUnder)} <code>prefers-reduced-motion</code> {t(m.visualfeedbackTheMovementIsDroppedBut)}
      </Callout>

      <Heading level={2}>{t(m.visualfeedbackUsage)}</Heading>
      <ul>
        <li>
          {t(m.visualfeedbackWrapTheAppIn)} <code>VisualFeedbackProvider</code> {t(m.visualfeedbackAndGate)} <code>enabled</code> {t(m.visualfeedbackBehindAUserPreferenceNext)}
        </li>
        <li>
          {t(m.visualfeedbackKeep)} <code>intensity</code> {t(m.visualfeedbackAt)} <code>subtle</code> {t(m.visualfeedbackForAProductionAppThis)} <code>strong</code> {t(m.visualfeedbackAnd)} <code>nudge</code> {t(m.visualfeedbackForPlayfulOrKioskStyle)}
        </li>
        <li>
          {t(m.visualfeedbackItRidesTheSame)} <code>data-haptic</code> {t(m.visualfeedbackAttributesAsHapticsSoEvery)}
        </li>
        <li>
          {t(m.visualfeedbackFireItByHandFor)} <code>useVisualFeedback()</code>{t(m.visualfeedbackTheVisualTwinOf)} <code>useHaptics()</code>.
        </li>
      </ul>
    </>
  );
}
