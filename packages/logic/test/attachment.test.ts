import { describe, expect, it } from 'vitest';
import {
  ATTACHMENT_ASPECT_MAX,
  ATTACHMENT_ASPECT_MIN,
  IMAGE_GRID_MAX_TILES,
  LINK_PREVIEW_IMAGE_ASPECT,
  attachmentAspect,
  attachmentLabel,
  fileGlyph,
  formatFileSize,
  imageGridLayout,
  linkPreviewDomain,
  middleTruncate,
  progressPercent,
  splitFileName,
} from '../src/attachment.ts';

describe('attachmentAspect', () => {
  it('keeps an ordinary photo at its own ratio', () => {
    const { ratio, clamped } = attachmentAspect(1600, 1200);
    expect(ratio).toBeCloseTo(4 / 3);
    expect(clamped).toBe(false);
  });

  it('clamps a phone screenshot so it cannot take over the transcript', () => {
    // 9:16 is 0.5625 — nearly two bubble-widths tall at full ratio
    const { ratio, clamped } = attachmentAspect(1080, 1920);
    expect(ratio).toBe(ATTACHMENT_ASPECT_MIN);
    expect(clamped).toBe(true);
  });

  it('clamps a panorama to a frame you can still see something in', () => {
    const { ratio, clamped } = attachmentAspect(3000, 500);
    expect(ratio).toBe(ATTACHMENT_ASPECT_MAX);
    expect(clamped).toBe(true);
  });

  it('falls back rather than throwing when the size is missing or nonsense', () => {
    for (const [w, h] of [[undefined, undefined], [0, 100], [100, 0], [Number.NaN, 100]] as const) {
      const { ratio, clamped } = attachmentAspect(w, h);
      expect(ratio).toBeCloseTo(4 / 3);
      // a guess is not a crop: nothing was clamped, because nothing was known
      expect(clamped).toBe(false);
    }
  });
});

describe('imageGridLayout', () => {
  it('has nothing to lay out for an empty album', () => {
    expect(imageGridLayout(0)).toMatchObject({ rows: [], shown: 0, overflow: 0 });
  });

  it('leaves a single image to its own ratio', () => {
    const layout = imageGridLayout(1);
    expect(layout.rows).toHaveLength(1);
    // no grid ratio: the tile keeps whatever attachmentAspect resolved
    expect(layout.aspectRatio).toBeUndefined();
  });

  it('puts two side by side in one row', () => {
    const layout = imageGridLayout(2);
    expect(layout.rows).toHaveLength(1);
    expect(layout.rows[0]?.tiles.map((t) => t.index)).toEqual([0, 1]);
    expect(layout.aspectRatio).toBe(2);
  });

  it('leads an odd album with a banner so the pairs below stay square', () => {
    const layout = imageGridLayout(3);
    expect(layout.rows.map((r) => r.tiles.length)).toEqual([1, 2]);
    expect(layout.aspectRatio).toBe(1);
  });

  it('tiles four as a square 2x2', () => {
    const layout = imageGridLayout(4);
    expect(layout.rows.map((r) => r.tiles.map((t) => t.index))).toEqual([[0, 1], [2, 3]]);
    expect(layout.aspectRatio).toBe(1);
  });

  it('collapses the rest onto the last tile past the cap', () => {
    const layout = imageGridLayout(9);
    expect(layout.shown).toBe(IMAGE_GRID_MAX_TILES);
    expect(layout.overflow).toBe(5);
    const tiles = layout.rows.flatMap((r) => r.tiles);
    expect(tiles.filter((t) => t.overflow > 0)).toHaveLength(1);
    expect(tiles[tiles.length - 1]?.overflow).toBe(5);
  });

  it('honours a raised cap and stays consistent about its ratio', () => {
    const layout = imageGridLayout(6, { max: 6 });
    expect(layout.shown).toBe(6);
    expect(layout.overflow).toBe(0);
    // 3 rows of pairs: two tile-widths across, three tile-heights down
    expect(layout.rows).toHaveLength(3);
    expect(layout.aspectRatio).toBeCloseTo(2 / 3);
  });

  it('indexes every tile exactly once, in send order', () => {
    for (const count of [2, 3, 4, 5, 7]) {
      const tiles = imageGridLayout(count).rows.flatMap((r) => r.tiles);
      expect(tiles.map((t) => t.index)).toEqual(tiles.map((_, i) => i));
    }
  });
});

describe('splitFileName', () => {
  it('leaves a short name whole', () => {
    expect(splitFileName('notes.txt')).toEqual({ head: 'notes.txt', tail: '' });
  });

  it('pins the end, because that is the half that identifies the file', () => {
    const { head, tail } = splitFileName('Q3-final-revised-budget-v7.pdf');
    expect(head + tail).toBe('Q3-final-revised-budget-v7.pdf');
    expect(tail.endsWith('.pdf')).toBe(true);
  });

  it('widens the tail so a long extension survives intact', () => {
    const { tail } = splitFileName('Q3-final-revised-budget-v7.numbers');
    expect(tail.endsWith('.numbers')).toBe(true);
  });

  it('never lets the tail outgrow the head', () => {
    const { head, tail } = splitFileName('a-file-name.averyverylongextension');
    expect(tail.length).toBeLessThanOrEqual(head.length);
  });

  it('splits on code points, so an emoji is not cut in half', () => {
    const name = '🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉-party.png';
    const { head, tail } = splitFileName(name);
    expect(head + tail).toBe(name);
    expect(head).not.toContain('�');
    expect([...head].every((c) => name.includes(c))).toBe(true);
  });
});

