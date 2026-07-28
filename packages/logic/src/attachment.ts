/**
 * Attachment rules — everything a message attachment renderer *decides* before
 * it paints anything: how tall a photo is allowed to get, how an album of two
 * to N photos tiles, how a byte count and a file name are spelled, which glyph
 * a file gets, and what an attachment announces to a screen reader.
 *
 * None of it is pixels, and all of it has to be identical on both platforms —
 * a mosaic that tiles 3 photos differently on iOS than on the web is the same
 * bug as a button with the wrong radius, only harder to spot. So it lives here
 * once, and `@glacier/react` and `@glacier/native` both read it.
 *
 * Routing (which renderer an attachment gets) is NOT here: `attachmentKind` in
 * `chat.ts` already owns mime sniffing, and this module consumes it rather than
 * growing a second opinion about what a `.heic` is.
 */

import { attachmentKind, type ChatAttachment } from './chat.ts';

// ---- aspect ratio ----------------------------------------------------------

/**
 * The narrowest a single image may render, as width ÷ height.
 *
 * 2:3 is roughly a portrait photo held upright. Below it the picture starts
 * behaving like a wall: a 9:16 phone screenshot (0.5625) in a 280pt bubble is
 * ~500pt tall, which pushes every message around it off screen and makes the
 * transcript feel like it stopped. Clamping means the frame crops rather than
 * grows — the full picture is one tap away, and the conversation stays readable.
 */
export const ATTACHMENT_ASPECT_MIN = 2 / 3;

/**
 * The widest a single image may render. A 3:1 panorama at bubble width is a
 * ~90pt letterbox slot nobody can see anything in; 2:1 is the last ratio where
 * a landscape photo still reads as a photo.
 */
export const ATTACHMENT_ASPECT_MAX = 2;

/**
 * The ratio used when the sender told us nothing about the image's size.
 *
 * 4:3 is deliberately unremarkable: it is close enough to both a phone photo
 * and a screenshot that the reserved box is never wildly wrong, and the frame
 * crops to fit once the real bytes land. Reserving *something* always beats
 * reserving nothing, because a box that appears from zero height shoves the
 * whole transcript downward exactly when the reader is looking at it.
 */
export const ATTACHMENT_ASPECT_FALLBACK = 4 / 3;

/** A resolved frame ratio, plus whether the clamp had to intervene. */
export interface AttachmentAspect {
  /** Width ÷ height, always between the min and max clamps. */
  ratio: number;
  /**
   * The intrinsic ratio was outside the clamps, so the frame crops. Renderers
   * use it to offer the "tap to see the whole thing" affordance only where
   * there is genuinely more to see.
   */
  clamped: boolean;
}

/**
 * Resolves the frame ratio for a single image.
 *
 * Intrinsic dimensions are trusted when both are finite and positive, because
 * that is what lets the box be reserved *before* a single byte arrives — the
 * one thing that keeps an arriving photo from shifting the layout. Anything
 * else (a zero, a NaN, a missing height) falls back rather than throwing: a
 * slightly wrong box is invisible next to a transcript that crashed.
 */
export function attachmentAspect(
  width?: number,
  height?: number,
  fallback: number = ATTACHMENT_ASPECT_FALLBACK,
): AttachmentAspect {
  const usable =
    typeof width === 'number' &&
    typeof height === 'number' &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0;
  const intrinsic = usable ? width / height : fallback;
  const ratio = Math.min(Math.max(intrinsic, ATTACHMENT_ASPECT_MIN), ATTACHMENT_ASPECT_MAX);
  return { ratio, clamped: usable && ratio !== intrinsic };
}

// ---- album tiling ----------------------------------------------------------

/**
 * How many tiles an album shows before the rest collapse into a "+N" count.
 *
 * Four is where every messenger landed, and the reason is arithmetic rather
 * than taste: a bubble is about half the screen wide, and a fifth tile takes
 * each one below the size where a face is recognisable — at which point the
 * grid is showing five things nobody can identify instead of four they can,
 * plus a count.
 */
export const IMAGE_GRID_MAX_TILES = 4;

/** The gutter between tiles, as a bare token name for each binding to wrap. */
export const IMAGE_GRID_GAP = 'space-1';

/** One tile of the mosaic. */
export interface ImageGridTile {
  /** Index into the caller's image list. */
  index: number;
  /** Share of the row's width. Every tile in a row currently weighs the same. */
  flex: number;
  /**
   * How many further images this tile stands in for. Non-zero only on the last
   * tile of an overflowing album, and what the "+N" badge counts.
   */
  overflow: number;
}

/** One row of the mosaic; rows stack, tiles sit side by side inside one. */
export interface ImageGridRow {
  /** Share of the grid's height. */
  flex: number;
  tiles: ImageGridTile[];
}

