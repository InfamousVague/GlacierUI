import { useCallback, useEffect, useRef, useState } from 'react';
import { ComponentBlueprint } from './Blueprint.tsx';

type GalleryItem = { spec: string; page: string; title: string };

// Every atom that ships a measured blueprint, paired with the page that
// documents it. `spec` (hyphenated) drives the figure via getSpec(); `page`
// (no hyphens) is the hash route under #/atoms/<page>. A handful of atoms share
// a page (checkbox/radio/switch -> selection, card/surface -> surfaces,
// text/heading -> text), which is intentional: the gallery shows each figure.
const ITEMS: GalleryItem[] = [
  { spec: 'button', page: 'button', title: 'Button' },
  { spec: 'pill', page: 'pill', title: 'Pill' },
  { spec: 'counter-badge', page: 'counterbadge', title: 'Counter Badge' },
  { spec: 'status-dot', page: 'statusdot', title: 'Status Dot' },
  { spec: 'avatar', page: 'avatar', title: 'Avatar' },
  { spec: 'divider', page: 'divider', title: 'Divider' },
  { spec: 'callout', page: 'callout', title: 'Callout' },
  { spec: 'banner', page: 'banner', title: 'Banner' },
  { spec: 'empty-state', page: 'emptystate', title: 'Empty State' },
  { spec: 'code-block', page: 'codeblock', title: 'Code Block' },
  { spec: 'text', page: 'text', title: 'Text' },
  { spec: 'heading', page: 'text', title: 'Heading' },
  { spec: 'textarea', page: 'textarea', title: 'Textarea' },
  { spec: 'checkbox', page: 'selection', title: 'Checkbox' },
  { spec: 'radio', page: 'selection', title: 'Radio' },
  { spec: 'switch', page: 'selection', title: 'Switch' },
  { spec: 'radio-card', page: 'radiocard', title: 'Radio Card' },
  { spec: 'toggle', page: 'toggle', title: 'Toggle' },
  { spec: 'search-field', page: 'searchfield', title: 'Search Field' },
  { spec: 'number-input', page: 'numberinput', title: 'Number Input' },
  { spec: 'slider', page: 'slider', title: 'Slider' },
  { spec: 'meter', page: 'meter', title: 'Meter' },
  { spec: 'progress-bar', page: 'progress', title: 'Progress Bar' },
  { spec: 'progress-ring', page: 'progressring', title: 'Progress Ring' },
  { spec: 'spinner', page: 'spinner', title: 'Spinner' },
  { spec: 'steps', page: 'steps', title: 'Steps' },
  { spec: 'segmented-bar', page: 'segmentedbar', title: 'Segmented Bar' },
  { spec: 'skeleton', page: 'skeleton', title: 'Skeleton' },
  { spec: 'card', page: 'surfaces', title: 'Card' },
  { spec: 'surface', page: 'surfaces', title: 'Surface' },
];

// The reel repeats the full set on scroll for an effectively endless feel while
// keeping the DOM bounded (30 x MAX_BATCHES cards at most).
const MAX_BATCHES = 6;

export function BlueprintGallery() {
  const [batches, setBatches] = useState(1);
  const revealRef = useRef<IntersectionObserver | null>(null);
  const cardsRef = useRef<Set<Element>>(new Set());
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // One reveal observer for the whole gallery: cards start hidden and get an
  // `is-in` class the first time they scroll into view, then stop being
  // watched. The effect runs after the first batch has already mounted, so it
  // observes those cards up front; later batches register via `registerCard`.
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

  // Sentinel observer drives the infinite scroll: appending a batch as the end
  // of the list approaches, until the cap is reached.
  useEffect(() => {
    if (batches >= MAX_BATCHES) return;
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setBatches((b) => Math.min(b + 1, MAX_BATCHES));
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [batches]);

  return (
    <div className="bpGallery">
      <div className="bpGalleryGrid">
        {Array.from({ length: batches }).flatMap((_, batch) =>
          ITEMS.map((item, i) => (
            <a
              key={`${batch}-${item.spec}-${i}`}
              ref={registerCard}
              className="bpGalleryCard"
              href={`#/atoms/${item.page}`}
              style={{ transitionDelay: `${(i % 4) * 40}ms` }}
            >
              <span className="bpGalleryFigure" aria-hidden="true">
                <ComponentBlueprint specId={item.spec} preview />
              </span>
              <span className="bpGalleryTitle">{item.title}</span>
            </a>
          )),
        )}
      </div>
      {batches < MAX_BATCHES && <div ref={sentinelRef} aria-hidden="true" className="bpGallerySentinel" />}
    </div>
  );
}
