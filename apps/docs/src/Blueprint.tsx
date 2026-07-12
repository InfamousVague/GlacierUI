import { getSpec, type Measure, type SizeSpec } from '@glacier/spec';
import { createContext, useContext, useState, type ReactElement } from 'react';
import { SegmentedControl, Select, Stack, Size } from '@glacier/react';

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

function BpTitle() {
  const title = useContext(TitleContext);
  return (
    <text x={16} y={26} className="bpTitle">
      {title}
    </text>
  );
}

const C = {
  grid: 'var(--glacier-blue-5)',
  line: 'var(--glacier-blue-11)',
  fill: 'var(--glacier-blue-3)',
  edge: 'var(--glacier-blue-8)',
  content: 'var(--glacier-blue-6)',
  text: 'var(--glacier-blue-11)',
  faint: 'var(--glacier-text-subtle)',
};

// A horizontal dimension line from x1 to x2 at y: a solid line spanning the
// full width, with witness ticks and outward chevron arrowheads at each end.
function HDim({ x1, x2, y, label, above = true }: { x1: number; x2: number; y: number; label: string; above?: boolean }) {
  const mid = (x1 + x2) / 2;
  const A = 6;
  return (
    <g stroke={C.line} strokeWidth={1.25} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} strokeWidth={1} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} strokeWidth={1} />
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <polyline points={`${x1 + A},${y - 3.5} ${x1},${y} ${x1 + A},${y + 3.5}`} />
      <polyline points={`${x2 - A},${y - 3.5} ${x2},${y} ${x2 - A},${y + 3.5}`} />
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
  return (
    <g stroke={C.line} strokeWidth={1.25} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x - 4} y1={y1} x2={x + 4} y2={y1} strokeWidth={1} />
      <line x1={x - 4} y1={y2} x2={x + 4} y2={y2} strokeWidth={1} />
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <polyline points={`${x - 3.5},${y1 + A} ${x},${y1} ${x + 3.5},${y1 + A}`} />
      <polyline points={`${x - 3.5},${y2 - A} ${x},${y2} ${x + 3.5},${y2 - A}`} />
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
  const cx = 190;
  const cy = 118;
  const r = 44;
  const diameter = fmt(size.diameter);
  const border = fmt(size.border);
  const isAvatar = id === 'avatar';
  return (
    <svg viewBox="0 0 380 214" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} size`}>
      <Defs />
      <rect x={0} y={0} width={380} height={214} fill="url(#bpGrid)" />
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
      <HDim x1={cx - r} x2={cx + r} y={cy - r - 18} label={`⌀ ${diameter ?? 'auto'}`} />
      <text x={cx} y={cy + r + 26} textAnchor="middle" className="bpLabel bpMuted">radius: full{border ? `  ·  border: ${border}` : ''}</text>
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
  const diameter = fmt(size.diameter);
  const hostCx = 190;
  const hostCy = 100;
  const hostR = 54;
  // pin the dot to the host's bottom-right edge (the 4:30 / 135° position).
  const [dx, dy] = polar(hostCx, hostCy, hostR, 135);
  const dotR = 21;
  return (
    <svg viewBox="0 0 380 214" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} size`}>
      <Defs />
      <rect x={0} y={0} width={380} height={214} fill="url(#bpGrid)" />
      {/* the host element the dot attaches to, drawn as a dotted circle */}
      <circle cx={hostCx} cy={hostCy} r={hostR} fill="none" stroke={C.edge} strokeWidth={1} strokeDasharray="2 4" strokeLinecap="round" />
      <text x={hostCx} y={hostCy} textAnchor="middle" dominantBaseline="central" stroke="none" className="bpLabel bpMuted">host</text>
      {/* the status dot, pinned to the bottom-right of the host */}
      <circle cx={dx} cy={dy} r={dotR} fill={C.fill} stroke={C.edge} strokeWidth={2} strokeDasharray="4 3" />
      {/* the dot's diameter, dimensioned below it */}
      <HDim x1={dx - dotR} x2={dx + dotR} y={dy + dotR + 22} label={`⌀ ${diameter ?? 'auto'}`} above={false} />
      <BpTitle />
      <text x={16} y={198} className="bpLabel bpMuted">radius: full</text>
    </svg>
  );
}

// Icon: the 24-unit glyph grid with a sample stroked glyph, the rendered size,
// and the shared stroke width called out.
function IconBlueprint({ size, dimensions }: BlueprintProps) {
  const strokeW = fmt(dimensions?.strokeWidth);
  const px = fmt(size.diameter);
  const X = 152;
  const Y = 52;
  const S = 96; // schematic box; the label carries the real pixel size
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the icon">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <HDim x1={X} x2={X + S} y={Y - 18} label={`size ${px ?? '24px'}`} />
      <text x={X + S + 14} y={Y + S / 2 - 2} className="bpLabel bpMuted">glyph</text>
      {strokeW && (
        <text x={X + S + 14} y={Y + S / 2 + 16} className="bpLabel bpMuted">stroke {strokeW}</text>
      )}
      <text x={X - 12} y={Y + 14} textAnchor="end" className="bpLabel bpMuted">24 grid</text>
      <BpTitle />
      <Foot parts={['viewBox: 0 0 24 24', 'color: currentColor', strokeW && `stroke: ${strokeW}`]} />
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
  const cx = 200;
  const cy = 114;
  const R = 50; // outer radius (schematic; the label carries the real value)
  const t = 18; // schematic stroke-band width
  const rMid = R - t / 2;
  const rInner = R - t;
  const diameter = fmt(size.diameter);
  const thickness = fmt(size.thickness) ?? fmt(size.border);
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} size`}>
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />

      {/* the track band: a stroked circle as wide as the ring thickness */}
      <circle cx={cx} cy={cy} r={rMid} fill="none" stroke={C.fill} strokeWidth={t} />
      {/* the toned arc, drawn over the track the way the component fills */}
      <path d={arcPath(cx, cy, rMid, 0, 245)} fill="none" stroke={C.line} strokeWidth={t} strokeLinecap="round" opacity={0.9} />
      {/* band edges, dashed, so the skeletal ring reads as an outline too */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />

      {/* diameter across the top */}
      <HDim x1={cx - R} x2={cx + R} y={cy - R - 20} label={`⌀ ${diameter ?? 'auto'}`} />
      {/* thickness measured across the band at 9 o'clock, clear of the arc */}
      {thickness && <HDim x1={cx - R} x2={cx - rInner} y={cy} label={thickness} />}

      <BpTitle />
      <text x={200} y={212} textAnchor="middle" className="bpLabel bpMuted">radius: full</text>
    </svg>
  );
}

/** Box blueprint for padded rounded atoms (button, input, pill, callout). */
/**
 * Slider blueprint: the thin rail with its filled leading portion and the round
 * thumb riding on it, dimensioned with the thumb diameter and track height.
 */
function SliderBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the slider">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />

      {/* the rail */}
      <rect x={TX} y={TY - TH / 2} width={TW} height={TH} rx={TH / 2} fill={C.fill} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {/* the filled leading portion, up to the value */}
      <rect x={TX} y={TY - TH / 2} width={fillX - TX} height={TH} rx={TH / 2} fill={C.content} />
      {/* the thumb */}
      <circle cx={fillX} cy={TY} r={thumbR} fill={C.fill} stroke={C.line} strokeWidth={1.75} strokeDasharray="5 3" />

      {/* width across the rail */}
      <HDim x1={TX} x2={TX + TW} y={TY - thumbR - 18} label="width: auto" />
      {/* the thumb diameter, below the thumb */}
      {thumbDia && <HDim x1={fillX - thumbR} x2={fillX + thumbR} y={TY + thumbR + 20} label={`⌀ ${thumbDia}`} above={false} />}

      <BpTitle />
      <text x={200} y={204} textAnchor="middle" className="bpLabel bpMuted">
        {[trackH && `track: ${trackH}`, radius && `radius: ${radius}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Checkbox blueprint: the rounded box with its checkmark, edge, and radius. */
function CheckboxBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 380 214" className="bpSvg" role="img" aria-label="Blueprint of the checkbox">
      <Defs />
      <rect x={0} y={0} width={380} height={214} fill="url(#bpGrid)" />

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
          <text x={366} y={BYc - 10} textAnchor="end" className="bpLabel">radius: {radius}</text>
        </>
      )}

      <BpTitle />
      <text x={190} y={200} textAnchor="middle" className="bpLabel bpMuted">
        {[icon && `check: ${icon}`, border && `border: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Radio blueprint: the hairline ring with its selected dot and diameter. */
function RadioBlueprint({ size, dimensions }: BlueprintProps) {
  const diameter = fmt(dimensions?.diameter);
  const dot = fmt(dimensions?.dotSize);
  const border = fmt(dimensions?.border);

  const cx = 190;
  const cy = 100;
  const R = 46;
  const dotR = dot ? R * 0.36 : 0; // dotSize / diameter, kept in proportion

  return (
    <svg viewBox="0 0 380 214" className="bpSvg" role="img" aria-label="Blueprint of the radio">
      <Defs />
      <rect x={0} y={0} width={380} height={214} fill="url(#bpGrid)" />

      {/* the ring and, at its center, the selected dot */}
      <circle cx={cx} cy={cy} r={R} fill={C.fill} stroke={C.edge} strokeWidth={1.75} strokeDasharray="5 3" />
      {dotR > 0 && <circle cx={cx} cy={cy} r={dotR} fill={C.line} />}

      {diameter && <HDim x1={cx - R} x2={cx + R} y={cy - R - 18} label={`⌀ ${diameter}`} />}

      <BpTitle />
      <text x={190} y={200} textAnchor="middle" className="bpLabel bpMuted">
        {[dot && `dot: ${dot}`, 'radius: full', border && `border: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Switch blueprint: the pill track with the sliding thumb, track size, and thumb diameter. */
function SwitchBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} switch`}>
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />

      {/* the pill track, tinted to read as on, with the thumb at the trailing edge */}
      <rect x={TX} y={TY} width={TW} height={TH} rx={TH / 2} fill={C.content} fillOpacity={0.28} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      <circle cx={thumbCx} cy={thumbCy} r={thumbR} fill={C.fill} stroke={C.line} strokeWidth={1.75} />
      <text x={thumbCx} y={TY - 8} textAnchor="middle" className="bpLabel bpMuted">thumb</text>

      {/* track width on top, track height on the left */}
      {trackW && <HDim x1={TX} x2={TX + TW} y={TY - 24} label={trackW} />}
      {trackH && <VDim x={TX - 30} y1={TY} y2={TY + TH} label={trackH} />}

      {/* handle measurements: the thumb diameter below it, and its inset from the
          track edge (the track padding) marked on the trailing gap */}
      {thumb && <HDim x1={thumbCx - thumbR} x2={thumbCx + thumbR} y={TY + TH + 18} label={`⌀ ${thumb}`} above={false} />}
      {pad && <VDim x={thumbCx + thumbR + 16} y1={TY} y2={TY + p} label={pad} left={false} />}

      <BpTitle />
      <text x={200} y={212} textAnchor="middle" className="bpLabel bpMuted">
        {['radius: full', border && `border: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Number input blueprint: the bordered group with its minus/plus step buttons. */
function NumberInputBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} number input`}>
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />

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
      <HDim x1={BX} x2={BX + BW} y={BY - 26} label="width: auto" />

      {/* radius on the top-right corner */}
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={392} y={BY - 12} textAnchor="end" className="bpLabel">radius: {radius}</text>
        </>
      )}

      <BpTitle />
      <text x={200} y={212} textAnchor="middle" className="bpLabel bpMuted">
        {[font && `font: ${font}`, border && `border: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Radio card blueprint: the tile with its icon, title, description, and corner check. */
function RadioCardBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 254" className="bpSvg" role="img" aria-label="Blueprint of the radio card">
      <Defs />
      <rect x={0} y={0} width={400} height={254} fill="url(#bpGrid)" />

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
          <text x={388} y={BY - 10} textAnchor="end" className="bpLabel">radius: {radius}</text>
        </>
      )}

      <BpTitle />
      <Foot
        y={244}
        parts={[
          padding && `padding: ${padding}`,
          gap && `gap: ${gap}`,
          border && `border: ${border}`,
          titleSize && `title: ${titleSize}`,
          descriptionSize && `desc: ${descriptionSize}`,
          iconSize && `icon: ${iconSize}`,
          indicator && `check: ${indicator}`,
        ]}
      />
    </svg>
  );
}

