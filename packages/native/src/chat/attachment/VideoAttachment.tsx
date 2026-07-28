// VideoAttachment — the native binding of @glacier/react's VideoAttachment.
//
// A video at rest: the poster frame in a box reserved from the attachment's
// intrinsic size, one play affordance, and the running time. The clamp and the
// clock come from @glacier/logic (`attachmentAspect`, `formatDuration`), the
// same functions the DOM kit calls.
//
// Resting visuals only: the web brightens the play control on hover and dips it
// on press — there is no hover on a touch device and no animation runtime here,
// so the control paints its rest fill.

import { View, Text, Pressable, type ViewProps } from 'react-native';
import { Film, Play } from '@glacier/icons';
import { formatDuration, type ChatAttachment } from '@glacier/logic';
import { attachmentAspect, attachmentLabel } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the spec is registered.
import { videoAttachmentSpec, videoBadgePlacements } from '../../../../spec/src/components/video-attachment.ts';
import { t } from '../../tokens.ts';
import { dimensionsFor } from '../../resolve.ts';
import { Image } from '../../atoms/display/Image.tsx';

// Derived from the spec so the placement union cannot drift from the web kit.
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

export interface VideoAttachmentProps extends Omit<ViewProps, 'children' | 'style'> {
  attachment: ChatAttachment;
  poster?: string;
  alt?: string;
  /** Called when the play affordance is activated. Playback itself is the app's. */
  onPlay?: () => void;
  badge?: VideoBadgePlacement;
  loading?: boolean;
  maxWidth?: number | string;
  formatTime?: (seconds: number) => string;
  labels?: Partial<VideoAttachmentLabels>;
}

// Size-independent metrics read once from the spec.
const BOX = dimensionsFor(videoAttachmentSpec);
const FRAME_BG = t((videoAttachmentSpec.paint?.background ?? '$surface-sunken').replace(/^\$/, ''));

/** Interpolates `{name}` placeholders, matching the kit catalog's `format`. */
function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  );
}

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
  ...rest
}: VideoAttachmentProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const { ratio } = attachmentAspect(attachment.width, attachment.height);
  const name = attachmentLabel(attachment, text.video, alt);
  const seconds = attachment.durationMs != null ? attachment.durationMs / 1000 : undefined;
  const running = seconds != null ? formatTime(seconds) : undefined;
  const inset = t(BOX.badgeInset ?? 'space-2');

  return (
    <Pressable
      {...rest}
      // The whole frame is the button, not a play triangle floating over a
      // tappable poster: those are two targets for one intent, and the small one
      // is always the one under the thumb.
      accessibilityRole="button"
      aria-label={interpolate(text.play, { name: running ? `${name}, ${running}` : name })}
      onPress={onPlay}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth,
        aspectRatio: ratio,
        overflow: 'hidden',
        backgroundColor: FRAME_BG,
        borderRadius: t(BOX.radius ?? 'radius-lg'),
      }}
    >
      {poster != null ? (
        <Image
          src={poster}
          alt=""
          fit="cover"
          radius="none"
          skeleton={loading}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: '100%' }}
        />
      ) : (
        // No poster is not a hole: a muted slate says "video" at the same
        // geometry the frame already reserved.
        <View
          aria-hidden={true}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Film size={28} color={t('text-subtle')} />
        </View>
      )}
      {/* Centred by an overlay rather than a -50% translate: the token is a
          `rem` expression, so there is no pixel number to halve. */}
      <View
        aria-hidden={true}
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: t('size-3xl'),
            height: t('size-3xl'),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: t('radius-full'),
            backgroundColor: t('glass-thick'),
          }}
        >
          <Play size={22} color={t('text')} fill={t('text')} />
        </View>
      </View>
      {running != null && (
        // Decorative: it is already folded into the button's name above.
        <View
          aria-hidden={true}
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: inset,
            ...(badge === 'start' ? { left: inset } : { right: inset }),
            paddingHorizontal: t(BOX.badgePaddingInline ?? 'space-2'),
            borderRadius: t(BOX.badgeRadius ?? 'radius-full'),
            backgroundColor: t('glass-thick'),
          }}
        >
          <Text
            style={{
              color: t('text'),
              fontFamily: t('font-mono'),
              fontSize: t('font-size-xs') as never,
              fontVariant: ['tabular-nums'],
            }}
          >
            {running}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
