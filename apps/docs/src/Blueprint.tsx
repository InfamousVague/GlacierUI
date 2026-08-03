import { getSpec, seekBarSpec, type Measure, type SizeSpec } from '@glacier/spec';
import {
  fanPlacements,
  fanSlinky,
  seekBarGeometry,
  SEEK_VIEW_WIDTH,
  SEEK_VIEW_HEIGHT,
  // The message core's figures are drawn from the shared geometry rather than
  // by eye, the way SeekBar's is: the corners, the tail, the run slots and the
  // delivery silhouettes all come from the modules both kits render through.
  BUBBLE_MAX_WIDTH,
  bubbleCorners,
  bubblePosition,
  deliveryGlyph,
  deliveryStatuses,
  messageTail,
  tailScaleX,
  type BubblePosition,
  type DeliveryGlyph,
  type SeekBarShape,
} from '@glacier/logic';
import { createContext, useContext, useId, useState, type ReactElement } from 'react';
import { SegmentedControl, Select, Stack, Size, defineMessages, useT } from '@glacier/react';
import { m } from './i18n.ts';

/**
 * A blueprint-style illustration of a component's box: a schematic drawing with
 * dimension lines labelled with the exact spec measurements (padding, height,
 * radius, border), the way you'd inspect an atom. The figure is schematic; the
 * labels are the real values from the spec.
 */
interface BlueprintProps {
  size: SizeSpec;
  /** Spec id, so a figure can specialise (e.g. the avatar shows sample initials). */
  id?: string;
  /** Size-independent measurements (radius, border, gap) from spec.dimensions. */
  dimensions?: Record<string, Measure | undefined>;
  /** Anatomy slot names, so the box can show leading/trailing icon slots. */
  slots?: readonly string[];
  /** Force the figure kind; 'ring' for stroked circles, 'slider' for the rail. */
  shape?: 'ring' | 'slider';
}

/** Spec ids whose circular figure is a stroked ring (track + arc), not a disc. */
const RING_IDS = new Set(['progress-ring', 'spinner']);

// A measure for a label: "$space-4" -> "space-4", a raw value stays as-is.
const fmt = (m?: Measure): string | undefined => (m ? (m.startsWith('$') ? m.slice(1) : m) : undefined);

// The figure title: the component rendered as JSX, e.g. <Button />. It comes
// from the spec via context so the fifty-odd figure functions stay untouched
// (their SizeSpec.name still carries the real size key some measures look up).
const TitleContext = createContext('');

function BpTitle({ y = 26 }: { y?: number }) {
  const title = useContext(TitleContext);
  return (
    <text x={16} y={y} className="bpTitle">
      {title}
    </text>
  );
}

const C = {
  grid: 'var(--glacier-accent-border)',
  line: 'var(--glacier-accent-solid)',
  fill: 'var(--glacier-accent-soft)',
  edge: 'var(--glacier-accent-border)',
  content: 'var(--glacier-accent-solid)',
  text: 'var(--glacier-accent-text)',
  faint: 'var(--glacier-text-subtle)',
};

// A horizontal dimension line from x1 to x2 at y: a solid line spanning the
// full width, with witness ticks and outward chevron arrowheads at each end.
function HDim({ x1, x2, y, label, above = true }: { x1: number; x2: number; y: number; label: string; above?: boolean }) {
  const mid = (x1 + x2) / 2;
  const A = 6;
  // Outward on a span too short to hold both heads — see VDim for why.
  const head = Math.abs(x2 - x1) < A * 2 ? -A : A;
  return (
    <g stroke={C.line} strokeWidth={1.25} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} strokeWidth={1} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} strokeWidth={1} />
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <polyline points={`${x1 + head},${y - 3.5} ${x1},${y} ${x1 + head},${y + 3.5}`} />
      <polyline points={`${x2 - head},${y - 3.5} ${x2},${y} ${x2 - head},${y + 3.5}`} />
      <text x={mid} y={above ? y - 6 : y + 13} textAnchor="middle" className="bpLabel" stroke="none">
        {label}
      </text>
    </g>
  );
}

// A vertical dimension line from y1 to y2 at x: one solid line with outward
// chevron arrowheads, and a label rotated to read along it so long token names
// never overflow horizontally.
function VDim({
  x,
  y1,
  y2,
  label,
  left = true,
  horizontal = false,
}: {
  x: number;
  y1: number;
  y2: number;
  label: string;
  left?: boolean;
  /** Lay the label flat beside the line instead of rotating it - for short
      spans where a rotated token name would overflow its neighbours. */
  horizontal?: boolean;
}) {
  const mid = (y1 + y2) / 2;
  const lx = left ? x - 10 : x + 10;
  const A = 6;
  // Arrowheads normally point inward, into the span they measure. On a span
  // shorter than the two heads combined they would pass through each other and
  // fuse into a solid bowtie — which is what a 7-unit gap between two slider
  // tracks produced. Flipping them outward is the drafting convention for a
  // tight dimension, and it keeps the tips on the lines they mark.
  const head = Math.abs(y2 - y1) < A * 2 ? -A : A;
  return (
    <g stroke={C.line} strokeWidth={1.25} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x - 4} y1={y1} x2={x + 4} y2={y1} strokeWidth={1} />
      <line x1={x - 4} y1={y2} x2={x + 4} y2={y2} strokeWidth={1} />
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <polyline points={`${x - 3.5},${y1 + head} ${x},${y1} ${x + 3.5},${y1 + head}`} />
      <polyline points={`${x - 3.5},${y2 - head} ${x},${y2} ${x + 3.5},${y2 - head}`} />
      {horizontal ? (
        <text x={lx} y={mid} textAnchor={left ? 'end' : 'start'} dominantBaseline="middle" className="bpLabel" stroke="none">
          {label}
        </text>
      ) : (
        <text x={lx} y={mid} textAnchor="middle" dominantBaseline="middle" transform={`rotate(-90 ${lx} ${mid})`} className="bpLabel" stroke="none">
          {label}
        </text>
      )}
    </g>
  );
}

/** Circle blueprint for round atoms (dot, avatar, spinner): diameter + radius. */
function CircleBlueprint({ size, id }: { size: SizeSpec; id?: string }) {
  const t = useT();
  const cx = 190;
  const cy = 118;
  const r = 44;
  const diameter = fmt(size.diameter);
  const border = fmt(size.border);
  const isAvatar = id === 'avatar';
  return (
    <svg viewBox="0 0 380 214" className="bpSvg" role="img" aria-label={`${t(m.bpBlueprintOfThe)} ${size.name} ${t(m.bpSize)}`}>
      <Defs />
      <circle cx={cx} cy={cy} r={r} fill={C.fill} stroke={C.edge} strokeWidth={border ? 2 : 1} strokeDasharray="4 3" />
      {isAvatar ? (
        // Avatar renders initials on the disc, so show sample initials instead of
        // the radius line to set it apart from a plain dot or spinner.
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          stroke="none"
          fill={C.text}
          style={{ fontSize: 30, fontWeight: 600, fontFamily: 'var(--glacier-font-sans)' }}
        >
          AB
        </text>
      ) : (
        <>
          <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={C.line} strokeWidth={1} />
          <text x={cx + r / 2} y={cy - 5} textAnchor="middle" className="bpLabel">r</text>
        </>
      )}
      <HDim x1={cx - r} x2={cx + r} y={cy - r - 18} label={`⌀ ${diameter ?? t(m.bpAuto)}`} />
      <text x={cx} y={cy + r + 26} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpRadiusFull)}{border ? `  ·  ${t(m.bpBorder)}: ${border}` : ''}</text>
      <BpTitle />
    </svg>
  );
}

/**
 * StatusDot blueprint: the presence dot pinned to the bottom-right of a host
 * element (an avatar or icon), which is how it is almost always used. The host
 * is a dotted circle for context; the dot itself is dimensioned by its diameter.
 */
function StatusDotBlueprint({ size }: { size: SizeSpec }) {
  const t = useT();
  const diameter = fmt(size.diameter);
  const hostCx = 190;
  const hostCy = 100;
  const hostR = 54;
  // pin the dot to the host's bottom-right edge (the 4:30 / 135° position).
  const [dx, dy] = polar(hostCx, hostCy, hostR, 135);
  const dotR = 21;
  return (
    <svg viewBox="0 0 380 214" className="bpSvg" role="img" aria-label={`${t(m.bpBlueprintOfThe)} ${size.name} ${t(m.bpSize)}`}>
      <Defs />
      {/* the host element the dot attaches to, drawn as a dotted circle */}
      <circle cx={hostCx} cy={hostCy} r={hostR} fill="none" stroke={C.edge} strokeWidth={1} strokeDasharray="2 4" strokeLinecap="round" />
      <text x={hostCx} y={hostCy} textAnchor="middle" dominantBaseline="central" stroke="none" className="bpLabel bpMuted">{t(m.bpHost)}</text>
      {/* the status dot, pinned to the bottom-right of the host */}
      <circle cx={dx} cy={dy} r={dotR} fill={C.fill} stroke={C.edge} strokeWidth={2} strokeDasharray="4 3" />
      {/* the dot's diameter, dimensioned below it */}
      <HDim x1={dx - dotR} x2={dx + dotR} y={dy + dotR + 22} label={`⌀ ${diameter ?? t(m.bpAuto)}`} above={false} />
      <BpTitle />
      <text x={16} y={198} className="bpLabel bpMuted">{t(m.bpRadiusFull)}</text>
    </svg>
  );
}

// Icon: the 24-unit glyph grid with a sample stroked glyph, the rendered size,
// and the shared stroke width called out.
function IconBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const strokeW = fmt(dimensions?.strokeWidth);
  const px = fmt(size.diameter);
  const X = 152;
  const Y = 52;
  const S = 96; // schematic box; the label carries the real pixel size
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheIcon)}>
      <Defs />
      {/* the glyph box (the 24-unit grid) */}
      <Frame x={X} y={Y} w={S} h={S} r={8} />
      {/* grid thirds, faint, to read as the drawing grid */}
      <g stroke={C.edge} strokeWidth={0.75} strokeOpacity={0.35}>
        <line x1={X + S / 3} y1={Y} x2={X + S / 3} y2={Y + S} />
        <line x1={X + (2 * S) / 3} y1={Y} x2={X + (2 * S) / 3} y2={Y + S} />
        <line x1={X} y1={Y + S / 3} x2={X + S} y2={Y + S / 3} />
        <line x1={X} y1={Y + (2 * S) / 3} x2={X + S} y2={Y + (2 * S) / 3} />
      </g>
      {/* a sample glyph (star) stroked like the set */}
      <path
        d={`M ${X + S / 2} ${Y + 18} l 9 18 20 3 -14.5 14 3.5 20 -18 -9.5 -18 9.5 3.5 -20 -14.5 -14 20 -3 Z`}
        fill="none"
        stroke={C.line}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <HDim x1={X} x2={X + S} y={Y - 18} label={`${t(m.bpSize)} ${px ?? '24px'}`} />
      <text x={X + S + 14} y={Y + S / 2 - 2} className="bpLabel bpMuted">{t(m.bpGlyph)}</text>
      {strokeW && (
        <text x={X + S + 14} y={Y + S / 2 + 16} className="bpLabel bpMuted">{t(m.bpStroke)} {strokeW}</text>
      )}
      <text x={X - 12} y={Y + 14} textAnchor="end" className="bpLabel bpMuted">{t(m.bp24Grid)}</text>
      <BpTitle />
      <Foot parts={[t(m.bpViewBox002424), t(m.bpColorCurrentColor), strokeW && `${t(m.bpStroke)}: ${strokeW}`]} />
    </svg>
  );
}

// A point on a circle, with 0° at 12 o'clock and angles going clockwise.
function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

// An SVG arc path sweeping clockwise from startDeg to endDeg at radius r.
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const [x0, y0] = polar(cx, cy, r, startDeg);
  const [x1, y1] = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

/**
 * Ring blueprint for stroked circular atoms (progress ring, spinner): the real
 * ring band with a toned arc drawn over it - the skeletal shape of the actual
 * component - dimensioned with its diameter and stroke thickness.
 */
function RingBlueprint({ size }: { size: SizeSpec }) {
  const t = useT();
  const cx = 200;
  const cy = 114;
  const R = 50; // outer radius (schematic; the label carries the real value)
  const bandW = 18; // schematic stroke-band width
  const rMid = R - bandW / 2;
  const rInner = R - bandW;
  const diameter = fmt(size.diameter);
  const thickness = fmt(size.thickness) ?? fmt(size.border);
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={`${t(m.bpBlueprintOfThe)} ${size.name} ${t(m.bpSize)}`}>
      <Defs />

      {/* the track band: a stroked circle as wide as the ring thickness */}
      <circle cx={cx} cy={cy} r={rMid} fill="none" stroke={C.fill} strokeWidth={bandW} />
      {/* the toned arc, drawn over the track the way the component fills */}
      <path d={arcPath(cx, cy, rMid, 0, 245)} fill="none" stroke={C.line} strokeWidth={bandW} strokeLinecap="round" opacity={0.9} />
      {/* band edges, dashed, so the skeletal ring reads as an outline too */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />

      {/* diameter across the top */}
      <HDim x1={cx - R} x2={cx + R} y={cy - R - 20} label={`⌀ ${diameter ?? t(m.bpAuto)}`} />
      {/* thickness measured across the band at 9 o'clock, clear of the arc */}
      {thickness && <HDim x1={cx - R} x2={cx - rInner} y={cy} label={thickness} />}

      <BpTitle />
      <text x={200} y={212} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpRadiusFull)}</text>
    </svg>
  );
}

/** Box blueprint for padded rounded atoms (button, input, pill, callout). */
/**
 * Slider blueprint: the thin rail with its filled leading portion and the round
 * thumb riding on it, dimensioned with the thumb diameter and track height.
 */
function SliderBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const trackH = fmt(dimensions?.trackHeight);
  const thumbDia = fmt(dimensions?.thumbDiameter);
  const radius = fmt(size.radius) ?? fmt(dimensions?.radius);

  // schematic geometry (not to scale; the labels carry the real values)
  const TX = 72;
  const TW = 256;
  const TY = 104;
  const TH = 16; // rail thickness
  const fillX = TX + TW * 0.42; // the value position, where the thumb sits
  const thumbR = 26;

  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheSlider)}>
      <Defs />

      {/* the rail */}
      <rect x={TX} y={TY - TH / 2} width={TW} height={TH} rx={TH / 2} fill={C.fill} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {/* the filled leading portion, up to the value */}
      <rect x={TX} y={TY - TH / 2} width={fillX - TX} height={TH} rx={TH / 2} fill={C.content} />
      {/* the thumb */}
      <circle cx={fillX} cy={TY} r={thumbR} fill={C.fill} stroke={C.line} strokeWidth={1.75} strokeDasharray="5 3" />

      {/* width across the rail */}
      <HDim x1={TX} x2={TX + TW} y={TY - thumbR - 18} label={t(m.bpWidthAuto)} />
      {/* the thumb diameter, below the thumb */}
      {thumbDia && <HDim x1={fillX - thumbR} x2={fillX + thumbR} y={TY + thumbR + 20} label={`⌀ ${thumbDia}`} above={false} />}

      <BpTitle />
      <text x={200} y={204} textAnchor="middle" className="bpLabel bpMuted">
        {[trackH && `${t(m.bpTrack)}: ${trackH}`, radius && `${t(m.bpRadius)}: ${radius}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Checkbox blueprint: the rounded box with its checkmark, edge, and radius. */
function CheckboxBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const edge = fmt(dimensions?.size);
  const icon = fmt(dimensions?.iconSize);
  const radius = fmt(dimensions?.radius);
  const border = fmt(dimensions?.border);

  // schematic geometry (not to scale; labels carry the real values)
  const S = 96;
  const BXc = (380 - S) / 2;
  const BYc = 56;
  const rr = 14;
  // a checkmark tracing the box, the way the real control draws it on check
  const check = `M ${BXc + S * 0.26} ${BYc + S * 0.52} L ${BXc + S * 0.44} ${BYc + S * 0.7} L ${BXc + S * 0.74} ${BYc + S * 0.32}`;

  return (
    <svg viewBox="0 0 380 214" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheCheckbox)}>
      <Defs />

      {/* the checked box: schematic bounds, the filled state, and the checkmark */}
      <rect x={BXc} y={BYc} width={S} height={S} rx={rr} fill={C.content} fillOpacity={0.28} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      <path d={check} fill="none" stroke={C.line} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />

      {/* the edge, marked on the top and left so the square reads as square */}
      {edge && <HDim x1={BXc} x2={BXc + S} y={BYc - 20} label={edge} />}
      {edge && <VDim x={BXc - 26} y1={BYc} y2={BYc + S} label={edge} />}

      {/* radius on the top-right corner */}
      {radius && (
        <>
          <path d={`M ${BXc + S - rr} ${BYc} A ${rr} ${rr} 0 0 1 ${BXc + S} ${BYc + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={366} y={BYc - 10} textAnchor="end" className="bpLabel">{t(m.bpRadius)}: {radius}</text>
        </>
      )}

      <BpTitle />
      <text x={190} y={200} textAnchor="middle" className="bpLabel bpMuted">
        {[icon && `${t(m.bpCheck)}: ${icon}`, border && `${t(m.bpBorder)}: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Radio blueprint: the hairline ring with its selected dot and diameter. */
function RadioBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const diameter = fmt(dimensions?.diameter);
  const dot = fmt(dimensions?.dotSize);
  const border = fmt(dimensions?.border);

  const cx = 190;
  const cy = 100;
  const R = 46;
  const dotR = dot ? R * 0.36 : 0; // dotSize / diameter, kept in proportion

  return (
    <svg viewBox="0 0 380 214" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheRadio)}>
      <Defs />

      {/* the ring and, at its center, the selected dot */}
      <circle cx={cx} cy={cy} r={R} fill={C.fill} stroke={C.edge} strokeWidth={1.75} strokeDasharray="5 3" />
      {dotR > 0 && <circle cx={cx} cy={cy} r={dotR} fill={C.line} />}

      {diameter && <HDim x1={cx - R} x2={cx + R} y={cy - R - 18} label={`⌀ ${diameter}`} />}

      <BpTitle />
      <text x={190} y={200} textAnchor="middle" className="bpLabel bpMuted">
        {[dot && `${t(m.bpDot)}: ${dot}`, t(m.bpRadiusFull), border && `${t(m.bpBorder)}: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Switch blueprint: the pill track with the sliding thumb, track size, and thumb diameter. */
function SwitchBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const cap = size.name.charAt(0).toUpperCase() + size.name.slice(1);
  const trackW = fmt(dimensions?.[`trackWidth${cap}`]);
  const trackH = fmt(size.height);
  const thumb = fmt(size.diameter);
  const pad = fmt(dimensions?.trackPadding);
  const border = fmt(dimensions?.border);

  // schematic geometry (not to scale; labels carry the real values)
  const TW = 188;
  const TH = 76;
  const TX = (400 - TW) / 2;
  const TY = 64;
  const p = 12; // schematic thumb inset (exaggerated so it can be dimensioned)
  const thumbR = (TH - 2 * p) / 2;
  const thumbCx = TX + TW - p - thumbR; // thumb rides at the trailing edge (on)
  const thumbCy = TY + TH / 2;

  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={`${t(m.bpBlueprintOfThe)} ${size.name} ${t(m.bpSwitch)}`}>
      <Defs />

      {/* the pill track, tinted to read as on, with the thumb at the trailing edge */}
      <rect x={TX} y={TY} width={TW} height={TH} rx={TH / 2} fill={C.content} fillOpacity={0.28} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      <circle cx={thumbCx} cy={thumbCy} r={thumbR} fill={C.fill} stroke={C.line} strokeWidth={1.75} />
      <text x={thumbCx} y={TY - 8} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpThumb)}</text>

      {/* track width on top, track height on the left */}
      {trackW && <HDim x1={TX} x2={TX + TW} y={TY - 24} label={trackW} />}
      {trackH && <VDim x={TX - 30} y1={TY} y2={TY + TH} label={trackH} />}

      {/* handle measurements: the thumb diameter below it, and its inset from the
          track edge (the track padding) marked on the trailing gap */}
      {thumb && <HDim x1={thumbCx - thumbR} x2={thumbCx + thumbR} y={TY + TH + 18} label={`⌀ ${thumb}`} above={false} />}
      {pad && <VDim x={thumbCx + thumbR + 16} y1={TY} y2={TY + p} label={pad} left={false} />}

      <BpTitle />
      <text x={200} y={212} textAnchor="middle" className="bpLabel bpMuted">
        {[t(m.bpRadiusFull), border && `${t(m.bpBorder)}: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Number input blueprint: the bordered group with its minus/plus step buttons. */
function NumberInputBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const height = fmt(size.height);
  const radius = fmt(size.radius) ?? fmt(dimensions?.radius);
  const border = fmt(size.border) ?? fmt(dimensions?.border);
  const font = fmt(size.fontSize);

  // schematic geometry (not to scale; labels carry the real values)
  const BX = 92;
  const BW = 216;
  const BY = 74;
  const BH = 60;
  const rr = radius === 'radius-full' ? BH / 2 : 14;
  const btnW = BH; // square step buttons at each end
  const leftDiv = BX + btnW;
  const rightDiv = BX + BW - btnW;
  const midY = BY + BH / 2;
  const g = 12; // glyph half-length

  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={`${t(m.bpBlueprintOfThe)} ${size.name} ${t(m.bpNumberInput)}`}>
      <Defs />

      {/* the bordered group */}
      <rect x={BX} y={BY} width={BW} height={BH} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={border ? 2 : 1.25} strokeDasharray="5 3" />

      {/* dividers splitting off the minus and plus step buttons */}
      <line x1={leftDiv} y1={BY} x2={leftDiv} y2={BY + BH} stroke={C.edge} strokeWidth={1.25} strokeDasharray="4 3" />
      <line x1={rightDiv} y1={BY} x2={rightDiv} y2={BY + BH} stroke={C.edge} strokeWidth={1.25} strokeDasharray="4 3" />

      {/* the minus glyph in the left button */}
      <line x1={BX + btnW / 2 - g} y1={midY} x2={BX + btnW / 2 + g} y2={midY} stroke={C.line} strokeWidth={3} strokeLinecap="round" />
      {/* the plus glyph in the right button */}
      <line x1={rightDiv + btnW / 2 - g} y1={midY} x2={rightDiv + btnW / 2 + g} y2={midY} stroke={C.line} strokeWidth={3} strokeLinecap="round" />
      <line x1={rightDiv + btnW / 2} y1={midY - g} x2={rightDiv + btnW / 2} y2={midY + g} stroke={C.line} strokeWidth={3} strokeLinecap="round" />

      {/* the centered, tabular number field */}
      <text
        x={(leftDiv + rightDiv) / 2}
        y={midY}
        textAnchor="middle"
        dominantBaseline="central"
        stroke="none"
        fill={C.line}
        style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--glacier-font-sans)', fontVariantNumeric: 'tabular-nums' }}
      >
        12
      </text>

      {/* height on the left, width on top */}
      {height && <VDim x={BX - 34} y1={BY} y2={BY + BH} label={height} />}
      <HDim x1={BX} x2={BX + BW} y={BY - 26} label={t(m.bpWidthAuto)} />

      {/* radius on the top-right corner */}
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={392} y={BY - 12} textAnchor="end" className="bpLabel">{t(m.bpRadius)}: {radius}</text>
        </>
      )}

      <BpTitle />
      <text x={200} y={212} textAnchor="middle" className="bpLabel bpMuted">
        {[font && `${t(m.bpFont)}: ${font}`, border && `${t(m.bpBorder)}: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Radio card blueprint: the tile with its icon, title, description, and corner check. */
function RadioCardBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const padding = fmt(dimensions?.padding);
  const gap = fmt(dimensions?.gap);
  const border = fmt(dimensions?.border);
  const radius = fmt(dimensions?.radius);
  const titleSize = fmt(dimensions?.titleSize);
  const descriptionSize = fmt(dimensions?.descriptionSize);
  const iconSize = fmt(dimensions?.iconSize);
  const indicator = fmt(dimensions?.indicator);

  // schematic geometry (not to scale; labels carry the real values)
  const BX = 104;
  const BW = 192;
  const BY = 40;
  const BH = 150;
  const rr = 14;
  const p = 26; // schematic padding inset
  const ix = BX + p;
  const iy = BY + p;
  const cix = BX + BW - p - 11; // corner check center
  const ciy = iy + 11;

  return (
    <svg viewBox="0 0 400 254" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheRadioCard)}>
      <Defs />

      {/* the selected card: schematic bounds with an accent tint */}
      <rect x={BX} y={BY} width={BW} height={BH} rx={rr} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={2} strokeDasharray="5 3" />

      {/* the leading icon */}
      <g transform={`translate(${ix} ${iy}) scale(${26 / 24})`} fill={C.line} stroke="none">
        <path d={PLACEHOLDER_ICON} />
      </g>

      {/* the corner check indicator, shown selected */}
      <circle cx={cix} cy={ciy} r={11} fill={C.line} />
      <path d={`M ${cix - 5} ${ciy + 0.5} L ${cix - 1.5} ${ciy + 4} L ${cix + 5} ${ciy - 4}`} fill="none" stroke={C.fill} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {/* the title and two description lines */}
      <rect x={ix} y={iy + 40} width={94} height={13} rx={3} fill={C.line} />
      <rect x={ix} y={iy + 62} width={140} height={9} rx={3} fill={C.content} />
      <rect x={ix} y={iy + 78} width={100} height={9} rx={3} fill={C.content} />

      {/* padding inset on the left, radius on the top-right corner */}
      {padding && <VDim x={BX - 32} y1={BY} y2={BY + p} label={padding} />}
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={388} y={BY - 10} textAnchor="end" className="bpLabel">{t(m.bpRadius)}: {radius}</text>
        </>
      )}

      <BpTitle />
      <Foot
        y={244}
        parts={[
          padding && `${t(m.bpPadding)}: ${padding}`,
          gap && `${t(m.bpGap)}: ${gap}`,
          border && `${t(m.bpBorder)}: ${border}`,
          titleSize && `${t(m.bpTitle)}: ${titleSize}`,
          descriptionSize && `${t(m.bpDesc)}: ${descriptionSize}`,
          iconSize && `${t(m.bpIcon)}: ${iconSize}`,
          indicator && `${t(m.bpCheck)}: ${indicator}`,
        ]}
      />
    </svg>
  );
}

/** Search field blueprint: the box with its leading magnifier and trailing clear (backspace) button. */
function SearchFieldBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const height = fmt(size.height);
  const padIn = fmt(size.paddingInline);
  const radius = fmt(size.radius) ?? fmt(dimensions?.radius);
  const border = fmt(size.border) ?? fmt(dimensions?.border);
  const font = fmt(size.fontSize);

  // schematic geometry (not to scale; labels carry the real values)
  const BX = 70;
  const BW = 260;
  const BY = 72;
  const BH = 60;
  const rr = radius === 'radius-full' ? BH / 2 : 14;
  const midY = BY + BH / 2;
  const pIn = 48; // schematic inset that clears the leading icon

  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={`${t(m.bpBlueprintOfThe)} ${size.name} ${t(m.bpSearchField)}`}>
      <Defs />

      {/* the field box */}
      <rect x={BX} y={BY} width={BW} height={BH} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={border ? 2 : 1.25} strokeDasharray="5 3" />

      {/* the leading magnifier */}
      <g transform={`translate(${BX + 15} ${midY - 11}) scale(${22 / 16})`} fill="none" stroke={C.line} strokeWidth={1.6} strokeLinecap="round">
        <circle cx="7" cy="7" r="4.5" />
        <path d="m11 11 3.5 3.5" />
      </g>

      {/* the placeholder text */}
      <text x={BX + pIn + 4} y={midY} dominantBaseline="central" stroke="none" fill={C.content} style={{ fontSize: 20, fontFamily: 'var(--glacier-font-sans)' }}>
        {t(m.bpSearch)}
      </text>

      {/* the trailing clear button, drawn as the backspace glyph */}
      <g transform={`translate(${BX + BW - 38} ${midY - 11}) scale(${22 / 24})`} fill="none" stroke={C.line} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
        <path d="m12 9 6 6" />
        <path d="m18 9-6 6" />
      </g>

      {/* height on the left, width on top, the icon inset below */}
      {height && <VDim x={BX - 34} y1={BY} y2={BY + BH} label={height} />}
      <HDim x1={BX} x2={BX + BW} y={BY - 26} label={t(m.bpWidthAuto)} />
      {padIn && <HDim x1={BX} x2={BX + pIn} y={BY + BH + 16} label={padIn} above={false} />}

      {/* radius on the top-right corner */}
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={392} y={BY - 12} textAnchor="end" className="bpLabel">{t(m.bpRadius)}: {radius}</text>
        </>
      )}

      <BpTitle />
      <text x={200} y={212} textAnchor="middle" className="bpLabel bpMuted">
        {[font && `${t(m.bpFont)}: ${font}`, border && `${t(m.bpBorder)}: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Callout blueprint: the bordered block with its leading icon, title, and body. */
function CalloutBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const paddingInline = fmt(dimensions?.paddingInline);
  const paddingBlock = fmt(dimensions?.paddingBlock);
  const radius = fmt(dimensions?.radius);
  const border = fmt(dimensions?.border);
  const gap = fmt(dimensions?.gap);
  const font = fmt(dimensions?.fontSize);

  // schematic geometry (not to scale; labels carry the real values)
  const BX = 72;
  const BW = 256;
  const BY = 48;
  const BH = 110;
  const rr = 14;
  const pIn = 28;
  const pBl = 22;
  const icx = BX + pIn + 11;
  const icy = BY + pBl + 11;
  const colX = BX + pIn + 36; // text column, past the icon and its gap

  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheCallout)}>
      <Defs />

      {/* the callout block */}
      <rect x={BX} y={BY} width={BW} height={BH} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={2} strokeDasharray="5 3" />

      {/* the leading icon (an info glyph), top-aligned with the title */}
      <circle cx={icx} cy={icy} r={11} fill="none" stroke={C.line} strokeWidth={2} />
      <circle cx={icx} cy={icy - 4.5} r={1.4} fill={C.line} />
      <line x1={icx} y1={icy - 1} x2={icx} y2={icy + 5} stroke={C.line} strokeWidth={2} strokeLinecap="round" />
      <text x={icx} y={icy + 24} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpIcon)}</text>

      {/* the bold title bar */}
      <rect x={colX} y={BY + pBl} width={80} height={13} rx={3} fill={C.line} />
      <text x={colX + 88} y={BY + pBl + 7} dominantBaseline="central" className="bpLabel bpMuted">{t(m.bpTitle)}</text>

      {/* the body lines */}
      <rect x={colX} y={BY + pBl + 22} width={104} height={9} rx={3} fill={C.content} />
      <rect x={colX} y={BY + pBl + 38} width={84} height={9} rx={3} fill={C.content} />
      <text x={colX + 112} y={BY + pBl + 26} dominantBaseline="central" className="bpLabel bpMuted">{t(m.bpBody)}</text>

      {/* width on top, padding-inline below, padding-block on the right */}
      <HDim x1={BX} x2={BX + BW} y={BY - 24} label={t(m.bpWidthAuto)} />
      {paddingInline && <HDim x1={BX} x2={BX + pIn} y={BY + BH + 14} label={paddingInline} above={false} />}
      {paddingBlock && <VDim x={BX + BW + 14} y1={BY} y2={BY + pBl} label={paddingBlock} left={false} horizontal />}

      {/* radius on the top-right corner */}
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={390} y={BY - 10} textAnchor="end" className="bpLabel">{t(m.bpRadius)}: {radius}</text>
        </>
      )}

      <BpTitle y={16} />
      <text x={200} y={214} textAnchor="middle" className="bpLabel bpMuted">
        {[gap && `${t(m.bpGap)}: ${gap}`, font && `${t(m.bpFont)}: ${font}`, border && `${t(m.bpBorder)}: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Banner blueprint: the wide full-width strip with its icon, message, action, and dismiss. */
function BannerBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const paddingInline = fmt(dimensions?.paddingInline);
  const paddingBlock = fmt(dimensions?.paddingBlock);
  const radius = fmt(dimensions?.radius);
  const border = fmt(dimensions?.border);
  const gap = fmt(dimensions?.gap);
  const font = fmt(dimensions?.fontSize);

  // schematic geometry (not to scale; labels carry the real values). The banner
  // is a full-width strip, so the figure is wide; it is tall enough that the
  // part labels above and the measurements below never clip into each other.
  const W = 460;
  const H = 212;
  const BX = 48;
  const BW = 364;
  const BY = 72;
  const BH = 56;
  const rr = 12;
  const pIn = 22;
  const pBl = 15;
  const midY = BY + BH / 2;
  const icx = BX + pIn + 10;
  const dismissCx = BX + BW - pIn - 8;
  const btnW = 74;
  const btnX = dismissCx - 18 - btnW;
  const btnY = midY - 15;
  const msgX = icx + 22;
  const msgW = btnX - msgX - 16;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheBanner)}>
      <Defs />

      {/* the full-width strip */}
      <rect x={BX} y={BY} width={BW} height={BH} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={2} strokeDasharray="5 3" />

      {/* leading icon (an info glyph) */}
      <circle cx={icx} cy={midY} r={10} fill="none" stroke={C.line} strokeWidth={2} />
      <circle cx={icx} cy={midY - 4} r={1.3} fill={C.line} />
      <line x1={icx} y1={midY - 1} x2={icx} y2={midY + 5} stroke={C.line} strokeWidth={2} strokeLinecap="round" />
      <text x={icx} y={BY - 14} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpIcon)}</text>

      {/* the flexible message line */}
      <rect x={msgX} y={midY - 5} width={msgW} height={10} rx={3} fill={C.content} />
      <text x={msgX + msgW / 2} y={BY - 14} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpMessage)}</text>

      {/* the trailing action button */}
      <rect x={btnX} y={btnY} width={btnW} height={30} rx={8} fill={C.content} fillOpacity={0.3} stroke={C.line} strokeWidth={1.5} />
      <rect x={btnX + 16} y={midY - 4} width={btnW - 32} height={8} rx={3} fill={C.line} />
      <text x={btnX + btnW / 2} y={BY - 14} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpAction)}</text>

      {/* the trailing dismiss control */}
      <path
        d={`M ${dismissCx - 5} ${midY - 5} L ${dismissCx + 5} ${midY + 5} M ${dismissCx + 5} ${midY - 5} L ${dismissCx - 5} ${midY + 5}`}
        stroke={C.line}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <text x={dismissCx} y={BY - 14} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpDismiss)}</text>

      {/* padding-inline below, padding-block on the right */}
      {paddingInline && <HDim x1={BX} x2={BX + pIn} y={BY + BH + 18} label={paddingInline} above={false} />}
      {paddingBlock && <VDim x={BX + BW + 24} y1={BY} y2={BY + pBl} label={paddingBlock} left={false} />}

      {/* radius on the top-right corner, labelled up in the title row so it clears the part labels */}
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={W - 8} y={28} textAnchor="end" className="bpLabel">{t(m.bpRadius)}: {radius}</text>
        </>
      )}

      <BpTitle />
      <Foot
        y={H - 14}
        x={W / 2}
        parts={[t(m.bpWidthFull), gap && `${t(m.bpGap)}: ${gap}`, font && `${t(m.bpFont)}: ${font}`, border && `${t(m.bpBorder)}: ${border}`]}
      />
    </svg>
  );
}