/** Search field blueprint: the box with its leading magnifier and trailing clear (backspace) button. */
function SearchFieldBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} search field`}>
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />

      {/* the field box */}
      <rect x={BX} y={BY} width={BW} height={BH} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={border ? 2 : 1.25} strokeDasharray="5 3" />

      {/* the leading magnifier */}
      <g transform={`translate(${BX + 15} ${midY - 11}) scale(${22 / 16})`} fill="none" stroke={C.line} strokeWidth={1.6} strokeLinecap="round">
        <circle cx="7" cy="7" r="4.5" />
        <path d="m11 11 3.5 3.5" />
      </g>

      {/* the placeholder text */}
      <text x={BX + pIn + 4} y={midY} dominantBaseline="central" stroke="none" fill={C.content} style={{ fontSize: 20, fontFamily: 'var(--glacier-font-sans)' }}>
        Search
      </text>

      {/* the trailing clear button, drawn as the backspace glyph */}
      <g transform={`translate(${BX + BW - 38} ${midY - 11}) scale(${22 / 24})`} fill="none" stroke={C.line} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
        <path d="m12 9 6 6" />
        <path d="m18 9-6 6" />
      </g>

      {/* height on the left, width on top, the icon inset below */}
      {height && <VDim x={BX - 34} y1={BY} y2={BY + BH} label={height} />}
      <HDim x1={BX} x2={BX + BW} y={BY - 26} label="width: auto" />
      {padIn && <HDim x1={BX} x2={BX + pIn} y={BY + BH + 16} label={padIn} above={false} />}

      {/* radius on the top-right corner */}
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={392} y={BY - 12} textAnchor="end" className="bpLabel">radius: {radius}</text>
        </>
      )}

      <BpTitle />
      <text x={200} y={212} textAnchor="middle" className="bpLabel bpMuted">
        {[font && `font: ${font}`, border && `border: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Callout blueprint: the bordered block with its leading icon, title, and body. */
function CalloutBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the callout">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />

      {/* the callout block */}
      <rect x={BX} y={BY} width={BW} height={BH} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={2} strokeDasharray="5 3" />

      {/* the leading icon (an info glyph), top-aligned with the title */}
      <circle cx={icx} cy={icy} r={11} fill="none" stroke={C.line} strokeWidth={2} />
      <circle cx={icx} cy={icy - 4.5} r={1.4} fill={C.line} />
      <line x1={icx} y1={icy - 1} x2={icx} y2={icy + 5} stroke={C.line} strokeWidth={2} strokeLinecap="round" />
      <text x={icx} y={icy + 24} textAnchor="middle" className="bpLabel bpMuted">icon</text>

      {/* the bold title bar */}
      <rect x={colX} y={BY + pBl} width={80} height={13} rx={3} fill={C.line} />
      <text x={colX + 88} y={BY + pBl + 7} dominantBaseline="central" className="bpLabel bpMuted">title</text>

      {/* the body lines */}
      <rect x={colX} y={BY + pBl + 22} width={104} height={9} rx={3} fill={C.content} />
      <rect x={colX} y={BY + pBl + 38} width={84} height={9} rx={3} fill={C.content} />
      <text x={colX + 112} y={BY + pBl + 26} dominantBaseline="central" className="bpLabel bpMuted">body</text>

      {/* width on top, padding-inline below, padding-block on the right */}
      <HDim x1={BX} x2={BX + BW} y={BY - 24} label="width: auto" />
      {paddingInline && <HDim x1={BX} x2={BX + pIn} y={BY + BH + 14} label={paddingInline} above={false} />}
      {paddingBlock && <VDim x={BX + BW + 14} y1={BY} y2={BY + pBl} label={paddingBlock} left={false} horizontal />}

      {/* radius on the top-right corner */}
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={390} y={BY - 10} textAnchor="end" className="bpLabel">radius: {radius}</text>
        </>
      )}

      <BpTitle />
      <text x={200} y={214} textAnchor="middle" className="bpLabel bpMuted">
        {[gap && `gap: ${gap}`, font && `font: ${font}`, border && `border: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Banner blueprint: the wide full-width strip with its icon, message, action, and dismiss. */
function BannerBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox={`0 0 ${W} ${H}`} className="bpSvg" role="img" aria-label="Blueprint of the banner">
      <Defs />
      <rect x={0} y={0} width={W} height={H} fill="url(#bpGrid)" />

      {/* the full-width strip */}
      <rect x={BX} y={BY} width={BW} height={BH} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={2} strokeDasharray="5 3" />

      {/* leading icon (an info glyph) */}
      <circle cx={icx} cy={midY} r={10} fill="none" stroke={C.line} strokeWidth={2} />
      <circle cx={icx} cy={midY - 4} r={1.3} fill={C.line} />
      <line x1={icx} y1={midY - 1} x2={icx} y2={midY + 5} stroke={C.line} strokeWidth={2} strokeLinecap="round" />
      <text x={icx} y={BY - 14} textAnchor="middle" className="bpLabel bpMuted">icon</text>

      {/* the flexible message line */}
      <rect x={msgX} y={midY - 5} width={msgW} height={10} rx={3} fill={C.content} />
      <text x={msgX + msgW / 2} y={BY - 14} textAnchor="middle" className="bpLabel bpMuted">message</text>

      {/* the trailing action button */}
      <rect x={btnX} y={btnY} width={btnW} height={30} rx={8} fill={C.content} fillOpacity={0.3} stroke={C.line} strokeWidth={1.5} />
      <rect x={btnX + 16} y={midY - 4} width={btnW - 32} height={8} rx={3} fill={C.line} />
      <text x={btnX + btnW / 2} y={BY - 14} textAnchor="middle" className="bpLabel bpMuted">action</text>

      {/* the trailing dismiss control */}
      <path
        d={`M ${dismissCx - 5} ${midY - 5} L ${dismissCx + 5} ${midY + 5} M ${dismissCx + 5} ${midY - 5} L ${dismissCx - 5} ${midY + 5}`}
        stroke={C.line}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <text x={dismissCx} y={BY - 14} textAnchor="middle" className="bpLabel bpMuted">dismiss</text>

      {/* padding-inline below, padding-block on the right */}
      {paddingInline && <HDim x1={BX} x2={BX + pIn} y={BY + BH + 18} label={paddingInline} above={false} />}
      {paddingBlock && <VDim x={BX + BW + 24} y1={BY} y2={BY + pBl} label={paddingBlock} left={false} />}

      {/* radius on the top-right corner, labelled up in the title row so it clears the part labels */}
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={W - 8} y={28} textAnchor="end" className="bpLabel">radius: {radius}</text>
        </>
      )}

      <BpTitle />
      <Foot
        y={H - 14}
        x={W / 2}
        parts={['width: full', gap && `gap: ${gap}`, font && `font: ${font}`, border && `border: ${border}`]}
      />
    </svg>
  );
}

/** Meter blueprint: the row of discrete segments (pips) that fill from the left. */
function MeterBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 214" className="bpSvg" role="img" aria-label="Blueprint of the meter">
      <Defs />
      <rect x={0} y={0} width={400} height={214} fill="url(#bpGrid)" />

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
      <text x={(segX(0) + segX(FILLED - 1) + segW) / 2} y={SY - 16} textAnchor="middle" className="bpLabel bpMuted">filled</text>
      <text x={(segX(FILLED) + segX(N - 1) + segW) / 2} y={SY - 16} textAnchor="middle" className="bpLabel bpMuted">empty</text>

      {/* width on top, one segment's height on the left, the gap between two segments below */}
      <HDim x1={SX} x2={SX + totalW} y={SY - 34} label="width: auto" />
      {height && <VDim x={SX - 26} y1={SY} y2={SY + segH} label={height} />}
      {gap && <HDim x1={segX(0) + segW} x2={segX(1)} y={SY + segH + 18} label={gap} above={false} />}

      <BpTitle />
      <text x={200} y={202} textAnchor="middle" className="bpLabel bpMuted">
        {['segments: 4 (default)', 'radius: full'].join('   ·   ')}
      </text>
    </svg>
  );
}

// SegmentedBar: one proportional bar split into slices sized by share of the
// total, with the uncovered remainder painting the empty track. Draw a few
// example slices with their share labelled inside, plus the height, gap, radius
// and slice-radius measurements.
function SegmentedBarBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the segmented bar">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />

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
      <text x={firstMidX} y={SY - 14} textAnchor="middle" className="bpLabel bpMuted">slice</text>
      {emptyW > 24 && (
        <text x={emptyX + emptyW / 2} y={SY - 14} textAnchor="middle" className="bpLabel bpMuted">track</text>
      )}

      {/* width on top, one slice height on the left, the gap between two slices below */}
      <HDim x1={SX} x2={SX + BW} y={SY - 32} label="width: auto" />
      {height && <VDim x={SX - 26} y1={SY} y2={SY + BH} label={height} />}
      {gap && <HDim x1={firstRight} x2={secondX} y={SY + BH + 18} label={gap} above={false} />}

      <BpTitle />
      <text x={200} y={212} textAnchor="middle" className="bpLabel bpMuted">
        {[radius && `radius: ${radius}`, sliceRadius && `slice radius: ${sliceRadius}`].filter(Boolean).join('   ·   ')}
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} size`}>
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />

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
          <text x={leadIconX + 14} y={BY + BH + 32} textAnchor="middle" className="bpLabel bpMuted">icon</text>
        </>
      )}
      {id === 'pill' && slots?.includes('remove') && (
        <>
          <g stroke={C.line} fill="none" strokeWidth={1.25} strokeLinecap="round">
            <circle cx={BX + pIn + cw - 10} cy={iconY} r={8} strokeDasharray="2 2" />
            <path d={`M ${BX + pIn + cw - 13} ${iconY - 3} l 6 6 M ${BX + pIn + cw - 7} ${iconY - 3} l -6 6`} />
          </g>
          <text x={BX + pIn + cw - 10} y={BY + BH + 32} textAnchor="middle" className="bpLabel bpMuted">remove</text>
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
          Button
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
          {id === 'heading' ? 'heading' : id === 'counter-badge' ? '99+' : 'text'}
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
          Online
        </text>
      )}

      {/* height on the left */}
      {height && <VDim x={BX - 34} y1={BY} y2={BY + BH} label={height} />}
      {/* width span on top (content-sized, but the box width is shown) */}
      <HDim x1={BX} x2={BX + BW} y={BY - 26} label={`width: auto`} />

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
            radius: {radius}
          </text>
        </>
      )}

      {/* footnotes for the non-geometric measures */}
      <BpTitle />
      <text x={200} y={212} textAnchor="middle" className="bpLabel bpMuted">
        {[font && `font: ${font}`, border && `border: ${border}`, gap && `gap: ${gap}`].filter(Boolean).join('   ·   ')}
      </text>
    </svg>
  );
}

/** Bar blueprint for thin line atoms (divider, progress bar): thickness + radius. */
// Textarea: a multi-line field - a taller, more square box with placeholder
// lines and the vertical resize grip in the bottom-right corner.
function TextareaBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the textarea">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <HDim x1={BX} x2={BX + BW} y={BY - 20} label="width: auto" />
      {minHeight && <VDim x={BX - 24} y1={BY} y2={BY + BH} label={`min ${minHeight}`} />}
      <text x={rx + 12} y={ry - 8} className="bpLabel bpMuted">resize</text>
      <BpTitle />
      <Foot y={214} parts={[radius && `radius: ${radius}`, padIn && `padding: ${padIn}`, border && `border: ${border}`]} />
    </svg>
  );
}

