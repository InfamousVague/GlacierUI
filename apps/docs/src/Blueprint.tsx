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
