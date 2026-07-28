import { describe, expect, it } from 'vitest';
import {
  advanceAttachment,
  advanceVoiceState,
  applyMention,
  attachmentsInFlight,
  autoGrowMetrics,
  canAdvanceAttachment,
  canSendCompose,
  characterCounterState,
  composeKeyIntent,
  composeMetrics,
  composeSendState,
  countCharacters,
  mentionInsertion,
  mentionMatches,
  mentionQuery,
  resolveEnterPolicy,
  screenFiles,
  slideToCancel,
  voiceIsLive,
  voiceReleaseOutcome,
  type ComposeAttachment,
} from '../src/compose.ts';

const attachment = (over: Partial<ComposeAttachment> = {}): ComposeAttachment => ({
  id: 'a1',
  name: 'photo.png',
  size: 1024,
  status: 'pending',
  ...over,
});

describe('the Enter-key policy', () => {
  it('resolves auto from the pointer the device has', () => {
    expect(resolveEnterPolicy('auto', { touch: false })).toBe('send');
    expect(resolveEnterPolicy('auto', { touch: true })).toBe('newline');
    expect(resolveEnterPolicy(undefined, { touch: true })).toBe('newline');
  });

  it('never overrides an explicit policy with the device', () => {
    expect(resolveEnterPolicy('send', { touch: true })).toBe('send');
    expect(resolveEnterPolicy('newline', { touch: false })).toBe('newline');
  });

  it('sends on a bare Enter under the send policy and writes a newline under newline', () => {
    expect(composeKeyIntent({ key: 'Enter' }, 'send')).toBe('send');
    expect(composeKeyIntent({ key: 'Enter' }, 'newline')).toBe('newline');
  });

  it('keeps Shift+Enter a newline and Cmd/Ctrl+Enter a send under both policies', () => {
    for (const policy of ['send', 'newline'] as const) {
      expect(composeKeyIntent({ key: 'Enter', shiftKey: true }, policy)).toBe('newline');
      expect(composeKeyIntent({ key: 'Enter', metaKey: true }, policy)).toBe('send');
      expect(composeKeyIntent({ key: 'Enter', ctrlKey: true }, policy)).toBe('send');
    }
  });

  it('lets an open IME composition own Enter outright', () => {
    // The first Enter commits a Japanese candidate; sending on it would cut the
    // word in half.
    expect(composeKeyIntent({ key: 'Enter', isComposing: true }, 'send')).toBe('none');
    expect(composeKeyIntent({ key: 'Enter', isComposing: true, metaKey: true }, 'send')).toBe('none');
  });

  it('ignores every other key', () => {
    expect(composeKeyIntent({ key: 'a' }, 'send')).toBe('none');
    expect(composeKeyIntent({ key: 'Escape' }, 'send')).toBe('none');
  });
});

describe('auto-grow geometry', () => {
  it('starts at the minimum row count before anything is measured', () => {
    const { height, minHeight } = autoGrowMetrics({ lineHeight: 20, chrome: 16, minRows: 1 });
    expect(minHeight).toBe(36);
    expect(height).toBe(36);
  });

  it('grows with the content between the two caps', () => {
    const grown = autoGrowMetrics({ contentHeight: 76, lineHeight: 20, chrome: 16, minRows: 1, maxRows: 6 });
    expect(grown.height).toBe(76);
    expect(grown.scrolls).toBe(false);
  });

  it('stops at maxRows and scrolls from there', () => {
    const capped = autoGrowMetrics({ contentHeight: 400, lineHeight: 20, chrome: 16, minRows: 1, maxRows: 6 });
    expect(capped.maxHeight).toBe(136);
    expect(capped.height).toBe(136);
    expect(capped.scrolls).toBe(true);
  });

  it('never reports a scrollbar on a field that exactly fills its cap', () => {
    expect(autoGrowMetrics({ contentHeight: 136, lineHeight: 20, chrome: 16, maxRows: 6 }).scrolls).toBe(false);
  });

  it('refuses a max below the min rather than inverting the range', () => {
    const { minHeight, maxHeight } = autoGrowMetrics({ lineHeight: 20, minRows: 3, maxRows: 1 });
    expect(minHeight).toBe(60);
    expect(maxHeight).toBe(60);
  });
});