/** Announcements blueprint: a rotating ticker with a clipped message viewport and compact controls. */
function AnnouncementsBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const minHeight = fmt(dimensions?.minHeight);
  const paddingStart = fmt(dimensions?.paddingInlineStart);
  const paddingEnd = fmt(dimensions?.paddingInlineEnd);
  const paddingBlock = fmt(dimensions?.paddingBlock);
  const viewportPadding = fmt(dimensions?.viewportPaddingInline);
  const controlSize = fmt(dimensions?.controlSize);
  const radius = fmt(dimensions?.radius);
  const border = fmt(dimensions?.border);
  const gap = fmt(dimensions?.gap);
  const W = 460;
  const H = 224;
  const BX = 48;
  const BY = 74;
  const BW = 364;
  const BH = 56;
  const rr = 12;
  const pStart = 22;
  const pEnd = 18;
  const pViewport = 6;
  const midY = BY + BH / 2;
  const viewportX = BX + pStart;
  const controlsW = 116;
  const viewportW = BW - pStart - pEnd - controlsW - 14;
  const controlsX = viewportX + viewportW + 14;
  const labelW = 48;
  const labelX = viewportX + pViewport;
  const contentX = labelX + labelW + 10;
  const contentW = viewportW - pViewport * 2 - labelW - 10;
  const controlY = midY - 11;
  const previousX = controlsX;
  const positionX = controlsX + 28;
  const pauseX = controlsX + 68;
  const nextX = controlsX + 96;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheAnnouncements)}>
      <Defs />

      <rect x={BX} y={BY} width={BW} height={BH} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={2} strokeDasharray="5 3" />

      {/* Clipped ticker viewport: category label followed by one changing announcement line. */}
      <rect x={viewportX} y={midY - 9} width={viewportW} height={18} rx={4} fill="none" stroke={C.grid} strokeWidth={1.25} strokeDasharray="3 2" />
      <rect x={labelX} y={midY - 4} width={labelW} height={8} rx={3} fill={C.line} />
      <rect x={contentX} y={midY - 4} width={contentW} height={8} rx={3} fill={C.content} />
      <text x={labelX + labelW / 2} y={BY - 14} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpLabel)}</text>
      <text x={contentX + contentW / 2} y={BY - 14} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpContent)}</text>
      <text x={viewportX + viewportW / 2} y={BY + BH + 16} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpViewport)}</text>

      {/* Previous, position, pause, and next controls remain fixed at the inline end. */}
      <rect x={previousX} y={controlY} width={20} height={22} rx={5} fill={C.content} fillOpacity={0.3} stroke={C.line} strokeWidth={1} />
      <path d={`M ${previousX + 12} ${midY - 4} L ${previousX + 8} ${midY} L ${previousX + 12} ${midY + 4}`} fill="none" stroke={C.line} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
      <text x={positionX + 16} y={midY + 4} textAnchor="middle" className="bpLabel" fill={C.faint}>1 / 3</text>
      <rect x={pauseX} y={controlY} width={20} height={22} rx={5} fill={C.content} fillOpacity={0.3} stroke={C.line} strokeWidth={1} />
      <line x1={pauseX + 7} y1={midY - 4} x2={pauseX + 7} y2={midY + 4} stroke={C.line} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={pauseX + 13} y1={midY - 4} x2={pauseX + 13} y2={midY + 4} stroke={C.line} strokeWidth={1.5} strokeLinecap="round" />
      <rect x={nextX} y={controlY} width={20} height={22} rx={5} fill={C.content} fillOpacity={0.3} stroke={C.line} strokeWidth={1} />
      <path d={`M ${nextX + 8} ${midY - 4} L ${nextX + 12} ${midY} L ${nextX + 8} ${midY + 4}`} fill="none" stroke={C.line} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
      <text x={controlsX + 53} y={BY - 14} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpControl)}</text>

      {paddingStart && <HDim x1={BX} x2={BX + pStart} y={BY + BH + 34} label={paddingStart} above={false} />}
      {paddingEnd && <HDim x1={BX + BW - pEnd} x2={BX + BW} y={BY + BH + 34} label={paddingEnd} above={false} />}
      {paddingBlock && <VDim x={BX + BW + 24} y1={BY} y2={BY + 14} label={paddingBlock} left={false} />}
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={W - 8} y={28} textAnchor="end" className="bpLabel">{t(m.bpRadius)}: {radius}</text>
        </>
      )}

      <BpTitle />
      <Foot y={H - 14} x={W / 2} parts={[minHeight && `${t(m.bpHeight)}: ${minHeight}`, viewportPadding && `${t(m.bpViewport)}: ${viewportPadding}`, controlSize && `${t(m.bpControl)}: ${controlSize}`, gap && `${t(m.bpGap)}: ${gap}`, border && `${t(m.bpBorder)}: ${border}`]} />
    </svg>
  );
}

/** Meter blueprint: the row of discrete segments (pips) that fill from the left. */
function MeterBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const height = fmt(size.height);
  const gap = fmt(dimensions?.gap);

  // schematic geometry (not to scale; labels carry the real values)
  const N = 5;
  const FILLED = 3;
  const segW = 48;
  const segH = 28;
  const g = 14; // schematic gap between segments
  const rr = segH / 2; // radius-full: each pip is a lozenge
  const totalW = N * segW + (N - 1) * g;
  const SX = (400 - totalW) / 2;
  const SY = 88;
  const segX = (i: number) => SX + i * (segW + g);

  return (
    <svg viewBox="0 0 400 214" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheMeter)}>
      <Defs />

      {/* the discrete segments: filled pips fill from the left, the rest are empty track */}
      {Array.from({ length: N }, (_, i) => {
        const filled = i < FILLED;
        return (
          <rect
            key={i}
            x={segX(i)}
            y={SY}
            width={segW}
            height={segH}
            rx={rr}
            fill={filled ? C.content : C.fill}
            stroke={filled ? 'none' : C.edge}
            strokeWidth={filled ? 0 : 1.5}
            strokeDasharray={filled ? undefined : '5 3'}
          />
        );
      })}

      {/* state labels above the two groups */}
      <text x={(segX(0) + segX(FILLED - 1) + segW) / 2} y={SY - 16} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpFilled)}</text>
      <text x={(segX(FILLED) + segX(N - 1) + segW) / 2} y={SY - 16} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpEmpty)}</text>

      {/* width on top, one segment's height on the left, the gap between two segments below */}
      <HDim x1={SX} x2={SX + totalW} y={SY - 34} label={t(m.bpWidthAuto)} />
      {height && <VDim x={SX - 26} y1={SY} y2={SY + segH} label={height} />}
      {gap && <HDim x1={segX(0) + segW} x2={segX(1)} y={SY + segH + 18} label={gap} above={false} />}

      <BpTitle />
      <text x={200} y={202} textAnchor="middle" className="bpLabel bpMuted">
        {[t(m.bpSegments4Default), t(m.bpRadiusFull)].join('   ·   ')}
      </text>
    </svg>
  );
}

// SegmentedBar: one proportional bar split into slices sized by share of the
// total, with the uncovered remainder painting the empty track. Draw a few
// example slices with their share labelled inside, plus the height, gap, radius
// and slice-radius measurements.
function SegmentedBarBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const height = fmt(size.height);
  const gap = fmt(dimensions?.gap);
  const radius = fmt(dimensions?.radius);
  const sliceRadius = fmt(dimensions?.sliceRadius);

  // schematic geometry (not to scale; labels carry the real values)
  const BW = 316;
  const BH = 30;
  const SX = (400 - BW) / 2;
  const SY = 98;
  const rr = BH / 2; // radius-full ends
  const sr = 3; // schematic slice radius (real value lives in the footnote)
  // Wide enough for the gap dimension's opposed arrowheads to render (HDim needs
  // >= 2x its 6px chevrons between the witness lines); the label carries the real
  // value. The slices are scaled to the track minus the two gaps below so their
  // shares stay proportional and the empty remainder still reads.
  const g = 20; // schematic gap between slices

  // three example slices sized by share of the total; the rest is empty track
  const shares = [40, 25, 20];
  let cursor = SX;
  let firstMidX = SX;
  let firstRight = SX;
  let secondX = SX;
  const slices = shares.map((share, i) => {
    const w = (share / 100) * (BW - 2 * g);
    const s = { x: cursor, w, share, first: i === 0 };
    if (i === 0) {
      firstMidX = cursor + w / 2;
      firstRight = cursor + w;
    }
    if (i === 1) secondX = cursor;
    cursor += w + g;
    return s;
  });
  const emptyX = cursor - g;
  const emptyW = SX + BW - emptyX;

  // a rect with independent corner radii, for the first slice's rounded-full end
  const cornerPath = (x: number, y: number, w: number, h: number, tl: number, tr: number, br: number, bl: number) =>
    `M ${x + tl} ${y} L ${x + w - tr} ${y} A ${tr} ${tr} 0 0 1 ${x + w} ${y + tr} L ${x + w} ${y + h - br} A ${br} ${br} 0 0 1 ${x + w - br} ${y + h} L ${x + bl} ${y + h} A ${bl} ${bl} 0 0 1 ${x} ${y + h - bl} L ${x} ${y + tl} A ${tl} ${tl} 0 0 1 ${x + tl} ${y} Z`;

  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheSegmentedBar)}>
      <Defs />

      {/* the track: the container that clips the slices and paints the empty remainder */}
      <rect x={SX} y={SY} width={BW} height={BH} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />

      {/* the proportional slices, each sized by its share of the total and labelled with it */}
      {slices.map((s, i) => {
        const op = 0.55 - i * 0.08;
        const d = s.first
          ? cornerPath(s.x, SY, s.w, BH, rr, sr, sr, rr)
          : cornerPath(s.x, SY, s.w, BH, sr, sr, sr, sr);
        return (
          <g key={i}>
            <path d={d} fill={C.content} fillOpacity={op} stroke={C.edge} strokeWidth={1} />
            <text
              x={s.x + s.w / 2}
              y={SY + BH / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={C.text}
              stroke="none"
              style={{ fontFamily: 'var(--glacier-font-sans)', fontSize: 11, fontWeight: 600 }}
            >
              {s.share}%
            </text>
          </g>
        );
      })}

      {/* anatomy callouts: a slice, and the empty remainder of the track */}
      <text x={firstMidX} y={SY - 14} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpSlice)}</text>
      {emptyW > 24 && (
        <text x={emptyX + emptyW / 2} y={SY - 14} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpTrack)}</text>
      )}

      {/* width on top, one slice height on the left, the gap between two slices below */}
      <HDim x1={SX} x2={SX + BW} y={SY - 32} label={t(m.bpWidthAuto)} />
      {height && <VDim x={SX - 22} y1={SY} y2={SY + BH} label={height} />}
      {gap && <HDim x1={firstRight} x2={secondX} y={SY + BH + 18} label={gap} above={false} />}

      <BpTitle />
      <text x={200} y={212} textAnchor="middle" className="bpLabel bpMuted">
        {[radius && `${t(m.bpRadius)}: ${radius}`, sliceRadius && `${t(m.bpSliceRadius)}: ${sliceRadius}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

// A generic placeholder glyph (lucide "star") standing in for a real icon in
// the anatomy figure. Inlined so the docs figure needs no icon dependency.
const PLACEHOLDER_ICON =
  'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z';

// A leading/trailing icon marker in a 16px box at `x`, centered on `cy`. Inline-
// icon controls (the button) show a filled placeholder glyph; edge adornments
// (the input) show a dashed slot outline.
function IconSlot({ x, cy, placeholder }: { x: number; cy: number; placeholder: boolean }) {
  if (placeholder) {
    return (
      <g transform={`translate(${x} ${cy - 8}) scale(${16 / 24})`} fill={C.line} stroke="none">
        <path d={PLACEHOLDER_ICON} />
      </g>
    );
  }
  return (
    <>
      <rect x={x} y={cy - 8} width={16} height={16} rx={4} fill="none" stroke={C.line} strokeWidth={1.25} strokeDasharray="2 2" />
      <circle cx={x + 8} cy={cy} r={2.5} fill={C.line} />
    </>
  );
}

function BoxBlueprint({ size, dimensions, slots, id }: BlueprintProps) {
  const t = useT();
  // schematic geometry (not to scale; labels carry the exact values)
  const BX = 118;
  const BW = 176;
  const BY = 74;
  const BH = 60;
  const padIn = fmt(size.paddingInline);
  const padBl = fmt(size.paddingBlock);
  const height = fmt(size.height);
  const radius = fmt(size.radius) ?? fmt(dimensions?.radius);
  const border = fmt(size.border) ?? fmt(dimensions?.border);
  const gap = fmt(size.gap) ?? fmt(dimensions?.gap);
  const font = fmt(size.fontSize);

  const pIn = padIn ? 34 : 0; // schematic inset for the inline padding frame
  const pBl = padBl ? 18 : 0; // schematic inset for the block padding frame
  const pill = radius === 'radius-full' || radius === '9999px' || radius === 'control-radius';
  const rr = pill ? BH / 2 : radius ? 14 : 6;
  // The content box: inset horizontally by the inline padding. A single-line
  // control (button, input, pill) carries no block padding - its label is one
  // line centered by line-height - so draw the content as a centered line with
  // the leading above and below, not a box that fills the full height.
  const singleLine = !padBl && !!padIn;
  const cw = BW - pIn * 2;
  const ch = singleLine ? 30 : BH - pBl * 2;
  const cy0 = singleLine ? BY + (BH - ch) / 2 : BY + pBl;
  const crx = Math.max(Math.min(rr, ch / 2) - 5, 3);

  // Icon slots. The button's icons flow inside the content (they are part of
  // children, past the inline padding), so pin them to the content edges; the
  // input's icons are edge adornments, so pin them to the box edge.
  const inlineIcons = id === 'button' || id === 'pill';
  const iconY = BY + BH / 2;
  const leadIconX = inlineIcons ? BX + pIn + 2 : BX + 12;
  const trailIconX = inlineIcons ? BX + pIn + cw - 18 : BX + BW - 28;

  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={`${t(m.bpBlueprintOfThe)} ${size.name} ${t(m.bpSize)}`}>
      <Defs />

      {/* the component box */}
      <rect x={BX} y={BY} width={BW} height={BH} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={border ? 2 : 1.25} strokeDasharray="5 3" />
      {/* the content box: the area left inside the padding. It carries its own
          fill so the padding reads as the frame around it on every padded side,
          not only where a dimension line happens to sit. */}
      {(pIn || pBl) > 0 && (
        <rect
          x={BX + pIn}
          y={cy0}
          width={cw}
          height={ch}
          rx={crx}
          fill={C.content}
          fillOpacity={0.28}
          stroke={C.text}
          strokeWidth={1}
          strokeDasharray="3 2"
        />
      )}

      {/* optional leading / trailing icon slots, drawn where the spec declares them */}
      {slots?.includes('leadingIcon') && <IconSlot x={leadIconX} cy={iconY} placeholder={inlineIcons} />}
      {slots?.includes('trailingIcon') && <IconSlot x={trailIconX} cy={iconY} placeholder={inlineIcons} />}

      {/* the pill's optional slots: a leading icon and the trailing remove
          button, drawn dashed since both are opt-in, with their anatomy names */}
      {id === 'pill' && slots?.includes('icon') && (
        <>
          <IconSlot x={leadIconX} cy={iconY} placeholder />
          <text x={leadIconX + 14} y={BY + BH + 32} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpIcon)}</text>
        </>
      )}
      {id === 'pill' && slots?.includes('remove') && (
        <>
          <g stroke={C.line} fill="none" strokeWidth={1.25} strokeLinecap="round">
            <circle cx={BX + pIn + cw - 10} cy={iconY} r={8} strokeDasharray="2 2" />
            <path d={`M ${BX + pIn + cw - 13} ${iconY - 3} l 6 6 M ${BX + pIn + cw - 7} ${iconY - 3} l -6 6`} />
          </g>
          <text x={BX + pIn + cw - 10} y={BY + BH + 32} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpRemove)}</text>
        </>
      )}

      {/* the label slot: show the button's real text where the label sits, between
          the leading and trailing icon slots */}
      {id === 'button' && slots?.includes('label') && (
        <text
          x={BX + pIn + cw / 2}
          y={iconY}
          textAnchor="middle"
          dominantBaseline="central"
          fill={C.text}
          stroke="none"
          style={{ fontFamily: 'var(--glacier-font-sans)', fontSize: 15, fontWeight: 600 }}
        >
          {t(m.bpButton)}
        </text>
      )}

      {/* content label: show the atom's own text centred in the box */}
      {(id === 'text' || id === 'heading' || id === 'counter-badge') && (
        <text
          x={BX + BW / 2}
          y={BY + BH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={C.text}
          stroke="none"
          style={{
            fontFamily: 'var(--glacier-font-sans)',
            fontSize: id === 'heading' ? 22 : id === 'counter-badge' ? 17 : 15,
            fontWeight: id === 'heading' ? 700 : 600,
          }}
        >
          {id === 'heading' ? t(m.bpHeading) : id === 'counter-badge' ? '99+' : t(m.bpText)}
        </text>
      )}

      {/* the pill's own label, centred in the capsule */}
      {id === 'pill' && (
        <text
          x={BX + BW / 2}
          y={BY + BH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={C.text}
          stroke="none"
          style={{ fontFamily: 'var(--glacier-font-sans)', fontSize: 15, fontWeight: 600 }}
        >
          {t(m.bpOnline)}
        </text>
      )}

      {/* height on the left */}
      {height && <VDim x={BX - 34} y1={BY} y2={BY + BH} label={height} />}
      {/* width span on top (content-sized, but the box width is shown) */}
      <HDim x1={BX} x2={BX + BW} y={BY - 26} label={t(m.bpWidthAuto)} />

      {/* padding-inline: measured across the left gap; the right gap is symmetric */}
      {padIn && <HDim x1={BX} x2={BX + pIn} y={BY + BH + 16} label={padIn} above={false} />}
      {/* padding-block: measured across the top gap; the bottom gap is symmetric */}
      {padBl && <VDim x={BX + BW + 30} y1={BY} y2={BY + pBl} label={padBl} left={false} horizontal />}

      {/* radius: an arc traced on the top-right corner, labelled above it */}
      {radius && (
        <>
          <path
            d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`}
            fill="none"
            stroke={C.line}
            strokeWidth={1.5}
          />
          <text x={392} y={BY - 12} textAnchor="end" className="bpLabel">
            {t(m.bpRadius)}: {radius}
          </text>
        </>
      )}

      {/* footnotes for the non-geometric measures */}
      <BpTitle />
      <text x={200} y={212} textAnchor="middle" className="bpLabel bpMuted">
        {[font && `${t(m.bpFont)}: ${font}`, border && `${t(m.bpBorder)}: ${border}`, gap && `${t(m.bpGap)}: ${gap}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Bar blueprint for thin line atoms (divider, progress bar): thickness + radius. */
// Textarea: a multi-line field - a taller, more square box with placeholder
// lines and the vertical resize grip in the bottom-right corner.
function TextareaBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const padIn = fmt(size.paddingInline);
  const radius = fmt(dimensions?.radius);
  const border = fmt(dimensions?.border);
  const minHeight = fmt(dimensions?.minHeight);
  const BW = 150;
  const BH = 124;
  const BX = (400 - BW) / 2;
  const BY = 44;
  const rr = 12;
  const pIn = 18;
  const pBl = 16;
  const cw = BW - pIn * 2;
  const rx = BX + BW;
  const ry = BY + BH;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheTextarea)}>
      <Defs />
      <Frame x={BX} y={BY} w={BW} h={BH} r={rr} />
      {/* multi-line placeholder text */}
      {[0, 1, 2, 3].map((i) => (
        <Ln key={i} x={BX + pIn} y={BY + pBl + i * 17} w={i === 3 ? cw * 0.55 : cw} h={6} op={0.45} />
      ))}
      {/* resize grip, bottom-right corner */}
      <g stroke={C.line} strokeWidth={1.5} strokeLinecap="round">
        <line x1={rx - 7} y1={ry - 17} x2={rx - 17} y2={ry - 7} />
        <line x1={rx - 7} y1={ry - 11} x2={rx - 11} y2={ry - 7} />
      </g>
      {/* measurements */}
      <HDim x1={BX} x2={BX + BW} y={BY - 20} label={t(m.bpWidthAuto)} />
      {minHeight && <VDim x={BX - 24} y1={BY} y2={BY + BH} label={`${t(m.bpMin)} ${minHeight}`} />}
      <text x={rx + 12} y={ry - 8} className="bpLabel bpMuted">{t(m.bpResize)}</text>
      <BpTitle />
      <Foot y={214} parts={[radius && `${t(m.bpRadius)}: ${radius}`, padIn && `${t(m.bpPadding)}: ${padIn}`, border && `${t(m.bpBorder)}: ${border}`]} />
    </svg>
  );
}

// Skeleton: the loading-placeholder primitive - a little content skeleton
// (avatar, lines, image block) with a static blue-to-transparent shimmer on
// each shape.
function SkeletonBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const rectRadius = fmt(dimensions?.rectRadius);
  const circleRadius = fmt(dimensions?.circleRadius);
  const g = 'url(#bpSkel)';
  const RX = 80;
  const RY = 70;
  const RW = 112;
  const RH = 76;
  const Ccx = 300;
  const Ccy = RY + RH / 2;
  const Cr = 38;
  return (
    <svg viewBox="0 0 400 214" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheSkeleton)}>
      <Defs />
      <defs>
        <linearGradient id="bpSkel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--glacier-accent-solid)" stopOpacity={0.8} />
          <stop offset="1" stopColor="var(--glacier-accent-solid)" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      {/* one rect + one circle, filled with the static blue-to-transparent shimmer */}
      <rect x={RX} y={RY} width={RW} height={RH} rx={10} fill={g} />
      <circle cx={Ccx} cy={Ccy} r={Cr} fill={g} />
      {/* the width bar over the rect, and the circle's diameter */}
      <HDim x1={RX} x2={RX + RW} y={RY - 20} label={t(m.bpWidthAuto)} />
      <HDim x1={Ccx - Cr} x2={Ccx + Cr} y={Ccy - Cr - 18} label={t(m.bpDiameterWidth)} />
      <text x={RX + RW / 2} y={RY + RH + 20} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpRect)}</text>
      <text x={Ccx} y={Ccy + Cr + 20} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpCircle)}</text>
      <BpTitle />
      <Foot y={202} parts={[rectRadius && `${t(m.bpRect)}: ${rectRadius}`, circleRadius && `${t(m.bpCircle)}: ${circleRadius}`]} />
    </svg>
  );
}

// CodeBlock: a framed code panel with a header (filename, language, copy), a
// line-number gutter, and the source - a small main() function.
function CodeBlockBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const border = fmt(dimensions?.border);
  const prePadding = fmt(dimensions?.prePadding);
  const X = 66;
  const W = 268;
  const Y = 44;
  const H = 134;
  const headerH = 28;
  const gutterW = 24;
  const bodyY = Y + headerH;
  const mono = 'var(--glacier-font-mono)';
  const lines = ['function main() {', '  render();', '}'];
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheCodeBlock)}>
      <Defs />
      <Frame x={X} y={Y} w={W} h={H} r={12} />
      {/* header: filename, language, copy */}
      <line x1={X} y1={bodyY} x2={X + W} y2={bodyY} stroke={C.edge} strokeWidth={1} />
      <text x={X + 12} y={Y + headerH / 2} dominantBaseline="central" fill={C.text} stroke="none" style={{ fontFamily: mono, fontSize: 11 }}>{t(m.bpMainTs)}</text>
      <text x={X + W - 80} y={Y + headerH / 2} dominantBaseline="central" fill={C.faint} stroke="none" style={{ fontFamily: mono, fontSize: 9 }}>TS</text>
      <rect x={X + W - 52} y={Y + 6} width={42} height={headerH - 12} rx={4} fill={C.content} fillOpacity={0.32} />
      <text x={X + W - 31} y={Y + headerH / 2} textAnchor="middle" dominantBaseline="central" fill={C.text} stroke="none" style={{ fontFamily: mono, fontSize: 9 }}>{t(m.bpCopyButton)}</text>
      {/* line-number gutter */}
      <line x1={X + gutterW} y1={bodyY} x2={X + gutterW} y2={Y + H} stroke={C.edge} strokeWidth={1} />
      {lines.map((ln, i) => {
        const ly = bodyY + 22 + i * 22;
        return (
          <g key={i}>
            <text x={X + gutterW - 7} y={ly} textAnchor="end" dominantBaseline="central" fill={C.faint} stroke="none" style={{ fontFamily: mono, fontSize: 10 }}>{i + 1}</text>
            <text x={X + gutterW + 10} y={ly} dominantBaseline="central" fill={C.text} stroke="none" style={{ fontFamily: mono, fontSize: 12, fontWeight: 500 }}>{ln}</text>
          </g>
        );
      })}
      <text x={X + W + 12} y={Y + headerH / 2} className="bpLabel bpMuted">{t(m.bpHeader)}</text>
      <text x={X + W - 31} y={Y - 8} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpCopy)}</text>
      <text x={X + W + 12} y={bodyY + 44} className="bpLabel bpMuted">{t(m.bpPre)}</text>
      <text x={X - 10} y={bodyY + 44} textAnchor="end" className="bpLabel bpMuted">{t(m.bpGutter)}</text>
      <BpTitle />
      <Foot parts={[radius && `${t(m.bpRadius)}: ${radius}`, prePadding && `${t(m.bpPadding)}: ${prePadding}`, border && `${t(m.bpBorder)}: ${border}`]} />
    </svg>
  );
}

// Steps: a row of progress dots - completed solid, the current one enlarged,
// upcoming ones hollow with a hairline border.
function StepsBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const diameter = fmt(size.diameter);
  const gap = fmt(size.gap) ?? fmt(dimensions?.gap);
  const radius = fmt(dimensions?.radius);
  const border = fmt(dimensions?.border);
  const currentScale = fmt(dimensions?.currentScale) ?? '1.5';
  const N = 5;
  const active = 2;
  const r = 9;
  const cr = 13.5; // current dot: r x 1.5
  const cgap = 56;
  const totalW = (N - 1) * cgap;
  const SX = (400 - totalW) / 2;
  const Y = 82;
  const cxOf = (i: number) => SX + i * cgap;
  return (
    <svg viewBox="0 0 400 174" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheSteps)}>
      <Defs />
      {Array.from({ length: N }, (_, i) => {
        if (i < active) return <circle key={i} cx={cxOf(i)} cy={Y} r={r} fill={C.content} fillOpacity={0.7} />;
        if (i === active) return <circle key={i} cx={cxOf(i)} cy={Y} r={cr} fill={C.content} fillOpacity={0.95} stroke={C.text} strokeWidth={1} />;
        return <circle key={i} cx={cxOf(i)} cy={Y} r={r} fill={C.fill} stroke={C.edge} strokeWidth={1.25} />;
      })}
      <text x={(cxOf(0) + cxOf(1)) / 2} y={Y + cr + 16} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpCompleted)}</text>
      <text x={cxOf(active)} y={Y - cr - 10} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpCurrent)} ×{currentScale}</text>
      <text x={(cxOf(3) + cxOf(4)) / 2} y={Y + cr + 16} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpUpcoming)}</text>
      {diameter && <HDim x1={cxOf(0) - r} x2={cxOf(0) + r} y={Y - r - 12} label={`⌀ ${diameter}`} />}
      {gap && <HDim x1={cxOf(3) + r} x2={cxOf(4) - r} y={Y - r - 12} label={gap} />}
      <BpTitle />
      <Foot y={162} parts={[radius && `${t(m.bpRadius)}: ${radius}`, border && `${t(m.bpBorder)}: ${border}`, `${t(m.bpCount)} ${N} · ${t(m.bpActive)} ${active}`]} />
    </svg>
  );
}

// ProgressBar: a thin rounded track with a tone fill sized to the value.
function ProgressBarBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const height = fmt(size.height);
  const radius = fmt(dimensions?.radius);
  const X = 70;
  const W = 260;
  const H = 22;
  const Y = 82;
  const rr = H / 2;
  const fillW = Math.round(W * 0.6);
  return (
    <svg viewBox="0 0 400 174" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheProgressBar)}>
      <Defs />
      {/* the track */}
      <rect x={X} y={Y} width={W} height={H} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      {/* the fill, sized to the value */}
      <rect x={X} y={Y} width={fillW} height={H} rx={rr} fill={C.content} fillOpacity={0.55} stroke={C.text} strokeWidth={1} />
      <text x={X + fillW / 2} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpFill)}</text>
      <text x={X + fillW + (W - fillW) / 2} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpTrack)}</text>
      <HDim x1={X} x2={X + W} y={Y - 30} label={t(m.bpWidthAuto)} />
      {height && <VDim x={X - 22} y1={Y} y2={Y + H} label={height} />}
      <HDim x1={X} x2={X + fillW} y={Y + H + 16} label={t(m.bpValue60OfMax)} above={false} />
      <BpTitle />
      <Foot y={162} parts={[height && `${t(m.bpHeight)}: ${height}`, radius && `${t(m.bpRadius)}: ${radius}`, t(m.bpIndeterminate40Sweep)]} />
    </svg>
  );
}

// Divider: a hairline rule with an optional centered label, drawn as the
// labelled separator - a rule on each side of a centered "or".
function DividerBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const thickness = fmt(size.thickness) ?? fmt(dimensions?.thickness);
  const gap = fmt(dimensions?.gap);
  const X = 64;
  const W = 272;
  const Y = 76;
  const cx = X + W / 2;
  const half = 15; // half the label box
  const g = 20; // schematic gap around the label
  const leftEnd = cx - half - g;
  const rightStart = cx + half + g;
  return (
    <svg viewBox="0 0 400 164" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheDivider)}>
      <Defs />
      {/* the two hairline rules with the label between them */}
      <line x1={X} y1={Y} x2={leftEnd} y2={Y} stroke={C.line} strokeWidth={1.5} />
      <line x1={rightStart} y1={Y} x2={X + W} y2={Y} stroke={C.line} strokeWidth={1.5} />
      <text x={cx} y={Y} textAnchor="middle" dominantBaseline="central" fill={C.text} stroke="none" style={{ fontFamily: 'var(--glacier-font-sans)', fontSize: 13, fontWeight: 600 }}>
        {t(m.bpOr)}
      </text>
      <text x={cx} y={Y - 22} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpLabel)}</text>
      <text x={X + 44} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpHairline)}</text>
      <HDim x1={X} x2={X + W} y={Y - 36} label={t(m.bpWidthAuto)} />
      {gap && <HDim x1={leftEnd} x2={cx - half} y={Y + 20} label={gap} above={false} />}
      <BpTitle />
      <Foot y={152} parts={[thickness && `${t(m.bpThickness)}: ${thickness}`, gap && `${t(m.bpGap)}: ${gap}`]} />
    </svg>
  );
}

function BarBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const BX = 70;
  const BW = 260;
  const BY = 66;
  const BH = 20;
  const thickness = fmt(size.thickness);
  const radius = fmt(size.radius) ?? fmt(dimensions?.radius);
  const gap = fmt(size.gap) ?? fmt(dimensions?.gap);
  const border = fmt(size.border) ?? fmt(dimensions?.border);
  const rr = radius === 'radius-full' || radius === '9999px' ? BH / 2 : radius ? 6 : 3;
  return (
    <svg viewBox="0 0 400 164" className="bpSvg" role="img" aria-label={`${t(m.bpBlueprintOfThe)} ${size.name} ${t(m.bpSize)}`}>
      <Defs />
      <rect x={BX} y={BY} width={BW} height={BH} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {thickness && <VDim x={BX - 22} y1={BY} y2={BY + BH} label={thickness} />}
      <HDim x1={BX} x2={BX + BW} y={BY - 24} label={t(m.bpWidthAuto)} />
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={392} y={BY - 10} textAnchor="end" className="bpLabel">
            {t(m.bpRadius)}: {radius}
          </text>
        </>
      )}
      <BpTitle />
      <text x={200} y={146} textAnchor="middle" className="bpLabel bpMuted">
        {[border && `${t(m.bpBorder)}: ${border}`, gap && `${t(m.bpGap)}: ${gap}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

// A slim content placeholder bar: a stand-in for a line of text or a control.
const Ln = ({ x, y, w, h = 6, op = 0.5 }: { x: number; y: number; w: number; h?: number; op?: number }) => (
  <rect x={x} y={y} width={w} height={h} rx={Math.min(h / 2, 3)} fill={C.content} fillOpacity={op} />
);

// A dashed schematic frame (the component box outline).
const Frame = ({ x, y, w, h, r = 10 }: { x: number; y: number; w: number; h: number; r?: number }) => (
  <rect x={x} y={y} width={w} height={h} rx={r} fill={C.fill} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
);

// Footnote rows of measure chips, centred at the bottom of a figure. Long
// chip sets wrap onto extra lines stacked above the baseline so they never
// run past the viewBox edges.
const Foot = ({ y = 212, x = 200, parts }: { y?: number; x?: number; parts: (string | undefined | false)[] }) => {
  const chips = parts.filter(Boolean) as string[];
  const separator = '   \u00b7   ';
  const maxWidth = 376;
  const charWidth = 6.6;
  const lines: string[] = [];
  let current = '';
  for (const chip of chips) {
    const candidate = current ? current + separator + chip : chip;
    if (current && candidate.length * charWidth > maxWidth) {
      lines.push(current);
      current = chip;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return (
    <g>
      {lines.map((line, i) => (
        <text key={i} x={x} y={y - (lines.length - 1 - i) * 15} textAnchor="middle" className="bpLabel bpMuted">
          {line}
        </text>
      ))}
    </g>
  );
};

// ---- Molecules ---------------------------------------------------------

// Field: label + required marker, the control, and the reserved meta line.
function FieldBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const gap = fmt(dimensions?.gap) ?? fmt(size.gap);
  const X = 104;
  const W = 192;
  const labelY = 50;
  const ctrlY = 70;
  const ctrlH = 40;
  const metaY = 126;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheField)}>
      <Defs />
      <Ln x={X} y={labelY} w={60} op={0.75} />
      <text x={X + 68} y={labelY + 8} fill="var(--glacier-danger-solid)" stroke="none" style={{ fontSize: 12, fontWeight: 700 }}>*</text>
      <Frame x={X} y={ctrlY} w={W} h={ctrlH} r={8} />
      <Ln x={X + 12} y={ctrlY + ctrlH / 2 - 3} w={104} op={0.5} />
      <Ln x={X} y={metaY} w={140} h={5} op={0.32} />
      <text x={X - 10} y={labelY + 8} textAnchor="end" className="bpLabel bpMuted">{t(m.bpLabel)}</text>
      <text x={X + W + 12} y={ctrlY + ctrlH / 2 + 3} className="bpLabel bpMuted">{t(m.bpControl)}</text>
      <text x={X - 10} y={metaY + 6} textAnchor="end" className="bpLabel bpMuted">{t(m.bpMeta)}</text>
      {gap && <VDim x={X + W + 30} y1={ctrlY + ctrlH} y2={metaY} label={gap} left={false} />}
      <BpTitle />
      <Foot parts={[t(m.bpLabel), t(m.bpControl), t(m.bpHintError)]} />
    </svg>
  );
}

