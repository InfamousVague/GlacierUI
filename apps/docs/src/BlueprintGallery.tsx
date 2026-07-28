import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FilterChip, Heading, SearchField, Size, Text, TextTone, useT } from '@glacier/react';
import { ComponentBlueprint } from './Blueprint.tsx';
import { groupTitles, m, pageTitles } from './i18n.ts';

/**
 * What a component is *for*, which is the question someone browsing actually
 * has. Deliberately cross-cutting: the atomic layer (atom/molecule/organism)
 * answers "how big is it", not "what do I reach for", so a Button and a
 * ColorPicker share a purpose while sitting three layers apart.
 */
type Kind = 'input' | 'display' | 'feedback' | 'navigation' | 'overlay' | 'layout' | 'data' | 'media';

type GalleryItem = { spec: string; page: string; title: string; blurb: string; kinds: Kind[] };
type Section = { group: string; title: string; items: GalleryItem[] };

// Every component that ships a measured blueprint, grouped by layer. `spec`
// (hyphenated) drives the figure via getSpec(); `page` (no hyphens) is the hash
// route under #/<group>/<page>. `blurb` is a one-line description. A handful of
// atoms share a page (checkbox/radio/switch -> selection, card/surface ->
// surfaces, text/heading -> text). Built inside a hook so item titles can reuse
// the shared pageTitles/groupTitles catalog and blurbs come from `m`.
function useSections(): Section[] {
  const t = useT();

  const atoms: GalleryItem[] = [
    { spec: 'button', page: 'button', title: t(pageTitles.button), blurb: t(m.bpgButtonBlurb) , kinds: ['input'] },
    { spec: 'icon', page: 'icon', title: t(pageTitles.icon), blurb: t(m.bpgIconBlurb) , kinds: ['display'] },
    { spec: 'pill', page: 'pill', title: t(pageTitles.pill), blurb: t(m.bpgPillBlurb) , kinds: ['display'] },
    { spec: 'counter-badge', page: 'counterbadge', title: t(pageTitles.counterbadge), blurb: t(m.bpgCounterBadgeBlurb) , kinds: ['display', 'feedback'] },
    { spec: 'status-dot', page: 'statusdot', title: t(pageTitles.statusdot), blurb: t(m.bpgStatusDotBlurb) , kinds: ['feedback'] },
    { spec: 'avatar', page: 'avatar', title: t(pageTitles.avatar), blurb: t(m.bpgAvatarBlurb) , kinds: ['display'] },
    { spec: 'divider', page: 'divider', title: t(pageTitles.divider), blurb: t(m.bpgDividerBlurb) , kinds: ['layout'] },
    { spec: 'callout', page: 'callout', title: t(pageTitles.callout), blurb: t(m.bpgCalloutBlurb) , kinds: ['feedback'] },
    { spec: 'banner', page: 'banner', title: t(pageTitles.banner), blurb: t(m.bpgBannerBlurb) , kinds: ['feedback'] },
    { spec: 'empty-state', page: 'emptystate', title: t(pageTitles.emptystate), blurb: t(m.bpgEmptyStateBlurb) , kinds: ['feedback'] },
    { spec: 'code-block', page: 'codeblock', title: t(pageTitles.codeblock), blurb: t(m.bpgCodeBlockBlurb) , kinds: ['display'] },
    { spec: 'text', page: 'text', title: t(m.bpgText), blurb: t(m.bpgTypographyBlurb) , kinds: ['display'] },
    { spec: 'heading', page: 'text', title: t(m.bpgHeading), blurb: t(m.bpgTypographyBlurb) , kinds: ['display'] },
    { spec: 'kbd', page: 'kbd', title: t(m.bpgKbd), blurb: t(m.bpgKbdBlurb) , kinds: ['display'] },
    { spec: 'textarea', page: 'textarea', title: t(pageTitles.textarea), blurb: t(m.bpgTextareaBlurb) , kinds: ['input'] },
    { spec: 'checkbox', page: 'selection', title: t(m.bpgCheckbox), blurb: t(m.bpgSelectionBlurb) , kinds: ['input'] },
    { spec: 'radio', page: 'selection', title: t(m.bpgRadio), blurb: t(m.bpgSelectionBlurb) , kinds: ['input'] },
    { spec: 'switch', page: 'selection', title: t(m.bpgSwitch), blurb: t(m.bpgSelectionBlurb) , kinds: ['input'] },
    { spec: 'radio-card', page: 'radiocard', title: t(pageTitles.radiocard), blurb: t(m.bpgRadioCardBlurb) , kinds: ['input'] },
    { spec: 'toggle', page: 'toggle', title: t(pageTitles.toggle), blurb: t(m.bpgToggleBlurb) , kinds: ['input'] },
    { spec: 'search-field', page: 'searchfield', title: t(pageTitles.searchfield), blurb: t(m.bpgSearchFieldBlurb) , kinds: ['input'] },
    { spec: 'number-input', page: 'numberinput', title: t(pageTitles.numberinput), blurb: t(m.bpgNumberInputBlurb) , kinds: ['input'] },
    { spec: 'otp-field', page: 'otpfield', title: t(pageTitles.otpfield), blurb: t(m.bpgOtpFieldBlurb) , kinds: ['input'] },
    { spec: 'slider', page: 'slider', title: t(pageTitles.slider), blurb: t(m.bpgSliderBlurb) , kinds: ['input'] },
    { spec: 'seek-bar', page: 'seekbar', title: t(pageTitles.seekbar), blurb: t(m.bpgSeekBarBlurb) , kinds: ['input', 'media'] },
    { spec: 'meter', page: 'meter', title: t(pageTitles.meter), blurb: t(m.bpgMeterBlurb) , kinds: ['feedback'] },
    { spec: 'progress-bar', page: 'progress', title: t(pageTitles.progress), blurb: t(m.bpgProgressBarBlurb) , kinds: ['feedback'] },
    { spec: 'progress-ring', page: 'progressring', title: t(pageTitles.progressring), blurb: t(m.bpgProgressRingBlurb) , kinds: ['feedback'] },
    { spec: 'spinner', page: 'spinner', title: t(pageTitles.spinner), blurb: t(m.bpgSpinnerBlurb) , kinds: ['feedback'] },
    { spec: 'steps', page: 'steps', title: t(pageTitles.steps), blurb: t(m.bpgStepsBlurb) , kinds: ['feedback', 'navigation'] },
    { spec: 'segmented-bar', page: 'segmentedbar', title: t(pageTitles.segmentedbar), blurb: t(m.bpgSegmentedBarBlurb) , kinds: ['feedback', 'data'] },
    { spec: 'skeleton', page: 'skeleton', title: t(pageTitles.skeleton), blurb: t(m.bpgSkeletonBlurb) , kinds: ['feedback'] },
    { spec: 'card', page: 'surfaces', title: t(m.bpgCard), blurb: t(m.bpgCardBlurb) , kinds: ['layout'] },
    { spec: 'surface', page: 'surfaces', title: t(m.bpgSurface), blurb: t(m.bpgSurfaceBlurb) , kinds: ['layout'] },
    { spec: 'stat-tile', page: 'stattile', title: t(pageTitles.stattile), blurb: t(m.bpgStatTileBlurb) , kinds: ['data', 'display'] },
    { spec: 'filter-chip', page: 'filterchip', title: t(pageTitles.filterchip), blurb: t(m.bpgFilterChipBlurb) , kinds: ['input'] },
    { spec: 'rating', page: 'rating', title: t(pageTitles.rating), blurb: t(m.bpgRatingBlurb) , kinds: ['input'] },
    { spec: 'image', page: 'image', title: t(pageTitles.image), blurb: t(m.bpgImageBlurb) , kinds: ['media', 'display'] },
    { spec: 'device-frame', page: 'deviceframe', title: t(pageTitles.deviceframe), blurb: t(m.bpgDeviceFrameBlurb) , kinds: ['display'] },
  ];

  const molecules: GalleryItem[] = [
    { spec: 'field', page: 'field', title: t(m.bpgField), blurb: t(m.bpgFieldBlurb) , kinds: ['input'] },
    { spec: 'player-card', page: 'playercard', title: t(pageTitles.playercard), blurb: t(m.bpgPlayerCardBlurb) , kinds: ['media'] },
    { spec: 'select', page: 'select', title: t(pageTitles.select), blurb: t(m.bpgSelectBlurb) , kinds: ['input'] },
    { spec: 'combobox', page: 'combobox', title: t(pageTitles.combobox), blurb: t(m.bpgComboboxBlurb) , kinds: ['input'] },
    { spec: 'multi-select', page: 'multiselect', title: t(pageTitles.multiselect), blurb: t(m.bpgMultiSelectBlurb) , kinds: ['input'] },
    { spec: 'segmented-control', page: 'segmented', title: t(pageTitles.segmented), blurb: t(m.bpgSegmentedControlBlurb) , kinds: ['input', 'navigation'] },
    { spec: 'tabs', page: 'tabs', title: t(pageTitles.tabs), blurb: t(m.bpgTabsBlurb) , kinds: ['navigation'] },
    { spec: 'tooltip', page: 'tooltip', title: t(pageTitles.tooltip), blurb: t(m.bpgTooltipBlurb) , kinds: ['overlay'] },
    { spec: 'toast', page: 'toast', title: t(pageTitles.toast), blurb: t(m.bpgToastBlurb) , kinds: ['feedback', 'overlay'] },
    { spec: 'scroll-area', page: 'scrollarea', title: t(pageTitles.scrollarea), blurb: t(m.bpgScrollAreaBlurb) , kinds: ['layout'] },
    { spec: 'carousel', page: 'carousel', title: t(pageTitles.carousel), blurb: t(m.bpgCarouselBlurb) , kinds: ['media', 'navigation'] },
    { spec: 'heatmap', page: 'heatmap', title: t(pageTitles.heatmap), blurb: t(m.bpgHeatmapBlurb) , kinds: ['data'] },
    { spec: 'spotlight', page: 'spotlight', title: t(pageTitles.spotlight), blurb: t(m.bpgSpotlightBlurb) , kinds: ['overlay'] },
    { spec: 'breadcrumbs', page: 'breadcrumbs', title: t(pageTitles.breadcrumbs), blurb: t(m.bpgBreadcrumbsBlurb) , kinds: ['navigation'] },
    { spec: 'pagination', page: 'pagination', title: t(pageTitles.pagination), blurb: t(m.bpgPaginationBlurb) , kinds: ['navigation'] },
    { spec: 'accordion', page: 'accordion', title: t(pageTitles.accordion), blurb: t(m.bpgAccordionBlurb) , kinds: ['layout', 'navigation'] },
    { spec: 'list', page: 'list', title: t(pageTitles.list), blurb: t(m.bpgListBlurb) , kinds: ['data'] },
  ];

  const organisms: GalleryItem[] = [
    { spec: 'app-shell', page: 'appshell', title: t(m.bpgAppShell), blurb: t(m.bpgAppShellBlurb) , kinds: ['layout'] },
    { spec: 'color-picker', page: 'colorpicker', title: t(pageTitles.colorpicker), blurb: t(m.bpgColorPickerBlurb) , kinds: ['input'] },
    { spec: 'rich-text-editor', page: 'richtexteditor', title: t(pageTitles.richtexteditor), blurb: t(m.bpgRichTextEditorBlurb) , kinds: ['input'] },
    { spec: 'virtual-list', page: 'virtuallist', title: t(pageTitles.virtuallist), blurb: t(m.bpgVirtualListBlurb) , kinds: ['data'] },
    { spec: 'sortable-list', page: 'sortablelist', title: t(pageTitles.sortablelist), blurb: t(m.bpgSortableListBlurb) , kinds: ['data', 'input'] },
    { spec: 'calendar-view', page: 'calendarview', title: t(pageTitles.calendarview), blurb: t(m.bpgCalendarViewBlurb) , kinds: ['data'] },
    { spec: 'command-palette', page: 'commandpalette', title: t(pageTitles.commandpalette), blurb: t(m.bpgCommandPaletteBlurb) , kinds: ['navigation', 'overlay'] },
    { spec: 'modal', page: 'modal', title: t(pageTitles.modal), blurb: t(m.bpgModalBlurb) , kinds: ['overlay'] },
    { spec: 'drawer', page: 'drawer', title: t(pageTitles.drawer), blurb: t(m.bpgDrawerBlurb) , kinds: ['overlay'] },
    { spec: 'alert-dialog', page: 'alertdialog', title: t(pageTitles.alertdialog), blurb: t(m.bpgAlertDialogBlurb) , kinds: ['overlay', 'feedback'] },
    { spec: 'popover', page: 'popover', title: t(pageTitles.popover), blurb: t(m.bpgPopoverBlurb) , kinds: ['overlay'] },
    { spec: 'menu', page: 'menu', title: t(pageTitles.menu), blurb: t(m.bpgMenuBlurb) , kinds: ['overlay', 'navigation'] },
    { spec: 'floating-panel', page: 'floatingpanel', title: t(pageTitles.floatingpanel), blurb: t(m.bpgFloatingPanelBlurb) , kinds: ['overlay'] },
    { spec: 'tabbed-panel', page: 'tabbedpanel', title: t(pageTitles.tabbedpanel), blurb: t(m.bpgTabbedPanelBlurb) , kinds: ['navigation', 'layout'] },
    { spec: 'tabbed-modal', page: 'tabbedmodal', title: t(pageTitles.tabbedmodal), blurb: t(m.bpgTabbedModalBlurb) , kinds: ['overlay', 'navigation'] },
    { spec: 'tab-strip', page: 'tabstrip', title: t(pageTitles.tabstrip), blurb: t(m.bpgTabStripBlurb) , kinds: ['navigation'] },
    { spec: 'resizable-split-pane', page: 'resizablesplitpane', title: t(pageTitles.resizablesplitpane), blurb: t(m.bpgResizableSplitPaneBlurb) , kinds: ['layout'] },
    { spec: 'table', page: 'table', title: t(pageTitles.table), blurb: t(m.bpgTableBlurb) , kinds: ['data'] },
    { spec: 'data-grid', page: 'datagrid', title: t(pageTitles.datagrid), blurb: t(m.bpgDataGridBlurb) , kinds: ['data'] },
    { spec: 'timeline', page: 'timeline', title: t(pageTitles.timeline), blurb: t(m.bpgTimelineBlurb) , kinds: ['data'] },
    { spec: 'timeline-scrubber', page: 'timelinescrubber', title: t(pageTitles.timelinescrubber), blurb: t(m.bpgTimelineScrubberBlurb) , kinds: ['data', 'media'] },
    { spec: 'wizard', page: 'wizard', title: t(pageTitles.wizard), blurb: t(m.bpgWizardBlurb) , kinds: ['navigation'] },
  ];

  const structures: GalleryItem[] = [
    { spec: 'sidebar', page: 'sidebar', title: t(pageTitles.sidebar), blurb: t(m.bpgSidebarBlurb) , kinds: ['navigation', 'layout'] },
    { spec: 'toolbar', page: 'toolbar', title: t(pageTitles.toolbar), blurb: t(m.bpgToolbarBlurb) , kinds: ['layout'] },
    { spec: 'title-bar', page: 'titlebar', title: t(pageTitles.titlebar), blurb: t(m.bpgTitleBarBlurb) , kinds: ['layout'] },
    { spec: 'nav-bar', page: 'navbar', title: t(pageTitles.navbar), blurb: t(m.bpgNavBarBlurb) , kinds: ['navigation'] },
    { spec: 'page-header', page: 'pageheader', title: t(pageTitles.pageheader), blurb: t(m.bpgPageHeaderBlurb) , kinds: ['layout'] },
    { spec: 'section', page: 'section', title: t(pageTitles.section), blurb: t(m.bpgSectionBlurb) , kinds: ['layout'] },
    { spec: 'card-group', page: 'cardgroup', title: t(pageTitles.cardgroup), blurb: t(m.bpgCardGroupBlurb) , kinds: ['layout'] },
  ];

  return [
    { group: 'atoms', title: t(groupTitles.Atoms), items: atoms },
    { group: 'molecules', title: t(groupTitles.Molecules), items: molecules },
    { group: 'organisms', title: t(groupTitles.Organisms), items: organisms },
    { group: 'structures', title: t(groupTitles.Structures), items: structures },
  ];
}

