import {
  Button,
  Callout,
  Heading,
  Row,
  SeekBar,
  Stack,
  Text,
  TextTone,
  Size,
  Variant,
  createAnalyserMeter,
  useT,
} from '@glacier/react';
import { useLiveLevels, type LoudnessMeter } from '@glacier/logic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * An illustrative level series for the static shape examples - a slow swell
 * with a ripple over it. The live demo below measures real audio instead; this
 * only exists so the shapes can be compared against identical input.
 */
const LEVEL_COUNT = 56;
const LEVELS = Array.from({ length: LEVEL_COUNT }, (_unused, i) => {
  const t = i / (LEVEL_COUNT - 1);
  const envelope = Math.sin(t * Math.PI) ** 0.6;
  const ripple = 0.55 + 0.45 * Math.abs(Math.sin(t * Math.PI * 9));
  return Math.min(1, envelope * ripple);
});

const DURATION = 174; // 2:54, a typical track

/**
 * Streamed rather than bundled: the kit ships no audio, and nothing about this
 * track is precomputed. Musopen's recording of Albinoni's Oboe Concerto No. 2,
 * public domain (CC0), served by Wikimedia with `Access-Control-Allow-Origin`,
 * which the analyser requires - cross-origin media taints the graph and reads
 * as silence.
 */
const TRACK_URL =
  'https://upload.wikimedia.org/wikipedia/commons/3/38/Albinoni%2C_Concerto_for_Oboe_and_Strings_No._2_in_D_minor%2C_Op._9%2C_III._Allegro.ogg';

function format(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/**
 * The waveform, measured as it plays.
 *
 * Nothing here knows the shape of the track in advance: `useLiveLevels` samples
 * the analyser on a timer and writes each reading into the bucket under the
 * playhead, so the waveform draws itself as the audio is heard.
 */
function LiveAudioDemo() {
  const t = useT();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [meter, setMeter] = useState<LoudnessMeter | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  const progress = duration > 0 ? position / duration : 0;
  const levels = useLiveLevels({ meter, progress, active: playing });

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

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }
    // Built here, inside the click: an AudioContext created before the first
    // user gesture starts suspended, and on WebKit never recovers.
    setMeter(() => createAnalyserMeter(audio).meter);
    void audio.play();
    setPlaying(true);
  }, []);

  const seek = useCallback((seconds: number) => {
    setPosition(seconds);
    if (audioRef.current) audioRef.current.currentTime = seconds;
  }, []);

  return (
    <Stack gap={4} width="full" maxWidth="sm">
      {/* crossOrigin is what keeps the analyser readable; without it the graph
          is tainted and every reading comes back silent */}
      <audio ref={audioRef} src={TRACK_URL} crossOrigin="anonymous" preload="metadata" />
      <Row gap={4}>
        <Button variant={Variant.Soft} onClick={toggle}>
          {playing ? t(m.seekPause) : t(m.seekPlay)}
        </Button>
        <Stack gap={2} grow>
          <SeekBar
            duration={duration}
            value={position}
            onValueChange={seek}
            shape="waveform"
            levels={levels}
            aria-label={t(m.seekDemoLabel)}
          />
          <Row justify="between">
            <Text as="span" size={Size.XSmall} tone={TextTone.Muted} mono>
              {format(position)}
            </Text>
            <Text as="span" size={Size.XSmall} tone={TextTone.Subtle} mono>
              {format(duration)}
            </Text>
          </Row>
        </Stack>
      </Row>
      <SeekBar
        duration={duration}
        value={position}
        onValueChange={seek}
        shape="bars"
        levels={levels}
        aria-label={t(m.seekDemoLabel)}
      />
      <Text size={Size.XSmall} tone={TextTone.Subtle}>
        {t(m.seekAudioCredit)}
      </Text>
    </Stack>
  );
}

/** A worked transport: the bar drives a position readout. */
function PlayerDemo() {
  const t = useT();
  const [position, setPosition] = useState(84); // 1:24
  return (
    <Stack gap={2} width="full" maxWidth="sm">
      <SeekBar
        duration={DURATION}
        value={position}
        onValueChange={setPosition}
        shape="wave"
        aria-label={t(m.seekDemoLabel)}
      />
      <Row justify="between">
        <Text as="span" size={Size.Small} tone={TextTone.Muted} mono>
          {format(position)}
        </Text>
        <Text as="span" size={Size.Small} tone={TextTone.Subtle} mono>
          {format(DURATION)}
        </Text>
      </Row>
    </Stack>
  );
}

