/**
 * JSON Schema (draft-07) for a component spec, emitted to dist/schema.json.
 * This is the machine-readable contract non-JS consumers validate against; it
 * mirrors the TypeScript types in schema.ts and the checks in validateSpec.
 */

const measure = { type: 'string', description: 'A `$token-name` reference or a raw CSS value.' };
const tokenRef = { type: 'string', pattern: '^\\$' };
const tokenMap = { type: 'object', additionalProperties: tokenRef };
const paint = {
  type: 'object',
  description: 'Structured paint bindings: which token fills each canonical paint role.',
  additionalProperties: false,
  properties: { background: tokenRef, text: tokenRef, border: tokenRef },
};
const propTypes = ['enum', 'boolean', 'string', 'number', 'node', 'token', 'element', 'handler', 'array', 'object'];

export const schemaJson = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://glacier.design/schema/component-spec.json',
  title: 'GlacierUI component spec',
  type: 'object',
  required: ['name', 'id', 'category', 'status', 'summary', 'props'],
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    id: { type: 'string', pattern: '^[a-z][a-z0-9-]*$' },
    category: { enum: ['atom', 'molecule', 'organism', 'structure', 'layout'] },
    status: { enum: ['stable', 'draft'] },
    summary: { type: 'string' },
    element: { type: 'string' },
    anatomy: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'description'],
        additionalProperties: false,
        properties: { name: { type: 'string' }, description: { type: 'string' }, required: { type: 'boolean' } },
      },
    },
    props: {
      type: 'array',
      items: { $ref: '#/definitions/propSpec' },
    },
    variants: { $ref: '#/definitions/styleList' },
    tones: { $ref: '#/definitions/styleList' },
    sizes: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name'],
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          height: measure,
          paddingInline: measure,
          paddingBlock: measure,
          gap: measure,
          fontSize: measure,
          radius: measure,
          diameter: measure,
          iconSize: measure,
          border: measure,
          thickness: measure,
        },
      },
    },
    defaults: { type: 'object', additionalProperties: { type: ['string', 'number', 'boolean'] } },
    dimensions: { type: 'object', additionalProperties: measure },
    states: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'description'],
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          paint,
          tokens: tokenMap,
          behavioral: { type: 'boolean' },
        },
      },
    },
    paint,
    focusRing: {
      type: 'object',
      required: ['ring'],
      additionalProperties: false,
      properties: { ring: tokenRef, offset: { type: 'string' } },
    },
    transition: {
      type: 'object',
      required: ['duration', 'ease'],
      additionalProperties: false,
      properties: { duration: tokenRef, ease: tokenRef },
    },
    tokens: { type: 'array', items: { type: 'string' } },
    a11y: {
      type: 'object',
      additionalProperties: false,
      properties: {
        role: { type: 'string' },
        focusable: { type: 'boolean' },
        keyboard: {
          type: 'array',
          items: {
            type: 'object',
            required: ['keys', 'action'],
            additionalProperties: false,
            properties: { keys: { type: 'string' }, action: { type: 'string' } },
          },
        },
        notes: { type: 'array', items: { type: 'string' } },
      },
    },
    motion: {
      type: 'object',
      required: ['description'],
      additionalProperties: false,
      properties: {
        description: { type: 'string' },
        press: { type: 'boolean' },
        transition: {
          type: 'object',
          additionalProperties: false,
          properties: { speed: { type: 'string' }, ease: { type: 'string' }, spring: { type: 'string' } },
        },
      },
    },
  },
  definitions: {
    valueSpec: {
      type: 'object',
      required: ['type', 'description'],
      additionalProperties: false,
      properties: {
        type: { enum: propTypes },
        values: { type: 'array', items: { type: 'string' } },
        description: { type: 'string' },
        item: { $ref: '#/definitions/valueSpec' },
        fields: { type: 'array', items: { $ref: '#/definitions/objectFieldSpec' } },
      },
    },
    objectFieldSpec: {
      type: 'object',
      required: ['name', 'type', 'description'],
      additionalProperties: false,
      properties: {
        name: { type: 'string' },
        type: { enum: propTypes },
        values: { type: 'array', items: { type: 'string' } },
        required: { type: 'boolean' },
        description: { type: 'string' },
        item: { $ref: '#/definitions/valueSpec' },
        fields: { type: 'array', items: { $ref: '#/definitions/objectFieldSpec' } },
      },
    },
    propSpec: {
      type: 'object',
      required: ['name', 'type', 'description'],
      additionalProperties: false,
      properties: {
        name: { type: 'string' },
        type: { enum: propTypes },
        values: { type: 'array', items: { type: 'string' } },
        default: { type: ['string', 'number', 'boolean'] },
        required: { type: 'boolean' },
        description: { type: 'string' },
        item: { $ref: '#/definitions/valueSpec' },
        fields: { type: 'array', items: { $ref: '#/definitions/objectFieldSpec' } },
      },
    },
    styleList: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'description'],
        additionalProperties: false,
        properties: { name: { type: 'string' }, description: { type: 'string' }, paint, tokens: tokenMap },
      },
    },
  },
} as const;