// Select: the trigger (value + chevrons) with the portalled option menu below.
function SelectBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const optionRadius = fmt(dimensions?.optionRadius);
  const padIn = fmt(size.paddingInline);
  const border = fmt(dimensions?.border);
  const X = 118;
  const W = 200;
  const trigY = 44;
  const trigH = 34;
  const menuY = trigY + trigH + 12;
  const rowH = 22;
  const rows = 3;
  const pad = 8;
  const menuH = rows * pad * 0 + rows * rowH + pad * 2;
  return (
    <svg viewBox="0 0 400 234" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheSelect)}>
      <Defs />
      <Frame x={X} y={trigY} w={W} h={trigH} r={9} />
      <Ln x={X + 12} y={trigY + trigH / 2 - 3} w={88} op={0.55} />
      <path d={`M ${X + W - 20} ${trigY + 12} l 5 -5 l 5 5`} fill="none" stroke={C.line} strokeWidth={1.4} />
      <path d={`M ${X + W - 20} ${trigY + trigH - 12} l 5 5 l 5 -5`} fill="none" stroke={C.line} strokeWidth={1.4} />
      <Frame x={X} y={menuY} w={W} h={menuH} r={10} />
      {Array.from({ length: rows }, (_, i) => {
        const ry = menuY + pad + i * rowH;
        return (
          <g key={i}>
            {i === 0 && <rect x={X + 6} y={ry + 1} width={W - 12} height={rowH - 2} rx={5} fill={C.content} fillOpacity={0.24} />}
            {i === 0 && <path d={`M ${X + 12} ${ry + rowH / 2} l 4 4 l 7 -8`} fill="none" stroke={C.line} strokeWidth={1.6} />}
            <Ln x={X + 28} y={ry + rowH / 2 - 3} w={78} op={0.45} />
          </g>
        );
      })}
      <text x={X - 10} y={trigY + trigH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpTrigger)}</text>
      <text x={X + W + 12} y={menuY + menuH - 8} className="bpLabel bpMuted">{t(m.bpMenu)}</text>
      <text x={X + W + 12} y={menuY + pad + rowH / 2 + 3} className="bpLabel bpMuted">{t(m.bpOptionCheck)}</text>
      <BpTitle />
      <Foot y={224} parts={[radius && `${t(m.bpRadius)}: ${radius}`, optionRadius && `${t(m.bpOption)}: ${optionRadius}`, padIn && `${t(m.bpPad)}: ${padIn}`, border && `${t(m.bpBorder)}: ${border}`]} />
    </svg>
  );
}

// Combobox: the editable input with its caret and indicator, and the portaled
// listbox below it - an active option, an option with a supporting description,
// and the input-to-menu offset dimensioned from the spec's gap.
function ComboboxBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const optionRadius = fmt(dimensions?.optionRadius);
  const menuPadding = fmt(dimensions?.menuPadding);
  const gap = fmt(dimensions?.gap);
  const padIn = fmt(size.paddingInline);
  const border = fmt(dimensions?.border);
  const X = 104;
  const W = 200;
  const trigY = 42;
  const trigH = 34;
  const menuY = trigY + trigH + 20;
  const rowH = 26;
  const pad = 7;
  const menuH = 3 * rowH + pad * 2;
  return (
    <svg viewBox="0 0 400 250" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheCombobox)}>
      <Defs />

      {/* the editable input: typed query, a text caret, and the indicator chevron */}
      <Frame x={X} y={trigY} w={W} h={trigH} r={9} />
      <Ln x={X + 12} y={trigY + trigH / 2 - 3} w={56} op={0.7} />
      <line x1={X + 74} y1={trigY + 9} x2={X + 74} y2={trigY + trigH - 9} stroke={C.line} strokeWidth={1.4} />
      <path d={`M ${X + W - 22} ${trigY + 14} l 5 6 l 5 -6`} fill="none" stroke={C.line} strokeWidth={1.4} />

      {/* the input-to-menu offset, from the spec's gap */}
      {gap && <VDim x={X + W + 16} y1={trigY + trigH} y2={menuY} label={gap} left={false} />}

      {/* the portaled listbox */}
      <Frame x={X} y={menuY} w={W} h={menuH} r={10} />
      {Array.from({ length: 3 }, (_, i) => {
        const ry = menuY + pad + i * rowH;
        return (
          <g key={i}>
            {i === 0 && (
              <rect x={X + 6} y={ry + 1} width={W - 12} height={rowH - 2} rx={5} fill={C.content} fillOpacity={0.3} stroke={C.text} strokeWidth={1} />
            )}
            <Ln x={X + 14} y={ry + 6} w={i === 1 ? 64 : 78} op={i === 0 ? 0.7 : 0.45} />
            {i === 1 && <Ln x={X + 14} y={ry + 15} w={104} h={4} op={0.28} />}
          </g>
        );
      })}

      <text x={X - 10} y={trigY + trigH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpInput)}</text>
      <text x={X + W + 12} y={trigY + 20} className="bpLabel bpMuted">{t(m.bpIndicator)}</text>
      <text x={X - 10} y={menuY + pad + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpActive)}</text>
      <text x={X + W + 12} y={menuY + pad + rowH + rowH / 2 + 3} className="bpLabel bpMuted">{t(m.bpDescription)}</text>
      <text x={X - 10} y={menuY + pad + 2 * rowH + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpOption)}</text>
      <BpTitle />
      <Foot
        y={240}
        parts={[
          radius && `${t(m.bpRadius)}: ${radius}`,
          optionRadius && `${t(m.bpOption)}: ${optionRadius}`,
          menuPadding && `${t(m.bpMenuPad)}: ${menuPadding}`,
          padIn && `${t(m.bpPad)}: ${padIn}`,
          border && `${t(m.bpBorder)}: ${border}`,
        ]}
      />
    </svg>
  );
}

// MultiSelect: the control shell holding removable tags plus the editable
// input, and the listbox below with a checked selected row and the active row.
function MultiSelectBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const tagRadius = fmt(dimensions?.tagRadius);
  const optionRadius = fmt(dimensions?.optionRadius);
  const menuPadding = fmt(dimensions?.menuPadding);
  const gap = fmt(dimensions?.gap);
  const padIn = fmt(size.paddingInline);
  const border = fmt(dimensions?.border);
  const X = 104;
  const W = 200;
  const trigY = 40;
  const trigH = 36;
  const menuY = trigY + trigH + 20;
  const rowH = 24;
  const pad = 7;
  const menuH = 3 * rowH + pad * 2;
  const tagH = 20;
  const tagY = trigY + (trigH - tagH) / 2;
  // a removable tag: pill body, label line, and the x remove glyph
  const tag = (tx: number, tw: number) => (
    <g>
      <rect x={tx} y={tagY} width={tw} height={tagH} rx={tagH / 2} fill={C.content} fillOpacity={0.3} stroke={C.text} strokeWidth={1} />
      <Ln x={tx + 8} y={tagY + tagH / 2 - 2} w={tw - 30} h={4} op={0.7} />
      <path
        d={`M ${tx + tw - 14} ${tagY + tagH / 2 - 3} l 6 6 M ${tx + tw - 8} ${tagY + tagH / 2 - 3} l -6 6`}
        stroke={C.line}
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </g>
  );
  return (
    <svg viewBox="0 0 400 250" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheMultiSelect)}>
      <Defs />

      {/* the control shell: tags, then the editable input caret, then the chevron */}
      <Frame x={X} y={trigY} w={W} h={trigH} r={9} />
      {tag(X + 8, 52)}
      {tag(X + 64, 58)}
      <line x1={X + 132} y1={trigY + 10} x2={X + 132} y2={trigY + trigH - 10} stroke={C.line} strokeWidth={1.4} />
      <path d={`M ${X + W - 22} ${trigY + 15} l 5 6 l 5 -6`} fill="none" stroke={C.line} strokeWidth={1.4} />

      {/* the control-to-menu offset is layout; the spec gap spaces the tags */}
      <Frame x={X} y={menuY} w={W} h={menuH} r={10} />
      {Array.from({ length: 3 }, (_, i) => {
        const ry = menuY + pad + i * rowH;
        return (
          <g key={i}>
            {i === 1 && (
              <rect x={X + 6} y={ry + 1} width={W - 12} height={rowH - 2} rx={5} fill={C.content} fillOpacity={0.3} stroke={C.text} strokeWidth={1} />
            )}
            {i === 0 && <path d={`M ${X + 12} ${ry + rowH / 2} l 4 4 l 7 -8`} fill="none" stroke={C.line} strokeWidth={1.6} />}
            <Ln x={X + 28} y={ry + rowH / 2 - 3} w={i === 2 ? 64 : 78} op={i === 1 ? 0.7 : 0.45} />
          </g>
        );
      })}

      <text x={X - 10} y={tagY + tagH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpTagX)}</text>
      <text x={X + W + 12} y={trigY + 21} className="bpLabel bpMuted">{t(m.bpIndicator)}</text>
      <text x={X - 10} y={menuY + pad + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpSelectedCheck)}</text>
      <text x={X + W + 12} y={menuY + pad + rowH + rowH / 2 + 3} className="bpLabel bpMuted">{t(m.bpActive)}</text>
      <text x={X - 10} y={menuY + pad + 2 * rowH + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpOption)}</text>
      <BpTitle />
      <Foot
        y={240}
        parts={[
          radius && `${t(m.bpRadius)}: ${radius}`,
          tagRadius && `${t(m.bpTag)}: ${tagRadius}`,
          optionRadius && `${t(m.bpOption)}: ${optionRadius}`,
          gap && `${t(m.bpTagGap)}: ${gap}`,
          menuPadding && `${t(m.bpMenuPad)}: ${menuPadding}`,
          padIn && `${t(m.bpPad)}: ${padIn}`,
          border && `${t(m.bpBorder)}: ${border}`,
        ]}
      />
    </svg>
  );
}


// List: stacked card rows, each with a leading icon, title and description
// lines, and a trailing affordance, separated by the size's gap.
function ListBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const height = fmt(size.height);
  const padIn = fmt(size.paddingInline);
  const gap = fmt(size.gap) ?? fmt(dimensions?.gap);
  const radius = fmt(dimensions?.radius);
  const border = fmt(dimensions?.border);
  // Wide gutters, one annotation per slot: the left column holds the height
  // dimension (row 1) and the anatomy labels (rows 2-3); the right column holds
  // the selected label, the gap dimension with a flat label, and trailing.
  const X = 118;
  const W = 190;
  const rowH = 42;
  const g = 26;
  const rows = [58, 58 + rowH + g, 58 + 2 * (rowH + g)];
  const pIn = 14;
  const row = (y: number, active: boolean) => (
    <g>
      <Frame x={X} y={y} w={W} h={rowH} r={10} />
      {active && <rect x={X} y={y} width={W} height={rowH} rx={10} fill={C.content} fillOpacity={0.16} />}
      <rect x={X + pIn} y={y + rowH / 2 - 8} width={16} height={16} rx={4} fill="none" stroke={C.line} strokeWidth={1.25} strokeDasharray="2 2" />
      <circle cx={X + pIn + 8} cy={y + rowH / 2} r={2.5} fill={C.line} />
      <Ln x={X + pIn + 26} y={y + 11} w={82} op={0.7} />
      <Ln x={X + pIn + 26} y={y + 25} w={112} h={4} op={0.3} />
      <path d={`M ${X + W - 22} ${y + rowH / 2 - 5} l 5 5 l -5 5`} fill="none" stroke={C.line} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  return (
    <svg viewBox="0 0 400 282" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheList)}>
      <Defs />
      {row(rows[0]!, true)}
      {row(rows[1]!, false)}
      {row(rows[2]!, false)}

      <HDim x1={X} x2={X + W} y={rows[0]! - 20} label={t(m.bpWidthAuto)} />
      {height && <VDim x={X - 20} y1={rows[0]!} y2={rows[0]! + rowH} label={height} />}
      {gap && <VDim x={X + W + 16} y1={rows[0]! + rowH} y2={rows[1]!} label={gap} left={false} horizontal />}

      <text x={X + W + 12} y={rows[0]! + rowH / 2 + 3} className="bpLabel bpMuted">{t(m.bpSelected)}</text>
      <text x={X - 10} y={rows[1]! + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpLeading)}</text>
      <text x={X - 10} y={rows[2]! + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpTitleDesc)}</text>
      <text x={X + W + 12} y={rows[2]! + rowH / 2 + 3} className="bpLabel bpMuted">{t(m.bpTrailing)}</text>
      <BpTitle />
      <Foot y={274} parts={[padIn && `${t(m.bpPad)}: ${padIn}`, radius && `${t(m.bpRadius)}: ${radius}`, border && `${t(m.bpBorder)}: ${border}`]} />
    </svg>
  );
}


// SegmentedControl: a glass track of segments with a thumb under the selected one.
function SegmentedControlBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const padding = fmt(dimensions?.padding);
  const gap = fmt(dimensions?.gap);
  const N = 3;
  const segW = 84;
  const segH = 40;
  // Wide enough that the gap dimension's opposed arrowheads have room to render
  // (HDim needs >= 2x its 6px chevrons between the witness lines). The label
  // carries the real value; the figure is schematic.
  const g = 26;
  const totalW = N * segW + (N - 1) * g;
  const SX = (400 - totalW) / 2;
  const SY = 84;
  const pad = 6;
  const segX = (i: number) => SX + i * (segW + g);
  return (
    <svg viewBox="0 0 400 214" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheSegmentedControl)}>
      <Defs />
      <rect x={SX - pad} y={SY - pad} width={totalW + pad * 2} height={segH + pad * 2} rx={12} fill={C.fill} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      {/* the thumb under the first segment */}
      <rect x={segX(0)} y={SY} width={segW} height={segH} rx={9} fill={C.content} fillOpacity={0.3} stroke={C.text} strokeWidth={1} />
      {Array.from({ length: N }, (_, i) => (
        <Ln key={i} x={segX(i) + segW / 2 - 22} y={SY + segH / 2 - 3} w={44} op={i === 0 ? 0.7 : 0.4} />
      ))}
      <text x={segX(0) + segW / 2} y={SY - pad - 8} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpThumb)}</text>
      <text x={segX(1) + segW / 2} y={SY + segH + pad + 16} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpSegment)}</text>
      <HDim x1={SX - pad} x2={SX + totalW + pad} y={SY - pad - 20} label={t(m.bpWidthAuto)} />
      {gap && <HDim x1={segX(0) + segW} x2={segX(1)} y={SY + segH + 6} label={gap} above={false} />}
      <BpTitle />
      <Foot y={204} parts={[radius && `${t(m.bpRadius)}: ${radius}`, padding && `${t(m.bpPadding)}: ${padding}`]} />
    </svg>
  );
}

// Tabs: a tablist underlined by a hairline, the active indicator, and the panel.
function TabsBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const indicator = fmt(dimensions?.indicatorThickness);
  const radius = fmt(dimensions?.radius);
  const padBl = fmt(dimensions?.paddingBlock);
  const X = 70;
  const W = 260;
  const listY = 48;
  const tabW = 66;
  const gap = 10;
  const panelY = listY + 34;
  const panelH = 84;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheTabs)}>
      <Defs />
      {/* tablist labels */}
      {Array.from({ length: 3 }, (_, i) => (
        <Ln key={i} x={X + i * (tabW + gap) + 12} y={listY + 8} w={tabW - 24} op={i === 0 ? 0.75 : 0.4} />
      ))}
      {/* the list bottom hairline + the active indicator */}
      <line x1={X} y1={listY + 26} x2={X + W} y2={listY + 26} stroke={C.edge} strokeWidth={1} />
      <rect x={X} y={listY + 25} width={tabW} height={3} rx={1.5} fill={C.line} />
      {/* the panel */}
      <Frame x={X} y={panelY} w={W} h={panelH} r={10} />
      <Ln x={X + 16} y={panelY + 20} w={150} op={0.4} />
      <Ln x={X + 16} y={panelY + 38} w={200} h={5} op={0.3} />
      <Ln x={X + 16} y={panelY + 52} w={170} h={5} op={0.3} />
      <text x={X + tabW / 2} y={listY - 8} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpTab)}</text>
      <text x={X + W + 12} y={listY + 30} className="bpLabel bpMuted">{t(m.bpIndicator)}</text>
      <text x={X + W + 12} y={panelY + panelH / 2} className="bpLabel bpMuted">{t(m.bpPanel)}</text>
      <BpTitle />
      <Foot parts={[indicator && `${t(m.bpIndicator)}: ${indicator}`, radius && `${t(m.bpRadius)}: ${radius}`, padBl && `${t(m.bpPad)}: ${padBl}`]} />
    </svg>
  );
}

// Tooltip: a small glass bubble with a pointer, offset above its trigger.
function TooltipBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const offset = fmt(dimensions?.offset);
  const padIn = fmt(dimensions?.paddingInline);
  const bubbleX = 128;
  const bubbleY = 56;
  const bubbleW = 144;
  const bubbleH = 40;
  const trigY = bubbleY + bubbleH + 26;
  const cx = bubbleX + bubbleW / 2;
  return (
    <svg viewBox="0 0 400 214" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheTooltip)}>
      <Defs />
      {/* the bubble and its pointer as one outline, so the dashes trace around
          the tip the way the popover blueprint does */}
      <path
        d={`M ${bubbleX + 8} ${bubbleY} H ${bubbleX + bubbleW - 8} Q ${bubbleX + bubbleW} ${bubbleY} ${bubbleX + bubbleW} ${bubbleY + 8} V ${bubbleY + bubbleH - 8} Q ${bubbleX + bubbleW} ${bubbleY + bubbleH} ${bubbleX + bubbleW - 8} ${bubbleY + bubbleH} H ${cx + 7} L ${cx} ${bubbleY + bubbleH + 9} L ${cx - 7} ${bubbleY + bubbleH} H ${bubbleX + 8} Q ${bubbleX} ${bubbleY + bubbleH} ${bubbleX} ${bubbleY + bubbleH - 8} V ${bubbleY + 8} Q ${bubbleX} ${bubbleY} ${bubbleX + 8} ${bubbleY} Z`}
        fill={C.fill}
        stroke={C.edge}
        strokeWidth={1.5}
        strokeDasharray="5 3"
        strokeLinejoin="round"
      />
      <Ln x={bubbleX + 14} y={bubbleY + bubbleH / 2 - 3} w={bubbleW - 28} h={5} op={0.5} />
      {/* the trigger */}
      <rect x={cx - 34} y={trigY} width={68} height={26} rx={6} fill={C.content} fillOpacity={0.22} stroke={C.edge} strokeWidth={1.25} />
      <Ln x={cx - 20} y={trigY + 10} w={40} h={5} op={0.5} />
      <text x={bubbleX + bubbleW + 12} y={bubbleY + bubbleH / 2 + 3} className="bpLabel bpMuted">{t(m.bpBubble)}</text>
      <text x={cx + 42} y={trigY + 16} className="bpLabel bpMuted">{t(m.bpTrigger)}</text>
      {offset && <VDim x={bubbleX - 20} y1={bubbleY + bubbleH} y2={trigY} label={`${t(m.bpOffset)} ${offset}`} />}
      <BpTitle />
      <Foot y={204} parts={[radius && `${t(m.bpRadius)}: ${radius}`, padIn && `${t(m.bpPadInline)}: ${padIn}`, t(m.bpGlassBlur)]} />
    </svg>
  );
}

// Drawer: a modal sheet entering from a viewport edge, drawn in its floating
// form (the default under a floating app layout): a gutter keeps the card off
// every screen edge and all four corners round. The mini screen shows the
// dimmed overlay, the sheet's header, body, and footer regions, the slide-in
// direction, and the gutter and width dimensions for the selected size.
function DrawerBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const width = fmt(size.diameter);
  const radius = fmt(dimensions?.radius);
  const headerPad = fmt(dimensions?.headerPadding);
  const gutter = fmt(dimensions?.gutter);
  const SX = 24;
  const SY = 36;
  const SW = 352;
  const SH = 150;
  const G = 16; // schematic gutter; the label carries the real measure
  const PW = 122;
  const PX = SX + SW - G - PW;
  const PY = SY + G;
  const PH = SH - G * 2;
  const R = 14;
  const right = PX + PW;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheDrawer)}>
      <Defs />
      {/* the screen, with the overlay wash dimming the page behind the sheet */}
      <rect x={SX} y={SY} width={SW} height={SH} rx={10} fill={C.text} fillOpacity={0.06} stroke={C.edge} strokeWidth={1.25} strokeDasharray="3 3" />
      {/* the floating sheet: a gutter off every edge, all corners rounded */}
      <rect x={PX} y={PY} width={PW} height={PH} rx={R} fill={C.fill} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      {/* header: title, close, and the hairline under them */}
      <Ln x={PX + 16} y={PY + 12} w={58} op={0.75} />
      <g stroke={C.line} strokeWidth={1.3}>
        <line x1={right - 24} y1={PY + 11} x2={right - 16} y2={PY + 19} />
        <line x1={right - 24} y1={PY + 19} x2={right - 16} y2={PY + 11} />
      </g>
      <line x1={PX + 16} y1={PY + 31} x2={right - 16} y2={PY + 31} stroke={C.edge} strokeWidth={1} />
      {/* body lines */}
      <Ln x={PX + 16} y={PY + 42} w={PW - 32} h={5} op={0.3} />
      <Ln x={PX + 16} y={PY + 54} w={PW - 48} h={5} op={0.3} />
      <Ln x={PX + 16} y={PY + 66} w={PW - 40} h={5} op={0.3} />
      {/* footer: hairline and the action pair */}
      <line x1={PX + 16} y1={PY + PH - 32} x2={right - 16} y2={PY + PH - 32} stroke={C.edge} strokeWidth={1} />
      <rect x={right - 100} y={PY + PH - 24} width={38} height={16} rx={5} fill={C.content} fillOpacity={0.25} />
      <rect x={right - 54} y={PY + PH - 24} width={38} height={16} rx={5} fill={C.content} fillOpacity={0.5} />
      {/* slide-in direction, drawn outside the screen at the docked edge */}
      <g stroke={C.line} strokeWidth={1.25} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1={SX + SW + 18} y1={SY + SH - 36} x2={SX + SW + 2} y2={SY + SH - 36} />
        <polyline points={`${SX + SW + 8},${SY + SH - 40} ${SX + SW + 2},${SY + SH - 36} ${SX + SW + 8},${SY + SH - 32}`} />
      </g>
      {/* labels and dimensions */}
      <text x={SX + 8} y={SY + 15} className="bpLabel bpMuted">{t(m.bpOverlay)}</text>
      <text x={PX - 10} y={PY + 16} textAnchor="end" className="bpLabel bpMuted">{t(m.bpHeader)}</text>
      <text x={PX - 10} y={PY + 56} textAnchor="end" className="bpLabel bpMuted">{t(m.bpBody)}</text>
      <text x={PX - 10} y={PY + PH - 14} textAnchor="end" className="bpLabel bpMuted">{t(m.bpFooter)}</text>
      {width && <HDim x1={PX} x2={right} y={SY - 14} label={`${t(m.bpWidth)} ${width}`} />}
      {gutter && <HDim x1={right} x2={SX + SW} y={PY + 44} label={gutter} above={false} />}
      <BpTitle />
      <Foot parts={[radius && `${t(m.bpRadius)}: ${radius}`, headerPad && `${t(m.bpPad)}: ${headerPad}`, gutter && `${t(m.bpGutter)}: ${gutter}`]} />
    </svg>
  );
}

// Calendar: the month view drawn as a real month. A caption row with the two
// nav chevrons, the weekday header, and a 7x5 grid whose 30 numbered days
// start midweek, with the outside days dimmed, one day selected, and one
// ringed as today; the cell metric and paint come from the spec.
function CalendarBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const pad = fmt(dimensions?.padding);
  const dayCell = fmt(dimensions?.dayCell);
  const dayRadius = fmt(dimensions?.dayRadius);
  const CELL = 28;
  const GAP = 6;
  const COLS = 7;
  const GRID_W = COLS * CELL + (COLS - 1) * GAP;
  const GX = (400 - GRID_W) / 2;
  const CAPTION_Y = 58;
  const WEEK_Y = 80;
  const DAYS_Y = 92;
  const ROW_H = CELL + GAP;
  const START = 3; // the 1st lands on Wednesday, like a June
  const DAYS = 30;
  const SELECTED = 15;
  const TODAY = 22;
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const cells = Array.from({ length: 35 }, (_, i) => {
    const day = i - START + 1;
    const outside = day < 1 || day > DAYS;
    // outside days continue the neighbouring months: ...28 29 30 | 1..30 | 1 2
    return { day, outside, label: outside ? (day < 1 ? 30 + day : day - DAYS) : day };
  });
  const frameH = DAYS_Y + 5 * ROW_H + 14;
  return (
    <svg viewBox="0 0 400 314" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheCalendarMonthGrid)}>
      <Defs />
      {/* the panel */}
      <rect x={GX - 16} y={36} width={GRID_W + 32} height={frameH - 28} rx={12} fill={C.fill} fillOpacity={0.5} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      {/* caption and nav chevrons */}
      <g stroke={C.line} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={`${GX + 8},${CAPTION_Y - 4} ${GX + 3},${CAPTION_Y} ${GX + 8},${CAPTION_Y + 4}`} />
        <polyline points={`${GX + GRID_W - 8},${CAPTION_Y - 4} ${GX + GRID_W - 3},${CAPTION_Y} ${GX + GRID_W - 8},${CAPTION_Y + 4}`} />
      </g>
      <Ln x={200 - 34} y={CAPTION_Y - 3} w={68} op={0.7} />
      {/* weekday header */}
      {weekdays.map((wd, i) => (
        <text key={i} x={GX + i * (CELL + GAP) + CELL / 2} y={WEEK_Y} textAnchor="middle" className="bpLabel bpMuted" fontSize={10}>
          {wd}
        </text>
      ))}
      {/* the 35 day cells: 30 in-month days plus the dimmed neighbours */}
      {cells.map((cell, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = GX + col * (CELL + GAP);
        const y = DAYS_Y + row * ROW_H;
        const cx = x + CELL / 2;
        const cy = y + CELL / 2;
        const selected = cell.day === SELECTED;
        const today = cell.day === TODAY;
        return (
          <g key={i}>
            {selected ? (
              <circle cx={cx} cy={cy} r={CELL / 2} fill={C.line} />
            ) : today ? (
              <circle cx={cx} cy={cy} r={CELL / 2 - 0.75} fill="none" stroke={C.line} strokeWidth={1.25} strokeDasharray="3 2" />
            ) : null}
            <text
              x={cx}
              y={cy + 3.5}
              textAnchor="middle"
              className="bpLabel"
              fontSize={10}
              style={selected ? { fill: 'var(--glacier-accent-contrast)' } : undefined}
              opacity={selected ? 1 : cell.outside ? 0.28 : 0.75}
              stroke="none"
            >
              {cell.label}
            </text>
          </g>
        );
      })}
      {/* the cell metric, measured on the last row's first cell */}
      {dayCell && <HDim x1={GX} x2={GX + CELL} y={DAYS_Y + 5 * ROW_H + 6} label={dayCell} above={false} />}
      <BpTitle />
      <Foot y={306} parts={[radius && `${t(m.bpRadius)}: ${radius}`, pad && `${t(m.bpPad)}: ${pad}`, dayRadius && `${t(m.bpDayRadius)}: ${dayRadius}`]} />
    </svg>
  );
}

// DatePicker: the input-metric trigger with its calendar glyph, and the
// anchored panel below holding a miniature month; the numbered anatomy lives
// in the Calendar blueprint that follows it in the docs.
function DatePickerBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const panelPad = fmt(dimensions?.panelPadding);
  const TX = 96;
  const TW = 208;
  const TY = 30;
  const TH = 34;
  const PX = 96;
  const PW = 208;
  const PY = TY + TH + 18;
  const PH = 120;
  return (
    <svg viewBox="0 0 400 254" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheDatePicker)}>
      <Defs />
      {/* trigger: calendar glyph, value line, chevron */}
      <rect x={TX} y={TY} width={TW} height={TH} rx={10} fill={C.fill} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      <rect x={TX + 10} y={TY + 9} width={16} height={16} rx={3} fill="none" stroke={C.line} strokeWidth={1.1} />
      <line x1={TX + 10} y1={TY + 14} x2={TX + 26} y2={TY + 14} stroke={C.line} strokeWidth={1.1} />
      <Ln x={TX + 34} y={TY + TH / 2 - 3} w={96} op={0.6} />
      <g stroke={C.line} strokeWidth={1.25} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={`${TX + TW - 20},${TY + 15} ${TX + TW - 15},${TY + 20} ${TX + TW - 10},${TY + 15}`} />
      </g>
      {/* anchored panel with a miniature month */}
      <rect x={PX} y={PY} width={PW} height={PH} rx={10} fill={C.fill} fillOpacity={0.5} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      <Ln x={PX + PW / 2 - 26} y={PY + 10} w={52} op={0.6} />
      {Array.from({ length: 35 }, (_, i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        const cx = PX + 24 + col * 27;
        const cy = PY + 34 + row * 18;
        const selected = i === 17;
        return selected ? (
          <circle key={i} cx={cx} cy={cy} r={7} fill={C.line} />
        ) : (
          <circle key={i} cx={cx} cy={cy} r={2} fill={C.text} opacity={i < 3 || i > 32 ? 0.2 : 0.5} />
        );
      })}
      {/* labels and the trigger-to-panel offset */}
      <text x={TX - 10} y={TY + TH / 2 + 4} textAnchor="end" className="bpLabel bpMuted">{t(m.bpTrigger)}</text>
      <text x={PX - 10} y={PY + 16} textAnchor="end" className="bpLabel bpMuted">{t(m.bpPanel)}</text>
      <VDim x={PX + PW + 16} y1={TY + TH} y2={PY} label={t(m.bpOffset)} left={false} />
      <BpTitle />
      <Foot y={246} parts={[radius && `${t(m.bpRadius)}: ${radius}`, panelPad && `${t(m.bpPanelPad)}: ${panelPad}`]} />
    </svg>
  );
}

// Toast: a rounded-full pill with a leading icon, the message, and a dismiss.
function ToastBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const gap = fmt(dimensions?.gap);
  const padIn = fmt(dimensions?.paddingInline);
  const X = 70;
  const W = 260;
  const Y = 78;
  const H = 46;
  const rr = H / 2;
  // schematic insets kept wide enough that each dimension line has room for
  // its arrowheads; the two dims stack on separate rows so labels never touch
  const iconX = X + 30;
  const msgX = iconX + 30;
  const cyc = Y + H / 2;
  const dim1 = Y + H + 16;
  const dim2 = dim1 + 24;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheToast)}>
      <Defs />
      <rect x={X} y={Y} width={W} height={H} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      <circle cx={iconX} cy={cyc} r={9} fill={C.content} fillOpacity={0.4} stroke={C.line} strokeWidth={1} />
      <Ln x={msgX} y={cyc - 3} w={110} h={6} op={0.5} />
      {/* dismiss */}
      <g stroke={C.line} strokeWidth={1.4}>
        <line x1={X + W - 26} y1={cyc - 5} x2={X + W - 16} y2={cyc + 5} />
        <line x1={X + W - 26} y1={cyc + 5} x2={X + W - 16} y2={cyc - 5} />
      </g>
      <text x={iconX} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpIcon)}</text>
      <text x={msgX + 55} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpMessage)}</text>
      <text x={X + W - 21} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpDismiss)}</text>
      {/* padding, then the icon-to-message gap on its own row below */}
      {padIn && <HDim x1={X} x2={iconX - 9} y={dim1} label={padIn} above={false} />}
      {gap && <HDim x1={iconX + 9} x2={msgX} y={dim2} label={gap} above={false} />}
      <BpTitle />
      <Foot y={216} parts={[radius && `${t(m.bpRadius)}: ${radius}`]} />
    </svg>
  );
}


