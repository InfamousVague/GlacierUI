import { accentOptions } from '@glacier/tokens';

/**
 * The app-wide look-and-feel knobs. Everything here maps to a Glacier token
 * surface: theme and density and accent are stamped as `data-*` attributes on
 * the document element, which the generated token CSS keys off. Persisted so a
 * reopened window remembers the user's choices.
 */
export interface Preferences {
  theme: 'system' | 'light' | 'dark';
  density: 'comfortable' | 'compact';
  layout: 'floating' | 'full';
  accent: string;
  haptics: boolean;
}

export const ACCENTS = accentOptions;

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'dark',
  density: 'comfortable',
  layout: 'floating',
  accent: accentOptions[0]!.name,
  haptics: false,
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
  const { theme, density, layout, accent } = preferences;

  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);

  if (density === 'comfortable') root.removeAttribute('data-density');
  else root.setAttribute('data-density', density);

  // The portalled kit surfaces (Drawer, Modal) read the layout mode from the
  // root, so it is always stamped.
  root.setAttribute('data-layout', layout);

  if (accent === DEFAULT_PREFERENCES.accent) root.removeAttribute('data-accent');
  else root.setAttribute('data-accent', accent);
}
