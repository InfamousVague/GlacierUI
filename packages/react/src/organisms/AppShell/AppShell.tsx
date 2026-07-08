import { useEffect, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { Variant } from '@glacier/spec';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import styles from './AppShell.module.css';

export interface AppShellProps {
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
  children,
}: AppShellProps) {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const closeOnNav = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) setOpen(false);
  };

  return (
    <div
      className={styles.shell}
      data-floating={floating ? '' : undefined}
      style={{ '--shell-sidebar': sidebarWidth } as CSSProperties}
    >
      <aside
        aria-label={sidebarLabel}
        className={styles.sidebar}
        data-open={open ? '' : undefined}
        onClick={closeOnNav}
      >
        {sidebar}
      </aside>
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
