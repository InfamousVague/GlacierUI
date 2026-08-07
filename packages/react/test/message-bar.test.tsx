import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { replyPreview, type ChatAttachment } from '@glacier/logic';
import { MessageBar } from '../src/molecules/MessageBar/MessageBar.tsx';
import { TypingIndicator } from '../src/molecules/MessageBar/TypingIndicator.tsx';

const field = () => screen.getByRole('textbox');
const sendButton = () => screen.getByRole('button', { name: 'Send' });

/** Types into the field the way a user does, through the change handler. */
const type = (value: string) => fireEvent.change(field(), { target: { value } });

describe('the submit policy', () => {
  it('sends the trimmed draft on Enter and clears the field', () => {
    const onSend = vi.fn();
    render(<MessageBar onSend={onSend} />);
    type('  hello  ');
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith({ text: 'hello', attachments: [] });
    expect(field()).toHaveValue('');
  });

  it('opens a line on Shift plus Enter instead of sending', () => {
    const onSend = vi.fn();
    render(<MessageBar onSend={onSend} />);
    type('hello');
    fireEvent.keyDown(field(), { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
    expect(field()).toHaveValue('hello');
  });

  it('never sends while an input method is composing', () => {
    // The single case that decides whether the composer is usable in Japanese:
    // an Enter mid-composition commits a candidate, and reading it as a send
    // fires a message on the way to the first character of the sentence.
    const onSend = vi.fn();
    render(<MessageBar onSend={onSend} />);
    type('にほ');
    fireEvent.keyDown(field(), { key: 'Enter', isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('honours the legacy Android composition keyCode as well as isComposing', () => {
    // Some WebView builds report only the deprecated 229; folding both at the
    // DOM edge is what keeps the pure policy free of the workaround.
    const onSend = vi.fn();
    render(<MessageBar onSend={onSend} />);
    type('にほ');
    fireEvent.keyDown(field(), { key: 'Enter', keyCode: 229 });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('inverts the chord in modifier mode', () => {
    const onSend = vi.fn();
    render(<MessageBar onSend={onSend} submitMode="modifier" />);
    type('hello');
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(field(), { key: 'Enter', metaKey: true });
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('publishes the resolved mode rather than deriving it from the environment', () => {
    // A default that read the pointer type could not be tested, screenshotted,
    // or agreed upon between a docs example and the user's own screen.
    const { container } = render(<MessageBar />);
    expect(container.firstElementChild).toHaveAttribute('data-submit-mode', 'enter');
  });

  it('leaves a key the caller already claimed entirely alone', () => {
    // The seam a mentions or slash-command overlay needs: it swallows Enter to
    // accept a highlighted candidate, and this component never learns about it.
    const onSend = vi.fn();
    render(
      <MessageBar onSend={onSend} inputProps={{ onKeyDown: (event) => event.preventDefault() }} />,
    );
    type('hello');
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
  });
});

describe('sendability', () => {
  it('refuses an empty draft from both the key and the control', () => {
    const onSend = vi.fn();
    render(<MessageBar onSend={onSend} />);
    expect(sendButton()).toBeDisabled();
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('refuses a draft of whitespace, which is the case the two paths disagree on', () => {
    const onSend = vi.fn();
    render(<MessageBar onSend={onSend} />);
    type('   ');
    expect(sendButton()).toBeDisabled();
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('lets an attachment with no caption go out', () => {
    const onSend = vi.fn();
    const photo: ChatAttachment = { id: 'p1', fileName: 'photo.png', mimeType: 'image/png' };
    render(<MessageBar onSend={onSend} attachments={[photo]} onAttachmentsChange={() => {}} />);
    expect(sendButton()).toBeEnabled();
    fireEvent.click(sendButton());
    expect(onSend).toHaveBeenCalledWith({ text: '', attachments: [photo] });
  });

  it('stands down while busy and while disabled', () => {
    const { rerender } = render(<MessageBar defaultValue="hi" busy />);
    expect(sendButton()).toBeDisabled();
    rerender(<MessageBar defaultValue="hi" disabled />);
    expect(sendButton()).toBeDisabled();
    expect(field()).toBeDisabled();
  });
});

describe('the character budget', () => {
  it('never sets a maxlength, so a paste is not silently truncated', () => {
    // The attribute blocks keystrokes, cuts a paste without saying so, and
    // interrupts an input method mid-word. Counting instead is the whole point.
    render(<MessageBar maxLength={10} />);
    expect(field()).not.toHaveAttribute('maxlength');
  });

  it('says nothing until the last tenth of the budget', () => {
    const { container } = render(<MessageBar maxLength={100} />);
    type('x'.repeat(50));
    expect(container.firstElementChild).toHaveAttribute('data-meter', 'idle');
    expect(screen.queryByText('50 of 100')).toBeNull();
    type('x'.repeat(95));
    expect(container.firstElementChild).toHaveAttribute('data-meter', 'near');
    expect(screen.getByText('95 of 100')).toBeInTheDocument();
  });

  it('refuses to send over the limit but keeps the text', () => {
    const onSend = vi.fn();
    render(<MessageBar onSend={onSend} maxLength={5} />);
    type('far too long');
    expect(sendButton()).toBeDisabled();
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
    expect(field()).toHaveValue('far too long');
  });

  it('counts what a person calls a character, not what UTF-16 does', () => {
    // A flag is one grapheme and four UTF-16 units, so the same text sends
    // under one rule and refuses under the other. The mode has to be the
    // caller's, because only they know which rule the server enforces.
    const { unmount } = render(<MessageBar maxLength={1} />);
    type('🇯🇵');
    expect(screen.getByText('1 of 1')).toBeInTheDocument();
    expect(sendButton()).toBeEnabled();
    unmount();

    render(<MessageBar maxLength={1} countAs="utf16" />);
    type('🇯🇵');
    expect(screen.getByText('4 of 1')).toBeInTheDocument();
    expect(sendButton()).toBeDisabled();
  });
});

describe('reply and edit modes', () => {
  const preview = replyPreview({ id: 'm4', text: 'the build is green' }, { authorName: 'Grace' });

  it('resolves the quoted strip rather than taking markup for it', () => {
    render(<MessageBar replyTo={preview} onCancelReply={() => {}} />);
    expect(screen.getByText('Replying to Grace')).toBeInTheDocument();
    expect(screen.getByText(/the build is green/)).toBeInTheDocument();
  });

  it('carries the reply target with the send, not beside it', () => {
    const onSend = vi.fn();
    render(<MessageBar onSend={onSend} replyTo={preview} onCancelReply={() => {}} />);
    type('agreed');
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith({ text: 'agreed', attachments: [], replyToId: 'm4' });
  });

  it('carries the edit target the same way', () => {
    const onSend = vi.fn();
    render(<MessageBar onSend={onSend} editingId="m9" onCancelEdit={() => {}} />);
    type('fixed');
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith({ text: 'fixed', attachments: [], editingId: 'm9' });
  });

  it('gives Escape its meaning from the handler, and never clears the draft', () => {
    // The browser's own undo does not reach a controlled value, so a composer
    // that emptied itself here would destroy text with no way back.
    const onCancelReply = vi.fn();
    render(<MessageBar replyTo={preview} onCancelReply={onCancelReply} defaultValue="half a thought" />);
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(onCancelReply).toHaveBeenCalledTimes(1);
    expect(field()).toHaveValue('half a thought');
  });

  it('does nothing on Escape when no cancel handler was wired', () => {
    render(<MessageBar defaultValue="half a thought" />);
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(field()).toHaveValue('half a thought');
  });

  it('unwinds edit mode before reply mode, the more specific of the two', () => {
    const onCancelEdit = vi.fn();
    const onCancelReply = vi.fn();
    render(
      <MessageBar
        editingId="m9"
        onCancelEdit={onCancelEdit}
        replyTo={preview}
        onCancelReply={onCancelReply}
      />,
    );
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(onCancelEdit).toHaveBeenCalledTimes(1);
    expect(onCancelReply).not.toHaveBeenCalled();
  });
});

describe('staged attachments', () => {
  const photo: ChatAttachment = { id: 'p1', fileName: 'photo.png', mimeType: 'image/png' };
  const note: ChatAttachment = { id: 'a1', fileName: 'note.m4a' };

  it('names each remove control by its file, not "Remove" five times over', () => {
    render(<MessageBar attachments={[photo, note]} onAttachmentsChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Remove photo.png' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove note.m4a' })).toBeInTheDocument();
  });

  it('unstages through the controlled list rather than owning its own copy', () => {
    const onAttachmentsChange = vi.fn();
    render(<MessageBar attachments={[photo, note]} onAttachmentsChange={onAttachmentsChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove photo.png' }));
    expect(onAttachmentsChange).toHaveBeenCalledWith([note]);
  });

  it('routes each chip through the shared attachment kind', () => {
    // So a staged voice note and a sent one are called the same thing on both
    // sides of the send.
    const { container } = render(
      <MessageBar
        attachments={[photo, note]}
        onAttachmentsChange={() => {}}
        renderAttachment={({ attachment, kind }) => <span data-kind={kind}>{attachment.id}</span>}
      />,
    );
    expect([...container.querySelectorAll('[data-kind]')].map((el) => el.getAttribute('data-kind'))).toEqual([
      'image',
      'audio',
    ]);
  });
});

describe('the send slot', () => {
  it('hands a replacement the live state, so it stays as correct as the default', () => {
    const onSend = vi.fn();
    render(
      <MessageBar
        onSend={onSend}
        defaultValue="hi"
        renderSend={(state) => (
          <button type="button" disabled={!state.canSend} onClick={state.send}>
            Post
          </button>
        )}
      />,
    );
    const post = screen.getByRole('button', { name: 'Post' });
    expect(post).toBeEnabled();
    fireEvent.click(post);
    expect(onSend).toHaveBeenCalledWith({ text: 'hi', attachments: [] });
  });

  it('gives a replacement the same refusal the default gets', () => {
    render(
      <MessageBar renderSend={(state) => <button type="button" disabled={!state.canSend}>Post</button>} />,
    );
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
  });
});

describe('the field', () => {
  it('keeps the twin in step with the draft, which is what makes it grow', () => {
    const { container } = render(<MessageBar defaultValue="one" />);
    const grower = container.querySelector('[data-replicated-value]') as HTMLElement;
    expect(grower).toHaveAttribute('data-replicated-value', 'one');
    type('one\ntwo');
    expect(grower).toHaveAttribute('data-replicated-value', 'one\ntwo');
  });

  it('reports every edit to a controlling parent', () => {
    const onValueChange = vi.fn();
    render(<MessageBar value="" onValueChange={onValueChange} />);
    type('h');
    expect(onValueChange).toHaveBeenCalledWith('h');
  });

  it('hosts a div rather than a form unless asked', () => {
    // A nested form is invalid the moment the bar is dropped inside a page
    // form, and implicit submission never applied to a textarea anyway.
    const { container, rerender } = render(<MessageBar />);
    expect(container.querySelector('form')).toBeNull();
    rerender(<MessageBar asForm />);
    expect(container.querySelector('form')).not.toBeNull();
  });

  it('sends on a real form submit when hosted in one', () => {
    const onSend = vi.fn();
    const { container } = render(<MessageBar asForm onSend={onSend} defaultValue="hi" />);
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    expect(onSend).toHaveBeenCalledTimes(1);
  });
});

describe('what it says out loud', () => {
  it('describes the submit policy whether or not the hint is drawn', () => {
    // Enter here is irreversible and invisible, and the reader least likely to
    // have discovered it by accident is the one who never sees a hint.
    render(<MessageBar />);
    const describedBy = field().getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)?.textContent).toBe(
      'Press Enter to send, Shift plus Enter for a new line',
    );
  });

  it('changes the spoken policy with the mode', () => {
    render(<MessageBar submitMode="modifier" />);
    const describedBy = field().getAttribute('aria-describedby') as string;
    expect(document.getElementById(describedBy)?.textContent).toMatch(/plus Enter to send/);
  });

  it('announces only when the budget changes footing, never per keystroke', () => {
    render(<MessageBar maxLength={100} />);
    const live = screen.getByRole('status');
    expect(live).toHaveTextContent('');
    type('x'.repeat(50));
    expect(live).toHaveTextContent('');
    type('x'.repeat(95));
    expect(live).toHaveTextContent('5 characters left');
    type('x'.repeat(96));
    // Still `near`: the state did not change, so neither did the announcement.
    expect(live).toHaveTextContent('5 characters left');
    type('x'.repeat(103));
    expect(live).toHaveTextContent('3 characters over the limit');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <MessageBar
        defaultValue="hello"
        maxLength={100}
        keyboardHint
        typing={['Ada']}
        attachments={[{ id: 'p1', fileName: 'photo.png', mimeType: 'image/png' }]}
        onAttachmentsChange={() => {}}
        replyTo={replyPreview({ id: 'm4', text: 'earlier' }, { authorName: 'Grace' })}
        onCancelReply={() => {}}
      />,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});

describe('TypingIndicator', () => {
  it('renders nothing at all when nobody is typing', () => {
    // A row that reserved its height would make the composer jump a line every
    // time somebody paused.
    const { container } = render(<TypingIndicator names={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('picks the sentence the count asks for rather than joining one', () => {
    const { rerender } = render(<TypingIndicator names={['Ada']} />);
    expect(screen.getByText('Ada is typing')).toBeInTheDocument();
    rerender(<TypingIndicator names={['Ada', 'Grace']} />);
    expect(screen.getByText('Ada and Grace are typing')).toBeInTheDocument();
  });

  it('gives a slot back to the summary on overflow', () => {
    render(<TypingIndicator names={['Ada', 'Grace', 'Bo']} />);
    expect(screen.getByText('Ada and 2 others are typing')).toBeInTheDocument();
  });

  it('drops a name that has not loaded instead of leaving a gap', () => {
    render(<TypingIndicator names={['Ada', '  ']} />);
    expect(screen.getByText('Ada is typing')).toBeInTheDocument();
  });

  it('is polite, because somebody starting to type is not an interruption', () => {
    const { container } = render(<TypingIndicator names={['Ada']} />);
    expect(container.firstElementChild).toHaveAttribute('aria-live', 'polite');
  });
});