describe('attachment transitions', () => {
  it('walks a file from queued to landed', () => {
    let a = attachment();
    a = advanceAttachment(a, 'start');
    expect(a.status).toBe('uploading');
    expect(a.progress).toBe(0);
    a = advanceAttachment(a, 'progress', { progress: 0.4 });
    expect(a.progress).toBeCloseTo(0.4);
    a = advanceAttachment(a, 'succeed');
    expect(a.status).toBe('complete');
    // a finished upload reads full, whatever the last frame said
    expect(a.progress).toBe(1);
  });

  it('returns the same object when a move is illegal, so a reducer can bail', () => {
    const canceled = attachment({ status: 'canceled' });
    expect(advanceAttachment(canceled, 'progress', { progress: 0.9 })).toBe(canceled);
    expect(canAdvanceAttachment('canceled', 'progress')).toBe(false);
  });

  it('clears the bar and the error when a failed upload is retried', () => {
    const failed = attachment({ status: 'failed', progress: 0.7, error: 'Network error' });
    const retried = advanceAttachment(failed, 'retry');
    expect(retried.status).toBe('uploading');
    expect(retried.progress).toBe(0);
    expect(retried.error).toBeUndefined();
  });

  it('keeps a failure reason on the attachment that failed', () => {
    const failed = advanceAttachment(attachment({ status: 'uploading' }), 'fail', { error: 'Too large' });
    expect(failed).toMatchObject({ status: 'failed', error: 'Too large' });
  });

  it('clamps progress into 0..1', () => {
    const over = advanceAttachment(attachment({ status: 'uploading' }), 'progress', { progress: 4 });
    expect(over.progress).toBe(1);
  });

  it('lets a landed file still be dismissed', () => {
    expect(advanceAttachment(attachment({ status: 'complete' }), 'cancel').status).toBe('canceled');
  });
});

describe('file screening', () => {
  const png = { name: 'a.png', type: 'image/png', size: 10 };
  const pdf = { name: 'b.pdf', type: 'application/pdf', size: 10 };

  it('refuses on type, size, then count — FileUpload\'s order and words', () => {
    const { accepted, rejections } = screenFiles([png, pdf, { name: 'c.png', type: 'image/png', size: 999 }], {
      accept: 'image/*',
      maxSize: 100,
    });
    expect(accepted).toEqual([png]);
    expect(rejections).toEqual([
      { file: pdf, reason: 'type' },
      { file: { name: 'c.png', type: 'image/png', size: 999 }, reason: 'size' },
    ]);
  });

  it('counts against what is already attached', () => {
    const { accepted, rejections } = screenFiles([png, png], { maxFiles: 2, current: 1 });
    expect(accepted).toHaveLength(1);
    expect(rejections[0]?.reason).toBe('count');
  });

  it('accepts by extension when the platform gave no mime type', () => {
    expect(screenFiles([{ name: 'note.md' }], { accept: '.md' }).accepted).toHaveLength(1);
  });
});