// Skeleton: the loading-placeholder primitive - a little content skeleton
// (avatar, lines, image block) with a static blue-to-transparent shimmer on
// each shape.
function SkeletonBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 214" className="bpSvg" role="img" aria-label="Blueprint of the skeleton">
      <Defs />
      <defs>
        <linearGradient id="bpSkel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--glacier-blue-8)" stopOpacity={0.8} />
          <stop offset="1" stopColor="var(--glacier-blue-8)" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={400} height={214} fill="url(#bpGrid)" />
      {/* one rect + one circle, filled with the static blue-to-transparent shimmer */}
      <rect x={RX} y={RY} width={RW} height={RH} rx={10} fill={g} />
      <circle cx={Ccx} cy={Ccy} r={Cr} fill={g} />
      {/* the width bar over the rect, and the circle's diameter */}
      <HDim x1={RX} x2={RX + RW} y={RY - 20} label="width: auto" />
      <HDim x1={Ccx - Cr} x2={Ccx + Cr} y={Ccy - Cr - 18} label="⌀ width" />
      <text x={RX + RW / 2} y={RY + RH + 20} textAnchor="middle" className="bpLabel bpMuted">rect</text>
      <text x={Ccx} y={Ccy + Cr + 20} textAnchor="middle" className="bpLabel bpMuted">circle</text>
      <BpTitle />
      <Foot y={202} parts={[rectRadius && `rect: ${rectRadius}`, circleRadius && `circle: ${circleRadius}`]} />
    </svg>
  );
}

// CodeBlock: a framed code panel with a header (filename, language, copy), a
// line-number gutter, and the source - a small main() function.
function CodeBlockBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the code block">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
      <Frame x={X} y={Y} w={W} h={H} r={12} />
      {/* header: filename, language, copy */}
      <line x1={X} y1={bodyY} x2={X + W} y2={bodyY} stroke={C.edge} strokeWidth={1} />
      <text x={X + 12} y={Y + headerH / 2} dominantBaseline="central" fill={C.text} stroke="none" style={{ fontFamily: mono, fontSize: 11 }}>main.ts</text>
      <text x={X + W - 80} y={Y + headerH / 2} dominantBaseline="central" fill={C.faint} stroke="none" style={{ fontFamily: mono, fontSize: 9 }}>TS</text>
      <rect x={X + W - 52} y={Y + 6} width={42} height={headerH - 12} rx={4} fill={C.content} fillOpacity={0.32} />
      <text x={X + W - 31} y={Y + headerH / 2} textAnchor="middle" dominantBaseline="central" fill={C.text} stroke="none" style={{ fontFamily: mono, fontSize: 9 }}>Copy</text>
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
      <text x={X + W + 12} y={Y + headerH / 2} className="bpLabel bpMuted">header</text>
      <text x={X + W - 31} y={Y - 8} textAnchor="middle" className="bpLabel bpMuted">copy</text>
      <text x={X + W + 12} y={bodyY + 44} className="bpLabel bpMuted">pre</text>
      <text x={X - 10} y={bodyY + 44} textAnchor="end" className="bpLabel bpMuted">gutter</text>
      <BpTitle />
      <Foot parts={[radius && `radius: ${radius}`, prePadding && `padding: ${prePadding}`, border && `border: ${border}`]} />
    </svg>
  );
}

// Steps: a row of progress dots - completed solid, the current one enlarged,
// upcoming ones hollow with a hairline border.
function StepsBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 174" className="bpSvg" role="img" aria-label="Blueprint of the steps">
      <Defs />
      <rect x={0} y={0} width={400} height={174} fill="url(#bpGrid)" />
      {Array.from({ length: N }, (_, i) => {
        if (i < active) return <circle key={i} cx={cxOf(i)} cy={Y} r={r} fill={C.content} fillOpacity={0.7} />;
        if (i === active) return <circle key={i} cx={cxOf(i)} cy={Y} r={cr} fill={C.content} fillOpacity={0.95} stroke={C.text} strokeWidth={1} />;
        return <circle key={i} cx={cxOf(i)} cy={Y} r={r} fill={C.fill} stroke={C.edge} strokeWidth={1.25} />;
      })}
      <text x={(cxOf(0) + cxOf(1)) / 2} y={Y + cr + 16} textAnchor="middle" className="bpLabel bpMuted">completed</text>
      <text x={cxOf(active)} y={Y - cr - 10} textAnchor="middle" className="bpLabel bpMuted">current ×{currentScale}</text>
      <text x={(cxOf(3) + cxOf(4)) / 2} y={Y + cr + 16} textAnchor="middle" className="bpLabel bpMuted">upcoming</text>
      {diameter && <HDim x1={cxOf(0) - r} x2={cxOf(0) + r} y={Y - r - 12} label={`⌀ ${diameter}`} />}
      {gap && <HDim x1={cxOf(3) + r} x2={cxOf(4) - r} y={Y - r - 12} label={gap} />}
      <BpTitle />
      <Foot y={162} parts={[radius && `radius: ${radius}`, border && `border: ${border}`, `count ${N} · active ${active}`]} />
    </svg>
  );
}

// ProgressBar: a thin rounded track with a tone fill sized to the value.
function ProgressBarBlueprint({ size, dimensions }: BlueprintProps) {
  const height = fmt(size.height);
  const radius = fmt(dimensions?.radius);
  const X = 70;
  const W = 260;
  const H = 22;
  const Y = 82;
  const rr = H / 2;
  const fillW = Math.round(W * 0.6);
  return (
    <svg viewBox="0 0 400 174" className="bpSvg" role="img" aria-label="Blueprint of the progress bar">
      <Defs />
      <rect x={0} y={0} width={400} height={174} fill="url(#bpGrid)" />
      {/* the track */}
      <rect x={X} y={Y} width={W} height={H} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      {/* the fill, sized to the value */}
      <rect x={X} y={Y} width={fillW} height={H} rx={rr} fill={C.content} fillOpacity={0.55} stroke={C.text} strokeWidth={1} />
      <text x={X + fillW / 2} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">fill</text>
      <text x={X + fillW + (W - fillW) / 2} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">track</text>
      <HDim x1={X} x2={X + W} y={Y - 30} label="width: auto" />
      {height && <VDim x={X - 22} y1={Y} y2={Y + H} label={height} />}
      <HDim x1={X} x2={X + fillW} y={Y + H + 16} label="value = 60% of max" above={false} />
      <BpTitle />
      <Foot y={162} parts={[height && `height: ${height}`, radius && `radius: ${radius}`, 'indeterminate: 40% sweep']} />
    </svg>
  );
}

// Divider: a hairline rule with an optional centered label, drawn as the
// labelled separator - a rule on each side of a centered "or".
function DividerBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 164" className="bpSvg" role="img" aria-label="Blueprint of the divider">
      <Defs />
      <rect x={0} y={0} width={400} height={164} fill="url(#bpGrid)" />
      {/* the two hairline rules with the label between them */}
      <line x1={X} y1={Y} x2={leftEnd} y2={Y} stroke={C.line} strokeWidth={1.5} />
      <line x1={rightStart} y1={Y} x2={X + W} y2={Y} stroke={C.line} strokeWidth={1.5} />
      <text x={cx} y={Y} textAnchor="middle" dominantBaseline="central" fill={C.text} stroke="none" style={{ fontFamily: 'var(--glacier-font-sans)', fontSize: 13, fontWeight: 600 }}>
        or
      </text>
      <text x={cx} y={Y - 22} textAnchor="middle" className="bpLabel bpMuted">label</text>
      <text x={X + 44} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">hairline</text>
      <HDim x1={X} x2={X + W} y={Y - 36} label="width: auto" />
      {gap && <HDim x1={leftEnd} x2={cx - half} y={Y + 20} label={gap} above={false} />}
      <BpTitle />
      <Foot y={152} parts={[thickness && `thickness: ${thickness}`, gap && `gap: ${gap}`]} />
    </svg>
  );
}

function BarBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 164" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} size`}>
      <Defs />
      <rect x={0} y={0} width={400} height={164} fill="url(#bpGrid)" />
      <rect x={BX} y={BY} width={BW} height={BH} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {thickness && <VDim x={BX - 22} y1={BY} y2={BY + BH} label={thickness} />}
      <HDim x1={BX} x2={BX + BW} y={BY - 24} label="width: auto" />
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={392} y={BY - 10} textAnchor="end" className="bpLabel">
            radius: {radius}
          </text>
        </>
      )}
      <BpTitle />
      <text x={200} y={146} textAnchor="middle" className="bpLabel bpMuted">
        {[border && `border: ${border}`, gap && `gap: ${gap}`].filter(Boolean).join('   ·   ')}
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
  const gap = fmt(dimensions?.gap) ?? fmt(size.gap);
  const X = 104;
  const W = 192;
  const labelY = 50;
  const ctrlY = 70;
  const ctrlH = 40;
  const metaY = 126;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the field">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
      <Ln x={X} y={labelY} w={60} op={0.75} />
      <text x={X + 68} y={labelY + 8} fill="var(--glacier-danger-solid)" stroke="none" style={{ fontSize: 12, fontWeight: 700 }}>*</text>
      <Frame x={X} y={ctrlY} w={W} h={ctrlH} r={8} />
      <Ln x={X + 12} y={ctrlY + ctrlH / 2 - 3} w={104} op={0.5} />
      <Ln x={X} y={metaY} w={140} h={5} op={0.32} />
      <text x={X - 10} y={labelY + 8} textAnchor="end" className="bpLabel bpMuted">label</text>
      <text x={X + W + 12} y={ctrlY + ctrlH / 2 + 3} className="bpLabel bpMuted">control</text>
      <text x={X - 10} y={metaY + 6} textAnchor="end" className="bpLabel bpMuted">meta</text>
      {gap && <VDim x={X + W + 30} y1={ctrlY + ctrlH} y2={metaY} label={gap} left={false} />}
      <BpTitle />
      <Foot parts={['label', 'control', 'hint / error']} />
    </svg>
  );
}

// Select: the trigger (value + chevrons) with the portalled option menu below.
function SelectBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 234" className="bpSvg" role="img" aria-label="Blueprint of the select">
      <Defs />
      <rect x={0} y={0} width={400} height={234} fill="url(#bpGrid)" />
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
      <text x={X - 10} y={trigY + trigH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">trigger</text>
      <text x={X + W + 12} y={menuY + 13} className="bpLabel bpMuted">menu</text>
      <text x={X + W + 12} y={menuY + pad + rowH / 2 + 3} className="bpLabel bpMuted">option ✓</text>
      <BpTitle />
      <Foot y={224} parts={[radius && `radius: ${radius}`, optionRadius && `option: ${optionRadius}`, padIn && `pad: ${padIn}`, border && `border: ${border}`]} />
    </svg>
  );
}

