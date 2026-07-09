import { getSpec, type Measure, type SizeSpec } from '@glacier/spec';
import { useState, type ReactElement } from 'react';
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
function VDim({ x, y1, y2, label, left = true }: { x: number; y1: number; y2: number; label: string; left?: boolean }) {
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
      <text x={lx} y={mid} textAnchor="middle" dominantBaseline="middle" transform={`rotate(-90 ${lx} ${mid})`} className="bpLabel" stroke="none">
        {label}
      </text>
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
    <svg viewBox="0 0 380 200" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} size`}>
      <Defs />
      <rect x={0} y={0} width={380} height={200} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
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
    <svg viewBox="0 0 380 200" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} size`}>
      <Defs />
      <rect x={0} y={0} width={380} height={200} fill="url(#bpGrid)" />
      {/* the host element the dot attaches to, drawn as a dotted circle */}
      <circle cx={hostCx} cy={hostCy} r={hostR} fill="none" stroke={C.edge} strokeWidth={1} strokeDasharray="2 4" strokeLinecap="round" />
      <text x={hostCx} y={hostCy} textAnchor="middle" dominantBaseline="central" stroke="none" fill={C.text} className="bpLabel">Online</text>
      {/* the status dot, pinned to the bottom-right of the host */}
      <circle cx={dx} cy={dy} r={dotR} fill={C.fill} stroke={C.edge} strokeWidth={2} strokeDasharray="4 3" />
      {/* the dot's diameter, dimensioned below it */}
      <HDim x1={dx - dotR} x2={dx + dotR} y={dy + dotR + 22} label={`⌀ ${diameter ?? 'auto'}`} above={false} />
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={16} y={184} className="bpLabel bpMuted">radius: full</text>
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} size`}>
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />

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

      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={200} y={198} textAnchor="middle" className="bpLabel bpMuted">radius: full</text>
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the slider">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />

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

      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={200} y={190} textAnchor="middle" className="bpLabel bpMuted">
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
    <svg viewBox="0 0 380 200" className="bpSvg" role="img" aria-label="Blueprint of the checkbox">
      <Defs />
      <rect x={0} y={0} width={380} height={200} fill="url(#bpGrid)" />

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

      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={190} y={186} textAnchor="middle" className="bpLabel bpMuted">
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
    <svg viewBox="0 0 380 200" className="bpSvg" role="img" aria-label="Blueprint of the radio">
      <Defs />
      <rect x={0} y={0} width={380} height={200} fill="url(#bpGrid)" />

      {/* the ring and, at its center, the selected dot */}
      <circle cx={cx} cy={cy} r={R} fill={C.fill} stroke={C.edge} strokeWidth={1.75} strokeDasharray="5 3" />
      {dotR > 0 && <circle cx={cx} cy={cy} r={dotR} fill={C.line} />}

      {diameter && <HDim x1={cx - R} x2={cx + R} y={cy - R - 18} label={`⌀ ${diameter}`} />}

      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={190} y={186} textAnchor="middle" className="bpLabel bpMuted">
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} switch`}>
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />

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

      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={200} y={198} textAnchor="middle" className="bpLabel bpMuted">
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} number input`}>
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />

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

      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={200} y={198} textAnchor="middle" className="bpLabel bpMuted">
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
    <svg viewBox="0 0 400 240" className="bpSvg" role="img" aria-label="Blueprint of the radio card">
      <Defs />
      <rect x={0} y={0} width={400} height={240} fill="url(#bpGrid)" />

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

      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={200} y={214} textAnchor="middle" className="bpLabel bpMuted">
        {[padding && `padding: ${padding}`, gap && `gap: ${gap}`, border && `border: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
      <text x={200} y={230} textAnchor="middle" className="bpLabel bpMuted">
        {[titleSize && `title: ${titleSize}`, descriptionSize && `desc: ${descriptionSize}`, iconSize && `icon: ${iconSize}`, indicator && `check: ${indicator}`].filter(Boolean).join('   ·   ')}
      </text>
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} search field`}>
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />

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

      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={200} y={198} textAnchor="middle" className="bpLabel bpMuted">
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the callout">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />

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
      {paddingBlock && <VDim x={BX + BW + 28} y1={BY} y2={BY + pBl} label={paddingBlock} left={false} />}

      {/* radius on the top-right corner */}
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <text x={390} y={BY - 10} textAnchor="end" className="bpLabel">radius: {radius}</text>
        </>
      )}

      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={200} y={200} textAnchor="middle" className="bpLabel bpMuted">
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
  const H = 196;
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

      <text x={16} y={28} className="bpTitle">{size.name}</text>
      <text x={W / 2} y={H - 14} textAnchor="middle" className="bpLabel bpMuted">
        {['width: full', gap && `gap: ${gap}`, font && `font: ${font}`, border && `border: ${border}`].filter(Boolean).join('   ·   ')}
      </text>
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
    <svg viewBox="0 0 400 200" className="bpSvg" role="img" aria-label="Blueprint of the meter">
      <Defs />
      <rect x={0} y={0} width={400} height={200} fill="url(#bpGrid)" />

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

      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={200} y={188} textAnchor="middle" className="bpLabel bpMuted">
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
  const g = 8; // schematic gap between slices

  // three example slices sized by share of the total; the rest is empty track
  const shares = [40, 25, 20];
  let cursor = SX;
  let firstMidX = SX;
  let firstRight = SX;
  let secondX = SX;
  const slices = shares.map((share, i) => {
    const w = (share / 100) * BW;
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the segmented bar">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />

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

      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={200} y={198} textAnchor="middle" className="bpLabel bpMuted">
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
  const inlineIcons = id === 'button';
  const iconY = BY + BH / 2;
  const leadIconX = inlineIcons ? BX + pIn + 2 : BX + 12;
  const trailIconX = inlineIcons ? BX + pIn + cw - 18 : BX + BW - 28;

  return (
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} size`}>
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />

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

      {/* height on the left */}
      {height && <VDim x={BX - 34} y1={BY} y2={BY + BH} label={height} />}
      {/* width span on top (content-sized, but the box width is shown) */}
      <HDim x1={BX} x2={BX + BW} y={BY - 26} label={`width: auto`} />

      {/* padding-inline: measured across the left gap; the right gap is symmetric */}
      {padIn && <HDim x1={BX} x2={BX + pIn} y={BY + BH + 16} label={padIn} above={false} />}
      {/* padding-block: measured across the top gap; the bottom gap is symmetric */}
      {padBl && <VDim x={BX + BW + 30} y1={BY} y2={BY + pBl} label={padBl} left={false} />}

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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={200} y={198} textAnchor="middle" className="bpLabel bpMuted">
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the textarea">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot y={200} parts={[radius && `radius: ${radius}`, padIn && `padding: ${padIn}`, border && `border: ${border}`]} />
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
    <svg viewBox="0 0 400 200" className="bpSvg" role="img" aria-label="Blueprint of the skeleton">
      <Defs />
      <defs>
        <linearGradient id="bpSkel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--glacier-blue-8)" stopOpacity={0.8} />
          <stop offset="1" stopColor="var(--glacier-blue-8)" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={400} height={200} fill="url(#bpGrid)" />
      {/* one rect + one circle, filled with the static blue-to-transparent shimmer */}
      <rect x={RX} y={RY} width={RW} height={RH} rx={10} fill={g} />
      <circle cx={Ccx} cy={Ccy} r={Cr} fill={g} />
      {/* the width bar over the rect, and the circle's diameter */}
      <HDim x1={RX} x2={RX + RW} y={RY - 20} label="width: auto" />
      <HDim x1={Ccx - Cr} x2={Ccx + Cr} y={Ccy - Cr - 18} label="⌀ width" />
      <text x={RX + RW / 2} y={RY + RH + 20} textAnchor="middle" className="bpLabel bpMuted">rect</text>
      <text x={Ccx} y={Ccy + Cr + 20} textAnchor="middle" className="bpLabel bpMuted">circle</text>
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot y={188} parts={[rectRadius && `rect: ${rectRadius}`, circleRadius && `circle: ${circleRadius}`]} />
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the code block">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />
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
      <text x={X + gutterW / 2} y={Y + H + 14} textAnchor="middle" className="bpLabel bpMuted">gutter</text>
      <text x={16} y={26} className="bpTitle">{size.name}</text>
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
    <svg viewBox="0 0 400 160" className="bpSvg" role="img" aria-label="Blueprint of the steps">
      <Defs />
      <rect x={0} y={0} width={400} height={160} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot y={148} parts={[radius && `radius: ${radius}`, border && `border: ${border}`, `count ${N} · active ${active}`]} />
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
    <svg viewBox="0 0 400 160" className="bpSvg" role="img" aria-label="Blueprint of the progress bar">
      <Defs />
      <rect x={0} y={0} width={400} height={160} fill="url(#bpGrid)" />
      {/* the track */}
      <rect x={X} y={Y} width={W} height={H} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      {/* the fill, sized to the value */}
      <rect x={X} y={Y} width={fillW} height={H} rx={rr} fill={C.content} fillOpacity={0.55} stroke={C.text} strokeWidth={1} />
      <text x={X + fillW / 2} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">fill</text>
      <text x={X + fillW + (W - fillW) / 2} y={Y - 12} textAnchor="middle" className="bpLabel bpMuted">track</text>
      <HDim x1={X} x2={X + W} y={Y - 30} label="width: auto" />
      {height && <VDim x={X - 22} y1={Y} y2={Y + H} label={height} />}
      <HDim x1={X} x2={X + fillW} y={Y + H + 16} label="value = 60% of max" above={false} />
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot y={148} parts={[height && `height: ${height}`, radius && `radius: ${radius}`, 'indeterminate: 40% sweep']} />
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
    <svg viewBox="0 0 400 150" className="bpSvg" role="img" aria-label="Blueprint of the divider">
      <Defs />
      <rect x={0} y={0} width={400} height={150} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot y={138} parts={[thickness && `thickness: ${thickness}`, gap && `gap: ${gap}`]} />
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
    <svg viewBox="0 0 400 150" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} size`}>
      <Defs />
      <rect x={0} y={0} width={400} height={150} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <text x={200} y={132} textAnchor="middle" className="bpLabel bpMuted">
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

// Footnote row of measure chips, centred at the bottom of a figure.
const Foot = ({ y = 198, parts }: { y?: number; parts: (string | undefined | false)[] }) => (
  <text x={200} y={y} textAnchor="middle" className="bpLabel bpMuted">
    {parts.filter(Boolean).join('   \u00b7   ')}
  </text>
);

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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the field">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />
      <Ln x={X} y={labelY} w={60} op={0.75} />
      <text x={X + 68} y={labelY + 8} fill="var(--glacier-danger-solid)" stroke="none" style={{ fontSize: 12, fontWeight: 700 }}>*</text>
      <Frame x={X} y={ctrlY} w={W} h={ctrlH} r={8} />
      <Ln x={X + 12} y={ctrlY + ctrlH / 2 - 3} w={104} op={0.5} />
      <Ln x={X} y={metaY} w={140} h={5} op={0.32} />
      <text x={X - 10} y={labelY + 8} textAnchor="end" className="bpLabel bpMuted">label</text>
      <text x={X + W + 12} y={ctrlY + ctrlH / 2 + 3} className="bpLabel bpMuted">control</text>
      <text x={X - 10} y={metaY + 6} textAnchor="end" className="bpLabel bpMuted">meta</text>
      {gap && <VDim x={X + W + 30} y1={ctrlY + ctrlH} y2={metaY} label={gap} left={false} />}
      <text x={16} y={26} className="bpTitle">{size.name}</text>
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
    <svg viewBox="0 0 400 220" className="bpSvg" role="img" aria-label="Blueprint of the select">
      <Defs />
      <rect x={0} y={0} width={400} height={220} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot y={210} parts={[radius && `radius: ${radius}`, optionRadius && `option: ${optionRadius}`, padIn && `pad: ${padIn}`, border && `border: ${border}`]} />
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
  const g = 8;
  const totalW = N * segW + (N - 1) * g;
  const SX = (400 - totalW) / 2;
  const SY = 84;
  const pad = 6;
  const segX = (i: number) => SX + i * (segW + g);
  return (
    <svg viewBox="0 0 400 200" className="bpSvg" role="img" aria-label="Blueprint of the segmented control">
      <Defs />
      <rect x={0} y={0} width={400} height={200} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot y={190} parts={[radius && `radius: ${radius}`, padding && `padding: ${padding}`]} />
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the tabs">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
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
    <svg viewBox="0 0 400 200" className="bpSvg" role="img" aria-label="Blueprint of the tooltip">
      <Defs />
      <rect x={0} y={0} width={400} height={200} fill="url(#bpGrid)" />
      {/* the bubble */}
      <Frame x={bubbleX} y={bubbleY} w={bubbleW} h={bubbleH} r={8} />
      <Ln x={bubbleX + 14} y={bubbleY + bubbleH / 2 - 3} w={bubbleW - 28} h={5} op={0.5} />
      {/* the pointer */}
      <path d={`M ${cx - 7} ${bubbleY + bubbleH} L ${cx + 7} ${bubbleY + bubbleH} L ${cx} ${bubbleY + bubbleH + 9} Z`} fill={C.fill} stroke={C.edge} strokeWidth={1.5} />
      {/* the trigger */}
      <rect x={cx - 34} y={trigY} width={68} height={26} rx={6} fill={C.content} fillOpacity={0.22} stroke={C.edge} strokeWidth={1.25} />
      <Ln x={cx - 20} y={trigY + 10} w={40} h={5} op={0.5} />
      <text x={bubbleX + bubbleW + 12} y={bubbleY + bubbleH / 2 + 3} className="bpLabel bpMuted">bubble</text>
      <text x={cx + 42} y={trigY + 16} className="bpLabel bpMuted">trigger</text>
      {offset && <VDim x={bubbleX - 20} y1={bubbleY + bubbleH} y2={trigY} label={`offset ${offset}`} />}
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot y={190} parts={[radius && `radius: ${radius}`, padIn && `pad-inline: ${padIn}`, 'glass + blur']} />
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
  const Y = 82;
  const H = 46;
  const rr = H / 2;
  const iconX = X + 24;
  const cyc = Y + H / 2;
  return (
    <svg viewBox="0 0 400 200" className="bpSvg" role="img" aria-label="Blueprint of the toast">
      <Defs />
      <rect x={0} y={0} width={400} height={200} fill="url(#bpGrid)" />
      <rect x={X} y={Y} width={W} height={H} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={1.5} strokeDasharray="5 3" />
      <circle cx={iconX} cy={cyc} r={9} fill={C.content} fillOpacity={0.4} stroke={C.line} strokeWidth={1} />
      <Ln x={iconX + 20} y={cyc - 3} w={120} h={6} op={0.5} />
      {/* dismiss */}
      <g stroke={C.line} strokeWidth={1.4}>
        <line x1={X + W - 26} y1={cyc - 5} x2={X + W - 16} y2={cyc + 5} />
        <line x1={X + W - 26} y1={cyc + 5} x2={X + W - 16} y2={cyc - 5} />
      </g>
      <text x={iconX} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">icon</text>
      <text x={iconX + 80} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">message</text>
      <text x={X + W - 21} y={Y - 10} textAnchor="middle" className="bpLabel bpMuted">dismiss</text>
      {padIn && <HDim x1={X} x2={X + 34} y={Y + H + 16} label={padIn} above={false} />}
      {gap && <HDim x1={iconX + 9} x2={iconX + 20} y={Y + H + 16} label={gap} above={false} />}
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot y={190} parts={[radius && `radius: ${radius}`]} />
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the scroll area">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
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
    <svg viewBox="0 0 400 200" className="bpSvg" role="img" aria-label="Blueprint of the carousel">
      <Defs />
      <rect x={0} y={0} width={400} height={200} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot y={190} parts={[gap && `gap: ${gap}`, radius && `radius: ${radius}`]} />
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
    <svg viewBox="0 0 400 200" className="bpSvg" role="img" aria-label="Blueprint of the heatmap">
      <Defs />
      <rect x={0} y={0} width={400} height={200} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot y={192} parts={[cell && `cell: ${cell}`, gap && `gap: ${gap}`, radius && `radius: ${radius}`]} />
    </svg>
  );
}

// Spotlight: a dimmed backdrop, a cutout ring on the target, and the callout.
function SpotlightBlueprint({ size, dimensions }: BlueprintProps) {
  const radius = fmt(dimensions?.radius);
  const cutoutRadius = fmt(dimensions?.cutoutRadius);
  return (
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the spotlight">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />
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
      <text x={300} y={140} textAnchor="end" className="bpLabel bpMuted">2 / 4</text>
      <rect x={296} y={130} width={30} height={16} rx={5} fill={C.content} fillOpacity={0.35} />
      <text x={105} y={72} textAnchor="middle" className="bpLabel bpMuted">cutout</text>
      <text x={263} y={56} textAnchor="middle" className="bpLabel bpMuted">callout</text>
      <text x={52} y={52} className="bpLabel bpMuted">backdrop</text>
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot parts={[radius && `radius: ${radius}`, cutoutRadius && `cutout: ${cutoutRadius}`]} />
    </svg>
  );
}

// ---- Organisms ---------------------------------------------------------

// Modal: a blurred overlay centering a glass panel with header, body, footer.
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the modal">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot parts={[diameter && `width: ${diameter}`, radius && `radius: ${radius}`, panelPad && `padding: ${panelPad}`]} />
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the popover">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />
      <rect x={cx - trigW / 2} y={trigY} width={trigW} height={trigH} rx={6} fill={C.content} fillOpacity={0.22} stroke={C.edge} strokeWidth={1.25} />
      <Ln x={cx - 26} y={trigY + trigH / 2 - 3} w={52} h={5} op={0.5} />
      <path d={`M ${cx - 7} ${panelY} L ${cx + 7} ${panelY} L ${cx} ${panelY - 9} Z`} fill={C.fill} stroke={C.edge} strokeWidth={1.5} />
      <Frame x={panelX} y={panelY} w={panelW} h={panelH} r={10} />
      <Ln x={panelX + 14} y={panelY + 16} w={100} op={0.6} />
      <Ln x={panelX + 14} y={panelY + 34} w={panelW - 28} h={5} op={0.32} />
      <Ln x={panelX + 14} y={panelY + 46} w={panelW - 44} h={5} op={0.32} />
      <Ln x={panelX + 14} y={panelY + 58} w={panelW - 60} h={5} op={0.32} />
      <text x={cx + trigW / 2 + 12} y={trigY + trigH / 2 + 3} className="bpLabel bpMuted">trigger</text>
      <text x={panelX + panelW + 12} y={panelY + panelH / 2} className="bpLabel bpMuted">content</text>
      <text x={panelX - 10} y={panelY + 14} textAnchor="end" className="bpLabel bpMuted">panel</text>
      {offset && <VDim x={panelX - 24} y1={trigY + trigH} y2={panelY} label={`offset ${offset}`} />}
      <text x={16} y={26} className="bpTitle">{size.name}</text>
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
  const menuH = pad * 2 + 12 + 4 * rowH + 8;
  return (
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the menu">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the floating panel">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the tabbed panel">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
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
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label="Blueprint of the tabbed modal">
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />
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
      <text x={X + railW / 2} y={Y - 8} textAnchor="middle" className="bpLabel bpMuted">rail</text>
      <text x={X + railW + (W - railW) / 2} y={Y - 8} textAnchor="middle" className="bpLabel bpMuted">pane</text>
      <text x={X + 8} y={Y + 16 + 1 * itemH + 20} className="bpLabel bpMuted">railItem</text>
      <text x={16} y={26} className="bpTitle">{size.name}</text>
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
    <svg viewBox="0 0 400 190" className="bpSvg" role="img" aria-label="Blueprint of the tab strip">
      <Defs />
      <rect x={0} y={0} width={400} height={190} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot y={178} parts={[radius && `radius: ${radius}`, gap && `gap: ${gap}`]} />
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
    <svg viewBox="0 0 400 200" className="bpSvg" role="img" aria-label="Blueprint of the resizable split pane">
      <Defs />
      <rect x={0} y={0} width={400} height={200} fill="url(#bpGrid)" />
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
      <text x={16} y={26} className="bpTitle">{size.name}</text>
      <Foot y={190} parts={[radius && `radius: ${radius}`, gripHeight && `grip: ${gripHeight}`, thickness && `divider: ${thickness}`]} />
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
  if (id === 'status-dot') return withFrame(<StatusDotBlueprint size={size} />);
  // molecules
  if (id === 'field') return withFrame(<FieldBlueprint size={size} dimensions={dimensions} />);
  if (id === 'select') return withFrame(<SelectBlueprint size={size} dimensions={dimensions} />);
  if (id === 'segmented-control') return withFrame(<SegmentedControlBlueprint size={size} dimensions={dimensions} />);
  if (id === 'tabs') return withFrame(<TabsBlueprint size={size} dimensions={dimensions} />);
  if (id === 'tooltip') return withFrame(<TooltipBlueprint size={size} dimensions={dimensions} />);
  if (id === 'toast') return withFrame(<ToastBlueprint size={size} dimensions={dimensions} />);
  if (id === 'scroll-area') return withFrame(<ScrollAreaBlueprint size={size} dimensions={dimensions} />);
  if (id === 'carousel') return withFrame(<CarouselBlueprint size={size} dimensions={dimensions} />);
  if (id === 'heatmap') return withFrame(<HeatmapBlueprint size={size} dimensions={dimensions} />);
  if (id === 'spotlight') return withFrame(<SpotlightBlueprint size={size} dimensions={dimensions} />);
  // organisms
  if (id === 'modal') return withFrame(<ModalBlueprint size={size} dimensions={dimensions} />);
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
export function ComponentBlueprint({ specId, preview = false }: { specId: string; preview?: boolean }) {
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
  // preview mode (the overview gallery) renders just the first size's figure —
  // no size selector, so the card stays a single click target.
  const active = (preview ? items[0] : items.find((s) => s.name === name)) ?? items[0];
  if (!active) return null;
  const options = items.map((s) => ({ value: s.name, label: s.name }));
  return (
    <div className="blueprint">
      <Stack gap={4} align="start">
        {!preview &&
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
        <Blueprint
          size={active}
          id={spec.id}
          dimensions={spec.dimensions}
          slots={spec.anatomy?.map((a) => a.name)}
          shape={RING_IDS.has(spec.id) ? 'ring' : spec.id === 'slider' ? 'slider' : undefined}
        />
      </Stack>
    </div>
  );
}
