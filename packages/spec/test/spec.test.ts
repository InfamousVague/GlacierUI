import { describe, expect, it } from 'vitest';
import {
  auditCatalogStrictness,
  auditStrictness,
  buttonSpec,
  cssValue,
  getSpec,
  specs,
  specsById,
  token,
  validateSpec,
  type ComponentSpec,
  type TokenRef,
} from '../src/index.ts';
import { schemaJson } from '../src/schema-json.ts';

/** A minimal well-formed spec the negative tests can break one field at a time. */
const base: ComponentSpec = {
  name: 'Widget',
  id: 'widget',
  category: 'atom',
  status: 'stable',
  summary: 'A test widget.',
  props: [
    { name: 'tone', type: 'enum', values: ['neutral', 'accent'], description: 'Semantic color.' },
  ],
};

const messagesOf = (spec: ComponentSpec) => validateSpec(spec).map((i) => `${i.path}: ${i.message}`);

describe('catalog lookup', () => {
  it('finds every spec by id and misses unknown ids', () => {
    expect(getSpec('button')).toBe(buttonSpec);
    expect(getSpec('no-such-component')).toBeUndefined();
    expect(Object.keys(specsById)).toHaveLength(specs.length);
  });
});

describe('vocab helpers', () => {
  it('writes token refs and resolves measures to custom properties', () => {
    expect(token('space-4')).toBe('$space-4');
    expect(cssValue('$space-4')).toBe('var(--glacier-space-4)');
    expect(cssValue('0.5rem')).toBe('0.5rem');
  });
});

describe('validateSpec', () => {
  it('accepts the whole shipped catalog', () => {
    expect(specs.flatMap((spec) => validateSpec(spec))).toEqual([]);
  });

  it('rejects missing identity fields', () => {
    const issues = messagesOf({
      ...base,
      name: '',
      id: 'Not Kebab',
      category: 'gadget' as ComponentSpec['category'],
      status: 'beta' as ComponentSpec['status'],
      summary: '',
    });
    expect(issues).toContainEqual(expect.stringContaining('name: is required'));
    expect(issues).toContainEqual(expect.stringContaining('id: must be kebab-case'));
    expect(issues).toContainEqual(expect.stringContaining('category: must be one of'));
    expect(issues).toContainEqual(expect.stringContaining('status: must be stable or draft'));
    expect(issues).toContainEqual(expect.stringContaining('summary: is required'));
  });

  it('rejects a non-array props field', () => {
    const issues = messagesOf({ ...base, props: undefined as unknown as ComponentSpec['props'] });
    expect(issues).toContainEqual(expect.stringContaining('props: must be an array'));
  });

  it('rejects malformed prop values, duplicates, and empty enums', () => {
    const issues = messagesOf({
      ...base,
      props: [
        { name: 'tone', type: 'enum', description: 'No values.' },
        { name: 'tone', type: 'mystery' as 'enum', description: 'Duplicate, bad type.' },
        { name: 'items', type: 'array', description: 'No item shape.' },
        { name: '', type: 'string', description: '' },
        {
          name: 'columns',
          type: 'array',
          description: 'Structured.',
          item: {
            type: 'object',
            description: 'One column.',
            fields: [
              { name: 'key', type: 'string', description: 'Column key.' },
              { name: 'key', type: 'string', description: 'Duplicate field.' },
            ],
          },
        },
      ],
    });
    expect(issues).toContainEqual(expect.stringContaining('values: an enum prop needs values'));
    expect(issues).toContainEqual(expect.stringContaining('type: must be one of'));
    expect(issues).toContainEqual(expect.stringContaining('duplicate prop tone'));
    expect(issues).toContainEqual(expect.stringContaining('item: an array prop needs an item shape'));
    expect(issues).toContainEqual(expect.stringContaining('name is required'));
    expect(issues).toContainEqual(expect.stringContaining('description: is required'));
    expect(issues).toContainEqual(expect.stringContaining('duplicate field key'));
  });

  it('rejects defaults that name no prop or an unlisted enum value', () => {
    const issues = messagesOf({ ...base, defaults: { tone: 'loud', ghost: true } });
    expect(issues).toContainEqual(expect.stringContaining('defaults.ghost: has no matching prop'));
    expect(issues).toContainEqual(expect.stringContaining('defaults.tone: loud is not one of'));
  });

  it('rejects unnamed sizes and non-measure values', () => {
    const issues = messagesOf({
      ...base,
      sizes: [{ name: '', height: 4 as unknown as string }],
      dimensions: { radius: 9 as unknown as string },
    });
    expect(issues).toContainEqual(expect.stringContaining('sizes[0].name: is required'));
    expect(issues).toContainEqual(expect.stringContaining('sizes[0].height: must be a token ref or CSS value'));
    expect(issues).toContainEqual(expect.stringContaining('dimensions.radius: must be a token ref or CSS value'));
  });
});

