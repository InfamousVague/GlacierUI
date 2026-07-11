import { accentOptions } from '@glacier/tokens';
import {
  AppShell, Button, Container, HapticsProvider, LocaleProvider, Row, Sidebar, SidebarItem, SidebarSection, Spacer, locales, direction, useT, type Locale, Size, Variant } from '@glacier/react';
import { Settings } from '@glacier/icons';
import glacierLogoFull from '../../../packages/assets/glacier_logo_blue.png';
import glacierLogoText from '../../../packages/assets/logo_text.png';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_PREFERENCES, PreferencesModal, type Preferences } from './PreferencesModal.tsx';
import { DocSearch } from './DocSearch.tsx';
import { LanguageSelect } from './LanguageSelect.tsx';
import { groupTitles, m, pageTags, pageTitles } from './i18n.ts';
// Pages are compartmentalized by category under pages/<group>/, and the routes
// mirror that layout: #/<group>/<id> (the overview is the root, #/).
import { OverviewPage } from './pages/OverviewPage.tsx';

// Foundations
import { ColorsPage } from './pages/foundations/ColorsPage.tsx';
import { TypographyPage } from './pages/foundations/TypographyPage.tsx';
import { SpacingPage } from './pages/foundations/SpacingPage.tsx';
import { LayoutPage } from './pages/foundations/LayoutPage.tsx';
import { ShapePage } from './pages/foundations/ShapePage.tsx';
import { MaterialsPage } from './pages/foundations/MaterialsPage.tsx';
import { HapticsPage } from './pages/foundations/HapticsPage.tsx';
import { MotionPage } from './pages/foundations/MotionPage.tsx';
import { SpecPage } from './pages/foundations/SpecPage.tsx';
import { IconsPage } from './pages/foundations/IconsPage.tsx';
import { TestingPage } from './pages/foundations/TestingPage.tsx';
import { TestReportPage } from './pages/foundations/TestReportPage.tsx';
import { ParityMatrixPage } from './pages/foundations/ParityMatrixPage.tsx';

// Atoms
import { ButtonPage } from './pages/atoms/ButtonPage.tsx';
import { IconPage } from './pages/atoms/IconPage.tsx';
import { TextPage } from './pages/atoms/TextPage.tsx';
import { KbdPage } from './pages/atoms/KbdPage.tsx';
import { PillPage } from './pages/atoms/PillPage.tsx';
import { CounterBadgePage } from './pages/atoms/CounterBadgePage.tsx';
import { StatusDotPage } from './pages/atoms/StatusDotPage.tsx';
import { AvatarPage } from './pages/atoms/AvatarPage.tsx';
import { DividerPage } from './pages/atoms/DividerPage.tsx';
import { CalloutPage } from './pages/atoms/CalloutPage.tsx';
import { BannerPage } from './pages/atoms/BannerPage.tsx';
import { CodeBlockPage } from './pages/atoms/CodeBlockPage.tsx';
import { SelectionPage } from './pages/atoms/SelectionPage.tsx';
import { RadioCardPage } from './pages/atoms/RadioCardPage.tsx';
import { TextareaPage } from './pages/atoms/TextareaPage.tsx';
import { SearchFieldPage } from './pages/atoms/SearchFieldPage.tsx';
import { NumberInputPage } from './pages/atoms/NumberInputPage.tsx';
import { OtpFieldPage } from './pages/atoms/OtpFieldPage.tsx';
import { SliderPage } from './pages/atoms/SliderPage.tsx';
import { TogglePage } from './pages/atoms/TogglePage.tsx';
import { MeterPage } from './pages/atoms/MeterPage.tsx';
import { ProgressBarPage } from './pages/atoms/ProgressBarPage.tsx';
import { SpinnerPage } from './pages/atoms/SpinnerPage.tsx';
import { ProgressRingPage } from './pages/atoms/ProgressRingPage.tsx';
import { StepsPage } from './pages/atoms/StepsPage.tsx';
import { SegmentedBarPage } from './pages/atoms/SegmentedBarPage.tsx';
import { SkeletonPage } from './pages/atoms/SkeletonPage.tsx';
import { EmptyStatePage } from './pages/atoms/EmptyStatePage.tsx';
import { SurfacesPage } from './pages/atoms/SurfacesPage.tsx';
import { StatTilePage } from './pages/atoms/StatTilePage.tsx';
import { DeviceFramePage } from './pages/atoms/DeviceFramePage.tsx';
import { FilterChipPage } from './pages/atoms/FilterChipPage.tsx';
import { ImagePage } from './pages/atoms/ImagePage.tsx';
import { RatingPage } from './pages/atoms/RatingPage.tsx';
import { SparklinePage } from './pages/atoms/SparklinePage.tsx';