/** The purpose filters, in the order they read as a spectrum of use. */
const KINDS: Kind[] = ['input', 'display', 'feedback', 'navigation', 'overlay', 'layout', 'data', 'media'];

export function BlueprintGallery() {
  const t = useT();
  const sections = useSections();
  const revealRef = useRef<IntersectionObserver | null>(null);
  const cardsRef = useRef<Set<Element>>(new Set());

  const [query, setQuery] = useState('');
  // Sets, not single values: the filters are additive within a row, so "Input
  // or Media" is expressible. Empty means no constraint rather than none
  // selected — a filter row that starts with everything excluded shows an empty
  // page, which reads as broken.
  const [kinds, setKinds] = useState<Set<Kind>>(new Set());
  const [layers, setLayers] = useState<Set<string>>(new Set());

  const kindLabels: Record<Kind, string> = {
    input: t(m.galKindInput),
    display: t(m.galKindDisplay),
    feedback: t(m.galKindFeedback),
    navigation: t(m.galKindNavigation),
    overlay: t(m.galKindOverlay),
    layout: t(m.galKindLayout),
    data: t(m.galKindData),
    media: t(m.galKindMedia),
  };

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sections
      .filter((section) => layers.size === 0 || layers.has(section.group))
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (kinds.size > 0 && !item.kinds.some((k) => kinds.has(k))) return false;
          if (!q) return true;
          return `${item.title} ${item.blurb} ${item.spec}`.toLowerCase().includes(q);
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, query, kinds, layers]);

  // How many cards each filter would leave, so a chip that leads nowhere says
  // so before it is pressed rather than after.
  const kindCounts = useMemo(() => {
    const counts = {} as Record<Kind, number>;
    for (const kind of KINDS) {
      counts[kind] = sections
        .filter((s) => layers.size === 0 || layers.has(s.group))
        .reduce((n, s) => n + s.items.filter((i) => i.kinds.includes(kind)).length, 0);
    }
    return counts;
  }, [sections, layers]);

  const active = query.length > 0 || kinds.size > 0 || layers.size > 0;

  // One reveal observer for the whole gallery: cards start hidden and get an
  // `is-in` class the first time they scroll into view, then stop being
  // watched. Cards register through `registerCard` as they mount.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      // No observer support: reveal everything so nothing is stuck hidden.
      cardsRef.current.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    revealRef.current = observer;
    cardsRef.current.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      revealRef.current = null;
    };
  }, []);

  const registerCard = useCallback((el: HTMLAnchorElement | null) => {
    if (!el) return;
    cardsRef.current.add(el);
    revealRef.current?.observe(el);
  }, []);

  return (
    <div className="bpGallery">
      <div className="bpGalleryFilters">
        <SearchField
          size={Size.Large}
          value={query}
          onValueChange={setQuery}
          placeholder={t(m.galFilterSearch)}
          aria-label={t(m.galFilterSearch)}
          className="bpGalleryFilterSearch"
        />

        <div className="bpGalleryFilterRow" role="group" aria-label={t(m.galPurpose)}>
          <span className="bpGalleryFilterLabel">{t(m.galPurpose)}</span>
          <div className="bpGalleryFilterChips">
            {KINDS.map((kind) => (
            <FilterChip
              key={kind}
              // Drives the chip's hue in CSS. These are CATEGORICAL colours,
              // not semantic ones: reusing the danger ramp for "Media" would
              // import a meaning that is not there, so each purpose gets its
              // own hue on the same lightness/chroma recipe every kit ramp uses.
              data-kind={kind}
              size={Size.Medium}
              selected={kinds.has(kind)}
              count={kindCounts[kind]}
              onSelectedChange={() => setKinds((current) => toggle(current, kind))}
              >
                {kindLabels[kind]}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="bpGalleryFilterRow" role="group" aria-label={t(m.galLayer)}>
          <span className="bpGalleryFilterLabel">{t(m.galLayer)}</span>
          <div className="bpGalleryFilterChips">
            {sections.map((section) => (
            <FilterChip
              key={section.group}
              data-layer={section.group}
              size={Size.Medium}
              selected={layers.has(section.group)}
              count={section.items.length}
              onSelectedChange={() => setLayers((current) => toggle(current, section.group))}
              >
                {section.title}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="bpGalleryFilterFoot">
          {active && (
            <button
              type="button"
              className="bpGalleryClear"
              onClick={() => {
                setQuery('');
                setKinds(new Set());
                setLayers(new Set());
              }}
            >
              {t(m.galClear)}
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bpGalleryEmpty">
          <Text tone={TextTone.Subtle}>{t(m.galEmpty)}</Text>
        </div>
      ) : (
        filtered.map((section) => (
          <section key={section.group}>
            <Heading level={2}>{section.title}</Heading>
            <div className="bpGalleryGrid">
              {section.items.map((item, i) => (
                <a
                  key={item.spec}
                  ref={registerCard}
                  className="bpGalleryCard"
                  href={`#/${section.group}/${item.page}`}
                  style={{ transitionDelay: `${(i % 2) * 60}ms` }}
                >
                  <span className="bpGalleryFigure" aria-hidden="true">
                    <ComponentBlueprint specId={item.spec} preview />
                  </span>
                  <span className="bpGalleryTitle">{item.title}</span>
                  <span className="bpGalleryBlurb">{item.blurb}</span>
                </a>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
