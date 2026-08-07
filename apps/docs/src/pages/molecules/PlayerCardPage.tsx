import {
  Heading,
  Image,
  PlayerCard,
  Stack,
  Text,
  TextTone,
  Size,
  createAnalyserMeter,
  useT,
  type PlayerRepeat,
} from '@glacier/react';
import { useBeat, type LoudnessMeter } from '@glacier/logic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/** A deterministic level series, so the docs draw the same waveform each load. */
const LEVEL_COUNT = 48;
const LEVELS = Array.from({ length: LEVEL_COUNT }, (_unused, i) => {
  const t = i / (LEVEL_COUNT - 1);
  return Math.min(1, Math.sin(t * Math.PI) ** 0.6 * (0.55 + 0.45 * Math.abs(Math.sin(t * Math.PI * 8))));
});

const DURATION = 205; // 3:25

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

/**
 * Streamed rather than bundled: the kit ships no audio, and nothing about this
 * track is precomputed. Kevin MacLeod's "Funky Chunk", CC BY 3.0, served by
 * Wikimedia with `Access-Control-Allow-Origin` - which the analyser requires,
 * since cross-origin media taints the graph and reads as silence. Something
 * with a backbeat on purpose: this is the example that has to prove the bar is
 * moving with the music rather than on a timer.
 */
const TRACK_URL =
  'https://upload.wikimedia.org/wikipedia/commons/a/a2/Funky_Chunk_%28ISRC_USUAN1500054%29.mp3';

/**
 * The whole card, driving a real track.
 *
 * None of the transport is simulated: the position comes off the element, the
 * bar seeks it, and `useBeat` reads a Web Audio analyser on that same element
 * to find the hits the seek bar deforms on. The card knows nothing about any of
 * it - `beat` arrives as a prop, the way `duration` does.
 */
