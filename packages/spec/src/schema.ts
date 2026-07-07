/**
 * The Perfect component specification schema.
 *
 * A spec is the language-agnostic contract for one component: its API, its
 * variants and sizes, and — crucially — its measurements expressed in units of
 * the shared token scale rather than raw pixels. Any framework (React, Angular,
 * a Rust or Swift kit) can read a spec plus the token catalog and build the
 * same component. The React kit in this repo is held to its spec by a
 * conformance test, and every change is meant to land in both places at once.
 *
 * Specs are authored in TypeScript for type safety and generated to JSON (see
 * generate.ts). The JSON, plus schema.json, is what non-JS consumers read.
 */

/**
 * A reference to a design token, written as the token name with a leading `$`
 * (for example `$space-4`, `$control-height-md`, `$radius-full`). The `$`
 * marks it as resolvable against the token catalog (tokens.json / the
 * `--perfect-*` custom properties) rather than a literal value. A measurement
 * may also be a raw CSS length like `0.5rem` when it genuinely sits off the
 * scale (icon glyphs, hairlines), but token references are strongly preferred.
 */
export type TokenRef = `$${string}`;

/** A measurement: a token reference (preferred) or a raw CSS value. */
export type Measure = TokenRef | (string & {});

export type Category = 'atom' | 'molecule' | 'organism' | 'structure' | 'layout';

export type Status = 'stable' | 'draft';

/** The language-agnostic type of a prop value. */
export type PropType = 'enum' | 'boolean' | 'string' | 'number' | 'node' | 'token' | 'element' | 'handler';

export interface PropSpec {
  name: string;
  type: PropType;
  /** Allowed values for an `enum` prop. */
  values?: readonly string[];
  /** Canonical default, omitted when the prop has no default. */
  default?: string | number | boolean;
  required?: boolean;
  description: string;
}

/**
 * A visual style family (Button's solid/soft/outline) or a semantic color
 * family (a tone: accent/success/danger). `tokens` maps a surface role to the
 * token that paints it, so a consumer knows exactly which token to reach for.
 */
export interface StyleSpec {
  name: string;
  description: string;
  /** Surface role to token, e.g. `{ background: '$accent-solid', text: '$accent-contrast' }`. */
  tokens?: Record<string, TokenRef>;
}

/** Per-size box metrics, every value in token units where it sits on the scale. */
export interface SizeSpec {
  name: string;
  height?: Measure;
  paddingInline?: Measure;
  paddingBlock?: Measure;
  gap?: Measure;
  fontSize?: Measure;
  radius?: Measure;
  /** Diameter or square edge for round or icon-only components. */
  diameter?: Measure;
  /** Leading glyph box, often off-scale. */
  iconSize?: Measure;
  /** Border or ring stroke width. */
  border?: Measure;
  /** Line or track thickness. */
  thickness?: Measure;
}

/** A named part of the component you can target or slot into. */
export interface SlotSpec {
  name: string;
  description: string;
  required?: boolean;
}

/** An interaction or lifecycle state and how it repaints. */
export interface StateSpec {
  name: string;
  description: string;
  tokens?: Record<string, TokenRef>;
}

export interface KeyBinding {
  keys: string;
  action: string;
}

export interface A11ySpec {
  /** Default ARIA role, when the component sets one. */
  role?: string;
  focusable?: boolean;
  keyboard?: readonly KeyBinding[];
  notes?: readonly string[];
}

export interface MotionSpec {
  description: string;
  /** Press feedback (whileTap scale) on interactive components. */
  press?: boolean;
  /** Motion tokens the component leans on: a speed/ease pair or a spring preset. */
  transition?: { speed?: string; ease?: string; spring?: string };
}

/** Measurements that do not vary with size. */
export interface Dimensions {
  radius?: Measure;
  gap?: Measure;
  border?: Measure;
  [key: string]: Measure | undefined;
}

