import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { useState } from 'react';
// Imported by path: the compose suite is not registered in the kit's index yet.
import { ComposeBar } from '../src/organisms/ComposeBar/ComposeBar.tsx';
import { MessageInput } from '../src/organisms/ComposeBar/MessageInput.tsx';
import { SendButton } from '../src/organisms/ComposeBar/SendButton.tsx';
import { AttachmentTray } from '../src/organisms/ComposeBar/AttachmentTray.tsx';
import { ComposeContextBanner } from '../src/organisms/ComposeBar/ComposeContextBanner.tsx';
import { CharacterCounter } from '../src/organisms/ComposeBar/CharacterCounter.tsx';
import { MentionAutocomplete } from '../src/organisms/ComposeBar/MentionAutocomplete.tsx';
import { VoiceRecorder } from '../src/organisms/ComposeBar/VoiceRecorder.tsx';
import type { ComposeAttachment } from '@glacier/logic';

const people = [
  { id: 'ada', label: 'Ada Lovelace', handle: '@ada' },
  { id: 'alan', label: 'Alan Turing', handle: '@alan' },
  { id: 'grace', label: 'Grace Hopper', handle: '@grace' },
];

const attachment = (over: Partial<ComposeAttachment> = {}): ComposeAttachment => ({
  id: 'a1',
  name: 'photo.png',
  size: 2048,
  status: 'pending',
  ...over,
});

/**
 * The composer's textarea. It exposes role=combobox while a mention popup is
 * open, so it is queried by its accessible name rather than by role.
 */
const field = (name: string | RegExp = /Message/) =>
  screen.getByLabelText(name, { selector: 'textarea' }) as HTMLTextAreaElement;
const sendControl = () => screen.getByRole('button', { name: /Send|Sending/ });