// Molecules
import { FieldPage } from './pages/molecules/FieldPage.tsx';
import { SelectPage } from './pages/molecules/SelectPage.tsx';
import { ComboboxPage } from './pages/molecules/ComboboxPage.tsx';
import { MultiSelectPage } from './pages/molecules/MultiSelectPage.tsx';
import { SegmentedPage } from './pages/molecules/SegmentedPage.tsx';
import { TabsPage } from './pages/molecules/TabsPage.tsx';
import { TooltipPage } from './pages/molecules/TooltipPage.tsx';
import { ToastPage } from './pages/molecules/ToastPage.tsx';
import { ScrollAreaPage } from './pages/molecules/ScrollAreaPage.tsx';
import { CarouselPage } from './pages/molecules/CarouselPage.tsx';
import { HeatmapPage } from './pages/molecules/HeatmapPage.tsx';
import { SpotlightPage } from './pages/molecules/SpotlightPage.tsx';
import { BreadcrumbsPage } from './pages/molecules/BreadcrumbsPage.tsx';
import { PaginationPage } from './pages/molecules/PaginationPage.tsx';
import { AccordionPage } from './pages/molecules/AccordionPage.tsx';
import { DatePickerPage } from './pages/molecules/DatePickerPage.tsx';
import { FileUploadPage } from './pages/molecules/FileUploadPage.tsx';
import { FieldsetPage } from './pages/molecules/FieldsetPage.tsx';
import { ListPage } from './pages/molecules/ListPage.tsx';
import { TablePage } from './pages/organisms/TablePage.tsx';
import { DataGridPage } from './pages/organisms/DataGridPage.tsx';

// Organisms
import { AppShellPage } from './pages/organisms/AppShellPage.tsx';
import { ModalPage } from './pages/organisms/ModalPage.tsx';
import { DrawerPage } from './pages/organisms/DrawerPage.tsx';
import { AlertDialogPage } from './pages/organisms/AlertDialogPage.tsx';
import { PopoverPage } from './pages/organisms/PopoverPage.tsx';
import { MenuPage } from './pages/organisms/MenuPage.tsx';
import { TreeViewPage } from './pages/organisms/TreeViewPage.tsx';
import { FloatingPanelPage } from './pages/organisms/FloatingPanelPage.tsx';
import { TabbedPanelPage } from './pages/organisms/TabbedPanelPage.tsx';
import { TabbedModalPage } from './pages/organisms/TabbedModalPage.tsx';
import { TabStripPage } from './pages/organisms/TabStripPage.tsx';
import { ResizableSplitPanePage } from './pages/organisms/ResizableSplitPanePage.tsx';

// Structures
import { SidebarPage } from './pages/structures/SidebarPage.tsx';
import { ToolbarPage } from './pages/structures/ToolbarPage.tsx';
import { TitleBarPage } from './pages/structures/TitleBarPage.tsx';
import { NavBarPage } from './pages/structures/NavBarPage.tsx';
import { PageHeaderPage } from './pages/structures/PageHeaderPage.tsx';
import { SectionPage } from './pages/structures/SectionPage.tsx';
import { CardGroupPage } from './pages/structures/CardGroupPage.tsx';
import { TimelinePage } from './pages/organisms/TimelinePage.tsx';
import { WizardPage } from './pages/organisms/WizardPage.tsx';
import { TimelineScrubberPage } from './pages/organisms/TimelineScrubberPage.tsx';
import { TimeSeriesChartPage } from './pages/organisms/TimeSeriesChartPage.tsx';

