import { useCallback, useEffect, useRef } from 'react';
import { Heading } from '@glacier/react';
import { ComponentBlueprint } from './Blueprint.tsx';

type GalleryItem = { spec: string; page: string; title: string; blurb: string };
type Section = { group: string; title: string; items: GalleryItem[] };

// Every component that ships a measured blueprint, grouped by layer. `spec`
// (hyphenated) drives the figure via getSpec(); `page` (no hyphens) is the hash
// route under #/<group>/<page>. `blurb` is a one-line description. A handful of
// atoms share a page (checkbox/radio/switch -> selection, card/surface ->
// surfaces, text/heading -> text).
const ATOMS: GalleryItem[] = [
  {
    spec: 'button',
    page: 'button',
    title: 'Button',
    blurb:
      'Buttons trigger actions. Use Button for labeled actions and IconButton for compact, icon-only controls such as toolbars and card corners.',
  },
  {
    spec: 'icon',
    page: 'icon',
    title: 'Icon',
    blurb:
      'A single-glyph SVG on a 24-unit grid: sized by a pixel prop, stroked at a shared weight, and colored by currentColor so it follows the text around it.',
  },
  {
    spec: 'pill',
    page: 'pill',
    title: 'Pill',
    blurb:
      'A small inline label for statuses, counts, and categories, with an optional leading icon and an optional remove button that turns it into a dismissible tag.',
  },
  {
    spec: 'counter-badge',
    page: 'counterbadge',
    title: 'Counter Badge',
    blurb:
      'A small numeric badge for unread or attention counts on nav icons and tabs. Pill-shaped so single digits stay circular, with tabular figures so the width does not jitter as the count changes.',
  },
  {
    spec: 'status-dot',
    page: 'statusdot',
    title: 'Status Dot',
    blurb:
      'A tiny colored dot for run, connection, and sync states. It reads at a glance next to a label, and can pulse to signal a live or in-progress state.',
  },
  {
    spec: 'avatar',
    page: 'avatar',
    title: 'Avatar',
    blurb:
      'A compact representation of a person or entity. Shows an image when one is available and falls back to initials, so a row of people never collapses into empty squares.',
  },
  {
    spec: 'divider',
    page: 'divider',
    title: 'Divider',
    blurb:
      'A hairline break between groups of content, horizontally, vertically, or with a centered label. Reach for it only when spacing alone does not separate two groups clearly enough.',
  },
  {
    spec: 'callout',
    page: 'callout',
    title: 'Callout',
    blurb:
      'An admonition box for notes, tips, and warnings. It draws the eye to a short aside without pulling the reader out of the flow, tinting its surface and border by tone.',
  },
  {
    spec: 'banner',
    page: 'banner',
    title: 'Banner',
    blurb:
      'A full-width inline alert strip for app chrome. It announces a system message across the top of a view, pairing a short message with an optional action and a dismiss control.',
  },
  {
    spec: 'empty-state',
    page: 'emptystate',
    title: 'Empty State',
    blurb:
      'A centered placeholder for a view with nothing in it yet. It names what is missing and, when the user can act, points the way forward, so a blank screen reads as a deliberate stop rather than a bug.',
  },
  {
    spec: 'code-block',
    page: 'codeblock',
    title: 'Code Block',
    blurb:
      'A styled code surface with a copy button and an optional line-number gutter. It ships no syntax highlighter, so it stays dependency-light: pass pre-highlighted markup as children, or render plain monospace.',
  },
  {
    spec: 'text',
    page: 'text',
    title: 'Text',
    blurb:
      "The typography atoms put every piece of copy on the kit's type scale. Text and Heading cover body copy and titles, while Label, Link, and Kbd handle form captions, anchors, and keyboard keys.",
  },
  {
    spec: 'heading',
    page: 'text',
    title: 'Heading',
    blurb:
      "The typography atoms put every piece of copy on the kit's type scale. Text and Heading cover body copy and titles, while Label, Link, and Kbd handle form captions, anchors, and keyboard keys.",
  },
  {
    spec: 'kbd',
    page: 'kbd',
    title: 'Kbd',
    blurb:
      'A monospace key cap for keyboard keys and shortcuts, sized in em units so it rides the surrounding text, with a raised bottom edge and a glass variant for frosted surfaces.',
  },
  {
    spec: 'textarea',
    page: 'textarea',
    title: 'Textarea',
    blurb:
      "A multi-line text input that mirrors Input's surface, hairline border, and focus ring. It grows on demand and can be resized vertically.",
  },
  {
    spec: 'checkbox',
    page: 'selection',
    title: 'Checkbox',
    blurb:
      'Checkbox, Radio, and Switch are the three standard selection controls. Each one wraps a native input, so forms, focus, and keyboard behavior come from the platform.',
  },
  {
    spec: 'radio',
    page: 'selection',
    title: 'Radio',
    blurb:
      'Checkbox, Radio, and Switch are the three standard selection controls. Each one wraps a native input, so forms, focus, and keyboard behavior come from the platform.',
  },
  {
    spec: 'switch',
    page: 'selection',
    title: 'Switch',
    blurb:
      'Checkbox, Radio, and Switch are the three standard selection controls. Each one wraps a native input, so forms, focus, and keyboard behavior come from the platform.',
  },
  {
    spec: 'radio-card',
    page: 'radiocard',
    title: 'Radio Card',
    blurb:
      'A selectable card with radio semantics. It turns a one-of-many choice into a preview tile with a title, description, and icon, so options like a theme or a provider read as pickable surfaces.',
  },
  {
    spec: 'toggle',
    page: 'toggle',
    title: 'Toggle',
    blurb:
      'A press-state button for stateful actions like password reveal, view modes, and formatting controls. Toggle answers whether a mode is active. For an on or off setting, use Switch.',
  },
  {
    spec: 'search-field',
    page: 'searchfield',
    title: 'Search Field',
    blurb:
      'A search input with a leading magnifier, a clear button that appears once there is a value, and an optional slot for a keyboard shortcut hint.',
  },
  {
    spec: 'number-input',
    page: 'numberinput',
    title: 'Number Input',
    blurb:
      'A numeric stepper: a minus button, a centered native number input with tabular figures, and a plus button in one bordered group. Results clamp to the bounds and the step buttons disable at the ends.',
  },
  {
    spec: 'otp-field',
    page: 'otpfield',
    title: 'OTP Field',
    blurb:
      'A one-time passcode entry: a row of character cells driven by one invisible native input, so typing, paste, and platform code autofill behave natively while the caret blinks in the next empty cell.',
  },
  {
    spec: 'slider',
    page: 'slider',
    title: 'Slider',
    blurb: 'A styled native range input with a filled leading track and an iOS-style thumb.',
  },
  {
    spec: 'meter',
    page: 'meter',
    title: 'Meter',
    blurb:
      'A segmented level indicator, a health bar for how good or full something currently is, such as password strength or remaining quota. For how far along a task is, use Progress Bar.',
  },
  {
    spec: 'progress-bar',
    page: 'progress',
    title: 'Progress Bar',
    blurb:
      'Shows how far a known task has gotten. When the duration is unknown, use the indeterminate sweep, or reach for Spinner. For a level rather than progress, use Meter.',
  },
  {
    spec: 'progress-ring',
    page: 'progressring',
    title: 'Progress Ring',
    blurb:
      'A compact radial progress indicator. Reach for it in tight spots like cards, avatars, or toolbars where a linear bar would not fit. For linear progress use Progress Bar.',
  },
  {
    spec: 'spinner',
    page: 'spinner',
    title: 'Spinner',
    blurb:
      'An indeterminate loading indicator for short waits. When progress is measurable, use a Progress Bar instead. Button uses a Spinner for its own loading state.',
  },
  {
    spec: 'steps',
    page: 'steps',
    title: 'Steps',
    blurb:
      'A row of progress dots that marks how far along a tour, wizard, or quiz has gone. Completed steps fill solid, the current step stands out larger, and upcoming steps sit hollow.',
  },
  {
    spec: 'segmented-bar',
    page: 'segmentedbar',
    title: 'Segmented Bar',
    blurb:
      'A single proportional bar split into slices sized by share of the total, for a breakdown of parts such as a storage or budget split. Unlike Meter, it shows a continuous composition.',
  },
  {
    spec: 'skeleton',
    page: 'skeleton',
    title: 'Skeleton',
    blurb:
      "The kit's one loading-placeholder primitive. Every atom and molecule exposes a skeleton prop that renders through it with the component's exact geometry, so layouts never shift when content arrives.",
  },
  {
    spec: 'card',
    page: 'surfaces',
    title: 'Card',
    blurb:
      'A contained block for grouping related content, with optional elevation, hover interaction, and a glass material.',
  },
  {
    spec: 'surface',
    page: 'surfaces',
    title: 'Surface',
    blurb: 'A plain background layer that maps directly to the surface tokens.',
  },
  {
    spec: 'stat-tile',
    page: 'stattile',
    title: 'Stat Tile',
    blurb:
      'A compact stat micro-card: an optional leading icon, a prominent value, and a muted label, with an optional trailing delta, built on the card surface tokens.',
  },
  {
    spec: 'filter-chip',
    page: 'filterchip',
    title: 'Filter Chip',
    blurb:
      'A toggleable filter pill for faceted filtering; the selected state paints the accent soft tint, with an optional leading icon and a trailing count.',
  },
  {
    spec: 'rating',
    page: 'rating',
    title: 'Rating',
    blurb:
      'A star rating: an interactive native radio group by default, or a read-only display that supports fractional fill.',
  },
  {
    spec: 'image',
    page: 'image',
    title: 'Image',
    blurb:
      'A framed image with a fixed aspect ratio: it holds its box while loading, fits with object-fit, rounds its corners, and falls back on error.',
  },
  {
    spec: 'device-frame',
    page: 'deviceframe',
    title: 'Device Frame',
    blurb:
      'A decorative phone bezel with a fixed-aspect, inset screen that hosts a preview, screenshot, or iframe in preset widths.',
  },
];