export interface ImageGridLayout {
  rows: ImageGridRow[];
  /**
   * The whole grid's width ÷ height, or undefined for a single image — which
   * keeps its own clamped intrinsic ratio instead of being forced into a slot.
   */
  aspectRatio?: number;
  /** How many images are rendered as tiles. */
  shown: number;
  /** How many are behind the "+N" badge. */
  overflow: number;
  /** The gutter token name. */
  gap: string;
}

/**
 * Tiles an album of images.
 *
 * The shape is fixed by the count, so the same album is the same mosaic
 * everywhere: two side by side; three as a full-width banner over a pair; four
 * as a 2×2; and past four, a 2×2 whose last tile carries the "+N".
 *
 * It is expressed as rows of tiles rather than a grid of spans for one blunt
 * reason: React Native has no CSS grid. Rows of flex weights are the one layout
 * primitive both platforms render *identically* rather than approximately, and
 * a mosaic that only agrees to within a few points is a mosaic that will drift.
 * The nested big-left-two-stacked-right variant is deliberately not offered —
 * it needs a second axis of nesting to describe, and it squeezes a portrait
 * photo into a narrow column where it is mostly crop.
 *
 * Every tile is therefore either a square (a pair sharing a row) or a 2:1
 * banner (a lone tile in a row), which is why the grid's own ratio falls out as
 * `2 / rows`: the grid is two tile-widths across and one tile-height per row.
 */
export function imageGridLayout(count: number, options: { max?: number } = {}): ImageGridLayout {
  const max = Math.max(1, Math.floor(options.max ?? IMAGE_GRID_MAX_TILES));
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (total === 0) return { rows: [], shown: 0, overflow: 0, gap: IMAGE_GRID_GAP };

  const shown = Math.min(total, max);
  const overflow = total - shown;

  // A lone image is not a mosaic: it keeps its own ratio, so no grid ratio is
  // reported and the renderer falls back to `attachmentAspect`.
  if (shown === 1) {
    return {
      rows: [{ flex: 1, tiles: [{ index: 0, flex: 1, overflow }] }],
      shown,
      overflow,
      gap: IMAGE_GRID_GAP,
    };
  }

  // An odd count leads with a full-width banner so the pairs below stay square;
  // pairing first would leave a lonely half-width tile at the bottom.
  const rows: ImageGridRow[] = [];
  let index = 0;
  if (shown % 2 === 1) {
    rows.push({ flex: 1, tiles: [{ index, flex: 1, overflow: 0 }] });
    index += 1;
  }
  while (index < shown) {
    rows.push({
      flex: 1,
      tiles: [
        { index, flex: 1, overflow: 0 },
        { index: index + 1, flex: 1, overflow: 0 },
      ],
    });
    index += 2;
  }

  // The count rides the last tile: it is the one furthest from the reader's
  // entry point, so covering it hides the least.
  const lastRow = rows[rows.length - 1];
  const lastTile = lastRow?.tiles[lastRow.tiles.length - 1];
  if (lastTile) lastTile.overflow = overflow;

  return { rows, aspectRatio: 2 / rows.length, shown, overflow, gap: IMAGE_GRID_GAP };
}

// ---- file names ------------------------------------------------------------

/**
 * How many characters stay pinned to the end of a truncated file name.
 *
 * Truncation happens in the middle, never at the end, because the end is the
 * part that carries meaning: `Q3-final-revised-v7.pdf` and
 * `Q3-final-revised-v7.numbers` are the same twenty characters followed by the
 * only difference that matters. Eight characters is the smallest tail that
 * still shows a versioned suffix (`-v7.pdf`) alongside its extension.
 */
export const FILE_NAME_TAIL = 8;

/** A file name split for middle truncation. */
export interface SplitFileName {
  /** The leading run, which the renderer lets overflow with an ellipsis. */
  head: string;
  /** The trailing run, pinned and never clipped. Empty when nothing was split. */
  tail: string;
}

/**
 * Splits a name into an elastic head and a pinned tail.
 *
 * This is the *layout* half of middle truncation: neither binding measures
 * text, they just let the head ellipsis away (CSS `text-overflow` on the web, a
 * one-line `<Text>` natively) while the tail holds its ground. That makes the
 * truncation responsive for free the same split renders more or fewer
 * characters at different bubble widths, with no re-measuring and no reflow
 * loop.
 *
 * The tail is widened when an extension is longer than the default, so
 * `.numbers` and `.sketch` survive intact; and it is never allowed past half
 * the name, because a tail longer than the head is not a truncation, it is a
 * reversed one.
 */