const PAGES = {
  overview: { title: 'Overview', group: 'Start', el: <OverviewPage /> },
  colors: { title: 'Colors & Tints', group: 'Foundations', el: <ColorsPage /> },
  typography: { title: 'Typography', group: 'Foundations', el: <TypographyPage /> },
  spacing: { title: 'Spacing', group: 'Foundations', el: <SpacingPage /> },
  layout: { title: 'Layout', group: 'Foundations', el: <LayoutPage /> },
  shape: { title: 'Shape & Elevation', group: 'Foundations', el: <ShapePage /> },
  materials: { title: 'Glass', group: 'Foundations', el: <MaterialsPage /> },
  haptics: { title: 'Haptics', group: 'Foundations', el: <HapticsPage /> },
  motion: { title: 'Motion', group: 'Foundations', el: <MotionPage /> },
  spec: { title: 'Specification', group: 'Foundations', el: <SpecPage /> },
  icons: { title: 'Icons', group: 'Foundations', el: <IconsPage /> },
  testing: { title: 'Testing', group: 'Foundations', el: <TestingPage /> },
  testreport: { title: 'Test Report', group: 'Foundations', el: <TestReportPage /> },
  paritymatrix: { title: 'Parity Matrix', group: 'Foundations', el: <ParityMatrixPage /> },
  button: { title: 'Button', group: 'Atoms', el: <ButtonPage /> },
  icon: { title: 'Icon', group: 'Atoms', el: <IconPage /> },
  text: { title: 'Text & Headings', group: 'Atoms', el: <TextPage /> },
  kbd: { title: 'Keyboard Key', group: 'Atoms', el: <KbdPage /> },
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
  otpfield: { title: 'OTP Field', group: 'Atoms', el: <OtpFieldPage /> },
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
  combobox: { title: 'Combobox', group: 'Molecules', el: <ComboboxPage /> },
  multiselect: { title: 'MultiSelect', group: 'Molecules', el: <MultiSelectPage /> },
  segmented: { title: 'Segmented Control', group: 'Molecules', el: <SegmentedPage /> },
  tabs: { title: 'Tabs', group: 'Molecules', el: <TabsPage /> },
  tooltip: { title: 'Tooltip', group: 'Molecules', el: <TooltipPage /> },
  toast: { title: 'Toast', group: 'Molecules', el: <ToastPage /> },
  appshell: { title: 'App Shell', group: 'Organisms', el: <AppShellPage /> },
  modal: { title: 'Modal', group: 'Organisms', el: <ModalPage /> },
  drawer: { title: 'Drawer', group: 'Organisms', el: <DrawerPage /> },
  alertdialog: { title: 'AlertDialog', group: 'Organisms', el: <AlertDialogPage /> },
  popover: { title: 'Popover', group: 'Organisms', el: <PopoverPage /> },
  menu: { title: 'Menu', group: 'Organisms', el: <MenuPage /> },
  treeview: { title: 'Tree View', group: 'Organisms', el: <TreeViewPage /> },
  stattile: { title: 'Stat Tile', group: 'Atoms', el: <StatTilePage /> },
  sparkline: { title: 'Sparkline', group: 'Atoms', el: <SparklinePage /> },
  deviceframe: { title: 'Device Frame', group: 'Atoms', el: <DeviceFramePage /> },
  filterchip: { title: 'Filter Chip', group: 'Atoms', el: <FilterChipPage /> },
  image: { title: 'Image', group: 'Atoms', el: <ImagePage /> },
  rating: { title: 'Rating', group: 'Atoms', el: <RatingPage /> },
  scrollarea: { title: 'Scroll Area', group: 'Molecules', el: <ScrollAreaPage /> },
  carousel: { title: 'Carousel', group: 'Molecules', el: <CarouselPage /> },
  heatmap: { title: 'Heatmap', group: 'Molecules', el: <HeatmapPage /> },
  spotlight: { title: 'Spotlight', group: 'Molecules', el: <SpotlightPage /> },
  breadcrumbs: { title: 'Breadcrumbs', group: 'Molecules', el: <BreadcrumbsPage /> },
  pagination: { title: 'Pagination', group: 'Molecules', el: <PaginationPage /> },
  accordion: { title: 'Accordion', group: 'Molecules', el: <AccordionPage /> },
  datepicker: { title: 'Date Picker', group: 'Molecules', el: <DatePickerPage /> },
  fileupload: { title: 'File Upload', group: 'Molecules', el: <FileUploadPage /> },
  fieldset: { title: 'Fieldset & Form Section', group: 'Molecules', el: <FieldsetPage /> },
  list: { title: 'List', group: 'Molecules', el: <ListPage /> },
  table: { title: 'Table', group: 'Organisms', el: <TablePage /> },
  datagrid: { title: 'Data Grid', group: 'Organisms', el: <DataGridPage /> },
  timeline: { title: 'Timeline', group: 'Organisms', el: <TimelinePage /> },
  wizard: { title: 'Wizard', group: 'Organisms', el: <WizardPage /> },
  timelinescrubber: { title: 'Timeline Scrubber', group: 'Organisms', el: <TimelineScrubberPage /> },
  timeserieschart: { title: 'Time Series Chart', group: 'Organisms', el: <TimeSeriesChartPage /> },
  floatingpanel: { title: 'Floating Panel', group: 'Organisms', el: <FloatingPanelPage /> },
  tabbedpanel: { title: 'Tabbed Panel', group: 'Organisms', el: <TabbedPanelPage /> },
  tabbedmodal: { title: 'Tabbed Modal', group: 'Organisms', el: <TabbedModalPage /> },
  tabstrip: { title: 'Tab Strip', group: 'Organisms', el: <TabStripPage /> },
  resizablesplitpane: { title: 'Resizable Split Pane', group: 'Organisms', el: <ResizableSplitPanePage /> },
  sidebar: { title: 'Sidebar', group: 'Structures', el: <SidebarPage /> },
  toolbar: { title: 'Toolbar', group: 'Structures', el: <ToolbarPage /> },
  titlebar: { title: 'Title Bar', group: 'Structures', el: <TitleBarPage /> },
  navbar: { title: 'Nav Bar', group: 'Structures', el: <NavBarPage /> },
  pageheader: { title: 'Page Header', group: 'Structures', el: <PageHeaderPage /> },
  section: { title: 'Section', group: 'Structures', el: <SectionPage /> },
  cardgroup: { title: 'Card Group', group: 'Structures', el: <CardGroupPage /> },
} as const;

