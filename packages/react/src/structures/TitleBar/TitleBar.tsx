import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './TitleBar.module.css';

export interface TitleBarProps extends Omit<ComponentProps<'header'>, 'title'> {
  /** One-line centered title, small and muted. It truncates instead of wrapping. */
  title?: ReactNode;
  /** Content pinned to the start, after the traffic-light gutter. Stays clickable. */
  start?: ReactNode;
  /** Content pinned to the end, such as window-level actions. Stays clickable. */
  end?: ReactNode;
  /**
   * Reserve an 88px inline-start gutter for the macOS close, minimize, and
   * zoom buttons that a titleBarStyle Overlay window paints over the bar.
   */
  trafficLightInset?: boolean;
  /** The translucent glass background with backdrop blur, like the app header. */
  surface?: boolean;
  /** A bottom hairline separating the bar from the window content. */
  border?: boolean;
  /** Renders a placeholder with the bar's exact geometry. */
  skeleton?: boolean;
  /** Extra centered content beside the title, such as a search field. */
  children?: ReactNode;
}

/**
 * The desktop window bar for Tauri and Electron shells: the fixed-height strip
 * at the very top of the window. It owns window dragging, centers a one-line
 * title (plus any children, such as a search field), and can reserve the
 * gutter where macOS paints its window controls.
 *
 * data-tauri-drag-region is a plain string attribute: Tauri starts a window
 * drag on mousedown when the pressed element itself carries it, and the
 * attribute is inert everywhere else (Electron, the browser). Only the bar
 * root and the title get it; interactive slot children do not, so their
 * buttons keep receiving clicks. -webkit-app-region is intentionally not
 * used, since the kit targets Tauri's attribute model.
 */
export function TitleBar({
  title,
  start,
  end,
  trafficLightInset = false,
  surface = true,
  border = true,
  skeleton = false,
  role = 'banner',
  className,
  children,
  ...rest
}: TitleBarProps) {
  if (skeleton) {
    // Same element, height, padding, and regions as the live bar, with a text
    // shimmer where the title sits. The drag attribute stays, so the window
    // remains draggable while content loads; the default banner role is
    // dropped because the placeholder is decorative (aria-hidden).
    return (
      <header
        className={cx(styles.bar, className)}
        data-inset={trafficLightInset || undefined}
        data-surface={surface || undefined}
        data-border={border || undefined}
        data-tauri-drag-region=""
        aria-hidden="true"
        {...rest}
      >
        <div className={styles.slot} />
        <div className={styles.center}>
          <Skeleton variant="text" width="8rem" />
        </div>
        <div className={cx(styles.slot, styles.endSlot)} />
      </header>
    );
  }

  return (
    <header
      className={cx(styles.bar, className)}
      role={role}
      data-inset={trafficLightInset || undefined}
      data-surface={surface || undefined}
      data-border={border || undefined}
      data-tauri-drag-region=""
      {...rest}
    >
      <div className={styles.slot}>{start}</div>
      <div className={styles.center}>
        {title && (
          <div className={styles.title} data-tauri-drag-region="">
            {title}
          </div>
        )}
        {children}
      </div>
      <div className={cx(styles.slot, styles.endSlot)}>{end}</div>
    </header>
  );
}
