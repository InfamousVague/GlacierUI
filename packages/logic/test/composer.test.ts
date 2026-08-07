import { describe, expect, it } from 'vitest';
import {
  composerCanSend,
  composerKeyAction,
  composerSubmission,
  composerSubmitModeFor,
  composerSubmitModes,
  draftCount,
  draftCountModes,
  draftMeter,
  draftMeterStates,
  replyPreview,
  stageAttachments,
  unstageAttachment,
  REPLY_PREVIEW_LIMIT,
} from '../src/composer.ts';
import { formatReadReceipt, readReceipt } from '../src/chat.ts';
import {
  composerSubmitModes as specSubmitModes,
  draftCountModes as specCountModes,
  draftMeterStates as specMeterStates,
} from '../../spec/src/components/message-bar.ts';

const key = (over: Partial<Parameters<typeof composerKeyAction>[0]> = {}) => ({ key: 'Enter', ...over });

describe('the submit policy', () => {
  it('sends on a bare Enter and opens a line on Shift', () => {
    expect(composerKeyAction(key())).toBe('submit');
    expect(composerKeyAction(key({ shiftKey: true }))).toBe('newline');
  });

  it('inverts under the modifier mode, which is what a long-form box wants', () => {
    expect(composerKeyAction(key(), 'modifier')).toBe('newline');
    expect(composerKeyAction(key({ metaKey: true }), 'modifier')).toBe('submit');
    expect(composerKeyAction(key({ ctrlKey: true }), 'modifier')).toBe('submit');
  });

  it('never sends while an input method is composing, whatever else is held', () => {
    // The one case that decides whether a Japanese user can use the composer at
    // all: every Enter mid-composition commits a candidate, and reading one as a
    // send fires a message on the way to the first kanji of the sentence.
    for (const mode of composerSubmitModes)
      for (const over of [{}, { shiftKey: true }, { metaKey: true }, { ctrlKey: true }])
        expect(composerKeyAction(key({ ...over, isComposing: true }), mode)).toBe('ignore');
  });

  it('treats Alt plus Enter as a newline in both modes', () => {
    // The one chord that means the same thing whichever mode the bar is in, so
    // a user who learned it never has to know which mode they are looking at.
    for (const mode of composerSubmitModes)
      expect(composerKeyAction(key({ altKey: true }), mode)).toBe('newline');
  });

  it('reports Escape as a cancel and leaves every other key alone', () => {
    expect(composerKeyAction({ key: 'Escape' })).toBe('cancel');
    expect(composerKeyAction({ key: 'a' })).toBe('ignore');
    expect(composerKeyAction({ key: 'Tab' })).toBe('ignore');
  });

  it('offers the pointer answer as an opt-in rather than taking it as a default', () => {
    expect(composerSubmitModeFor('fine')).toBe('enter');
    expect(composerSubmitModeFor('coarse')).toBe('modifier');
  });
});

describe('counting a draft', () => {
  // A flag is one grapheme, two code points, and four UTF-16 units. Nothing
  // else in the suite disagrees with itself this sharply on ordinary input.
  const flag = '🇯🇵';

  it('counts what a person would call a character by default', () => {
    expect(draftCount(flag)).toBe(1);
    expect(draftCount(flag, 'codePoints')).toBe(2);
    expect(draftCount(flag, 'utf16')).toBe(4);
  });

  it('counts plain text the same way in every mode', () => {
    for (const mode of draftCountModes) expect(draftCount('hello', mode)).toBe(5);
  });
});

describe('the budget', () => {
  it('says nothing at all until the last tenth', () => {
    expect(draftMeter(10, 100).state).toBe('idle');
    expect(draftMeter(89, 100).state).toBe('idle');
    expect(draftMeter(90, 100).state).toBe('near');
    expect(draftMeter(100, 100).state).toBe('near');
    expect(draftMeter(101, 100).state).toBe('over');
  });

  it('is idle forever with no limit, and reports no remainder to render', () => {
    const meter = draftMeter(4000);
    expect(meter.state).toBe('idle');
    expect(meter.max).toBeUndefined();
    expect(meter.remaining).toBeUndefined();
  });

  it('reports how far over, so a caller can say it rather than just refusing', () => {
    expect(draftMeter(105, 100).remaining).toBe(-5);
  });

  it('treats a nonsense limit as no limit rather than as an instant failure', () => {
    for (const max of [0, -10, Number.NaN, Number.POSITIVE_INFINITY])
      expect(draftMeter(5, max).state).toBe('idle');
  });
});

describe('sendability', () => {
  it('refuses whitespace, so a draft of three spaces cannot send', () => {
    expect(composerCanSend({ text: '   ' })).toBe(false);
    expect(composerCanSend({ text: ' hi ' })).toBe(true);
  });

  it('lets a photo with no caption go, because it knows what an attachment is', () => {
    expect(composerCanSend({ text: '', attachments: 1 })).toBe(true);
  });

  it('stands down while busy, disabled, or over the limit', () => {
    expect(composerCanSend({ text: 'hi', busy: true })).toBe(false);
    expect(composerCanSend({ text: 'hi', disabled: true })).toBe(false);
    expect(composerCanSend({ text: 'hi', over: true })).toBe(false);
  });
});

describe('the submission', () => {
  it('carries the reply and edit ids with the text, not beside it', () => {
    // The whole reason it is an object: reading the reply target out of app
    // state after the callback fires is the race that answers the wrong message.
    const sent = composerSubmission('  hello  ', { replyToId: 'm4', editingId: 'm9' });
    expect(sent).toEqual({ text: 'hello', attachments: [], replyToId: 'm4', editingId: 'm9' });
  });

  it('omits the ids entirely rather than carrying undefined ones', () => {
    expect(composerSubmission('hi')).toEqual({ text: 'hi', attachments: [] });
  });
});

