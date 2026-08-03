import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  accentDecls,
  accentOptions,
  elevationOverlayDecls,
  glassDecls,
  gradientDecls,
  rampDecls,
  reducedMotionDecls,
  semanticDecls,
  shadowDecls,
  shapeGeometry,
  shapeShadowDecls,
  statusDecls,
  themeOverrideDecls,
  STAGGER_STEP_MS,
  type Theme,
} from '@glacier/tokens';
import { SHAPE_DESCRIPTION, shapes } from '@glacier/spec';
import {
  Button,
  Card,
  Checkbox,
  Heading,
  NavBar,
  NavBarItem,
  Pill,
  Row,
  Slider,
  Stack,
  StatTile,
  Text,
  Size,
  TextTone,
  Tone,
  Variant,
  fx,
  staggerVars,
  useT,
  type ShapeName,
} from '@glacier/react';
import { Motion, motionProps, staggerDelay } from '@glacier/motion';
import { Bell, Home, Search, Settings, Sparkles, Swords, TrendingUp } from '@glacier/icons';
import { motion } from 'motion/react';
import { HighlightedCode, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

/** Declaration pairs -> a React style object of --glacier-* custom properties. */
const vars = (decls: Array<[string, string]>): CSSProperties =>
  Object.fromEntries(decls.map(([name, value]) => [`--glacier-${name}`, value])) as CSSProperties;

/** The accent picked in Preferences, so a pinned stage keeps the site's accent. */
function currentAccent(): string | null {
  return typeof document !== 'undefined' ? document.documentElement.getAttribute('data-accent') : null;
}

/**
 * Every theme-dependent token, re-declared on one element. The dark token set
 * is emitted at `[data-theme='dark']` (element-scoped) but the light set lives
 * at `:root`, so a nested `data-theme` attribute can only ever go darker.
 * Pinning the values from the token source instead means the light/dark pair
 * below reads the same whichever way the site theme is set.
 *
 * The semantic aliases and gradients have to be re-declared too, not just the
 * ramps they are built from: a custom property's `var()` references are
 * substituted where the declaration sits, so `--glacier-surface` resolved at
 * `:root` inherits as an already-final color. Redeclaring it here makes it
 * resolve against this element's ramps instead.
 */
function themeVars(theme: Theme): CSSProperties {
  const accent = accentOptions.find((option) => option.name === currentAccent());
  return {
    colorScheme: theme,
    ...vars([
      ...rampDecls(theme),
      ...(accent ? accentDecls(accent, theme) : []),
      ...semanticDecls(),
      ...statusDecls(),
      ...gradientDecls(),
      ...shadowDecls(theme),
      ...elevationOverlayDecls(theme),
      ...shapeShadowDecls(theme),
      ...glassDecls(theme),
      // last: the per-theme surface overrides must beat the shared aliases
      ...themeOverrideDecls(theme),
    ]),
  };
}

/** The whole vocabulary in one copy-paste block: shapes, gradients, stagger. */
const USAGE = `import { Button, Card, StatTile, Variant, fx, staggerVars } from '@glacier/react';
import { Motion, motionProps, staggerDelay } from '@glacier/motion';
import { motion } from 'motion/react';

// a plate: silhouette + accent leading edge + hover sweep
<Button shape="slant" edgeAccent sweep>Play</Button>
<StatTile shape="notch" edgeAccent value="7" label="Decks forged" />

// the gradient variants
<Button variant={Variant.Gradient}>Continue</Button>
<Card variant={Variant.Wash}>A quiet accent wash</Card>

// staggered entrance, CSS: the class rests on its finished frame
{items.map((item, i) => (
  <Card key={item.id} className={fx.riseIn} style={staggerVars(i)}>{item.name}</Card>
))}

// the same entrance in framer-motion
{items.map((item, i) => (
  <motion.div key={item.id} {...motionProps(Motion.RiseIn)} transition={staggerDelay(i)} />
))}

// retune the geometry for a whole app
:root {
  --glacier-shape-slant-angle: 6deg;
  --glacier-shape-notch: 22px;
}`;

const STAGE: CSSProperties = {
  padding: 'var(--glacier-space-6)',
  borderRadius: 'var(--glacier-radius-xl)',
  border: 'var(--glacier-hairline) solid var(--glacier-border-subtle)',
  background: 'var(--glacier-surface)',
  color: 'var(--glacier-text)',
};

/** A labelled sub-stage, used for the theme and direction pairs. */
function PinnedStage({ title, style, children }: { title: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div style={{ ...STAGE, ...style, flex: '1 1 20rem', minWidth: '18rem' }}>
      <Text as="span" size={Size.Small} weight="semibold" tone={TextTone.Muted}>
        {title}
      </Text>
      <div style={{ marginBlockStart: 'var(--glacier-space-4)' }}>{children}</div>
    </div>
  );
}

/**
 * One shape across the adopting components at every size they ship. Kept as a
 * single row per shape so the silhouettes line up column by column and the
 * slant's overhang is visible against its neighbours.
 */
function ShapeRow({ shape }: { shape: ShapeName }) {
  const t = useT();
  return (
    <Stack gap={3} style={{ marginBlockEnd: 'var(--glacier-space-6)' }}>
      <Row gap={3} align="center" wrap>
        <code>shape=&quot;{shape}&quot;</code>
        <Text as="span" size={Size.Small} tone={TextTone.Subtle}>
          {SHAPE_DESCRIPTION[shape]}
        </Text>
      </Row>
      <div style={STAGE}>
        <Row gap={5} wrap align="center">
          <Button shape={shape} size={Size.Small}>
            {t(m.buttonSmall)}
          </Button>
          <Button shape={shape}>{t(m.buttonMedium)}</Button>
          <Button shape={shape} size={Size.Large} variant={Variant.Soft}>
            {t(m.buttonLarge)}
          </Button>
          <Pill shape={shape} size="sm" tone={Tone.Accent}>
            {t(m.smPillSmall)}
          </Pill>
          <Pill shape={shape} tone={Tone.Accent} variant="outline">
            {t(m.smPillMedium)}
          </Pill>
          <StatTile shape={shape} icon={<TrendingUp size={18} />} value="12,480" label={t(m.smStatLabel)} hint="+4.2%" />
          <Card shape={shape} style={{ maxWidth: '14rem' }}>
            <Text size={Size.Small}>{t(m.smCardBody)}</Text>
          </Card>
        </Row>
      </div>
    </Stack>
  );
}

export function ShapesMotionPage() {
  const t = useT();
  const [angle, setAngle] = useState(8);
  const [notch, setNotch] = useState(18);
  const [edgeCut, setEdgeCut] = useState(14);
  const [reduced, setReduced] = useState(false);
  const [replay, setReplay] = useState(0);

  // The geometry knobs are plain :root-overridable custom properties, so the
  // playground just re-declares them on its own stage.
  const geometry: CSSProperties = vars([
    ['shape-slant-angle', `${angle}deg`],
    ['shape-notch', `${notch}px`],
    ['shape-edge-cut', `${edgeCut}px`],
  ]);

  const gradients = gradientDecls();
  const washes = gradients.filter(([name]) => name.startsWith('gradient-wash-'));
  const scrims = gradients.filter(([name]) => name.startsWith('gradient-scrim-'));
  const solos = gradients.filter(([name]) => !name.startsWith('gradient-wash-') && !name.startsWith('gradient-scrim-'));

  return (
    <>
      <Heading level={1}>{t(m.smName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.smLede))}
      </Text>

      <Heading level={2}>{t(m.smSecMechanism)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smMechanismIntro))}</Text>
      <ul>
        <li>{prose(t(m.smMechRadius))}</li>
        <li>{prose(t(m.smMechFocus))}</li>
        <li>{prose(t(m.smMechHit))}</li>
        <li>{prose(t(m.smMechDepth))}</li>
        <li>{prose(t(m.smMechLift))}</li>
        <li>{prose(t(m.smMechOverhang))}</li>
        <li>{prose(t(m.smMechCut))}</li>
        <li>{prose(t(m.smMechBorder))}</li>
        <li>{prose(t(m.smMechRtl))}</li>
      </ul>

      <Heading level={2}>{t(m.smSecShapes)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smShapesIntro))}</Text>
      {shapes.map((shape) => (
        <ShapeRow key={shape} shape={shape} />
      ))}

      <Heading level={2}>{t(m.smSecGeometry)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smGeometryIntro))}</Text>
      <Stack gap={3} style={{ marginBlockEnd: 'var(--glacier-space-5)' }} maxWidth="sm">
        <Row gap={3} align="center">
          <Text as="span" size={Size.Small} tone={TextTone.Muted} style={{ width: '10rem', flex: 'none' }}>
            {t(m.smKnobAngle)}
          </Text>
          <div style={{ width: '12rem' }}>
            <Slider aria-label={t(m.smKnobAngle)} min={0} max={20} step={1} value={angle} onValueChange={setAngle} />
          </div>
          <Text as="span" size={Size.Small} weight="semibold" mono>
            {angle}deg
          </Text>
        </Row>
        <Row gap={3} align="center">
          <Text as="span" size={Size.Small} tone={TextTone.Muted} style={{ width: '10rem', flex: 'none' }}>
            {t(m.smKnobNotch)}
          </Text>
          <div style={{ width: '12rem' }}>
            <Slider aria-label={t(m.smKnobNotch)} min={0} max={36} step={1} value={notch} onValueChange={setNotch} />
          </div>
          <Text as="span" size={Size.Small} weight="semibold" mono>
            {notch}px
          </Text>
        </Row>
        <Row gap={3} align="center">
          <Text as="span" size={Size.Small} tone={TextTone.Muted} style={{ width: '10rem', flex: 'none' }}>
            {t(m.smKnobEdge)}
          </Text>
          <div style={{ width: '12rem' }}>
            <Slider aria-label={t(m.smKnobEdge)} min={0} max={40} step={1} value={edgeCut} onValueChange={setEdgeCut} />
          </div>
          <Text as="span" size={Size.Small} weight="semibold" mono>
            {edgeCut}px
          </Text>
        </Row>
      </Stack>
      <div style={{ ...STAGE, ...geometry }}>
        <Row gap={5} wrap align="center">
          <Button shape="slant">{t(m.smPlateSlant)}</Button>
          <Button shape="notch" variant={Variant.Soft}>
            {t(m.smPlateNotch)}
          </Button>
          <Button shape="edge" variant={Variant.Outline}>
            {t(m.smPlateEdge)}
          </Button>
          <StatTile shape="notch" icon={<Swords size={18} />} value="7" label={t(m.smStatDecks)} />
        </Row>
      </div>

      <Heading level={3}>{t(m.smTokens)}</Heading>
      <div className="propsTableWrap">
        <table className="tokenTable">
          <thead>
            <tr>
              <th>{t(m.matThToken)}</th>
              <th>{t(m.matThDefault)}</th>
              <th>{t(m.matThDescription)}</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ['shape-radius', t(m.smTokRadius)],
                ['shape-slant-angle', t(m.smTokSlantAngle)],
                ['shape-notch', t(m.smTokNotch)],
                ['shape-edge-cut', t(m.smTokEdgeCut)],
                ['shape-slant-pad', t(m.smTokSlantPad)],
                ['shape-accent-edge', t(m.smTokAccentEdge)],
                ['shape-accent-edge-active', t(m.smTokAccentEdgeActive)],
              ] as const
            ).map(([name, description]) => (
              <tr key={name}>
                <td>
                  <code>--glacier-{name}</code>
                </td>
                <td>
                  <code>{shapeGeometry[name]}</code>
                </td>
                <td>{prose(description)}</td>
              </tr>
            ))}
            <tr>
              <td>
                <code>--glacier-shape-shadow</code>
              </td>
              <td>
                <code>{t(m.smPerTheme)}</code>
              </td>
              <td>{prose(t(m.smTokShadow))}</td>
            </tr>
            <tr>
              <td>
                <code>--glacier-shape-glow</code>
              </td>
              <td>
                <code>{t(m.smAccentTracking)}</code>
              </td>
              <td>{prose(t(m.smTokGlow))}</td>
            </tr>
            <tr>
              <td>
                <code>--glacier-stagger-step</code>
              </td>
              <td>
                <code>{STAGGER_STEP_MS}ms</code>
              </td>
              <td>{prose(t(m.smTokStagger))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2}>{t(m.smSecEdgeSweep)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smEdgeSweepIntro))}</Text>
      <div style={STAGE}>
        <Row gap={5} wrap align="center">
          <Button shape="slant" edgeAccent sweep>
            {t(m.smPlay)}
          </Button>
          <Button shape="notch" variant={Variant.Soft} edgeAccent sweep>
            {t(m.smNewDeck)}
          </Button>
          <StatTile shape="slant" edgeAccent icon={<Sparkles size={18} />} value="3" label={t(m.smStatStreak)} />
        </Row>
      </div>
      <Text tone={TextTone.Muted} size={Size.Small}>
        {prose(t(m.smEdgeSweepHint))}
      </Text>

      <Heading level={3}>{t(m.smSecNavBar)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smNavBarIntro))}</Text>
      <div style={STAGE}>
        <NavBar aria-label={t(m.smNavAria)} shape="slant" sweep edgeAccent showLabels>
          <NavBarItem icon={<Home size={18} />} label={t(m.smNavHome)} active />
          <NavBarItem icon={<Search size={18} />} label={t(m.smNavBrowse)} />
          <NavBarItem icon={<Bell size={18} />} label={t(m.smNavAlerts)} badge={3} />
          <NavBarItem icon={<Settings size={18} />} label={t(m.smNavSettings)} />
        </NavBar>
      </div>

      <Heading level={2}>{t(m.smSecGradients)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smGradientsIntro))}</Text>

      <Heading level={3}>{t(m.smGradientWashes)}</Heading>
      <Row gap={4} wrap>
        {washes.map(([name]) => (
          <Swatch key={name} name={name} />
        ))}
      </Row>

      <Heading level={3}>{t(m.smGradientSolos)}</Heading>
      <Row gap={4} wrap>
        {solos.map(([name]) => (
          <Swatch key={name} name={name} />
        ))}
      </Row>

      <Heading level={3}>{t(m.smGradientScrims)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smScrimIntro))}</Text>
      <Row gap={4} wrap>
        {scrims.map(([name]) => (
          <div key={name} style={{ textAlign: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: '11rem',
                height: '7rem',
                overflow: 'hidden',
                borderRadius: 'var(--glacier-radius-lg)',
                border: 'var(--glacier-hairline) solid var(--glacier-border-subtle)',
                background:
                  'radial-gradient(12rem 12rem at 20% 20%, oklch(0.78 0.17 95), transparent 60%),' +
                  'linear-gradient(120deg, oklch(0.6 0.2 265), oklch(0.7 0.17 195))',
              }}
            >
              <span style={{ position: 'absolute', inset: 0, background: `var(--glacier-${name})` }} />
              <span
                style={{
                  position: 'absolute',
                  insetInline: 'var(--glacier-space-3)',
                  insetBlockEnd: 'var(--glacier-space-3)',
                  color: 'oklch(1 0 0)',
                  fontSize: 'var(--glacier-font-size-sm)',
                  fontWeight: 'var(--glacier-font-weight-semibold)',
                }}
              >
                {t(m.smScrimCaption)}
              </span>
            </div>
            <code>{name}</code>
          </div>
        ))}
      </Row>

      <Heading level={3}>{t(m.smGradientVariants)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smGradientVariantsIntro))}</Text>
      <div style={STAGE}>
        <Row gap={5} wrap align="center">
          <Button variant={Variant.Gradient}>{t(m.smPlay)}</Button>
          <Button variant={Variant.Gradient} shape="slant" edgeAccent sweep>
            {t(m.smPlay)}
          </Button>
          <Card variant={Variant.Wash} style={{ maxWidth: '15rem' }}>
            <Text size={Size.Small}>{t(m.smWashBody)}</Text>
          </Card>
        </Row>
      </div>

      <Heading level={2}>{t(m.smSecMotion)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smMotionIntro))}</Text>
      <Row gap={4} wrap align="center" style={{ marginBlockEnd: 'var(--glacier-space-4)' }}>
        <Button size={Size.Small} variant={Variant.Outline} onClick={() => setReplay((n) => n + 1)}>
          {t(m.motReplayAll)}
        </Button>
        <Checkbox label={t(m.smReducedToggle)} checked={reduced} onCheckedChange={setReduced} />
      </Row>
      <div style={{ ...STAGE, ...(reduced ? vars(reducedMotionDecls()) : undefined) }}>
        <Row gap={4} wrap align="center">
          {[t(m.smRisePlay), t(m.smRiseResume), t(m.smRiseCollection), t(m.smRiseSettings)].map((label, index) => (
            <motion.div
              key={`${label}-${replay}-${reduced}`}
              {...motionProps(Motion.RiseIn)}
              // The JS half has no token to collapse - framer-motion reads the
              // user's setting through useReducedMotion(), which every kit
              // component already does. The toggle stands in for it here.
              transition={reduced ? { duration: 0 } : staggerDelay(index)}
            >
              <Button shape="slant" edgeAccent sweep>
                {label}
              </Button>
            </motion.div>
          ))}
        </Row>
      </div>
      <Text tone={TextTone.Muted} size={Size.Small}>
        {prose(t(m.smStaggerHint))}
      </Text>

      <Heading level={3}>{t(m.smSecCssUtilities)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smCssUtilitiesIntro))}</Text>
      <div style={{ ...STAGE, ...(reduced ? vars(reducedMotionDecls()) : undefined) }}>
        <Row gap={4} wrap align="center">
          {[t(m.smRisePlay), t(m.smRiseResume), t(m.smRiseCollection), t(m.smRiseSettings)].map((label, index) => (
            <div key={`${label}-${replay}-${reduced}`} className={fx.riseIn} style={staggerVars(index)}>
              <Pill shape="notch" tone={Tone.Accent}>
                {label}
              </Pill>
            </div>
          ))}
        </Row>
        <Row gap={5} wrap align="center" style={{ marginBlockStart: 'var(--glacier-space-5)' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              className={fx.shimmer}
              style={{
                width: '11rem',
                height: '4rem',
                borderRadius: 'var(--glacier-radius-lg)',
                border: 'var(--glacier-hairline) solid var(--glacier-border-subtle)',
                backgroundColor: 'var(--glacier-surface-raised)',
              }}
            />
            <code>fx.shimmer</code>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className={fx.glowPulse} style={{ display: 'inline-block' }}>
              <Button shape="notch" variant={Variant.Soft} edgeAccent>
                {t(m.smNewDeck)}
              </Button>
            </div>
            <div>
              <code>fx.glowPulse</code>
            </div>
          </div>
        </Row>
      </div>

      <Heading level={3}>{t(m.smSecReducedMotion)}</Heading>
      <ol>
        <li>{prose(t(m.smReduced1))}</li>
        <li>{prose(t(m.smReduced2))}</li>
        <li>{prose(t(m.smReduced3))}</li>
      </ol>

      <Heading level={2}>{t(m.smSecDirection)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smDirectionIntro))}</Text>
      <Row gap={5} wrap align="start">
        <PinnedStage title="dir=&quot;ltr&quot;">
          <div dir="ltr">
            <DirectionDemo />
          </div>
        </PinnedStage>
        <PinnedStage title="dir=&quot;rtl&quot;">
          <div dir="rtl">
            <DirectionDemo />
          </div>
        </PinnedStage>
      </Row>

      <Heading level={2}>{t(m.smSecThemes)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smThemesIntro))}</Text>
      <Row gap={5} wrap align="start">
        <PinnedStage title={t(m.smThemeLight)} style={themeVars('light')}>
          <DirectionDemo />
        </PinnedStage>
        <PinnedStage title={t(m.smThemeDark)} style={themeVars('dark')}>
          <DirectionDemo />
        </PinnedStage>
      </Row>

      <Heading level={2}>{t(m.smSecCode)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smCodeIntro))}</Text>
      <HighlightedCode code={USAGE} language="tsx" lineNumbers />

      <Heading level={2}>{t(m.smSecAdoption)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.smAdoptionIntro))}</Text>
      <div className="propsTableWrap">
        <table className="tokenTable">
          <thead>
            <tr>
              <th>{t(m.smThComponent)}</th>
              <th>
                <code>shape</code>
              </th>
              <th>
                <code>edgeAccent</code>
              </th>
              <th>
                <code>sweep</code>
              </th>
              <th>{t(m.smThVariant)}</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ['Button', true, true, true, 'gradient'],
                ['Pill', true, false, false, '-'],
                ['Card', true, false, false, 'wash'],
                ['StatTile', true, true, false, '-'],
                ['NavBar', true, true, true, '-'],
              ] as const
            ).map(([name, shape, edge, sweep, variant]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>{shape ? '✓' : '-'}</td>
                <td>{edge ? '✓' : '-'}</td>
                <td>{sweep ? '✓' : '-'}</td>
                <td>{variant === '-' ? '-' : <code>{variant}</code>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.smA11y1))}</li>
        <li>{prose(t(m.smA11y2))}</li>
        <li>{prose(t(m.smA11y3))}</li>
        <li>{prose(t(m.smA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.smUse1))}</li>
        <li>{prose(t(m.smUse2))}</li>
        <li>{prose(t(m.smUse3))}</li>
        <li>{prose(t(m.smUse4))}</li>
      </ul>
    </>
  );
}

/** One gradient token, painted at demo size with its name underneath. */
function Swatch({ name }: { name: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: '11rem',
          height: '5rem',
          borderRadius: 'var(--glacier-radius-lg)',
          border: 'var(--glacier-hairline) solid var(--glacier-border-subtle)',
          background: `var(--glacier-${name})`,
        }}
      />
      <code>{name}</code>
    </div>
  );
}

/**
 * The same three plates used by the direction and theme pairs: one of each
 * mirrored shape, with the accent edge on so the leading edge is obvious.
 */
function DirectionDemo() {
  const t = useT();
  return (
    <Stack gap={4} align="start">
      <Button shape="slant" edgeAccent sweep>
        {t(m.smPlateSlant)}
      </Button>
      <Button shape="notch" variant={Variant.Soft} edgeAccent sweep>
        {t(m.smPlateNotch)}
      </Button>
      <Button shape="edge" variant={Variant.Soft}>
        {t(m.smPlateEdge)}
      </Button>
      <Pill shape="notch" tone={Tone.Accent}>
        {t(m.smPillMedium)}
      </Pill>
    </Stack>
  );
}
