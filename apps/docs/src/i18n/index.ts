import { defineMessages, type Locale, type Message } from '@glacier/react';
import { LANGUAGES } from './languages.ts';
import * as en from './en/index.ts';
import * as es from './es/index.ts';
import * as fr from './fr/index.ts';
import * as de from './de/index.ts';
import * as ja from './ja/index.ts';
import * as pt from './pt/index.ts';
import * as zh from './zh/index.ts';
import * as ar from './ar/index.ts';

export { LANGUAGES } from './languages.ts';
export { pageConcepts, pageTags } from './search-metadata.ts';

const LOCALES = LANGUAGES.map((l) => l.code) as Locale[];

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

// English is the canonical key set - every locale folder carries the same keys.
type MessageKeys = keyof UnionToIntersection<(typeof en.messages)[keyof typeof en.messages]> & string;
type GroupKeys = keyof typeof en.groupTitles & string;
type PageKeys = keyof typeof en.pageTitles & string;

/** Flatten a language's section objects into one { key: string } map. */
function flat(sections: Record<string, Record<string, string>>): Record<string, string> {
  return Object.assign({}, ...Object.values(sections));
}

/** Zip per-locale flat maps into the { key: { en, es, … } } catalog shape. */
function zip<K extends string>(perLocale: Record<Locale, Record<string, string>>): Record<K, Message> {
  const keys = Object.keys(perLocale[LOCALES[0]!]) as K[];
  const out = {} as Record<K, Message>;
  for (const k of keys) {
    const row = {} as Message;
    for (const loc of LOCALES) row[loc] = perLocale[loc][k]!;
    out[k] = row;
  }
  return out;
}

const messagesByLocale = {
  en: flat(en.messages),
  es: flat(es.messages),
  fr: flat(fr.messages),
  de: flat(de.messages),
  ja: flat(ja.messages),
  pt: flat(pt.messages),
  zh: flat(zh.messages),
  ar: flat(ar.messages),
} as Record<Locale, Record<string, string>>;

const groupTitlesByLocale = {
  en: en.groupTitles,
  es: es.groupTitles,
  fr: fr.groupTitles,
  de: de.groupTitles,
  ja: ja.groupTitles,
  pt: pt.groupTitles,
  zh: zh.groupTitles,
  ar: ar.groupTitles,
} as Record<Locale, Record<string, string>>;

const pageTitlesByLocale = {
  en: en.pageTitles,
  es: es.pageTitles,
  fr: fr.pageTitles,
  de: de.pageTitles,
  ja: ja.pageTitles,
  pt: pt.pageTitles,
  zh: zh.pageTitles,
  ar: ar.pageTitles,
} as Record<Locale, Record<string, string>>;

/** Sidebar group headings, keyed by the English group name used in App.tsx. */
export const groupTitles = defineMessages(zip<GroupKeys>(groupTitlesByLocale));
/** Navigation title for every page, keyed by its page id. */
export const pageTitles = defineMessages(zip<PageKeys>(pageTitlesByLocale));
/** Every docs UI string, keyed by id, each carrying all locales. */
export const m = defineMessages(zip<MessageKeys>(messagesByLocale));