// Combobox: the editable input with its caret and indicator, and the portaled
// listbox below it - an active option, an option with a supporting description,
// and the input-to-menu offset dimensioned from the spec's gap.
function ComboboxBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 250" className="bpSvg" role="img" aria-label="Blueprint of the combobox">
      <Defs />
      <rect x={0} y={0} width={400} height={250} fill="url(#bpGrid)" />

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

      <text x={X - 10} y={trigY + trigH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">input</text>
      <text x={X + W + 12} y={trigY + 20} className="bpLabel bpMuted">indicator</text>
      <text x={X - 10} y={menuY + pad + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">active</text>
      <text x={X + W + 12} y={menuY + pad + rowH + rowH / 2 + 3} className="bpLabel bpMuted">description</text>
      <text x={X - 10} y={menuY + pad + 2 * rowH + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">option</text>
      <BpTitle />
      <Foot
        y={240}
        parts={[
          radius && `radius: ${radius}`,
          optionRadius && `option: ${optionRadius}`,
          menuPadding && `menu pad: ${menuPadding}`,
          padIn && `pad: ${padIn}`,
          border && `border: ${border}`,
        ]}
      />
    </svg>
  );
}

// MultiSelect: the control shell holding removable tags plus the editable
// input, and the listbox below with a checked selected row and the active row.
function MultiSelectBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 250" className="bpSvg" role="img" aria-label="Blueprint of the multi select">
      <Defs />
      <rect x={0} y={0} width={400} height={250} fill="url(#bpGrid)" />

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

      <text x={X - 10} y={tagY + tagH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">tag ×</text>
      <text x={X + W + 12} y={trigY + 21} className="bpLabel bpMuted">indicator</text>
      <text x={X - 10} y={menuY + pad + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">selected ✓</text>
      <text x={X + W + 12} y={menuY + pad + rowH + rowH / 2 + 3} className="bpLabel bpMuted">active</text>
      <text x={X - 10} y={menuY + pad + 2 * rowH + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">option</text>
      <BpTitle />
      <Foot
        y={240}
        parts={[
          radius && `radius: ${radius}`,
          tagRadius && `tag: ${tagRadius}`,
          optionRadius && `option: ${optionRadius}`,
          gap && `tag gap: ${gap}`,
          menuPadding && `menu pad: ${menuPadding}`,
          padIn && `pad: ${padIn}`,
          border && `border: ${border}`,
        ]}
      />
    </svg>
  );
}


// List: stacked card rows, each with a leading icon, title and description
// lines, and a trailing affordance, separated by the size's gap.
function ListBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 282" className="bpSvg" role="img" aria-label="Blueprint of the list">
      <Defs />
      <rect x={0} y={0} width={400} height={282} fill="url(#bpGrid)" />
      {row(rows[0]!, true)}
      {row(rows[1]!, false)}
      {row(rows[2]!, false)}

      <HDim x1={X} x2={X + W} y={rows[0]! - 20} label="width: auto" />
      {height && <VDim x={X - 20} y1={rows[0]!} y2={rows[0]! + rowH} label={height} />}
      {gap && <VDim x={X + W + 16} y1={rows[0]! + rowH} y2={rows[1]!} label={gap} left={false} horizontal />}

      <text x={X + W + 12} y={rows[0]! + rowH / 2 + 3} className="bpLabel bpMuted">selected</text>
      <text x={X - 10} y={rows[1]! + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">leading</text>
      <text x={X - 10} y={rows[2]! + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">title + desc</text>
      <text x={X + W + 12} y={rows[2]! + rowH / 2 + 3} className="bpLabel bpMuted">trailing</text>
      <BpTitle />
      <Foot y={274} parts={[padIn && `pad: ${padIn}`, radius && `radius: ${radius}`, border && `border: ${border}`]} />
    </svg>
  );
}


// SegmentedControl: a glass track of segments with a thumb under the selected one.
function SegmentedControlBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 214" className="bpSvg" role="img" aria-label="Blueprint of the segmented control">
      <Defs />
      <rect x={0} y={0} width={400} height={214} fill="url(#bpGrid)" />
      <rect x={SX - pad} y={SY - pad} width={totalW + pad * 2} height={segH + pad * 2} rx={12} fill={C.fill} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      {/* the thumb under the first segment */}
      <rect x={segX(0)} y={SY} width={segW} height={segH} rx={9} fill={C.content} fillOpacity={0.3} stroke={C.text} strokeWidth={1} />
      {Array.from({ length: N }, (_, i) => (
        <Ln key={i} x={segX(i) + segW / 2 - 22} y={SY + segH / 2 - 3} w={44} op={i === 0 ? 0.7 : 0.4} />
      ))}
      <text x={segX(0) + segW / 2} y={SY - pad - 8} textAnchor="middle" className="bpLabel bpMuted">thumb</text>
      <text x={segX(1) + segW / 2} y={SY + segH + pad + 16} textAnchor="middle" className="bpLabel bpMuted">segment</text>
      <HDim x1={SX - pad} x2={SX + totalW + pad} y={SY - pad - 20} label="width: auto" />
      {gap && <HDim x1={segX(0) + segW} x2={segX(1)} y={SY + segH + 6} label={gap} above={false} />}
      <BpTitle />
      <Foot y={204} parts={[radius && `radius: ${radius}`, padding && `padding: ${padding}`]} />
    </svg>
  );
}

// Tabs: a tablist underlined by a hairline, the active indicator, and the panel.
function TabsBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the tabs">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <text x={X + tabW / 2} y={listY - 8} textAnchor="middle" className="bpLabel bpMuted">tab</text>
      <text x={X + W + 12} y={listY + 30} className="bpLabel bpMuted">indicator</text>
      <text x={X + W + 12} y={panelY + panelH / 2} className="bpLabel bpMuted">panel</text>
      <BpTitle />
      <Foot parts={[indicator && `indicator: ${indicator}`, radius && `radius: ${radius}`, padBl && `pad: ${padBl}`]} />
    </svg>
  );
}

// Tooltip: a small glass bubble with a pointer, offset above its trigger.
function TooltipBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 214" className="bpSvg" role="img" aria-label="Blueprint of the tooltip">
      <Defs />
      <rect x={0} y={0} width={400} height={214} fill="url(#bpGrid)" />
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
      <text x={bubbleX + bubbleW + 12} y={bubbleY + bubbleH / 2 + 3} className="bpLabel bpMuted">bubble</text>
      <text x={cx + 42} y={trigY + 16} className="bpLabel bpMuted">trigger</text>
      {offset && <VDim x={bubbleX - 20} y1={bubbleY + bubbleH} y2={trigY} label={`offset ${offset}`} />}
      <BpTitle />
      <Foot y={204} parts={[radius && `radius: ${radius}`, padIn && `pad-inline: ${padIn}`, 'glass + blur']} />
    </svg>
  );
}

// Drawer: a modal sheet entering from a viewport edge, drawn in its floating
// form (the default under a floating app layout): a gutter keeps the card off
// every screen edge and all four corners round. The mini screen shows the
// dimmed overlay, the sheet's header, body, and footer regions, the slide-in
// direction, and the gutter and width dimensions for the selected size.
function DrawerBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the drawer">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <text x={SX + 8} y={SY + 15} className="bpLabel bpMuted">overlay</text>
      <text x={PX - 10} y={PY + 16} textAnchor="end" className="bpLabel bpMuted">header</text>
      <text x={PX - 10} y={PY + 56} textAnchor="end" className="bpLabel bpMuted">body</text>
      <text x={PX - 10} y={PY + PH - 14} textAnchor="end" className="bpLabel bpMuted">footer</text>
      {width && <HDim x1={PX} x2={right} y={SY - 14} label={`width ${width}`} />}
      {gutter && <HDim x1={right} x2={SX + SW} y={PY + 44} label={gutter} above={false} />}
      <BpTitle />
      <Foot parts={[radius && `radius: ${radius}`, headerPad && `pad: ${headerPad}`, gutter && `gutter: ${gutter}`]} />
    </svg>
  );
}

// Calendar: the month view drawn as a real month. A caption row with the two
// nav chevrons, the weekday header, and a 7x5 grid whose 30 numbered days
// start midweek, with the outside days dimmed, one day selected, and one
// ringed as today; the cell metric and paint come from the spec.
function CalendarBlueprint({ dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 314" className="bpSvg" role="img" aria-label="Blueprint of the calendar month grid">
      <Defs />
      <rect x={0} y={0} width={400} height={314} fill="url(#bpGrid)" />
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
              style={selected ? { fill: 'var(--glacier-blue-2)' } : undefined}
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
      <Foot y={306} parts={[radius && `radius: ${radius}`, pad && `pad: ${pad}`, dayRadius && `day radius: ${dayRadius}`]} />
    </svg>
  );
}

// DatePicker: the input-metric trigger with its calendar glyph, and the
// anchored panel below holding a miniature month; the numbered anatomy lives
// in the Calendar blueprint that follows it in the docs.
function DatePickerBlueprint({ dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 254" className="bpSvg" role="img" aria-label="Blueprint of the date picker">
      <Defs />
      <rect x={0} y={0} width={400} height={254} fill="url(#bpGrid)" />
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
      <text x={TX - 10} y={TY + TH / 2 + 4} textAnchor="end" className="bpLabel bpMuted">trigger</text>
      <text x={PX - 10} y={PY + 16} textAnchor="end" className="bpLabel bpMuted">panel</text>
      <VDim x={PX + PW + 16} y1={TY + TH} y2={PY} label="offset" left={false} />
      <BpTitle />
      <Foot y={246} parts={[radius && `radius: ${radius}`, panelPad && `panel pad: ${panelPad}`]} />
    </svg>
  );
}

// Toast: a rounded-full pill with a leading icon, the message, and a dismiss.
function ToastBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the toast">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
      <rect x={X} y={Y} width={W} height={H} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      <circle cx={iconX} cy={cyc} r={9} fill={C.content} fillOpacity={0.4} stroke={C.line} strokeWidth={1} />
      <Ln x={msgX} y={cyc - 3} w={110} h={6} op={0.5} />
      {/* dismiss */}
      <g stroke={C.line} strokeWidth={1.4}>
        <line x1={X + W - 26} y1={cyc - 5} x2={X + W - 16} y2={cyc + 5} />
        <line x1={X + W - 26} y1={cyc + 5} x2={X + W - 16} y2={cyc - 5} />
      </g>
      <text x={iconX} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">icon</text>
      <text x={msgX + 55} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">message</text>
      <text x={X + W - 21} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">dismiss</text>
      {/* padding, then the icon-to-message gap on its own row below */}
      {padIn && <HDim x1={X} x2={iconX - 9} y={dim1} label={padIn} above={false} />}
      {gap && <HDim x1={iconX + 9} x2={msgX} y={dim2} label={gap} above={false} />}
      <BpTitle />
      <Foot y={216} parts={[radius && `radius: ${radius}`]} />
    </svg>
  );
}


// ScrollArea: a capped viewport with edge fade masks and a thin scrollbar.
function ScrollAreaBlueprint({ size, dimensions }: BlueprintProps) {
  const fade = fmt(dimensions?.fade);
  const scrollbar = fmt(dimensions?.scrollbar);
  const X = 118;
  const W = 180;
  const Y = 44;
  const H = 128;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the scroll area">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
          <stop offset="0" stopColor="var(--glacier-blue-3)" stopOpacity={0.95} />
          <stop offset="1" stopColor="var(--glacier-blue-3)" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="bpFadeBot" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--glacier-blue-3)" stopOpacity={0.95} />
          <stop offset="1" stopColor="var(--glacier-blue-3)" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* scrollbar */}
      <rect x={X + W - 8} y={Y + 10} width={4} height={54} rx={2} fill={C.line} fillOpacity={0.6} />
      <text x={X + W / 2} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">fade</text>
      <text x={X - 10} y={Y + H / 2} textAnchor="end" className="bpLabel bpMuted">viewport</text>
      <text x={X + W + 12} y={Y + 40} className="bpLabel bpMuted">scrollbar</text>
      {fade && <VDim x={X + W + 30} y1={Y} y2={Y + 18} label={fade} left={false} />}
      <BpTitle />
      <Foot parts={[fade && `fade: ${fade}`, scrollbar && `bar: ${scrollbar}`]} />
    </svg>
  );
}

// Carousel: a snap-scrolling track of items with prev/next edge controls.
function CarouselBlueprint({ size, dimensions }: BlueprintProps) {
  const gap = fmt(dimensions?.gap);
  const radius = fmt(dimensions?.radius);
  const X = 58;
  const W = 284;
  const Y = 70;
  const H = 74;
  const itemW = 78;
  const g = 12;
  return (
    <svg viewBox="0 0 400 214" className="bpSvg" role="img" aria-label="Blueprint of the carousel">
      <Defs />
      <rect x={0} y={0} width={400} height={214} fill="url(#bpGrid)" />
      {/* items */}
      {Array.from({ length: 3 }, (_, i) => (
        <rect key={i} x={X + i * (itemW + g)} y={Y} width={itemW} height={H} rx={8} fill={C.content} fillOpacity={0.24} stroke={C.edge} strokeWidth={1.25} strokeDasharray="4 3" />
      ))}
      {/* the fourth item, clipped, hinting the overflow */}
      <rect x={X + 3 * (itemW + g)} y={Y} width={itemW} height={H} rx={8} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1} strokeDasharray="4 3" />
      {/* prev / next controls */}
      {[{ cx: X + 14, d: 'M 3 -6 l -6 6 l 6 6' }, { cx: X + W - 14, d: 'M -3 -6 l 6 6 l -6 6' }].map((c, i) => (
        <g key={i}>
          <circle cx={c.cx} cy={Y + H / 2} r={13} fill={C.fill} stroke={C.edge} strokeWidth={1.5} />
          <path d={`M ${c.cx} ${Y + H / 2} ${c.d}`} fill="none" stroke={C.line} strokeWidth={1.6} />
        </g>
      ))}
      <text x={X + itemW / 2} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">item</text>
      <text x={X + W - 14} y={Y + H + 18} textAnchor="middle" className="bpLabel bpMuted">control</text>
      {gap && <HDim x1={X + itemW} x2={X + itemW + g} y={Y + H + 14} label={gap} above={false} />}
      <BpTitle />
      <Foot y={204} parts={[gap && `gap: ${gap}`, radius && `radius: ${radius}`]} />
    </svg>
  );
}