describe('middleTruncate', () => {
  it('returns a short name untouched', () => {
    expect(middleTruncate('a.txt', 20)).toBe('a.txt');
  });

  it('keeps the extension visible when it has to cut', () => {
    const out = middleTruncate('a-very-long-quarterly-report-name.pdf', 20);
    expect(out).toContain('…');
    expect(out.endsWith('.pdf')).toBe(true);
    expect([...out].length).toBeLessThanOrEqual(20);
  });

  it('refuses to do anything silly with a nonsense budget', () => {
    expect(middleTruncate('report.pdf', 0)).toBe('report.pdf');
    expect(middleTruncate('report.pdf', Number.NaN)).toBe('report.pdf');
  });
});

describe('formatFileSize', () => {
  it('counts in decimal units, the way a file listing does', () => {
    expect(formatFileSize(842, 'en')).toBe('842 byte');
    expect(formatFileSize(1200, 'en')).toBe('1.2 kB');
    expect(formatFileSize(12_400_000, 'en')).toBe('12 MB');
  });

  it('drops the decimal once the number is big enough not to need it', () => {
    expect(formatFileSize(1_200_000, 'en')).toBe('1.2 MB');
    expect(formatFileSize(45_600_000, 'en')).toBe('46 MB');
  });

  it('spells the number in the reader\'s language', () => {
    // a comma decimal separator, not a period
    expect(formatFileSize(1200, 'de')).toContain('1,2');
  });

  it('settles at zero rather than rendering NaN', () => {
    expect(formatFileSize(Number.NaN, 'en')).toBe('0 byte');
    expect(formatFileSize(-500, 'en')).toBe('0 byte');
  });
});

describe('fileGlyph', () => {
  it('routes media through attachmentKind rather than a second opinion', () => {
    expect(fileGlyph('image/png')).toBe('image');
    expect(fileGlyph('video/mp4')).toBe('video');
    expect(fileGlyph(undefined, 'note.m4a')).toBe('audio');
    // the vague mime falls through to the name, exactly as routing does
    expect(fileGlyph('application/octet-stream', 'clip.mov')).toBe('video');
  });

  it('recognises the document families by extension', () => {
    expect(fileGlyph(undefined, 'report.pdf')).toBe('pdf');
    expect(fileGlyph(undefined, 'budget.xlsx')).toBe('sheet');
    expect(fileGlyph(undefined, 'deck.key')).toBe('slides');
    expect(fileGlyph(undefined, 'backup.tar')).toBe('archive');
    expect(fileGlyph(undefined, 'main.rs')).toBe('code');
    expect(fileGlyph(undefined, 'README.md')).toBe('text');
  });

  it('falls back to the mime when the name has no extension', () => {
    expect(fileGlyph('application/pdf', 'download')).toBe('pdf');
    expect(fileGlyph('text/plain', 'download')).toBe('text');
  });

  it('is never wrong, only less specific', () => {
    expect(fileGlyph()).toBe('file');
    expect(fileGlyph('application/x-unknown', 'thing.qqq')).toBe('file');
  });
});

describe('attachmentLabel', () => {
  it('prefers what the sender said it is', () => {
    expect(attachmentLabel({ fileName: 'IMG_0042.jpg' }, 'Photo', 'Ana on the ferry')).toBe('Ana on the ferry');
  });

  it('falls back to the file name', () => {
    expect(attachmentLabel({ fileName: 'IMG_0042.jpg' }, 'Photo')).toBe('IMG_0042.jpg');
  });

  it('never announces nothing, because the attachment IS the message', () => {
    expect(attachmentLabel({}, 'Photo')).toBe('Photo');
    expect(attachmentLabel({ fileName: '   ' }, 'Photo', '  ')).toBe('Photo');
  });
});

describe('progressPercent', () => {
  it('turns a fraction into a whole percentage', () => {
    expect(progressPercent(0.435)).toBe(44);
    expect(progressPercent(0)).toBe(0);
    expect(progressPercent(1)).toBe(100);
  });

  it('clamps, so a re-sent chunk cannot paint past the end', () => {
    expect(progressPercent(1.4)).toBe(100);
    expect(progressPercent(-2)).toBe(0);
    expect(progressPercent(Number.NaN)).toBe(0);
  });
});

describe('linkPreviewDomain', () => {
  it('credits the publisher, not the path', () => {
    expect(linkPreviewDomain('https://www.example.com/a/b?c=d#e')).toBe('example.com');
  });

  it('drops credentials and the port, which name nobody', () => {
    expect(linkPreviewDomain('https://user:pw@Example.COM:8443/x')).toBe('example.com');
  });

  it('handles a bare host and a protocol-relative url', () => {
    expect(linkPreviewDomain('example.com/x')).toBe('example.com');
    expect(linkPreviewDomain('//cdn.example.com/x')).toBe('cdn.example.com');
  });

  it('shows the reader the raw string rather than nothing', () => {
    expect(linkPreviewDomain('  not a url  ')).toBe('not a url');
  });

  it('reserves the ratio publishers actually target', () => {
    expect(LINK_PREVIEW_IMAGE_ASPECT).toBeCloseTo(1200 / 630);
  });
});
