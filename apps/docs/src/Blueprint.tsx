import type { Measure, SizeSpec } from '@perfect/spec';

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
}

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

// A horizontal dimension line from x1 to x2 at y, with end ticks and a label.
function HDim({ x1, x2, y, label, above = true }: { x1: number; x2: number; y: number; label: string; above?: boolean }) {
  const mid = (x1 + x2) / 2;
  return (
    <g>
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} stroke={C.line} strokeWidth={1} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke={C.line} strokeWidth={1} />
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={C.line} strokeWidth={1} markerStart="url(#bpArrow)" markerEnd="url(#bpArrow)" />
      <text x={mid} y={above ? y - 6 : y + 13} textAnchor="middle" className="bpLabel">
        {label}
      </text>
    </g>
  );
}

// A vertical dimension line from y1 to y2 at x, with a label rotated to read
// along the line so long token names never overflow horizontally.
function VDim({ x, y1, y2, label, left = true }: { x: number; y1: number; y2: number; label: string; left?: boolean }) {
  const mid = (y1 + y2) / 2;
  const lx = left ? x - 9 : x + 9;
  return (
    <g>
      <line x1={x - 4} y1={y1} x2={x + 4} y2={y1} stroke={C.line} strokeWidth={1} />
      <line x1={x - 4} y1={y2} x2={x + 4} y2={y2} stroke={C.line} strokeWidth={1} />
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.line} strokeWidth={1} markerStart="url(#bpArrow)" markerEnd="url(#bpArrow)" />
      <text x={lx} y={mid} textAnchor="middle" dominantBaseline="middle" transform={`rotate(-90 ${lx} ${mid})`} className="bpLabel">
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

/** Box blueprint for padded rounded atoms (button, input, pill, callout). */
function BoxBlueprint({ size, dimensions }: BlueprintProps) {
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

  const pIn = padIn ? 30 : 0; // schematic inset for the padding gap
  const pBl = padBl ? 16 : 0;
  const rr = radius === 'radius-full' || radius === '9999px' ? BH / 2 : radius ? 14 : 6;

  return (
    <svg viewBox="0 0 400 210" className="bpSvg" role="img" aria-label={`Blueprint of the ${size.name} size`}>
      <Defs />
      <rect x={0} y={0} width={400} height={210} fill="url(#bpGrid)" />

      {/* the component box */}
      <rect x={BX} y={BY} width={BW} height={BH} rx={rr} fill={C.fill} stroke={C.edge} strokeWidth={border ? 2 : 1.25} strokeDasharray="5 3" />
      {/* the content box (inside the padding) */}
      {(pIn || pBl) > 0 && (
        <rect x={BX + pIn} y={BY + pBl} width={BW - pIn * 2} height={BH - pBl * 2} rx={Math.max(rr - 6, 2)} fill="none" stroke={C.content} strokeWidth={1} strokeDasharray="2 2" />
      )}

      {/* height on the left */}
      {height && <VDim x={BX - 34} y1={BY} y2={BY + BH} label={height} />}
      {/* width span on top (content-sized, but the box width is shown) */}
      <HDim x1={BX} x2={BX + BW} y={BY - 26} label={`width: auto`} />

      {/* padding-inline: a callout across the left padding gap */}
      {padIn && (
        <>
          <rect x={BX} y={BY} width={pIn} height={BH} fill={C.content} opacity={0.14} />
          <HDim x1={BX} x2={BX + pIn} y={BY + BH + 16} label={padIn} above={false} />
        </>
      )}
      {/* padding-block: a callout down the top padding gap */}
      {padBl && (
        <>
          <rect x={BX} y={BY} width={BW} height={pBl} fill={C.content} opacity={0.1} />
          <VDim x={BX + BW + 30} y1={BY} y2={BY + pBl} label={padBl} left={false} />
        </>
      )}

      {/* radius callout at the top-right corner */}
      {radius && (
        <>
          <path d={`M ${BX + BW - rr} ${BY} A ${rr} ${rr} 0 0 1 ${BX + BW} ${BY + rr}`} fill="none" stroke={C.line} strokeWidth={1.5} />
          <line
            x1={BX + BW - rr * 0.3}
            y1={BY + rr * 0.3}
            x2={BX + BW + 14}
            y2={BY - 12}
            stroke={C.line}
            strokeWidth={1}
          />
          <text x={392} y={BY - 14} textAnchor="end" className="bpLabel">
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

function Defs() {
  return (
    <defs>
      <pattern id="bpGrid" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx={1} cy={1} r={0.75} fill={C.grid} />
      </pattern>
      <marker id="bpArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
        <path d="M1 1 L6 3.5 L1 6" fill="none" stroke={C.line} strokeWidth={1} />
      </marker>
    </defs>
  );
}

export function Blueprint({ size, dimensions }: BlueprintProps) {
  const isCircle = Boolean(size.diameter) && !size.height;
  return (
    <div className="bpFrame">
      {isCircle ? <CircleBlueprint size={size} /> : <BoxBlueprint size={size} dimensions={dimensions} />}
    </div>
  );
}
