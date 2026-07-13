/**
 * The Perfect component specification schema.
 *
 * A spec is the language-agnostic contract for one component: its API, its
 * variants and sizes, and - crucially - its measurements expressed in units of
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
 * `--glacier-*` custom properties) rather than a literal value. A measurement
 * may also be a raw CSS length like `0.5rem` when it genuinely sits off the
 * scale (icon glyphs, hairlines), but token references are strongly preferred.
 */
export type TokenRef = `$${string}`;

/** A measurement: a token reference (preferred) or a raw CSS value. */
export type Measure = TokenRef | (string & {});

export type Category = 'atom' | 'molecule' | 'organism' | 'structure' | 'layout';

export type Status = 'stable' | 'draft';

/** The language-agnostic type of a prop value. */
export type PropType = 'enum' | 'boolean' | 'string' | 'number' | 'node' | 'token' | 'element' | 'handler' | 'array' | 'object';

/**
 * A recursively described value inside an array or object prop. This keeps
 * collection APIs useful to non-React consumers without coupling specs to a
 * framework's generic type syntax.
 */
export interface ValueSpec {
  type: PropType;
  /** Allowed values for an enum value. */
  values?: readonly string[];
  /** Human-readable contract for the value. */
  description: string;
  /** Item shape for an array value. */
  item?: ValueSpec;
  /** Named fields for an object value. */
  fields?: readonly ObjectFieldSpec[];
}

/** A named object field inside a structured prop. */
export interface ObjectFieldSpec extends ValueSpec {
  name: string;
  required?: boolean;
}

export interface PropSpec extends ObjectFieldSpec {
  /** Canonical default, omitted when the prop has no default. */
  default?: string | number | boolean;
}

/**
 * The structured paint contract for one surface: which token fills each of
 * the three canonical paint roles. On a variant or tone it is the rest-state
 * paint; on a state it is the delta the state applies. Unlike the free-form
 * `tokens` map, every role here is fixed, so a port in any framework can bind
 * background, text, and border deterministically. A role is omitted when the
 * surface genuinely paints it with a non-token value (usually `transparent`
 * or `inherit`).
 */
export interface PaintSpec {
  background?: TokenRef;
  text?: TokenRef;
  border?: TokenRef;
}

/** The focus-visible ring: which token draws it and how far out it sits. */
export interface FocusRingSpec {
  ring: TokenRef;
  /** Outline offset (or `0` when the ring hugs or replaces the border). */
  offset?: string;
}

/** The component's base paint transition, as a duration/ease token pair. */
export interface TransitionSpec {
  duration: TokenRef;
  ease: TokenRef;
}

/**
 * A visual style family (Button's solid/soft/outline) or a semantic color
 * family (a tone: accent/success/danger). `paint` is the structured rest
 * paint; `tokens` maps any further surface role to the token that paints it,
 * so a consumer knows exactly which token to reach for.
 */
export interface StyleSpec {
  name: string;
  description: string;
  /** Structured rest paint for this family. */
  paint?: PaintSpec;
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
  /** Structured paint delta this state applies over the rest paint. */
  paint?: PaintSpec;
  tokens?: Record<string, TokenRef>;
  /**
   * Marks a state that changes behavior or announcement only, never paint
   * (haptic ticks, auto-dismiss timers). Exempt from the strictness paint
   * requirement; do not set it on states that visually repaint.
   */
  behavioral?: boolean;
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
  /**
   * The rest paint for components without variant or tone styling; expected on
   * every spec that declares neither, so plain atoms (heading, kbd, icon) still
   * carry a machine-readable color contract. Roles the CSS leaves to
   * inheritance (currentColor) are omitted, and a deliberately empty object
   * documents a component that paints nothing of its own.
   */
  paint?: PaintSpec;
  /** The focus-visible ring binding; expected on every focusable component. */
  focusRing?: FocusRingSpec;
  /** The base paint transition; expected wherever the CSS declares one. */
  transition?: TransitionSpec;
  /** Every `--glacier-*` token the component consumes, by bare name. */
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
const PROP_TYPES: PropType[] = ['enum', 'boolean', 'string', 'number', 'node', 'token', 'element', 'handler', 'array', 'object'];
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

  const validateValue = (value: ValueSpec, at: string) => {
    if (!PROP_TYPES.includes(value.type)) fail(`${at}.type`, `must be one of ${PROP_TYPES.join(', ')}`);
    if (value.type === 'enum' && (!value.values || value.values.length === 0))
      fail(`${at}.values`, 'an enum prop needs values');
    if (value.type === 'array' && !value.item) fail(`${at}.item`, 'an array prop needs an item shape');
    if (value.item) validateValue(value.item, `${at}.item`);

    const fieldNames = new Set<string>();
    for (const [i, field] of (value.fields ?? []).entries()) {
      const fieldAt = `${at}.fields[${i}]`;
      if (!field.name) fail(fieldAt, 'name is required');
      if (fieldNames.has(field.name)) fail(fieldAt, `duplicate field ${field.name}`);
      fieldNames.add(field.name);
      validateValue(field, fieldAt);
    }

    if (!value.description) fail(`${at}.description`, 'is required');
  };