// ScrollArea: a capped viewport with edge fade masks and a thin scrollbar.
function ScrollAreaBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const fade = fmt(dimensions?.fade);
  const scrollbar = fmt(dimensions?.scrollbar);
  const X = 118;
  const W = 180;
  const Y = 44;
  const H = 128;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheScrollArea)}>
      <Defs />
      <Frame x={X} y={Y} w={W} h={H} r={10} />
      {/* content lines */}
      {Array.from({ length: 6 }, (_, i) => (
        <Ln key={i} x={X + 14} y={Y + 14 + i * 18} w={W - 52} h={6} op={0.4} />
      ))}
      {/* fade ramps top and bottom */}
      <rect x={X + 1} y={Y + 1} width={W - 2} height={18} fill="url(#bpFadeTop)" />
      <rect x={X + 1} y={Y + H - 19} width={W - 2} height={18} fill="url(#bpFadeBot)" />
      <defs>
        <linearGradient id="bpFadeTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--glacier-accent-soft)" stopOpacity={0.95} />
          <stop offset="1" stopColor="var(--glacier-accent-soft)" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="bpFadeBot" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--glacier-accent-soft)" stopOpacity={0.95} />
          <stop offset="1" stopColor="var(--glacier-accent-soft)" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* scrollbar */}
      <rect x={X + W - 8} y={Y + 10} width={4} height={54} rx={2} fill={C.line} fillOpacity={0.6} />
      <text x={X + W / 2} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpFade)}</text>
      <text x={X - 10} y={Y + H / 2} textAnchor="end" className="bpLabel bpMuted">{t(m.bpViewport)}</text>
      <text x={X + W + 12} y={Y + 40} className="bpLabel bpMuted">{t(m.bpScrollbar)}</text>
      {fade && <VDim x={X + W + 30} y1={Y} y2={Y + 18} label={fade} left={false} />}
      <BpTitle />
      <Foot parts={[fade && `${t(m.bpFade)}: ${fade}`, scrollbar && `${t(m.bpBar)}: ${scrollbar}`]} />
    </svg>
  );
}

// Carousel: a snap-scrolling track of items with prev/next edge controls.
function CarouselBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const gap = fmt(dimensions?.gap);
  const radius = fmt(dimensions?.radius);
  const X = 58;
  const W = 284;
  const Y = 70;
  const H = 74;
  const itemW = 78;
  const g = 12;
  return (
    <svg viewBox="0 0 400 214" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheCarousel)}>
      <Defs />
      {/* items */}
      {Array.from({ length: 3 }, (_, i) => (
        <rect key={i} x={X + i * (itemW + g)} y={Y} width={itemW} height={H} rx={8} fill={C.content} fillOpacity={0.24} stroke={C.edge} strokeWidth={1.25} strokeDasharray="4 3" />
      ))}
      {/* the fourth item, clipped, hinting the overflow */}
      <rect x={X + 3 * (itemW + g)} y={Y} width={itemW} height={H} rx={8} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1} strokeDasharray="4 3" />
      {/* prev / next controls */}
      {[{ cx: X + 14, d: 'm 3 -6 l -6 6 l 6 6' }, { cx: X + W - 14, d: 'm -3 -6 l 6 6 l -6 6' }].map((c, i) => (
        <g key={i}>
          <circle cx={c.cx} cy={Y + H / 2} r={13} fill={C.fill} stroke={C.edge} strokeWidth={1.5} />
          <path d={`M ${c.cx} ${Y + H / 2} ${c.d}`} fill="none" stroke={C.line} strokeWidth={1.6} />
        </g>
      ))}
      <text x={X + itemW / 2} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpItem)}</text>
      <text x={X + W - 14} y={Y + H + 18} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpControl)}</text>
      {gap && <HDim x1={X + itemW} x2={X + itemW + g} y={Y + H + 14} label={gap} above={false} />}
      <BpTitle />
      <Foot y={204} parts={[gap && `${t(m.bpGap)}: ${gap}`, radius && `${t(m.bpRadius)}: ${radius}`]} />
    </svg>
  );
}

// Heatmap: columns of level-shaded cells with a less-to-more legend.
function HeatmapBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const cell = fmt(dimensions?.cell);
  const gap = fmt(dimensions?.gap);
  const radius = fmt(dimensions?.radius);
  const cols = 10;
  const rowsN = 5;
  const cs = 18;
  const g = 4;
  const gridW = cols * cs + (cols - 1) * g;
  const X = (400 - gridW) / 2;
  const Y = 52;
  const levels = [0, 0.18, 0.34, 0.55, 0.8];
  return (
    <svg viewBox="0 0 400 214" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheHeatmap)}>
      <Defs />
      {Array.from({ length: cols }, (_, c) =>
        Array.from({ length: rowsN }, (_, r) => {
          const op = levels[(c + r) % levels.length] ?? 0.3;
          return (
            <rect key={`${c}-${r}`} x={X + c * (cs + g)} y={Y + r * (cs + g)} width={cs} height={cs} rx={3}
              fill={op === 0 ? C.fill : C.content} fillOpacity={op === 0 ? 1 : op} stroke={C.edge} strokeWidth={op === 0 ? 1 : 0} />
          );
        }),
      )}
      {/* legend */}
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={X + gridW - 5 * (cs * 0.7 + 3) + i * (cs * 0.7 + 3)} y={Y + rowsN * (cs + g) + 12} width={cs * 0.7} height={cs * 0.7} rx={2}
          fill={i === 0 ? C.fill : C.content} fillOpacity={i === 0 ? 1 : 0.2 + i * 0.18} stroke={i === 0 ? C.edge : 'none'} strokeWidth={1} />
      ))}
      <text x={X} y={Y + rowsN * (cs + g) + 12 + cs * 0.55} textAnchor="start" className="bpLabel bpMuted">{t(m.bpLess)}</text>
      <text x={X + gridW} y={Y + rowsN * (cs + g) + 12 + cs * 0.55} textAnchor="end" className="bpLabel bpMuted">{t(m.bpMore)}</text>
      <text x={X + cs / 2} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpCell)}</text>
      <text x={200} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpLegendArrow)}</text>
      <BpTitle />
      <Foot y={206} parts={[cell && `${t(m.bpCell)}: ${cell}`, gap && `${t(m.bpGap)}: ${gap}`, radius && `${t(m.bpRadius)}: ${radius}`]} />
    </svg>
  );
}

// Spotlight: a dimmed backdrop, a cutout ring on the target, and the callout.
function SpotlightBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const cutoutRadius = fmt(dimensions?.cutoutRadius);
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheSpotlight)}>
      <Defs />
      {/* backdrop */}
      <rect x={40} y={38} width={320} height={140} rx={10} fill={C.text} fillOpacity={0.08} stroke={C.edge} strokeWidth={1.25} strokeDasharray="3 3" />
      {/* the cutout ring on the target */}
      <rect x={70} y={80} width={70} height={56} rx={10} fill="none" stroke={C.line} strokeWidth={2} />
      <rect x={64} y={74} width={82} height={68} rx={14} fill="none" stroke={C.line} strokeWidth={1} strokeOpacity={0.5} strokeDasharray="3 3" />
      {/* the callout dialog */}
      <Frame x={188} y={64} w={150} h={96} r={12} />
      <Ln x={202} y={80} w={90} op={0.7} />
      <Ln x={202} y={98} w={118} h={5} op={0.35} />
      <Ln x={202} y={110} w={100} h={5} op={0.35} />
      {/* footer: the step count reads on the left, the controls sit on the
          right, mirroring the component's own footer row */}
      <text x={202} y={142} className="bpLabel bpMuted">2 / 4</text>
      <rect x={264} y={130} width={24} height={16} rx={5} fill={C.content} fillOpacity={0.18} stroke={C.edge} strokeWidth={1} />
      <rect x={294} y={130} width={30} height={16} rx={5} fill={C.content} fillOpacity={0.45} />
      <text x={105} y={72} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpCutout)}</text>
      <text x={263} y={56} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpCallout)}</text>
      <text x={52} y={52} className="bpLabel bpMuted">{t(m.bpBackdrop)}</text>
      <BpTitle />
      <Foot parts={[radius && `${t(m.bpRadius)}: ${radius}`, cutoutRadius && `${t(m.bpCutout)}: ${cutoutRadius}`]} />
    </svg>
  );
}

// ---- Organisms ---------------------------------------------------------

// Modal: a blurred overlay centering a glass panel with header, body, footer.
// Fieldset: shown in its bordered form so the anatomy reads - the legend chip
// floating on the border with the actions pinned to its line, the description
// under it, and the stacked fields one gap step apart.
function FieldsetBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const gap = fmt(dimensions?.gap);
  const padding = fmt(dimensions?.padding);
  const radius = fmt(dimensions?.radius);
  const border = fmt(dimensions?.border);
  const X = 96;
  const Y = 56;
  const W = 220;
  const H = 156;
  const fieldH = 30;
  const f1 = Y + 52;
  const f2 = f1 + fieldH + 22;
  const field = (y: number) => (
    <g>
      <Ln x={X + 18} y={y - 10} w={54} h={5} op={0.55} />
      <rect x={X + 18} y={y} width={W - 36} height={fieldH} rx={9} fill={C.content} fillOpacity={0.14} stroke={C.edge} strokeWidth={1.25} />
    </g>
  );
  return (
    <svg viewBox="0 0 400 248" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheFieldset)}>
      <Defs />
      {/* the bordered group; the legend chip sits on the border line */}
      <Frame x={X} y={Y} w={W} h={H} r={10} />
      <rect x={X + 14} y={Y - 9} width={62} height={18} rx={5} fill={C.fill} stroke={C.text} strokeWidth={1} />
      <Ln x={X + 22} y={Y - 3} w={46} h={6} op={0.75} />
      {/* actions pinned to the legend line, at the end */}
      <rect x={X + W - 62} y={Y - 9} width={48} height={18} rx={9} fill={C.content} fillOpacity={0.3} stroke={C.text} strokeWidth={1} />
      <Ln x={X + W - 52} y={Y - 3} w={28} h={5} op={0.6} />
      {/* description under the legend */}
      <Ln x={X + 18} y={Y + 14} w={128} h={4} op={0.3} />
      {/* two stacked fields with the gap dimensioned */}
      {field(f1)}
      {field(f2)}
      {gap && <VDim x={X + W + 16} y1={f1 + fieldH} y2={f2 - 15} label={gap} left={false} horizontal />}

      <text x={X - 10} y={Y - 2} textAnchor="end" className="bpLabel bpMuted">{t(m.bpLegend)}</text>
      <text x={X + W + 12} y={Y - 2} className="bpLabel bpMuted">{t(m.bpActions)}</text>
      <text x={X - 10} y={Y + 20} textAnchor="end" className="bpLabel bpMuted">{t(m.bpDescription)}</text>
      <text x={X - 10} y={f1 + fieldH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpContent)}</text>
      <BpTitle />
      <Foot y={240} parts={[padding && `${t(m.bpPadding)}: ${padding}`, radius && `${t(m.bpRadius)}: ${radius}`, border && `${t(m.bpBorder)}: ${border}`]} />
    </svg>
  );
}

// FormSection: the page-level grouping - a stacking divider above, the title
// row with actions at its end, the description, and the content region.
function FormSectionBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const headerGap = fmt(dimensions?.headerGap);
  const contentOffset = fmt(dimensions?.contentOffset);
  const dividerOffset = fmt(dimensions?.dividerOffset);
  const border = fmt(dimensions?.border);
  const X = 96;
  const W = 220;
  const divY = 52;
  const titleY = divY + 30;
  const contentY = titleY + 46;
  const contentH = 84;
  return (
    <svg viewBox="0 0 400 236" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheFormSection)}>
      <Defs />
      {/* the stacking divider above the section */}
      <line x1={X} y1={divY} x2={X + W} y2={divY} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      {/* title row with actions at the end */}
      <Ln x={X} y={titleY - 6} w={96} h={8} op={0.8} />
      <rect x={X + W - 56} y={titleY - 12} width={56} height={20} rx={10} fill={C.content} fillOpacity={0.3} stroke={C.text} strokeWidth={1} />
      <Ln x={X + W - 46} y={titleY - 5} w={36} h={5} op={0.6} />
      {/* description */}
      <Ln x={X} y={titleY + 14} w={150} h={4} op={0.3} />
      {/* content region, often holding Fieldsets */}
      <rect x={X} y={contentY} width={W} height={contentH} rx={10} fill={C.content} fillOpacity={0.12} stroke={C.text} strokeWidth={1} strokeDasharray="3 2" />
      <Ln x={X + 14} y={contentY + 16} w={W - 60} h={5} op={0.35} />
      <Ln x={X + 14} y={contentY + 32} w={W - 28} h={5} op={0.35} />
      <Ln x={X + 14} y={contentY + 48} w={W - 90} h={5} op={0.35} />
      {/* the divider offset and the header-to-content offset, dimensioned */}
      {dividerOffset && <VDim x={X + W + 16} y1={divY} y2={titleY - 12} label={dividerOffset} left={false} horizontal />}
      {contentOffset && <VDim x={X + W + 16} y1={titleY + 20} y2={contentY} label={contentOffset} left={false} horizontal />}

      <text x={X - 10} y={divY + 4} textAnchor="end" className="bpLabel bpMuted">{t(m.bpDivider)}</text>
      <text x={X - 10} y={titleY + 2} textAnchor="end" className="bpLabel bpMuted">{t(m.bpTitle)}</text>
      <text x={X - 10} y={titleY + 20} textAnchor="end" className="bpLabel bpMuted">{t(m.bpDescription)}</text>
      <text x={X - 10} y={contentY + contentH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpContent)}</text>
      <text x={X + W + 12} y={titleY + 2} className="bpLabel bpMuted">{t(m.bpActions)}</text>
      <BpTitle />
      <Foot y={228} parts={[headerGap && `${t(m.bpHeaderGap)}: ${headerGap}`, contentOffset && `${t(m.bpContentOffset)}: ${contentOffset}`, border && `${t(m.bpBorder)}: ${border}`]} />
    </svg>
  );
}


// Sidebar: a vertical navigation column - pinned header, section heading, item
// rows with the sliding active pill, and a pinned footer behind hairlines.
function SidebarBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const itemRadius = fmt(dimensions?.itemRadius);
  const regionPadding = fmt(dimensions?.regionPadding);
  const itemGap = fmt(dimensions?.itemGap);
  const border = fmt(dimensions?.border);
  const X = 134;
  const Y = 50;
  const W = 132;
  const H = 172;
  const rowH = 24;
  const rowX = X + 10;
  const rowW = W - 20;
  const r1 = Y + 46;
  const r2 = r1 + rowH + 6;
  const r3 = r2 + rowH + 6;
  const item = (y: number, active: boolean) => (
    <g>
      {active && <rect x={rowX} y={y} width={rowW} height={rowH} rx={7} fill={C.content} fillOpacity={0.3} stroke={C.text} strokeWidth={1} />}
      <rect x={rowX + 6} y={y + rowH / 2 - 6} width={12} height={12} rx={3} fill="none" stroke={C.line} strokeWidth={1.1} strokeDasharray="2 2" />
      <Ln x={rowX + 24} y={y + rowH / 2 - 3} w={active ? 56 : 48} h={5} op={active ? 0.7 : 0.4} />
    </g>
  );
  return (
    <svg viewBox="0 0 400 254" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheSidebar)}>
      <Defs />
      <Frame x={X} y={Y} w={W} h={H} r={12} />
      {/* pinned header with its hairline */}
      <Ln x={rowX} y={Y + 12} w={64} h={7} op={0.7} />
      <line x1={X} y1={Y + 30} x2={X + W} y2={Y + 30} stroke={C.edge} strokeWidth={1} />
      {/* section heading + items; the first row carries the active pill */}
      <Ln x={rowX} y={r1 - 10} w={38} h={4} op={0.3} />
      {item(r1, true)}
      {item(r2, false)}
      {item(r3, false)}
      {/* pinned footer behind its hairline */}
      <line x1={X} y1={Y + H - 28} x2={X + W} y2={Y + H - 28} stroke={C.edge} strokeWidth={1} />
      <circle cx={rowX + 8} cy={Y + H - 14} r={6} fill={C.content} fillOpacity={0.35} />
      <Ln x={rowX + 22} y={Y + H - 17} w={48} h={5} op={0.4} />

      {itemGap && <VDim x={X + W + 14} y1={r1 + rowH} y2={r2} label={itemGap} left={false} horizontal />}
      <text x={X - 10} y={Y + 18} textAnchor="end" className="bpLabel bpMuted">{t(m.bpHeader)}</text>
      <text x={X - 10} y={r1 - 8} textAnchor="end" className="bpLabel bpMuted">{t(m.bpSection)}</text>
      <text x={X - 10} y={r1 + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpIndicator)}</text>
      <text x={X + W + 12} y={r2 + rowH / 2 + 3} className="bpLabel bpMuted">{t(m.bpItem)}</text>
      <text x={X - 10} y={Y + H - 11} textAnchor="end" className="bpLabel bpMuted">{t(m.bpFooter)}</text>
      <BpTitle />
      <Foot y={246} parts={[regionPadding && `${t(m.bpRegionPad)}: ${regionPadding}`, itemRadius && `${t(m.bpItemRadius)}: ${itemRadius}`, border && `${t(m.bpBorder)}: ${border}`]} />
    </svg>
  );
}

// Toolbar: the horizontal action strip - a leading start slot, the growing
// middle, and end-aligned controls, with the slot gap dimensioned.
function ToolbarBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const padding = fmt(dimensions?.padding);
  const gap = fmt(dimensions?.gap);
  const X = 62;
  const Y = 86;
  const W = 276;
  const H = 44;
  const a1 = X + W - 10 - 30;
  const a2 = a1 - 18 - 26;
  return (
    <svg viewBox="0 0 400 200" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheToolbar)}>
      <Defs />
      <Frame x={X} y={Y} w={W} h={H} r={11} />
      {/* start: an icon control and a title */}
      <rect x={X + 10} y={Y + H / 2 - 9} width={18} height={18} rx={5} fill="none" stroke={C.line} strokeWidth={1.25} strokeDasharray="2 2" />
      <Ln x={X + 36} y={Y + H / 2 - 3} w={58} h={6} op={0.7} />
      {/* the growing middle */}
      <line x1={X + 108} y1={Y + H / 2} x2={a2 - 18} y2={Y + H / 2} stroke={C.edge} strokeWidth={1} strokeDasharray="2 4" />
      {/* end-aligned controls with the gap dimensioned */}
      <rect x={a2} y={Y + H / 2 - 10} width={26} height={20} rx={10} fill={C.content} fillOpacity={0.25} stroke={C.edge} strokeWidth={1.1} />
      <rect x={a1} y={Y + H / 2 - 10} width={30} height={20} rx={10} fill={C.content} fillOpacity={0.4} stroke={C.text} strokeWidth={1} />
      {gap && <HDim x1={a2 + 26} x2={a1} y={Y + H + 14} label={gap} above={false} />}

      <HDim x1={X} x2={X + W} y={Y - 18} label={t(m.bpWidthAuto)} />
      <text x={X - 10} y={Y + H / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpStart)}</text>
      <text x={(X + 108 + a2 - 18) / 2} y={Y + H / 2 - 8} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpContent)}</text>
      <text x={X + W + 12} y={Y + H / 2 + 3} className="bpLabel bpMuted">{t(m.bpEnd)}</text>
      <BpTitle />
      <Foot y={190} parts={[padding && `${t(m.bpPadding)}: ${padding}`, gap && `${t(m.bpGap)}: ${gap}`, t(m.bpSurfaceGlassThin)]} />
    </svg>
  );
}

// NavBar: the primary navigation row - icon-first items, the sliding active
// pill behind the current one, a badge on an item, and the end slot.
function NavBarBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const gap = fmt(dimensions?.gap);
  const padding = fmt(dimensions?.padding);
  const radius = fmt(dimensions?.radius);
  const itemSize = fmt(dimensions?.itemSize);
  const X = 66;
  const Y = 84;
  const W = 268;
  const H = 48;
  const itemW = 58;
  const itemH = 32;
  const iy = Y + (H - itemH) / 2;
  // the schematic item gap stays wide enough for the gap dimension arrowheads
  const ix = (i: number) => X + 8 + i * (itemW + 20);
  const item = (i: number, active: boolean) => (
    <g>
      {active && <rect x={ix(i)} y={iy} width={itemW} height={itemH} rx={8} fill={C.content} fillOpacity={0.3} stroke={C.text} strokeWidth={1} />}
      <rect x={ix(i) + 8} y={iy + itemH / 2 - 6} width={12} height={12} rx={3} fill="none" stroke={C.line} strokeWidth={1.1} strokeDasharray="2 2" />
      <Ln x={ix(i) + 26} y={iy + itemH / 2 - 2} w={24} h={4} op={active ? 0.7 : 0.4} />
    </g>
  );
  return (
    <svg viewBox="0 0 400 196" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheNavBar)}>
      <Defs />
      <Frame x={X} y={Y} w={W} h={H} r={12} />
      {item(0, true)}
      {item(1, false)}
      {item(2, false)}
      {/* a counter badge riding the third item */}
      <circle cx={ix(2) + itemW - 4} cy={iy + 2} r={6} fill={C.content} fillOpacity={0.55} stroke={C.text} strokeWidth={1} />
      {/* the end slot */}
      <circle cx={X + W - 20} cy={Y + H / 2} r={9} fill="none" stroke={C.edge} strokeWidth={1.25} strokeDasharray="2 2" />

      {gap && <HDim x1={ix(0) + itemW} x2={ix(1)} y={Y + H + 14} label={gap} above={false} />}
      <text x={X - 6} y={iy + itemH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpIndicator)}</text>
      <text x={ix(1) + itemW / 2} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpItem)}</text>
      <text x={ix(2) + itemW + 14} y={iy - 4} className="bpLabel bpMuted">{t(m.bpBadge)}</text>
      <text x={X + W + 12} y={Y + H / 2 + 3} className="bpLabel bpMuted">{t(m.bpEnd)}</text>
      <BpTitle />
      <Foot y={188} parts={[itemSize && `${t(m.bpItem)}: ${itemSize}`, padding && `${t(m.bpPad)}: ${padding}`, radius && `${t(m.bpRadius)}: ${radius}`]} />
    </svg>
  );
}


// AppShell: the app frame - a sticky sidebar column beside a scrollable main
// column with a header bar on top. The figure shows the desktop grid.
function AppShellBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const gutter = fmt(dimensions?.gutter);
  const radius = fmt(dimensions?.radius);
  const border = fmt(dimensions?.border);
  const X = 30;
  const Y = 66;
  const W = 340;
  const H = 146;
  const P = 12; // regions inset from the frame
  const G = 18; // gap between the regions, matching the app's own gutter feel
  const sideW = 88;
  const headerH = 30;
  const navH = 26;
  const sideX = X + P;
  const regionY = Y + P;
  const mainX = sideX + sideW + G;
  const mainW = X + W - P - mainX;
  const contentY = regionY + headerH + G;
  return (
    <svg viewBox="0 0 400 258" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheAppShell)}>
      <Defs />
      {/* the app frame */}
      <Frame x={X} y={Y} w={W} h={H} r={12} />
      {/* sidebar region with a few nav rows */}
      <rect x={sideX} y={regionY} width={sideW} height={H - P * 2} rx={8} fill={C.content} fillOpacity={0.2} stroke={C.text} strokeWidth={1} />
      <Ln x={sideX + 12} y={regionY + 12} w={sideW - 24} h={5} op={0.7} />
      <Ln x={sideX + 12} y={regionY + 28} w={sideW - 30} h={5} op={0.4} />
      <Ln x={sideX + 12} y={regionY + 42} w={sideW - 38} h={5} op={0.4} />
      {/* the same primary nav slot pins to the bottom of the desktop sidebar */}
      <rect x={sideX + 6} y={regionY + H - P * 2 - navH - 6} width={sideW - 12} height={navH} rx={6} fill={C.content} fillOpacity={0.3} stroke={C.text} strokeWidth={1} />
      {[0, 1, 2, 3].map((index) => (
        <circle key={index} cx={sideX + 14 + index * 20} cy={regionY + H - P * 2 - navH / 2 - 6} r={4} fill={index === 0 ? C.text : 'none'} stroke={C.text} strokeWidth={1} />
      ))}
      {/* header region */}
      <rect x={mainX} y={regionY} width={mainW} height={headerH} rx={6} fill={C.content} fillOpacity={0.28} stroke={C.text} strokeWidth={1} />
      {[0, 1, 2].map((index) => (
        <line key={index} x1={mainX + 10} y1={regionY + 10 + index * 4} x2={mainX + 20} y2={regionY + 10 + index * 4} stroke={C.text} strokeWidth={1.5} strokeLinecap="round" />
      ))}
      {/* main content rows */}
      <Ln x={mainX + 4} y={contentY} w={mainW - 40} h={5} op={0.3} />
      <Ln x={mainX + 4} y={contentY + 14} w={mainW - 16} h={5} op={0.3} />
      <Ln x={mainX + 4} y={contentY + 28} w={mainW - 64} h={5} op={0.3} />
      {/* sidebar width across the top, kept clear of the title */}
      <HDim x1={sideX} x2={sideX + sideW} y={Y - 16} label={t(m.bpSidebar16rem)} />
      {/* region labels */}
      <text x={mainX + mainW / 2} y={regionY + headerH / 2 + 4} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpHeader)}</text>
      <text x={sideX + sideW / 2} y={regionY + 66} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpSidebar)}</text>
      <text x={sideX + sideW / 2} y={Y + H + 12} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpBottomNav)}</text>
      <text x={mainX + mainW / 2} y={Y + H - 14} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpMain)}</text>
      <BpTitle />
      <Foot y={248} parts={[gutter && `${t(m.bpGutter)}: ${gutter}`, radius && `${t(m.bpRadius)}: ${radius}`, border && `${t(m.bpBorder)}: ${border}`]} />
    </svg>
  );
}

function AppShellMobileBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const gutter = fmt(dimensions?.gutter);
  const padding = fmt(dimensions?.padding);
  const radius = fmt(dimensions?.radius);
  const border = fmt(dimensions?.border);
  const X = 132;
  const Y = 42;
  const W = 136;
  const H = 178;
  const inset = 8;
  const headerH = 28;
  const navH = 34;
  const panelX = X + inset;
  const panelW = W - inset * 2;
  const headerY = Y + inset;
  const navY = Y + H - inset - navH;
  const drawerW = 92;
  const drawerX = X - drawerW - 18;
  return (
    <svg viewBox="0 0 400 258" className="bpSvg" role="img" aria-label={`${t(m.bpBlueprintOfTheAppShell)}: ${t(m.shellMobile)}`}>
      <Defs />
      <Frame x={X} y={Y} w={W} h={H} r={12} />
      {/* Floating mobile header with the sidebar toggle. */}
      <rect x={panelX} y={headerY} width={panelW} height={headerH} rx={8} fill={C.content} fillOpacity={0.28} stroke={C.text} strokeWidth={1} />
      {[0, 1, 2].map((index) => (
        <line key={index} x1={panelX + 10} y1={headerY + 9 + index * 4} x2={panelX + 20} y2={headerY + 9 + index * 4} stroke={C.text} strokeWidth={1.5} strokeLinecap="round" />
      ))}
      <Ln x={panelX + 32} y={headerY + 12} w={panelW - 46} h={4} op={0.45} />
      {/* Scrollable content between the two fixed chrome regions. */}
      <Ln x={panelX + 4} y={headerY + headerH + 20} w={panelW - 30} h={5} op={0.28} />
      <Ln x={panelX + 4} y={headerY + headerH + 34} w={panelW - 12} h={5} op={0.28} />
      <Ln x={panelX + 4} y={headerY + headerH + 48} w={panelW - 42} h={5} op={0.28} />
      {/* Persistent bottom navigation with four evenly-spaced destinations. */}
      <rect x={panelX} y={navY} width={panelW} height={navH} rx={10} fill={C.content} fillOpacity={0.3} stroke={C.text} strokeWidth={1} />
      {[0, 1, 2, 3].map((index) => (
        <circle key={index} cx={panelX + 17 + index * 29} cy={navY + navH / 2} r={4} fill={index === 0 ? C.text : 'none'} stroke={C.text} strokeWidth={1} />
      ))}
      {/* Dashed off-canvas drawer indicates what the header toggle reveals. */}
      <rect x={drawerX} y={Y + inset} width={drawerW} height={H - inset * 2} rx={10} fill={C.content} fillOpacity={0.08} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <line x1={drawerX + drawerW - 22} y1={Y + 20} x2={drawerX + drawerW - 12} y2={Y + 30} stroke={C.text} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={drawerX + drawerW - 12} y1={Y + 20} x2={drawerX + drawerW - 22} y2={Y + 30} stroke={C.text} strokeWidth={1.5} strokeLinecap="round" />
      <Ln x={drawerX + 12} y={Y + 28} w={drawerW - 24} h={5} op={0.45} />
      <Ln x={drawerX + 12} y={Y + 44} w={drawerW - 34} h={5} op={0.3} />
      <text x={drawerX + drawerW / 2} y={Y + H - 18} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpSidebar)}</text>
      <text x={panelX + 15} y={headerY - 5} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpMenu)}</text>
      <text x={X + W + 12} y={headerY + 18} className="bpLabel bpMuted">{t(m.bpHeader)}</text>
      <text x={X + W + 12} y={Y + H / 2} className="bpLabel bpMuted">{t(m.bpMain)}</text>
      <text x={X + W + 12} y={navY + 20} className="bpLabel bpMuted">{t(m.bpBottomNav)}</text>
      <BpTitle />
      <Foot y={248} parts={[gutter && `${t(m.bpGutter)}: ${gutter}`, padding && `${t(m.bpPad)}: ${padding}`, radius && `${t(m.bpRadius)}: ${radius}`, border && `${t(m.bpBorder)}: ${border}`]} />
    </svg>
  );
}

function ModalBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const panelPad = fmt(dimensions?.panelPadding);
  const diameter = fmt(size.diameter);
  const OX = 40;
  const OY = 38;
  const OW = 320;
  const OH = 150;
  const PW = 168;
  const PX = (400 - PW) / 2;
  const PY = 52;
  const PH = 120;
  const R = PX + PW;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheModal)}>
      <Defs />
      <rect x={OX} y={OY} width={OW} height={OH} rx={10} fill={C.text} fillOpacity={0.06} stroke={C.edge} strokeWidth={1.25} strokeDasharray="3 3" />
      <Frame x={PX} y={PY} w={PW} h={PH} r={14} />
      <g stroke={C.line} strokeWidth={1.3}>
        <line x1={R - 20} y1={PY + 12} x2={R - 12} y2={PY + 20} />
        <line x1={R - 20} y1={PY + 20} x2={R - 12} y2={PY + 12} />
      </g>
      <Ln x={PX + 16} y={PY + 15} w={92} op={0.75} />
      <Ln x={PX + 16} y={PY + 30} w={PW - 44} h={5} op={0.35} />
      <line x1={PX + 16} y1={PY + 46} x2={R - 16} y2={PY + 46} stroke={C.edge} strokeWidth={1} />
      <Ln x={PX + 16} y={PY + 58} w={PW - 32} h={5} op={0.3} />
      <Ln x={PX + 16} y={PY + 70} w={PW - 54} h={5} op={0.3} />
      <rect x={R - 96} y={PY + PH - 26} width={40} height={16} rx={5} fill={C.content} fillOpacity={0.25} />
      <rect x={R - 50} y={PY + PH - 26} width={40} height={16} rx={5} fill={C.content} fillOpacity={0.5} />
      <text x={OX + 8} y={OY + 15} className="bpLabel bpMuted">{t(m.bpOverlay)}</text>
      <text x={PX - 10} y={PY + PH / 2} textAnchor="end" className="bpLabel bpMuted">{t(m.bpPanel)}</text>
      <text x={R + 10} y={PY + 16} className="bpLabel bpMuted">{t(m.bpClose)}</text>
      <text x={R + 10} y={PY + 32} className="bpLabel bpMuted">{t(m.bpHeader)}</text>
      <text x={R + 10} y={PY + 64} className="bpLabel bpMuted">{t(m.bpBody)}</text>
      <text x={R + 10} y={PY + PH - 16} className="bpLabel bpMuted">{t(m.bpFooter)}</text>
      <BpTitle />
      <Foot parts={[diameter && `${t(m.bpWidth)}: ${diameter}`, radius && `${t(m.bpRadius)}: ${radius}`, panelPad && `${t(m.bpPadding)}: ${panelPad}`]} />
    </svg>
  );
}

// AlertDialog: the blurred overlay, the centered panel with title and
// consequence text, and the two actions that define the pattern - Cancel
// (ringed, focused first on open) and the confirming Action - with the
// footer gap dimensioned from the spec.
function AlertDialogBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const panelPad = fmt(dimensions?.panelPadding);
  const footerGap = fmt(dimensions?.footerGap);
  const border = fmt(dimensions?.border);
  const OX = 40;
  const OY = 36;
  const OW = 320;
  const OH = 156;
  const PW = 190;
  const PX = (400 - PW) / 2;
  const PY = 50;
  const PH = 128;
  const R = PX + PW;
  const BH = 24;
  const BY = PY + PH - BH - 14;
  const actionW = 64;
  const cancelW = 58;
  const gap = 20;
  const actionX = R - 16 - actionW;
  const cancelX = actionX - gap - cancelW;
  return (
    <svg viewBox="0 0 400 234" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheAlertDialog)}>
      <Defs />
      <rect x={OX} y={OY} width={OW} height={OH} rx={10} fill={C.text} fillOpacity={0.06} stroke={C.edge} strokeWidth={1.25} strokeDasharray="3 3" />
      <Frame x={PX} y={PY} w={PW} h={PH} r={14} />

      {/* title and the consequence description */}
      <Ln x={PX + 16} y={PY + 16} w={104} op={0.75} />
      <Ln x={PX + 16} y={PY + 32} w={PW - 44} h={5} op={0.35} />
      <Ln x={PX + 16} y={PY + 44} w={PW - 66} h={5} op={0.35} />

      {/* cancel (focused first, so it carries the ring) and the action */}
      <rect x={cancelX - 3} y={BY - 3} width={cancelW + 6} height={BH + 6} rx={8} fill="none" stroke={C.line} strokeWidth={1} strokeDasharray="2 2" />
      <rect x={cancelX} y={BY} width={cancelW} height={BH} rx={6} fill={C.content} fillOpacity={0.18} stroke={C.edge} strokeWidth={1.25} />
      <Ln x={cancelX + 12} y={BY + BH / 2 - 2} w={cancelW - 24} h={4} op={0.55} />
      <rect x={actionX} y={BY} width={actionW} height={BH} rx={6} fill={C.content} fillOpacity={0.5} stroke={C.text} strokeWidth={1} />
      <Ln x={actionX + 12} y={BY + BH / 2 - 2} w={actionW - 24} h={4} op={0.8} />
      {footerGap && <HDim x1={cancelX + cancelW} x2={actionX} y={BY + BH + 12} label={footerGap} above={false} />}

      <text x={OX + 8} y={OY + 15} className="bpLabel bpMuted">{t(m.bpOverlay)}</text>
      <text x={PX - 10} y={PY + 20} textAnchor="end" className="bpLabel bpMuted">{t(m.bpPanel)}</text>
      <text x={R + 10} y={PY + 20} className="bpLabel bpMuted">{t(m.bpTitle)}</text>
      <text x={R + 10} y={PY + 38} className="bpLabel bpMuted">{t(m.bpDescription)}</text>
      <text x={PX - 10} y={BY + BH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpCancel)}</text>
      <text x={R + 10} y={BY + BH / 2 + 3} className="bpLabel bpMuted">{t(m.bpAction)}</text>
      <BpTitle />
      <Foot y={226} parts={[radius && `${t(m.bpRadius)}: ${radius}`, panelPad && `${t(m.bpPanelPad)}: ${panelPad}`, footerGap && `${t(m.bpFooterGap)}: ${footerGap}`, border && `${t(m.bpBorder)}: ${border}`]} />
    </svg>
  );
}