export interface ComponentSpec {
  /** PascalCase component name, e.g. `Button`. */
  name: string;
  /** kebab-case id, stable across renames of the display name. */
  id: string;
  category: Category;
  status: Status;
  /** One-line description, no trailing period stripping needed. */
  summary: string;
  /** Default host element, e.g. `button`, `span`, `div`. */
  element?: string;
  anatomy?: readonly SlotSpec[];
  props: readonly PropSpec[];
  /** Visual style families. */
  variants?: readonly StyleSpec[];
  /** Semantic color families. */
  tones?: readonly StyleSpec[];
  /** Size steps with their measurements. */
  sizes?: readonly SizeSpec[];
  /** Canonical default prop values (mirrors the `default` on each PropSpec). */
  defaults?: Record<string, string | number | boolean>;
  /** Size-independent measurements. */
  dimensions?: Dimensions;
  states?: readonly StateSpec[];
  /** Every `--perfect-*` token the component consumes, by bare name. */
  tokens?: readonly string[];
  a11y?: A11ySpec;
  motion?: MotionSpec;
}

// ---- validation ------------------------------------------------------------

export interface SpecIssue {
  spec: string;
  path: string;
  message: string;
}

const CATEGORIES: Category[] = ['atom', 'molecule', 'organism', 'structure', 'layout'];
const PROP_TYPES: PropType[] = ['enum', 'boolean', 'string', 'number', 'node', 'token', 'element', 'handler'];
const ID_RE = /^[a-z][a-z0-9-]*$/;

function isMeasure(value: unknown): boolean {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Structural validation that mirrors schema.json. Returns every problem found
 * rather than throwing on the first, so authoring and CI can list them all.
 */
export function validateSpec(spec: ComponentSpec): SpecIssue[] {
  const issues: SpecIssue[] = [];
  const id = spec?.id ?? spec?.name ?? '(unknown)';
  const fail = (path: string, message: string) => issues.push({ spec: id, path, message });

  if (!spec.name) fail('name', 'is required');
  if (!spec.id || !ID_RE.test(spec.id)) fail('id', 'must be kebab-case');
  if (!CATEGORIES.includes(spec.category)) fail('category', `must be one of ${CATEGORIES.join(', ')}`);
  if (spec.status !== 'stable' && spec.status !== 'draft') fail('status', 'must be stable or draft');
  if (!spec.summary) fail('summary', 'is required');
  if (!Array.isArray(spec.props)) fail('props', 'must be an array');

  const propNames = new Set<string>();
  for (const [i, prop] of (spec.props ?? []).entries()) {
    const at = `props[${i}]`;
    if (!prop.name) fail(at, 'name is required');
    if (propNames.has(prop.name)) fail(at, `duplicate prop ${prop.name}`);
    propNames.add(prop.name);
    if (!PROP_TYPES.includes(prop.type)) fail(`${at}.type`, `must be one of ${PROP_TYPES.join(', ')}`);
    if (prop.type === 'enum' && (!prop.values || prop.values.length === 0))
      fail(`${at}.values`, 'an enum prop needs values');
    if (!prop.description) fail(`${at}.description`, 'is required');
  }

  // every default must name a real prop and, for enums, a listed value
  for (const [key, value] of Object.entries(spec.defaults ?? {})) {
    const prop = spec.props?.find((p) => p.name === key);
    if (!prop) fail(`defaults.${key}`, 'has no matching prop');
    else if (prop.type === 'enum' && prop.values && !prop.values.includes(String(value)))
      fail(`defaults.${key}`, `${value} is not one of ${prop.values.join(', ')}`);
  }

  const checkMeasures = (obj: Record<string, unknown> | undefined, base: string) => {
    for (const [key, value] of Object.entries(obj ?? {})) {
      if (key === 'name') continue;
      if (value !== undefined && !isMeasure(value)) fail(`${base}.${key}`, 'must be a token ref or CSS value');
    }
  };
  for (const [i, size] of (spec.sizes ?? []).entries()) {
    if (!size.name) fail(`sizes[${i}].name`, 'is required');
    checkMeasures(size as unknown as Record<string, unknown>, `sizes[${i}]`);
  }
  checkMeasures(spec.dimensions, 'dimensions');

  return issues;
}