describe('the send rule', () => {
  it('refuses an empty message, and whitespace is empty', () => {
    expect(canSendCompose({ text: '' })).toEqual({ allowed: false, reason: 'empty' });
    expect(canSendCompose({ text: '   \n ' })).toEqual({ allowed: false, reason: 'empty' });
  });

  it('allows a message that is only attachments', () => {
    expect(canSendCompose({ text: '', attachments: [attachment({ status: 'complete' })] }).allowed).toBe(true);
  });

  it('waits for an upload rather than racing it', () => {
    const uploading = [attachment({ status: 'uploading', progress: 0.3 })];
    expect(canSendCompose({ text: 'here', attachments: uploading })).toEqual({
      allowed: false,
      reason: 'uploading',
    });
    expect(attachmentsInFlight(uploading)).toHaveLength(1);
  });

  it('reports the limit before the upload, because only one of them is the user\'s to fix', () => {
    expect(
      canSendCompose({ text: 'abcdef', limit: 3, attachments: [attachment({ status: 'uploading' })] }).reason,
    ).toBe('over-limit');
  });

  it('ignores a canceled attachment entirely', () => {
    expect(canSendCompose({ text: '', attachments: [attachment({ status: 'canceled' })] }).reason).toBe('empty');
  });

  it('refuses a second send while one is in flight, but never refuses a retry', () => {
    expect(canSendCompose({ text: 'hi', sending: true }).reason).toBe('sending');
    expect(canSendCompose({ text: 'hi', failed: true }).allowed).toBe(true);
  });

  it('maps the rule onto the control\'s four states', () => {
    expect(composeSendState({ text: '' })).toBe('empty');
    expect(composeSendState({ text: 'hi' })).toBe('ready');
    expect(composeSendState({ text: 'hi', sending: true })).toBe('sending');
    expect(composeSendState({ text: 'hi', failed: true })).toBe('failed');
    // a blocked-because-uploading composer looks the same as an empty one
    expect(composeSendState({ text: 'hi', attachments: [attachment({ status: 'uploading' })] })).toBe('empty');
  });
});

describe('the character counter', () => {
  it('stays away until the message nears the limit', () => {
    expect(characterCounterState(10, 100)).toMatchObject({ level: 'far', visible: false });
    expect(characterCounterState(80, 100)).toMatchObject({ level: 'near', visible: true });
    expect(characterCounterState(95, 100).level).toBe('close');
  });

  it('counts down and goes negative past the limit', () => {
    expect(characterCounterState(103, 100)).toMatchObject({ level: 'over', remaining: -3, visible: true });
  });

  it('can be pinned on for a hard external cap', () => {
    expect(characterCounterState(1, 100, { showAlways: true }).visible).toBe(true);
  });

  it('does nothing without a limit', () => {
    expect(characterCounterState(50, 0).visible).toBe(false);
  });

  it('charges one character for an emoji, not two', () => {
    expect(countCharacters('😀')).toBe(1);
    expect(canSendCompose({ text: '😀😀', limit: 2 }).allowed).toBe(true);
  });
});

describe('the mention token at the caret', () => {
  it('finds an @-token being typed', () => {
    expect(mentionQuery('hey @ad', 7)).toEqual({ trigger: '@', query: 'ad', start: 4, end: 7 });
  });

  it('opens on a bare trigger, so the popup lists everyone before a letter is typed', () => {
    expect(mentionQuery('@', 1)?.query).toBe('');
  });

  it('is not fooled by an email address', () => {
    expect(mentionQuery('write ada@host', 14)).toBeNull();
  });

  it('closes once the token is finished', () => {
    expect(mentionQuery('hey @ada and', 12)).toBeNull();
  });

  it('only opens a slash command at the very start of the message', () => {
    expect(mentionQuery('/gi', 3)?.trigger).toBe('/');
    expect(mentionQuery('and/or', 6)).toBeNull();
  });

  it('reads the token at the caret, not at the end of the text', () => {
    expect(mentionQuery('@ada hello', 4)).toEqual({ trigger: '@', query: 'ada', start: 0, end: 4 });
  });

  it('replaces the token and leaves the caret past a trailing space', () => {
    const next = applyMention('hey @ad', { trigger: '@', query: 'ad', start: 4, end: 7 }, 'ada');
    expect(next.text).toBe('hey @ada ');
    expect(next.caret).toBe(9);
  });

  it('keeps the text after the caret when completing mid-message', () => {
    expect(applyMention('@ad!', { trigger: '@', query: 'ad', start: 0, end: 3 }, 'ada').text).toBe('@ada !');
  });

  it('does not double the trigger when the handle already carries one', () => {
    expect(mentionInsertion({ id: '1', label: 'Ada', handle: '@ada' })).toBe('ada');
    expect(mentionInsertion({ id: '1', label: 'Ada' })).toBe('Ada');
  });
});