const MOLECULES: GalleryItem[] = [
  { spec: 'field', page: 'field', title: 'Field', blurb: 'Groups a label, control, and a reserved hint or error line into one accessible form field.' },
  { spec: 'select', page: 'select', title: 'Select', blurb: 'A styled replacement for the native select: a trigger that matches Input, with a glass dropdown of options.' },
  { spec: 'combobox', page: 'combobox', title: 'Combobox', blurb: 'An editable input that filters a glass listbox of suggestions and commits one matching value.' },
  { spec: 'multi-select', page: 'multiselect', title: 'MultiSelect', blurb: 'An editable tag control that filters and toggles several values from a portaled multi-select listbox.' },
  { spec: 'segmented-control', page: 'segmented', title: 'Segmented Control', blurb: 'A compact row of mutually exclusive options with a thumb that slides under the selected one.' },
  { spec: 'tabs', page: 'tabs', title: 'Tabs', blurb: 'A tablist with a springing indicator that switches between cross-faded panels.' },
  { spec: 'tooltip', page: 'tooltip', title: 'Tooltip', blurb: 'A small glass bubble that describes its trigger on hover or focus, positioned around it.' },
  { spec: 'toast', page: 'toast', title: 'Toast', blurb: 'A single-slot notification that slides up from the bottom center; a new one replaces the last.' },
  { spec: 'scroll-area', page: 'scrollarea', title: 'Scroll Area', blurb: 'A capped, keyboard-scrollable viewport with edge fade masks and a thin themed scrollbar.' },
  { spec: 'carousel', page: 'carousel', title: 'Carousel', blurb: 'A horizontal snap-scroll strip of cards with prev/next controls that appear on overflow.' },
  { spec: 'heatmap', page: 'heatmap', title: 'Heatmap', blurb: 'A grid of level-shaded cells for calendar-style activity, with an optional less-to-more legend.' },
  { spec: 'spotlight', page: 'spotlight', title: 'Spotlight', blurb: 'A guided-tour overlay that dims the screen, cuts out the target, and anchors a step callout.' },
  { spec: 'breadcrumbs', page: 'breadcrumbs', title: 'Breadcrumbs', blurb: 'A path trail that shows the current location inside a hierarchy and makes navigation feel grounded.' },
  { spec: 'pagination', page: 'pagination', title: 'Pagination', blurb: 'A compact pager for moving through pages of results or content without losing context.' },
  { spec: 'accordion', page: 'accordion', title: 'Accordion', blurb: 'A stack of disclosure panels that expand to reveal more detail in place.' },
  { spec: 'list', page: 'list', title: 'List', blurb: 'Single-column content rows as raised cards with leading and trailing slots, or flat divided rows.' },
];