describe('staged attachments', () => {
  const file = (id: string) => ({ id });

  it('de-duplicates by id, because a re-drop of the same image is ordinary', () => {
    expect(stageAttachments([file('a')], [file('a'), file('b')]).map((f) => f.id)).toEqual(['a', 'b']);
  });

  it('truncates at the cap rather than refusing the whole batch', () => {
    expect(stageAttachments([], [file('a'), file('b'), file('c')], 2).map((f) => f.id)).toEqual(['a', 'b']);
  });

  it('removes one by id and leaves the rest in order', () => {
    expect(unstageAttachment([file('a'), file('b'), file('c')], 'b').map((f) => f.id)).toEqual(['a', 'c']);
  });
});

describe('the reply preview', () => {
  it('collapses whitespace before cutting, so a quoted poem is one line', () => {
    const preview = replyPreview({ id: 'm1', text: 'one\n\ntwo   three' });
    expect(preview.text).toBe('one two three');
    expect(preview.truncated).toBe(false);
  });

  it('cuts at the shared limit and says that it did', () => {
    const preview = replyPreview({ id: 'm1', text: 'x'.repeat(REPLY_PREVIEW_LIMIT + 40) });
    expect(preview.text).toHaveLength(REPLY_PREVIEW_LIMIT);
    expect(preview.truncated).toBe(true);
  });

  it('routes media through the shared kind rather than a second guess', () => {
    // So a voice note quoted in the composer and the same one in the transcript
    // are called the same thing.
    const preview = replyPreview({
      id: 'm1',
      attachments: [{ id: 'a1', fileName: 'note.m4a' }],
    });
    expect(preview.kind).toBe('audio');
  });

  it('carries the id the send will quote', () => {
    expect(replyPreview({ id: 'm7', text: 'hi' }).id).toBe('m7');
  });
});

describe('read receipts', () => {
  const reader = (actorId: string, name?: string, at?: number) => ({ actorId, name, at });

  it('picks the shape the count asks for', () => {
    expect(readReceipt([reader('a', 'Ana')]).key).toBe('one');
    expect(readReceipt([reader('a', 'Ana'), reader('b', 'Bo')]).key).toBe('two');
    expect(readReceipt([reader('a', 'Ana'), reader('b', 'Bo'), reader('c', 'Cy')], 3).key).toBe('several');
  });

  it('gives one slot back to the summary on overflow', () => {
    // Showing `max` names PLUS "and N others" overflows the row that `max` was
    // measured for, which is the same trade `typingText` makes.
    const receipt = readReceipt([reader('a', 'Ana'), reader('b', 'Bo'), reader('c', 'Cy')], 2);
    expect(receipt).toMatchObject({ key: 'many', names: ['Ana'], others: 2, total: 3 });
  });

  it('counts a repeated actor once, because servers replay receipts', () => {
    expect(readReceipt([reader('a', 'Ana'), reader('a', 'Ana')]).total).toBe(1);
  });

  it('shortens the sentence rather than leaving a gap for an unloaded name', () => {
    const receipt = readReceipt([reader('a', 'Ana'), reader('b')], 2);
    expect(receipt.names).toEqual(['Ana']);
    expect(receipt.total).toBe(2);
  });

  it('falls back to a bare count when nobody is named', () => {
    expect(readReceipt([reader('a'), reader('b')])).toMatchObject({ key: 'many', names: [], others: 2 });
  });

  it('reports the latest read moment, which is what a receipt line prints', () => {
    expect(readReceipt([reader('a', 'Ana', 10), reader('b', 'Bo', 40)]).at).toBe(40);
  });

  it('renders nothing at all when nobody has read it', () => {
    const receipt = readReceipt([]);
    expect(receipt.key).toBe('none');
    expect(formatReadReceipt(receipt, TEMPLATES)).toBe('');
  });

  it('interpolates the same slots the typing templates use', () => {
    expect(formatReadReceipt(readReceipt([reader('a', 'Ana')]), TEMPLATES)).toBe('Read by Ana');
    expect(
      formatReadReceipt(readReceipt([reader('a', 'Ana'), reader('b', 'Bo'), reader('c', 'Cy')], 2), TEMPLATES),
    ).toBe('Read by Ana and 2 others');
  });

  it('takes the time already spelled, never a number to format itself', () => {
    expect(
      formatReadReceipt(readReceipt([reader('a', 'Ana', 10)]), { ...TEMPLATES, one: 'Read {time}' }, {
        time: '9:41 AM',
      }),
    ).toBe('Read 9:41 AM');
  });

  it('joins names with the caller-supplied joiner, since joining is locale work', () => {
    const receipt = readReceipt([reader('a', 'Ana'), reader('b', 'Bo'), reader('c', 'Cy')], 3);
    expect(formatReadReceipt(receipt, TEMPLATES, { join: (names) => names.join(' & ') })).toBe(
      'Read by Ana & Bo & Cy',
    );
  });
});

const TEMPLATES = {
  one: 'Read by {first}',
  two: 'Read by {first} and {last}',
  several: 'Read by {names}',
  many: 'Read by {first} and {count} others',
};

describe('the spec transcribes the vocabulary exactly', () => {
  // The spec cannot import this package - it is the package the spec's own
  // consumers depend on - so the lists are transcribed. These assertions are
  // what make the duplication checked rather than trusted.
  it('submit modes match', () => {
    expect([...specSubmitModes]).toEqual([...composerSubmitModes]);
  });

  it('count modes match', () => {
    expect([...specCountModes]).toEqual([...draftCountModes]);
  });

  it('meter states match', () => {
    expect([...specMeterStates]).toEqual([...draftMeterStates]);
  });
});
