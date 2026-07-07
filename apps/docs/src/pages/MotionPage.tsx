import { Motion, Speed, Ease, Spring, motionProps, press, lift, springTransition } from '@perfect/motion';
import { durations } from '@perfect/tokens';
import { Select } from '@perfect/react';
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
      <h1>Motion</h1>
      <p className="lede">
        Micro-animations are enums: <code>Motion.ScaleIn</code>, <code>Speed.Fast</code>,{' '}
        <code>Ease.Spring</code>. Spread <code>motionProps(...)</code> onto any framer-motion
        element and it animates using the motion tokens. Everything honors{' '}
        <code>prefers-reduced-motion</code>.
      </p>

      <h2>Entrances & exits</h2>
      <div className="row" style={{ marginBottom: 'var(--perfect-space-5)' }}>
        <span className="topbarControl">
          Speed{' '}
          <Select
            aria-label="Speed"
            size="sm"
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
            size="sm"
            value={ease}
            onValueChange={(v) => setEase(v as Ease)}
            options={Object.values(Ease).map((ev) => ({ value: ev, label: ev }))}
          />
        </span>
        <button className="select" onClick={() => setReplay((n) => n + 1)} style={{ cursor: 'pointer' }}>
          Replay all
        </button>
      </div>
      <div className="row">
        {ENTRANCES.map((kind) => (
          <div key={kind} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '8.5rem',
                height: '6rem',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
                border: 'var(--perfect-hairline) dashed var(--perfect-border)',
                borderRadius: 'var(--perfect-radius-lg)',
              }}
            >
              <motion.div
                key={`${kind}-${speed}-${ease}-${replay}`}
                {...motionProps(kind, speed, ease)}
                style={{
                  ...motionProps(kind).style,
                  width: '5.5rem',
                  padding: 'var(--perfect-space-3)',
                  textAlign: 'center',
                  background: 'var(--perfect-accent-solid)',
                  color: 'var(--perfect-accent-contrast)',
                  borderRadius: 'var(--perfect-radius-md)',
                  fontSize: 'var(--perfect-font-size-xs)',
                }}
              >
                {kind}
              </motion.div>
            </div>
            <code>Motion.{enumKey(kind)}</code>
          </div>
        ))}
      </div>

      <h2>Attention</h2>
      <div className="row">
        {ATTENTION.map((kind) => (
          <div key={kind} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '8.5rem',
                height: '6rem',
                display: 'grid',
                placeItems: 'center',
                border: 'var(--perfect-hairline) dashed var(--perfect-border)',
                borderRadius: 'var(--perfect-radius-lg)',
              }}
            >
              <motion.div
                key={`${kind}-${replay}`}
                {...motionProps(kind)}
                style={{
                  width: '5.5rem',
                  padding: 'var(--perfect-space-3)',
                  textAlign: 'center',
                  background: 'var(--perfect-warning-soft, var(--perfect-accent-soft))',
                  border: 'var(--perfect-hairline) solid var(--perfect-border)',
                  color: 'var(--perfect-text)',
                  borderRadius: 'var(--perfect-radius-md)',
                  fontSize: 'var(--perfect-font-size-xs)',
                }}
              >
                {kind}
              </motion.div>
            </div>
            <code>Motion.{enumKey(kind)}</code>
          </div>
        ))}
      </div>

      <h2>Springs</h2>
      <SpringsDemo />

      <h2>Gesture presets</h2>
      <p>
        <code>press</code> and <code>lift</code> are spreadable gesture presets. Every kit control
        uses the same feedback.
      </p>
      <div className="row">
        <motion.button
          {...press}
          className="select"
          style={{ height: 'var(--perfect-control-height-md)', paddingInline: 'var(--perfect-space-5)', cursor: 'pointer' }}
        >
          press me
        </motion.button>
        <motion.div
          {...lift}
          style={{
            padding: 'var(--perfect-space-4) var(--perfect-space-6)',
            background: 'var(--perfect-surface-raised)',
            border: 'var(--perfect-hairline) solid var(--perfect-border-subtle)',
            borderRadius: 'var(--perfect-radius-lg)',
            boxShadow: 'var(--perfect-shadow-2)',
          }}
        >
          hover me
        </motion.div>
      </div>
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
      <p>
        Physics springs for interruptible motion: thumbs, reordering, layout moves. Build one with{' '}
        <code>springTransition(Spring.Snappy)</code>. The segmented control and switch use these.
      </p>
      <div className="stack" style={{ maxWidth: '30rem' }}>
        {presets.map(({ preset, name }) => (
          <div key={name} className="row">
            <code style={{ width: '9.5rem', flex: 'none' }}>{name}</code>
            <div
              style={{
                width: '16rem',
                height: '2rem',
                borderRadius: 'var(--perfect-radius-full)',
                background: 'var(--perfect-segment-track)',
                padding: '0.25rem',
              }}
            >
              <motion.div
                animate={{ x: side ? '14rem' : 0 }}
                transition={springTransition(preset)}
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: 'var(--perfect-radius-full)',
                  background: 'var(--perfect-accent-solid)',
                }}
              />
            </div>
          </div>
        ))}
        <div>
          <button className="select" style={{ cursor: 'pointer' }} onClick={() => setSide((s) => !s)}>
            Toggle
          </button>
        </div>
      </div>
    </>
  );
}
