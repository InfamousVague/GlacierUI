import { useCallback, useEffect, useRef } from 'react';
import { Heading, useT } from '@glacier/react';
import { ComponentBlueprint } from './Blueprint.tsx';
import { groupTitles, m, pageTitles } from './i18n.ts';

type GalleryItem = { spec: string; page: string; title: string; blurb: string };
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
    { spec: 'button', page: 'button', title: t(pageTitles.button), blurb: t(m.bpgButtonBlurb) },
    { spec: 'icon', page: 'icon', title: t(pageTitles.icon), blurb: t(m.bpgIconBlurb) },
    { spec: 'pill', page: 'pill', title: t(pageTitles.pill), blurb: t(m.bpgPillBlurb) },
    { spec: 'counter-badge', page: 'counterbadge', title: t(pageTitles.counterbadge), blurb: t(m.bpgCounterBadgeBlurb) },
    { spec: 'status-dot', page: 'statusdot', title: t(pageTitles.statusdot), blurb: t(m.bpgStatusDotBlurb) },
    { spec: 'avatar', page: 'avatar', title: t(pageTitles.avatar), blurb: t(m.bpgAvatarBlurb) },
    { spec: 'divider', page: 'divider', title: t(pageTitles.divider), blurb: t(m.bpgDividerBlurb) },
    { spec: 'callout', page: 'callout', title: t(pageTitles.callout), blurb: t(m.bpgCalloutBlurb) },
    { spec: 'banner', page: 'banner', title: t(pageTitles.banner), blurb: t(m.bpgBannerBlurb) },
    { spec: 'empty-state', page: 'emptystate', title: t(pageTitles.emptystate), blurb: t(m.bpgEmptyStateBlurb) },
    { spec: 'code-block', page: 'codeblock', title: t(pageTitles.codeblock), blurb: t(m.bpgCodeBlockBlurb) },
    { spec: 'text', page: 'text', title: t(m.bpgText), blurb: t(m.bpgTypographyBlurb) },
    { spec: 'heading', page: 'text', title: t(m.bpgHeading), blurb: t(m.bpgTypographyBlurb) },
    { spec: 'kbd', page: 'kbd', title: t(m.bpgKbd), blurb: t(m.bpgKbdBlurb) },
    { spec: 'textarea', page: 'textarea', title: t(pageTitles.textarea), blurb: t(m.bpgTextareaBlurb) },
    { spec: 'checkbox', page: 'selection', title: t(m.bpgCheckbox), blurb: t(m.bpgSelectionBlurb) },
    { spec: 'radio', page: 'selection', title: t(m.bpgRadio), blurb: t(m.bpgSelectionBlurb) },
    { spec: 'switch', page: 'selection', title: t(m.bpgSwitch), blurb: t(m.bpgSelectionBlurb) },
    { spec: 'radio-card', page: 'radiocard', title: t(pageTitles.radiocard), blurb: t(m.bpgRadioCardBlurb) },
    { spec: 'toggle', page: 'toggle', title: t(pageTitles.toggle), blurb: t(m.bpgToggleBlurb) },
    { spec: 'search-field', page: 'searchfield', title: t(pageTitles.searchfield), blurb: t(m.bpgSearchFieldBlurb) },
    { spec: 'number-input', page: 'numberinput', title: t(pageTitles.numberinput), blurb: t(m.bpgNumberInputBlurb) },
    { spec: 'otp-field', page: 'otpfield', title: t(pageTitles.otpfield), blurb: t(m.bpgOtpFieldBlurb) },
    { spec: 'slider', page: 'slider', title: t(pageTitles.slider), blurb: t(m.bpgSliderBlurb) },
    { spec: 'meter', page: 'meter', title: t(pageTitles.meter), blurb: t(m.bpgMeterBlurb) },
    { spec: 'progress-bar', page: 'progress', title: t(pageTitles.progress), blurb: t(m.bpgProgressBarBlurb) },
    { spec: 'progress-ring', page: 'progressring', title: t(pageTitles.progressring), blurb: t(m.bpgProgressRingBlurb) },
    { spec: 'spinner', page: 'spinner', title: t(pageTitles.spinner), blurb: t(m.bpgSpinnerBlurb) },
    { spec: 'steps', page: 'steps', title: t(pageTitles.steps), blurb: t(m.bpgStepsBlurb) },
    { spec: 'segmented-bar', page: 'segmentedbar', title: t(pageTitles.segmentedbar), blurb: t(m.bpgSegmentedBarBlurb) },
    { spec: 'skeleton', page: 'skeleton', title: t(pageTitles.skeleton), blurb: t(m.bpgSkeletonBlurb) },
    { spec: 'card', page: 'surfaces', title: t(m.bpgCard), blurb: t(m.bpgCardBlurb) },
    { spec: 'surface', page: 'surfaces', title: t(m.bpgSurface), blurb: t(m.bpgSurfaceBlurb) },
    { spec: 'stat-tile', page: 'stattile', title: t(pageTitles.stattile), blurb: t(m.bpgStatTileBlurb) },
    { spec: 'filter-chip', page: 'filterchip', title: t(pageTitles.filterchip), blurb: t(m.bpgFilterChipBlurb) },
    { spec: 'rating', page: 'rating', title: t(pageTitles.rating), blurb: t(m.bpgRatingBlurb) },
    { spec: 'image', page: 'image', title: t(pageTitles.image), blurb: t(m.bpgImageBlurb) },
    { spec: 'device-frame', page: 'deviceframe', title: t(pageTitles.deviceframe), blurb: t(m.bpgDeviceFrameBlurb) },
  ];

  const molecules: GalleryItem[] = [
    { spec: 'field', page: 'field', title: t(m.bpgField), blurb: t(m.bpgFieldBlurb) },
    { spec: 'select', page: 'select', title: t(pageTitles.select), blurb: t(m.bpgSelectBlurb) },
    { spec: 'combobox', page: 'combobox', title: t(pageTitles.combobox), blurb: t(m.bpgComboboxBlurb) },
    { spec: 'multi-select', page: 'multiselect', title: t(pageTitles.multiselect), blurb: t(m.bpgMultiSelectBlurb) },
    { spec: 'segmented-control', page: 'segmented', title: t(pageTitles.segmented), blurb: t(m.bpgSegmentedControlBlurb) },
    { spec: 'tabs', page: 'tabs', title: t(pageTitles.tabs), blurb: t(m.bpgTabsBlurb) },
    { spec: 'tooltip', page: 'tooltip', title: t(pageTitles.tooltip), blurb: t(m.bpgTooltipBlurb) },
    { spec: 'toast', page: 'toast', title: t(pageTitles.toast), blurb: t(m.bpgToastBlurb) },
    { spec: 'scroll-area', page: 'scrollarea', title: t(pageTitles.scrollarea), blurb: t(m.bpgScrollAreaBlurb) },
    { spec: 'carousel', page: 'carousel', title: t(pageTitles.carousel), blurb: t(m.bpgCarouselBlurb) },
    { spec: 'heatmap', page: 'heatmap', title: t(pageTitles.heatmap), blurb: t(m.bpgHeatmapBlurb) },
    { spec: 'spotlight', page: 'spotlight', title: t(pageTitles.spotlight), blurb: t(m.bpgSpotlightBlurb) },
    { spec: 'breadcrumbs', page: 'breadcrumbs', title: t(pageTitles.breadcrumbs), blurb: t(m.bpgBreadcrumbsBlurb) },
    { spec: 'pagination', page: 'pagination', title: t(pageTitles.pagination), blurb: t(m.bpgPaginationBlurb) },
    { spec: 'accordion', page: 'accordion', title: t(pageTitles.accordion), blurb: t(m.bpgAccordionBlurb) },
    { spec: 'list', page: 'list', title: t(pageTitles.list), blurb: t(m.bpgListBlurb) },
  ];

  const organisms: GalleryItem[] = [
    { spec: 'app-shell', page: 'appshell', title: t(m.bpgAppShell), blurb: t(m.bpgAppShellBlurb) },
    { spec: 'modal', page: 'modal', title: t(pageTitles.modal), blurb: t(m.bpgModalBlurb) },
    { spec: 'drawer', page: 'drawer', title: t(pageTitles.drawer), blurb: t(m.bpgDrawerBlurb) },
    { spec: 'alert-dialog', page: 'alertdialog', title: t(pageTitles.alertdialog), blurb: t(m.bpgAlertDialogBlurb) },
    { spec: 'popover', page: 'popover', title: t(pageTitles.popover), blurb: t(m.bpgPopoverBlurb) },
    { spec: 'menu', page: 'menu', title: t(pageTitles.menu), blurb: t(m.bpgMenuBlurb) },
    { spec: 'floating-panel', page: 'floatingpanel', title: t(pageTitles.floatingpanel), blurb: t(m.bpgFloatingPanelBlurb) },
    { spec: 'tabbed-panel', page: 'tabbedpanel', title: t(pageTitles.tabbedpanel), blurb: t(m.bpgTabbedPanelBlurb) },
    { spec: 'tabbed-modal', page: 'tabbedmodal', title: t(pageTitles.tabbedmodal), blurb: t(m.bpgTabbedModalBlurb) },
    { spec: 'tab-strip', page: 'tabstrip', title: t(pageTitles.tabstrip), blurb: t(m.bpgTabStripBlurb) },
    { spec: 'resizable-split-pane', page: 'resizablesplitpane', title: t(pageTitles.resizablesplitpane), blurb: t(m.bpgResizableSplitPaneBlurb) },
    { spec: 'table', page: 'table', title: t(pageTitles.table), blurb: t(m.bpgTableBlurb) },
    { spec: 'data-grid', page: 'datagrid', title: t(pageTitles.datagrid), blurb: t(m.bpgDataGridBlurb) },
    { spec: 'timeline', page: 'timeline', title: t(pageTitles.timeline), blurb: t(m.bpgTimelineBlurb) },
    { spec: 'wizard', page: 'wizard', title: t(pageTitles.wizard), blurb: t(m.bpgWizardBlurb) },
  ];

  const structures: GalleryItem[] = [
    { spec: 'sidebar', page: 'sidebar', title: t(pageTitles.sidebar), blurb: t(m.bpgSidebarBlurb) },
    { spec: 'toolbar', page: 'toolbar', title: t(pageTitles.toolbar), blurb: t(m.bpgToolbarBlurb) },
    { spec: 'title-bar', page: 'titlebar', title: t(pageTitles.titlebar), blurb: t(m.bpgTitleBarBlurb) },
    { spec: 'nav-bar', page: 'navbar', title: t(pageTitles.navbar), blurb: t(m.bpgNavBarBlurb) },
    { spec: 'page-header', page: 'pageheader', title: t(pageTitles.pageheader), blurb: t(m.bpgPageHeaderBlurb) },
    { spec: 'section', page: 'section', title: t(pageTitles.section), blurb: t(m.bpgSectionBlurb) },
    { spec: 'card-group', page: 'cardgroup', title: t(pageTitles.cardgroup), blurb: t(m.bpgCardGroupBlurb) },
  ];

  return [
    { group: 'atoms', title: t(groupTitles.Atoms), items: atoms },
    { group: 'molecules', title: t(groupTitles.Molecules), items: molecules },
    { group: 'organisms', title: t(groupTitles.Organisms), items: organisms },
    { group: 'structures', title: t(groupTitles.Structures), items: structures },
  ];
}

export function BlueprintGallery() {
  const sections = useSections();
  const revealRef = useRef<IntersectionObserver | null>(null);
  const cardsRef = useRef<Set<Element>>(new Set());

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
      {sections.map((section) => (
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
      ))}
    </div>
  );
}