// Heatmap: columns of level-shaded cells with a less-to-more legend.
function HeatmapBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 214" className="bpSvg" role="img" aria-label="Blueprint of the heatmap">
      <Defs />
      <rect x={0} y={0} width={400} height={214} fill="url(#bpGrid)" />
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
      <text x={X} y={Y + rowsN * (cs + g) + 12 + cs * 0.55} textAnchor="start" className="bpLabel bpMuted">less</text>
      <text x={X + gridW} y={Y + rowsN * (cs + g) + 12 + cs * 0.55} textAnchor="end" className="bpLabel bpMuted">more</text>
      <text x={X + cs / 2} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">cell</text>
      <text x={200} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">legend →</text>
      <BpTitle />
      <Foot y={206} parts={[cell && `cell: ${cell}`, gap && `gap: ${gap}`, radius && `radius: ${radius}`]} />
    </svg>
  );
}

// Spotlight: a dimmed backdrop, a cutout ring on the target, and the callout.
function SpotlightBlueprint({ size, dimensions }: BlueprintProps) {
  const radius = fmt(dimensions?.radius);
  const cutoutRadius = fmt(dimensions?.cutoutRadius);
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the spotlight">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <text x={105} y={72} textAnchor="middle" className="bpLabel bpMuted">cutout</text>
      <text x={263} y={56} textAnchor="middle" className="bpLabel bpMuted">callout</text>
      <text x={52} y={52} className="bpLabel bpMuted">backdrop</text>
      <BpTitle />
      <Foot parts={[radius && `radius: ${radius}`, cutoutRadius && `cutout: ${cutoutRadius}`]} />
    </svg>
  );
}

// ---- Organisms ---------------------------------------------------------

// Modal: a blurred overlay centering a glass panel with header, body, footer.
// Fieldset: shown in its bordered form so the anatomy reads - the legend chip
// floating on the border with the actions pinned to its line, the description
// under it, and the stacked fields one gap step apart.
function FieldsetBlueprint({ dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 248" className="bpSvg" role="img" aria-label="Blueprint of the fieldset">
      <Defs />
      <rect x={0} y={0} width={400} height={248} fill="url(#bpGrid)" />
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

      <text x={X - 10} y={Y - 2} textAnchor="end" className="bpLabel bpMuted">legend</text>
      <text x={X + W + 12} y={Y - 2} className="bpLabel bpMuted">actions</text>
      <text x={X - 10} y={Y + 20} textAnchor="end" className="bpLabel bpMuted">description</text>
      <text x={X - 10} y={f1 + fieldH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">content</text>
      <BpTitle />
      <Foot y={240} parts={[padding && `padding: ${padding}`, radius && `radius: ${radius}`, border && `border: ${border}`]} />
    </svg>
  );
}

// FormSection: the page-level grouping - a stacking divider above, the title
// row with actions at its end, the description, and the content region.
function FormSectionBlueprint({ dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 236" className="bpSvg" role="img" aria-label="Blueprint of the form section">
      <Defs />
      <rect x={0} y={0} width={400} height={236} fill="url(#bpGrid)" />
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

      <text x={X - 10} y={divY + 4} textAnchor="end" className="bpLabel bpMuted">divider</text>
      <text x={X - 10} y={titleY + 2} textAnchor="end" className="bpLabel bpMuted">title</text>
      <text x={X - 10} y={titleY + 20} textAnchor="end" className="bpLabel bpMuted">description</text>
      <text x={X - 10} y={contentY + contentH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">content</text>
      <text x={X + W + 12} y={titleY + 2} className="bpLabel bpMuted">actions</text>
      <BpTitle />
      <Foot y={228} parts={[headerGap && `header gap: ${headerGap}`, contentOffset && `content offset: ${contentOffset}`, border && `border: ${border}`]} />
    </svg>
  );
}


// Sidebar: a vertical navigation column - pinned header, section heading, item
// rows with the sliding active pill, and a pinned footer behind hairlines.
function SidebarBlueprint({ dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 244" className="bpSvg" role="img" aria-label="Blueprint of the sidebar">
      <Defs />
      <rect x={0} y={0} width={400} height={244} fill="url(#bpGrid)" />
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
      <text x={X - 10} y={Y + 18} textAnchor="end" className="bpLabel bpMuted">header</text>
      <text x={X - 10} y={r1 - 8} textAnchor="end" className="bpLabel bpMuted">section</text>
      <text x={X - 10} y={r1 + rowH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">indicator</text>
      <text x={X + W + 12} y={r2 + rowH / 2 + 3} className="bpLabel bpMuted">item</text>
      <text x={X - 10} y={Y + H - 11} textAnchor="end" className="bpLabel bpMuted">footer</text>
      <BpTitle />
      <Foot y={236} parts={[regionPadding && `region pad: ${regionPadding}`, itemRadius && `item radius: ${itemRadius}`, border && `border: ${border}`]} />
    </svg>
  );
}

// Toolbar: the horizontal action strip - a leading start slot, the growing
// middle, and end-aligned controls, with the slot gap dimensioned.
function ToolbarBlueprint({ dimensions }: BlueprintProps) {
  const padding = fmt(dimensions?.padding);
  const gap = fmt(dimensions?.gap);
  const X = 62;
  const Y = 86;
  const W = 276;
  const H = 44;
  const a1 = X + W - 10 - 30;
  const a2 = a1 - 18 - 26;
  return (
    <svg viewBox="0 0 400 200" className="bpSvg" role="img" aria-label="Blueprint of the toolbar">
      <Defs />
      <rect x={0} y={0} width={400} height={200} fill="url(#bpGrid)" />
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

      <HDim x1={X} x2={X + W} y={Y - 18} label="width: auto" />
      <text x={X - 10} y={Y + H / 2 + 3} textAnchor="end" className="bpLabel bpMuted">start</text>
      <text x={(X + 108 + a2 - 18) / 2} y={Y + H / 2 - 8} textAnchor="middle" className="bpLabel bpMuted">content</text>
      <text x={X + W + 12} y={Y + H / 2 + 3} className="bpLabel bpMuted">end</text>
      <BpTitle />
      <Foot y={190} parts={[padding && `padding: ${padding}`, gap && `gap: ${gap}`, 'surface: glass-thin']} />
    </svg>
  );
}

// NavBar: the primary navigation row - icon-first items, the sliding active
// pill behind the current one, a badge on an item, and the end slot.
function NavBarBlueprint({ dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 196" className="bpSvg" role="img" aria-label="Blueprint of the nav bar">
      <Defs />
      <rect x={0} y={0} width={400} height={196} fill="url(#bpGrid)" />
      <Frame x={X} y={Y} w={W} h={H} r={12} />
      {item(0, true)}
      {item(1, false)}
      {item(2, false)}
      {/* a counter badge riding the third item */}
      <circle cx={ix(2) + itemW - 4} cy={iy + 2} r={6} fill={C.content} fillOpacity={0.55} stroke={C.text} strokeWidth={1} />
      {/* the end slot */}
      <circle cx={X + W - 20} cy={Y + H / 2} r={9} fill="none" stroke={C.edge} strokeWidth={1.25} strokeDasharray="2 2" />

      {gap && <HDim x1={ix(0) + itemW} x2={ix(1)} y={Y + H + 14} label={gap} above={false} />}
      <text x={X - 6} y={iy + itemH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">indicator</text>
      <text x={ix(1) + itemW / 2} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">item</text>
      <text x={ix(2) + itemW + 14} y={iy - 4} className="bpLabel bpMuted">badge</text>
      <text x={X + W + 12} y={Y + H / 2 + 3} className="bpLabel bpMuted">end</text>
      <BpTitle />
      <Foot y={188} parts={[itemSize && `item: ${itemSize}`, padding && `pad: ${padding}`, radius && `radius: ${radius}`]} />
    </svg>
  );
}


// AppShell: the app frame - a sticky sidebar column beside a scrollable main
// column with a header bar on top. The figure shows the desktop grid.
function AppShellBlueprint({ dimensions }: BlueprintProps) {
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
  const sideX = X + P;
  const regionY = Y + P;
  const mainX = sideX + sideW + G;
  const mainW = X + W - P - mainX;
  const contentY = regionY + headerH + G;
  return (
    <svg viewBox="0 0 400 258" className="bpSvg" role="img" aria-label="Blueprint of the app shell">
      <Defs />
      <rect x={0} y={0} width={400} height={258} fill="url(#bpGrid)" />
      {/* the app frame */}
      <Frame x={X} y={Y} w={W} h={H} r={12} />
      {/* sidebar region with a few nav rows */}
      <rect x={sideX} y={regionY} width={sideW} height={H - P * 2} rx={8} fill={C.content} fillOpacity={0.2} stroke={C.text} strokeWidth={1} />
      <Ln x={sideX + 12} y={regionY + 12} w={sideW - 24} h={5} op={0.7} />
      <Ln x={sideX + 12} y={regionY + 28} w={sideW - 30} h={5} op={0.4} />
      <Ln x={sideX + 12} y={regionY + 42} w={sideW - 38} h={5} op={0.4} />
      {/* header region */}
      <rect x={mainX} y={regionY} width={mainW} height={headerH} rx={6} fill={C.content} fillOpacity={0.28} stroke={C.text} strokeWidth={1} />
      {/* main content rows */}
      <Ln x={mainX + 4} y={contentY} w={mainW - 40} h={5} op={0.3} />
      <Ln x={mainX + 4} y={contentY + 14} w={mainW - 16} h={5} op={0.3} />
      <Ln x={mainX + 4} y={contentY + 28} w={mainW - 64} h={5} op={0.3} />
      {/* sidebar width across the top, kept clear of the title */}
      <HDim x1={sideX} x2={sideX + sideW} y={Y - 16} label="sidebar: 16rem" />
      {/* region labels */}
      <text x={mainX + mainW / 2} y={regionY + headerH / 2 + 4} textAnchor="middle" className="bpLabel bpMuted">header</text>
      <text x={sideX + sideW / 2} y={Y + H - 14} textAnchor="middle" className="bpLabel bpMuted">sidebar</text>
      <text x={mainX + mainW / 2} y={Y + H - 14} textAnchor="middle" className="bpLabel bpMuted">main</text>
      <BpTitle />
      <Foot y={248} parts={[gutter && `gutter: ${gutter}`, radius && `radius: ${radius}`, border && `border: ${border}`]} />
    </svg>
  );
}

function ModalBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the modal">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <text x={OX + 8} y={OY + 15} className="bpLabel bpMuted">overlay</text>
      <text x={PX - 10} y={PY + PH / 2} textAnchor="end" className="bpLabel bpMuted">panel</text>
      <text x={R + 10} y={PY + 16} className="bpLabel bpMuted">close</text>
      <text x={R + 10} y={PY + 32} className="bpLabel bpMuted">header</text>
      <text x={R + 10} y={PY + 64} className="bpLabel bpMuted">body</text>
      <text x={R + 10} y={PY + PH - 16} className="bpLabel bpMuted">footer</text>
      <BpTitle />
      <Foot parts={[diameter && `width: ${diameter}`, radius && `radius: ${radius}`, panelPad && `padding: ${panelPad}`]} />
    </svg>
  );
}

// AlertDialog: the blurred overlay, the centered panel with title and
// consequence text, and the two actions that define the pattern - Cancel
// (ringed, focused first on open) and the confirming Action - with the
// footer gap dimensioned from the spec.
function AlertDialogBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 234" className="bpSvg" role="img" aria-label="Blueprint of the alert dialog">
      <Defs />
      <rect x={0} y={0} width={400} height={234} fill="url(#bpGrid)" />
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

      <text x={OX + 8} y={OY + 15} className="bpLabel bpMuted">overlay</text>
      <text x={PX - 10} y={PY + 20} textAnchor="end" className="bpLabel bpMuted">panel</text>
      <text x={R + 10} y={PY + 20} className="bpLabel bpMuted">title</text>
      <text x={R + 10} y={PY + 38} className="bpLabel bpMuted">description</text>
      <text x={PX - 10} y={BY + BH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">cancel ⌖</text>
      <text x={R + 10} y={BY + BH / 2 + 3} className="bpLabel bpMuted">action</text>
      <BpTitle />
      <Foot y={226} parts={[radius && `radius: ${radius}`, panelPad && `panel pad: ${panelPad}`, footerGap && `footer gap: ${footerGap}`, border && `border: ${border}`]} />
    </svg>
  );
}

// Popover: a trigger with an anchored, arrowed panel offset below it.
function PopoverBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the popover">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <text x={cx + trigW / 2 + 12} y={trigY + trigH / 2 + 3} className="bpLabel bpMuted">trigger</text>
      <text x={panelX + panelW + 12} y={panelY + panelH / 2} className="bpLabel bpMuted">content</text>
      <text x={panelX - 10} y={panelY + 14} textAnchor="end" className="bpLabel bpMuted">panel</text>
      {offset && <VDim x={panelX - 24} y1={trigY + trigH} y2={panelY} label={`offset ${offset}`} horizontal />}
      <BpTitle />
      <Foot parts={[radius && `radius: ${radius}`, padding && `padding: ${padding}`]} />
    </svg>
  );
}

