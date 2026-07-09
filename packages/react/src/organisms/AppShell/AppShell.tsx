import { useCallback, useEffect, useRef, useState, type ComponentProps, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { Variant } from '@glacier/spec';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import styles from './AppShell.module.css';

export interface AppShellProps extends ComponentProps<'div'> {
  /** The persistent side navigation. */
  sidebar: ReactNode;
  /** Optional top bar content, placed to the right of the mobile menu button. */
  header?: ReactNode;
  /** Sidebar width on desktop. Defaults to 16rem. */
  sidebarWidth?: string;
  /** Accessible name for the sidebar landmark. */
  sidebarLabel?: string;
  /** Detach the desktop sidebar into a floating, rounded card with a gutter. */
  floating?: boolean;
  /** Let the user drag the divider (or arrow-key it) to resize the sidebar. */
  resizable?: boolean;
  /** Called with the next sidebar width (a px string) while resizing. */
  onSidebarWidthChange?: (width: string) => void;
  /** Clamp for the resize drag, in pixels. */
  minSidebarWidth?: number;
  maxSidebarWidth?: number;
  children?: ReactNode;
}

const MenuIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M2.5 5h13M2.5 9h13M2.5 13h13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

/**
 * The app frame: a sticky sidebar next to a scrollable main column with an
 * optional sticky header. Below the lg breakpoint the sidebar collapses into
 * an off-canvas drawer with a built-in menu button and backdrop. Escape, the
 * backdrop, and any link or button tap inside the sidebar close the drawer.
 */
export function AppShell({
  sidebar,
  header,
  sidebarWidth = '16rem',
  sidebarLabel = 'Navigation',
  floating = false,
  resizable = false,
  onSidebarWidthChange,
  minSidebarWidth = 200,
  maxSidebarWidth = 460,
  children,
  style,
  ...rest
}: AppShellProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const closeOnNav = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) setOpen(false);
  };

  const commitWidth = useCallback(
    (px: number) => {
      const clamped = Math.round(Math.min(maxSidebarWidth, Math.max(minSidebarWidth, px)));
      onSidebarWidthChange?.(`${clamped}px`);
    },
    [minSidebarWidth, maxSidebarWidth, onSidebarWidthChange],
  );

  // Drag the divider: size the sidebar to the pointer's distance from the
  // sidebar's left edge, so it works in both the flush and floating layouts.
  function startResize(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const move = (e: globalThis.PointerEvent) => {
      const aside = asideRef.current;
      if (!aside) return;
      commitWidth(e.clientX - aside.getBoundingClientRect().left);
    };
    const up = () => {
      handle.releasePointerCapture?.(event.pointerId);
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  }

  function onResizeKey(event: KeyboardEvent<HTMLDivElement>) {
    const aside = asideRef.current;
    if (!aside) return;
    const cur = aside.getBoundingClientRect().width;
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        commitWidth(cur - 16);
        break;
      case 'ArrowRight':
        event.preventDefault();
        commitWidth(cur + 16);
        break;
      case 'Home':
        event.preventDefault();
        commitWidth(minSidebarWidth);
        break;
      case 'End':
        event.preventDefault();
        commitWidth(maxSidebarWidth);
        break;
    }
  }

  return (
    <div
      {...rest}
      className={styles.shell}
      data-floating={floating ? '' : undefined}
      style={{ '--shell-sidebar': sidebarWidth, ...style } as CSSProperties}
    >
      <aside
        ref={asideRef}
        aria-label={sidebarLabel}
        className={styles.sidebar}
        data-open={open ? '' : undefined}
        onClick={closeOnNav}
      >
        {sidebar}
      </aside>
      {resizable && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t(kitMessages.resizeSidebar)}
          tabIndex={0}
          className={styles.resizer}
          onPointerDown={startResize}
          onKeyDown={onResizeKey}
        />
      )}
      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}
      <div className={styles.main}>
        <header className={cx(styles.header)} data-empty={header ? undefined : ''}>
          <IconButton
            aria-label={t(kitMessages.openNavigation)}
            variant={Variant.Ghost}
            className={styles.menuButton}
            onClick={() => setOpen(true)}
          >
            {MenuIcon}
          </IconButton>
          {header && <div className={styles.headerContent}>{header}</div>}
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
