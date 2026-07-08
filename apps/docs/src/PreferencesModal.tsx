import { accentOptions, accentSteps, type SansFont, type MonoFont } from '@glacier/tokens';
import { Button, Divider, Label, Modal, SegmentedControl, Slider, Text, useT, Size, TextTone, Variant } from '@glacier/react';
import { m } from './i18n.ts';

export interface Preferences {
  theme: 'system' | 'light' | 'dark';
  density: 'comfortable' | 'compact';
  layout: 'floating' | 'full';
  accent: string;
  font: SansFont;
  mono: MonoFont;
  radiusScale: number;
  /** Backdrop-blur multiplier for every glass surface. */
  frostedness: number;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  density: 'comfortable',
  layout: 'floating',
  accent: accentOptions[0]!.name,
  font: 'inter',
  mono: 'jetbrains',
  radiusScale: 1,
  frostedness: 1,
};

const SANS_OPTIONS: Array<{ value: SansFont; label: string }> = [
  { value: 'inter', label: 'Inter' },
  { value: 'noto', label: 'Noto Sans' },
  { value: 'plex', label: 'IBM Plex' },
];

const MONO_OPTIONS: Array<{ value: MonoFont; label: string }> = [
  { value: 'jetbrains', label: 'JetBrains' },
  { value: 'plex', label: 'IBM Plex' },
];

interface PreferencesModalProps {
  open: boolean;
  onClose: () => void;
  preferences: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
}

export function PreferencesModal({ open, onClose, preferences, onChange }: PreferencesModalProps) {
  const t = useT();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(m.preferences)}
      description={t(m.prefsDescription)}
      size={Size.Medium}
      footer={
        <>
          <Button variant={Variant.Ghost} size={Size.Large} onClick={() => onChange(DEFAULT_PREFERENCES)}>
            {t(m.reset)}
          </Button>
          <Button size={Size.Large} onClick={onClose}>
            {t(m.done)}
          </Button>
        </>
      }
    >
      <div className="prefsBody">
      <div className="prefsSection">
        <Label>{t(m.theme)}</Label>
        <SegmentedControl
          aria-label={t(m.theme)}
          fullWidth
          value={preferences.theme}
          onValueChange={(value) => onChange({ theme: value as Preferences['theme'] })}
          options={[
            { value: 'system', label: t(m.system) },
            { value: 'light', label: t(m.light) },
            { value: 'dark', label: t(m.dark) },
          ]}
        />
      </div>
      <Divider />
      <div className="prefsSection">
        <Label>{t(m.density)}</Label>
        <SegmentedControl
          aria-label={t(m.density)}
          fullWidth
          value={preferences.density}
          onValueChange={(value) => onChange({ density: value as Preferences['density'] })}
          options={[
            { value: 'comfortable', label: t(m.comfortable) },
            { value: 'compact', label: t(m.compact) },
          ]}
        />
      </div>
      <Divider />
      <div className="prefsSection">
        <Label>{t(m.layout)}</Label>
        <SegmentedControl
          aria-label={t(m.layout)}
          fullWidth
          value={preferences.layout}
          onValueChange={(value) => onChange({ layout: value as Preferences['layout'] })}
          options={[
            { value: 'floating', label: t(m.floating) },
            { value: 'full', label: t(m.full) },
          ]}
        />
        <Text size={Size.XSmall} tone={TextTone.Subtle}>
          {t(m.layoutHelp)}
        </Text>
      </div>
      <Divider />
      <div className="prefsSection">
        <Label>{t(m.accent)}</Label>
        <div className="accentSwatches" role="radiogroup" aria-label={t(m.accentColor)}>
          {accentOptions.map((option) => (
            <button
              key={option.name}
              type="button"
              role="radio"
              aria-checked={preferences.accent === option.name}
              aria-label={option.label}
              title={option.label}
              className="accentSwatch"
              data-selected={preferences.accent === option.name || undefined}
              style={{ background: accentSteps(option, 'light')[8] }}
              onClick={() => onChange({ accent: option.name })}
            />
          ))}
        </div>
      </div>
      <Divider />
      <div className="prefsSection">
        <Label>{t(m.typeface)}</Label>
        <SegmentedControl
          aria-label={t(m.typeface)}
          fullWidth
          value={preferences.font}
          onValueChange={(value) => onChange({ font: value as SansFont })}
          options={SANS_OPTIONS}
        />
        <Text size={Size.XSmall} tone={TextTone.Subtle}>
          {t(m.typefaceHelp)}
        </Text>
      </div>
      <Divider />
      <div className="prefsSection">
        <Label>{t(m.monospace)}</Label>
        <SegmentedControl
          aria-label={t(m.monospace)}
          fullWidth
          value={preferences.mono}
          onValueChange={(value) => onChange({ mono: value as MonoFont })}
          options={MONO_OPTIONS}
        />
        <Text size={Size.XSmall} tone={TextTone.Subtle}>
          {t(m.monospaceHelp)}
        </Text>
      </div>
      <Divider />
      <div className="prefsSection">
        <Label htmlFor="prefs-radius">{t(m.cornerRounding)}</Label>
        <div className="prefsRange">
          <Slider
            id="prefs-radius"
            min={0}
            max={2}
            step={0.05}
            value={preferences.radiusScale}
            onValueChange={(radiusScale) => onChange({ radiusScale })}
          />
          <Text as="span" size={Size.Small} tone={TextTone.Muted} mono>
            {preferences.radiusScale.toFixed(2)}×
          </Text>
        </div>
        <Text size={Size.XSmall} tone={TextTone.Subtle}>
          {t(m.cornerRoundingHelp)}
        </Text>
      </div>
      <Divider />
      <div className="prefsSection">
        <Label htmlFor="prefs-frost">{t(m.frostedness)}</Label>
        <div className="prefsRange">
          <Slider
            id="prefs-frost"
            min={0}
            max={2}
            step={0.05}
            value={preferences.frostedness}
            onValueChange={(frostedness) => onChange({ frostedness })}
          />
          <Text as="span" size={Size.Small} tone={TextTone.Muted} mono>
            {preferences.frostedness.toFixed(2)}×
          </Text>
        </div>
        <Text size={Size.XSmall} tone={TextTone.Subtle}>
          {t(m.frostednessHelp)}
        </Text>
      </div>
      </div>
    </Modal>
  );
}