// Menu: a trigger with a portalled panel of items, a separator, and a label.
function MenuBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the menu">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <text x={X + W + 12} y={menuY + 14} className="bpLabel bpMuted">menu</text>
      <text x={X + W + 12} y={rowY(0) + 6} className="bpLabel bpMuted">item</text>
      <text x={X - 10} y={rowY(2) + 4} textAnchor="end" className="bpLabel bpMuted">separator</text>
      <text x={X - 10} y={trigY + trigH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">trigger</text>
      <BpTitle />
      <Foot parts={[radius && `radius: ${radius}`, gap && `gap: ${gap}`, 'icon · label · shortcut']} />
    </svg>
  );
}

// FloatingPanel: a draggable panel with a grab-bar handle, title, close, body.
function FloatingPanelBlueprint({ size, dimensions }: BlueprintProps) {
  const radius = fmt(dimensions?.radius);
  const gap = fmt(dimensions?.gap);
  const X = 112;
  const W = 176;
  const Y = 44;
  const H = 126;
  const handleH = 30;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the floating panel">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <text x={X - 10} y={Y + handleH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">handle</text>
      <text x={X + W + 12} y={Y + handleH / 2 + 3} className="bpLabel bpMuted">close</text>
      <text x={X + W + 12} y={Y + handleH + 34} className="bpLabel bpMuted">body</text>
      <BpTitle />
      <Foot parts={[radius && `radius: ${radius}`, gap && `gap: ${gap}`, 'drag the handle to move']} />
    </svg>
  );
}

// TabbedPanel: a bordered frame with a tab header (+ actions) and a body.
function TabbedPanelBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the tabbed panel">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <text x={X + 12 + tabW / 2} y={Y - 8} textAnchor="middle" className="bpLabel bpMuted">tab</text>
      <text x={X + W - 23} y={Y - 8} textAnchor="middle" className="bpLabel bpMuted">actions</text>
      <text x={X + W + 12} y={Y + headerH + 34} className="bpLabel bpMuted">body</text>
      <text x={X - 10} y={Y + headerH / 2 + 3} textAnchor="end" className="bpLabel bpMuted">header</text>
      <BpTitle />
      <Foot parts={[radius && `radius: ${radius}`, bodyPad && `body pad: ${bodyPad}`, border && `border: ${border}`]} />
    </svg>
  );
}

// TabbedModal: a modal with a fixed left rail of sections and a scrolling pane.
function TabbedModalBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the tabbed modal">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <text x={X - 10} y={Y + 20} textAnchor="end" className="bpLabel bpMuted">rail</text>
      <text x={X + railW + (W - railW) / 2} y={Y - 8} textAnchor="middle" className="bpLabel bpMuted">pane</text>
      <text x={X - 10} y={Y + 16 + itemH + 8} textAnchor="end" className="bpLabel bpMuted">rail item</text>
      <BpTitle />
      <Foot parts={[radius && `radius: ${radius}`, gap && `gap: ${gap}`, rail && `rail: ${rail}`]} />
    </svg>
  );
}

// TabStrip: a scrollable row of closable tabs with a springing underline.
function TabStripBlueprint({ size, dimensions }: BlueprintProps) {
  const radius = fmt(dimensions?.radius);
  const padIn = fmt(dimensions?.paddingInline);
  const gap = fmt(dimensions?.gap);
  const X = 50;
  const tabW = 96;
  const g = 6;
  const Y = 74;
  const H = 34;
  return (
    <svg viewBox="0 0 400 204" className="bpSvg" role="img" aria-label="Blueprint of the tab strip">
      <Defs />
      <rect x={0} y={0} width={400} height={204} fill="url(#bpGrid)" />
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
      <text x={X + tabW / 2} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">tab</text>
      <text x={X + 17} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">icon</text>
      <text x={X + tabW - 16} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">close</text>
      <text x={X + tabW / 2} y={Y + H + 22} textAnchor="middle" className="bpLabel bpMuted">indicator</text>
      {padIn && <HDim x1={X} x2={X + 16} y={Y + H + 30} label={padIn} above={false} />}
      <BpTitle />
      <Foot y={192} parts={[radius && `radius: ${radius}`, gap && `gap: ${gap}`]} />
    </svg>
  );
}

// ResizableSplitPane: two panes divided by a draggable separator grip.
function ResizableSplitPaneBlueprint({ size, dimensions }: BlueprintProps) {
  const radius = fmt(dimensions?.radius);
  const gripHeight = fmt(dimensions?.gripHeight);
  const thickness = fmt(dimensions?.thickness);
  const X = 62;
  const W = 276;
  const Y = 56;
  const H = 104;
  const divX = X + Math.round(W * 0.42);
  return (
    <svg viewBox="0 0 400 230" className="bpSvg" role="img" aria-label="Blueprint of the resizable split pane">
      <Defs />
      <rect x={0} y={0} width={400} height={230} fill="url(#bpGrid)" />
      {/* start pane */}
      <rect x={X} y={Y} width={divX - X - 6} height={H} rx={10} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {/* end pane */}
      <rect x={divX + 6} y={Y} width={X + W - divX - 6} height={H} rx={10} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {/* divider + grip */}
      <line x1={divX} y1={Y} x2={divX} y2={Y + H} stroke={C.line} strokeWidth={1.5} />
      <rect x={divX - 2.5} y={Y + H / 2 - 16} width={5} height={32} rx={2.5} fill={C.line} />
      <text x={X + (divX - X) / 2} y={Y + H / 2 + 3} textAnchor="middle" className="bpLabel bpMuted">start</text>
      <text x={divX + (X + W - divX) / 2} y={Y + H / 2 + 3} textAnchor="middle" className="bpLabel bpMuted">end</text>
      <text x={divX} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">divider</text>
      <HDim x1={X} x2={divX} y={Y + H + 16} label="ratio" above={false} />
      <BpTitle />
      <Foot y={222} parts={[radius && `radius: ${radius}`, gripHeight && `grip: ${gripHeight}`, thickness && `divider: ${thickness}`]} />
    </svg>
  );
}

function Defs() {
  return (
    <defs>
      <pattern id="bpGrid" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx={1} cy={1} r={0.75} fill={C.grid} />
      </pattern>
    </defs>
  );
}

// StatTile: a micro-card with a leading icon disc, a prominent value and trailing
// hint, and a muted label below.
function StatTileBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the stat tile">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
      <Frame x={X} y={Y} w={W} h={H} r={14} />
      <rect x={iconX} y={iconY} width={iconS} height={iconS} rx={9} fill={C.content} fillOpacity={0.28} stroke={C.text} strokeWidth={1} strokeDasharray="3 2" />
      <g transform={`translate(${iconX + iconS / 2 - 9} ${iconY + iconS / 2 - 9}) scale(${18 / 24})`} fill={C.line} stroke="none">
        <path d={PLACEHOLDER_ICON} />
      </g>
      <text x={colX} y={Y + 38} fill={C.text} stroke="none" style={{ fontFamily: 'var(--glacier-font-sans)', fontSize: 25, fontWeight: 700 }}>1,240</text>
      <rect x={colX + 96} y={Y + 20} width={40} height={18} rx={9} fill={C.content} fillOpacity={0.32} />
      <text x={colX + 116} y={Y + 30} textAnchor="middle" dominantBaseline="central" fill={C.text} stroke="none" style={{ fontFamily: 'var(--glacier-font-sans)', fontSize: 10, fontWeight: 600 }}>+12%</text>
      <Ln x={colX} y={Y + 56} w={96} h={7} op={0.4} />
      <text x={iconX + iconS / 2} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">icon</text>
      <text x={colX + 24} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">value</text>
      <text x={colX + 116} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">hint</text>
      <text x={colX} y={Y + H + 18} className="bpLabel bpMuted">label</text>
      <HDim x1={X} x2={X + W} y={Y - 26} label="width: auto" />
      <BpTitle />
      <Foot parts={[radius && `radius: ${radius}`, padIn && `padding: ${padIn}`, gap && `gap: ${gap}`]} />
    </svg>
  );
}

// DeviceFrame: a phone bezel with an inset screen, a top notch, and side buttons.
function DeviceFrameBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 250" className="bpSvg" role="img" aria-label="Blueprint of the device frame">
      <Defs />
      <rect x={0} y={0} width={400} height={250} fill="url(#bpGrid)" />
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
      <HDim x1={sx} x2={sx + sw} y={py - 14} label={width ? `screen: ${width}` : 'screen'} />
      <text x={px + pw + 14} y={py + 18} className="bpLabel bpMuted">bezel</text>
      <text x={sx + sw / 2} y={notchY + notchH + 16} textAnchor="middle" className="bpLabel bpMuted">notch</text>
      <text x={px - 12} y={py + 46} textAnchor="end" className="bpLabel bpMuted">buttons</text>
      <text x={px + pw + 14} y={py + ph / 2 + 24} className="bpLabel bpMuted">screen</text>
      <BpTitle />
      <Foot y={244} parts={[radius && `radius: ${radius}`, screenRadius && `screen: ${screenRadius}`, bezel && `bezel: ${bezel}`]} />
    </svg>
  );
}

// FilterChip: a toggle pill shown selected (accent tint) with a leading icon, a
// label, and a trailing count badge.
function FilterChipBlueprint({ size, dimensions }: BlueprintProps) {
  const height = fmt(size.height);
  const padIn = fmt(size.paddingInline);
  const radius = fmt(dimensions?.radius);
  const border = fmt(dimensions?.border);
  const CW = 176;
  const CH = 46;
  const CX = (400 - CW) / 2;
  const CY = 86;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the filter chip">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
      <rect x={CX} y={CY} width={CW} height={CH} rx={CH / 2} fill="var(--glacier-accent-soft)" stroke="var(--glacier-accent-border)" strokeWidth={1.5} />
      <g transform={`translate(${CX + 20} ${CY + CH / 2 - 8}) scale(${16 / 24})`} fill={C.line} stroke="none">
        <path d={PLACEHOLDER_ICON} />
      </g>
      <Ln x={CX + 44} y={CY + CH / 2 - 3.5} w={64} h={7} op={0.6} />
      <circle cx={CX + CW - 26} cy={CY + CH / 2} r={13} fill={C.content} fillOpacity={0.42} stroke={C.text} strokeWidth={1} />
      <text x={CX + CW - 26} y={CY + CH / 2} textAnchor="middle" dominantBaseline="central" fill={C.text} stroke="none" style={{ fontFamily: 'var(--glacier-font-sans)', fontSize: 11, fontWeight: 600 }}>3</text>
      <text x={CX + 20} y={CY - 12} textAnchor="middle" className="bpLabel bpMuted">icon</text>
      <text x={CX + 76} y={CY - 12} textAnchor="middle" className="bpLabel bpMuted">label</text>
      <text x={CX + CW - 26} y={CY - 12} textAnchor="middle" className="bpLabel bpMuted">count</text>
      <text x={CX + CW / 2} y={CY + CH + 20} textAnchor="middle" className="bpLabel bpMuted">selected</text>
      <HDim x1={CX} x2={CX + CW} y={CY - 30} label="width: auto" />
      {height && <VDim x={CX - 22} y1={CY} y2={CY + CH} label={height} />}
      <BpTitle />
      <Foot parts={[radius && `radius: ${radius}`, padIn && `padding: ${padIn}`, border && `border: ${border}`]} />
    </svg>
  );
}

