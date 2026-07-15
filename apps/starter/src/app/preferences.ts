import { accentOptions, type Density, type SansFont, type MonoFont } from '@glacier/tokens';
import type { VisualFeedbackVariant, VisualFeedbackIntensity } from '@glacier/react';

/**
 * The app-wide look-and-feel knobs. Everything here maps to a Glacier token
 * surface: theme and density and accent are stamped as `data-*` attributes on
 * the document element, which the generated token CSS keys off. Persisted so a
 * reopened window remembers the user's choices.
 */
import type { AppLocale } from './i18n.ts';

export interface Preferences {
  theme: 'system' | 'light' | 'dark';
  density: Density;
  layout: 'floating' | 'full';
  accent: string;
  /** The sans typeface, stamped as data-font. */
  font: SansFont;
  /** The monospace typeface, stamped as data-mono. */
  mono: MonoFont;
  /** Corner-rounding multiplier for every radius token (1 = default). */
  radiusScale: number;
  /** Backdrop-blur multiplier for every glass surface (1 = default). */
  frostedness: number;
  locale: AppLocale;
  haptics: boolean;
  /** The on-screen counterpart to haptics; fires for every pointer type. */
  visualFeedback: boolean;
  visualFeedbackVariant: VisualFeedbackVariant;
  visualFeedbackIntensity: VisualFeedbackIntensity;
  sidebarCollapsed: boolean;
}

export const ACCENTS = accentOptions;

export const SANS_FONTS: Array<{ value: SansFont; label: string }> = [
  { value: 'inter', label: 'Inter' },
  { value: 'noto', label: 'Noto Sans' },
  { value: 'plex', label: 'IBM Plex' },
];

export const MONO_FONTS: Array<{ value: MonoFont; label: string }> = [
  { value: 'jetbrains', label: 'JetBrains' },
  { value: 'plex', label: 'IBM Plex' },
];

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'dark',
  density: 'comfortable',
  layout: 'floating',
  accent: accentOptions[0]!.name,
  font: 'inter',
  mono: 'jetbrains',
  radiusScale: 1,
  frostedness: 1,
  locale: 'en',
  haptics: false,
  visualFeedback: false,
  visualFeedbackVariant: 'shockwave',
  visualFeedbackIntensity: 'subtle',
  sidebarCollapsed: false,
};

const STORAGE_KEY = 'glacier-starter:preferences';

export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: Preferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    /* ignore write failures (private mode, quota) */
  }
}

/**
 * Reflect the preferences onto the document element. Each value that equals
 * its default clears the attribute so the token `:root` defaults win, exactly
 * how the Glacier docs app drives its own theming.
 */
export function applyPreferences(preferences: Preferences): void {
  const root = document.documentElement;
  const { theme, density, layout, accent, font, mono, radiusScale, frostedness } = preferences;

  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);

  if (density === 'comfortable') root.removeAttribute('data-density');
  else root.setAttribute('data-density', density);

  // The portalled kit surfaces (Drawer, Modal) read the layout mode from the
  // root, so it is always stamped.
  root.setAttribute('data-layout', layout);

  if (accent === DEFAULT_PREFERENCES.accent) root.removeAttribute('data-accent');
  else root.setAttribute('data-accent', accent);

  // The default typefaces are the :root values, so clear the attribute for them.
  if (font === DEFAULT_PREFERENCES.font) root.removeAttribute('data-font');
  else root.setAttribute('data-font', font);

  if (mono === DEFAULT_PREFERENCES.mono) root.removeAttribute('data-mono');
  else root.setAttribute('data-mono', mono);

  // Rounding scales every radius token; frostedness scales every glass blur.
  if (radiusScale === 1) root.style.removeProperty('--glacier-radius-scale');
  else root.style.setProperty('--glacier-radius-scale', String(radiusScale));

  if (frostedness === 1) root.style.removeProperty('--glacier-glass-blur-scale');
  else root.style.setProperty('--glacier-glass-blur-scale', String(frostedness));
}