describe('validateSpec paint bindings', () => {
  const notAToken = 'red' as TokenRef;

  it('accepts token-bound paint, focus ring, and transition', () => {
    const issues = validateSpec({
      ...base,
      variants: [{ name: 'solid', description: 'Filled.', paint: { background: '$accent-solid', text: '$accent-contrast' } }],
      states: [{ name: 'hover', description: 'Pointer over.', paint: { background: '$accent-hover' } }],
      focusRing: { ring: '$focus-ring' },
      transition: { duration: '$duration-fast', ease: '$ease-out' },
    });
    expect(issues).toEqual([]);
  });

  it('rejects paint roles, focus rings, and transitions that are not token refs', () => {
    const issues = messagesOf({
      ...base,
      variants: [{ name: 'solid', description: 'Filled.', paint: { background: notAToken } }],
      tones: [{ name: 'danger', description: 'Destructive.', paint: { text: notAToken } }],
      states: [{ name: 'hover', description: 'Pointer over.', paint: { border: notAToken } }],
      focusRing: { ring: notAToken },
      transition: { duration: notAToken, ease: notAToken },
    });
    expect(issues).toContainEqual(expect.stringContaining('variants[0].paint.background: must be a $token reference'));
    expect(issues).toContainEqual(expect.stringContaining('tones[0].paint.text: must be a $token reference'));
    expect(issues).toContainEqual(expect.stringContaining('states[0].paint.border: must be a $token reference'));
    expect(issues).toContainEqual(expect.stringContaining('focusRing.ring: must be a $token reference'));
    expect(issues).toContainEqual(expect.stringContaining('transition.duration: must be a $token reference'));
    expect(issues).toContainEqual(expect.stringContaining('transition.ease: must be a $token reference'));
  });
});

describe('strictness audit', () => {
  it('scores a spec with no applicable checks as fully complete', () => {
    expect(auditStrictness(base)).toEqual({ missing: [], checks: 0, completeness: 1 });
  });

  it('scores a fully paint-bound box control as complete', () => {
    const report = auditStrictness({
      ...base,
      element: 'button',
      a11y: { role: 'button', focusable: true },
      focusRing: { ring: '$focus-ring' },
      variants: [{ name: 'solid', description: 'Filled.', paint: { background: '$accent-solid' } }],
      states: [
        { name: 'default', description: 'Rest.' },
        { name: 'disabled', description: 'Dimmed.' },
        { name: 'hover', description: 'Pointer over.', paint: { background: '$accent-hover' } },
      ],
      sizes: [{ name: 'md', height: '$control-height-md', paddingInline: '$space-4' }],
    });
    expect(report.missing).toEqual([]);
    expect(report.completeness).toBe(1);
  });

  it('flags every unbound surface on a lax box control', () => {
    const report = auditStrictness({
      ...base,
      a11y: { role: 'button', focusable: true },
      variants: [{ name: 'solid', description: 'Filled.' }],
      states: [{ name: 'hover', description: 'Pointer over.' }],
      sizes: [{ name: 'md' }],
    });
    expect(report.checks).toBe(5);
    expect(report.missing).toHaveLength(5);
    expect(report.completeness).toBe(0);
    expect(report.missing).toContainEqual(expect.stringContaining('focusRing'));
    expect(report.missing).toContainEqual(expect.stringContaining('variants[solid].paint'));
    expect(report.missing).toContainEqual(expect.stringContaining('states[hover]'));
    expect(report.missing).toContainEqual(expect.stringContaining('sizes[md].height'));
    expect(report.missing).toContainEqual(expect.stringContaining('sizes[md].paddingInline'));
  });

  it('exempts textareas from box-control geometry checks', () => {
    const report = auditStrictness({
      ...base,
      element: 'textarea',
      a11y: { role: 'textbox', focusable: true },
      focusRing: { ring: '$focus-ring' },
      sizes: [{ name: 'md' }],
    });
    expect(report.missing).toEqual([]);
  });

  it('rolls the catalog up to one completeness fraction', () => {
    const rollup = auditCatalogStrictness(specs);
    expect(rollup.components).toHaveLength(specs.length);
    expect(rollup.missing).toBeLessThanOrEqual(rollup.checks);
    expect(rollup.completeness).toBeGreaterThanOrEqual(0);
    expect(rollup.completeness).toBeLessThanOrEqual(1);
    expect(auditCatalogStrictness([]).completeness).toBe(1);
  });
});

describe('schema.json artifact', () => {
  it('is a draft-07 schema mirroring the TypeScript contract', () => {
    expect(schemaJson.$schema).toBe('http://json-schema.org/draft-07/schema#');
    expect(schemaJson.type).toBe('object');
    expect(schemaJson.required).toEqual(['name', 'id', 'category', 'status', 'summary', 'props']);
    expect(schemaJson.properties.category.enum).toEqual([
      'atom',
      'molecule',
      'organism',
      'structure',
      'layout',
    ]);
    expect(schemaJson.definitions.propSpec.properties.type.enum).toEqual([
      'enum',
      'boolean',
      'string',
      'number',
      'node',
      'token',
      'element',
      'handler',
      'array',
      'object',
    ]);
  });

  it('lists every authored category value used by the catalog', () => {
    const used = new Set(specs.map((spec) => spec.category));
    for (const category of used) {
      expect(schemaJson.properties.category.enum).toContain(category);
    }
  });
});