// Popover: a trigger with an anchored, arrowed panel offset below it.
function PopoverBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const padding = fmt(dimensions?.padding);
  const offset = fmt(dimensions?.offset);
  const cx = 196;
  const trigY = 44;
  const trigW = 86;
  const trigH = 28;
  const panelY = trigY + trigH + 17;
  const panelW = 162;
  const panelH = 96;
  const panelX = cx - panelW / 2;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfThePopover)}>
      <Defs />
      <rect x={cx - trigW / 2} y={trigY} width={trigW} height={trigH} rx={6} fill={C.content} fillOpacity={0.22} stroke={C.edge} strokeWidth={1.25} />
      <Ln x={cx - 26} y={trigY + trigH / 2 - 3} w={52} h={5} op={0.5} />
      <path
        d={`M ${panelX + 10} ${panelY} H ${cx - 7} L ${cx} ${panelY - 9} L ${cx + 7} ${panelY} H ${panelX + panelW - 10} Q ${panelX + panelW} ${panelY} ${panelX + panelW} ${panelY + 10} V ${panelY + panelH - 10} Q ${panelX + panelW} ${panelY + panelH} ${panelX + panelW - 10} ${panelY + panelH} H ${panelX + 10} Q ${panelX} ${panelY + panelH} ${panelX} ${panelY + panelH - 10} V ${panelY + 10} Q ${panelX} ${panelY} ${panelX + 10} ${panelY} Z`}
        fill={C.fill}
        stroke={C.edge}
        strokeWidth={1.5}
        strokeDasharray="5 3"
        strokeLinejoin="round"
      />
      <Ln x={panelX + 14} y={panelY + 16} w={100} op={0.6} />
      <Ln x={panelX + 14} y={panelY + 34} w={panelW - 28} h={5} op={0.32} />
      <Ln x={panelX + 14} y={panelY + 46} w={panelW - 44} h={5} op={0.32} />
      <Ln x={panelX + 14} y={panelY + 58} w={panelW - 60} h={5} op={0.32} />
      <text x={cx + trigW / 2 + 12} y={trigY + trigH / 2 + 3} className="bpLabel bpMuted">{t(m.bpTrigger)}</text>
      <text x={panelX + panelW + 12} y={panelY + panelH / 2} className="bpLabel bpMuted">{t(m.bpContent)}</text>
      <text x={panelX - 10} y={panelY + 14} textAnchor="end" className="bpLabel bpMuted">{t(m.bpPanel)}</text>
      {offset && <VDim x={panelX - 24} y1={trigY + trigH} y2={panelY} label={`${t(m.bpOffset)} ${offset}`} horizontal />}
      <BpTitle />
      <Foot parts={[radius && `${t(m.bpRadius)}: ${radius}`, padding && `${t(m.bpPadding)}: ${padding}`]} />
    </svg>
  );
}

// Menu: a trigger with a portalled panel of items, a separator, and a label.
function MenuBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const gap = fmt(dimensions?.gap);
  const X = 130;
  const W = 176;
  const trigY = 40;
  const trigH = 26;
  const menuY = trigY + trigH + 12;
  const pad = 8;
  const rowH = 20;
  const rowY = (i: number) => menuY + pad + 12 + i * rowH;
  const menuH = pad * 2 + 12 + 4 * rowH - 4;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheMenu)}>
      <Defs />
      <rect x={X} y={trigY} width={W} height={trigH} rx={6} fill={C.content} fillOpacity={0.22} stroke={C.edge} strokeWidth={1.25} />
      <Ln x={X + 12} y={trigY + trigH / 2 - 3} w={70} h={5} op={0.5} />
      <Frame x={X} y={menuY} w={W} h={menuH} r={11} />
      {/* section label */}
      <Ln x={X + 12} y={menuY + pad + 2} w={44} h={5} op={0.3} />
      {/* items with icon + label + shortcut */}
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={X + 12} y={rowY(i) + 2} width={11} height={11} rx={3} fill={C.content} fillOpacity={0.45} />
          <Ln x={X + 30} y={rowY(i) + 4} w={70} h={5} op={0.5} />
          <Ln x={X + W - 34} y={rowY(i) + 4} w={20} h={5} op={0.3} />
        </g>
      ))}
      {/* separator */}
      <line x1={X + 10} y1={rowY(2) + 2} x2={X + W - 10} y2={rowY(2) + 2} stroke={C.edge} strokeWidth={1} />
      <g>
        <rect x={X + 12} y={rowY(3) - 2} width={11} height={11} rx={3} fill={C.content} fillOpacity={0.45} />
        <Ln x={X + 30} y={rowY(3)} w={82} h={5} op={0.5} />
      </g>
      <text x={X + W + 12} y={menuY + 14} className="bpLabel bpMuted">{t(m.bpMenu)}</text>
      <text x={X + W + 12} y={rowY(0) + 6} className="bpLabel bpMuted">{t(m.bpItem)}</text>
      <text x={X - 10} y={rowY(2) + 4} textAnchor="end" className="bpLabel bpMuted">{t(m.bpSeparator)}</text>
      <text x={X - 10} y={trigY + trigH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpTrigger)}</text>
      <BpTitle />
      <Foot parts={[radius && `${t(m.bpRadius)}: ${radius}`, gap && `${t(m.bpGap)}: ${gap}`, t(m.bpIconLabelShortcut)]} />
    </svg>
  );
}

// FloatingPanel: a draggable panel with a grab-bar handle, title, close, body.
function FloatingPanelBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const gap = fmt(dimensions?.gap);
  const X = 112;
  const W = 176;
  const Y = 44;
  const H = 126;
  const handleH = 30;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheFloatingPanel)}>
      <Defs />
      <Frame x={X} y={Y} w={W} h={H} r={11} />
      {/* handle bar */}
      <path d={`M ${X + 1} ${Y + handleH} L ${X + 1} ${Y + 11} A 10 10 0 0 1 ${X + 11} ${Y + 1} L ${X + W - 11} ${Y + 1} A 10 10 0 0 1 ${X + W - 1} ${Y + 11} L ${X + W - 1} ${Y + handleH} Z`} fill={C.content} fillOpacity={0.18} stroke="none" />
      <line x1={X} y1={Y + handleH} x2={X + W} y2={Y + handleH} stroke={C.edge} strokeWidth={1} />
      {/* grip dots */}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={X + 16 + i * 5} cy={Y + handleH / 2} r={1.4} fill={C.line} />
      ))}
      <Ln x={X + 34} y={Y + handleH / 2 - 3} w={70} op={0.6} />
      <g stroke={C.line} strokeWidth={1.3}>
        <line x1={X + W - 20} y1={Y + handleH / 2 - 4} x2={X + W - 12} y2={Y + handleH / 2 + 4} />
        <line x1={X + W - 20} y1={Y + handleH / 2 + 4} x2={X + W - 12} y2={Y + handleH / 2 - 4} />
      </g>
      {/* body */}
      <Ln x={X + 16} y={Y + handleH + 16} w={W - 32} h={5} op={0.3} />
      <Ln x={X + 16} y={Y + handleH + 30} w={W - 50} h={5} op={0.3} />
      <Ln x={X + 16} y={Y + handleH + 44} w={W - 40} h={5} op={0.3} />
      <text x={X - 10} y={Y + handleH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpHandle)}</text>
      <text x={X + W + 12} y={Y + handleH / 2 + 3} className="bpLabel bpMuted">{t(m.bpClose)}</text>
      <text x={X + W + 12} y={Y + handleH + 34} className="bpLabel bpMuted">{t(m.bpBody)}</text>
      <BpTitle />
      <Foot parts={[radius && `${t(m.bpRadius)}: ${radius}`, gap && `${t(m.bpGap)}: ${gap}`, t(m.bpDragTheHandleToMove)]} />
    </svg>
  );
}

// TabbedPanel: a bordered frame with a tab header (+ actions) and a body.
function TabbedPanelBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const bodyPad = fmt(dimensions?.bodyPadding);
  const border = fmt(dimensions?.border);
  const X = 64;
  const W = 272;
  const Y = 44;
  const H = 130;
  const headerH = 36;
  const tabW = 58;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheTabbedPanel)}>
      <Defs />
      <Frame x={X} y={Y} w={W} h={H} r={14} />
      {/* header row: tabs + actions */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {i === 0 && <rect x={X + 12 + i * (tabW + 6)} y={Y + 7} width={tabW} height={headerH - 14} rx={7} fill={C.content} fillOpacity={0.28} />}
          <Ln x={X + 12 + i * (tabW + 6) + 10} y={Y + headerH / 2 - 3} w={tabW - 28} op={i === 0 ? 0.7 : 0.4} />
        </g>
      ))}
      {/* a count badge on the first tab */}
      <circle cx={X + 12 + tabW - 8} cy={Y + headerH / 2} r={5} fill={C.content} fillOpacity={0.6} />
      {/* actions slot */}
      <rect x={X + W - 34} y={Y + 9} width={22} height={headerH - 18} rx={5} fill={C.content} fillOpacity={0.3} />
      <line x1={X} y1={Y + headerH} x2={X + W} y2={Y + headerH} stroke={C.edge} strokeWidth={1} />
      {/* body */}
      <Ln x={X + 18} y={Y + headerH + 18} w={W - 60} h={5} op={0.3} />
      <Ln x={X + 18} y={Y + headerH + 32} w={W - 36} h={5} op={0.3} />
      <Ln x={X + 18} y={Y + headerH + 46} w={W - 80} h={5} op={0.3} />
      <text x={X + 12 + (tabW + 6) + tabW / 2} y={Y - 8} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpTab)}</text>
      <text x={X + W - 23} y={Y - 8} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpActions)}</text>
      <text x={X + W + 12} y={Y + headerH + 34} className="bpLabel bpMuted">{t(m.bpBody)}</text>
      <text x={X - 10} y={Y + headerH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">{t(m.bpHeader)}</text>
      <BpTitle />
      <Foot parts={[radius && `${t(m.bpRadius)}: ${radius}`, bodyPad && `${t(m.bpBodyPad)}: ${bodyPad}`, border && `${t(m.bpBorder)}: ${border}`]} />
    </svg>
  );
}

// TabbedModal: a modal with a fixed left rail of sections and a scrolling pane.
function TabbedModalBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const gap = fmt(dimensions?.gap);
  const rail = fmt(dimensions?.rail);
  const X = 78;
  const W = 244;
  const Y = 40;
  const H = 150;
  const railW = 78;
  const itemH = 24;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheTabbedModal)}>
      <Defs />
      <Frame x={X} y={Y} w={W} h={H} r={16} />
      {/* rail */}
      <line x1={X + railW} y1={Y + 8} x2={X + railW} y2={Y + H - 8} stroke={C.edge} strokeWidth={1} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          {i === 1 && <rect x={X + 8} y={Y + 16 + i * itemH - 3} width={railW - 16} height={itemH - 4} rx={6} fill={C.content} fillOpacity={0.3} />}
          <rect x={X + 14} y={Y + 16 + i * itemH} width={10} height={10} rx={3} fill={C.content} fillOpacity={0.5} />
          <Ln x={X + 30} y={Y + 16 + i * itemH + 2} w={30} h={5} op={i === 1 ? 0.6 : 0.4} />
        </g>
      ))}
      {/* pane */}
      <Ln x={X + railW + 18} y={Y + 22} w={90} op={0.7} />
      <Ln x={X + railW + 18} y={Y + 42} w={W - railW - 40} h={5} op={0.3} />
      <Ln x={X + railW + 18} y={Y + 56} w={W - railW - 60} h={5} op={0.3} />
      <Ln x={X + railW + 18} y={Y + 70} w={W - railW - 48} h={5} op={0.3} />
      <text x={X - 10} y={Y + 20} textAnchor="end" className="bpLabel bpMuted">{t(m.bpRail)}</text>
      <text x={X + railW + (W - railW) / 2} y={Y - 8} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpPane)}</text>
      <text x={X - 10} y={Y + 16 + itemH + 8} textAnchor="end" className="bpLabel bpMuted">{t(m.bpRailItem)}</text>
      <BpTitle />
      <Foot parts={[radius && `${t(m.bpRadius)}: ${radius}`, gap && `${t(m.bpGap)}: ${gap}`, rail && `${t(m.bpRail)}: ${rail}`]} />
    </svg>
  );
}

// TabStrip: a scrollable row of closable tabs with a springing underline.
function TabStripBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const padIn = fmt(dimensions?.paddingInline);
  const gap = fmt(dimensions?.gap);
  const X = 50;
  const tabW = 96;
  const g = 6;
  const Y = 74;
  const H = 34;
  return (
    <svg viewBox="0 0 400 204" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheTabStrip)}>
      <Defs />
      {[0, 1, 2, 3].map((i) => {
        const tx = X + i * (tabW + g);
        const active = i === 0;
        return (
          <g key={i}>
            <rect x={tx} y={Y} width={tabW} height={H} rx={7} fill={active ? C.content : C.fill} fillOpacity={active ? 0.24 : 1} stroke={C.edge} strokeWidth={1.25} strokeDasharray={active ? undefined : '4 3'} />
            <rect x={tx + 12} y={Y + H / 2 - 5} width={10} height={10} rx={3} fill={C.content} fillOpacity={0.5} />
            <Ln x={tx + 28} y={Y + H / 2 - 3} w={36} h={5} op={active ? 0.7 : 0.4} />
            <g stroke={C.line} strokeWidth={1.2}>
              <line x1={tx + tabW - 20} y1={Y + H / 2 - 4} x2={tx + tabW - 12} y2={Y + H / 2 + 4} />
              <line x1={tx + tabW - 20} y1={Y + H / 2 + 4} x2={tx + tabW - 12} y2={Y + H / 2 - 4} />
            </g>
            {active && <rect x={tx + 6} y={Y + H + 2} width={tabW - 12} height={3} rx={1.5} fill={C.line} />}
          </g>
        );
      })}
      <text x={X + tabW / 2} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpTab)}</text>
      <text x={X + 17} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpIcon)}</text>
      <text x={X + tabW - 16} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpClose)}</text>
      <text x={X + tabW / 2} y={Y + H + 22} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpIndicator)}</text>
      {padIn && <HDim x1={X} x2={X + 16} y={Y + H + 30} label={padIn} above={false} />}
      <BpTitle />
      <Foot y={192} parts={[radius && `${t(m.bpRadius)}: ${radius}`, gap && `${t(m.bpGap)}: ${gap}`]} />
    </svg>
  );
}

// ResizableSplitPane: two panes divided by a draggable separator grip.
function ResizableSplitPaneBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const gripHeight = fmt(dimensions?.gripHeight);
  const thickness = fmt(dimensions?.thickness);
  const X = 62;
  const W = 276;
  const Y = 56;
  const H = 104;
  const divX = X + Math.round(W * 0.42);
  return (
    <svg viewBox="0 0 400 230" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheResizableSplitPane)}>
      <Defs />
      {/* start pane */}
      <rect x={X} y={Y} width={divX - X - 6} height={H} rx={10} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {/* end pane */}
      <rect x={divX + 6} y={Y} width={X + W - divX - 6} height={H} rx={10} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {/* divider + grip */}
      <line x1={divX} y1={Y} x2={divX} y2={Y + H} stroke={C.line} strokeWidth={1.5} />
      <rect x={divX - 2.5} y={Y + H / 2 - 16} width={5} height={32} rx={2.5} fill={C.line} />
      <text x={X + (divX - X) / 2} y={Y + H / 2 + 3} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpStart)}</text>
      <text x={divX + (X + W - divX) / 2} y={Y + H / 2 + 3} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpEnd)}</text>
      <text x={divX} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpDivider)}</text>
      <HDim x1={X} x2={divX} y={Y + H + 16} label={t(m.bpRatio)} above={false} />
      <BpTitle />
      <Foot y={222} parts={[radius && `${t(m.bpRadius)}: ${radius}`, gripHeight && `${t(m.bpGrip)}: ${gripHeight}`, thickness && `${t(m.bpDivider)}: ${thickness}`]} />
    </svg>
  );
}

/**
 * The shared defs plus the dot grid every blueprint sits on.
 *
 * The grid is drawn here, not per-figure, and reaches far outside any viewBox
 * on purpose. A figure taller than the usual 400x224 letterboxes when the
 * gallery fits it to a wider tile, and a grid sized to the viewBox would stop
 * at the drawing's edge and leave those bands bare. The SVG viewport clips the
 * overspill, so the paper always reaches the frame. The pattern is anchored to
 * the user-space origin rather than to this rect, so oversizing it does not
 * shift a single dot.
 */
function Defs() {
  return (
    <>
      <defs>
        <pattern id="bpGrid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx={1} cy={1} r={0.75} fill={C.grid} />
        </pattern>
      </defs>
      <rect x={-800} y={-800} width={2000} height={2000} fill="url(#bpGrid)" />
    </>
  );
}

// StatTile: a micro-card with a leading icon disc, a prominent value and trailing
// hint, and a muted label below.
function StatTileBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const padIn = fmt(dimensions?.paddingInline);
  const gap = fmt(dimensions?.gap);
  const X = 78;
  const Y = 60;
  const W = 244;
  const H = 92;
  const iconS = 44;
  const iconX = X + 22;
  const iconY = Y + (H - iconS) / 2;
  const colX = iconX + iconS + 20;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheStatTile)}>
      <Defs />
      <Frame x={X} y={Y} w={W} h={H} r={14} />
      <rect x={iconX} y={iconY} width={iconS} height={iconS} rx={9} fill={C.content} fillOpacity={0.28} stroke={C.text} strokeWidth={1} strokeDasharray="3 2" />
      <g transform={`translate(${iconX + iconS / 2 - 9} ${iconY + iconS / 2 - 9}) scale(${18 / 24})`} fill={C.line} stroke="none">
        <path d={PLACEHOLDER_ICON} />
      </g>
      <text x={colX} y={Y + 38} fill={C.text} stroke="none" style={{ fontFamily: 'var(--glacier-font-sans)', fontSize: 25, fontWeight: 700 }}>1,240</text>
      <rect x={colX + 96} y={Y + 20} width={40} height={18} rx={9} fill={C.content} fillOpacity={0.32} />
      <text x={colX + 116} y={Y + 30} textAnchor="middle" dominantBaseline="central" fill={C.text} stroke="none" style={{ fontFamily: 'var(--glacier-font-sans)', fontSize: 10, fontWeight: 600 }}>+12%</text>
      <Ln x={colX} y={Y + 56} w={96} h={7} op={0.4} />
      <text x={iconX + iconS / 2} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpIcon)}</text>
      <text x={colX + 24} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpValue)}</text>
      <text x={colX + 116} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpHint)}</text>
      <text x={colX} y={Y + H + 18} className="bpLabel bpMuted">{t(m.bpLabel)}</text>
      <HDim x1={X} x2={X + W} y={Y - 26} label={t(m.bpWidthAuto)} />
      <BpTitle />
      <Foot parts={[radius && `${t(m.bpRadius)}: ${radius}`, padIn && `${t(m.bpPadding)}: ${padIn}`, gap && `${t(m.bpGap)}: ${gap}`]} />
    </svg>
  );
}

// DeviceFrame: a phone bezel with an inset screen, a top notch, and side buttons.
function DeviceFrameBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const width = fmt(size.diameter);
  const radius = fmt(dimensions?.radius);
  const screenRadius = fmt(dimensions?.screenRadius);
  const bezel = fmt(dimensions?.bezel);
  const pw = 78;
  const ph = 150;
  const px = (400 - pw) / 2;
  const py = 30;
  const bz = 7;
  const sx = px + bz;
  const sy = py + bz;
  const sw = pw - bz * 2;
  const sh = ph - bz * 2;
  const notchW = sw * 0.44;
  const notchH = 7;
  const notchX = sx + (sw - notchW) / 2;
  const notchY = sy;
  const screenCorner = 12;
  return (
    <svg viewBox="0 0 400 250" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheDeviceFrame)}>
      <Defs />
      <rect x={px} y={py} width={pw} height={ph} rx={18} fill={C.fill} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      <path
        d={`M ${sx} ${sy + screenCorner} A ${screenCorner} ${screenCorner} 0 0 1 ${sx + screenCorner} ${sy} H ${notchX} V ${notchY + notchH - 2} a 2 2 0 0 1 2 2 H ${notchX + notchW - 2} a 2 2 0 0 1 2 -2 V ${notchY} H ${sx + sw - screenCorner} A ${screenCorner} ${screenCorner} 0 0 1 ${sx + sw} ${sy + screenCorner} V ${sy + sh - screenCorner} A ${screenCorner} ${screenCorner} 0 0 1 ${sx + sw - screenCorner} ${sy + sh} H ${sx + screenCorner} A ${screenCorner} ${screenCorner} 0 0 1 ${sx} ${sy + sh - screenCorner} Z`}
        fill={C.content}
        fillOpacity={0.2}
        stroke={C.text}
        strokeWidth={1}
        strokeDasharray="3 2"
      />
      <rect x={notchX + 4} y={notchY + 2} width={10} height={3} rx={1.5} fill={C.line} />
      <circle cx={notchX + notchW - 7} cy={notchY + notchH / 2} r={2} fill={C.line} />
      <rect x={px - 2.5} y={py + 34} width={2.5} height={14} rx={1.25} fill={C.edge} />
      <rect x={px - 2.5} y={py + 54} width={2.5} height={22} rx={1.25} fill={C.edge} />
      <rect x={px + pw} y={py + 46} width={2.5} height={28} rx={1.25} fill={C.edge} />
      <HDim x1={sx} x2={sx + sw} y={py - 14} label={width ? `${t(m.bpScreen)}: ${width}` : t(m.bpScreen)} />
      <text x={px + pw + 14} y={py + 18} className="bpLabel bpMuted">{t(m.bpBezel)}</text>
      <text x={sx + sw / 2} y={notchY + notchH + 16} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpNotch)}</text>
      <text x={px - 12} y={py + 46} textAnchor="end" className="bpLabel bpMuted">{t(m.bpButtons)}</text>
      <text x={px + pw + 14} y={py + ph / 2 + 24} className="bpLabel bpMuted">{t(m.bpScreen)}</text>
      <BpTitle />
      <Foot y={244} parts={[radius && `${t(m.bpRadius)}: ${radius}`, screenRadius && `${t(m.bpScreen)}: ${screenRadius}`, bezel && `${t(m.bpBezel)}: ${bezel}`]} />
    </svg>
  );
}

// FilterChip: a toggle pill shown selected (accent tint) with a leading icon, a
// label, and a trailing count badge.
function FilterChipBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const height = fmt(size.height);
  const padIn = fmt(size.paddingInline);
  const radius = fmt(dimensions?.radius);
  const border = fmt(dimensions?.border);
  const CW = 176;
  const CH = 46;
  const CX = (400 - CW) / 2;
  const CY = 86;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheFilterChip)}>
      <Defs />
      <rect x={CX} y={CY} width={CW} height={CH} rx={CH / 2} fill="var(--glacier-accent-soft)" stroke="var(--glacier-accent-border)" strokeWidth={1.5} />
      <g transform={`translate(${CX + 20} ${CY + CH / 2 - 8}) scale(${16 / 24})`} fill={C.line} stroke="none">
        <path d={PLACEHOLDER_ICON} />
      </g>
      <Ln x={CX + 44} y={CY + CH / 2 - 3.5} w={64} h={7} op={0.6} />
      <circle cx={CX + CW - 26} cy={CY + CH / 2} r={13} fill={C.content} fillOpacity={0.42} stroke={C.text} strokeWidth={1} />
      <text x={CX + CW - 26} y={CY + CH / 2} textAnchor="middle" dominantBaseline="central" fill={C.text} stroke="none" style={{ fontFamily: 'var(--glacier-font-sans)', fontSize: 11, fontWeight: 600 }}>3</text>
      <text x={CX + 20} y={CY - 12} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpIcon)}</text>
      <text x={CX + 76} y={CY - 12} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpLabel)}</text>
      <text x={CX + CW - 26} y={CY - 12} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpCount)}</text>
      <text x={CX + CW / 2} y={CY + CH + 20} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpSelected)}</text>
      <HDim x1={CX} x2={CX + CW} y={CY - 30} label={t(m.bpWidthAuto)} />
      {height && <VDim x={CX - 22} y1={CY} y2={CY + CH} label={height} />}
      <BpTitle />
      <Foot parts={[radius && `${t(m.bpRadius)}: ${radius}`, padIn && `${t(m.bpPadding)}: ${padIn}`, border && `${t(m.bpBorder)}: ${border}`]} />
    </svg>
  );
}

// Image: a fixed aspect-ratio frame that clips and rounds an image, with a
// fallback shown on error.
function ImageBlueprint({ size }: BlueprintProps) {
  const t = useT();
  const X = 134;
  const Y = 42;
  const W = 132;
  const H = 126;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheImage)}>
      <Defs />
      <rect x={X} y={Y} width={W} height={H} rx={12} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      <circle cx={X + 34} cy={Y + 38} r={11} fill="none" stroke={C.line} strokeWidth={2} />
      <path
        d={`M ${X + 10} ${Y + H - 16} L ${X + W * 0.38} ${Y + H * 0.46} L ${X + W * 0.6} ${Y + H - 34} L ${X + W * 0.78} ${Y + H * 0.52} L ${X + W - 10} ${Y + H - 16}`}
        fill="none"
        stroke={C.line}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <text x={X + W / 2} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpFrame)}</text>
      <text x={X + W + 14} y={Y + H / 2 - 6} className="bpLabel bpMuted">{t(m.bpImage)}</text>
      <text x={X - 14} y={Y + H / 2 + 8} textAnchor="end" className="bpLabel bpMuted">{t(m.bpFallback)}</text>
      <BpTitle />
      <Foot parts={[t(m.bpRadiusMd), t(m.bpFitCover), t(m.bpAspectAuto)]} />
    </svg>
  );
}

// Breadcrumbs: a short chain of linked steps separated by a slash.
function BreadcrumbsBlueprint({ size }: BlueprintProps) {
  const t = useT();
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheBreadcrumbs)}>
      <Defs />
      <rect x={60} y={78} width={304} height={56} rx={12} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <text x={94} y={110} className="bpLabel" fill={C.text}>{t(m.bpHome)}</text>
      <text x={164} y={110} className="bpLabel" fill={C.text}>/</text>
      <text x={196} y={110} className="bpLabel" fill={C.text}>{t(m.bpDocs)}</text>
      <text x={248} y={110} className="bpLabel" fill={C.text}>/</text>
      <text x={278} y={110} className="bpLabel" fill={C.text}>{t(m.bpComponents)}</text>
      <BpTitle />
      <Foot parts={[t(m.bpSeparatorSlash)]} />
    </svg>
  );
}

// Pagination: a previous/next pair around a compact set of page-number buttons.
function PaginationBlueprint({ size }: BlueprintProps) {
  const t = useT();
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfThePagination)}>
      <Defs />
      <rect x={70} y={88} width={72} height={34} rx={17} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <rect x={156} y={88} width={34} height={34} rx={17} fill={C.content} fillOpacity={0.32} stroke={C.edge} strokeWidth={1.25} />
      <rect x={204} y={88} width={34} height={34} rx={17} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <rect x={252} y={88} width={34} height={34} rx={17} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <rect x={300} y={88} width={76} height={34} rx={17} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <text x={106} y={105} textAnchor="middle" dominantBaseline="middle" className="bpLabel" fill={C.text}>{t(m.bpPrev)}</text>
      <text x={173} y={105} textAnchor="middle" dominantBaseline="middle" className="bpLabel" fill={C.text}>2</text>
      <text x={221} y={105} textAnchor="middle" dominantBaseline="middle" className="bpLabel" fill={C.text}>3</text>
      <text x={269} y={105} textAnchor="middle" dominantBaseline="middle" className="bpLabel" fill={C.text}>4</text>
      <text x={338} y={105} textAnchor="middle" dominantBaseline="middle" className="bpLabel" fill={C.text}>{t(m.bpNext)}</text>
      <BpTitle />
      <Foot parts={[t(m.bpPage2), t(m.bpTotal20)]} />
    </svg>
  );
}

// Accordion: a row of disclosure headers and one open panel body.
function AccordionBlueprint({ size }: BlueprintProps) {
  const t = useT();
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheAccordion)}>
      <Defs />
      <rect x={72} y={56} width={256} height={42} rx={12} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <rect x={72} y={108} width={256} height={72} rx={12} fill={C.content} fillOpacity={0.1} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <text x={102} y={82} className="bpLabel" fill={C.text}>{t(m.bpSectionOne)}</text>
      <text x={102} y={140} className="bpLabel" fill={C.text}>{t(m.bpDetails)}</text>
      <BpTitle />
      <Foot parts={[t(m.bpOpenOne), t(m.bpCollapsedRest)]} />
    </svg>
  );
}

// Table: a semantic grid with a header row and two body rows.
function TableBlueprint({ size }: BlueprintProps) {
  const t = useT();
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheTable)}>
      <Defs />
      <rect x={56} y={54} width={288} height={112} rx={10} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <line x1={56} y1={90} x2={344} y2={90} stroke={C.line} strokeWidth={1.25} />
      <line x1={56} y1={122} x2={344} y2={122} stroke={C.line} strokeWidth={1.25} />
      <line x1={56} y1={154} x2={344} y2={154} stroke={C.line} strokeWidth={1.25} />
      <text x={92} y={76} className="bpLabel" fill={C.text}>{t(m.bpName)}</text>
      <text x={232} y={76} className="bpLabel" fill={C.text}>{t(m.bpStatus)}</text>
      <text x={92} y={108} className="bpLabel" fill={C.text}>{t(m.bpAda)}</text>
      <text x={232} y={108} className="bpLabel" fill={C.text}>{t(m.bpActiveCell)}</text>
      <text x={92} y={140} className="bpLabel" fill={C.text}>{t(m.bpGrace)}</text>
      <text x={232} y={140} className="bpLabel" fill={C.text}>{t(m.bpPaused)}</text>
      <BpTitle />
      <Foot parts={[t(m.bpHeaders), t(m.bpRows)]} />
    </svg>
  );
}

// Data grid: like the table, plus a leading selection column of checkboxes and
// a sortable header carrying a direction caret.
function DataGridBlueprint(_: BlueprintProps) {
  const t = useT();
  const rows = [108, 140];
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheDataGrid)}>
      <Defs />
      <rect x={40} y={54} width={320} height={112} rx={10} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {/* selection column divider and header/row separators */}
      <line x1={80} y1={54} x2={80} y2={166} stroke={C.line} strokeWidth={1.25} />
      <line x1={40} y1={90} x2={360} y2={90} stroke={C.line} strokeWidth={1.25} />
      <line x1={40} y1={122} x2={360} y2={122} stroke={C.line} strokeWidth={1.25} />
      <line x1={40} y1={154} x2={360} y2={154} stroke={C.line} strokeWidth={1.25} />
      {/* select-all + row checkboxes */}
      <rect x={54} y={65} width={12} height={12} rx={3} fill={C.content} fillOpacity={0.5} stroke={C.edge} strokeWidth={1.25} />
      {rows.map((y) => (
        <rect key={y} x={54} y={y - 10} width={12} height={12} rx={3} fill="none" stroke={C.edge} strokeWidth={1.25} />
      ))}
      {/* sortable header with a direction caret */}
      <text x={100} y={76} className="bpLabel" fill={C.text}>{t(m.bpName)}</text>
      <path d="M150 70 l4 4 l4 -4" fill="none" stroke={C.text} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <text x={240} y={76} className="bpLabel" fill={C.text}>{t(m.bpStatus)}</text>
      <text x={100} y={108} className="bpLabel" fill={C.text}>{t(m.bpAda)}</text>
      <text x={240} y={108} className="bpLabel" fill={C.text}>{t(m.bpActiveCell)}</text>
      <text x={100} y={140} className="bpLabel" fill={C.text}>{t(m.bpGrace)}</text>
      <text x={240} y={140} className="bpLabel" fill={C.text}>{t(m.bpPaused)}</text>
      <BpTitle />
      <Foot parts={[t(m.bpSelect), t(m.bpSortableHeader), t(m.bpRows)]} />
    </svg>
  );
}

// Page header: breadcrumbs above a title block (title, description, meta pills)
// with the actions cluster and overflow trigger end-aligned.
function PageHeaderBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const padBlock = fmt(dimensions?.paddingBlock);
  const gap = fmt(dimensions?.sectionGap);
  return (
    <svg viewBox="0 0 400 220" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfThePageHeader)}>
      <Defs />
      <rect x={28} y={44} width={344} height={140} rx={10} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {/* padding-block from the region edge down to the first content */}
      <VDim x={38} y1={44} y2={58} label={padBlock ? `${t(m.bpPad)}: ${padBlock}` : t(m.bpPaddingBlock)} left={false} horizontal />
      {/* breadcrumbs */}
      <text x={46} y={72} className="bpLabel" fill={C.faint}>{t(m.bpLibraryCourses)}</text>
      {/* title + description + meta */}
      <text x={46} y={100} fill={C.text} fontSize={15} fontWeight={650}>{t(m.bpPageTitle)}</text>
      <rect x={46} y={110} width={168} height={6} rx={3} fill={C.content} fillOpacity={0.55} />
      <rect x={46} y={132} width={44} height={13} rx={6.5} fill="none" stroke={C.edge} strokeWidth={1.25} />
      <rect x={96} y={132} width={34} height={13} rx={6.5} fill="none" stroke={C.edge} strokeWidth={1.25} />
      {/* stack gap between the description and the meta row */}
      <VDim x={228} y1={116} y2={132} label={gap ? `${t(m.bpGap)}: ${gap}` : t(m.bpGap)} left={false} horizontal />
      {/* actions cluster + overflow trigger */}
      <rect x={232} y={56} width={50} height={22} rx={6} fill="none" stroke={C.edge} strokeWidth={1.25} />
      <rect x={288} y={56} width={50} height={22} rx={6} fill={C.content} fillOpacity={0.5} stroke={C.edge} strokeWidth={1.25} />
      <rect x={344} y={56} width={22} height={22} rx={6} fill="none" stroke={C.edge} strokeWidth={1.25} strokeDasharray="3 2" />
      <circle cx={351} cy={67} r={1.1} fill={C.text} />
      <circle cx={355} cy={67} r={1.1} fill={C.text} />
      <circle cx={359} cy={67} r={1.1} fill={C.text} />
      <BpTitle />
      <Foot parts={[t(m.bpBreadcrumbs), t(m.bpTitleDescription), t(m.bpMeta), t(m.bpActions), t(m.bpOverflow)]} />
    </svg>
  );
}