// Image: a fixed aspect-ratio frame that clips and rounds an image, with a
// fallback shown on error.
function ImageBlueprint({ size }: BlueprintProps) {
  const X = 134;
  const Y = 42;
  const W = 132;
  const H = 126;
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the image">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <text x={X + W / 2} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">frame</text>
      <text x={X + W + 14} y={Y + H / 2 - 6} className="bpLabel bpMuted">image</text>
      <text x={X - 14} y={Y + H / 2 + 8} textAnchor="end" className="bpLabel bpMuted">fallback</text>
      <BpTitle />
      <Foot parts={['radius: md', 'fit: cover', 'aspect: auto']} />
    </svg>
  );
}

// Breadcrumbs: a short chain of linked steps separated by a slash.
function BreadcrumbsBlueprint({ size }: BlueprintProps) {
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the breadcrumbs">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
      <rect x={60} y={78} width={304} height={56} rx={12} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <text x={94} y={110} className="bpLabel" fill={C.text}>Home</text>
      <text x={164} y={110} className="bpLabel" fill={C.text}>/</text>
      <text x={196} y={110} className="bpLabel" fill={C.text}>Docs</text>
      <text x={248} y={110} className="bpLabel" fill={C.text}>/</text>
      <text x={278} y={110} className="bpLabel" fill={C.text}>Components</text>
      <BpTitle />
      <Foot parts={['separator: /']} />
    </svg>
  );
}

// Pagination: a previous/next pair around a compact set of page-number buttons.
function PaginationBlueprint({ size }: BlueprintProps) {
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the pagination">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
      <rect x={70} y={88} width={72} height={34} rx={17} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <rect x={156} y={88} width={34} height={34} rx={17} fill={C.content} fillOpacity={0.32} stroke={C.edge} strokeWidth={1.25} />
      <rect x={204} y={88} width={34} height={34} rx={17} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <rect x={252} y={88} width={34} height={34} rx={17} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <rect x={300} y={88} width={76} height={34} rx={17} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <text x={106} y={105} textAnchor="middle" dominantBaseline="middle" className="bpLabel" fill={C.text}>Prev</text>
      <text x={173} y={105} textAnchor="middle" dominantBaseline="middle" className="bpLabel" fill={C.text}>2</text>
      <text x={221} y={105} textAnchor="middle" dominantBaseline="middle" className="bpLabel" fill={C.text}>3</text>
      <text x={269} y={105} textAnchor="middle" dominantBaseline="middle" className="bpLabel" fill={C.text}>4</text>
      <text x={338} y={105} textAnchor="middle" dominantBaseline="middle" className="bpLabel" fill={C.text}>Next</text>
      <BpTitle />
      <Foot parts={['page: 2', 'total: 20']} />
    </svg>
  );
}

// Accordion: a row of disclosure headers and one open panel body.
function AccordionBlueprint({ size }: BlueprintProps) {
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the accordion">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
      <rect x={72} y={56} width={256} height={42} rx={12} fill={C.content} fillOpacity={0.16} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <rect x={72} y={108} width={256} height={72} rx={12} fill={C.content} fillOpacity={0.1} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <text x={102} y={82} className="bpLabel" fill={C.text}>Section one</text>
      <text x={102} y={140} className="bpLabel" fill={C.text}>Details</text>
      <BpTitle />
      <Foot parts={['open: one', 'collapsed: rest']} />
    </svg>
  );
}

// Table: a semantic grid with a header row and two body rows.
function TableBlueprint({ size }: BlueprintProps) {
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the table">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
      <rect x={56} y={54} width={288} height={112} rx={10} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <line x1={56} y1={90} x2={344} y2={90} stroke={C.line} strokeWidth={1.25} />
      <line x1={56} y1={122} x2={344} y2={122} stroke={C.line} strokeWidth={1.25} />
      <line x1={56} y1={154} x2={344} y2={154} stroke={C.line} strokeWidth={1.25} />
      <text x={92} y={76} className="bpLabel" fill={C.text}>Name</text>
      <text x={232} y={76} className="bpLabel" fill={C.text}>Status</text>
      <text x={92} y={108} className="bpLabel" fill={C.text}>Ada</text>
      <text x={232} y={108} className="bpLabel" fill={C.text}>Active</text>
      <text x={92} y={140} className="bpLabel" fill={C.text}>Grace</text>
      <text x={232} y={140} className="bpLabel" fill={C.text}>Paused</text>
      <BpTitle />
      <Foot parts={['headers', 'rows']} />
    </svg>
  );
}

// Data grid: like the table, plus a leading selection column of checkboxes and
// a sortable header carrying a direction caret.
function DataGridBlueprint(_: BlueprintProps) {
  const rows = [108, 140];
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the data grid">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <text x={100} y={76} className="bpLabel" fill={C.text}>Name</text>
      <path d="M150 70 l4 4 l4 -4" fill="none" stroke={C.text} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <text x={240} y={76} className="bpLabel" fill={C.text}>Status</text>
      <text x={100} y={108} className="bpLabel" fill={C.text}>Ada</text>
      <text x={240} y={108} className="bpLabel" fill={C.text}>Active</text>
      <text x={100} y={140} className="bpLabel" fill={C.text}>Grace</text>
      <text x={240} y={140} className="bpLabel" fill={C.text}>Paused</text>
      <BpTitle />
      <Foot parts={['select', 'sortable header', 'rows']} />
    </svg>
  );
}

// Page header: breadcrumbs above a title block (title, description, meta pills)
// with the actions cluster and overflow trigger end-aligned.
function PageHeaderBlueprint({ dimensions }: BlueprintProps) {
  const padBlock = fmt(dimensions?.paddingBlock);
  const gap = fmt(dimensions?.sectionGap);
  return (
    <svg viewBox="0 0 400 220" className="bpSvg" role="img" aria-label="Blueprint of the page header">
      <Defs />
      <rect x={0} y={0} width={400} height={220} fill="url(#bpGrid)" />
      <rect x={28} y={44} width={344} height={140} rx={10} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {/* padding-block from the region edge down to the first content */}
      <VDim x={38} y1={44} y2={58} label={padBlock ? `pad: ${padBlock}` : 'padding-block'} left={false} horizontal />
      {/* breadcrumbs */}
      <text x={46} y={72} className="bpLabel" fill={C.faint}>Library / Courses</text>
      {/* title + description + meta */}
      <text x={46} y={100} fill={C.text} fontSize={15} fontWeight={650}>Page title</text>
      <rect x={46} y={110} width={168} height={6} rx={3} fill={C.content} fillOpacity={0.55} />
      <rect x={46} y={132} width={44} height={13} rx={6.5} fill="none" stroke={C.edge} strokeWidth={1.25} />
      <rect x={96} y={132} width={34} height={13} rx={6.5} fill="none" stroke={C.edge} strokeWidth={1.25} />
      {/* stack gap between the description and the meta row */}
      <VDim x={228} y1={116} y2={132} label={gap ? `gap: ${gap}` : 'gap'} left={false} horizontal />
      {/* actions cluster + overflow trigger */}
      <rect x={232} y={56} width={50} height={22} rx={6} fill="none" stroke={C.edge} strokeWidth={1.25} />
      <rect x={288} y={56} width={50} height={22} rx={6} fill={C.content} fillOpacity={0.5} stroke={C.edge} strokeWidth={1.25} />
      <rect x={344} y={56} width={22} height={22} rx={6} fill="none" stroke={C.edge} strokeWidth={1.25} strokeDasharray="3 2" />
      <circle cx={351} cy={67} r={1.1} fill={C.text} />
      <circle cx={355} cy={67} r={1.1} fill={C.text} />
      <circle cx={359} cy={67} r={1.1} fill={C.text} />
      <BpTitle />
      <Foot parts={['breadcrumbs', 'title + description', 'meta', 'actions', 'overflow']} />
    </svg>
  );
}

// Section: a heading row with an end-aligned action, a description line, then
// the content region a token gap below; a hairline divider tops stacked sections.
function SectionBlueprint({ dimensions }: BlueprintProps) {
  const gap = fmt(dimensions?.gap);
  return (
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the section">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
      <line x1={36} y1={44} x2={364} y2={44} stroke={C.line} strokeWidth={1.25} strokeDasharray="5 3" />
      <text x={370} y={40} textAnchor="end" className="bpLabel" fill={C.faint}>divider</text>
      {/* heading row */}
      <text x={44} y={72} fill={C.text} fontSize={14} fontWeight={650}>Section title</text>
      <rect x={300} y={58} width={56} height={20} rx={6} fill="none" stroke={C.edge} strokeWidth={1.25} />
      <rect x={44} y={82} width={150} height={6} rx={3} fill={C.content} fillOpacity={0.55} />
      {/* gap dimension into the content region */}
      <VDim x={36} y1={92} y2={116} label={gap ? `gap: ${gap}` : 'gap'} />
      <rect x={44} y={116} width={312} height={54} rx={8} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <text x={200} y={147} textAnchor="middle" className="bpLabel" fill={C.faint}>content</text>
      <BpTitle />
      <Foot y={216} parts={['aria-labelledby wires the heading', 'header row', 'content']} />
    </svg>
  );
}

// Card group: an auto-fill grid of card slots that wrap at the minimum item
// width, with the min-width and gap called out.
function CardGroupBlueprint({ dimensions }: BlueprintProps) {
  const gap = fmt(dimensions?.gap);
  const cols = [40, 152, 264];
  const rows = [54, 122];
  return (
    <svg viewBox="0 0 400 226" className="bpSvg" role="img" aria-label="Blueprint of the card group">
      <Defs />
      <rect x={0} y={0} width={400} height={226} fill="url(#bpGrid)" />
      {rows.map((y) =>
        cols.map((x) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={96} height={52} rx={8} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
            <rect x={x + 10} y={y + 12} width={44} height={6} rx={3} fill={C.content} fillOpacity={0.55} />
            <rect x={x + 10} y={y + 26} width={64} height={5} rx={2.5} fill={C.content} fillOpacity={0.35} />
          </g>
        )),
      )}
      <HDim x1={40} x2={136} y={190} label="min-item: 16rem" />
      <VDim x={372} y1={106} y2={122} label={gap ?? 'gap'} horizontal />
      <BpTitle />
      <Foot y={220} parts={['grid: repeat(auto-fill, minmax(min-item, 1fr))', 'list: one column']} />
    </svg>
  );
}

// Timeline: tone-colored markers on a shared connector rail, each event's
// content block beside it; the last marker ends the rail.
function TimelineBlueprint(_: BlueprintProps) {
  const items = [
    { y: 64, filled: true, icon: true },
    { y: 118, filled: true, icon: false },
    { y: 172, filled: false, icon: false },
  ];
  return (
    <svg viewBox="0 0 400 230" className="bpSvg" role="img" aria-label="Blueprint of the timeline">
      <Defs />
      <rect x={0} y={0} width={400} height={230} fill="url(#bpGrid)" />
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
      <text x={196} y={151} className="bpLabel" fill={C.faint}>media</text>
      <text x={26} y={94} className="bpLabel" fill={C.faint} transform="rotate(-90 26 94)">rail</text>
      <BpTitle />
      <Foot y={222} parts={['marker + connector rail', 'actor, title, timestamp', 'description, media, actions']} />
    </svg>
  );
}