export function splitFileName(name: string, tail: number = FILE_NAME_TAIL): SplitFileName {
  // Code points, not UTF-16 units: an emoji in a file name is common enough,
  // and slicing one in half renders a replacement character.
  const chars = [...name];
  const extension = fileExtension(name);
  // +1 for the dot, +2 so at least a couple of name characters ride along with
  // it — a bare `.pdf` on the far side of an ellipsis reads as a file type
  // rather than as the end of this file's name.
  const wanted = Math.max(tail, extension.length + 3);
  // Split only once the name is at least twice the tail: below that the head
  // would be shorter than the pinned end, which is a reversed truncation rather
  // than a middle one — and a name that short has nothing to gain from it.
  if (chars.length <= wanted * 2) return { head: name, tail: '' };
  return { head: chars.slice(0, chars.length - wanted).join(''), tail: chars.slice(-wanted).join('') };
}

/**
 * Middle-truncates a name to at most `max` characters, for the places that need
 * a plain string rather than two elements — a native accessibility hint, a
 * document title, a log line.
 *
 * Prefer `splitFileName` wherever the renderer can lay out two runs: it adapts
 * to the actual width, while this one has to guess at a character count.
 */
export function middleTruncate(name: string, max: number, ellipsis = '…'): string {
  const chars = [...name];
  if (!Number.isFinite(max) || max <= 0 || chars.length <= max) return name;
  const budget = Math.max(0, Math.floor(max) - [...ellipsis].length);
  const { tail } = splitFileName(name);
  const keptTail = [...tail].slice(-Math.floor(budget / 2));
  const keptHead = chars.slice(0, Math.max(0, budget - keptTail.length));
  return `${keptHead.join('')}${ellipsis}${keptTail.join('')}`;
}

/**
 * The lowercased extension of a name or URL, or `''` when it has none.
 *
 * TODO(integration): `chat.ts` has the identical helper as a private function.
 * Export it there and delete this one — two copies of "what is an extension" is
 * exactly the drift this package exists to prevent.
 */
