import { useCallback, useEffect, useRef } from 'react';
import { ComponentBlueprint } from './Blueprint.tsx';

type GalleryItem = { spec: string; page: string; title: string; blurb: string };

// Every atom that ships a measured blueprint, paired with the page that
// documents it. `spec` (hyphenated) drives the figure via getSpec(); `page`
// (no hyphens) is the hash route under #/atoms/<page>. A handful of atoms share
// a page (checkbox/radio/switch -> selection, card/surface -> surfaces,
// text/heading -> text). `blurb` is the component's page subtext (its lede).
// Each item is shown exactly once.
const ITEMS: GalleryItem[] = [
  {
    spec: 'button',
    page: 'button',
    title: 'Button',
    blurb:
      'Buttons trigger actions. Use Button for labeled actions and IconButton for compact, icon-only controls such as toolbars and card corners.',
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
      <div className="bpGalleryGrid">
        {ITEMS.map((item, i) => (
          <a
            key={item.title}
            ref={registerCard}
            className="bpGalleryCard"
            href={`#/atoms/${item.page}`}
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
    </div>
  );
}
