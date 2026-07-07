import { getSpec, type Measure, type SizeSpec } from '@perfect/spec';
import { useState, type ReactElement } from 'react';
import { SegmentedControl, Select } from '@perfect/react';

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

/** Bar blueprint for thin line atoms (divider, progress bar, sparkline): thickness + radius. */
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

export function Blueprint({ size, dimensions }: BlueprintProps) {
  if (size.diameter && !size.height) return withFrame(<CircleBlueprint size={size} />);
  if (size.thickness && !size.height && !size.diameter) return withFrame(<BarBlueprint size={size} dimensions={dimensions} />);
  return withFrame(<BoxBlueprint size={size} dimensions={dimensions} />);
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
  const items: readonly SizeSpec[] = !spec
    ? []
    : sizes.length > 0
      ? sizes
      : [{ name: spec.element ? `<${spec.element}>` : spec.name, ...(spec.dimensions ?? {}) } as SizeSpec];
  const [name, setName] = useState(items[0]?.name ?? '');
  if (!spec) return null;
  const active = items.find((s) => s.name === name) ?? items[0];
  if (!active) return null;
  const options = items.map((s) => ({ value: s.name, label: s.name }));
  return (
    <div>
      {items.length > 1 && (
        <div style={{ marginBottom: 'var(--perfect-space-4)' }}>
          {items.length <= 4 ? (
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
          )}
        </div>
      )}
      <Blueprint size={active} dimensions={spec.dimensions} />
    </div>
  );
}
