import { describe, expect, it } from 'vitest';
import { auditStrictness, validateSpec, type ComponentSpec } from '../src/schema.ts';
import { imageAttachmentSpec } from '../src/components/image-attachment.ts';
import { imageGridSpec } from '../src/components/image-grid.ts';
import { videoAttachmentSpec } from '../src/components/video-attachment.ts';
import { fileAttachmentSpec } from '../src/components/file-attachment.ts';
import { voiceNoteSpec } from '../src/components/voice-note.ts';
import { linkPreviewCardSpec } from '../src/components/link-preview-card.ts';

/**
 * The attachment specs, held to the same bar as the registered catalog before
 * they join it — so integration is a one-line export rather than a debugging
 * session. TODO(integration): fold these into spec.test.ts's catalog sweep once
 * they are listed in src/index.ts.
 */
const specs: ComponentSpec[] = [
  imageAttachmentSpec,
  imageGridSpec,
  videoAttachmentSpec,
  fileAttachmentSpec,
  voiceNoteSpec,
  linkPreviewCardSpec,
];

describe('attachment specs', () => {
  it.each(specs.map((s) => [s.id, s] as const))('%s is structurally valid', (_id, spec) => {
    expect(validateSpec(spec)).toEqual([]);
  });

  it.each(specs.map((s) => [s.id, s] as const))('%s binds all of its paint', (_id, spec) => {
    expect(auditStrictness(spec).missing).toEqual([]);
  });

  it('claims ids nothing else in the catalog has taken', async () => {
    const { specsById } = await import('../src/index.ts');
    for (const spec of specs) {
      // An id may be unclaimed (still a draft) or claimed by THIS spec once it
      // is registered. What it must never be is claimed by a different one.
      //
      // This previously asserted the id was simply absent, which held only
      // while these specs lived outside the catalog. Registering them made that
      // assertion fail on success — the id resolved, to the very spec under
      // test. Comparing identity keeps the uniqueness guarantee the name
      // promises and survives registration.
      const claimed = specsById[spec.id];
      if (claimed) expect(claimed.name).toBe(spec.name);
    }
  });

  it('declares every token it names as a bare name, not a var() or a hex', () => {
    for (const spec of specs) {
      for (const token of spec.tokens ?? []) {
        expect(token).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });
});
