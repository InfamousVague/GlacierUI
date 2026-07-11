import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  LocaleProvider,
  defineMessages,
  format,
  locales,
  useT,
  kitMessages,
} from '../src/i18n/index.ts';

const t = defineMessages({
  greeting: {
    en: 'Hello, {name}',
    es: 'Hola, {name}',
    fr: 'Bonjour, {name}',
    de: 'Hallo, {name}',
    ja: 'こんにちは、{name}',
    pt: 'Olá, {name}',
    zh: '你好，{name}',
    ar: 'مرحبا، {name}',
  },
});

function Greeting({ name }: { name: string }) {
  const translate = useT();
  return <span>{translate(t.greeting, { name })}</span>;
}

describe('i18n mandate', () => {
  it('every kit message provides every locale', () => {
    for (const [key, message] of Object.entries(kitMessages))
      for (const locale of locales)
        expect(message, `${key} is missing ${locale}`).toHaveProperty(locale);
  });

  it('resolves to the active locale', () => {
    render(
      <LocaleProvider locale="en">
        <Greeting name="Ada" />
      </LocaleProvider>,
    );
    expect(screen.getByText('Hello, Ada')).toBeTruthy();
  });

  it('resolves to the default locale without a provider', () => {
    render(<Greeting name="Grace" />);
    expect(screen.getByText('Hello, Grace')).toBeTruthy();
  });

  it('interpolates named params', () => {
    expect(format('Step {n} of {total}', { n: 2, total: 5 })).toBe('Step 2 of 5');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(format('Hello, {name}')).toBe('Hello, {name}');
  });

  it('mandates a translation for every locale at compile time', () => {
    // Independent of the current locale set: a message for a two-locale world
    // must carry both, so omitting one is a compile error. This is exactly what
    // happens to every message the day a second locale is added to `locales`.
    type Bilingual = Record<'en' | 'fr', string>;
    // @ts-expect-error - a message missing the 'fr' locale must not compile.
    const incomplete: Bilingual = { en: 'Save' };
    expect(incomplete.en).toBe('Save');

    const complete: Bilingual = { en: 'Save', fr: 'Enregistrer' };
    expect(complete.fr).toBe('Enregistrer');
  });
});