// Section: a heading row with an end-aligned action, a description line, then
// the content region a token gap below; a hairline divider tops stacked sections.
function SectionBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const gap = fmt(dimensions?.gapMd);
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheSection)}>
      <Defs />
      <line x1={36} y1={44} x2={364} y2={44} stroke={C.line} strokeWidth={1.25} strokeDasharray="5 3" />
      <text x={370} y={40} textAnchor="end" className="bpLabel" fill={C.faint}>{t(m.bpDivider)}</text>
      {/* heading row */}
      <text x={44} y={72} fill={C.text} fontSize={14} fontWeight={650}>{t(m.bpSectionTitle)}</text>
      <rect x={300} y={58} width={56} height={20} rx={6} fill="none" stroke={C.edge} strokeWidth={1.25} />
      <rect x={44} y={82} width={150} height={6} rx={3} fill={C.content} fillOpacity={0.55} />
      {/* gap dimension into the content region */}
      <VDim x={36} y1={92} y2={116} label={gap ? `${t(m.bpGap)}: ${gap}` : t(m.bpGap)} />
      <rect x={44} y={116} width={312} height={54} rx={8} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <text x={200} y={147} textAnchor="middle" className="bpLabel" fill={C.faint}>{t(m.bpContent)}</text>
      <BpTitle />
      <Foot y={216} parts={[t(m.bpAriaLabelledbyWiresTheHeading), t(m.bpHeaderRow), t(m.bpContent)]} />
    </svg>
  );
}

// Card group: an auto-fill grid of card slots that wrap at the minimum item
// width, with the min-width and gap called out.
function CardGroupBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const gap = fmt(dimensions?.gapMd);
  const cols = [40, 152, 264];
  const rows = [54, 122];
  return (
    <svg viewBox="0 0 400 226" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheCardGroup)}>
      <Defs />
      {rows.map((y) =>
        cols.map((x) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={96} height={52} rx={8} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
            <rect x={x + 10} y={y + 12} width={44} height={6} rx={3} fill={C.content} fillOpacity={0.55} />
            <rect x={x + 10} y={y + 26} width={64} height={5} rx={2.5} fill={C.content} fillOpacity={0.35} />
          </g>
        )),
      )}
      <HDim x1={40} x2={136} y={190} label={t(m.bpMinItem16rem)} />
      <VDim x={372} y1={106} y2={122} label={gap ?? t(m.bpGap)} horizontal />
      <BpTitle />
      <Foot y={220} parts={[t(m.bpGridRepeatAutoFillMinmaxMinItem1fr), t(m.bpListOneColumn)]} />
    </svg>
  );
}

// Timeline: tone-colored markers on a shared connector rail, each event's
// content block beside it; the last marker ends the rail.
function TimelineBlueprint(_: BlueprintProps) {
  const t = useT();
  const items = [
    { y: 64, filled: true, icon: true },
    { y: 118, filled: true, icon: false },
    { y: 172, filled: false, icon: false },
  ];
  return (
    <svg viewBox="0 0 400 230" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheTimeline)}>
      <Defs />
      {/* connector segments stop above the last marker */}
      <line x1={56} y1={72} x2={56} y2={110} stroke={C.line} strokeWidth={1.25} />
      <line x1={56} y1={126} x2={56} y2={164} stroke={C.line} strokeWidth={1.25} />
      {items.map(({ y, filled, icon }) => (
        <g key={y}>
          <circle cx={56} cy={y} r={7} fill={filled ? C.content : 'none'} fillOpacity={filled ? 0.6 : 1} stroke={C.edge} strokeWidth={1.4} />
          {icon && <path d="M53 64 l2.2 2.2 L59.5 61.5" fill="none" stroke={C.text} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />}
        </g>
      ))}
      {/* content blocks: actor, title, timestamp, description */}
      {items.map(({ y }, i) => (
        <g key={y}>
          <circle cx={86} cy={y} r={6} fill={C.content} fillOpacity={0.5} stroke={C.edge} strokeWidth={1.1} />
          <rect x={98} y={y - 4} width={i === 1 ? 120 : 96} height={8} rx={4} fill={C.content} fillOpacity={0.55} />
          <text x={356} y={y + 3} textAnchor="end" className="bpLabel" fill={C.faint}>2h</text>
          <rect x={80} y={y + 12} width={188} height={5} rx={2.5} fill={C.content} fillOpacity={0.35} />
        </g>
      ))}
      {/* media slot on the middle event */}
      <rect x={80} y={140} width={110} height={16} rx={5} fill="none" stroke={C.edge} strokeWidth={1.1} strokeDasharray="4 3" />
      <text x={196} y={151} className="bpLabel" fill={C.faint}>{t(m.bpMedia)}</text>
      <text x={26} y={94} className="bpLabel" fill={C.faint} transform="rotate(-90 26 94)">{t(m.bpRail)}</text>
      <BpTitle />
      <Foot y={222} parts={[t(m.bpMarkerConnectorRail), t(m.bpActorTitleTimestamp), t(m.bpDescriptionMediaActions)]} />
    </svg>
  );
}

// Wizard: the connected Steps progress row, the active step's label, the
// content panel, the error live region, and the previous/next footer.
function WizardBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const gap = fmt(dimensions?.gap);
  const radius = fmt(dimensions?.panelRadius);
  const markers = [
    { x: 60, state: 'done' },
    { x: 116, state: 'active' },
    { x: 172, state: 'todo' },
  ] as const;
  return (
    <svg viewBox="0 0 400 230" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheWizard)}>
      <Defs />
      <rect x={28} y={40} width={344} height={156} rx={10} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {/* connected progress markers */}
      <line x1={69} y1={62} x2={107} y2={62} stroke={C.line} strokeWidth={1.25} />
      <line x1={125} y1={62} x2={163} y2={62} stroke={C.line} strokeWidth={1.25} strokeDasharray="3 2" />
      {markers.map(({ x, state }) => (
        <g key={x}>
          <circle cx={x} cy={62} r={9} fill={state === 'todo' ? 'none' : C.content} fillOpacity={state === 'todo' ? 1 : 0.55} stroke={C.edge} strokeWidth={state === 'active' ? 1.8 : 1.25} />
          {state === 'done' && <path d={`M${x - 3.5} 62 l2.4 2.4 L${x + 3.8} 59.2`} fill="none" stroke={C.text} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />}
          {state === 'active' && <text x={x} y={65.5} textAnchor="middle" className="bpLabel" fill={C.text}>2</text>}
          {state === 'todo' && <text x={x} y={65.5} textAnchor="middle" className="bpLabel" fill={C.faint}>3</text>}
        </g>
      ))}
      {/* step label + panel */}
      <text x={44} y={100} fill={C.text} fontSize={14} fontWeight={650}>{t(m.bpAccountDetails)}</text>
      <VDim x={364} y1={104} y2={116} label={gap ? `${t(m.bpGap)}: ${gap}` : t(m.bpGap)} horizontal />
      <rect x={44} y={116} width={312} height={38} rx={8} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <text x={200} y={139} textAnchor="middle" className="bpLabel" fill={C.faint}>{t(m.bpPanelRoleGroupFocusedOnNavigation)}</text>
      {/* error live region */}
      <text x={44} y={162} className="bpLabel" fill={C.faint}>{t(m.bpErrorLiveRegion)}</text>
      {/* footer actions */}
      <rect x={232} y={166} width={58} height={22} rx={6} fill="none" stroke={C.edge} strokeWidth={1.25} />
      <rect x={296} y={166} width={58} height={22} rx={6} fill={C.content} fillOpacity={0.5} stroke={C.edge} strokeWidth={1.25} />
      <BpTitle />
      <Foot y={222} parts={[t(m.bpProgress), radius && `${t(m.bpPanelRadius)}: ${radius}`, t(m.bpErrorRegion), t(m.bpPreviousNext)]} />
    </svg>
  );
}

// Rating: a row of stars filled to the value (3.5 of 5 here), with a half-filled
// star to show fractional display and the rest hollow.
function RatingBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const font = fmt(size.fontSize);
  const gap = fmt(dimensions?.gap);
  const N = 5;
  const starS = 42;
  const g = 18;
  const totalW = N * starS + (N - 1) * g;
  const SX = (400 - totalW) / 2;
  const SY = 74;
  const halfX = SX + 3 * (starS + g) + starS / 2;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheRating)}>
      <Defs />
      <clipPath id="bpRatingHalf">
        <rect x={0} y={0} width={halfX} height={210} />
      </clipPath>
      {Array.from({ length: N }, (_, i) => {
        const x = SX + i * (starS + g);
        const filled = i < 3;
        const half = i === 3;
        const tx = `translate(${x} ${SY}) scale(${starS / 24})`;
        return (
          <g key={i}>
            <g transform={tx} fill={filled ? C.content : 'none'} fillOpacity={filled ? 0.6 : 1} stroke={C.edge} strokeWidth={1.6} strokeLinejoin="round">
              <path d={PLACEHOLDER_ICON} />
            </g>
            {half && (
              <g clipPath="url(#bpRatingHalf)">
                <g transform={tx} fill={C.content} fillOpacity={0.6} stroke="none">
                  <path d={PLACEHOLDER_ICON} />
                </g>
              </g>
            )}
          </g>
        );
      })}
      <text x={SX + starS / 2} y={SY - 12} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpStar)}</text>
      {gap && <HDim x1={SX + starS} x2={SX + starS + g} y={SY + starS + 16} label={gap} above={false} />}
      <text x={200} y={SY + starS + 40} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpValue355)}</text>
      <BpTitle />
      <Foot parts={[font && `${t(m.bpStar)}: ${font}`]} />
    </svg>
  );
}

// OtpField: the six code cells with three entered digits, the active cell
// carrying the caret, dimensioned with the cell height, gap, and radius.
function OtpFieldBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const height = fmt(size.height);
  const font = fmt(size.fontSize);
  const gap = fmt(size.gap);
  const radius = fmt(size.radius);
  const border = fmt(dimensions?.border);
  const N = 6;
  const cw = 38;
  const ch = 48;
  const g = 14;
  const rr = 8;
  const totalW = N * cw + (N - 1) * g;
  const SX = (400 - totalW) / 2;
  const SY = 74;
  const DIGITS = ['4', '2', '0'];
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheOtpField)}>
      <Defs />
      {Array.from({ length: N }, (_, i) => {
        const x = SX + i * (cw + g);
        const active = i === DIGITS.length;
        return (
          <g key={i}>
            <rect
              x={x}
              y={SY}
              width={cw}
              height={ch}
              rx={rr}
              fill={active ? C.fill : 'none'}
              stroke={active ? C.line : C.edge}
              strokeWidth={active ? 1.5 : 1.25}
              strokeDasharray={active ? undefined : '5 3'}
            />
            {i < DIGITS.length && (
              <text x={x + cw / 2} y={SY + ch / 2} textAnchor="middle" dominantBaseline="central" className="bpLabel">
                {DIGITS[i]}
              </text>
            )}
            {active && <line x1={x + cw / 2} y1={SY + 13} x2={x + cw / 2} y2={SY + ch - 13} stroke={C.line} strokeWidth={2} />}
          </g>
        );
      })}
      {height && <VDim x={SX - 18} y1={SY} y2={SY + ch} label={height} />}
      {gap && <HDim x1={SX + cw} x2={SX + cw + g} y={SY + ch + 16} label={gap} above={false} />}
      {radius && (
        <>
          <path
            d={`M ${SX + totalW - rr} ${SY} A ${rr} ${rr} 0 0 1 ${SX + totalW} ${SY + rr}`}
            fill="none"
            stroke={C.line}
            strokeWidth={1.5}
          />
          <text x={392} y={SY - 12} textAnchor="end" className="bpLabel">
            {t(m.bpRadius)}: {radius}
          </text>
        </>
      )}
      <text x={SX + DIGITS.length * (cw + g) + cw / 2} y={SY - 12} textAnchor="middle" className="bpLabel bpMuted">{t(m.bpCaret)}</text>
      <BpTitle />
      <Foot parts={[font && `${t(m.bpFont)}: ${font}`, border && `${t(m.bpBorder)}: ${border}`, t(m.bpInputInvisibleOverlay)]} />
    </svg>
  );
}

// Sparkline: the word-sized trend box with a real wavy mark, its dashed
// baseline, and the emphasis dot on the newest sample.
function SparklineBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const height = fmt(size.height);
  const thickness = fmt(size.thickness);
  const pointDia = fmt(dimensions?.pointDiameter);
  const baselineW = fmt(dimensions?.baselineWidth);

  // schematic geometry (not to scale; labels carry the real values)
  const BX = 78;
  const BW = 244;
  const BY = 72;
  const BH = 72;
  // a wavy series across the box, newest sample last
  const N = 12;
  const ys = [0.62, 0.5, 0.58, 0.34, 0.42, 0.22, 0.38, 0.55, 0.44, 0.3, 0.4, 0.26];
  const pts = ys.map((v, i) => `${BX + (i / (N - 1)) * BW},${BY + v * BH}`);
  const lastX = BX + BW;
  const lastY = BY + (ys[ys.length - 1] ?? 0) * BH;
  const baseY = BY + 0.3 * BH;

  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheSparkline)}>
      <Defs />

      {/* the box: fluid width, fixed height */}
      <rect x={BX} y={BY} width={BW} height={BH} fill={C.fill} fillOpacity={0.5} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />

      {/* dashed baseline at a reference value */}
      <line x1={BX} y1={baseY} x2={BX + BW} y2={baseY} stroke={C.edge} strokeWidth={1.25} strokeDasharray="3 3" />
      <text x={BX + BW + 8} y={baseY + 3} className="bpLabel" fill={C.faint}>{t(m.bpBaseline)}</text>

      {/* the mark: a thin polyline, with the newest sample emphasized */}
      <polyline points={pts.join(' ')} fill="none" stroke={C.line} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r={4} fill={C.line} />
      <text x={lastX - 10} y={lastY - 12} textAnchor="end" className="bpLabel" fill={C.faint}>{t(m.bpEndPoint)}</text>

      {/* dimensions: fluid width above, the size's height on the left */}
      <HDim x1={BX} x2={BX + BW} y={BY - 20} label={t(m.bpWidthAuto)} />
      <VDim x={BX - 22} y1={BY} y2={BY + BH} label={`${t(m.bpHeight)}: ${height ?? t(m.bpAuto)}`} />

      <BpTitle />
      <Foot parts={[thickness && `${t(m.bpStroke)}: ${thickness}`, pointDia && `${t(m.bpPoint)}: ⌀ ${pointDia}`, baselineW && `${t(m.bpBaseline)}: ${baselineW}`]} />
    </svg>
  );
}

// TimelineScrubber: the recorded window with its activity silhouette, marker
// ticks, the playhead with its readout, and the trailing live edge.
function TimelineScrubberBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const height = fmt(size.height);
  const radius = fmt(dimensions?.radius);
  const playheadW = fmt(dimensions?.playheadWidth);
  const markerW = fmt(dimensions?.markerWidth);
  const handleDia = fmt(dimensions?.handleDiameter);

  const TX = 44;
  const TW = 312;
  const TY = 76;
  const TH = 64;
  const PX = TX + TW * 0.66; // playhead position
  // activity silhouette: normalized samples, a calm base with two bursts
  const act = [0.25, 0.3, 0.26, 0.35, 0.3, 0.68, 0.75, 0.5, 0.32, 0.3, 0.42, 0.55, 0.4, 0.3, 0.28, 0.34];
  const actPts = act.map((v, i) => `${TX + (i / (act.length - 1)) * TW},${TY + TH - v * TH}`);

  return (
    <svg viewBox="0 0 400 230" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheTimelineScrubber)}>
      <Defs />

      {/* the track over the recorded window */}
      <rect x={TX} y={TY} width={TW} height={TH} rx={8} fill={C.fill} fillOpacity={0.4} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {/* activity backdrop */}
      <polygon points={`${TX},${TY + TH} ${actPts.join(' ')} ${TX + TW},${TY + TH}`} fill={C.content} fillOpacity={0.35} />
      {/* marker ticks */}
      <line x1={TX + TW * 0.38} y1={TY} x2={TX + TW * 0.38} y2={TY + TH} stroke={C.edge} strokeWidth={2} />
      <line x1={TX + TW * 0.42} y1={TY} x2={TX + TW * 0.42} y2={TY + TH} stroke={C.edge} strokeWidth={2} opacity={0.6} />
      <text x={TX + TW * 0.4} y={TY - 8} textAnchor="middle" className="bpLabel" fill={C.faint}>{t(m.bpMarkers)}</text>

      {/* playhead: the slider, its grab handle riding above the track edge */}
      <line x1={PX} y1={TY - 6} x2={PX} y2={TY + TH} stroke={C.line} strokeWidth={2.5} />
      <circle cx={PX} cy={TY - 10} r={6} fill={C.line} />
      <rect x={PX - 30} y={TY + TH + 10} width={60} height={18} rx={5} fill={C.fill} stroke={C.edge} strokeWidth={1.1} />
      <text x={PX} y={TY + TH + 23} textAnchor="middle" className="bpLabel">14:29:36</text>
      <text x={PX + 14} y={TY - 12} className="bpLabel">{t(m.bpPlayhead)}</text>

      {/* sparse time ticks along the bottom edge */}
      <text x={TX + 4} y={TY + TH - 6} className="bpLabel" fill={C.faint}>14:15</text>
      <text x={TX + TW - 4} y={TY + TH - 6} textAnchor="end" className="bpLabel" fill={C.faint}>{t(m.bpNow)}</text>

      {/* dimensions */}
      <HDim x1={TX} x2={TX + TW} y={TY - 28} label={t(m.bpWindowStartEnd)} />
      <VDim x={TX - 20} y1={TY} y2={TY + TH} label={`${t(m.bpHeight)}: ${height ?? t(m.bpAuto)}`} />

      <BpTitle />
      <Foot y={222} parts={[playheadW && `${t(m.bpPlayhead)}: ${playheadW}`, handleDia && `${t(m.bpHandle)}: ⌀ ${handleDia}`, markerW && `${t(m.bpMarker)}: ${markerW}`, radius && `${t(m.bpRadius)}: ${radius}`]} />
    </svg>
  );
}

// TimeSeriesChart: the plot with recessive grid and axes, two series, the
// hover crosshair, and the readout and legend rows above the plot.
function TimeSeriesChartBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const strokeW = fmt(dimensions?.strokeWidth);
  const gridW = fmt(dimensions?.gridWidth);
  const swatch = fmt(dimensions?.swatchDiameter);

  const PXx = 64;
  const PW = 288;
  const PY = 74;
  const PH = 104;
  const CXx = PXx + PW * 0.6; // crosshair position
  const s1 = [0.55, 0.4, 0.5, 0.28, 0.38, 0.2, 0.34, 0.46, 0.3, 0.24, 0.36, 0.3];
  const s2 = [0.8, 0.72, 0.78, 0.62, 0.7, 0.58, 0.66, 0.74, 0.64, 0.6, 0.7, 0.66];
  const line = (vals: number[]) => vals.map((v, i) => `${PXx + (i / (vals.length - 1)) * PW},${PY + v * PH}`).join(' ');

  return (
    <svg viewBox="0 0 400 230" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheTimeSeriesChart)}>
      <Defs />

      {/* readout (left) and legend (right) rows above the plot */}
      <circle cx={PXx + 4} cy={44} r={3.5} fill={C.line} />
      <text x={PXx + 12} y={47.5} className="bpLabel">{t(m.bp142936User42)}</text>
      <circle cx={PXx + PW - 92} cy={44} r={3.5} fill={C.line} />
      <text x={PXx + PW - 84} y={47.5} className="bpLabel">{t(m.bpUser)}</text>
      <circle cx={PXx + PW - 48} cy={44} r={3.5} fill={C.edge} />
      <text x={PXx + PW - 40} y={47.5} className="bpLabel">{t(m.bpSystem)}</text>
      <text x={PXx + PW} y={30} textAnchor="end" className="bpLabel" fill={C.faint}>{t(m.bpLegend)}</text>

      {/* plot box with recessive horizontal grid */}
      <rect x={PXx} y={PY} width={PW} height={PH} fill={C.fill} fillOpacity={0.25} stroke={C.edge} strokeWidth={1.1} strokeDasharray="5 3" />
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={PXx} y1={PY + PH * f} x2={PXx + PW} y2={PY + PH * f} stroke={C.grid} strokeWidth={1} />
      ))}
      {/* y-axis value labels, x-axis time labels */}
      <text x={PXx - 8} y={PY + 8} textAnchor="end" className="bpLabel" fill={C.faint}>100%</text>
      <text x={PXx - 8} y={PY + PH} textAnchor="end" className="bpLabel" fill={C.faint}>0</text>
      <text x={PXx} y={PY + PH + 16} className="bpLabel" fill={C.faint}>14:28</text>
      <text x={PXx + PW} y={PY + PH + 16} textAnchor="end" className="bpLabel" fill={C.faint}>14:30</text>

      {/* two series */}
      <polyline points={line(s1)} fill="none" stroke={C.line} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={line(s2)} fill="none" stroke={C.edge} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {/* hover crosshair snapped to a sample */}
      <line x1={CXx} y1={PY} x2={CXx} y2={PY + PH} stroke={C.text} strokeWidth={1} strokeDasharray="3 2" />
      <circle cx={CXx} cy={PY + 0.34 * PH} r={4} fill="none" stroke={C.line} strokeWidth={1.5} />
      <text x={CXx + 8} y={PY + 14} className="bpLabel" fill={C.faint}>{t(m.bpCrosshair)}</text>

      {/* dimensions */}
      <VDim x={PXx - 34} y1={PY} y2={PY + PH} label={t(m.bpHeight12rem)} />

      <BpTitle />
      <Foot y={222} parts={[strokeW && `${t(m.bpStroke)}: ${strokeW}`, gridW && `${t(m.bpGrid)}: ${gridW}`, swatch && `${t(m.bpSwatch)}: ⌀ ${swatch}`, t(m.bpCanvasUPlot)]} />
    </svg>
  );
}


/**
 * SeekBar blueprint: the four parts the spec names — the track, the played run
 * behind the playhead, the run still ahead, and the thumb. The wave is drawn
 * from the same geometry the component uses, so the picture is the component
 * rather than an impression of it.
 */
function SeekBarBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const strokeW = fmt(dimensions?.strokeWidth);
  const barStroke = fmt(dimensions?.barStrokeWidth);
  const thumbW = fmt(dimensions?.thumbWidth);
  const height = fmt(size.height) ?? fmt(dimensions?.height);

  // schematic geometry (not to scale; the labels carry the real values)
  const TX = 72;
  const TW = 256;
  const TY = 104;
  const TH = 34; // the bar's box, tall enough for the wave to deflect inside
  const cut = TX + TW * 0.45; // the playhead

  // The shape a bare <SeekBar /> renders, read from the spec rather than named
  // here, so the diagram cannot fall out of step with the component's default
  // the way a hardcoded shape would. The curve itself comes from the same
  // geometry the component draws, mapped into this schematic.
  const defaultShape = (seekBarSpec.defaults?.shape as SeekBarShape | undefined) ?? 'swell';
  const geo = seekBarGeometry({ shape: defaultShape, progress: 0.45 });
  const mapPath = (d: string): string =>
    d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_m, x: string, y: string) =>
      `${(TX + (Number(x) / SEEK_VIEW_WIDTH) * TW).toFixed(2)} ${(TY + (Number(y) / SEEK_VIEW_HEIGHT - 0.5) * TH).toFixed(2)}`,
    );

  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheSeekBar)}>
      <Defs />

      {/* the track: the full duration, and the whole of it takes the pointer */}
      <rect
        x={TX}
        y={TY - TH / 2}
        width={TW}
        height={TH}
        fill={C.fill}
        stroke={C.edge}
        strokeWidth={1.25}
        strokeDasharray="5 3"
      />

      {/* the run still ahead, then the played run over it in the accent */}
      <path d={mapPath(geo.aheadPath)} fill="none" stroke={C.edge} strokeWidth={2} strokeLinecap="round" />
      <path d={mapPath(geo.playedPath)} fill="none" stroke={C.content} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* the thumb, riding the boundary between them */}
      <rect x={cut - 3} y={TY - TH * 0.3} width={6} height={TH * 0.6} rx={3} fill={C.line} />

      {/* callouts for the two runs and the playhead */}
      <text x={TX + 6} y={TY - TH / 2 - 8} className="bpLabel" fill={C.faint}>{t(m.bpPlayed)}</text>
      <text x={cut + 10} y={TY - TH / 2 - 8} className="bpLabel" fill={C.faint}>{t(m.bpAhead)}</text>

      {/* the bar's width and height */}
      <HDim x1={TX} x2={TX + TW} y={TY - TH / 2 - 26} label={t(m.bpWidthAuto)} />
      {height && <VDim x={TX - 34} y1={TY - TH / 2} y2={TY + TH / 2} label={height} />}
      {thumbW && <HDim x1={cut - 3} x2={cut + 3} y={TY + TH / 2 + 20} label={thumbW} above={false} />}

      <BpTitle />
      <Foot
        y={204}
        parts={[
          strokeW && `${t(m.bpStroke)}: ${strokeW}`,
          barStroke && `${t(m.bpBars)}: ${barStroke}`,
        ]}
      />
    </svg>
  );
}


/**
 * PlayerCard blueprint: the card as it actually assembles — artwork beside the
 * heading lines, the seek bar with its clock under them, and the transport row
 * with its one solid control. The bar is drawn from the same geometry the
 * component uses, so the diagram cannot drift from the thing it documents.
 */
function PlayerCardBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const gap = fmt(dimensions?.gap);
  const transportGap = fmt(dimensions?.transportGap);
  const radius = fmt(dimensions?.radius);

  // A taller canvas than the usual 224: this card stacks four rows plus their
  // callouts, and at the standard height the transport collided with the card
  // edge and the footer. The frame scales to the viewBox, so height is free.
  const H = 320;

  // schematic geometry (not to scale; the labels carry the real values)
  const CX = 62;
  const CW = 276;
  const CY = 52;
  const CH = 214;
  const PAD = 18;
  const innerX = CX + PAD;
  const innerW = CW - PAD * 2;

  const artSize = 44;
  const artY = CY + PAD + 10; // room for the heading callout above it
  const textX = innerX + artSize + 12;

  const barY = artY + artSize + 34;
  const barH = 16;
  const clockY = barY + barH + 16;
  const transportY = clockY + 34;

  // the real seek geometry, mapped into the schematic's bar box
  const geo = seekBarGeometry({ shape: 'swell', progress: 0.45 });
  const mapPath = (d: string): string =>
    d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_m, x: string, y: string) =>
      `${(innerX + (Number(x) / SEEK_VIEW_WIDTH) * innerW).toFixed(2)} ${(barY + (Number(y) / SEEK_VIEW_HEIGHT) * barH).toFixed(2)}`,
    );

  const centre = CX + CW / 2;

  return (
    <svg viewBox={`0 0 400 ${H}`} className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfThePlayerCard)}>
      <Defs />

      {/* the card */}
      <rect x={CX} y={CY} width={CW} height={CH} rx={12} fill={C.fill} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />

      {/* artwork, top-aligned with the heading beside it */}
      <rect x={innerX} y={artY} width={artSize} height={artSize} rx={5} fill={C.content} opacity={0.45} />
      <rect x={textX} y={artY + 4} width={118} height={8} rx={4} fill={C.content} />
      <rect x={textX} y={artY + 19} width={88} height={7} rx={3.5} fill={C.line} opacity={0.6} />
      <rect x={textX} y={artY + 32} width={66} height={6} rx={3} fill={C.line} opacity={0.4} />
      <text x={textX} y={artY - 10} className="bpLabel" fill={C.faint}>{t(m.bpTitleLines)}</text>

      {/* the seek bar, full width under the header */}
      <text x={innerX} y={barY - 12} className="bpLabel" fill={C.faint}>{t(m.bpSeekBar)}</text>
      <path d={mapPath(geo.aheadPath)} fill="none" stroke={C.edge} strokeWidth={2} strokeLinecap="round" />
      <path d={mapPath(geo.playedPath)} fill="none" stroke={C.content} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* the clock: elapsed on the leading edge, total on the trailing one */}
      <rect x={innerX} y={clockY} width={28} height={7} rx={3.5} fill={C.line} opacity={0.5} />
      <rect x={innerX + innerW - 28} y={clockY} width={28} height={7} rx={3.5} fill={C.line} opacity={0.35} />

      {/* the transport: quiet controls either side of one solid play button */}
      {[-2, -1, 1, 2].map((i) => (
        <circle key={i} cx={centre + i * 28} cy={transportY} r={9} fill="none" stroke={C.line} strokeWidth={1.5} strokeDasharray="4 2.5" />
      ))}
      <circle cx={centre} cy={transportY} r={14} fill={C.content} />
      {/* the play glyph, knocked out of the disc: without it the primary
          control is just a larger dot among the others */}
      <path
        d={`M ${centre - 4} ${transportY - 6} L ${centre + 6.5} ${transportY} L ${centre - 4} ${transportY + 6} Z`}
        fill={C.fill}
      />

      {/* dimensions: the row gap on the outside, the control gap between two
          adjacent buttons */}
      {gap && <VDim x={CX - 28} y1={artY + artSize} y2={barY - 20} label={gap} />}
      {transportGap && (
        <HDim x1={centre + 14} x2={centre + 19} y={transportY + 24} label={transportGap} above={false} />
      )}

      {/* the control row named below the card, clear of its edge */}
      <text x={centre} y={CY + CH + 22} textAnchor="middle" className="bpLabel" fill={C.faint}>
        {t(m.bpTransport)}
      </text>

      <BpTitle />
      <Foot y={H - 12} parts={[radius && `${t(m.bpRadius)}: ${radius}`]} />
    </svg>
  );
}

// CommandPalette: the scrim with the panel pinned near its top, the query field
// across the panel's width, and a grouped option list under it with the cursor
// on one row. Drawn as the palette actually sits — top-anchored, not centred —
// because that placement is the point: the field lands in the same spot however
// many commands match.
function CommandPaletteBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const gap = fmt(dimensions?.gap);
  const padding = fmt(dimensions?.padding);

  // A taller canvas than the usual 224: the panel needs a query field plus two
  // labelled groups under it before the list reads as a list.
  const H = 300;

  const PX = 74;
  const PW = 252;
  const PY = 44;
  const PH = 224;
  const PAD = 12;
  const innerX = PX + PAD;
  const innerW = PW - PAD * 2;

  const fieldY = PY + PAD;
  const fieldH = 26;

  // rows, in flat order: a heading, three options, a heading, two options
  const rowH = 18;
  const rowGap = 3;
  const headH = 12;
  const listY = fieldY + fieldH + 10;

  // the cursor sits on the first option, the one Enter would run
  const CURSOR = 0;

  type Row = { kind: 'head' } | { kind: 'option'; index: number; shortcut?: boolean };
  const rows: Row[] = [
    { kind: 'head' },
    { kind: 'option', index: 0, shortcut: true },
    { kind: 'option', index: 1 },
    { kind: 'head' },
    { kind: 'option', index: 2 },
    { kind: 'option', index: 3, shortcut: true },
  ];

  let cursorY = listY;
  let y = listY;
  const drawn = rows.map((row) => {
    const at = y;
    if (row.kind === 'option' && row.index === CURSOR) cursorY = at;
    y += (row.kind === 'head' ? headH : rowH) + rowGap;
    return { row, y: at };
  });

  return (
    <svg viewBox={`0 0 400 ${H}`} className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheCommandPalette)}>
      <Defs />

      {/* the scrim: the whole canvas is the overlay, so it is named rather than
          drawn — a fill here would bury the grid the figure is measured on */}
      <text x={16} y={H - 26} className="bpLabel" fill={C.faint}>
        {t(m.bpScrim)}
      </text>

      {/* the panel, pinned near the top rather than centred */}
      <rect
        x={PX}
        y={PY}
        width={PW}
        height={PH}
        rx={12}
        fill="none"
        stroke={C.edge}
        strokeWidth={1.25}
        strokeDasharray="4 3"
      />

      {/* the query field: full panel width, and the only thing that ever holds
          focus */}
      <rect x={innerX} y={fieldY} width={innerW} height={fieldH} rx={7} fill="none" stroke={C.line} strokeWidth={1.5} />
      <circle cx={innerX + 13} cy={fieldY + fieldH / 2} r={4} fill="none" stroke={C.line} strokeWidth={1.5} />
      <line
        x1={innerX + 16}
        y1={fieldY + fieldH / 2 + 3}
        x2={innerX + 19}
        y2={fieldY + fieldH / 2 + 6}
        stroke={C.line}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <text x={innerX + 26} y={fieldY + fieldH / 2 + 3.5} className="bpLabel" fill={C.faint}>
        {t(m.bpQuery)}
      </text>

      {/* the list */}
      {drawn.map(({ row, y: at }, i) =>
        row.kind === 'head' ? (
          <text key={i} x={innerX + 8} y={at + headH - 2} className="bpLabel bpMuted">
            {t(m.bpGroupHeading)}
          </text>
        ) : (
          <g key={i}>
            {/* only the cursor row is filled; every other row is bare, so there
                is exactly one row Enter and a click agree on */}
            {row.index === CURSOR && (
              <rect x={innerX} y={at} width={innerW} height={rowH} rx={5} fill={C.fill} stroke={C.line} strokeWidth={1} />
            )}
            <rect x={innerX + 8} y={at + rowH / 2 - 3} width={innerW * 0.46} height={6} rx={3} fill={C.content} opacity={row.index === CURSOR ? 1 : 0.45} />
            {row.shortcut && (
              <rect
                x={innerX + innerW - 30}
                y={at + rowH / 2 - 6}
                width={22}
                height={12}
                rx={3}
                fill="none"
                stroke={C.line}
                strokeWidth={1}
              />
            )}
          </g>
        ),
      )}

      {/* the cursor named on the leading edge, clear of the panel */}
      <text x={PX - 8} y={cursorY + rowH / 2 + 3} textAnchor="end" className="bpLabel" fill={C.faint}>
        {t(m.bpCursor)}
      </text>

      {/* the shortcut hint column named once, on the trailing edge */}
      <text x={PX + PW + 8} y={fieldY + fieldH + 28} className="bpLabel" fill={C.faint}>
        {t(m.bpShortcutHint)}
      </text>

      {/* dimensions: the panel padding on the outside, the row gap between two
          adjacent options */}
      {padding && <HDim x1={PX} x2={innerX} y={PY + PH + 16} label={padding} above={false} />}
      {gap && <VDim x={PX + PW + 30} y1={drawn[1]!.y + rowH} y2={drawn[2]!.y} label={gap} />}

      <BpTitle />
      <Foot y={H - 12} parts={[radius && `${t(m.bpRadius)}: ${radius}`, padding && `${t(m.bpPadding)}: ${padding}`]} />
    </svg>
  );
}

