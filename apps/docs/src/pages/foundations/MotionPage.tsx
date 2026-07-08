import { Motion, Speed, Ease, Spring, motionProps, press, lift, springTransition } from '@glacier/motion';
import { durations } from '@glacier/tokens';
import { Select, Row, Stack, Heading, Text, Size, TextTone } from '@glacier/react';
import { motion } from 'motion/react';
import { useState } from 'react';

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
  const [speed, setSpeed] = useState<Speed>(Speed.Normal);
  const [ease, setEase] = useState<Ease>(Ease.Out);
  const [replay, setReplay] = useState(0);

  return (
    <>
      <Heading level={1}>Motion</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        Micro-animations are enums: <code>Motion.ScaleIn</code>, <code>Speed.Fast</code>,{' '}
        <code>Ease.Spring</code>. Spread <code>motionProps(...)</code> onto any framer-motion
        element and it animates using the motion tokens. Everything honors{' '}
        <code>prefers-reduced-motion</code>.
      </Text>

      <Heading level={2}>Entrances & exits</Heading>
      <Row gap={4} wrap style={{ marginBottom: 'var(--glacier-space-5)' }}>
        <span className="topbarControl">
          Speed{' '}
          <Select
            aria-label="Speed"
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
          Ease{' '}
          <Select
            aria-label="Ease"
            size={Size.Small}
            value={ease}
            onValueChange={(v) => setEase(v as Ease)}
            options={Object.values(Ease).map((ev) => ({ value: ev, label: ev }))}
          />
        </span>
        <button className="select" onClick={() => setReplay((n) => n + 1)} style={{ cursor: 'pointer' }}>
          Replay all
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

      <Heading level={2}>Attention</Heading>
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

      <Heading level={2}>Springs</Heading>
      <SpringsDemo />

      <Heading level={2}>Gesture presets</Heading>
      <Text tone={TextTone.Muted}>
        <code>press</code> and <code>lift</code> are spreadable gesture presets. Every kit control
        uses the same feedback.
      </Text>
      <Row gap={4} wrap>
        <motion.button
          {...press}
          className="select"
          style={{ height: 'var(--glacier-control-height-md)', paddingInline: 'var(--glacier-space-5)', cursor: 'pointer' }}
        >
          press me
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
          hover me
        </motion.div>
      </Row>
    </>
  );
}

function enumKey(value: Motion): string {
  return Object.entries(Motion).find(([, v]) => v === value)?.[0] ?? value;
}

function SpringsDemo() {
  const [side, setSide] = useState(false);
  const presets = [
    { preset: Spring.Snappy, name: 'Spring.Snappy' },
    { preset: Spring.Smooth, name: 'Spring.Smooth' },
    { preset: Spring.Bouncy, name: 'Spring.Bouncy' },
  ];
  return (
    <>
      <Text tone={TextTone.Muted}>
        Physics springs for interruptible motion: thumbs, reordering, layout moves. Build one with{' '}
        <code>springTransition(Spring.Snappy)</code>. The segmented control and switch use these.
      </Text>
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
            Toggle
          </button>
        </div>
      </Stack>
    </>
  );
}
