import { Select, useT, type Locale } from '@glacier/react';
import { LANGUAGES, m } from './i18n.ts';

interface LanguageSelectProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

/** The top-bar language switcher. Options are each language in its own name. */
export function LanguageSelect({ locale, onChange }: LanguageSelectProps) {
  const t = useT();
  return (
    <div className="langSelect">
      <Select
        glass
        fullWidth
        aria-label={t(m.language)}
        value={locale}
        onValueChange={(value) => onChange(value as Locale)}
        options={LANGUAGES.map((language) => ({ value: language.code, label: language.label }))}
      />
    </div>
  );
}