// CalendarView: the header row, the weekday strip, and the six-by-seven grid
// with events laid into a few cells. Drawn at the real proportions — six rows
// even though the month fits in five, since that fixed height is the point.
function CalendarViewBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const gap = fmt(dimensions?.gap);
  const cellPadding = fmt(dimensions?.cellPadding);

  const H = 300;
  const X = 40;
  const W = 320;
  const COLS = 7;
  const ROWS = 6;
  const G = 3;
  const cw = (W - (COLS - 1) * G) / COLS;
  const ch = 30;

  const headerY = 44;
  const weekdayY = headerY + 26;
  const gridY = weekdayY + 12;

  // A handful of cells carrying event chips, so the figure reads as a schedule
  // rather than an empty grid. [row, col, chips]
  const filled: [number, number, number][] = [
    [1, 3, 2],
    [2, 1, 1],
    [2, 3, 3],
    [3, 5, 1],
    [4, 2, 2],
  ];
  const chipsAt = new Map(filled.map(([r, c, n]) => [`${r}:${c}`, n]));

  // today, and a selected day: the two markings that must not look alike
  const TODAY: [number, number] = [2, 3];
  const SELECTED: [number, number] = [3, 5];

  const cellX = (col: number) => X + col * (cw + G);
  const cellY = (row: number) => gridY + row * (ch + G);

  return (
    <svg viewBox={`0 0 400 ${H}`} className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheCalendarView)}>
      <Defs />

      {/* header: paging on the leading edge, the range title, the view switch */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={X + i * 26} y={headerY} width={22} height={18} rx={5} fill="none" stroke={C.line} strokeWidth={1.25} />
      ))}
      <rect x={X + 90} y={headerY + 5} width={72} height={8} rx={4} fill={C.content} opacity={0.6} />
      <rect x={X + W - 92} y={headerY} width={92} height={18} rx={9} fill="none" stroke={C.line} strokeWidth={1.25} strokeDasharray="4 3" />

      {/* weekday strip */}
      {Array.from({ length: COLS }, (_, col) => (
        <rect key={col} x={cellX(col) + cw / 2 - 8} y={weekdayY} width={16} height={5} rx={2.5} fill={C.line} opacity={0.4} />
      ))}
      {/* The side labels are set vertically. The grid is 320 units wide in a
          400 canvas, leaving ~40 either side — nowhere near enough for a
          horizontal word, so "weekdays" and "day cell" used to run off the
          left edge and "event" and "+N more" off the right. Rotated, they need
          only their line height, which the margin does have. */}
      <text
        transform={`rotate(-90 ${X - 14} ${weekdayY + 4})`}
        x={X - 14}
        y={weekdayY + 4}
        textAnchor="middle"
        className="bpLabel"
        fill={C.faint}
      >
        {t(m.bpWeekdays)}
      </text>

      {/* the grid: six rows, always */}
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => {
          const isToday = TODAY[0] === row && TODAY[1] === col;
          const isSelected = SELECTED[0] === row && SELECTED[1] === col;
          const chips = chipsAt.get(`${row}:${col}`) ?? 0;
          // the leading week borrows from the previous month
          const outside = row === 0 && col < 3;
          return (
            <g key={`${row}:${col}`}>
              <rect
                x={cellX(col)}
                y={cellY(row)}
                width={cw}
                height={ch}
                rx={4}
                fill={isSelected ? C.fill : 'none'}
                stroke={isSelected ? C.line : C.edge}
                strokeWidth={isSelected ? 1.5 : 1}
              />
              {/* Today marks only its number; selection tints the cell. */}
              {isToday ? (
                <circle cx={cellX(col) + 9} cy={cellY(row) + 8} r={5} fill={C.content} />
              ) : (
                <rect
                  x={cellX(col) + 5}
                  y={cellY(row) + 5.5}
                  width={8}
                  height={5}
                  rx={2.5}
                  fill={C.line}
                  opacity={outside ? 0.25 : 0.55}
                />
              )}
              {Array.from({ length: Math.min(chips, 2) }, (_, i) => (
                <rect
                  key={i}
                  x={cellX(col) + 4}
                  y={cellY(row) + 15 + i * 6}
                  width={cw - 8}
                  height={4}
                  rx={2}
                  fill={C.content}
                  opacity={0.75}
                />
              ))}
              {chips > 2 && (
                <rect x={cellX(col) + 4} y={cellY(row) + 27} width={cw * 0.5} height={2.5} rx={1.25} fill={C.line} opacity={0.4} />
              )}
            </g>
          );
        }),
      )}

      {/* the three things worth naming, each pointed at from outside the grid */}
      <text x={cellX(TODAY[1]) + cw / 2} y={cellY(TODAY[0]) - 4} textAnchor="middle" className="bpLabel" fill={C.faint}>
        {t(m.bpToday)}
      </text>
      <text
        transform={`rotate(90 ${X + W + 14} ${cellY(1) + 16})`}
        x={X + W + 14}
        y={cellY(1) + 16}
        textAnchor="middle"
        className="bpLabel"
        fill={C.faint}
      >
        {t(m.bpEventChip)}
      </text>
      <text
        transform={`rotate(90 ${X + W + 14} ${cellY(2) + 16})`}
        x={X + W + 14}
        y={cellY(2) + 16}
        textAnchor="middle"
        className="bpLabel"
        fill={C.faint}
      >
        {t(m.bpOverflowLine)}
      </text>
      <text
        transform={`rotate(-90 ${X - 14} ${cellY(5) + 15})`}
        x={X - 14}
        y={cellY(5) + 15}
        textAnchor="middle"
        className="bpLabel"
        fill={C.faint}
      >
        {t(m.bpDayCell)}
      </text>

      {/* dimensions: the gap between two cells, and the padding inside one */}
      {gap && <HDim x1={cellX(0) + cw} x2={cellX(1)} y={cellY(ROWS - 1) + ch + 16} label={gap} above={false} />}

      <BpTitle />
      <Foot
        y={H - 12}
        parts={[radius && `${t(m.bpRadius)}: ${radius}`, cellPadding && `${t(m.bpPadding)}: ${cellPadding}`, '6 × 7']}
      />
    </svg>
  );
}

// SortableList: four rows with their grips, one of them lifted off the stack
// and the rows it passed shifted up into the gap it left. Drawn mid-drag,
// because the resting state is just a list — the reordering is the component.
function SortableListBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const gap = fmt(dimensions?.gap);
  const padding = fmt(dimensions?.padding);

  const H = 250;
  const X = 84;
  const W = 232;
  const rowH = 30;
  const G = 6;
  const Y = 58;

  // Row 0 is lifted and heading for slot 2, so rows 1 and 2 have shifted up one
  // slot and row 3 is untouched — the same arithmetic `shiftFor` returns.
  const LIFTED = 0;
  const TARGET = 2;
  const slotY = (slot: number) => Y + slot * (rowH + G);

  return (
    <svg viewBox={`0 0 400 ${H}`} className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheSortableList)}>
      <Defs />

      {/* the settled rows, each already shifted into its mid-drag slot */}
      {[1, 2, 3].map((row, i) => {
        // rows 1 and 2 move up one slot; row 3 stays put
        const shift = row <= TARGET ? -1 : 0;
        const y = slotY(row + shift);
        return (
          <g key={row}>
            <rect x={X} y={y} width={W} height={rowH} rx={6} fill="none" stroke={C.edge} strokeWidth={1.25} />
            {/* grip: two columns of three dots */}
            {[0, 1].map((col) =>
              [0, 1, 2].map((dot) => (
                <circle
                  key={`${col}-${dot}`}
                  cx={X + 12 + col * 5}
                  cy={y + rowH / 2 - 5 + dot * 5}
                  r={1.4}
                  fill={C.line}
                  opacity={0.7}
                />
              )),
            )}
            <rect x={X + 30} y={y + rowH / 2 - 3} width={W * 0.42} height={6} rx={3} fill={C.line} opacity={0.45} />
            {/* the arrow showing which way this row slid */}
            {shift !== 0 && i === 0 && (
              <g stroke={C.line} strokeWidth={1.25} fill="none" strokeLinecap="round">
                <line x1={X + W + 14} y1={y + rowH + 8} x2={X + W + 14} y2={y + 4} />
                <polyline points={`${X + W + 10},${y + 9} ${X + W + 14},${y + 4} ${X + W + 18},${y + 9}`} />
              </g>
            )}
          </g>
        );
      })}

      {/* the lifted row, raised off the stack and part-way to its target */}
      <g>
        <rect
          x={X + 10}
          y={slotY(TARGET) - 6}
          width={W}
          height={rowH}
          rx={6}
          fill={C.fill}
          stroke={C.line}
          strokeWidth={1.75}
        />
        {[0, 1].map((col) =>
          [0, 1, 2].map((dot) => (
            <circle
              key={`${col}-${dot}`}
              cx={X + 22 + col * 5}
              cy={slotY(TARGET) - 6 + rowH / 2 - 5 + dot * 5}
              r={1.4}
              fill={C.content}
            />
          )),
        )}
        <rect
          x={X + 40}
          y={slotY(TARGET) - 6 + rowH / 2 - 3}
          width={W * 0.42}
          height={6}
          rx={3}
          fill={C.content}
        />
      </g>

      {/* the two things worth naming */}
      <text x={X - 8} y={slotY(0) + rowH / 2 + 3} textAnchor="end" className="bpLabel" fill={C.faint}>
        {t(m.bpGrip)}
      </text>
      <text x={X - 8} y={slotY(TARGET) + rowH / 2 - 2} textAnchor="end" className="bpLabel" fill={C.faint}>
        {t(m.bpLiftedRow)}
      </text>
      <text x={X + W + 26} y={slotY(0) + rowH / 2 + 3} className="bpLabel" fill={C.faint}>
        {t(m.bpRowShift)}
      </text>

      {/* dimensions: the gap between two rows */}
      {gap && <VDim x={X - 30} y1={slotY(0) + rowH} y2={slotY(1)} label={gap} />}

      <BpTitle />
      <Foot y={H - 12} parts={[radius && `${t(m.bpRadius)}: ${radius}`, padding && `${t(m.bpPadding)}: ${padding}`]} />
    </svg>
  );
}

// VirtualList: the tall spacer standing for the whole list, the viewport
// clipping it, and the small window of real rows inside — with the overscan
// rows shown outside the viewport edges, since they are the part of the design
// that is otherwise invisible.
function VirtualListBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);

  const H = 270;
  // the spacer: a tall column standing for the entire list
  const SX = 150;
  const SW = 120;
  const SY = 40;
  const SH = 200;

  // the viewport: the slice of that column a user can see
  const VY = 108;
  const VH = 74;
  const rowH = 13;
  const rowGapY = 2;

  // rows: two above the viewport and two below are overscan, the rest visible
  const firstRowY = VY - 2 * (rowH + rowGapY);
  const ROWS = 9;
  const overscanRows = new Set([0, 1, 7, 8]);

  return (
    <svg viewBox={`0 0 400 ${H}`} className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheVirtualList)}>
      <Defs />

      {/* the spacer, as tall as the entire list */}
      <rect x={SX} y={SY} width={SW} height={SH} rx={4} fill="none" stroke={C.edge} strokeWidth={1} strokeDasharray="3 3" />
      <text x={SX - 8} y={SY + 12} textAnchor="end" className="bpLabel" fill={C.faint}>
        {t(m.bpSpacer)}
      </text>
      <VDim x={SX - 34} y1={SY} y2={SY + SH} label={t(m.bpTotal)} />

      {/* the rendered rows, including the overscan that sits outside the view */}
      {Array.from({ length: ROWS }, (_, i) => {
        const y = firstRowY + i * (rowH + rowGapY);
        const isOverscan = overscanRows.has(i);
        return (
          <rect
            key={i}
            x={SX + 6}
            y={y}
            width={SW - 12}
            height={rowH}
            rx={2.5}
            fill={isOverscan ? 'none' : C.content}
            stroke={isOverscan ? C.line : 'none'}
            strokeWidth={1}
            strokeDasharray={isOverscan ? '3 2' : undefined}
            opacity={isOverscan ? 0.7 : 0.85}
          />
        );
      })}

      {/* the viewport: what the user can actually see */}
      <rect x={SX - 10} y={VY} width={SW + 20} height={VH} rx={5} fill="none" stroke={C.line} strokeWidth={1.75} />
      <text x={SX + SW + 18} y={VY + VH / 2 + 3} className="bpLabel" fill={C.faint}>
        {t(m.bpViewport)}
      </text>

      <text x={SX + SW + 18} y={firstRowY + rowH} className="bpLabel" fill={C.faint}>
        {t(m.bpOverscanRow)}
      </text>
      {/* Rotated, not flat: this label names the same vertical band the `total`
          dimension measures, so laid flat it runs straight through that arrow
          and its rotated label. Turned upright it sits in the gap between the
          dimension line and the viewport edge, where nothing else is drawn. */}
      <text
        x={SX - 18}
        y={VY + VH / 2}
        textAnchor="middle"
        transform={`rotate(-90 ${SX - 18} ${VY + VH / 2})`}
        className="bpLabel"
        fill={C.faint}
      >
        {t(m.bpWindowSlice)}
      </text>

      <BpTitle />
      <Foot y={H - 12} parts={[radius && `${t(m.bpRadius)}: ${radius}`, t(m.bpFixedRowHeight)]} />
    </svg>
  );
}

// RichTextEditor: the toolbar row over the text area, in one frame, with one
// control shown pressed — the state that makes the toolbar readable rather than
// only operable.
function RichTextEditorBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const padding = fmt(dimensions?.padding);
  const gap = fmt(dimensions?.gap);

  const H = 250;
  const X = 60;
  const W = 280;
  const Y = 52;
  const barH = 30;
  const areaH = 118;

  const btn = 20;
  const btnGap = 5;
  const MARKS = 4;
  const BLOCKS = 4;
  const PRESSED = 0;

  const btnX = (i: number) => X + 10 + i * (btn + btnGap);
  const blockX = (i: number) => btnX(MARKS + i) + 6;
  // Centred in the gap it actually divides, measured from its two neighbours.
  // Derived rather than assumed: the block buttons carry an extra offset, so a
  // midpoint taken from the nominal grid sat left of the real gap.
  const dividerX = (btnX(MARKS - 1) + btn + blockX(0)) / 2;

  return (
    <svg viewBox={`0 0 400 ${H}`} className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheRichTextEditor)}>
      <Defs />

      {/* one frame around toolbar and text area, so the two read as one field */}
      <rect x={X} y={Y} width={W} height={barH + areaH} rx={8} fill="none" stroke={C.line} strokeWidth={1.5} />
      <line x1={X} y1={Y + barH} x2={X + W} y2={Y + barH} stroke={C.edge} strokeWidth={1} />

      {/* inline mark controls; the first is pressed */}
      {Array.from({ length: MARKS }, (_, i) => (
        <rect
          key={`m${i}`}
          x={btnX(i)}
          y={Y + (barH - btn) / 2}
          width={btn}
          height={btn}
          rx={4}
          fill={i === PRESSED ? C.content : 'none'}
          stroke={i === PRESSED ? 'none' : C.line}
          strokeWidth={1}
          opacity={i === PRESSED ? 1 : 0.6}
        />
      ))}

      <line x1={dividerX} y1={Y + 8} x2={dividerX} y2={Y + barH - 8} stroke={C.edge} strokeWidth={1} />

      {/* block controls */}
      {Array.from({ length: BLOCKS }, (_, i) => (
        <rect
          key={`b${i}`}
          x={blockX(i)}
          y={Y + (barH - btn) / 2}
          width={btn}
          height={btn}
          rx={4}
          fill="none"
          stroke={C.line}
          strokeWidth={1}
          opacity={0.6}
        />
      ))}

      {/* the text area, with lines of monospace text */}
      {[0, 1, 2, 3].map((row) => (
        <rect
          key={row}
          x={X + 12}
          y={Y + barH + 14 + row * 16}
          width={[0.72, 0.55, 0.8, 0.34][row]! * (W - 24)}
          height={6}
          rx={3}
          fill={C.line}
          opacity={0.4}
        />
      ))}
      {/* the caret */}
      <rect x={X + 12 + 0.34 * (W - 24) + 3} y={Y + barH + 14 + 3 * 16 - 3} width={1.5} height={12} fill={C.content} />

      {/* labels */}
      <text x={X + W + 8} y={Y + barH / 2 + 3} className="bpLabel" fill={C.faint}>
        {t(m.bpToolbarRow)}
      </text>
      <text x={X + W + 8} y={Y + barH + 40} className="bpLabel" fill={C.faint}>
        {t(m.bpEditorArea)}
      </text>
      <text x={btnX(PRESSED) + btn / 2} y={Y - 8} textAnchor="middle" className="bpLabel" fill={C.faint}>
        {t(m.bpPressedControl)}
      </text>
      <text x={X - 8} y={Y + barH / 2 + 3} textAnchor="end" className="bpLabel" fill={C.faint}>
        {t(m.bpMarkControl)}
      </text>
      <text x={X - 8} y={Y + barH + 74} textAnchor="end" className="bpLabel" fill={C.faint}>
        {t(m.bpBlockControl)}
      </text>

      {/* dimensions: the gap between two controls */}
      {gap && <HDim x1={btnX(0) + btn} x2={btnX(1)} y={Y + barH + areaH + 22} label={gap} above={false} />}

      <BpTitle />
      <Foot y={H - 12} parts={[radius && `${t(m.bpRadius)}: ${radius}`, padding && `${t(m.bpPadding)}: ${padding}`]} />
    </svg>
  );
}

// CardFan: the track with its fixed ends, the cards distributed across it by
// weight, and the bulge the pointer opens.
function CardFanBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const gap = fmt(dimensions?.gap);

  const H = 250;
  const X = 44;
  const W = 312;
  const BASE = 186;

  const COUNT = 11;
  const CARD_W = 34;
  const CARD_H = 50;
  // Focused just right of centre, so the drawing shows a bulge rather than the
  // symmetric resting state — the asymmetry is the thing worth drawing.
  const FOCUS = 6.2;
  const placements = fanPlacements(COUNT, FOCUS, CARD_W, fanSlinky(COUNT));
  const track = W - CARD_W;

  return (
    <svg viewBox={`0 0 400 ${H}`} className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheCardFan)}>
      <Defs />

      {/* The track: a fixed length, drawn because it is the thing that does not
          move however many cards sit on it. */}
      <line x1={X} y1={BASE + 14} x2={X + W} y2={BASE + 14} stroke={C.edge} strokeWidth={1} strokeDasharray="3 3" />
      <line x1={X} y1={BASE + 9} x2={X} y2={BASE + 19} stroke={C.line} strokeWidth={1.5} />
      <line x1={X + W} y1={BASE + 9} x2={X + W} y2={BASE + 19} stroke={C.line} strokeWidth={1.5} />
      <text x={X + W / 2} y={BASE + 30} textAnchor="middle" className="bpLabel" fill={C.faint}>
        {t(m.bpFixedTrack)}
      </text>

      {placements.map((placement, index) => {
        const x = X + placement.offset * track;
        const y = BASE - CARD_H + placement.lift;
        const focused = Math.abs(index - FOCUS) < 0.6;
        return (
          <g key={index} transform={`rotate(${placement.rotate} ${x + CARD_W / 2} ${y + CARD_H})`}>
            <rect
              x={x}
              y={focused ? y - 10 : y}
              width={CARD_W}
              height={CARD_H}
              rx={4}
              fill={focused ? C.fill : C.content}
              fillOpacity={focused ? 1 : 0.22}
              stroke={focused ? C.line : C.edge}
              strokeWidth={focused ? 1.5 : 1}
            />
          </g>
        );
      })}

      {/* What the pointer is doing to the fan. */}
      <text x={X + W * 0.62} y={54} textAnchor="middle" className="bpLabel" fill={C.faint}>
        {t(m.bpFocusOpens)}
      </text>
      {/* Anchored at the start rather than hung off the left end: the track
          leaves only ~44 units of margin there, and the label is wider. */}
      <text x={X} y={54} className="bpLabel" fill={C.faint}>
        {t(m.bpEndsPinned)}
      </text>

      <BpTitle />
      <Foot y={H - 12} parts={[radius && `${t(m.bpRadius)}: ${radius}`, gap && `${t(m.bpGap)}: ${gap}`]} />
    </svg>
  );
}

// ColorPicker: the swatch, the three channel tracks each carrying the gradient
// it traverses, the hex field, and a preset row with one entry ringed.
function ColorPickerBlueprint({ dimensions }: BlueprintProps) {
  const uid = useId();
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const gap = fmt(dimensions?.gap);
  const trackHeight = fmt(dimensions?.trackHeight);

  const H = 268;
  const X = 118;
  const W = 164;
  const Y = 42;

  const swatchH = 44;
  const trackH = 9;
  const trackGap = 16;
  const tracksY = Y + swatchH + 16;
  const fieldY = tracksY + 3 * trackGap + 10;
  const presetY = fieldY + 30;

  // Each track shows a run of steps, standing for the gradient it traverses.
  const STEPS = 8;
  const stepW = W / STEPS;

  return (
    <svg viewBox={`0 0 400 ${H}`} className="bpSvg" role="img" aria-label={t(m.bpBlueprintOfTheColorPicker)}>
      <Defs />

      {/* the swatch, with its value written on it */}
      <rect x={X} y={Y} width={W} height={swatchH} rx={5} fill={C.fill} stroke={C.line} strokeWidth={1.5} />
      <rect x={X + W - 46} y={Y + swatchH - 15} width={38} height={7} rx={3.5} fill={C.content} opacity={0.8} />
      <text x={X - 8} y={Y + swatchH / 2 + 3} textAnchor="end" className="bpLabel" fill={C.faint}>
        {t(m.bpSwatchArea)}
      </text>

      {/* the three channel tracks, drawn as graded runs */}
      {[0, 1, 2].map((row) => {
        const y = tracksY + row * trackGap;
        // The run is built from square steps but the track is a pill, so the
        // first and last step overhang the rounded caps. Clipping to the same
        // rounded rect the outline draws is what makes the gradient end where
        // the track does. The id is scoped to this instance: every blueprint on
        // the overview shares one document, and a fixed id there would have
        // every copy clip to whichever rendered first.
        const clipId = `${uid}-cpTrack${row}`;
        return (
          <g key={row}>
            <clipPath id={clipId}>
              <rect x={X} y={y} width={W} height={trackH} rx={trackH / 2} />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
            {Array.from({ length: STEPS }, (_, i) => (
              <rect
                key={i}
                x={X + i * stepW}
                y={y}
                width={stepW}
                height={trackH}
                fill={C.content}
                // A ramp across the run, so the track reads as a gradient
                opacity={0.15 + (i / (STEPS - 1)) * 0.7}
              />
            ))}
            </g>
            {/* Outside the clip: a stroke centred on the edge would lose its
                outer half to it, leaving the track a hairline thinner than the
                real control's. */}
            <rect x={X} y={y} width={W} height={trackH} rx={trackH / 2} fill="none" stroke={C.edge} strokeWidth={1} />
            {/* the thumb: a ring, so the colour under it stays visible */}
            <circle
              cx={X + [0.62, 0.4, 0.75][row]! * W}
              cy={y + trackH / 2}
              r={6}
              fill="none"
              stroke={C.line}
              strokeWidth={2}
            />
          </g>
        );
      })}
      <text x={X - 8} y={tracksY + trackGap + trackH} textAnchor="end" className="bpLabel" fill={C.faint}>
        {t(m.bpChannelSliders)}
      </text>

      {/* the hex field */}
      <rect x={X} y={fieldY} width={W * 0.66} height={18} rx={4} fill="none" stroke={C.line} strokeWidth={1.25} />
      <rect x={X + 8} y={fieldY + 6} width={44} height={6} rx={3} fill={C.line} opacity={0.5} />
      <text x={X + W + 8} y={fieldY + 13} className="bpLabel" fill={C.faint}>
        {t(m.bpHexField)}
      </text>

      {/* the preset row, with the in-use entry ringed */}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect
            x={X + i * 22}
            y={presetY}
            width={16}
            height={16}
            rx={4}
            fill={C.content}
            opacity={0.3 + i * 0.1}
          />
          {i === 1 && (
            <rect
              x={X + i * 22 - 2.5}
              y={presetY - 2.5}
              width={21}
              height={21}
              rx={6}
              fill="none"
              stroke={C.line}
              strokeWidth={1.5}
            />
          )}
        </g>
      ))}
      <text x={X - 8} y={presetY + 12} textAnchor="end" className="bpLabel" fill={C.faint}>
        {t(m.bpPresetRow)}
      </text>

      {/* dimensions: the gap between two channel tracks */}
      {gap && <VDim x={X + W + 42} y1={tracksY + trackH} y2={tracksY + trackGap} label={gap} />}

      <BpTitle />
      <Foot
        y={H - 12}
        parts={[radius && `${t(m.bpRadius)}: ${radius}`, trackHeight && `${t(m.bpTrack)}: ${trackHeight}`]}
      />
    </svg>
  );
}

// ---- the message core ---------------------------------------------------
//
// Four figures for the four surviving chat components. Everything that is a
// real measurement is read from the shared modules rather than eyeballed: the
// delivery silhouettes come from `deliveryGlyph`, the bubble corners from
// `bubbleCorners`, the tail from `messageTail`, the run slots from
// `bubblePosition`, and the provisional alpha from the spec. Only the
// schematic pixel scale is invented here, and the labels carry the real values.

/**
 * TODO(i18n): these belong in apps/docs/src/i18n.ts beside the other `bp*`
 * labels; they are authored here so the figures compile standalone, and every
 * key is listed in the handoff ready to be pasted in verbatim.
 */
const bpm = defineMessages({
  bpBlueprintOfTheDeliveryStatus: { en: 'Blueprint of the Delivery Status', es: 'Plano del estado de entrega', fr: 'Plan de l’état de remise', de: 'Bauplan des Zustellstatus', ja: '配信ステータスの設計図', pt: 'Planta do estado de entrega', zh: '送达状态蓝图', ar: 'مخطّط حالة التسليم' },
  bpBlueprintOfTheMessageBubble: { en: 'Blueprint of the Message Bubble', es: 'Plano de la burbuja de mensaje', fr: 'Plan de la bulle de message', de: 'Bauplan der Nachrichtenblase', ja: 'メッセージバブルの設計図', pt: 'Planta do balão de mensagem', zh: '消息气泡蓝图', ar: 'مخطّط فقاعة الرسالة' },
  bpBlueprintOfTheMessageGroup: { en: 'Blueprint of the Message Group', es: 'Plano del grupo de mensajes', fr: 'Plan du groupe de messages', de: 'Bauplan der Nachrichtengruppe', ja: 'メッセージグループの設計図', pt: 'Planta do grupo de mensagens', zh: '消息分组蓝图', ar: 'مخطّط مجموعة الرسائل' },
  bpBlueprintOfTheConversationView: { en: 'Blueprint of the Conversation View', es: 'Plano de la vista de conversación', fr: 'Plan de la vue de conversation', de: 'Bauplan der Unterhaltungsansicht', ja: '会話ビューの設計図', pt: 'Planta da vista de conversa', zh: '会话视图蓝图', ar: 'مخطّط عرض المحادثة' },
  bpShapeNotColour: { en: 'shape, not colour', es: 'forma, no color', fr: 'la forme, pas la couleur', de: 'Form, nicht Farbe', ja: '色ではなく形', pt: 'forma, não cor', zh: '靠形状，不靠颜色', ar: 'الشكل لا اللون' },
  bpGlyphBox: { en: 'glyph box', es: 'caja del glifo', fr: 'boîte du glyphe', de: 'Zeichenkasten', ja: 'グリフ枠', pt: 'caixa do glifo', zh: '字形框', ar: 'صندوق الرمز' },
  bpTranscriptColumn: { en: 'transcript column', es: 'columna de transcripción', fr: 'colonne de transcription', de: 'Verlaufsspalte', ja: '履歴の列', pt: 'coluna da transcrição', zh: '会话记录列', ar: 'عمود السجلّ' },
  bpTail: { en: 'tail', es: 'cola', fr: 'queue', de: 'Zipfel', ja: 'しっぽ', pt: 'cauda', zh: '尾巴', ar: 'ذيل' },
  bpAvatarOnce: { en: 'avatar (once)', es: 'avatar (una vez)', fr: 'avatar (une fois)', de: 'Avatar (einmal)', ja: 'アバター（1度）', pt: 'avatar (uma vez)', zh: '头像（一次）', ar: 'صورة (مرة)' },
  bpNameOnce: { en: 'name (once)', es: 'nombre (una vez)', fr: 'nom (une fois)', de: 'Name (einmal)', ja: '名前（1度）', pt: 'nome (uma vez)', zh: '姓名（一次）', ar: 'اسم (مرة)' },
  bpOneMetaLine: { en: 'one meta line', es: 'una línea meta', fr: 'une ligne méta', de: 'eine Meta-Zeile', ja: 'メタ行は1つ', pt: 'uma linha meta', zh: '一行元信息', ar: 'سطر بيانات واحد' },
  bpContinuedRun: { en: 'continued — no avatar, no name, gutter kept', es: 'continuada: sin avatar, sin nombre, canaleta conservada', fr: 'continuée — sans avatar, sans nom, gouttière conservée', de: 'fortgesetzt — kein Avatar, kein Name, Spalte bleibt', ja: '継続 ― アバターも名前もなし、余白列は保持', pt: 'continuada — sem avatar, sem nome, goteira mantida', zh: '续接——无头像、无姓名，保留栏位', ar: 'متواصلة — بلا صورة ولا اسم، مع إبقاء العمود' },
  bpAuthorship: { en: 'authorship', es: 'autoría', fr: 'paternité', de: 'Urheberschaft', ja: '作者', pt: 'autoria', zh: '作者身份', ar: 'النسبة' },
  bpAcknowledgement: { en: 'acknowledgement', es: 'acuse', fr: 'accusé', de: 'Bestätigung', ja: '承認', pt: 'reconhecimento', zh: '确认状态', ar: 'الإقرار' },
  bpRemote: { en: 'remote', es: 'remoto', fr: 'distant', de: 'entfernt', ja: 'リモート', pt: 'remoto', zh: '远端', ar: 'بعيدة' },
  bpLocal: { en: 'local', es: 'local', fr: 'local', de: 'lokal', ja: 'ローカル', pt: 'local', zh: '本地', ar: 'محلّية' },
  bpNoTick: { en: 'no tick, ever', es: 'nunca una marca', fr: 'jamais de coche', de: 'nie ein Haken', ja: 'チェックは決してなし', pt: 'nunca um visto', zh: '绝无对钩', ar: 'لا علامة أبدًا' },
  bpConfirmed: { en: 'confirmed', es: 'confirmado', fr: 'confirmé', de: 'bestätigt', ja: '確定済み', pt: 'confirmado', zh: '已确认', ar: 'مؤكَّدة' },
  bpOptimistic: { en: 'optimistic', es: 'optimista', fr: 'optimiste', de: 'optimistisch', ja: '楽観的', pt: 'otimista', zh: '乐观', ar: 'متفائلة' },
  bpFailedRun: { en: 'failed', es: 'fallido', fr: 'échoué', de: 'fehlgeschlagen', ja: '失敗', pt: 'falhado', zh: '失败', ar: 'فاشلة' },
  bpScroller: { en: 'scroller', es: 'desplazador', fr: 'défileur', de: 'Scroller', ja: 'スクローラー', pt: 'deslocador', zh: '滚动容器', ar: 'الممرِّر' },
  bpProvisional: { en: 'provisional', es: 'provisional', fr: 'provisoire', de: 'vorläufig', ja: '暫定', pt: 'provisório', zh: '暂定', ar: 'مؤقّتة' },
  bpMaxWidth: { en: 'max width', es: 'ancho máx.', fr: 'largeur max', de: 'max. Breite', ja: '最大幅', pt: 'largura máx.', zh: '最大宽度', ar: 'أقصى عرض' },
});

/**
 * A rounded rectangle whose four corners differ, which `<rect rx>` cannot draw.
 * The radii arrive as schematic pixels resolved from the token names
 * `bubbleCorners` returned, so the figure follows the shared function rather
 * than a shape typed in by eye.
 */
function cornerRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: { tl: number; tr: number; br: number; bl: number },
): string {
  return [
    `M ${x + r.tl} ${y}`,
    `H ${x + w - r.tr}`,
    r.tr ? `A ${r.tr} ${r.tr} 0 0 1 ${x + w} ${y + r.tr}` : `L ${x + w} ${y}`,
    `V ${y + h - r.br}`,
    r.br ? `A ${r.br} ${r.br} 0 0 1 ${x + w - r.br} ${y + h}` : `L ${x + w} ${y + h}`,
    `H ${x + r.bl}`,
    r.bl ? `A ${r.bl} ${r.bl} 0 0 1 ${x} ${y + h - r.bl}` : `L ${x} ${y + h}`,
    `V ${y + r.tl}`,
    r.tl ? `A ${r.tl} ${r.tl} 0 0 1 ${x + r.tl} ${y}` : `L ${x} ${y}`,
    'Z',
  ].join(' ');
}