function fileExtension(nameOrUrl: string): string {
  const path = nameOrUrl.split(/[?#]/)[0] ?? '';
  const base = path.split('/').pop() ?? '';
  const dot = base.lastIndexOf('.');
  // `dot <= 0` covers both "no extension" and a dotfile like `.gitignore`,
  // whose leading dot is part of the name rather than a type.
  return dot <= 0 ? '' : base.slice(dot + 1).toLowerCase();
}

// ---- byte counts -----------------------------------------------------------

const SIZE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;

/**
 * Spells a byte count the way a file manager does: `842 bytes`, `1.2 MB`.
 *
 * Decimal units (1000, not 1024) because that is what every OS file listing and
 * every "12.4 MB of 50 MB" progress line the user has ever seen reports, and a
 * size that disagrees with the Finder is a size the user distrusts.
 *
 * Formatting goes through `Intl.NumberFormat`'s unit style rather than a
 * hardcoded `" MB"`, so the number, its decimal separator, and the unit are all
 * spelled in the reader's language — and RTL locales get the unit on the
 * correct side without the renderer doing anything.
 */
export function formatFileSize(bytes: number, locale?: string): string {
  const total = Number.isFinite(bytes) ? Math.max(0, bytes) : 0;
  let value = total;
  let unit = 0;
  while (value >= 1000 && unit < SIZE_UNITS.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: SIZE_UNITS[unit] ?? 'byte',
    unitDisplay: 'short',
    // Bytes are whole things, and past 10 of any unit the decimal is noise:
    // "12.4 MB" and "12 MB" tell the reader the same thing.
    maximumFractionDigits: unit === 0 || value >= 10 ? 0 : 1,
  }).format(value);
}

// ---- file glyphs -----------------------------------------------------------

/**
 * The glyph families a file card can show. Semantic names, not icon names: each
 * binding maps them to its own icon set, so swapping icon packs is one table.
 */
export const fileGlyphs = [
  'image',
  'video',
  'audio',
  'pdf',
  'document',
  'sheet',
  'slides',
  'archive',
  'code',
  'text',
  'file',
] as const;

export type FileGlyph = (typeof fileGlyphs)[number];

/** Extensions worth a glyph of their own; anything else is a plain file. */
const GLYPH_EXTENSIONS: Record<string, FileGlyph> = {
  pdf: 'pdf',
  doc: 'document', docx: 'document', odt: 'document', rtf: 'document', pages: 'document',
  xls: 'sheet', xlsx: 'sheet', ods: 'sheet', csv: 'sheet', tsv: 'sheet', numbers: 'sheet',
  ppt: 'slides', pptx: 'slides', odp: 'slides', key: 'slides',
  zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive', bz2: 'archive', xz: 'archive',
  js: 'code', mjs: 'code', ts: 'code', tsx: 'code', jsx: 'code', json: 'code', html: 'code', css: 'code',
  py: 'code', rs: 'code', go: 'code', java: 'code', rb: 'code', sh: 'code', swift: 'code', kt: 'code',
  c: 'code', h: 'code', cpp: 'code', yml: 'code', yaml: 'code', toml: 'code', xml: 'code',
  txt: 'text', md: 'text', log: 'text',
};

/** Mime types worth a glyph when the name is missing or extensionless. */
const GLYPH_MIMES: Record<string, FileGlyph> = {
  'application/pdf': 'pdf',
  'application/zip': 'archive',
  'application/gzip': 'archive',
  'application/x-tar': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/json': 'code',
  'application/xml': 'code',
  'text/csv': 'sheet',
  'text/html': 'code',
};

/**
 * Picks the glyph for an attachment.
 *
 * The media kinds come straight from `attachmentKind`, so a file card and a
 * bubble can never disagree about whether something is a video — the routing
 * decision is made once, in `chat.ts`, and read here. Only the document
 * families, which routing does not care about, are resolved locally.
 */
export function fileGlyph(mimeType?: string, fileName?: string): FileGlyph {
  const kind = attachmentKind(mimeType, fileName);
  if (kind !== 'file') return kind;

  const extension = fileExtension(fileName ?? '');
  const byExtension = GLYPH_EXTENSIONS[extension];
  if (byExtension) return byExtension;

  const mime = (mimeType ?? '').split(';')[0]?.trim().toLowerCase() ?? '';
  const byMime = GLYPH_MIMES[mime];
  if (byMime) return byMime;
  if (mime.startsWith('text/')) return 'text';
  return 'file';
}

// ---- accessible names ------------------------------------------------------

/**
 * The name an attachment announces.
 *
 * In a transcript an attachment IS the message, so it can never announce
 * nothing: an empty alt would make the whole message invisible to a screen
 * reader, and the reader would hear a stranger's photo as silence between two
 * other people's sentences. The ladder is therefore:
 *
 * 1. What the sender said it is (`description` — an alt text, a caption).
 * 2. What it is called (`fileName`), which is usually enough to decide whether
 *    to open it.
 * 3. A localized fallback naming the kind ("Photo", "Voice message"), which
 *    says at least that something is there.
 *
 * The one legitimate empty alt is an image nested inside a control that already
 * carries this name — a lightbox button, a link preview card — where repeating
 * it would announce the same thing twice. That is the caller's decision, and it
 * is made by not calling this.
 */
export function attachmentLabel(
  attachment: Pick<ChatAttachment, 'fileName'>,
  fallback: string,
  description?: string,
): string {
  const spoken = (description ?? '').trim();
  if (spoken !== '') return spoken;
  const name = (attachment.fileName ?? '').trim();
  if (name !== '') return name;
  return fallback;
}

// ---- transfer progress -----------------------------------------------------

/**
 * A transfer fraction as a whole percentage, clamped to 0–100.
 *
 * Fractions in, percentages out: the caller has bytes-sent over bytes-total,
 * and every progress primitive in both kits wants a percentage, so the
 * conversion belongs in one place rather than at each call site (where `* 100`
 * with no clamp lets a re-sent chunk paint a 103% bar).
 */
export function progressPercent(fraction: number): number {
  if (!Number.isFinite(fraction)) return 0;
  return Math.min(100, Math.max(0, Math.round(fraction * 100)));
}

// ---- link previews ---------------------------------------------------------

/**
 * The ratio a link preview reserves for its image: Open Graph's recommended
 * 1200×630. Sites target it, so honouring it means the crop the publisher
 * composed is the crop the reader sees.
 */
export const LINK_PREVIEW_IMAGE_ASPECT = 1200 / 630;

/**
 * The domain a preview card credits, e.g. `example.com` from
 * `https://www.example.com/a/b?c=d`.
 *
 * Parsed with a regex rather than `new URL()` on purpose: this module has to
 * run under Hermes, where the URL implementation has historically been a
 * partial polyfill, and a crash inside a chat transcript over a malformed link
 * is not a trade worth making. Unparseable input comes back trimmed rather than
 * empty — showing the reader the raw string is more honest than showing nothing.
 *
 * `www.` is dropped because it is noise on every domain that has it, and the
 * host is lowercased because domains are case-insensitive and `Example.com`
 * next to `example.com` reads as two different sites.
 */
export function linkPreviewDomain(url: string): string {
  const trimmed = url.trim();
  const match = /^(?:[a-z][a-z0-9+.-]*:)?\/\/([^/?#]+)/i.exec(trimmed);
  const authority = match?.[1] ?? trimmed.split(/[/?#]/)[0] ?? '';
  // Strip credentials and the port; neither identifies the publisher.
  const host = authority.split('@').pop()?.split(':')[0] ?? '';
  const clean = host.toLowerCase().replace(/^www\./, '');
  return clean === '' ? trimmed : clean;
}
