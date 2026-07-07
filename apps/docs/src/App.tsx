import { accentOptions } from '@perfect/tokens';
import { Button } from '@perfect/react';
import { useEffect, useState } from 'react';
import { DEFAULT_PREFERENCES, PreferencesModal, type Preferences } from './PreferencesModal.tsx';
import { OverviewPage } from './pages/OverviewPage.tsx';
import { ColorsPage } from './pages/ColorsPage.tsx';
import { TypographyPage } from './pages/TypographyPage.tsx';
import { SpacingPage } from './pages/SpacingPage.tsx';
import { ShapePage } from './pages/ShapePage.tsx';
import { MotionPage } from './pages/MotionPage.tsx';
import { ButtonPage } from './pages/ButtonPage.tsx';
import { TextPage } from './pages/TextPage.tsx';
import { PillPage } from './pages/PillPage.tsx';
import { DividerPage } from './pages/DividerPage.tsx';
import { ProgressBarPage } from './pages/ProgressBarPage.tsx';
import { SpinnerPage } from './pages/SpinnerPage.tsx';
import { SelectionPage } from './pages/SelectionPage.tsx';
import { SkeletonPage } from './pages/SkeletonPage.tsx';
import { SliderPage } from './pages/SliderPage.tsx';
import { TogglePage } from './pages/TogglePage.tsx';
import { MeterPage } from './pages/MeterPage.tsx';
import { SurfacesPage } from './pages/SurfacesPage.tsx';
import { FieldPage } from './pages/FieldPage.tsx';
import { SelectPage } from './pages/SelectPage.tsx';
import { SegmentedPage } from './pages/SegmentedPage.tsx';
import { TabsPage } from './pages/TabsPage.tsx';
import { ModalPage } from './pages/ModalPage.tsx';

const PAGES = {
  overview: { title: 'Overview', group: 'Start', el: <OverviewPage /> },
  colors: { title: 'Colors & Tints', group: 'Foundations', el: <ColorsPage /> },
  typography: { title: 'Typography', group: 'Foundations', el: <TypographyPage /> },
  spacing: { title: 'Spacing', group: 'Foundations', el: <SpacingPage /> },
  shape: { title: 'Shape & Elevation', group: 'Foundations', el: <ShapePage /> },
  motion: { title: 'Motion', group: 'Foundations', el: <MotionPage /> },
  button: { title: 'Button', group: 'Atoms', el: <ButtonPage /> },
  text: { title: 'Text & Headings', group: 'Atoms', el: <TextPage /> },
  pill: { title: 'Pill', group: 'Atoms', el: <PillPage /> },
  divider: { title: 'Divider', group: 'Atoms', el: <DividerPage /> },
  progress: { title: 'Progress Bar', group: 'Atoms', el: <ProgressBarPage /> },
  spinner: { title: 'Spinner', group: 'Atoms', el: <SpinnerPage /> },
  selection: { title: 'Selection', group: 'Atoms', el: <SelectionPage /> },
  skeleton: { title: 'Skeleton', group: 'Atoms', el: <SkeletonPage /> },
  slider: { title: 'Slider', group: 'Atoms', el: <SliderPage /> },
  toggle: { title: 'Toggle', group: 'Atoms', el: <TogglePage /> },
  meter: { title: 'Meter', group: 'Atoms', el: <MeterPage /> },
  surfaces: { title: 'Card & Surface', group: 'Atoms', el: <SurfacesPage /> },
  field: { title: 'Field & Input', group: 'Molecules', el: <FieldPage /> },
  select: { title: 'Select', group: 'Molecules', el: <SelectPage /> },
  segmented: { title: 'Segmented Control', group: 'Molecules', el: <SegmentedPage /> },
  tabs: { title: 'Tabs', group: 'Molecules', el: <TabsPage /> },
  modal: { title: 'Modal', group: 'Organisms', el: <ModalPage /> },
} as const;

type PageId = keyof typeof PAGES;

const GROUPS = ['Start', 'Foundations', 'Atoms', 'Molecules', 'Organisms'] as const;

function pageFromHash(): PageId {
  const hash = window.location.hash.replace('#/', '');
  return hash in PAGES ? (hash as PageId) : 'overview';
}

const STORAGE_KEY = 'perfect-docs-preferences';

function loadPreferences(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<Preferences>;
    const accentValid = accentOptions.some((option) => option.name === saved.accent);
    return {
      theme: saved.theme === 'light' || saved.theme === 'dark' ? saved.theme : 'system',
      density: saved.density === 'compact' ? 'compact' : 'comfortable',
      accent: accentValid ? saved.accent! : DEFAULT_PREFERENCES.accent,
      radiusScale:
        typeof saved.radiusScale === 'number' && saved.radiusScale >= 0 && saved.radiusScale <= 2
          ? saved.radiusScale
          : 1,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

const GearIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M8 1.75v1.5M8 12.75v1.5M14.25 8h-1.5M3.25 8h-1.5M12.42 3.58l-1.06 1.06M4.64 11.36l-1.06 1.06M12.42 12.42l-1.06-1.06M4.64 4.64 3.58 3.58"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export function App() {
  const [page, setPage] = useState<PageId>(pageFromHash);
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const { theme, density, accent, radiusScale } = preferences;

    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);

    if (density === 'comfortable') root.removeAttribute('data-density');
    else root.setAttribute('data-density', density);

    if (accent === DEFAULT_PREFERENCES.accent) root.removeAttribute('data-accent');
    else root.setAttribute('data-accent', accent);

    if (radiusScale === 1) root.style.removeProperty('--perfect-radius-scale');
    else root.style.setProperty('--perfect-radius-scale', String(radiusScale));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <h1 className="brand">
          Perfect
          <small>design system</small>
        </h1>
        {GROUPS.map((group) => (
          <nav className="navGroup" key={group} aria-label={group}>
            <div className="navGroupTitle">{group}</div>
            {(Object.entries(PAGES) as Array<[PageId, (typeof PAGES)[PageId]]>)
              .filter(([, p]) => p.group === group)
              .map(([id, p]) => (
                <button
                  key={id}
                  className="navItem"
                  data-active={page === id || undefined}
                  onClick={() => {
                    window.location.hash = `#/${id}`;
                    setPage(id);
                  }}
                >
                  {p.title}
                </button>
              ))}
          </nav>
        ))}
      </aside>
      <div className="main">
        <header className="topbar">
          <span className="accentDot" aria-hidden="true" />
          <Button variant="glass" size="md" onClick={() => setPreferencesOpen(true)}>
            {GearIcon}
            Preferences
          </Button>
        </header>
        <main className="content">{PAGES[page].el}</main>
      </div>
      <PreferencesModal
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        preferences={preferences}
        onChange={(patch) => setPreferences((current) => ({ ...current, ...patch }))}
      />
    </div>
  );
}