type PageId = keyof typeof PAGES;

const GROUPS = ['Start', 'Foundations', 'Atoms', 'Molecules', 'Organisms', 'Structures'] as const;

const SEARCH_PAGE_IDS = Object.keys(PAGES) as PageId[];

// Routes mirror the page folders: #/<group>/<id> (e.g. #/atoms/button), with the
// overview at the root (#/). The slug is just the lower-cased group name.
function pagePath(id: PageId): string {
  return id === 'overview' ? '' : `${PAGES[id].group.toLowerCase()}/${id}`;
}

function hashFor(id: PageId): string {
  return `#/${pagePath(id)}`;
}

const PATH_TO_ID: Record<string, PageId> = Object.fromEntries(
  SEARCH_PAGE_IDS.map((id) => [pagePath(id), id]),
);

function pageFromHash(): PageId {
  const path = window.location.hash.replace(/^#\/?/, '');
  // Canonical hierarchical route (atoms/button); otherwise fall back to a bare
  // id (button) so legacy links and id-only deep links still resolve.
  const direct = PATH_TO_ID[path];
  if (direct) return direct;
  const bare = path.split('/').pop() ?? '';
  return bare in PAGES ? (bare as PageId) : 'overview';
}

const STORAGE_KEY = 'glacier-docs-preferences';
const SIDEBAR_WIDTH_KEY = 'glacier-docs-sidebar-width';

function loadPreferences(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<Preferences>;
    const accentValid = accentOptions.some((option) => option.name === saved.accent);
    return {
      theme: saved.theme === 'light' || saved.theme === 'dark' ? saved.theme : 'system',
      density: saved.density === 'compact' ? 'compact' : 'comfortable',
      layout: saved.layout === 'full' ? 'full' : 'floating',
      direction: saved.direction === 'rtl' ? 'rtl' : 'ltr',
      haptics: saved.haptics === true,
      accent: accentValid ? saved.accent! : DEFAULT_PREFERENCES.accent,
      font: saved.font === 'noto' || saved.font === 'plex' ? saved.font : 'inter',
      mono: saved.mono === 'plex' ? 'plex' : 'jetbrains',
      radiusScale:
        typeof saved.radiusScale === 'number' && saved.radiusScale >= 0 && saved.radiusScale <= 2
          ? saved.radiusScale
          : 1,
      frostedness:
        typeof saved.frostedness === 'number' && saved.frostedness >= 0 && saved.frostedness <= 2
          ? saved.frostedness
          : DEFAULT_PREFERENCES.frostedness,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

const GearIcon = <Settings size={14} />;

const LOCALE_KEY = 'glacier-docs-locale';

function loadLocale(): Locale {
  const known = locales as readonly string[];
  const saved = localStorage.getItem(LOCALE_KEY);
  if (saved && known.includes(saved)) return saved as Locale;
  const preferred = navigator.language.slice(0, 2);
  return known.includes(preferred) ? (preferred as Locale) : 'en';
}

export function App() {
  const [locale, setLocale] = useState<Locale>(loadLocale);

  useEffect(() => {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = direction(locale);
  }, [locale]);

  return (
    <LocaleProvider locale={locale}>
      <DocsApp locale={locale} onLocaleChange={setLocale} />
    </LocaleProvider>
  );
}

function SidebarBrand() {
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sidebar = root.closest('[data-docs-sidebar]') as HTMLElement | null;
    const body = sidebar?.children[1] as HTMLElement | null;
    if (!body) return;

    const onScroll = () => setScrolled(body.scrollTop > 8);
    body.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => body.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={rootRef} className={`brandLogo${scrolled ? ' scrolled' : ''}`}>
      <img src={glacierLogoFull} alt="Glacier logo" className="brandLogoFull" />
      <img src={glacierLogoText} alt="Glacier text logo" className="brandLogoText" />
    </div>
  );
}

function DocsApp({ locale, onLocaleChange }: { locale: Locale; onLocaleChange: (next: Locale) => void }) {
  const t = useT();
  const searchItems = useMemo(
    () =>
      SEARCH_PAGE_IDS.map((id) => ({
        id,
        title: t(pageTitles[id]),
        group: t(groupTitles[PAGES[id].group]),
        keywords: (pageTags[id] ?? []).join(' '),
      })),
    [t],
  );
  const [page, setPage] = useState<PageId>(pageFromHash);
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<string>(() => {
    try {
      return localStorage.getItem(SIDEBAR_WIDTH_KEY) ?? '16rem';
    } catch {
      return '16rem';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth);
    } catch {
      /* ignore write failures (private mode, quota) */
    }
  }, [sidebarWidth]);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Navigating to another page should start the reader at the top, not wherever
  // the previous page happened to be scrolled to. The document is the scroll
  // container (the sidebar and header are sticky), so reset the window - smoothly,
  // unless the reader prefers reduced motion.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [page]);

  useEffect(() => {
    const root = document.documentElement;
    const { theme, density, layout, direction, accent, font, mono, radiusScale, frostedness } = preferences;

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
    // Always stamped: portalled kit surfaces (Drawer) read the mode from the
    // root, so 'floating' must be visible there, not just the default absence.
    root.setAttribute('data-layout', layout);

    // direction: ltr is the default, so no attribute is set for it, matching
    // how data-theme handles system
    if (direction === 'ltr') root.removeAttribute('dir');
    else root.setAttribute('dir', direction);

    if (accent === DEFAULT_PREFERENCES.accent) root.removeAttribute('data-accent');
    else root.setAttribute('data-accent', accent);


    if (radiusScale === 1) root.style.removeProperty('--glacier-radius-scale');
    else root.style.setProperty('--glacier-radius-scale', String(radiusScale));

    // Frostedness scales every blur token so all glass thins or thickens at once.
    if (frostedness === 1) root.style.removeProperty('--glacier-glass-blur-scale');
    else root.style.setProperty('--glacier-glass-blur-scale', String(frostedness));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const sidebar = (
    <Sidebar
      className="docsSidebar"
      data-docs-sidebar="true"
      header={
        <div className="brand">
          <SidebarBrand />
        </div>
      }
    >
      {GROUPS.map((group) => (
        <SidebarSection key={group} title={t(groupTitles[group])}>
          {(Object.entries(PAGES) as Array<[PageId, (typeof PAGES)[PageId]]>)
            .filter(([, p]) => p.group === group)
            .map(([id]) => (
              <SidebarItem
                key={id}
                active={page === id}
                onClick={() => {
                  window.location.hash = hashFor(id);
                  setPage(id);
                }}
              >
                {t(pageTitles[id])}
              </SidebarItem>
            ))}
        </SidebarSection>
      ))}
    </Sidebar>
  );

  const header = (
    <Row width="full" gap={4}>
      <DocSearch
        items={searchItems}
        onSelect={(id) => {
          window.location.hash = hashFor(id as PageId);
          setPage(id as PageId);
        }}
      />
      <Spacer />
      <LanguageSelect locale={locale} onChange={onLocaleChange} />
      <Button variant={Variant.Glass} size={Size.Medium} onClick={() => setPreferencesOpen(true)}>
        {GearIcon}
        {t(m.preferences)}
      </Button>
    </Row>
  );

  return (
    <HapticsProvider enabled={preferences.haptics}>
      <AppShell
        floating={preferences.layout === 'floating'}
        sidebar={sidebar}
        header={header}
        sidebarLabel={t(m.sidebarLabel)}
        resizable
        sidebarWidth={sidebarWidth}
        onSidebarWidthChange={setSidebarWidth}
      >
        <Container size={Size.XLarge} paddingY={8} as="main" className="content">
          {PAGES[page].el}
        </Container>
      </AppShell>
      <PreferencesModal
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        preferences={preferences}
        onChange={(patch) => setPreferences((current) => ({ ...current, ...patch }))}
      />
    </HapticsProvider>
  );
}
