import type { ComponentSpec, PaintSpec } from '../schema.ts';
import { tones, toneSpecs, token } from '../vocab.ts';

/**
 * Per-tone marker paint, transcribed from Timeline.module.css: the tone's
 * solid fills the dot (or the whole disc when an icon is present) and the
 * tone's contrast draws the glyph on it. Neutral fills with text-subtle, a
 * text color, so the surface glyph keeps readable contrast in both themes.
 */
const markerTonePaint: Record<string, PaintSpec> = {
  neutral: { background: token('text-subtle'), text: token('surface') },
  accent: { background: token('accent-solid'), text: token('accent-contrast') },
  success: { background: token('success-solid'), text: token('success-contrast') },
  warning: { background: token('warning-solid'), text: token('warning-contrast') },
  danger: { background: token('danger-solid'), text: token('danger-contrast') },
  info: { background: token('info-solid'), text: token('info-contrast') },
};

export const timelineSpec: ComponentSpec = {
  name: 'Timeline',
  id: 'timeline',
  category: 'organism',
  status: 'stable',
  summary:
    'A vertical activity feed: a semantic ordered list of events, each with a tone-colored marker on a connector rail and a content column of actor, title, timestamp, description, media, and actions.',
  element: 'ol',
  anatomy: [
    { name: 'root', description: 'The ordered list; its DOM order is the chronology the consumer chooses (newest-first or oldest-first).', required: true },
    { name: 'item', description: 'One event: a list item holding the marker rail and the content column.', required: true },
    { name: 'rail', description: 'The decorative (aria-hidden) leading column holding the marker and connector.', required: true },
    { name: 'marker', description: 'The tone-colored disc: a plain dot by default, or a filled disc holding the icon glyph.', required: true },
    { name: 'icon', description: 'Optional glyph inside the marker, drawn in the tone contrast color.' },
    { name: 'connector', description: 'The hairline rule between markers; the last item draws none below its marker.' },
    { name: 'header', description: 'The event header row: actor, title, then the timestamp hugging the end.', required: true },
    { name: 'actor', description: 'Optional avatar or name slot composed by the consumer, leading the header row.' },
    { name: 'title', description: 'The event headline at medium weight.', required: true },
    { name: 'timestamp', description: 'Optional muted time slot at the end of the header row.' },
    { name: 'description', description: 'Optional muted body copy under the header row.' },
    { name: 'media', description: 'Optional media or preview block under the description, clipped to the medium radius.' },
    { name: 'actions', description: 'Optional action row of small buttons or links under the body.' },
  ],
  props: [
    {
      name: 'items',
      type: 'array',
      required: true,
      description: 'The events, in reading order: the DOM order is the chronology the consumer chooses.',
      item: {
        type: 'object',
        description: 'One event.',
        fields: [
          { name: 'id', type: 'string', required: true, description: 'Stable identity (string or number) for the event.' },
          { name: 'title', type: 'node', required: true, description: 'The event headline.' },
          { name: 'description', type: 'node', description: 'Body copy under the header row.' },
          { name: 'timestamp', type: 'node', description: 'Muted time slot at the end of the header row; a time element carries machine-readable dates.' },
          { name: 'actor', type: 'node', description: 'Avatar or name slot composed by the consumer, leading the header row.' },
          { name: 'icon', type: 'node', description: 'Glyph inside the marker, hidden from assistive tech; falls back to a plain dot.' },
          { name: 'tone', type: 'enum', values: tones, description: 'Colors the marker; defaults to neutral.' },
          { name: 'media', type: 'node', description: 'Media or preview block under the description.' },
          { name: 'actions', type: 'node', description: 'Action row of small buttons or links.' },
        ],
      },
    },
    { name: 'aria-label', type: 'string', required: true, description: 'Accessible name for the feed.' },
    { name: 'density', type: 'enum', values: ['comfortable', 'compact'], default: 'comfortable', description: 'Vertical rhythm; compact trims the space between events.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the component exact geometry.' },
    { name: 'skeletonCount', type: 'number', default: 4, description: 'How many placeholder rows the skeleton draws.' },
  ],
  tones: toneSpecs().map((tone) => ({ ...tone, paint: markerTonePaint[tone.name] })),
  defaults: { density: 'comfortable', skeleton: false, skeletonCount: 4 },
  dimensions: {
    markerSize: token('size-lg'),
    dotSize: token('size-xs'),
    connectorWidth: token('hairline'),
    connectorMinHeight: token('space-3'),
    railGap: token('space-3'),
    headerGap: token('space-2'),
    itemPaddingBlock: token('space-5'),
    compactPaddingBlock: token('space-3'),
    mediaRadius: token('radius-md'),
    // content-column offsets under the header row
    descriptionGap: token('space-1'),
    mediaGap: token('space-2'),
    actionsGap: token('space-2'),
    actionsItemGap: token('space-2'),
  },
  states: [
    {
      name: 'skeleton',
      description: 'Marker discs and text lines stand in with the exact rail geometry; the whole feed is aria-hidden.',
    },
  ],
  tokens: [
    'font-sans', 'font-size-sm', 'font-size-xs', 'font-weight-medium',
    'text', 'text-muted', 'text-subtle',
    'border', 'surface', 'hairline',
    'radius-md', 'radius-full', 'size-lg', 'size-xs',
    'space-1', 'space-2', 'space-3', 'space-5',
    'accent-solid', 'accent-contrast', 'success-solid', 'success-contrast',
    'warning-solid', 'warning-contrast', 'danger-solid', 'danger-contrast',
    'info-solid', 'info-contrast',
  ],
  a11y: {
    focusable: false,
    notes: [
      'The host is a native ordered list with a required aria-label and an explicit role="list": WebKit strips list semantics from lists styled with list-style: none, and the role restores them. The DOM order is the reading order, so chronological meaning (newest-first or oldest-first) survives into assistive tech.',
      'The marker rail (dot, icon, and connector) is aria-hidden and purely decorative; every meaning-bearing slot lives in the content column as plain content.',
      'Timestamps are plain text; pass a time element with a datetime attribute for machine-readable dates.',
      'Interactive content in the actions slot keeps its own semantics and tab order; the timeline itself takes no focus.',
      'The skeleton placeholder is aria-hidden; mark the surrounding region aria-busy at the app level while loading.',
    ],
  },
};