/** The schematic pixel each corner token draws at. The names come from commons. */
const CORNER_PX: Record<string, number> = {
  'radius-xl': 11,
  'radius-xs': 3,
  'radius-none': 0,
};

const cornerPx = (token: string): number => CORNER_PX[token] ?? 6;

/** A bubble's four corners in physical order, for a trailing-edge run in LTR. */
function bubbleRadii(position: BubblePosition, tail: boolean) {
  const c = bubbleCorners(position, 'end', tail);
  // `end` in a left-to-right figure: inline-start is left, inline-end is right.
  return {
    tl: cornerPx(c.startStart),
    tr: cornerPx(c.startEnd),
    bl: cornerPx(c.endStart),
    br: cornerPx(c.endEnd),
  };
}

/**
 * One delivery silhouette, drawn in a 24-unit box and scaled to `s`.
 *
 * The status-to-shape decision is `deliveryGlyph`'s, exactly as it is in both
 * kits; only the strokes for each shape name live here, because that is the one
 * part a drawing has to own.
 */
function DeliveryMark({ shape, x, y, s }: { shape: DeliveryGlyph; x: number; y: number; s: number }) {
  const k = s / 24;
  const g = (children: ReactElement) => (
    <g
      transform={`translate(${x} ${y}) scale(${k})`}
      fill="none"
      stroke={C.line}
      // Authored in the 24-unit glyph space, so it scales with the box the way
      // the real icon's stroke does.
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </g>
  );
  switch (shape) {
    case 'clock':
      return g(
        <>
          <circle cx={12} cy={12} r={9} />
          <path d="M12 7 v5 l3.5 2" />
        </>,
      );
    case 'check':
      return g(<path d="M20 7 L9.5 17.5 L4 12" />);
    case 'double-check':
      return g(
        <>
          <path d="M2 12.5 L7 17.5 L17 7" />
          <path d="M22 8.5 L14 17 L12.6 15.6" />
        </>,
      );
    case 'check-circle':
      // Solid mass against the bare strokes of `double-check`: the two differ by
      // fill as well as by hue, which is the whole point of the table.
      return (
        <g transform={`translate(${x} ${y}) scale(${k})`}>
          <circle cx={12} cy={12} r={9} fill={C.line} stroke="none" />
          <path
            d="M8 12.2 L11 15 L16.2 9"
            fill="none"
            stroke={C.fill}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    case 'alert':
    default:
      return g(
        <>
          <path d="M12 3.5 L21.5 20 L2.5 20 Z" />
          <path d="M12 10 v4.2" />
          <path d="M12 17.4 v0.4" />
        </>,
      );
  }
}

/**
 * DeliveryStatus: the five states side by side, each in its own glyph box, so
 * the claim the component exists to hold — no two states share a silhouette —
 * is a thing you can check by looking rather than a sentence you have to trust.
 */
function DeliveryStatusBlueprint({ size, dimensions }: BlueprintProps) {
  const t = useT();
  const iconSize = fmt(size.iconSize) ?? fmt(size.diameter);
  const fontSize = fmt(size.fontSize);
  const stroke = fmt(dimensions?.stroke);

  const S = 40;
  const PITCH = 64;
  const X0 = (400 - (deliveryStatuses.length * S + (deliveryStatuses.length - 1) * (PITCH - S))) / 2;
  const Y = 78;
  const GLYPH = 28;

  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={t(bpm.bpBlueprintOfTheDeliveryStatus)}>
      <Defs />
      <BpTitle />
      <text x={16} y={46} className="bpLabel" fill={C.faint}>
        {t(bpm.bpShapeNotColour)}
      </text>

      {deliveryStatuses.map((status, i) => {
        const x = X0 + i * PITCH;
        return (
          <g key={status}>
            <rect
              x={x}
              y={Y}
              width={S}
              height={S}
              rx={7}
              fill={C.fill}
              stroke={C.edge}
              strokeWidth={1.25}
              strokeDasharray="4 3"
            />
            <DeliveryMark shape={deliveryGlyph(status)} x={x + (S - GLYPH) / 2} y={Y + (S - GLYPH) / 2} s={GLYPH} />
            {/* The status name, not a translation: it is the prop value. */}
            <text x={x + S / 2} y={Y + S + 16} textAnchor="middle" className="bpLabel bpMuted">
              {status}
            </text>
          </g>
        );
      })}

      {/* the glyph box, dimensioned once — every state draws in the same square */}
      <HDim x1={X0} x2={X0 + S} y={Y + S + 32} label={iconSize ?? t(m.bpAuto)} above={false} />
      <text x={X0 + S + 12} y={Y + S + 36} className="bpLabel" fill={C.faint}>
        {t(bpm.bpGlyphBox)}
      </text>

      <Foot
        y={212}
        parts={[
          stroke && `${t(m.bpStroke)}: ${stroke}`,
          fontSize && `${t(m.bpFont)}: ${fontSize}`,
          'read: accent-text',
          'failed: danger-text',
        ]}
      />
    </svg>
  );
}

/**
 * MessageBubble: a run of three on the trailing edge, drawn with the radii
 * `bubbleCorners` actually returns and the tail `messageTail` actually defines,
 * so the figure cannot drift from the geometry it documents. The three corners
 * worth naming all land on the same edge, which is why the callouts stack down
 * the trailing side.
 */
function MessageBubbleBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const radius = fmt(dimensions?.radius);
  const stackedRadius = fmt(dimensions?.stackedRadius);
  const tailRadius = fmt(dimensions?.tailRadius);
  const padInline = fmt(dimensions?.paddingInline);
  const padBlock = fmt(dimensions?.paddingBlock);
  const gap = fmt(dimensions?.gap);
  const maxWidth = fmt(dimensions?.maxWidth) ?? BUBBLE_MAX_WIDTH;

  // Taller than the usual 224: three stacked bubbles plus a meta line and the
  // corner callouts need the room, and the frame scales to the viewBox.
  const H = 320;

  const CX = 40;
  const CW = 256;
  const CY = 52;
  const CH = 176;
  const PAD = 14;
  const RX = CX + CW - PAD; // the trailing edge the run hugs

  const CAP = Math.round(CW * (Number.parseFloat(maxWidth) / 100 || 0.72));
  const BH = 34;
  const BGAP = 7;
  const widths = [130, CAP, 104];
  const tops = widths.map((_unused, i) => CY + 24 + i * (BH + BGAP));

  // The tail's own numbers, scaled once into the schematic.
  const TAIL_K = 1.4;
  const tailW = messageTail.width * TAIL_K;
  const tailH = messageTail.height * TAIL_K;
  const lastTop = tops[2] as number;

  return (
    <svg viewBox={`0 0 400 ${H}`} className="bpSvg" role="img" aria-label={t(bpm.bpBlueprintOfTheMessageBubble)}>
      <Defs />
      <BpTitle />

      {/* the column a bubble is a share of; the empty remainder is what keeps
          alignment readable, so it is drawn rather than implied */}
      <rect x={CX} y={CY} width={CW} height={CH} rx={10} fill="none" stroke={C.edge} strokeWidth={1.25} strokeDasharray="4 3" />
      <text x={CX} y={CY - 8} className="bpLabel" fill={C.faint}>
        {t(bpm.bpTranscriptColumn)}
      </text>

      {widths.map((w, i) => {
        const position = bubblePosition(i, widths.length);
        const last = i === widths.length - 1;
        const top = tops[i] as number;
        const x = RX - w;
        return (
          <g key={position + String(i)}>
            <path
              d={cornerRect(x, top, w, BH, bubbleRadii(position, last))}
              fill={C.fill}
              stroke={C.edge}
              strokeWidth={1.5}
            />
            <Ln x={x + 12} y={top + BH / 2 - 3} w={Math.min(w - 24, 96)} op={0.5} />
          </g>
        );
      })}

      {/* the tail, from the shared path: its inline-start edge sits on the
          bubble's outer edge and its baseline is flush with the bubble's bottom,
          which is exactly how the stylesheet places it */}
      <g transform={`translate(${RX} ${lastTop + BH - tailH}) scale(${TAIL_K})`}>
        <path d={messageTail.path} fill={C.fill} stroke={C.edge} strokeWidth={1.5 / TAIL_K} />
      </g>

      {/* the run's single meta line, under the message that ends it */}
      <Ln x={RX - 40} y={lastTop + BH + 12} w={40} h={6} op={0.4} />
      <text x={RX - 48} y={lastTop + BH + 18} textAnchor="end" className="bpLabel" fill={C.faint}>
        {t(m.bpMeta)}
      </text>

      {/* the three corners worth naming, all on the trailing edge, called out
          clear of the column so no label crosses a drawn shape */}
      {radius && (
        <>
          <line x1={RX + 2} y1={(tops[0] as number) + 3} x2={CX + CW + 14} y2={(tops[0] as number) + 3} stroke={C.line} strokeWidth={1} />
          <text x={CX + CW + 18} y={(tops[0] as number) + 6} className="bpLabel">{radius}</text>
        </>
      )}
      {stackedRadius && (
        <>
          <line x1={RX + 2} y1={(tops[1] as number) + 2} x2={CX + CW + 14} y2={(tops[1] as number) + 2} stroke={C.line} strokeWidth={1} />
          <text x={CX + CW + 18} y={(tops[1] as number) + 5} className="bpLabel">{stackedRadius}</text>
        </>
      )}
      {tailRadius && (
        <>
          <line x1={RX + tailW + 2} y1={lastTop + BH} x2={CX + CW + 14} y2={lastTop + BH + 14} stroke={C.line} strokeWidth={1} />
          <text x={CX + CW + 18} y={lastTop + BH + 17} className="bpLabel">{tailRadius}</text>
        </>
      )}
      <text x={CX + CW + 18} y={lastTop + BH + 30} className="bpLabel bpMuted">{t(bpm.bpTail)}</text>

      {/* The in-run gap, on the leading side where the column is empty. Rotated
          rather than laid flat: a flat `space-1` beside a line this far left
          runs off the viewBox, and a rotated label is the drafting convention
          for a tight dimension anyway. */}
      {gap && <VDim x={CX - 14} y1={(tops[0] as number) + BH} y2={tops[1] as number} label={gap} />}

      {/* what a bubble may grow to, measured against the column it sits in */}
      <HDim x1={RX - CAP} x2={RX} y={CY + CH + 16} label={`${t(bpm.bpMaxWidth)} ${maxWidth}`} above={false} />

      <Foot
        y={H - 12}
        parts={[
          padInline && `${t(m.bpPadding)}: ${padInline} / ${padBlock ?? ''}`.trim(),
          `${t(bpm.bpTail)}: ${messageTail.width}×${messageTail.height}px`,
        ]}
      />
    </svg>
  );
}

/**
 * MessageGroup: the head of a run above the continued half of one, so the thing
 * the `continued` flag actually does — suppress the avatar and the name while
 * keeping the gutter reserved — is visible as a difference between two figures
 * rather than described in a caption.
 */
function MessageGroupBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const gap = fmt(dimensions?.gap);
  const gutterGap = fmt(dimensions?.gutterGap);
  const lineGap = fmt(dimensions?.lineGap);
  const gutter = fmt(dimensions?.gutter);
  const rowGutter = fmt(dimensions?.rowGutter);

  const H = 320;

  const GX = 90; // the gutter's leading edge
  const G = 30; // the gutter's width
  const SX = GX + G + 8; // the stack, one gutter-gap along
  const SW = 210;
  const BH = 30;
  const BGAP = 7;

  /** One run: two bubbles on the leading edge, a meta line under them. */
  const run = (top: number, header: boolean) => {
    const bubbleTop = header ? top + 16 : top;
    const tops = [bubbleTop, bubbleTop + BH + BGAP];
    const widths = [SW - 40, SW - 90];
    return { tops, widths, bottom: (tops[1] as number) + BH };
  };

  const a = run(60, true);
  const b = run(a.bottom + 34, false);

  const bubbles = (r: ReturnType<typeof run>) => (
    <>
      {r.tops.map((top, i) => {
        const position = bubblePosition(i, 2);
        const last = i === 1;
        const c = bubbleCorners(position, 'start', last);
        return (
          <g key={String(top)}>
            <path
              d={cornerRect(SX, top, r.widths[i] as number, BH, {
                tl: cornerPx(c.startStart),
                tr: cornerPx(c.startEnd),
                bl: cornerPx(c.endStart),
                br: cornerPx(c.endEnd),
              })}
              fill={C.fill}
              stroke={C.edge}
              strokeWidth={1.5}
            />
            <Ln x={SX + 12} y={top + BH / 2 - 3} w={(r.widths[i] as number) - 26} op={0.5} />
          </g>
        );
      })}
      {/* The tail the run ends on, drawn from the shared path and mirrored by
          `tailScaleX` rather than by a second hand-authored `d` — which is also
          why the bottom-leading corner of that bubble is square. */}
      <g
        transform={`translate(${SX} ${r.bottom - messageTail.height}) scale(${tailScaleX('start')} 1)`}
      >
        <path d={messageTail.path} fill={C.fill} stroke={C.edge} strokeWidth={1.5} />
      </g>
    </>
  );

  return (
    <svg viewBox={`0 0 400 ${H}`} className="bpSvg" role="img" aria-label={t(bpm.bpBlueprintOfTheMessageGroup)}>
      <Defs />
      <BpTitle />

      {/* ---- the head of a run ---- */}
      <Ln x={SX} y={60} w={70} h={8} op={0.75} />
      <text x={SX + 78} y={67} className="bpLabel" fill={C.faint}>
        {t(bpm.bpNameOnce)}
      </text>
      {bubbles(a)}
      {/* In a bubble transcript the avatar belongs to the END of the run, beside
          the message the tail points out of — that is what the author just sent. */}
      <circle cx={GX + G / 2} cy={a.bottom - G / 2} r={G / 2} fill={C.content} fillOpacity={0.3} stroke={C.edge} strokeWidth={1.25} />
      <text x={GX - 8} y={a.bottom - G / 2 + 3} textAnchor="end" className="bpLabel" fill={C.faint}>
        {t(bpm.bpAvatarOnce)}
      </text>
      <Ln x={SX} y={a.bottom + 10} w={34} h={6} op={0.4} />
      <text x={SX + 42} y={a.bottom + 16} className="bpLabel" fill={C.faint}>
        {t(bpm.bpOneMetaLine)}
      </text>

      {/* ---- the same run, continued ---- */}
      {bubbles(b)}
      {/* Reserved even when empty: the messages in a continued run have to land
          on the same line as the ones above them. */}
      <circle
        cx={GX + G / 2}
        cy={b.bottom - G / 2}
        r={G / 2}
        fill="none"
        stroke={C.edge}
        strokeWidth={1.25}
        strokeDasharray="3 3"
      />
      <text x={GX - 8} y={b.bottom - G / 2 + 3} textAnchor="end" className="bpLabel bpMuted">
        {t(m.bpGutter)}
      </text>
      <Ln x={SX} y={b.bottom + 10} w={34} h={6} op={0.4} />
      <text x={GX} y={b.bottom + 34} className="bpLabel" fill={C.faint}>
        {t(bpm.bpContinuedRun)}
      </text>

      {/* the gutter's width — it must be exactly the avatar's diameter, or the
          two halves of a split run stop lining up */}
      {gutter && <HDim x1={GX} x2={GX + G} y={a.bottom + 40} label={gutter} />}

      {/* the tight gap inside a run, on the trailing side where nothing else is */}
      {gap && <VDim x={SX + SW + 22} y1={(a.tops[0] as number) + BH} y2={a.tops[1] as number} label={gap} />}

      {/* The dimension names are the spec's own keys, so they stay in code font
          rather than being translated into something a reader cannot grep for. */}
      <Foot
        y={H - 12}
        parts={[
          gutterGap && `gutterGap: ${gutterGap}`,
          lineGap && `lineGap: ${lineGap}`,
          rowGutter && `rowGutter: ${rowGutter}`,
        ]}
      />
    </svg>
  );
}

/**
 * ConversationView: the two axes, drawn as two independent columns of labels
 * either side of one thread. Authorship decides which edge a run hugs; the
 * acknowledgement decides only whether it steps back — and the remote run, at
 * the top, carries no delivery mark at all, which is the invariant the whole
 * component exists to hold.
 */
function ConversationViewBlueprint({ dimensions }: BlueprintProps) {
  const t = useT();
  const gap = fmt(dimensions?.gap);
  const padInline = fmt(dimensions?.paddingInline);
  const padBlock = fmt(dimensions?.paddingBlock);
  const provisional = fmt(dimensions?.provisionalOpacity) ?? '0.65';
  // A real number from the spec, not a guess: the figure fades by exactly the
  // alpha the component does.
  const provisionalAlpha = Number.parseFloat(provisional) || 0.65;

  const H = 350;
  const SX = 70;
  const SW = 228;
  const SY = 48;
  const SH = 248;
  const PAD = 12;
  const inX = SX + PAD;
  const inRight = SX + SW - PAD;

  const BH = 26;
  const remote = [
    { x: inX, y: 62, w: 110 },
    { x: inX, y: 93, w: 88 },
  ];
  /** The local runs, one per point on the acknowledgement axis. */
  const local = [
    { y: 135, w: 104, status: 'read' as const, label: t(bpm.bpConfirmed), alpha: 1, strong: false },
    { y: 189, w: 88, status: 'sending' as const, label: t(bpm.bpOptimistic), alpha: provisionalAlpha, strong: false },
    { y: 243, w: 118, status: 'failed' as const, label: t(bpm.bpFailedRun), alpha: 1, strong: true },
  ];

  return (
    <svg viewBox={`0 0 400 ${H}`} className="bpSvg" role="img" aria-label={t(bpm.bpBlueprintOfTheConversationView)}>
      <Defs />
      <BpTitle />

      {/* the two axes, named once each, on opposite sides of the thread */}
      <text x={SX - 6} y={40} textAnchor="end" className="bpLabel" fill={C.faint}>
        {t(bpm.bpAuthorship)}
      </text>
      <text x={SX + SW + 8} y={40} className="bpLabel" fill={C.faint}>
        {t(bpm.bpAcknowledgement)}
      </text>

      {/* the scroller: it owns the overflow, and nothing else */}
      <rect x={SX} y={SY} width={SW} height={SH} rx={10} fill="none" stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      <text x={SX + 6} y={40} className="bpLabel bpMuted">
        {t(bpm.bpScroller)}
      </text>

      {/* a remote run: the leading edge, and no delivery mark anywhere on it */}
      {remote.map((b, i) => {
        const c = bubbleCorners(bubblePosition(i, remote.length), 'start', i === remote.length - 1);
        return (
          <path
            key={b.y}
            d={cornerRect(b.x, b.y, b.w, BH, {
              tl: cornerPx(c.startStart),
              tr: cornerPx(c.startEnd),
              bl: cornerPx(c.endStart),
              br: cornerPx(c.endEnd),
            })}
            fill={C.fill}
            stroke={C.edge}
            strokeWidth={1.5}
          />
        );
      })}
      <g
        transform={`translate(${inX} ${(remote[1] as { y: number }).y + BH - messageTail.height}) scale(${tailScaleX('start')} 1)`}
      >
        <path d={messageTail.path} fill={C.fill} stroke={C.edge} strokeWidth={1.5} />
      </g>
      <text x={SX - 6} y={98} textAnchor="end" className="bpLabel">
        {t(bpm.bpRemote)}
      </text>
      <text x={SX + SW + 8} y={98} className="bpLabel">
        {t(bpm.bpNoTick)}
      </text>

      {/* the local runs, one per point on the acknowledgement axis */}
      {local.map((run) => {
        const c = bubbleCorners('only', 'end', true);
        const x = inRight - run.w;
        return (
          <g key={run.status} opacity={run.alpha}>
            <path
              d={cornerRect(x, run.y, run.w, BH, {
                tl: cornerPx(c.startStart),
                tr: cornerPx(c.startEnd),
                bl: cornerPx(c.endStart),
                br: cornerPx(c.endEnd),
              })}
              fill={C.content}
              fillOpacity={0.28}
              stroke={C.line}
              // A failed send keeps full strength and takes a heavier edge: it is
              // the one row in a transcript that asks to be acted on, so quieting
              // it would be the exact wrong move.
              strokeWidth={run.strong ? 2.5 : 1.25}
            />
            <g transform={`translate(${inRight} ${run.y + BH - messageTail.height}) scale(${tailScaleX('end')} 1)`}>
              <path d={messageTail.path} fill={C.content} fillOpacity={0.28} stroke={C.line} strokeWidth={1.25} />
            </g>
            {/* the run's single delivery mark, on the edge the run hugs */}
            <DeliveryMark shape={deliveryGlyph(run.status)} x={inRight - 13} y={run.y + BH + 4} s={13} />
            <text x={SX - 6} y={run.y + BH / 2 + 3} textAnchor="end" className="bpLabel">
              {t(bpm.bpLocal)}
            </text>
            <text x={SX + SW + 8} y={run.y + BH / 2 + 3} className="bpLabel">
              {run.label}
            </text>
          </g>
        );
      })}

      {/* the gap BETWEEN runs, wider than the one inside a run — that difference
          is the whole grouping signal, so it is the measurement worth drawing */}
      {gap && <VDim x={SX + 8} y1={119} y2={135} label={gap} horizontal />}

      {/* The thread's own padding, measured off the scroller's edge. Named as
          well as valued, because it happens to resolve to the same token as the
          run gap above it and two bare `space-4` labels would read as one
          measurement taken twice. */}
      {padInline && (
        <HDim x1={SX} x2={inX} y={SY + SH + 14} label={`${t(m.bpPadInline)}: ${padInline}`} above={false} />
      )}

      <Foot
        y={H - 12}
        parts={[padBlock && `${t(m.bpPaddingBlock)}: ${padBlock}`, `${t(bpm.bpProvisional)}: ${provisional}`]}
      />
    </svg>
  );
}

export function Blueprint({ size, dimensions, slots, shape, id, variant }: BlueprintProps & { variant?: 'mobile' }) {
  if (id === 'delivery-status') return withFrame(<DeliveryStatusBlueprint size={size} dimensions={dimensions} />);
  if (id === 'message-bubble') return withFrame(<MessageBubbleBlueprint size={size} dimensions={dimensions} />);
  if (id === 'message-group') return withFrame(<MessageGroupBlueprint size={size} dimensions={dimensions} />);
  if (id === 'conversation-view') return withFrame(<ConversationViewBlueprint size={size} dimensions={dimensions} />);
  if (id === 'card-fan') return withFrame(<CardFanBlueprint size={size} dimensions={dimensions} />);
  if (id === 'color-picker') return withFrame(<ColorPickerBlueprint size={size} dimensions={dimensions} />);
  if (id === 'rich-text-editor') return withFrame(<RichTextEditorBlueprint size={size} dimensions={dimensions} />);
  if (id === 'virtual-list') return withFrame(<VirtualListBlueprint size={size} dimensions={dimensions} />);
  if (id === 'sortable-list') return withFrame(<SortableListBlueprint size={size} dimensions={dimensions} />);
  if (id === 'calendar-view') return withFrame(<CalendarViewBlueprint size={size} dimensions={dimensions} />);
  if (id === 'command-palette') return withFrame(<CommandPaletteBlueprint size={size} dimensions={dimensions} />);
  if (shape === 'ring') return withFrame(<RingBlueprint size={size} />);
  if (shape === 'slider') return withFrame(<SliderBlueprint size={size} dimensions={dimensions} />);
  if (id === 'checkbox') return withFrame(<CheckboxBlueprint size={size} dimensions={dimensions} />);
  if (id === 'radio') return withFrame(<RadioBlueprint size={size} dimensions={dimensions} />);
  if (id === 'switch') return withFrame(<SwitchBlueprint size={size} dimensions={dimensions} />);
  if (id === 'seek-bar') return withFrame(<SeekBarBlueprint size={size} dimensions={dimensions} />);
  if (id === 'player-card') return withFrame(<PlayerCardBlueprint size={size} dimensions={dimensions} />);
  if (id === 'number-input') return withFrame(<NumberInputBlueprint size={size} dimensions={dimensions} />);
  if (id === 'radio-card') return withFrame(<RadioCardBlueprint size={size} dimensions={dimensions} />);
  if (id === 'search-field') return withFrame(<SearchFieldBlueprint size={size} dimensions={dimensions} />);
  if (id === 'callout') return withFrame(<CalloutBlueprint size={size} dimensions={dimensions} />);
  if (id === 'banner') return withFrame(<BannerBlueprint size={size} dimensions={dimensions} />);
  if (id === 'announcements') return withFrame(<AnnouncementsBlueprint size={size} dimensions={dimensions} />);
  if (id === 'meter') return withFrame(<MeterBlueprint size={size} dimensions={dimensions} />);
  if (id === 'segmented-bar') return withFrame(<SegmentedBarBlueprint size={size} dimensions={dimensions} />);
  if (id === 'icon') return withFrame(<IconBlueprint size={size} dimensions={dimensions} />);
  if (id === 'status-dot') return withFrame(<StatusDotBlueprint size={size} />);
  if (id === 'stat-tile') return withFrame(<StatTileBlueprint size={size} dimensions={dimensions} />);
  if (id === 'device-frame') return withFrame(<DeviceFrameBlueprint size={size} dimensions={dimensions} />);
  if (id === 'filter-chip') return withFrame(<FilterChipBlueprint size={size} dimensions={dimensions} />);
  if (id === 'image') return withFrame(<ImageBlueprint size={size} dimensions={dimensions} />);
  if (id === 'rating') return withFrame(<RatingBlueprint size={size} dimensions={dimensions} />);
  if (id === 'otp-field') return withFrame(<OtpFieldBlueprint size={size} dimensions={dimensions} />);
  // molecules
  if (id === 'field') return withFrame(<FieldBlueprint size={size} dimensions={dimensions} />);
  if (id === 'select') return withFrame(<SelectBlueprint size={size} dimensions={dimensions} />);
  if (id === 'list') return withFrame(<ListBlueprint size={size} dimensions={dimensions} />);
  if (id === 'combobox') return withFrame(<ComboboxBlueprint size={size} dimensions={dimensions} />);
  if (id === 'multi-select') return withFrame(<MultiSelectBlueprint size={size} dimensions={dimensions} />);
  if (id === 'segmented-control') return withFrame(<SegmentedControlBlueprint size={size} dimensions={dimensions} />);
  if (id === 'tabs') return withFrame(<TabsBlueprint size={size} dimensions={dimensions} />);
  if (id === 'tooltip') return withFrame(<TooltipBlueprint size={size} dimensions={dimensions} />);
  if (id === 'toast') return withFrame(<ToastBlueprint size={size} dimensions={dimensions} />);
  if (id === 'scroll-area') return withFrame(<ScrollAreaBlueprint size={size} dimensions={dimensions} />);
  if (id === 'carousel') return withFrame(<CarouselBlueprint size={size} dimensions={dimensions} />);
  if (id === 'heatmap') return withFrame(<HeatmapBlueprint size={size} dimensions={dimensions} />);
  if (id === 'spotlight') return withFrame(<SpotlightBlueprint size={size} dimensions={dimensions} />);
  if (id === 'breadcrumbs') return withFrame(<BreadcrumbsBlueprint size={size} dimensions={dimensions} />);
  if (id === 'pagination') return withFrame(<PaginationBlueprint size={size} dimensions={dimensions} />);
  if (id === 'accordion') return withFrame(<AccordionBlueprint size={size} dimensions={dimensions} />);
  if (id === 'table') return withFrame(<TableBlueprint size={size} dimensions={dimensions} />);
  if (id === 'data-grid') return withFrame(<DataGridBlueprint size={size} dimensions={dimensions} />);
  // structures
  if (id === 'page-header') return withFrame(<PageHeaderBlueprint size={size} dimensions={dimensions} />);
  if (id === 'section') return withFrame(<SectionBlueprint size={size} dimensions={dimensions} />);
  if (id === 'card-group') return withFrame(<CardGroupBlueprint size={size} dimensions={dimensions} />);
  if (id === 'timeline') return withFrame(<TimelineBlueprint size={size} dimensions={dimensions} />);
  if (id === 'wizard') return withFrame(<WizardBlueprint size={size} dimensions={dimensions} />);
  if (id === 'sparkline') return withFrame(<SparklineBlueprint size={size} dimensions={dimensions} />);
  if (id === 'timeline-scrubber') return withFrame(<TimelineScrubberBlueprint size={size} dimensions={dimensions} />);
  if (id === 'time-series-chart') return withFrame(<TimeSeriesChartBlueprint size={size} dimensions={dimensions} />);
  // organisms
  if (id === 'sidebar') return withFrame(<SidebarBlueprint size={size} dimensions={dimensions} />);
  if (id === 'toolbar') return withFrame(<ToolbarBlueprint size={size} dimensions={dimensions} />);
  if (id === 'nav-bar') return withFrame(<NavBarBlueprint size={size} dimensions={dimensions} />);
  if (id === 'fieldset') return withFrame(<FieldsetBlueprint size={size} dimensions={dimensions} />);
  if (id === 'form-section') return withFrame(<FormSectionBlueprint size={size} dimensions={dimensions} />);
  if (id === 'app-shell') return withFrame(
    variant === 'mobile'
      ? <AppShellMobileBlueprint size={size} dimensions={dimensions} />
      : <AppShellBlueprint size={size} dimensions={dimensions} />,
  );
  if (id === 'modal') return withFrame(<ModalBlueprint size={size} dimensions={dimensions} />);
  if (id === 'alert-dialog') return withFrame(<AlertDialogBlueprint size={size} dimensions={dimensions} />);
  if (id === 'drawer') return withFrame(<DrawerBlueprint size={size} dimensions={dimensions} />);
  if (id === 'calendar') return withFrame(<CalendarBlueprint size={size} dimensions={dimensions} />);
  if (id === 'date-picker') return withFrame(<DatePickerBlueprint size={size} dimensions={dimensions} />);
  if (id === 'popover') return withFrame(<PopoverBlueprint size={size} dimensions={dimensions} />);
  if (id === 'menu') return withFrame(<MenuBlueprint size={size} dimensions={dimensions} />);
  if (id === 'floating-panel') return withFrame(<FloatingPanelBlueprint size={size} dimensions={dimensions} />);
  if (id === 'tabbed-panel') return withFrame(<TabbedPanelBlueprint size={size} dimensions={dimensions} />);
  if (id === 'tabbed-modal') return withFrame(<TabbedModalBlueprint size={size} dimensions={dimensions} />);
  if (id === 'tab-strip') return withFrame(<TabStripBlueprint size={size} dimensions={dimensions} />);
  if (id === 'resizable-split-pane') return withFrame(<ResizableSplitPaneBlueprint size={size} dimensions={dimensions} />);
  if (id === 'progress-bar') return withFrame(<ProgressBarBlueprint size={size} dimensions={dimensions} />);
  if (id === 'steps') return withFrame(<StepsBlueprint size={size} dimensions={dimensions} />);
  if (id === 'divider') return withFrame(<DividerBlueprint size={size} dimensions={dimensions} />);
  if (id === 'code-block') return withFrame(<CodeBlockBlueprint size={size} dimensions={dimensions} />);
  if (id === 'skeleton') return withFrame(<SkeletonBlueprint size={size} dimensions={dimensions} />);
  if (id === 'textarea') return withFrame(<TextareaBlueprint size={size} dimensions={dimensions} />);
  if (size.diameter && !size.height) return withFrame(<CircleBlueprint size={size} id={id} />);
  if (size.thickness && !size.height && !size.diameter) return withFrame(<BarBlueprint size={size} dimensions={dimensions} />);
  return withFrame(<BoxBlueprint size={size} dimensions={dimensions} slots={slots} id={id} />);
}

const withFrame = (svg: ReactElement) => <div className="bpFrame">{svg}</div>;

/**
 * Looks a component up by spec id and draws a blueprint per declared size, or a
 * single one from its fixed dimensions when it has no sizes. Drop it into a
 * doc page to inspect that atom's exact geometry.
 */
export function ComponentBlueprint({
  specId,
  preview = false,
  fixedSize,
  variant,
}: {
  specId: string;
  preview?: boolean;
  /** Show only this size's figure and drop the size picker. */
  fixedSize?: string;
  /** Render a documented responsive variant where one exists. */
  variant?: 'mobile';
}) {
  const t = useT();
  const spec = getSpec(specId);
  const sizes = spec?.sizes ?? [];
  // Ring-type atoms (progress ring) carry their geometry on numeric props, not
  // in sizes/dimensions, so synthesize one item from the size/thickness props.
  const sizeProp = spec?.props?.find((p) => p.name === 'size' && p.type === 'number');
  const thickProp = spec?.props?.find((p) => p.name === 'thickness' && p.type === 'number');
  const items: readonly SizeSpec[] = !spec
    ? []
    : sizes.length > 0
      ? sizes
      : sizeProp && thickProp
        ? [{ name: `${sizeProp.default}px`, diameter: `${sizeProp.default}px`, thickness: `${thickProp.default}px` } as SizeSpec]
        : [{ name: spec.element ? `<${spec.element}>` : spec.name, ...(spec.dimensions ?? {}) } as SizeSpec];
  const [name, setName] = useState(items[0]?.name ?? '');
  if (!spec) return null;
  // preview mode (the overview gallery) and a fixedSize both render a single
  // figure with no size selector.
  const single = preview || fixedSize !== undefined;
  const active =
    (fixedSize ? items.find((s) => s.name === fixedSize) : undefined) ??
    (preview ? items[0] : items.find((s) => s.name === name)) ??
    items[0];
  if (!active) return null;
  const options = items.map((s) => ({ value: s.name, label: s.name }));
  return (
    <div className="blueprint">
      <Stack gap={4} align="start">
        {!single &&
          items.length > 1 &&
          (items.length <= 4 ? (
            <SegmentedControl
              size={Size.Small}
              aria-label={t(m.bpBlueprintSize)}
              value={name}
              onValueChange={setName}
              options={options}
            />
          ) : (
            <div style={{ maxWidth: '12rem' }}>
              <Select aria-label={t(m.bpBlueprintSize)} value={name} onValueChange={setName} options={options} />
            </div>
          ))}
        <TitleContext.Provider value={`<${spec.name} />`}>
          <Blueprint
            size={active}
            id={spec.id}
            dimensions={spec.dimensions}
            slots={spec.anatomy?.map((a) => a.name)}
            shape={RING_IDS.has(spec.id) ? 'ring' : spec.id === 'slider' ? 'slider' : undefined}
            variant={variant}
          />
        </TitleContext.Provider>
      </Stack>
    </div>
  );
}
