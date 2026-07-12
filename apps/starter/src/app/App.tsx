import { useEffect, useState, type ReactNode } from 'react';
import {
  AppShell,
  HapticsProvider,
  LocaleProvider,
  Sidebar,
  SidebarItem,
  SidebarSection,
  TitleBar,
  ToastProvider,
  Toolbar,
} from '@glacier/react';
import { Info, LayoutDashboard, Library, Minus, Settings, Snowflake, Square, X } from '@glacier/icons';
import {
  applyPreferences,
  loadPreferences,
  savePreferences,
  type Preferences,
} from './preferences.ts';
import { useRoute, type Route } from './router.ts';
import { closeWindow, minimizeWindow, toggleMaximizeWindow } from './tauri.ts';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LibraryPage } from './pages/LibraryPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';

const APP_NAME = 'Glacier Starter';

const NAV: { id: Route; label: string; icon: ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'library', label: 'Library', icon: <Library size={18} /> },
];

const SECONDARY: { id: Route; label: string; icon: ReactNode }[] = [
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  { id: 'about', label: 'About', icon: <Info size={18} /> },
];

const PAGE_TITLES: Record<Route, string> = {
  dashboard: 'Dashboard',
  library: 'Library',
  settings: 'Settings',
  about: 'About',
};

/** Minimize / maximize / close, wired to the Tauri window and inert in a browser. */
function WindowControls() {
  return (
    <div className="windowControls" data-no-drag>
      <button type="button" className="windowControl" aria-label="Minimize" onClick={() => void minimizeWindow()}>
        <Minus size={15} />
      </button>
      <button type="button" className="windowControl" aria-label="Maximize" onClick={() => void toggleMaximizeWindow()}>
        <Square size={13} />
      </button>
      <button type="button" className="windowControl" data-variant="close" aria-label="Close" onClick={() => void closeWindow()}>
        <X size={15} />
      </button>
    </div>
  );
}

/** The persistent left navigation. */
function AppSidebar({ route, onNavigate }: { route: Route; onNavigate: (route: Route) => void }) {
  return (
    <Sidebar
      header={
        <div className="brand">
          <span className="brandMark">
            <Snowflake size={17} />
          </span>
          {APP_NAME}
        </div>
      }
      footer={
        <SidebarSection>
          {SECONDARY.map((item) => (
            <SidebarItem key={item.id} icon={item.icon} active={route === item.id} onClick={() => onNavigate(item.id)}>
              {item.label}
            </SidebarItem>
          ))}
        </SidebarSection>
      }
    >
      <SidebarSection title="Workspace">
        {NAV.map((item) => (
          <SidebarItem key={item.id} icon={item.icon} active={route === item.id} onClick={() => onNavigate(item.id)}>
            {item.label}
          </SidebarItem>
        ))}
      </SidebarSection>
    </Sidebar>
  );
}

function Shell({
  preferences,
  onPreferencesChange,
}: {
  preferences: Preferences;
  onPreferencesChange: (patch: Partial<Preferences>) => void;
}) {
  const [route, navigate] = useRoute();

  const page =
    route === 'dashboard' ? (
      <DashboardPage />
    ) : route === 'library' ? (
      <LibraryPage />
    ) : route === 'settings' ? (
      <SettingsPage preferences={preferences} onChange={onPreferencesChange} />
    ) : (
      <AboutPage />
    );

  return (
    <div className="appRoot">
      <TitleBar
        data-tauri-drag-region
        className="titleBarDrag"
        title={APP_NAME}
        surface
        border
        end={<WindowControls />}
      />
      <AppShell
        className="appShell"
        floating={preferences.layout === 'floating'}
        sidebarLabel="Primary navigation"
        sidebar={<AppSidebar route={route} onNavigate={navigate} />}
        header={<Toolbar surface border>{PAGE_TITLES[route]}</Toolbar>}
      >
        {page}
      </AppShell>
    </div>
  );
}

/**
 * The application root: the token look-and-feel is driven by persisted
 * preferences (applied to the document element), and the kit's cross-cutting
 * providers wrap the whole tree.
 */
export function App() {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);

  useEffect(() => {
    applyPreferences(preferences);
    savePreferences(preferences);
  }, [preferences]);

  const update = (patch: Partial<Preferences>) => setPreferences((prev) => ({ ...prev, ...patch }));

  return (
    <LocaleProvider locale="en">
      <HapticsProvider enabled={preferences.haptics}>
        <ToastProvider>
          <Shell preferences={preferences} onPreferencesChange={update} />
        </ToastProvider>
      </HapticsProvider>
    </LocaleProvider>
  );
}