const ORGANISMS: GalleryItem[] = [
  { spec: 'app-shell', page: 'appshell', title: 'AppShell', blurb: 'The app frame: a sticky sidebar beside a scrollable main column with an optional header, collapsing to a drawer on small screens.' },
  { spec: 'modal', page: 'modal', title: 'Modal', blurb: 'A focus-trapped dialog centered over a blurred overlay, with header, body, and footer slots.' },
  { spec: 'drawer', page: 'drawer', title: 'Drawer', blurb: 'A focus-trapped modal sheet that enters from a viewport edge and keeps the surrounding page visible behind a blurred overlay.' },
  { spec: 'alert-dialog', page: 'alertdialog', title: 'AlertDialog', blurb: 'A deliberate confirmation dialog that focuses Cancel first and gives consequential actions an explicit, readable label.' },
  { spec: 'popover', page: 'popover', title: 'Popover', blurb: 'A floating, anchored panel with an arrow that toggles open from a trigger.' },
  { spec: 'menu', page: 'menu', title: 'Menu', blurb: 'A portalled action menu of items with icons, shortcuts, separators, and section labels.' },
  { spec: 'floating-panel', page: 'floatingpanel', title: 'Floating Panel', blurb: 'A draggable dialog with a grab-bar handle, title, close button, and a scrollable body.' },
  { spec: 'tabbed-panel', page: 'tabbedpanel', title: 'Tabbed Panel', blurb: 'A bordered panel whose tab header switches the body, with an optional actions slot.' },
  { spec: 'tabbed-modal', page: 'tabbedmodal', title: 'Tabbed Modal', blurb: 'A modal with a fixed left rail of sections and a scrolling content pane.' },
  { spec: 'tab-strip', page: 'tabstrip', title: 'Tab Strip', blurb: 'A scrollable row of closable tabs with icons and a springing active underline.' },
  { spec: 'resizable-split-pane', page: 'resizablesplitpane', title: 'Resizable Split Pane', blurb: 'Two panes divided by a draggable separator that resizes them by ratio.' },
  { spec: 'table', page: 'table', title: 'Table', blurb: 'A semantic table for rows of structured data, with accessible headers and a caption slot.' },
  { spec: 'data-grid', page: 'datagrid', title: 'Data Grid', blurb: 'A column-driven grid with client sorting, row selection, loading and empty states, and a roving-focus keyboard model.' },
];

const SECTIONS: Section[] = [
  { group: 'atoms', title: 'Atoms', items: ATOMS },
  { group: 'molecules', title: 'Molecules', items: MOLECULES },
  { group: 'organisms', title: 'Organisms', items: ORGANISMS },
];

export function BlueprintGallery() {
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
      {SECTIONS.map((section) => (
        <section key={section.group}>
          <Heading level={2}>{section.title}</Heading>
          <div className="bpGalleryGrid">
            {section.items.map((item, i) => (
              <a
                key={item.title}
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
