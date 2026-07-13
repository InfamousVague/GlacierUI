import { useId, type ReactNode } from 'react';
import type { Locale } from '@glacier/react';

/**
 * A small country flag drawn as inline SVG and clipped to a squircle (a
 * superellipse rounded square), shown before each language in the pickers. The
 * flags are simplified to read at ~18px: the point is a recognizable national
 * cue, not a heraldic reproduction. `en` uses the Union Jack, `pt` Portugal,
 * `ar` Saudi Arabia, `zh` China.
 */

// A superellipse (squircle): flatter sides than a circle, smoother corners than
// a rounded rect. Used both to clip each flag and to stroke a hairline edge so
// light flags (Japan) still read against the surface.
const SQUIRCLE = 'M0,12 C0,4 4,0 12,0 C20,0 24,4 24,12 C24,20 20,24 12,24 C4,24 0,20 0,12 Z';

const FLAGS: Record<Locale, ReactNode> = {
  // United Kingdom — simplified Union Jack (centered crosses).
  en: (
    <>
      <rect width="24" height="24" fill="#012169" />
      <path d="M0,0 L24,24 M24,0 L0,24" stroke="#ffffff" strokeWidth="5" />
      <path d="M0,0 L24,24 M24,0 L0,24" stroke="#C8102E" strokeWidth="2" />
      <path d="M12,0 V24 M0,12 H24" stroke="#ffffff" strokeWidth="7" />
      <path d="M12,0 V24 M0,12 H24" stroke="#C8102E" strokeWidth="4" />
    </>
  ),
  // Spain — red / (wider) gold / red.
  es: (
    <>
      <rect width="24" height="24" fill="#AA151B" />
      <rect y="6" width="24" height="12" fill="#F1BF00" />
    </>
  ),
  // France — blue / white / red verticals.
  fr: (
    <>
      <rect width="8" height="24" fill="#002395" />
      <rect x="8" width="8" height="24" fill="#ffffff" />
      <rect x="16" width="8" height="24" fill="#ED2939" />
    </>
  ),
  // Germany — black / red / gold horizontals.
  de: (
    <>
      <rect width="24" height="8" fill="#000000" />
      <rect y="8" width="24" height="8" fill="#DD0000" />
      <rect y="16" width="24" height="8" fill="#FFCE00" />
    </>
  ),
  // Japan — red disc on white.
  ja: (
    <>
      <rect width="24" height="24" fill="#ffffff" />
      <circle cx="12" cy="12" r="6" fill="#BC002D" />
    </>
  ),
  // Portugal — green / red with a hint of the armillary ring at the seam.
  pt: (
    <>
      <rect width="24" height="24" fill="#FF0000" />
      <rect width="9.6" height="24" fill="#006600" />
      <circle cx="9.6" cy="12" r="3" fill="none" stroke="#FFCB00" strokeWidth="1.3" />
    </>
  ),
  // China — a single gold star on red.
  zh: (
    <>
      <rect width="24" height="24" fill="#DE2910" />
      <path
        d="M12,5 L13.76,10.28 L19.32,10.28 L14.82,13.54 L16.58,18.82 L12,15.56 L7.42,18.82 L9.18,13.54 L4.68,10.28 L10.24,10.28 Z"
        fill="#FFDE00"
      />
    </>
  ),
  // Saudi Arabia — green with the horizontal sword line hinted.
  ar: (
    <>
      <rect width="24" height="24" fill="#006C35" />
      <rect x="4" y="15" width="16" height="1.6" rx="0.8" fill="#ffffff" />
    </>
  ),
};

export function FlagSquircle({ code, size = 18 }: { code: Locale; size?: number }) {
  const clipId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={SQUIRCLE} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>{FLAGS[code] ?? <rect width="24" height="24" fill="var(--glacier-gray-6)" />}</g>
      <path d={SQUIRCLE} fill="none" stroke="rgba(128,128,128,0.35)" strokeWidth="1" />
    </svg>
  );
}
