import { Motion, Speed, Ease, Spring, motionProps, press, lift, springTransition } from '@glacier/motion';
import { durations } from '@glacier/tokens';
import { Select, Row, Stack, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

const ENTRANCES = [
  Motion.FadeIn,
  Motion.ScaleIn,
  Motion.SlideUp,
  Motion.SlideDown,
  Motion.SlideLeft,
  Motion.SlideRight,
  Motion.Expand,
];

const ATTENTION = [Motion.Shake, Motion.Pulse, Motion.Bounce, Motion.Shimmer];

export function MotionPage() {
  const t = useT();
  const [speed, setSpeed] = useState<Speed>(Speed.Normal);
  const [ease, setEase] = useState<Ease>(Ease.Out);
  const [replay, setReplay] = useState(0);

  return (
    <>
      <Heading level={1}>{t(m.motName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.motLede))}
      </Text>

      <Heading level={2}>{t(m.motSecEntrances)}</Heading>
      <Row gap={4} wrap style={{ marginBottom: 'var(--glacier-space-5)' }}>
        <span className="topbarControl">
          {t(m.motSpeedLabel)}{' '}
          <Select
            aria-label={t(m.motSpeedLabel)}
            size={Size.Small}
            value={speed}
            onValueChange={(v) => setSpeed(v as Speed)}
            options={Object.values(Speed).map((sv) => ({
              value: sv,
              label: `${sv} (${durations[sv]}ms)`,
            }))}
          />
        </span>
        <span className="topbarControl">
          {t(m.motEaseLabel)}{' '}
          <Select
            aria-label={t(m.motEaseLabel)}
            size={Size.Small}
            value={ease}
            onValueChange={(v) => setEase(v as Ease)}
            options={Object.values(Ease).map((ev) => ({ value: ev, label: ev }))}
          />
        </span>
        <button className="select" onClick={() => setReplay((n) => n + 1)} style={{ cursor: 'pointer' }}>
          {t(m.motReplayAll)}
        </button>
      </Row>
      <Row gap={4} wrap>
        {ENTRANCES.map((kind) => (
          <div key={kind} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '8.5rem',
                height: '6rem',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
                border: 'var(--glacier-hairline) dashed var(--glacier-border)',
                borderRadius: 'var(--glacier-radius-lg)',
              }}
            >
              <motion.div
                key={`${kind}-${speed}-${ease}-${replay}`}
                {...motionProps(kind, speed, ease)}
                style={{
                  ...motionProps(kind).style,
                  width: '5.5rem',
                  padding: 'var(--glacier-space-3)',
                  textAlign: 'center',
                  background: 'var(--glacier-accent-solid)',
                  color: 'var(--glacier-accent-contrast)',
                  borderRadius: 'var(--glacier-radius-md)',
                  fontSize: 'var(--glacier-font-size-xs)',
                }}
              >
                {kind}
              </motion.div>
            </div>
            <code>Motion.{enumKey(kind)}</code>
          </div>
        ))}
      </Row>

      <Heading level={2}>{t(m.motSecAttention)}</Heading>
      <Row gap={4} wrap>
        {ATTENTION.map((kind) => (
          <div key={kind} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '8.5rem',
                height: '6rem',
                display: 'grid',
                placeItems: 'center',
                border: 'var(--glacier-hairline) dashed var(--glacier-border)',
                borderRadius: 'var(--glacier-radius-lg)',
              }}
            >
              <motion.div
                key={`${kind}-${replay}`}
                {...motionProps(kind)}
                style={{
                  width: '5.5rem',
                  padding: 'var(--glacier-space-3)',
                  textAlign: 'center',
                  background: 'var(--glacier-warning-soft, var(--glacier-accent-soft))',
                  border: 'var(--glacier-hairline) solid var(--glacier-border)',
                  color: 'var(--glacier-text)',
                  borderRadius: 'var(--glacier-radius-md)',
                  fontSize: 'var(--glacier-font-size-xs)',
                }}
              >
                {kind}
              </motion.div>
            </div>
            <code>Motion.{enumKey(kind)}</code>
          </div>
        ))}
      </Row>

      <Heading level={2}>{t(m.motSecSprings)}</Heading>
      <SpringsDemo />

      <Heading level={2}>{t(m.motSecGestures)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.motGestureIntro))}</Text>
      <Row gap={4} wrap>
        <motion.button
          {...press}
          className="select"
          style={{ height: 'var(--glacier-control-height-md)', paddingInline: 'var(--glacier-space-5)', cursor: 'pointer' }}
        >
          {t(m.motPressMe)}
        </motion.button>
        <motion.div
          {...lift}
          style={{
            padding: 'var(--glacier-space-4) var(--glacier-space-6)',
            background: 'var(--glacier-surface-raised)',
            border: 'var(--glacier-hairline) solid var(--glacier-border-subtle)',
            borderRadius: 'var(--glacier-radius-lg)',
            boxShadow: 'var(--glacier-shadow-2)',
          }}
        >
          {t(m.motHoverMe)}
        </motion.div>
      </Row>
    </>
  );
}

function enumKey(value: Motion): string {
  return Object.entries(Motion).find(([, v]) => v === value)?.[0] ?? value;
}

function SpringsDemo() {
  const t = useT();
  const [side, setSide] = useState(false);
  const presets = [
    { preset: Spring.Snappy, name: 'Spring.Snappy' },
    { preset: Spring.Smooth, name: 'Spring.Smooth' },
    { preset: Spring.Bouncy, name: 'Spring.Bouncy' },
  ];
  return (
    <>
      <Text tone={TextTone.Muted}>{prose(t(m.motSpringsIntro))}</Text>
      <Stack gap={4} maxWidth="sm">
        {presets.map(({ preset, name }) => (
          <Row gap={4} wrap key={name}>
            <code style={{ width: '9.5rem', flex: 'none' }}>{name}</code>
            <div
              style={{
                width: '16rem',
                height: '2rem',
                borderRadius: 'var(--glacier-radius-full)',
                background: 'var(--glacier-segment-track)',
                padding: '0.25rem',
              }}
            >
              <motion.div
                animate={{ x: side ? '14rem' : 0 }}
                transition={springTransition(preset)}
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: 'var(--glacier-radius-full)',
                  background: 'var(--glacier-accent-solid)',
                }}
              />
            </div>
          </Row>
        ))}
        <div>
          <button className="select" style={{ cursor: 'pointer' }} onClick={() => setSide((s) => !s)}>
            {t(m.motionToggle)}
          </button>
        </div>
      </Stack>
    </>
  );
}