describe('mention matching', () => {
  const people = [
    { id: 'bryan', label: 'Bryan Cantrill', handle: '@bcantrill' },
    { id: 'ana', label: 'Ana Lovelace', handle: '@ana' },
    { id: 'grace', label: 'Grace Hopper', handle: '@grace', keywords: 'amazing admiral' },
  ];

  it('lists everyone on an empty query', () => {
    expect(mentionMatches(people, '')).toHaveLength(3);
  });

  it('lifts a name that starts with the query above one that merely contains it', () => {
    // "Ana" begins with it; "Bryan Cantrill" only contains it.
    expect(mentionMatches(people, 'an').map((m) => m.item.id)).toEqual(['ana', 'bryan']);
  });

  it('re-stamps the flat indices so the palette cursor helpers still address rows', () => {
    expect(mentionMatches(people, 'an').map((m) => m.index)).toEqual([0, 1]);
  });

  it('hands back the caller\'s own candidate, not the projected copy it searched', () => {
    expect(mentionMatches(people, 'bcant')[0]?.item).toBe(people[0]);
  });

  it('matches a handle the label does not contain', () => {
    expect(mentionMatches(people, 'bcant').map((m) => m.item.id)).toEqual(['bryan']);
  });

  it('keeps the caller\'s order among equally good hits', () => {
    expect(mentionMatches(people, 'a').map((m) => m.item.id)).toEqual(['ana', 'grace', 'bryan']);
  });
});

describe('the voice recorder', () => {
  it('measures cancel travel toward the inline start, and mirrors under RTL', () => {
    expect(slideToCancel({ delta: -48, threshold: 96 })).toEqual({ progress: 0.5, canceling: false });
    expect(slideToCancel({ delta: -96, threshold: 96 }).canceling).toBe(true);
    // in Arabic the bar is mirrored, so cancel travels the other way
    expect(slideToCancel({ delta: 96, threshold: 96, direction: 'rtl' }).canceling).toBe(true);
    expect(slideToCancel({ delta: -96, threshold: 96, direction: 'rtl' }).progress).toBe(0);
  });

  it('never overshoots its own threshold', () => {
    expect(slideToCancel({ delta: -400, threshold: 96 }).progress).toBe(1);
  });

  it('holds, crosses into the cancel zone, and can come back', () => {
    let state = advanceVoiceState('armed', 'hold');
    expect(state).toBe('recording');
    state = advanceVoiceState(state, 'enter-cancel');
    expect(state).toBe('canceling');
    expect(voiceReleaseOutcome(state)).toBe('cancel');
    state = advanceVoiceState(state, 'leave-cancel');
    expect(voiceReleaseOutcome(state)).toBe('send');
  });

  it('gives a locked recording no release to misread', () => {
    const locked = advanceVoiceState('recording', 'lock');
    expect(locked).toBe('locked');
    expect(advanceVoiceState(locked, 'release')).toBe('locked');
    expect(voiceReleaseOutcome(locked)).toBe('none');
    expect(advanceVoiceState(locked, 'stop')).toBe('armed');
  });

  it('knows when the strip has taken the bar', () => {
    expect(voiceIsLive('armed')).toBe(false);
    expect(['recording', 'canceling', 'locked'].every(voiceIsLive)).toBe(true);
  });
});

describe('density', () => {
  it('steps the gap, padding, and control size together', () => {
    expect(composeMetrics('compact')).toMatchObject({ gap: 'space-1', controlSize: 'sm' });
    expect(composeMetrics()).toMatchObject({ gap: 'space-2', controlSize: 'md' });
    expect(composeMetrics('spacious')).toMatchObject({ gap: 'space-3', controlSize: 'lg' });
  });
});
