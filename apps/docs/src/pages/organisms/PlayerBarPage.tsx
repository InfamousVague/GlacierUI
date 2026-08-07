import {
  Heading,
  Image,
  PlayerBar,
  Stack,
  Text,
  TextTone,
  Size,
  createAnalyserMeter,
  useT,
  type PlayerRepeat,
} from '@glacier/react';
import { useBeat, volumeAmplitude, type LoudnessMeter } from '@glacier/logic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const DURATION = 301; // 5:01

/**
 * Stand-in album art: an inline SVG data URI, so the docs need no network and
 * the examples look the same offline.
 */
const ART = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1f6feb"/><stop offset="100%" stop-color="#0f2f5c"/>
    </linearGradient></defs>
    <rect width="120" height="120" fill="url(#g)"/>
    <circle cx="60" cy="60" r="26" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3"/>
    <circle cx="60" cy="60" r="5" fill="rgba(255,255,255,.75)"/>
  </svg>`,
)}`;

const artwork = <Image src={ART} alt="" aspectRatio={1} radius="md" />;

/** Kevin MacLeod's "Funky Chunk", CC BY 3.0, served by Wikimedia with CORS on -
 *  which the analyser requires, since cross-origin media taints the graph and
 *  reads back as silence. */
const TRACK_URL =
  'https://upload.wikimedia.org/wikipedia/commons/a/a2/Funky_Chunk_%28ISRC_USUAN1500054%29.mp3';

/**
 * The whole strip, driving a real track - including the fader, which is wired
 * to the element's own volume through `volumeAmplitude`. That conversion is the
 * point of the example: the rail is calibrated in decibels, so its position is
 * not the multiplier and handing it over directly would make the top half of
 * the travel do almost nothing.
 */
function LiveBar() {
  const t = useT();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [meter, setMeter] = useState<LoudnessMeter | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<PlayerRepeat>('off');
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const [favorite, setFavorite] = useState(false);

  // `at` is where a hit lands on the bar, so ripples leave the playhead rather
  // than a fixed point.
  const beat = useBeat({ meter, active: playing, at: duration > 0 ? position / duration : 0 });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setPosition(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // The fader's position is a decibel reading; the element wants amplitude.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = muted ? 0 : volumeAmplitude(volume);
  }, [volume, muted]);

  const seek = useCallback((seconds: number) => {
    setPosition(seconds);
    if (audioRef.current) audioRef.current.currentTime = seconds;
  }, []);

  const toggle = useCallback((next: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (next) {
      // Built here, inside the click on the strip's own play button: an
      // AudioContext created before the first user gesture starts suspended,
      // and on WebKit never recovers.
      setMeter(() => createAnalyserMeter(audio).meter);
      void audio.play();
    } else {
      audio.pause();
    }
    setPlaying(next);
  }, []);

  return (
    <Stack gap={2} width="full">
      {/* crossOrigin is what keeps the analyser readable; without it the graph
          is tainted and every reading comes back silent */}
      <audio ref={audioRef} src={TRACK_URL} crossOrigin="anonymous" preload="metadata" />
      <PlayerBar
        artwork={artwork}
        title={t(m.playerDemoTitle)}
        subtitle={t(m.playerDemoArtist)}
        duration={duration}
        value={position}
        onValueChange={seek}
        playing={playing}
        onPlayingChange={toggle}
        onSkipBack={() => seek(0)}
        onSkipForward={() => seek(duration)}
        shuffle={shuffle}
        onShuffleChange={setShuffle}
        repeat={repeat}
        onRepeatChange={setRepeat}
        favorite={favorite}
        onFavoriteChange={setFavorite}
        volume={volume}
        onVolumeChange={setVolume}
        muted={muted}
        onMutedChange={setMuted}
        status={t(m.pbarDemoStatus)}
        beat={beat}
      />
      <Text size={Size.XSmall} tone={TextTone.Subtle}>
        {t(m.seekFunkCredit)}
      </Text>
    </Stack>
  );
}

