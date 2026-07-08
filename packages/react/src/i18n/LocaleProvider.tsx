import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { DEFAULT_LOCALE, format, type Locale, type Message } from './locale.ts';

interface LocaleContextValue {
  locale: Locale;
  /** Per-message overrides an app can pass to retranslate kit strings. */
  overrides?: Partial<Record<string, Message>>;
}

const LocaleContext = createContext<LocaleContextValue>({ locale: DEFAULT_LOCALE });

/** The translator: resolves a message to the active locale, with interpolation. */
export type Translate = (message: Message, params?: Record<string, string | number>) => string;

export interface LocaleProviderProps {
  locale: Locale;
  children: ReactNode;
}

/**
 * Sets the active locale for everything inside it. Kit components read it
 * through useT; without a provider they fall back to DEFAULT_LOCALE, so the kit
 * works untranslated out of the box.
 */
export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const value = useMemo(() => ({ locale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** The active locale. */
export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

/**
 * Returns the translator bound to the active locale. Call it with a message
 * object: `const t = useT(); t(messages.dismiss)`. Because a message must carry
 * every locale by type, there is nothing to miss at the call site.
 */
export function useT(): Translate {
  const { locale } = useContext(LocaleContext);
  return useCallback<Translate>((message, params) => format(message[locale], params), [locale]);
}
