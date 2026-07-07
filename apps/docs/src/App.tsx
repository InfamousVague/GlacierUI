import { accentOptions } from '@perfect/tokens';
import { AppShell, Button, Container, Row, Sidebar, SidebarItem, SidebarSection, Spacer } from '@perfect/react';
import { useEffect, useState } from 'react';
import { DEFAULT_PREFERENCES, PreferencesModal, type Preferences } from './PreferencesModal.tsx';
import { DocSearch } from './DocSearch.tsx';
import { OverviewPage } from './pages/OverviewPage.tsx';
import { LayoutPage } from './pages/LayoutPage.tsx';
import { ColorsPage } from './pages/ColorsPage.tsx';
import { TypographyPage } from './pages/TypographyPage.tsx';
import { SpacingPage } from './pages/SpacingPage.tsx';
import { ShapePage } from './pages/ShapePage.tsx';
import { MotionPage } from './pages/MotionPage.tsx';
import { SpecPage } from './pages/SpecPage.tsx';
import { ButtonPage } from './pages/ButtonPage.tsx';
import { TextPage } from './pages/TextPage.tsx';
import { PillPage } from './pages/PillPage.tsx';
import { CounterBadgePage } from './pages/CounterBadgePage.tsx';
import { StatusDotPage } from './pages/StatusDotPage.tsx';
import { AvatarPage } from './pages/AvatarPage.tsx';
import { DividerPage } from './pages/DividerPage.tsx';
import { CalloutPage } from './pages/CalloutPage.tsx';
import { CodeBlockPage } from './pages/CodeBlockPage.tsx';
import { SelectionPage } from './pages/SelectionPage.tsx';
import { TextareaPage } from './pages/TextareaPage.tsx';
import { SearchFieldPage } from './pages/SearchFieldPage.tsx';
import { NumberInputPage } from './pages/NumberInputPage.tsx';
import { SkeletonPage } from './pages/SkeletonPage.tsx';
import { SliderPage } from './pages/SliderPage.tsx';
import { TogglePage } from './pages/TogglePage.tsx';
import { MeterPage } from './pages/MeterPage.tsx';
import { ProgressBarPage } from './pages/ProgressBarPage.tsx';
import { SpinnerPage } from './pages/SpinnerPage.tsx';
import { ProgressRingPage } from './pages/ProgressRingPage.tsx';
import { SegmentedBarPage } from './pages/SegmentedBarPage.tsx';
import { SurfacesPage } from './pages/SurfacesPage.tsx';
import { FieldPage } from './pages/FieldPage.tsx';
import { SelectPage } from './pages/SelectPage.tsx';
import { SegmentedPage } from './pages/SegmentedPage.tsx';
import { TabsPage } from './pages/TabsPage.tsx';
import { ModalPage } from './pages/ModalPage.tsx';
import { PopoverPage } from './pages/PopoverPage.tsx';
import { SidebarPage } from './pages/SidebarPage.tsx';
import { ToolbarPage } from './pages/ToolbarPage.tsx';
import { BannerPage } from './pages/BannerPage.tsx';
import { EmptyStatePage } from './pages/EmptyStatePage.tsx';
import { StepsPage } from './pages/StepsPage.tsx';
import { RadioCardPage } from './pages/RadioCardPage.tsx';
import { TooltipPage } from './pages/TooltipPage.tsx';
import { ToastPage } from './pages/ToastPage.tsx';

const PAGES = {
  overview: { title: 'Overview', group: 'Start', el: <OverviewPage /> },
  colors: { title: 'Colors & Tints', group: 'Foundations', el: <ColorsPage /> },
  typography: { title: 'Typography', group: 'Foundations', el: <TypographyPage /> },
  spacing: { title: 'Spacing', group: 'Foundations', el: <SpacingPage /> },
  layout: { title: 'Layout', group: 'Foundations', el: <LayoutPage /> },
  shape: { title: 'Shape & Elevation', group: 'Foundations', el: <ShapePage /> },
  motion: { title: 'Motion', group: 'Foundations', el: <MotionPage /> },
  spec: { title: 'Specification', group: 'Foundations', el: <SpecPage /> },
  button: { title: 'Button', group: 'Atoms', el: <ButtonPage /> },
  text: { title: 'Text & Headings', group: 'Atoms', el: <TextPage /> },
  pill: { title: 'Pill', group: 'Atoms', el: <PillPage /> },
  counterbadge: { title: 'Counter Badge', group: 'Atoms', el: <CounterBadgePage /> },
  statusdot: { title: 'Status Dot', group: 'Atoms', el: <StatusDotPage /> },
  avatar: { title: 'Avatar', group: 'Atoms', el: <AvatarPage /> },
  divider: { title: 'Divider', group: 'Atoms', el: <DividerPage /> },
  callout: { title: 'Callout', group: 'Atoms', el: <CalloutPage /> },
  banner: { title: 'Banner', group: 'Atoms', el: <BannerPage /> },
  codeblock: { title: 'Code Block', group: 'Atoms', el: <CodeBlockPage /> },
  selection: { title: 'Selection', group: 'Atoms', el: <SelectionPage /> },
  radiocard: { title: 'Radio Card', group: 'Atoms', el: <RadioCardPage /> },
  textarea: { title: 'Textarea', group: 'Atoms', el: <TextareaPage /> },
  searchfield: { title: 'Search Field', group: 'Atoms', el: <SearchFieldPage /> },
  numberinput: { title: 'Number Input', group: 'Atoms', el: <NumberInputPage /> },
  slider: { title: 'Slider', group: 'Atoms', el: <SliderPage /> },
  toggle: { title: 'Toggle', group: 'Atoms', el: <TogglePage /> },
  meter: { title: 'Meter', group: 'Atoms', el: <MeterPage /> },
  progress: { title: 'Progress Bar', group: 'Atoms', el: <ProgressBarPage /> },
  spinner: { title: 'Spinner', group: 'Atoms', el: <SpinnerPage /> },
  progressring: { title: 'Progress Ring', group: 'Atoms', el: <ProgressRingPage /> },
  steps: { title: 'Steps', group: 'Atoms', el: <StepsPage /> },
  segmentedbar: { title: 'Segmented Bar', group: 'Atoms', el: <SegmentedBarPage /> },
  skeleton: { title: 'Skeleton', group: 'Atoms', el: <SkeletonPage /> },
  emptystate: { title: 'Empty State', group: 'Atoms', el: <EmptyStatePage /> },
  surfaces: { title: 'Card & Surface', group: 'Atoms', el: <SurfacesPage /> },
  field: { title: 'Field & Input', group: 'Molecules', el: <FieldPage /> },
  select: { title: 'Select', group: 'Molecules', el: <SelectPage /> },
  segmented: { title: 'Segmented Control', group: 'Molecules', el: <SegmentedPage /> },
  tabs: { title: 'Tabs', group: 'Molecules', el: <TabsPage /> },
  tooltip: { title: 'Tooltip', group: 'Molecules', el: <TooltipPage /> },
  toast: { title: 'Toast', group: 'Molecules', el: <ToastPage /> },
  modal: { title: 'Modal', group: 'Organisms', el: <ModalPage /> },
  popover: { title: 'Popover', group: 'Organisms', el: <PopoverPage /> },
  sidebar: { title: 'Sidebar', group: 'Structures', el: <SidebarPage /> },
  toolbar: { title: 'Toolbar', group: 'Structures', el: <ToolbarPage /> },
} as const;