function FullPlayer() {
  const t = useT();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [meter, setMeter] = useState<LoudnessMeter | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<PlayerRepeat>('off');

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

  const seek = useCallback((seconds: number) => {
    setPosition(seconds);
    if (audioRef.current) audioRef.current.currentTime = seconds;
  }, []);

  const toggle = useCallback((next: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (next) {
      // Built here, inside the click on the card's own play button: an
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
      <PlayerCard
        layout="inline"
        artwork={artwork}
        title={t(m.playerDemoTitle)}
        subtitle={t(m.playerDemoArtist)}
        album={t(m.playerDemoAlbum)}
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
        beat={beat}
      />
      <Text size={Size.XSmall} tone={TextTone.Subtle}>
        {t(m.seekFunkCredit)}
      </Text>
    </Stack>
  );
}

export function PlayerCardPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.playerName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.playerLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="player-card" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.playerEx1Title)}
        description={prose(t(m.playerEx1Desc))}
        code={`// the analyser has to be built inside the gesture that starts playback
const beat = useBeat({ meter, active: playing, at: position / duration });

const toggle = (next: boolean) => {
  if (next) {
    setMeter(() => createAnalyserMeter(audioRef.current).meter);
    void audioRef.current.play();
  } else {
    audioRef.current.pause();
  }
  setPlaying(next);
};

<audio ref={audioRef} src={track} crossOrigin="anonymous" preload="metadata" />
<PlayerCard
  layout="inline"
  artwork={<Image src={cover} alt="" aspectRatio={1} radius="md" />}
  title="Funky Chunk"
  subtitle="Kevin MacLeod"
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
  beat={beat}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <FullPlayer />
        </div>
      </Example>

      <Example
        title={t(m.playerEx2Title)}
        description={prose(t(m.playerEx2Desc))}
        component="PlayerCard"
        code={`{/* just a transport: no shuffle, no repeat, no skip */}
<PlayerCard duration={205} defaultValue={84} />

{/* add skip by handing it handlers */}
<PlayerCard duration={205} defaultValue={84} onSkipBack={prev} onSkipForward={next} />`}
        render={(K) => (
          <Stack gap={5} width="full" maxWidth="sm">
            <K.PlayerCard duration={DURATION} defaultValue={84} />
            <K.PlayerCard
              duration={DURATION}
              defaultValue={84}
              title={t(m.playerDemoTitle)}
              onSkipBack={() => undefined}
              onSkipForward={() => undefined}
            />
          </Stack>
        )}
      />

      <Example
        title={t(m.playerEx3Title)}
        description={prose(t(m.playerEx3Desc))}
        component="PlayerCard"
        code={`<PlayerCard duration={205} defaultValue={84} shape="bars" levels={levels} tone="success" />
<PlayerCard duration={205} defaultValue={84} shape="mirror" levels={levels} fill="blend" />`}
        render={(K) => (
          <Stack gap={5} width="full" maxWidth="sm">
            <K.PlayerCard
              duration={DURATION}
              defaultValue={84}
              shape="bars"
              levels={LEVELS}
              tone="success"
              defaultShuffle={false}
              onShuffleChange={() => undefined}
            />
            <K.PlayerCard duration={DURATION} defaultValue={84} shape="mirror" levels={LEVELS} fill="blend" />
          </Stack>
        )}
      />

      <Example
        title={t(m.playerEx4Title)}
        description={t(m.playerEx4Desc)}
        component="PlayerCard"
        code={`<PlayerCard duration={205} defaultValue={84} title="…" onSkipBack={prev} onSkipForward={next} disabled />

{/* pass the same handlers so the placeholder holds the real transport */}
<PlayerCard duration={205} title="…" onSkipBack={prev} onSkipForward={next} skeleton />`}
        render={(K) => (
          <Stack gap={5} width="full" maxWidth="sm">
            <K.PlayerCard
              duration={DURATION}
              defaultValue={84}
              title={t(m.playerDemoTitle)}
              subtitle={t(m.playerDemoArtist)}
              onSkipBack={() => undefined}
              onSkipForward={() => undefined}
              onShuffleChange={() => undefined}
              onRepeatChange={() => undefined}
              disabled
            />
            {/* the same controls, so the placeholder stands in for the real
                player rather than a lone dot */}
            <K.PlayerCard
              duration={DURATION}
              title={t(m.playerDemoTitle)}
              subtitle={t(m.playerDemoArtist)}
              onSkipBack={() => undefined}
              onSkipForward={() => undefined}
              onShuffleChange={() => undefined}
              onRepeatChange={() => undefined}
              skeleton
            />
          </Stack>
        )}
      />

      <Example
        title={t(m.playerEx5Title)}
        description={prose(t(m.playerEx5Desc))}
        component="PlayerCard"
        code={`<PlayerCard layout="stacked" artwork={art} title="…" duration={205} defaultValue={84} />
<PlayerCard layout="inline"  artwork={art} title="…" subtitle="artist" album="album" duration={205} defaultValue={84} />
<PlayerCard layout="square"  artwork={art} duration={205} defaultValue={84} />
<PlayerCard layout="bar"     artwork={art} title="…" subtitle="artist" duration={205} defaultValue={84} />`}
        render={(K) => (
          <Stack gap={5} width="full">
            <Stack gap={5} width="full" maxWidth="md">
              <K.PlayerCard
                layout="stacked"
                artwork={artwork}
                title={t(m.playerDemoTitle)}
                subtitle={t(m.playerDemoArtist)}
                album={t(m.playerDemoAlbum)}
                duration={DURATION}
                defaultValue={84}
                levels={LEVELS}
                onSkipBack={() => undefined}
                onSkipForward={() => undefined}
              />
              <K.PlayerCard
                layout="inline"
                artwork={artwork}
                title={t(m.playerDemoTitle)}
                subtitle={t(m.playerDemoArtist)}
                album={t(m.playerDemoAlbum)}
                duration={DURATION}
                defaultValue={84}
                levels={LEVELS}
                onSkipBack={() => undefined}
                onSkipForward={() => undefined}
              />
              <div style={{ maxWidth: '17rem' }}>
                <K.PlayerCard
                  layout="square"
                  artwork={artwork}
                  duration={DURATION}
                  defaultValue={84}
                  levels={LEVELS}
                  onSkipBack={() => undefined}
                  onSkipForward={() => undefined}
                />
              </div>
            </Stack>
            {/* the bar wants the full width the others are held back from */}
            <K.PlayerCard
              layout="bar"
              artwork={artwork}
              title={t(m.playerDemoTitle)}
              subtitle={t(m.playerDemoArtist)}
              duration={DURATION}
              defaultValue={84}
              levels={LEVELS}
              onSkipBack={() => undefined}
              onSkipForward={() => undefined}
              onShuffleChange={() => undefined}
              onRepeatChange={() => undefined}
            />
          </Stack>
        )}
      />

      <Example
        title={t(m.playerEx6Title)}
        description={prose(t(m.playerEx6Desc))}
        component="PlayerCard"
        code={`<PlayerCard density="compact"     duration={205} defaultValue={84} />
<PlayerCard density="comfortable" duration={205} defaultValue={84} />
<PlayerCard density="spacious"    duration={205} defaultValue={84} />`}
        render={(K) => (
          <Stack gap={5} width="full" maxWidth="sm">
            {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
              <K.PlayerCard
                key={d}
                density={d}
                title={d}
                duration={DURATION}
                defaultValue={84}
                levels={LEVELS}
                onSkipBack={() => undefined}
                onSkipForward={() => undefined}
                onShuffleChange={() => undefined}
                onRepeatChange={() => undefined}
              />
            ))}
          </Stack>
        )}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'artwork', type: 'ReactNode', description: t(m.playerPropArtwork) },
          { name: 'layout', type: "'stacked' | 'inline' | 'square' | 'bar'", default: "'stacked'", description: t(m.playerPropLayout) },
          { name: 'density', type: "'compact' | 'comfortable' | 'spacious'", default: "'comfortable'", description: t(m.playerPropDensity) },
          { name: 'title', type: 'ReactNode', description: t(m.playerPropTitle) },
          { name: 'subtitle', type: 'ReactNode', description: t(m.playerPropSubtitle) },
          { name: 'album', type: 'ReactNode', description: t(m.playerPropAlbum) },
          { name: 'duration', type: 'number', description: t(m.playerPropDuration) },
          { name: 'value', type: 'number', description: t(m.playerPropValue) },
          { name: 'defaultValue', type: 'number', default: '0', description: t(m.seekPropDefaultValue) },
          { name: 'onValueChange', type: '(seconds: number) => void', description: t(m.seekPropOnValueChange) },
          { name: 'onSeekEnd', type: '(seconds: number) => void', description: t(m.seekPropOnSeekEnd) },
          { name: 'playing', type: 'boolean', description: t(m.playerPropPlaying) },
          { name: 'defaultPlaying', type: 'boolean', default: 'false', description: t(m.playerPropPlaying) },
          { name: 'onPlayingChange', type: '(playing: boolean) => void', description: t(m.playerPropOnPlayingChange) },
          { name: 'onSkipBack', type: '() => void', description: t(m.playerPropSkip) },
          { name: 'onSkipForward', type: '() => void', description: t(m.playerPropSkip) },
          { name: 'shuffle', type: 'boolean', description: t(m.playerPropShuffle) },
          { name: 'onShuffleChange', type: '(on: boolean) => void', description: t(m.playerPropShuffle) },
          { name: 'repeat', type: "'off' | 'all' | 'one'", description: t(m.playerPropRepeat) },
          { name: 'onRepeatChange', type: '(mode) => void', description: t(m.playerPropRepeat) },
          { name: 'shape / tone / fill / levels / beat / intensity / tracer', type: 'SeekBar props', description: t(m.playerPropSeek) },
          { name: 'formatTime', type: '(seconds: number) => string', description: t(m.playerPropFormatTime) },
          { name: 'labels', type: 'Partial<PlayerCardLabels>', description: t(m.playerPropLabels) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.seekPropDisabled) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.playerPropSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.playerA11y1))}</li>
        <li>{prose(t(m.playerA11y2))}</li>
        <li>{prose(t(m.playerA11y3))}</li>
        <li>{prose(t(m.playerA11y4))}</li>
      </ul>
    </>
  );
}