  const propNames = new Set<string>();
  for (const [i, prop] of (spec.props ?? []).entries()) {
    const at = `props[${i}]`;
    if (!prop.name) fail(at, 'name is required');
    if (propNames.has(prop.name)) fail(at, `duplicate prop ${prop.name}`);
    propNames.add(prop.name);
    validateValue(prop, at);
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

  // paint, focus ring, and transition bindings must all be token refs
  const isTokenRef = (value: unknown): boolean => typeof value === 'string' && value.startsWith('$');
  const checkPaint = (paint: PaintSpec | undefined, base: string) => {
    for (const [role, value] of Object.entries(paint ?? {})) {
      if (value !== undefined && !isTokenRef(value)) fail(`${base}.${role}`, 'must be a $token reference');
    }
  };
  for (const [group, list] of [['variants', spec.variants], ['tones', spec.tones]] as const) {
    for (const [i, style] of (list ?? []).entries()) checkPaint(style.paint, `${group}[${i}].paint`);
  }
  for (const [i, state] of (spec.states ?? []).entries()) checkPaint(state.paint, `states[${i}].paint`);
  if (spec.focusRing && !isTokenRef(spec.focusRing.ring)) fail('focusRing.ring', 'must be a $token reference');
  if (spec.transition) {
    if (!isTokenRef(spec.transition.duration)) fail('transition.duration', 'must be a $token reference');
    if (!isTokenRef(spec.transition.ease)) fail('transition.ease', 'must be a $token reference');
  }

  return issues;
}

// ---- strictness audit --------------------------------------------------------

/**
 * ARIA roles whose host renders as a fixed-height box control: for these,
 * every size step must pin both `height` and `paddingInline` or a port can
 * match paint yet drift on geometry. Multi-line fields (`textarea`) size by
 * padding and content, so they are excluded even though their role is textbox.
 */
const BOX_CONTROL_ROLES = ['button', 'textbox', 'searchbox', 'spinbutton', 'combobox'];

/**
 * States whose repaint is not expected to carry paint tokens: `default` is
 * the rest state (its paint already lives on the variant or tone), and
 * `disabled`, `loading`, and `skeleton` are availability states that dim via
 * opacity or swap content rather than repaint.
 */
const PAINT_EXEMPT_STATES = ['default', 'disabled', 'loading', 'skeleton'];

/** One spec's strictness result: what is missing, out of how many checks. */
export interface StrictnessReport {
  /** Human-readable paths of every failed strictness check, empty at 100%. */
  missing: string[];
  /** How many strictness checks applied to this spec. */
  checks: number;
  /** Passed checks over applicable checks; 1 when no checks apply. */
  completeness: number;
}

/**
 * Audits how completely a spec binds its paint, so a framework port cannot
 * match geometry while drifting on color. Flags: focusable components with no
 * `focusRing`; variants and tones with no structured `paint`; states that
 * carry neither `paint` nor `tokens` (rest and availability states exempt);
 * and box-control sizes missing `height` or `paddingInline`.
 */
export function auditStrictness(spec: ComponentSpec): StrictnessReport {
  const missing: string[] = [];
  let checks = 0;

  if (spec.a11y?.focusable === true) {
    checks += 1;
    if (!spec.focusRing) missing.push('focusRing: focusable component declares no focus ring binding');
  }

  for (const [group, list] of [['variants', spec.variants], ['tones', spec.tones]] as const) {
    for (const style of list ?? []) {
      checks += 1;
      if (!style.paint) missing.push(`${group}[${style.name}].paint: no structured rest paint`);
    }
  }

  for (const state of spec.states ?? []) {
    if (PAINT_EXEMPT_STATES.includes(state.name)) continue;
    if (state.behavioral) continue;
    checks += 1;
    if (!state.paint && Object.keys(state.tokens ?? {}).length === 0)
      missing.push(`states[${state.name}]: no paint or tokens binding`);
  }

  if ((spec.variants ?? []).length === 0 && (spec.tones ?? []).length === 0) {
    checks += 1;
    if (!spec.paint) missing.push('paint: no top-level rest paint for a variantless component');
  }

  const role = spec.a11y?.role;
  const isBoxControl =
    spec.a11y?.focusable === true && role !== undefined && BOX_CONTROL_ROLES.includes(role) && spec.element !== 'textarea';
  if (isBoxControl) {
    for (const size of spec.sizes ?? []) {
      checks += 2;
      if (size.height === undefined) missing.push(`sizes[${size.name}].height: box control size pins no height`);
      if (size.paddingInline === undefined)
        missing.push(`sizes[${size.name}].paddingInline: box control size pins no inline padding`);
    }
  }

  return { missing, checks, completeness: checks === 0 ? 1 : (checks - missing.length) / checks };
}

/** One row of the catalog summary: a spec's id plus its strictness report. */
export interface StrictnessSummary extends StrictnessReport {
  id: string;
}

/** The catalog-wide strictness roll-up consumed by the report generator. */
export interface CatalogStrictness {
  /** Per-spec completeness, in catalog order. */
  components: StrictnessSummary[];
  /** Total applicable checks across the catalog. */
  checks: number;
  /** Total failed checks across the catalog. */
  missing: number;
  /** Passed checks over applicable checks, catalog-wide. */
  completeness: number;
}

/** Audits every spec and rolls the results up to one catalog completeness fraction. */
export function auditCatalogStrictness(catalog: readonly ComponentSpec[]): CatalogStrictness {
  const components = catalog.map((spec) => ({ id: spec.id, ...auditStrictness(spec) }));
  const checks = components.reduce((sum, c) => sum + c.checks, 0);
  const missing = components.reduce((sum, c) => sum + c.missing.length, 0);
  return { components, checks, missing, completeness: checks === 0 ? 1 : (checks - missing) / checks };
}
