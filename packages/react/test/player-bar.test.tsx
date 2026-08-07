import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { PlayerBar, TrackInfo, TransportControls, VolumeBar } from '../src/index.ts';

describe('TrackInfo', () => {
  it('reads out its three lines in order', () => {
    render(<TrackInfo title="Smells Like Teen Spirit" subtitle="Nevermind" album="Nirvana" />);
    expect(screen.getByText('Smells Like Teen Spirit')).toBeTruthy();
    expect(screen.getByText('Nevermind')).toBeTruthy();
    expect(screen.getByText('Nirvana')).toBeTruthy();
  });

  it('draws only the lines it was given', () => {
    const { container } = render(<TrackInfo title="Allegro" />);
    // no empty boxes standing in for the lines that were not passed
    expect(container.textContent).toBe('Allegro');
  });

  it('carries no role of its own, so the surface around it stays the subject', () => {
    render(<TrackInfo title="Allegro" subtitle="Albinoni" />);
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('loads each line as its own placeholder rather than one bar', () => {
    const { container } = render(
      <TrackInfo title="Allegro" subtitle="Albinoni" album="Adagio" artwork={<img alt="" />} skeleton />,
    );
    // three lines and the cover, each a bone of its own, so the block holds the
    // shape it will settle into
    expect(container.querySelectorAll('[data-skeleton], [class*="skeleton"]').length).toBeGreaterThan(3);
    expect(screen.queryByText('Allegro')).toBeNull();
  });
});

describe('TransportControls', () => {
  it('is a labelled group, so the buttons are announced as belonging to something', () => {
    render(<TransportControls />);
    expect(screen.getByRole('group', { name: 'Playback controls' })).toBeTruthy();
  });

  it('renders a control only when it can do something', () => {
    const { rerender } = render(<TransportControls />);
    // a bare row is just play/pause
    expect(screen.queryByRole('button', { name: 'Stop' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Previous track' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Shuffle' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Repeat/ })).toBeNull();

    rerender(
      <TransportControls
        onStop={() => undefined}
        onSkipBack={() => undefined}
        onSkipForward={() => undefined}
        onShuffleChange={() => undefined}
        onRepeatChange={() => undefined}
      />,
    );
    expect(screen.getByRole('button', { name: 'Stop' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Previous track' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next track' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Shuffle' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Repeat/ })).toBeTruthy();
  });

  it('offers stop apart from pause, since they are different requests', async () => {
    const onStop = vi.fn();
    const onPlayingChange = vi.fn();
    render(<TransportControls onStop={onStop} onPlayingChange={onPlayingChange} defaultPlaying />);
    await userEvent.click(screen.getByRole('button', { name: 'Stop' }));
    // one gives up the position, the other keeps it - pressing stop is not
    // pressing pause, so it never reports a play state change
    expect(onStop).toHaveBeenCalledOnce();
    expect(onPlayingChange).not.toHaveBeenCalled();
  });

  it('toggles play through one button whose label changes', async () => {
    const onPlayingChange = vi.fn();
    render(<TransportControls onPlayingChange={onPlayingChange} />);
    const button = screen.getByRole('button', { name: 'Play' });
    await userEvent.click(button);
    expect(onPlayingChange).toHaveBeenCalledWith(true);
    // the same button is still there, now labelled Pause - focus survives
    expect(screen.getByRole('button', { name: 'Pause' })).toBe(button);
  });

  it('cycles repeat off, all, one, and names the mode in its label', async () => {
    const onRepeatChange = vi.fn();
    render(<TransportControls onRepeatChange={onRepeatChange} />);
    const repeat = screen.getByRole('button', { name: /Repeat/ });
    expect(repeat).toHaveAttribute('aria-label', 'Repeat: off');
    await userEvent.click(repeat);
    expect(onRepeatChange).toHaveBeenLastCalledWith('all');
    await userEvent.click(repeat);
    expect(onRepeatChange).toHaveBeenLastCalledWith('one');
    await userEvent.click(repeat);
    expect(onRepeatChange).toHaveBeenLastCalledWith('off');
  });

  it('drops the disc behind the play control when asked to be quiet', () => {
    const { container, unmount } = render(<TransportControls emphasis="quiet" />);
    const row = container.querySelector('[data-emphasis]') as HTMLElement;
    expect(row.dataset.emphasis).toBe('quiet');
    // the size step still marks it as the primary action, so nothing is lost
    // by taking the fill away
    unmount();
    const solid = render(<TransportControls />);
    expect((solid.container.querySelector('[data-emphasis]') as HTMLElement).dataset.emphasis).toBe('solid');
  });
});

describe('VolumeBar', () => {
  it('prints the level in decibels, since that is what the ear is linear in', () => {
    render(<VolumeBar defaultValue={70} />);
    expect(screen.getByText('-18dB')).toBeTruthy();
  });

  it('names silence rather than printing a very small number for it', () => {
    render(<VolumeBar defaultValue={0} />);
    expect(screen.getByText('-∞dB')).toBeTruthy();
  });

  it('can print a percentage instead, or nothing at all', () => {
    const { rerender } = render(<VolumeBar defaultValue={70} readout="percent" />);
    expect(screen.getByText('70%')).toBeTruthy();
    rerender(<VolumeBar defaultValue={70} readout="none" />);
    expect(screen.queryByText('70%')).toBeNull();
    expect(screen.queryByText('-18dB')).toBeNull();
  });

  it('reports the fader through the platform, not a re-implementation of it', () => {
    const onValueChange = vi.fn();
    render(<VolumeBar defaultValue={70} onValueChange={onValueChange} />);
    const fader = screen.getByRole('slider', { name: 'Volume' });
    // the rail is a range input, so it is dragged, arrowed and announced by the
    // platform - and it says what the number means, not just what it is
    expect(fader).toHaveAttribute('aria-valuetext', '-18dB');
    fireEvent.change(fader, { target: { value: '71' } });
    expect(onValueChange).toHaveBeenCalledWith(71);
  });

  it('keeps the level it was set to when muted, rather than dragging it to zero', async () => {
    const onMutedChange = vi.fn();
    render(<VolumeBar defaultValue={70} onMutedChange={onMutedChange} />);
    const mute = screen.getByRole('button', { name: 'Mute' });
    expect(mute).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(mute);
    expect(onMutedChange).toHaveBeenCalledWith(true);
    // the readout says what is coming out - nothing - while the fader still
    // holds the position unmuting will return to
    expect(screen.getByText('-∞dB')).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveValue('70');
    // one button whose label changes, not two that swap
    expect(screen.getByRole('button', { name: 'Unmute' })).toBe(mute);
  });

  it('takes translated labels', () => {
    render(<VolumeBar labels={{ mute: 'Couper le son', volume: 'Volume sonore' }} />);
    expect(screen.getByRole('button', { name: 'Couper le son' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Volume sonore' })).toBeTruthy();
  });

  it('steps the speaker with the level, so a fader on the floor does not read as loud', () => {
    const glyph = () =>
      screen.getByRole('button', { name: /mute/i }).querySelector('svg')?.getAttribute('class') ?? '';
    const { rerender } = render(<VolumeBar value={70} />);
    expect(glyph()).toMatch(/volume-?2/);
    rerender(<VolumeBar value={20} />);
    expect(glyph()).toMatch(/volume-?1/);
    // down is not struck through: the level is off, not silenced
    rerender(<VolumeBar value={0} />);
    expect(glyph()).toMatch(/lucide-volume$/);
    // and muted is struck whatever the fader is holding
    rerender(<VolumeBar value={70} muted />);
    expect(glyph()).toMatch(/volume-?x/);
  });

  it('stands the rail up when asked, and says so to the platform', () => {
    render(<VolumeBar orientation="vertical" />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  });

  it('folds down to a single speaker when the rail is in a panel', async () => {
    render(<VolumeBar layout="popover" orientation="vertical" />);
    // shut, the row costs one button: no rail, no readout
    expect(screen.queryByRole('slider', { name: 'Volume' })).toBeNull();
    expect(screen.queryByText('-18dB')).toBeNull();
    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Mute' }));
    expect(await screen.findByRole('slider', { name: 'Volume' })).toBeTruthy();
    expect(screen.getByText('-18dB')).toBeTruthy();
  });

  it('spends no press on the panel, so the speaker still mutes', async () => {
    const onMutedChange = vi.fn();
    render(<VolumeBar layout="popover" onMutedChange={onMutedChange} />);
    const speaker = screen.getByRole('button', { name: 'Mute' });
    // the panel is not asked for, so the button does not claim it opens one
    expect(speaker).not.toHaveAttribute('aria-haspopup');
    fireEvent.pointerEnter(speaker);
    await screen.findByRole('slider', { name: 'Volume' });
    // no second speaker a finger's width above the one the panel opened over
    expect(screen.getAllByRole('button', { name: /mute/i })).toHaveLength(1);
    await userEvent.click(speaker);
    expect(onMutedChange).toHaveBeenCalledWith(true);
    // and the level it was set to is still there to come back to
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveValue('70');
    expect(screen.getByRole('button', { name: 'Unmute' })).toBe(speaker);
  });

  it('shuts the panel when the pointer leaves it', async () => {
    render(<VolumeBar layout="popover" />);
    const speaker = screen.getByRole('button', { name: 'Mute' });
    fireEvent.pointerEnter(speaker);
    await screen.findByRole('slider', { name: 'Volume' });
    fireEvent.pointerLeave(speaker);
    await waitFor(() => expect(speaker).toHaveAttribute('aria-expanded', 'false'));
  });
});

describe('PlayerBar', () => {
  it('groups the strip and names it by what is playing', () => {
    render(<PlayerBar title="Smells Like Teen Spirit" subtitle="Nirvana" duration={301} />);
    expect(screen.getByRole('group', { name: 'Smells Like Teen Spirit' })).toBeTruthy();
  });

  it('shows the track in two lines, since the album is what nobody scans for', () => {
    render(<PlayerBar title="Smells Like Teen Spirit" subtitle="Nirvana" duration={301} />);
    expect(screen.getByText('Smells Like Teen Spirit')).toBeTruthy();
    expect(screen.getByText('Nirvana')).toBeTruthy();
  });

  it('has no stop control: a strip pauses, and pausing keeps the position', () => {
    render(<PlayerBar title="Allegro" duration={301} />);
    expect(screen.queryByRole('button', { name: 'Stop' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();
  });

  it('counts the trailing clock down, since a strip is read while listening', () => {
    render(<PlayerBar duration={301} value={19} />);
    expect(screen.getByText('0:19')).toBeTruthy();
    expect(screen.getByText('-4:42')).toBeTruthy();
  });

  it('can print the total instead', () => {
    render(<PlayerBar duration={301} value={19} remaining={false} />);
    expect(screen.getByText('5:01')).toBeTruthy();
    expect(screen.queryByText('-4:42')).toBeNull();
  });

  it('draws the fader only when there is something to turn down', () => {
    const { rerender } = render(<PlayerBar duration={301} />);
    expect(screen.queryByRole('button', { name: 'Mute' })).toBeNull();
    rerender(<PlayerBar duration={301} onVolumeChange={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Mute' })).toBeTruthy();
  });

  it('keeps the fader behind the speaker, where the strip has room for it', async () => {
    render(<PlayerBar duration={301} onVolumeChange={() => undefined} />);
    // shut, the strip spends the width of one button on the level
    expect(screen.queryByRole('slider', { name: 'Volume' })).toBeNull();
    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Mute' }));
    expect(await screen.findByRole('slider', { name: 'Volume' })).toBeTruthy();
  });

  it('offers a quality popover beside volume and reports the selected quality', async () => {
    const user = userEvent.setup();
    const onQualityChange = vi.fn();
    render(<PlayerBar duration={301} onVolumeChange={() => undefined} onQualityChange={onQualityChange} />);

    const quality = screen.getByRole('button', { name: 'Audio quality' });
    await user.click(quality);
    const group = screen.getByRole('radiogroup', { name: 'Audio quality' });
    expect(group).toBeTruthy();

    await user.click(screen.getByRole('radio', { name: 'Lossless' }));
    expect(onQualityChange).toHaveBeenCalledWith('lossless');
  });

  it('holds the transport and the fader as groups of their own', async () => {
    render(<PlayerBar title="Allegro" duration={301} onVolumeChange={() => undefined} />);
    // told apart by name rather than by inferring it from the button labels
    expect(screen.getByRole('group', { name: 'Playback controls' })).toBeTruthy();
    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Mute' }));
    expect(await screen.findByRole('group', { name: 'Volume' })).toBeTruthy();
  });

  it('draws the heart only when there is somewhere to save to', () => {
    const { rerender } = render(<PlayerBar duration={301} />);
    expect(screen.queryByRole('button', { name: 'Add to favourites' })).toBeNull();
    rerender(<PlayerBar duration={301} onFavoriteChange={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Add to favourites' })).toBeTruthy();
  });

  it('reports the favourite as a state rather than an event', async () => {
    const user = userEvent.setup();
    const onFavoriteChange = vi.fn();
    render(<PlayerBar duration={301} onFavoriteChange={onFavoriteChange} />);
    const heart = screen.getByRole('button', { name: 'Add to favourites' });
    expect(heart.getAttribute('aria-pressed')).toBe('false');
    await user.click(heart);
    expect(onFavoriteChange).toHaveBeenCalledWith(true);
    // the label names the next press, so one button can carry both states
    expect(screen.getByRole('button', { name: 'Remove from favourites' })).toBeTruthy();
  });

  it('hangs the app\'s own controls off the rails beside the transport', () => {
    render(
      <PlayerBar
        duration={301}
        leading={<button type="button">Lyrics</button>}
        trailing={<button type="button">Queue</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Lyrics' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Queue' })).toBeTruthy();
  });

  it('seeks through the bar and reports it', async () => {
    const onValueChange = vi.fn();
    render(<PlayerBar duration={300} defaultValue={100} onValueChange={onValueChange} />);
    const bar = screen.getByRole('slider', { name: 'Seek' });
    bar.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledWith(105);
  });

  it('takes the slots the app owns rather than inventing props for them', () => {
    render(
      <PlayerBar
        duration={301}
        onVolumeChange={() => undefined}
        actions={<button type="button">Queue</button>}
        status="24/96kHz Stereo"
      />,
    );
    expect(screen.getByRole('button', { name: 'Queue' })).toBeTruthy();
    expect(screen.getByText('24/96kHz Stereo')).toBeTruthy();
  });

  it('fills the strip with its cover rather than picking a size for it', () => {
    const { container } = render(
      <PlayerBar title="Allegro" artwork={<img alt="" />} duration={301} />,
    );
    // how tall the row is was decided by the controls in the middle, so the art
    // is given a height rather than setting one
    expect((container.querySelector('[data-size]') as HTMLElement).dataset.size).toBe('fill');
  });

  it('fills the play button, since a strip still needs one thing to aim at', () => {
    const { container } = render(<PlayerBar title="Allegro" duration={301} />);
    expect((container.querySelector('[data-emphasis]') as HTMLElement).dataset.emphasis).toBe('solid');
  });

  it('is chrome, not the page: nothing on it takes focus by being the strip', () => {
    const { container } = render(<PlayerBar title="Allegro" duration={301} />);
    const bar = container.querySelector('[data-position]') as HTMLElement;
    expect(bar.getAttribute('tabindex')).toBeNull();
    expect(bar.dataset.position).toBe('docked');
  });

  it('blocks every control when disabled', async () => {
    const onPlayingChange = vi.fn();
    render(<PlayerBar duration={301} onPlayingChange={onPlayingChange} disabled />);
    await userEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(onPlayingChange).not.toHaveBeenCalled();
  });

  it('loads every part as its own placeholder, keeping the strip standing', () => {
    const { container } = render(
      <PlayerBar
        title="Allegro"
        subtitle="Albinoni"
        artwork={<img alt="" />}
        duration={301}
        onVolumeChange={() => undefined}
        onFavoriteChange={() => undefined}
        onQualityChange={() => undefined}
        onSkipBack={() => undefined}
        onSkipForward={() => undefined}
        status="24/96kHz Stereo"
        skeleton
      />,
    );
    expect(container.querySelectorAll('[data-skeleton]').length).toBeGreaterThan(3);
    // a placeholder is not a group of controls yet: nothing on the strip -
    // transport, heart, quality, fader, or seek - resolves to a real control
    expect(screen.queryByRole('group')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('slider')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <PlayerBar
        artwork={<img alt="" src="" />}
        title="Smells Like Teen Spirit"
        subtitle="Nirvana"
        duration={301}
        defaultValue={19}
        onSkipBack={() => undefined}
        onSkipForward={() => undefined}
        onShuffleChange={() => undefined}
        onRepeatChange={() => undefined}
        onVolumeChange={() => undefined}
        status="24/96kHz Stereo"
      />,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
