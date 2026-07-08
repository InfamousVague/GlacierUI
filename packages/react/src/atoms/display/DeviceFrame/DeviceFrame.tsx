import { deviceFrameSizes } from '@glacier/spec';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import styles from './DeviceFrame.module.css';

// Derived from the spec so the size union cannot drift.
export type DeviceFrameSize = (typeof deviceFrameSizes)[number];

/** Screen width per size, mirroring the .sm/.md/.lg rules in the CSS. */
const SIZE_WIDTH: Record<DeviceFrameSize, string> = {
  sm: '13.5rem',
  md: '17rem',
  lg: '21rem',
};

export interface DeviceFrameProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Preset screen width. Ignored when `width` is set. */
  size?: DeviceFrameSize;
  /** Explicit screen width, overriding `size`, e.g. `320` or `'20rem'`. */
  width?: string | number;
  /**
   * Screen aspect ratio as width / height. Defaults to a modern phone.
   * A number like `9 / 19.5`, or a CSS ratio string like `'9 / 19.5'`.
   */
  aspect?: string | number;
  /** Hides the decorative notch, for a full-bleed slab. */
  hideNotch?: boolean;
  /** Accessible label for the frame region. */
  'aria-label'?: string;
  /** The preview or iframe that fills the screen. */
  children?: ReactNode;
}

function toLength(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * A decorative phone bezel with a fixed-aspect, inset screen that hosts
 * arbitrary children - a live preview, a screenshot, or an iframe. The bezel,
 * notch, and side buttons are purely presentational and hidden from assistive
 * tech; only the screen contents carry meaning. Pick a preset `size` or set an
 * explicit `width`, and tune the screen shape with `aspect`.
 */
export function DeviceFrame({
  size = 'md',
  width,
  aspect = '9 / 19.5',
  hideNotch = false,
  className,
  style,
  children,
  ...rest
}: DeviceFrameProps) {
  const screenWidth = width !== undefined ? toLength(width) : SIZE_WIDTH[size];
  const vars = {
    '--device-frame-width': screenWidth,
    '--device-frame-aspect': String(aspect),
  } as CSSProperties;

  return (
    <div
      role="group"
      className={cx(styles.frame, className)}
      style={{ ...vars, ...style }}
      {...rest}
    >
      <div className={styles.bezel} aria-hidden="true" />
      <span className={styles.buttonSilence} aria-hidden="true" />
      <span className={styles.buttonVolumeUp} aria-hidden="true" />
      <span className={styles.buttonVolumeDown} aria-hidden="true" />
      <span className={styles.buttonPower} aria-hidden="true" />
      <div className={styles.screen}>
        {!hideNotch && (
          <div className={styles.notch} aria-hidden="true">
            <span className={styles.speaker} />
            <span className={styles.camera} />
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
