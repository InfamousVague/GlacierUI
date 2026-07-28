import { formatDuration, type ChatAttachment } from '@glacier/logic';
import { Film, Play } from '@glacier/icons';
import type { ComponentProps, CSSProperties } from 'react';
import { attachmentAspect, attachmentLabel } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the spec is registered.
import type { videoBadgePlacements } from '../../../../spec/src/components/video-attachment.ts';
import { cx } from '../../internal/cx.ts';
import { format } from '../../i18n/locale.ts';
import { Image } from '../../atoms/display/Image/Image.tsx';
import styles from './Attachments.module.css';

/** Derived from the spec so the placement union cannot drift. */
export type VideoBadgePlacement = (typeof videoBadgePlacements)[number];

/** Every string the frame can speak. */
export interface VideoAttachmentLabels {
  /** Spoken when there is neither alt text nor a file name. */
  video: string;
  /** The play action, with a `{name}` slot. */
  play: string;
}

const DEFAULT_LABELS: VideoAttachmentLabels = {
  video: 'Video',
  play: 'Play {name}',
};

export interface VideoAttachmentProps
  extends Omit<ComponentProps<'button'>, 'children' | 'onClick' | 'type'> {
  /** The attachment; its width, height, and durationMs drive the frame and badge. */
  attachment: ChatAttachment;
  /** Poster frame URL. */
  poster?: string;
  /** What the sender said the video is. */
  alt?: string;
  /** Called when the play affordance is activated. Playback itself is the app's. */
  onPlay?: () => void;
  /** Which bottom corner the duration badge sits in. */
  badge?: VideoBadgePlacement;
  /** The poster is still on its way; the box is already reserved. */
  loading?: boolean;
  /** Caps the frame width, e.g. a bubble's content width. */
  maxWidth?: string | number;
  /** Formats the badge. Defaults to m:ss, or h:mm:ss past an hour. */
  formatTime?: (seconds: number) => string;
  /** Overrides the spoken strings; merged over the English defaults. */
  labels?: Partial<VideoAttachmentLabels>;
}

/**
 * A video sent in a message, at rest: the poster frame, how long it runs, and
 * one way to start it. Playback is deliberately out of scope — a design system
 * that ships a `<video>` element ships an opinion about buffering, codecs, and
 * picture-in-picture that no two apps share — so this hands `onPlay` back and
 * stops.
 *
 * The whole frame is the button rather than a play triangle floating over a
 * clickable poster: those are two targets for one intent, and the small one is
 * always the one under the thumb.
 */
export function VideoAttachment({
  attachment,
  poster,
  alt,
  onPlay,
  badge = 'end',
  loading = false,
  maxWidth,
  formatTime = formatDuration,
  labels,
  className,
  style,
  ...rest
}: VideoAttachmentProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const { ratio, clamped } = attachmentAspect(attachment.width, attachment.height);
  const name = attachmentLabel(attachment, text.video, alt);
  const seconds = attachment.durationMs != null ? attachment.durationMs / 1000 : undefined;
  const running = seconds != null ? formatTime(seconds) : undefined;

  const frameStyle: CSSProperties = {
    aspectRatio: String(ratio),
    maxWidth,
    ...style,
  };

  return (
    <button
      type="button"
      className={cx(styles.frame, styles.videoFrame, styles.trigger, styles['radius-lg'], className)}
      style={frameStyle}
      data-clamped={clamped || undefined}
      data-loading={loading || undefined}
      // The name says what will happen and to what, so a transcript of five
      // videos is not five buttons called "Play". The running time rides along
      // because it is the other thing a listener decides on.
      aria-label={format(text.play, { name: running ? `${name}, ${running}` : name })}
      onClick={onPlay}
      {...rest}
    >
      {poster != null ? (
        <Image className={styles.image} src={poster} alt="" fit="cover" radius="none" skeleton={loading} />
      ) : (
        // No poster is not a hole: a muted slate says "video" at the same
        // geometry the frame already reserved.
        <span className={styles.posterFallback} aria-hidden="true">
          <Film size={28} />
        </span>
      )}
      <span className={styles.play} aria-hidden="true">
        <Play size={22} fill="currentColor" />
      </span>
      {running != null && (
        // Decorative: it is already folded into the button's name above.
        <span className={styles.badge} data-placement={badge} aria-hidden="true">
          {running}
        </span>
      )}
    </button>
  );
}