type PageId = keyof typeof PAGES;

const GROUPS = ['Start', 'Foundations', 'Atoms', 'Molecules', 'Organisms', 'Structures'] as const;

const SEARCH_ITEMS = (Object.entries(PAGES) as Array<[PageId, (typeof PAGES)[PageId]]>).map(
  ([id, p]) => ({ id, title: p.title, group: p.group }),
);

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
      layout: saved.layout === 'full' ? 'full' : 'floating',
      accent: accentValid ? saved.accent! : DEFAULT_PREFERENCES.accent,
      font: saved.font === 'noto' || saved.font === 'plex' ? saved.font : 'inter',
      mono: saved.mono === 'plex' ? 'plex' : 'jetbrains',
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
    const { theme, density, layout, accent, font, mono, radiusScale } = preferences;

    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);

    if (density === 'comfortable') root.removeAttribute('data-density');
    else root.setAttribute('data-density', density);

    // fonts: the default typeface (inter) and mono (jetbrains) are the :root
    // values, so no attribute is set for them, matching accent/theme/density
    if (font === DEFAULT_PREFERENCES.font) root.removeAttribute('data-font');
    else root.setAttribute('data-font', font);

    if (mono === DEFAULT_PREFERENCES.mono) root.removeAttribute('data-mono');
    else root.setAttribute('data-mono', mono);

    // a common layout mode, like theme and density: floating is the default,
    // full pins the chrome to the edges
    if (layout === 'floating') root.removeAttribute('data-layout');
    else root.setAttribute('data-layout', layout);

    if (accent === DEFAULT_PREFERENCES.accent) root.removeAttribute('data-accent');
    else root.setAttribute('data-accent', accent);

    if (radiusScale === 1) root.style.removeProperty('--perfect-radius-scale');
    else root.style.setProperty('--perfect-radius-scale', String(radiusScale));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const sidebar = (
    <Sidebar
      header={
        <h1 className="brand">
          Perfect
          <small>design system</small>
        </h1>
      }
    >
      {GROUPS.map((group) => (
        <SidebarSection key={group} title={group}>
          {(Object.entries(PAGES) as Array<[PageId, (typeof PAGES)[PageId]]>)
            .filter(([, p]) => p.group === group)
            .map(([id, p]) => (
              <SidebarItem
                key={id}
                active={page === id}
                onClick={() => {
                  window.location.hash = `#/${id}`;
                  setPage(id);
                }}
              >
                {p.title}
              </SidebarItem>
            ))}
        </SidebarSection>
      ))}
    </Sidebar>
  );

  const header = (
    <Row width="full" gap={4}>
      <DocSearch
        items={SEARCH_ITEMS}
        onSelect={(id) => {
          window.location.hash = `#/${id}`;
          setPage(id as PageId);
        }}
      />
      <Spacer />
      <span className="accentDot" aria-hidden="true" />
      <Button variant="glass" size="md" onClick={() => setPreferencesOpen(true)}>
        {GearIcon}
        Preferences
      </Button>
    </Row>
  );

  return (
    <>
      <AppShell
        floating={preferences.layout === 'floating'}
        sidebar={sidebar}
        header={header}
        sidebarLabel="Documentation sections"
      >
        <Container size="xl" paddingY={8} as="main" className="content">
          {PAGES[page].el}
        </Container>
      </AppShell>
      <PreferencesModal
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        preferences={preferences}
        onChange={(patch) => setPreferences((current) => ({ ...current, ...patch }))}
      />
    </>
  );
}