export function SeekBarPage() {
  const t = useT();
  const label = t(m.seekDemoLabel);
  return (
    <>
      <Heading level={1}>{t(m.seekName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.seekLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="seek-bar" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.seekEx1Title)}
        description={prose(t(m.seekEx1Desc))}
        component="SeekBar"
        code={`{/* smooth */}
<SeekBar duration={174} defaultValue={84} shape="line" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="wave" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="waveform" levels={levels} aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="swell" aria-label="Seek" />
{/* sharp */}
<SeekBar duration={174} defaultValue={84} shape="zigzag" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="spikes" levels={levels} aria-label="Seek" />
{/* level marks */}
<SeekBar duration={174} defaultValue={84} shape="bars" levels={levels} aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="mirror" levels={levels} aria-label="Seek" />`}
        render={(K) => (
          <Stack gap={5} width="full" maxWidth="sm">
            <K.SeekBar duration={DURATION} defaultValue={84} shape="line" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="wave" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="waveform" levels={LEVELS} aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="swell" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="zigzag" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="spikes" levels={LEVELS} aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="bars" levels={LEVELS} aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="mirror" levels={LEVELS} aria-label={label} />
          </Stack>
        )}
      />

      <Example
        title={t(m.seekEx7Title)}
        description={prose(t(m.seekEx7Desc))}
        code={`// The waveform is measured, never bundled. useLiveLevels samples the
// meter on a timer and records each reading into the bucket under the
// playhead, so the picture fills in as the track is heard.
const [meter, setMeter] = useState<LoudnessMeter | null>(null);
const levels = useLiveLevels({ meter, progress, active: playing });

// createAnalyserMeter must run inside the click that starts playback: an
// AudioContext built before the first gesture starts suspended.
const play = () => {
  setMeter(() => createAnalyserMeter(audio).meter);
  void audio.play();
};

<SeekBar duration={duration} value={position} onValueChange={seek}
  shape="waveform" levels={levels} aria-label="Seek" />`}
      >
        <LiveAudioDemo />
      </Example>

      <Example
        title={t(m.seekEx2Title)}
        description={prose(t(m.seekEx2Desc))}
        component="SeekBar"
        code={`<SeekBar duration={174} defaultValue={30} shape="wave" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="wave" aria-label="Seek" />
<SeekBar duration={174} defaultValue={150} shape="wave" aria-label="Seek" />

{/* swell builds to full height at the playhead instead of running even */}
<SeekBar duration={174} defaultValue={30} shape="swell" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="swell" aria-label="Seek" />
<SeekBar duration={174} defaultValue={150} shape="swell" aria-label="Seek" />`}
        render={(K) => (
          <Stack gap={5} width="full" maxWidth="sm">
            <K.SeekBar duration={DURATION} defaultValue={30} shape="wave" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="wave" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={150} shape="wave" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={30} shape="swell" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="swell" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={150} shape="swell" aria-label={label} />
          </Stack>
        )}
      />

      <Example
        title={t(m.seekEx6Title)}
        description={prose(t(m.seekEx6Desc))}
        component="SeekBar"
        code={`<SeekBar duration={174} defaultValue={84} shape="zigzag" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="spikes" levels={levels} aria-label="Seek" />`}
        render={(K) => (
          <Stack gap={5} width="full" maxWidth="sm">
            <K.SeekBar duration={DURATION} defaultValue={84} shape="zigzag" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="spikes" levels={LEVELS} aria-label={label} />
          </Stack>
        )}
      />

      <Example
        title={t(m.seekEx8Title)}
        description={prose(t(m.seekEx8Desc))}
        component="SeekBar"
        code={`{/* the tone picks the family */}
<SeekBar duration={174} defaultValue={84} shape="wave" tone="accent" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="wave" tone="success" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="wave" tone="danger" aria-label="Seek" />

{/* the fill decides how it is laid down - every ramp mixes in OKLCH */}
<SeekBar duration={174} defaultValue={84} shape="wave" fill="tonal" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="wave" fill="blend" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="wave" fill="fade" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="bars" levels={levels} tone="warning" fill="blend" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="mirror" levels={levels} tone="success" fill="blend" aria-label="Seek" />`}
        render={(K) => (
          <Stack gap={5} width="full" maxWidth="sm">
            <K.SeekBar duration={DURATION} defaultValue={84} shape="wave" tone="accent" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="wave" tone="success" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="wave" tone="danger" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="wave" fill="tonal" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="wave" fill="blend" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="wave" fill="fade" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="bars" levels={LEVELS} tone="warning" fill="blend" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="mirror" levels={LEVELS} tone="success" fill="blend" aria-label={label} />
          </Stack>
        )}
      />

      <Example
        title={t(m.seekEx3Title)}
        description={prose(t(m.seekEx3Desc))}
        component="SeekBar"
        code={`const levels = [0.1, 0.4, 0.9, ...]; // normalized 0-1

<SeekBar duration={174} defaultValue={84} shape="bars" levels={levels} aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="mirror" levels={levels} aria-label="Seek" />`}
        render={(K) => (
          <Stack gap={5} width="full" maxWidth="sm">
            <K.SeekBar duration={DURATION} defaultValue={84} shape="bars" levels={LEVELS} aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="mirror" levels={LEVELS} aria-label={label} />
          </Stack>
        )}
      />

      <Example
        title={t(m.seekEx4Title)}
        description={t(m.seekEx4Desc)}
        code={`const [position, setPosition] = useState(84);

<SeekBar duration={174} value={position} onValueChange={setPosition} shape="wave" aria-label="Seek" />`}
      >
        <PlayerDemo />
      </Example>

      <Example
        title={t(m.seekEx5Title)}
        description={t(m.seekEx5Desc)}
        component="SeekBar"
        code={`<SeekBar duration={174} defaultValue={84} size="sm" shape="wave" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} size="md" shape="wave" aria-label="Seek" />
<SeekBar duration={174} defaultValue={84} shape="wave" disabled aria-label="Seek" />
<SeekBar duration={174} skeleton aria-label="Seek" />`}
        render={(K) => (
          <Stack gap={5} width="full" maxWidth="sm">
            <K.SeekBar duration={DURATION} defaultValue={84} size="sm" shape="wave" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} size="md" shape="wave" aria-label={label} />
            <K.SeekBar duration={DURATION} defaultValue={84} shape="wave" disabled aria-label={label} />
            <K.SeekBar duration={DURATION} skeleton aria-label={label} />
          </Stack>
        )}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'duration', type: 'number', description: t(m.seekPropDuration) },
          { name: 'value', type: 'number', description: t(m.seekPropValue) },
          { name: 'defaultValue', type: 'number', default: '0', description: t(m.seekPropDefaultValue) },
          { name: 'onValueChange', type: '(seconds: number) => void', description: t(m.seekPropOnValueChange) },
          { name: 'onSeekEnd', type: '(seconds: number) => void', description: t(m.seekPropOnSeekEnd) },
          {
            name: 'shape',
            type: "'line' | 'wave' | 'waveform' | 'swell' | 'zigzag' | 'spikes' | 'bars' | 'mirror'",
            default: "'swell'",
            description: t(m.seekPropShape),
          },
          {
            name: 'tone',
            type: "'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'",
            default: "'accent'",
            description: t(m.seekPropTone),
          },
          { name: 'fill', type: "'solid' | 'tonal' | 'blend' | 'fade'", default: "'solid'", description: t(m.seekPropFill) },
          { name: 'levels', type: 'number[]', description: t(m.seekPropLevels) },
          { name: 'step', type: 'number', default: '5', description: t(m.seekPropStep) },
          { name: 'formatTime', type: '(seconds: number) => string', description: t(m.seekPropFormatTime) },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t(m.seekPropSize) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.seekPropDisabled) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.seekPropSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.seekLevelsTitle)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.seekLevelsIntro))}</Text>
      <Callout>{prose(t(m.seekLevelsNative))}</Callout>
      <PropsTable
        props={[
          { name: 'useLiveLevels', type: '(options) => number[]', description: t(m.seekApiUseLiveLevels) },
          { name: 'createLevelRecorder', type: '(options) => LevelRecorder', description: t(m.seekApiRecorder) },
          { name: 'rms', type: '(samples) => number', description: t(m.seekApiRms) },
          { name: 'createAnalyserMeter', type: '(element) => AnalyserMeter', description: t(m.seekApiAnalyser) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.seekA11y1))}</li>
        <li>{prose(t(m.seekA11y2))}</li>
        <li>{prose(t(m.seekA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.seekUse1))}</li>
        <li>{prose(t(m.seekUse2))}</li>
        <li>{prose(t(m.seekUse3))}</li>
      </ul>
    </>
  );
}