// Wizard: the connected Steps progress row, the active step's label, the
// content panel, the error live region, and the previous/next footer.
function WizardBlueprint({ dimensions }: BlueprintProps) {
  const gap = fmt(dimensions?.gap);
  const radius = fmt(dimensions?.panelRadius);
  const markers = [
    { x: 60, state: 'done' },
    { x: 116, state: 'active' },
    { x: 172, state: 'todo' },
  ] as const;
  return (
    <svg viewBox="0 0 400 230" className="bpSvg" role="img" aria-label="Blueprint of the wizard">
      <Defs />
      <rect x={0} y={0} width={400} height={230} fill="url(#bpGrid)" />
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
      <text x={44} y={100} fill={C.text} fontSize={14} fontWeight={650}>Account details</text>
      <VDim x={364} y1={104} y2={116} label={gap ? `gap: ${gap}` : 'gap'} horizontal />
      <rect x={44} y={116} width={312} height={38} rx={8} fill={C.content} fillOpacity={0.12} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      <text x={200} y={139} textAnchor="middle" className="bpLabel" fill={C.faint}>panel: role="group", focused on navigation</text>
      {/* error live region */}
      <text x={44} y={162} className="bpLabel" fill={C.faint}>error live region</text>
      {/* footer actions */}
      <rect x={232} y={166} width={58} height={22} rx={6} fill="none" stroke={C.edge} strokeWidth={1.25} />
      <rect x={296} y={166} width={58} height={22} rx={6} fill={C.content} fillOpacity={0.5} stroke={C.edge} strokeWidth={1.25} />
      <BpTitle />
      <Foot y={222} parts={['progress', radius && `panel radius: ${radius}`, 'error region', 'previous / next']} />
    </svg>
  );
}

// Rating: a row of stars filled to the value (3.5 of 5 here), with a half-filled
// star to show fractional display and the rest hollow.
function RatingBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the rating">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
      <text x={SX + starS / 2} y={SY - 12} textAnchor="middle" className="bpLabel bpMuted">star</text>
      {gap && <HDim x1={SX + starS} x2={SX + starS + g} y={SY + starS + 16} label={gap} above={false} />}
      <text x={200} y={SY + starS + 40} textAnchor="middle" className="bpLabel bpMuted">value 3.5 / 5</text>
      <BpTitle />
      <Foot parts={[font && `star: ${font}`]} />
    </svg>
  );
}

// OtpField: the six code cells with three entered digits, the active cell
// carrying the caret, dimensioned with the cell height, gap, and radius.
function OtpFieldBlueprint({ size, dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 224" className="bpSvg" role="img" aria-label="Blueprint of the otp field">
      <Defs />
      <rect x={0} y={0} width={400} height={224} fill="url(#bpGrid)" />
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
            radius: {radius}
          </text>
        </>
      )}
      <text x={SX + DIGITS.length * (cw + g) + cw / 2} y={SY - 12} textAnchor="middle" className="bpLabel bpMuted">caret</text>
      <BpTitle />
      <Foot parts={[font && `font: ${font}`, border && `border: ${border}`, 'input: invisible overlay']} />
    </svg>
  );
}

// Sparkline: the word-sized trend box with a real wavy mark, its dashed
// baseline, and the emphasis dot on the newest sample.
function SparklineBlueprint({ size, dimensions }: BlueprintProps) {
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
  const last = pts[pts.length - 1].split(',').map(Number);
  const baseY = BY + 0.3 * BH;

  return (
    <svg viewBox="0 0 400 214" className="bpSvg" role="img" aria-label="Blueprint of the sparkline">
      <Defs />
      <rect x={0} y={0} width={400} height={214} fill="url(#bpGrid)" />

      {/* the box: fluid width, fixed height */}
      <rect x={BX} y={BY} width={BW} height={BH} fill={C.fill} fillOpacity={0.5} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />

      {/* dashed baseline at a reference value */}
      <line x1={BX} y1={baseY} x2={BX + BW} y2={baseY} stroke={C.edge} strokeWidth={1.25} strokeDasharray="3 3" />
      <text x={BX + BW + 8} y={baseY + 3} className="bpLabel" fill={C.faint}>baseline</text>

      {/* the mark: a thin polyline, with the newest sample emphasized */}
      <polyline points={pts.join(' ')} fill="none" stroke={C.line} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={4} fill={C.line} />
      <text x={last[0] - 10} y={last[1] - 12} textAnchor="end" className="bpLabel" fill={C.faint}>end point</text>

      {/* dimensions: fluid width above, the size's height on the left */}
      <HDim x1={BX} x2={BX + BW} y={BY - 20} label="width: auto" />
      <VDim x={BX - 22} y1={BY} y2={BY + BH} label={`height: ${height ?? 'auto'}`} />

      <BpTitle />
      <Foot parts={[thickness && `stroke: ${thickness}`, pointDia && `point: ⌀ ${pointDia}`, baselineW && `baseline: ${baselineW}`]} />
    </svg>
  );
}

// TimelineScrubber: the recorded window with its activity silhouette, marker
// ticks, the playhead with its readout, and the live button at the edge.
function TimelineScrubberBlueprint({ size, dimensions }: BlueprintProps) {
  const height = fmt(size.height);
  const radius = fmt(dimensions?.radius);
  const playheadW = fmt(dimensions?.playheadWidth);
  const markerW = fmt(dimensions?.markerWidth);
  const handleDia = fmt(dimensions?.handleDiameter);

  const TX = 44;
  const TW = 264;
  const TY = 76;
  const TH = 64;
  const PX = TX + TW * 0.66; // playhead position
  // activity silhouette: normalized samples, a calm base with two bursts
  const act = [0.25, 0.3, 0.26, 0.35, 0.3, 0.68, 0.75, 0.5, 0.32, 0.3, 0.42, 0.55, 0.4, 0.3, 0.28, 0.34];
  const actPts = act.map((v, i) => `${TX + (i / (act.length - 1)) * TW},${TY + TH - v * TH}`);

  return (
    <svg viewBox="0 0 400 230" className="bpSvg" role="img" aria-label="Blueprint of the timeline scrubber">
      <Defs />
      <rect x={0} y={0} width={400} height={230} fill="url(#bpGrid)" />

      {/* the track over the recorded window */}
      <rect x={TX} y={TY} width={TW} height={TH} rx={8} fill={C.fill} fillOpacity={0.4} stroke={C.edge} strokeWidth={1.25} strokeDasharray="5 3" />
      {/* activity backdrop */}
      <polygon points={`${TX},${TY + TH} ${actPts.join(' ')} ${TX + TW},${TY + TH}`} fill={C.content} fillOpacity={0.35} />
      {/* marker ticks */}
      <line x1={TX + TW * 0.38} y1={TY} x2={TX + TW * 0.38} y2={TY + TH} stroke={C.edge} strokeWidth={2} />
      <line x1={TX + TW * 0.42} y1={TY} x2={TX + TW * 0.42} y2={TY + TH} stroke={C.edge} strokeWidth={2} opacity={0.6} />
      <text x={TX + TW * 0.4} y={TY - 8} textAnchor="middle" className="bpLabel" fill={C.faint}>markers</text>

      {/* playhead: the slider, its grab handle riding above the track edge */}
      <line x1={PX} y1={TY - 6} x2={PX} y2={TY + TH} stroke={C.line} strokeWidth={2.5} />
      <circle cx={PX} cy={TY - 10} r={6} fill={C.line} />
      <rect x={PX - 30} y={TY + TH + 10} width={60} height={18} rx={5} fill={C.fill} stroke={C.edge} strokeWidth={1.1} />
      <text x={PX} y={TY + TH + 23} textAnchor="middle" className="bpLabel">14:29:36</text>
      <text x={PX + 14} y={TY - 12} className="bpLabel">playhead</text>

      {/* sparse time ticks along the bottom edge */}
      <text x={TX + 4} y={TY + TH - 6} className="bpLabel" fill={C.faint}>14:15</text>
      <text x={TX + TW - 4} y={TY + TH - 6} textAnchor="end" className="bpLabel" fill={C.faint}>now</text>

      {/* the live button at the trailing edge */}
      <rect x={TX + TW + 12} y={TY + TH / 2 - 14} width={52} height={28} rx={8} fill={C.content} fillOpacity={0.5} stroke={C.edge} strokeWidth={1.25} />
      <circle cx={TX + TW + 26} cy={TY + TH / 2} r={3} fill={C.text} />
      <text x={TX + TW + 34} y={TY + TH / 2 + 3.5} className="bpLabel">Live</text>

      {/* dimensions */}
      <HDim x1={TX} x2={TX + TW} y={TY - 28} label="window: start → end" />
      <VDim x={TX - 20} y1={TY} y2={TY + TH} label={`height: ${height ?? 'auto'}`} />

      <BpTitle />
      <Foot y={222} parts={[playheadW && `playhead: ${playheadW}`, handleDia && `handle: ⌀ ${handleDia}`, markerW && `marker: ${markerW}`, radius && `radius: ${radius}`]} />
    </svg>
  );
}

// TimeSeriesChart: the plot with recessive grid and axes, two series, the
// hover crosshair, and the readout and legend rows above the plot.
function TimeSeriesChartBlueprint({ dimensions }: BlueprintProps) {
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
    <svg viewBox="0 0 400 230" className="bpSvg" role="img" aria-label="Blueprint of the time series chart">
      <Defs />
      <rect x={0} y={0} width={400} height={230} fill="url(#bpGrid)" />

      {/* readout (left) and legend (right) rows above the plot */}
      <circle cx={PXx + 4} cy={44} r={3.5} fill={C.line} />
      <text x={PXx + 12} y={47.5} className="bpLabel">14:29:36 · user 42%</text>
      <circle cx={PXx + PW - 92} cy={44} r={3.5} fill={C.line} />
      <text x={PXx + PW - 84} y={47.5} className="bpLabel">user</text>
      <circle cx={PXx + PW - 48} cy={44} r={3.5} fill={C.edge} />
      <text x={PXx + PW - 40} y={47.5} className="bpLabel">system</text>
      <text x={PXx + PW} y={30} textAnchor="end" className="bpLabel" fill={C.faint}>legend</text>

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
      <text x={CXx + 8} y={PY + 14} className="bpLabel" fill={C.faint}>crosshair</text>

      {/* dimensions */}
      <VDim x={PXx - 34} y1={PY} y2={PY + PH} label="height: 12rem" />

      <BpTitle />
      <Foot y={222} parts={[strokeW && `stroke: ${strokeW}`, gridW && `grid: ${gridW}`, swatch && `swatch: ⌀ ${swatch}`, 'canvas: uPlot']} />
    </svg>
  );
}

export function Blueprint({ size, dimensions, slots, shape, id }: BlueprintProps) {
  if (shape === 'ring') return withFrame(<RingBlueprint size={size} />);
  if (shape === 'slider') return withFrame(<SliderBlueprint size={size} dimensions={dimensions} />);
  if (id === 'checkbox') return withFrame(<CheckboxBlueprint size={size} dimensions={dimensions} />);
  if (id === 'radio') return withFrame(<RadioBlueprint size={size} dimensions={dimensions} />);
  if (id === 'switch') return withFrame(<SwitchBlueprint size={size} dimensions={dimensions} />);
  if (id === 'number-input') return withFrame(<NumberInputBlueprint size={size} dimensions={dimensions} />);
  if (id === 'radio-card') return withFrame(<RadioCardBlueprint size={size} dimensions={dimensions} />);
  if (id === 'search-field') return withFrame(<SearchFieldBlueprint size={size} dimensions={dimensions} />);
  if (id === 'callout') return withFrame(<CalloutBlueprint size={size} dimensions={dimensions} />);
  if (id === 'banner') return withFrame(<BannerBlueprint size={size} dimensions={dimensions} />);
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
  if (id === 'app-shell') return withFrame(<AppShellBlueprint size={size} dimensions={dimensions} />);
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
}: {
  specId: string;
  preview?: boolean;
  /** Show only this size's figure and drop the size picker. */
  fixedSize?: string;
}) {
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
              aria-label="Blueprint size"
              value={name}
              onValueChange={setName}
              options={options}
            />
          ) : (
            <div style={{ maxWidth: '12rem' }}>
              <Select aria-label="Blueprint size" value={name} onValueChange={setName} options={options} />
            </div>
          ))}
        <TitleContext.Provider value={`<${spec.name} />`}>
          <Blueprint
            size={active}
            id={spec.id}
            dimensions={spec.dimensions}
            slots={spec.anatomy?.map((a) => a.name)}
            shape={RING_IDS.has(spec.id) ? 'ring' : spec.id === 'slider' ? 'slider' : undefined}
          />
        </TitleContext.Provider>
      </Stack>
    </div>
  );
}