export function PlayerBarPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.pbarName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.pbarLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.pbarAnatomy))}</Text>
      <ComponentBlueprint specId="player-bar" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.pbarEx1Title)}
        description={prose(t(m.pbarEx1Desc))}
        code={`const beat = useBeat({ meter, active: playing, at: position / duration });

// the rail is calibrated in decibels, so its position is not the multiplier
useEffect(() => {
  audioRef.current.volume = muted ? 0 : volumeAmplitude(volume);
}, [volume, muted]);

<audio ref={audioRef} src={track} crossOrigin="anonymous" preload="metadata" />
<PlayerBar
  artwork={<Image src={cover} alt="" aspectRatio={1} radius="md" />}
  title="Funky Chunk"
  subtitle="Kevin MacLeod"
  duration={duration}
  value={position}
  onValueChange={seek}
  playing={playing}
  onPlayingChange={toggle}
  onSkipBack={() => seek(0)}
  onSkipForward={next}
  shuffle={shuffle}
  onShuffleChange={setShuffle}
  repeat={repeat}
  onRepeatChange={setRepeat}
  favorite={favorite}
  onFavoriteChange={setFavorite}
  volume={volume}
  onVolumeChange={setVolume}
  muted={muted}
  onMutedChange={setMuted}
  status="24/96kHz Stereo"
  beat={beat}
/>`}
      >
        <LiveBar />
      </Example>

      <Example
        title={t(m.pbarEx2Title)}
        description={prose(t(m.pbarEx2Desc))}
        component="PlayerBar"
        code={`<TrackInfo artwork={art} title="…" subtitle="artist" size="fill" />
<TransportControls onSkipBack={prev} onSkipForward={next} onShuffleChange={setShuffle} onRepeatChange={setRepeat} />
<VolumeBar defaultValue={70} />`}
        render={(K) => (
          <Stack gap={5} width="full">
            <K.TrackInfo
              artwork={artwork}
              title={t(m.playerDemoTitle)}
              subtitle={t(m.playerDemoArtist)}
            />
            <K.TransportControls
              onSkipBack={() => undefined}
              onSkipForward={() => undefined}
              onShuffleChange={() => undefined}
              onRepeatChange={() => undefined}
            />
            <div style={{ maxWidth: '14rem' }}>
              <K.VolumeBar defaultValue={70} />
            </div>
          </Stack>
        )}
      />

      <Example
        title={t(m.pbarEx3Title)}
        description={prose(t(m.pbarEx3Desc))}
        component="PlayerBar"
        code={`<PlayerBar position="docked"   duration={301} defaultValue={19} … />
<PlayerBar position="floating" duration={301} defaultValue={19} … />`}
        render={(K) => (
          <Stack gap={5} width="full">
            {(['docked', 'floating'] as const).map((p) => (
              <K.PlayerBar
                key={p}
                position={p}
                artwork={artwork}
                title={t(m.playerDemoTitle)}
                subtitle={t(m.playerDemoArtist)}
                duration={DURATION}
                defaultValue={19}
                onSkipBack={() => undefined}
                onSkipForward={() => undefined}
                onShuffleChange={() => undefined}
                onRepeatChange={() => undefined}
                onVolumeChange={() => undefined}
                status={t(m.pbarDemoStatus)}
              />
            ))}
          </Stack>
        )}
      />

      <Example
        title={t(m.pbarEx4Title)}
        description={prose(t(m.pbarEx4Desc))}
        component="PlayerBar"
        code={`{/* 100 is unity, 70 is -18dB, 0 is off - not quiet */}
<VolumeBar defaultValue={100} />
<VolumeBar defaultValue={70} />
<VolumeBar defaultValue={0} />

{/* or print the raw position instead, if the app has a reason to */}
<VolumeBar defaultValue={70} readout="percent" />`}
        render={(K) => (
          <Stack gap={4} width="full" maxWidth="xs">
            {[100, 70, 0].map((v) => (
              <K.VolumeBar key={v} defaultValue={v} />
            ))}
            <K.VolumeBar defaultValue={70} readout="percent" />
          </Stack>
        )}
      />

      <Example
        title={t(m.pbarEx5Title)}
        description={prose(t(m.pbarEx5Desc))}
        component="PlayerBar"
        code={`{/* the fader stays where it is and is disabled, not dragged to zero:
    the position is the setting, and the setting is what unmute returns to */}
<VolumeBar defaultValue={70} defaultMuted />`}
        render={(K) => (
          <Stack gap={4} width="full" maxWidth="xs">
            <K.VolumeBar defaultValue={70} defaultMuted />
          </Stack>
        )}
      />

      <Example
        title={t(m.pbarEx6Title)}
        description={prose(t(m.pbarEx6Desc))}
        component="PlayerBar"
        code={`{/* the strip measures itself, so this is the same component in a
    narrower box - no breakpoint, no props */}
<div style={{ width: '48rem' }}><PlayerBar … /></div>
<div style={{ width: '26rem' }}><PlayerBar … /></div>`}
        render={(K) => (
          <Stack gap={5} width="full">
            {['48rem', '26rem'].map((width) => (
              <div key={width} style={{ width, maxWidth: '100%' }}>
                <K.PlayerBar
                  artwork={artwork}
                  title={t(m.playerDemoTitle)}
                  subtitle={t(m.playerDemoArtist)}
                  duration={DURATION}
                  defaultValue={19}
                  onSkipBack={() => undefined}
                  onSkipForward={() => undefined}
                  onVolumeChange={() => undefined}
                  status={t(m.pbarDemoStatus)}
                />
              </div>
            ))}
          </Stack>
        )}
      />

      <Example
        title={t(m.pbarEx7Title)}
        description={prose(t(m.pbarEx7Desc))}
        component="PlayerBar"
        code={`<PlayerBar duration={301} defaultValue={19} … disabled />

{/* pass the same props so the placeholder holds the real strip */}
<PlayerBar duration={301} … skeleton />`}
        render={(K) => (
          <Stack gap={5} width="full">
            {([false, true] as const).map((skeleton) => (
              <K.PlayerBar
                key={String(skeleton)}
                artwork={artwork}
                title={t(m.playerDemoTitle)}
                subtitle={t(m.playerDemoArtist)}
                duration={DURATION}
                defaultValue={19}
                onSkipBack={() => undefined}
                onSkipForward={() => undefined}
                onVolumeChange={() => undefined}
                status={t(m.pbarDemoStatus)}
                disabled={!skeleton}
                skeleton={skeleton}
              />
            ))}
          </Stack>
        )}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'artwork', type: 'ReactNode', description: t(m.pbarPropArtwork) },
          { name: 'title', type: 'ReactNode', description: t(m.pbarPropTitle) },
          { name: 'subtitle', type: 'ReactNode', description: t(m.pbarPropSubtitle) },
          { name: 'duration', type: 'number', description: t(m.pbarPropDuration) },
          { name: 'value', type: 'number', description: t(m.playerPropValue) },
          { name: 'defaultValue', type: 'number', default: '0', description: t(m.seekPropDefaultValue) },
          { name: 'onValueChange', type: '(seconds: number) => void', description: t(m.seekPropOnValueChange) },
          { name: 'onSeekEnd', type: '(seconds: number) => void', description: t(m.seekPropOnSeekEnd) },
          { name: 'playing', type: 'boolean', description: t(m.playerPropPlaying) },
          { name: 'onPlayingChange', type: '(playing: boolean) => void', description: t(m.playerPropOnPlayingChange) },
          { name: 'onSkipBack / onSkipForward', type: '() => void', description: t(m.playerPropSkip) },
          { name: 'shuffle', type: 'boolean', description: t(m.playerPropShuffle) },
          { name: 'repeat', type: "'off' | 'all' | 'one'", description: t(m.playerPropRepeat) },
          { name: 'favorite', type: 'boolean', description: t(m.pbarPropFavorite) },
          { name: 'onFavoriteChange', type: '(on: boolean) => void', description: t(m.pbarPropFavorite) },
          { name: 'volume', type: 'number', description: t(m.pbarPropVolume) },
          { name: 'defaultVolume', type: 'number', default: '70', description: t(m.pbarPropVolume) },
          { name: 'onVolumeChange', type: '(volume: number) => void', description: t(m.pbarPropOnVolumeChange) },
          { name: 'muted', type: 'boolean', description: t(m.pbarPropMuted) },
          { name: 'onMutedChange', type: '(muted: boolean) => void', description: t(m.pbarPropMuted) },
          { name: 'volumeReadout', type: "'gain' | 'percent' | 'none'", default: "'none'", description: t(m.pbarPropVolumeReadout) },
          { name: 'leading / trailing', type: 'ReactNode', description: t(m.pbarPropRails) },
          { name: 'actions', type: 'ReactNode', description: t(m.pbarPropActions) },
          { name: 'status', type: 'ReactNode', description: t(m.pbarPropStatus) },
          { name: 'position', type: "'docked' | 'floating'", default: "'docked'", description: t(m.pbarPropPosition) },
          { name: 'density', type: "'compact' | 'comfortable' | 'spacious'", default: "'comfortable'", description: t(m.pbarPropDensity) },
          { name: 'remaining', type: 'boolean', default: 'true', description: t(m.pbarPropRemaining) },
          { name: 'shape / tone / fill / rail / levels / beat / intensity / tracer', type: 'SeekBar props', description: t(m.playerPropSeek) },
          { name: 'formatTime', type: '(seconds: number) => string', description: t(m.playerPropFormatTime) },
          { name: 'labels', type: 'Partial<PlayerBarLabels>', description: t(m.pbarPropLabels) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.seekPropDisabled) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.playerPropSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.pbarA11y1))}</li>
        <li>{prose(t(m.pbarA11y2))}</li>
        <li>{prose(t(m.pbarA11y3))}</li>
        <li>{prose(t(m.pbarA11y4))}</li>
        <li>{prose(t(m.pbarA11y5))}</li>
        <li>{prose(t(m.pbarA11y6))}</li>
      </ul>
    </>
  );
}
