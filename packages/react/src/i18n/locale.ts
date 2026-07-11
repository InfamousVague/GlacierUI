/**
 * The translation mandate.
 *
 * A message is not a string; it is a string for EVERY supported locale. Because
 * `Message` is `Record<Locale, string>`, an object literal that omits a locale
 * fails to compile. Add a locale to `locales` and every message in the codebase
 * turns red until it is translated, so a new language can never ship
 * half-translated and a new string can never skip a language.
 */

/**
 * Every locale the app ships strings for. This is the single source of truth:
 * widen it and TypeScript forces a translation for the new locale everywhere.
 *
 * It starts with a single base locale on purpose. That is enough to wire every
 * component through the translator and ban plain strings; the day a second
 * locale is added here, every message in the codebase fails to compile until it
 * is translated. Rename or add to this tuple to choose the languages.
 */
export const locales = ['en', 'es', 'fr', 'de', 'ja', 'pt', 'zh', 'ar'] as const;

export type Locale = (typeof locales)[number];

/** The locale used when no LocaleProvider is present. */
export const DEFAULT_LOCALE: Locale = 'en';

/** Locales written right to left. */
export const rtlLocales: ReadonlySet<Locale> = new Set<Locale>(['ar']);

/** The writing direction for a locale, for the html dir attribute. */
export function direction(locale: Locale): 'ltr' | 'rtl' {
  return rtlLocales.has(locale) ? 'rtl' : 'ltr';
}

/**
 * One translated string, mandated across all locales. Omitting any locale is a
 * compile error: `Property 'xx' is missing in type ... but required in Message`.
 */
export type Message = Record<Locale, string>;

/** A catalog of named messages, each mandated across all locales. */
export type MessageCatalog<K extends string = string> = Record<K, Message>;

/**
 * Defines a message catalog. The generic pins every value to `Message`, so a
 * catalog with a message missing a locale fails to compile at the call site,
 * while preserving the exact keys for `t(messages.someKey)` autocomplete.
 *
 * `const m = defineMessages({ save: { en: 'Save', es: 'Guardar' } })`
 */
export function defineMessages<T extends MessageCatalog>(catalog: T): T {
  return catalog;
}

/** Interpolates `{name}` placeholders in a resolved string. */
export function format(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  );
}