describe('MessageInput', () => {
  it('sends on Enter and writes a newline on Shift+Enter with the send policy', () => {
    const onSend = vi.fn();
    render(<MessageInput defaultValue="hello" onSend={onSend} enterPolicy="send" aria-label="Message" />);
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('hello');

    onSend.mockClear();
    fireEvent.keyDown(field(), { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('writes a newline on Enter under the newline policy, and still sends on Cmd+Enter', () => {
    const onSend = vi.fn();
    render(<MessageInput defaultValue="hi" onSend={onSend} enterPolicy="newline" aria-label="Message" />);
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
    // The keyboard route survives a touch policy, so a hardware keyboard is
    // never left without one.
    fireEvent.keyDown(field(), { key: 'Enter', metaKey: true });
    expect(onSend).toHaveBeenCalledWith('hi');
  });

  it('resolves auto against the device, not the author', () => {
    const onSend = vi.fn();
    const { rerender } = render(
      <MessageInput defaultValue="hi" onSend={onSend} touch={false} aria-label="Message" />,
    );
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).toHaveBeenCalledTimes(1);

    rerender(<MessageInput defaultValue="hi" onSend={onSend} touch aria-label="Message" />);
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('never sends while an IME composition is open', () => {
    const onSend = vi.fn();
    render(<MessageInput defaultValue="にほん" onSend={onSend} enterPolicy="send" aria-label="Message" />);
    // The first Enter commits the Japanese candidate; sending on it would cut
    // the word in half.
    fireEvent.keyDown(field(), { key: 'Enter', isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('lets a caller intercept a key before the policy sees it', () => {
    const onSend = vi.fn();
    render(
      <MessageInput
        defaultValue="hi"
        onSend={onSend}
        enterPolicy="send"
        aria-label="Message"
        onKeyDown={(event) => event.preventDefault()}
      />,
    );
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('turns a pasted file into an attachment instead of text', () => {
    const onPasteFiles = vi.fn();
    render(<MessageInput onPasteFiles={onPasteFiles} aria-label="Message" />);
    const file = new File(['x'], 'shot.png', { type: 'image/png' });
    fireEvent.paste(field(), { clipboardData: { files: [file] } });
    expect(onPasteFiles).toHaveBeenCalledWith([file]);
  });

  it('leaves a plain text paste alone', () => {
    const onPasteFiles = vi.fn();
    render(<MessageInput onPasteFiles={onPasteFiles} aria-label="Message" />);
    fireEvent.paste(field(), { clipboardData: { files: [] } });
    expect(onPasteFiles).not.toHaveBeenCalled();
  });

  it('reports every edit', () => {
    const onValueChange = vi.fn();
    render(<MessageInput onValueChange={onValueChange} aria-label="Message" />);
    fireEvent.change(field(), { target: { value: 'typed' } });
    expect(onValueChange).toHaveBeenCalledWith('typed');
  });
});

describe('SendButton', () => {
  it('is present and refused when there is nothing to send, never hidden', () => {
    const onSend = vi.fn();
    render(<SendButton state="empty" onSend={onSend} />);
    const button = sendControl();
    // Still in the tab order: aria-disabled, not the disabled attribute.
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(false);
    fireEvent.click(button);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('says why it will not act, so four identical-looking refusals do not sound identical', () => {
    const { rerender } = render(<SendButton state="empty" />);
    expect(screen.getByRole('button', { name: /Nothing to send yet/ })).toBeTruthy();
    rerender(<SendButton state="empty" blockReason="uploading" />);
    expect(screen.getByRole('button', { name: /attachments to finish uploading/ })).toBeTruthy();
    rerender(<SendButton state="empty" blockReason="over-limit" />);
    expect(screen.getByRole('button', { name: /over the character limit/ })).toBeTruthy();
  });

  it('sends when ready and announces itself busy in flight', () => {
    const onSend = vi.fn();
    const { rerender } = render(<SendButton state="ready" onSend={onSend} />);
    fireEvent.click(sendControl());
    expect(onSend).toHaveBeenCalledTimes(1);

    rerender(<SendButton state="sending" onSend={onSend} />);
    expect(sendControl().getAttribute('aria-busy')).toBe('true');
    fireEvent.click(sendControl());
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('becomes the retry after a failure', () => {
    const onRetry = vi.fn();
    render(<SendButton state="failed" onRetry={onRetry} />);
    const button = screen.getByRole('button', { name: /Send failed/ });
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('treats a retry as a second send when no retry handler is given', () => {
    const onSend = vi.fn();
    render(<SendButton state="failed" onSend={onSend} />);
    fireEvent.click(screen.getByRole('button', { name: /Send failed/ }));
    expect(onSend).toHaveBeenCalledTimes(1);
  });
});

describe('AttachmentTray', () => {
  it('renders nothing at all when there is nothing attached', () => {
    const { container } = render(<AttachmentTray attachments={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('lists each file with its own cancel, named after the file', () => {
    const onCancel = vi.fn();
    render(<AttachmentTray attachments={[attachment(), attachment({ id: 'a2', name: 'notes.pdf' })]} onCancel={onCancel} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Remove notes.pdf' }));
    expect(onCancel).toHaveBeenCalledWith('a2');
  });

  it('shows a progress bar only while a file is in flight', () => {
    const { rerender } = render(<AttachmentTray attachments={[attachment({ status: 'uploading', progress: 0.4 })]} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    rerender(<AttachmentTray attachments={[attachment({ status: 'complete', progress: 1 })]} />);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('offers a retry on a failed file and shows why it failed', () => {
    const onRetry = vi.fn();
    render(<AttachmentTray attachments={[attachment({ status: 'failed', error: 'Network error' })]} onRetry={onRetry} />);
    expect(screen.getByText('Network error')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry photo.png' }));
    expect(onRetry).toHaveBeenCalledWith('a1');
  });

  it('formats the size in the active locale', () => {
    render(<AttachmentTray attachments={[attachment({ size: 2_400_000 })]} />);
    expect(screen.getByText(/2\.4 MB/)).toBeTruthy();
  });
});

describe('ComposeContextBanner', () => {
  it('is one component with three modes, each naming what dismissing loses', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<ComposeContextBanner mode="reply" author="Ada" onDismiss={onDismiss} />);
    expect(screen.getByRole('status').textContent).toContain('Ada');
    expect(screen.getByRole('button', { name: 'Cancel reply' })).toBeTruthy();

    rerender(<ComposeContextBanner mode="edit" onDismiss={onDismiss} />);
    expect(screen.getByText('Editing message')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancel edit' })).toBeTruthy();

    rerender(<ComposeContextBanner mode="forward" count={3} onDismiss={onDismiss} />);
    expect(screen.getByText('Forwarding 3 messages')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel forward' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('still says what it is doing when the author is unknown', () => {
    render(<ComposeContextBanner mode="reply" onDismiss={vi.fn()} />);
    expect(screen.getByText('Replying')).toBeTruthy();
  });

  it('shows one clamped line of the message it refers to', () => {
    render(<ComposeContextBanner mode="reply" author="Ada" preview="the analytical engine" onDismiss={vi.fn()} />);
    expect(screen.getByText('the analytical engine')).toBeTruthy();
  });
});

describe('CharacterCounter', () => {
  it('is absent, not empty, until the message nears the limit', () => {
    const { container, rerender } = render(<CharacterCounter length={10} limit={100} />);
    expect(container.firstChild).toBeNull();
    rerender(<CharacterCounter length={85} limit={100} />);
    expect(screen.getByRole('status').textContent).toBe('15');
  });

  it('counts down and goes negative, which is why it is not a Meter', () => {
    render(<CharacterCounter length={104} limit={100} />);
    const counter = screen.getByRole('status');
    expect(counter.textContent).toBe('-4');
    expect(counter.getAttribute('aria-label')).toContain('4 characters over the limit');
  });

  it('keeps the units in the name so the readout stays one token', () => {
    render(<CharacterCounter length={90} limit={100} />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('10 characters left');
  });
});

describe('MentionAutocomplete', () => {
  it('lists candidates and reports the one chosen', () => {
    const onChoose = vi.fn();
    render(<MentionAutocomplete open query="a" candidates={people} cursor={0} onChoose={onChoose} />);
    expect(screen.getAllByRole('option')).toHaveLength(3);
    fireEvent.mouseDown(screen.getByText('Grace Hopper'));
    expect(onChoose).toHaveBeenCalledWith('grace');
  });

  it('stays open on no matches rather than blinking out mid-name', () => {
    render(<MentionAutocomplete open query="zzz" candidates={people} cursor={0} onChoose={vi.fn()} />);
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('No matches')).toBeTruthy();
  });

  it('marks the cursor row as the selected option', () => {
    render(<MentionAutocomplete open query="" candidates={people} cursor={1} onChoose={vi.fn()} />);
    const selected = screen.getAllByRole('option').find((o) => o.getAttribute('aria-selected') === 'true');
    expect(selected?.textContent).toContain('Alan Turing');
  });

  it('renders nothing while closed', () => {
    const { container } = render(
      <MentionAutocomplete open={false} candidates={people} cursor={0} onChoose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('VoiceRecorder', () => {
  it('records on hold and sends on release', async () => {
    const onStart = vi.fn();
    const onSend = vi.fn();
    render(<VoiceRecorder onStart={onStart} onSend={onSend} />);
    const user = userEvent.setup();
    const mic = screen.getByRole('button', { name: /Hold to record/ });
    await user.pointer([{ target: mic, keys: '[MouseLeft>]', coords: { clientX: 200, clientY: 0 } }]);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Recording' })).toBeTruthy();
    await user.pointer([{ keys: '[/MouseLeft]' }]);
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('throws the take away when the finger slides past the threshold', async () => {
    const onSend = vi.fn();
    const onCancel = vi.fn();
    render(<VoiceRecorder onSend={onSend} onCancel={onCancel} cancelThreshold={80} />);
    const user = userEvent.setup();
    const mic = screen.getByRole('button', { name: /Hold to record/ });
    // userEvent, not fireEvent: jsdom has no PointerEvent, so a fired pointer
    // event carries no clientX and the slide would measure as zero.
    await user.pointer([
      { target: mic, keys: '[MouseLeft>]', coords: { clientX: 200, clientY: 0 } },
      { coords: { clientX: 100, clientY: 0 } },
    ]);
    expect(screen.getByText('Release to cancel')).toBeTruthy();
    await user.pointer([{ keys: '[/MouseLeft]' }]);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('keeps the take when the finger slides back out of the cancel zone', async () => {
    const onSend = vi.fn();
    render(<VoiceRecorder onSend={onSend} cancelThreshold={80} />);
    const user = userEvent.setup();
    const mic = screen.getByRole('button', { name: /Hold to record/ });
    await user.pointer([
      { target: mic, keys: '[MouseLeft>]', coords: { clientX: 200, clientY: 0 } },
      { coords: { clientX: 100, clientY: 0 } },
      { coords: { clientX: 190, clientY: 0 } },
    ]);
    expect(screen.getByText('Slide to cancel')).toBeTruthy();
    await user.pointer([{ keys: '[/MouseLeft]' }]);
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('gives the keyboard a route that does not require holding anything', () => {
    const onSend = vi.fn();
    render(<VoiceRecorder onSend={onSend} />);
    // Activating without a pointer press starts a hands-free recording…
    fireEvent.click(screen.getByRole('button', { name: /Hold to record/ }));
    const stop = screen.getByRole('button', { name: 'Stop recording and send' });
    expect(screen.getByRole('button', { name: 'Discard recording' })).toBeTruthy();
    // …and activating again ends it.
    fireEvent.click(stop);
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('discards a locked recording on Escape', () => {
    const onCancel = vi.fn();
    render(<VoiceRecorder onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /Hold to record/ }));
    fireEvent.keyDown(screen.getByRole('button', { name: 'Stop recording and send' }), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('ComposeBar', () => {
  it('names the composer region and refuses to send an empty message', () => {
    const onSend = vi.fn();
    render(<ComposeBar onSend={onSend} touch={false} />);
    expect(screen.getByRole('form', { name: 'Message composer' })).toBeTruthy();
    fireEvent.click(sendControl());
    expect(onSend).not.toHaveBeenCalled();
  });

  it('sends the trimmed text once there is something to send', () => {
    const onSend = vi.fn();
    render(<ComposeBar onSend={onSend} touch={false} />);
    fireEvent.change(field(), { target: { value: '  hello  ' } });
    fireEvent.click(sendControl());
    expect(onSend).toHaveBeenCalledWith('hello', []);
  });

  it('never clears itself, so a failed send does not lose the message', () => {
    function Host() {
      const [value, setValue] = useState('');
      return <ComposeBar value={value} onValueChange={setValue} onSend={() => undefined} touch={false} />;
    }
    render(<Host />);
    fireEvent.change(field(), { target: { value: 'keep me' } });
    fireEvent.click(sendControl());
    expect(field().value).toBe('keep me');
  });

  it('waits for an upload instead of racing it, and says so', () => {
    const onSend = vi.fn();
    render(
      <ComposeBar
        onSend={onSend}
        touch={false}
        attachments={[attachment({ status: 'uploading', progress: 0.5 })]}
      />,
    );
    const button = screen.getByRole('button', { name: /attachments to finish uploading/ });
    fireEvent.click(button);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('sends a message that is only attachments', () => {
    const onSend = vi.fn();
    const attachments = [attachment({ status: 'complete', progress: 1 })];
    render(<ComposeBar onSend={onSend} touch={false} attachments={attachments} />);
    fireEvent.click(sendControl());
    expect(onSend).toHaveBeenCalledWith('', attachments);
  });

  it('refuses to send a message over its limit and shows the countdown', () => {
    const onSend = vi.fn();
    render(<ComposeBar onSend={onSend} touch={false} limit={10} />);
    fireEvent.change(field(), { target: { value: 'far too long a message' } });
    expect(screen.getByRole('status').textContent).toBe('-12');
    fireEvent.click(screen.getByRole('button', { name: /over the character limit/ }));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('opens the mention popup on an @-token and completes it on Enter', () => {
    render(<ComposeBar touch={false} mentions={people} />);
    fireEvent.change(field(), { target: { value: 'hey @a' } });
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    // Enter belongs to the popup while it is open, not to send.
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(field().value).toBe('hey @ada ');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('moves the mention cursor with the arrow keys', () => {
    render(<ComposeBar touch={false} mentions={people} />);
    fireEvent.change(field(), { target: { value: '@a' } });
    fireEvent.keyDown(field(), { key: 'ArrowDown' });
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(field().value).toBe('@alan ');
  });

  it('closes the popup on Escape without touching what was typed', () => {
    render(<ComposeBar touch={false} mentions={people} />);
    fireEvent.change(field(), { target: { value: '@a' } });
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(field().value).toBe('@a');
  });

  it('only opens the slash popup at the very start of a message', () => {
    const commands = [{ id: 'giphy', label: '/giphy' }];
    render(<ComposeBar touch={false} commands={commands} />);
    fireEvent.change(field(), { target: { value: '/gi' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.change(field(), { target: { value: 'and/or' } });
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('dismisses the reply context on Escape when no popup is open', () => {
    const onContextDismiss = vi.fn();
    render(
      <ComposeBar touch={false} context={{ mode: 'reply', author: 'Ada' }} onContextDismiss={onContextDismiss} />,
    );
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(onContextDismiss).toHaveBeenCalledTimes(1);
  });

  it('screens dropped files with FileUpload\'s vocabulary', () => {
    const onFiles = vi.fn();
    const onReject = vi.fn();
    render(<ComposeBar touch={false} onFiles={onFiles} onReject={onReject} accept="image/*" />);
    const png = new File(['x'], 'a.png', { type: 'image/png' });
    const pdf = new File(['x'], 'b.pdf', { type: 'application/pdf' });
    fireEvent.drop(screen.getByRole('form'), { dataTransfer: { files: [png, pdf], types: ['Files'] } });
    expect(onFiles).toHaveBeenCalledWith([png]);
    expect(onReject).toHaveBeenCalledWith([{ file: pdf, reason: 'type' }]);
  });

  it('drops the recorder and the attach control when their handlers are omitted', () => {
    const { rerender } = render(<ComposeBar touch={false} />);
    expect(screen.queryByRole('button', { name: /Hold to record/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Attach files' })).toBeNull();
    rerender(<ComposeBar touch={false} onVoice={vi.fn()} onFiles={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Hold to record/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Attach files' })).toBeTruthy();
  });

  it('has no axe violations with every part on screen', async () => {
    const { container } = render(
      <ComposeBar
        touch={false}
        limit={20}
        defaultValue="a nearly full message"
        context={{ mode: 'reply', author: 'Ada', preview: 'the engine' }}
        onContextDismiss={vi.fn()}
        attachments={[attachment({ status: 'uploading', progress: 0.5 })]}
        onFiles={vi.fn()}
        onVoice={vi.fn()}
        mentions={people}
      />,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
