import { useEffect, useState } from 'react';
import {
  Avatar,
  HapticsProvider,
  IconButton,
  Kbd,
  LocaleProvider,
  NavBar,
  NavBarItem,
  SearchField,
  TitleBar,
  ToastProvider,
  VisualFeedbackProvider,
  direction,
  useToast,
} from '@glacier/react';
import { Bell, Info, Library, LayoutDashboard, PanelLeft, Settings } from '@glacier/icons';
import {
  applyPreferences,
  loadPreferences,
  savePreferences,
  type Preferences,
} from './preferences.ts';
import { useT } from './i18n.ts';
import { useRoute, type Route } from './router.ts';
import { isTauri } from './tauri.ts';
import { RouteSidebar } from './RouteSidebar.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LibraryPage } from './pages/LibraryPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { SettingsModal } from './SettingsModal.tsx';

const APP_NAME = 'Glacier Starter';

// Window chrome (title bar + traffic lights) only makes sense as a desktop
// window, so it is off in the browser and on under Tauri.
const DESKTOP = isTauri();

const SIDEBAR_LABEL: Record<Route, 'navDashboard' | 'navLibrary' | 'navAbout'> = {
  dashboard: 'navDashboard',
  library: 'navLibrary',
  about: 'navAbout',
};

/**
 * The sidebar toggle that lives in the title bar, just after the traffic
 * lights. Clicking it collapses or expands the contextual sidebar. While the
 * sidebar is collapsed, hovering the button reveals a floating preview of it
 * (the same RouteSidebar), so it stays reachable without expanding, exactly
 * like Libre. The preview is a pure-CSS hover flyout: it and the button share
 * one hover region, so moving the pointer into the preview keeps it open.
 */
function SidebarToggle({
  route,
  collapsed,
  onToggle,
}: {
  route: Route;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const t = useT();
  const [hovering, setHovering] = useState(false);
  const previewOpen = collapsed && hovering;
  return (
    <div
      className="sidebarToggleWrap"
      data-no-drag
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <IconButton variant="ghost" size="sm" aria-label={t('toggleSidebar')} onClick={onToggle}>
        <PanelLeft size={18} />
      </IconButton>
      <div className="sidebarPreview" data-open={previewOpen || undefined} aria-hidden={!previewOpen}>
        <div className="sidebarPreviewCard">
          <RouteSidebar key={route} route={route} desktop={false} />
        </div>
      </div>
    </div>
  );
}

/**
 * The far-left activity rail: an icon-only vertical NavBar that switches the
 * top-level route, with Settings pinned to the bottom via the end slot. The
 * contextual sidebar to its right reacts to the selected route.
 */
function AppRail({
  route,
  onNavigate,
  onOpenSettings,
}: {
  route: Route;
  onNavigate: (route: Route) => void;
  onOpenSettings: () => void;
}) {
  const t = useT();
  return (
    <NavBar
      orientation="vertical"
      aria-label={t('navPrimary')}
      className="appRail"
      end={
        <NavBarItem icon={<Settings size={20} />} label={t('navSettings')} onClick={onOpenSettings} />
      }
    >
      <NavBarItem
        icon={<LayoutDashboard size={20} />}
        label={t('navDashboard')}
        active={route === 'dashboard'}
        onClick={() => onNavigate('dashboard')}
      />
      <NavBarItem
        icon={<Library size={20} />}
        label={t('navLibrary')}
        active={route === 'library'}
        onClick={() => onNavigate('library')}
      />
      <NavBarItem
        icon={<Info size={20} />}
        label={t('navAbout')}
        active={route === 'about'}
        onClick={() => onNavigate('about')}
      />
    </NavBar>
  );
}

function Shell({
  preferences,
  onPreferencesChange,
}: {
  preferences: Preferences;
  onPreferencesChange: (patch: Partial<Preferences>) => void;
}) {
  const t = useT();
  const { toast } = useToast();
  const [route, navigate] = useRoute();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const page =
    route === 'dashboard' ? <DashboardPage /> : route === 'library' ? <LibraryPage /> : <AboutPage />;

  // A hand-composed desktop shell (like Libre): a full-width title bar across
  // the top, then a body row of the activity rail, the contextual sidebar, and
  // a content column that scrolls on its own. The title bar is window chrome,
  // so it is desktop-only.
  // The sidebar can only be collapsed where there is a toggle to reopen it (the
  // desktop title bar), so the web build always keeps it open.
  const collapsed = DESKTOP && preferences.sidebarCollapsed;

  return (
    <div className="appWindow" data-layout={preferences.layout} data-sidebar={collapsed ? 'collapsed' : 'open'}>
      {DESKTOP && (
        // The window title bar doubles as an app header: a sidebar toggle after
        // the traffic lights, a mock command search in the center, and account
        // details on the end. Every interactive child opts out of the drag
        // region.
        <TitleBar
          className="appTitleBar titleBarDrag"
          data-tauri-drag-region
          surface
          border
          trafficLightInset
          start={
            <SidebarToggle
              route={route}
              collapsed={preferences.sidebarCollapsed}
              onToggle={() => onPreferencesChange({ sidebarCollapsed: !preferences.sidebarCollapsed })}
            />
          }
          end={
            <div className="titleBarActions" data-no-drag>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={t('notifications')}
                onClick={() => toast({ tone: 'neutral', message: t('caughtUp') })}
              >
                <Bell size={18} />
              </IconButton>
              <Avatar name="Ada Lovelace" size="sm" />
            </div>
          }
        >
          <div className="titleBarSearch" data-no-drag>
            <SearchField size="sm" placeholder={t('searchPlaceholder')} shortcut={<Kbd>⌘K</Kbd>} />
          </div>
        </TitleBar>
      )}
      <div className="appBody">
        <AppRail route={route} onNavigate={navigate} onOpenSettings={() => setSettingsOpen(true)} />
        <aside className="appSidebar" aria-label={t(SIDEBAR_LABEL[route])}>
          {/* keyed on the route so the mock selection resets per section */}
          <RouteSidebar key={route} route={route} desktop={DESKTOP} />
        </aside>
        <main className="appContent">{page}</main>
      </div>
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        preferences={preferences}
        onChange={onPreferencesChange}
      />
    </div>
  );
}

/**
 * The application root: persisted preferences drive the token look (stamped on
 * the document element) and the active language (through LocaleProvider, which
 * localizes the kit components and, for the app's own strings, backs useT). The
 * cross-cutting providers wrap the whole tree.
 */
export function App() {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);

  useEffect(() => {
    applyPreferences(preferences);
    savePreferences(preferences);
  }, [preferences]);

  // The document language and writing direction follow the locale, so a
  // right-to-left language (Arabic) flips the whole shell.
  useEffect(() => {
    document.documentElement.lang = preferences.locale;
    document.documentElement.dir = direction(preferences.locale);
  }, [preferences.locale]);

  const update = (patch: Partial<Preferences>) => setPreferences((prev) => ({ ...prev, ...patch }));

  return (
    <LocaleProvider locale={preferences.locale}>
      <HapticsProvider enabled={preferences.haptics}>
        <VisualFeedbackProvider
          enabled={preferences.visualFeedback}
          variant={preferences.visualFeedbackVariant}
          intensity={preferences.visualFeedbackIntensity}
        >
          <ToastProvider>
            <Shell preferences={preferences} onPreferencesChange={update} />
          </ToastProvider>
        </VisualFeedbackProvider>
      </HapticsProvider>
    </LocaleProvider>
  );
}
