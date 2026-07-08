import { getSpec, type Measure, type SizeSpec } from '@perfect/spec';
import { useState, type ReactElement } from 'react';
import { SegmentedControl, Select, Stack } from '@perfect/react';

/**
 * A blueprint-style illustration of a component's box: a schematic drawing with
 * dimension lines labelled with the exact spec measurements (padding, height,
 * radius, border), the way you'd inspect an atom. The figure is schematic; the
 * labels are the real values from the spec.
 */
interface BlueprintProps {
  size: SizeSpec;
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
  grid: 'var(--perfect-blue-5)',
  line: 'var(--perfect-blue-11)',
  fill: 'var(--perfect-blue-3)',
  edge: 'var(--perfect-blue-8)',
  content: 'var(--perfect-blue-6)',
  text: 'var(--perfect-blue-11)',
  faint: 'var(--perfect-text-subtle)',
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
function CircleBlueprint({ size }: { size: SizeSpec }) {
  const cx = 190;
  const cy = 118;
  const r = 44;
  const diameter = fmt(size.diameter);
  const border = fmt(size.border);
  return (
    <svg viewBox="0 0 380 200" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} size`}>
      <Defs />
      <rect x={0} y={0} width={380} height={200} fill="url(#bpGrid)" />
      <circle cx={cx} cy={cy} r={r} fill={C.fill} stroke={C.edge} strokeWidth={border ? 2 : 1} strokeDasharray="4 3" />
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={C.line} strokeWidth={1} />
      <text x={cx + r / 2} y={cy - 5} textAnchor="middle" className="bpLabel">r</text>
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
 * ring band with a toned arc drawn over it — the skeletal shape of the actual
 * component — dimensioned with its diameter and stroke thickness.
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

function BoxBlueprint({ size, dimensions, slots }: BlueprintProps) {
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
  // control (button, input, pill) carries no block padding — its label is one
  // line centered by line-height — so draw the content as a centered line with
  // the leading above and below, not a box that fills the full height.
  const singleLine = !padBl && !!padIn;
  const cw = BW - pIn * 2;
  const ch = singleLine ? 30 : BH - pBl * 2;
  const cy0 = singleLine ? BY + (BH - ch) / 2 : BY + pBl;
  const crx = Math.max(Math.min(rr, ch / 2) - 5, 3);

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
      {slots?.includes('leadingIcon') && (
        <>
          <rect x={BX + 12} y={BY + BH / 2 - 8} width={16} height={16} rx={4} fill="none" stroke={C.line} strokeWidth={1.25} strokeDasharray="2 2" />
          <circle cx={BX + 20} cy={BY + BH / 2} r={2.5} fill={C.line} />
        </>
      )}
      {slots?.includes('trailingIcon') && (
        <>
          <rect x={BX + BW - 28} y={BY + BH / 2 - 8} width={16} height={16} rx={4} fill="none" stroke={C.line} strokeWidth={1.25} strokeDasharray="2 2" />
          <circle cx={BX + BW - 20} cy={BY + BH / 2} r={2.5} fill={C.line} />
        </>
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

export function Blueprint({ size, dimensions, slots, shape }: BlueprintProps) {
  if (shape === 'ring') return withFrame(<RingBlueprint size={size} />);
  if (shape === 'slider') return withFrame(<SliderBlueprint size={size} dimensions={dimensions} />);
  if (size.diameter && !size.height) return withFrame(<CircleBlueprint size={size} />);
  if (size.thickness && !size.height && !size.diameter) return withFrame(<BarBlueprint size={size} dimensions={dimensions} />);
  return withFrame(<BoxBlueprint size={size} dimensions={dimensions} slots={slots} />);
}

const withFrame = (svg: ReactElement) => <div className="bpFrame">{svg}</div>;

/**
 * Looks a component up by spec id and draws a blueprint per declared size, or a
 * single one from its fixed dimensions when it has no sizes. Drop it into a
 * doc page to inspect that atom's exact geometry.
 */
export function ComponentBlueprint({ specId }: { specId: string }) {
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
  const active = items.find((s) => s.name === name) ?? items[0];
  if (!active) return null;
  const options = items.map((s) => ({ value: s.name, label: s.name }));
  return (
    <div className="blueprint">
      <Stack gap={4} align="start">
        {items.length > 1 &&
          (items.length <= 4 ? (
            <SegmentedControl
              size="sm"
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
          dimensions={spec.dimensions}
          slots={spec.anatomy?.map((a) => a.name)}
          shape={RING_IDS.has(spec.id) ? 'ring' : spec.id === 'slider' ? 'slider' : undefined}
        />
      </Stack>
    </div>
  );
}
