import { accentOptions, accentSteps, type SansFont, type MonoFont } from '@glacier/tokens';
import { Button, Divider, Label, ScrollbarAppearance, SegmentedControl, Select, Slider, Switch, TabbedModal, Text, useT, Size, TextTone, Variant, type Locale, type VisualFeedbackVariant, type VisualFeedbackIntensity } from '@glacier/react';
import { LayoutTemplate, Palette, Sparkles, Type } from '@glacier/icons';
import { DensitySelector, type DensityMode } from './DensitySelector.tsx';
import { FlagSquircle } from './FlagSquircle.tsx';
import { LANGUAGES, m } from './i18n.ts';

export interface Preferences {
  theme: 'system' | 'light' | 'dark';
  density: DensityMode;
  layout: 'floating' | 'full';
  direction: 'ltr' | 'rtl';
  /** Vibration feedback on tap, on supported touch devices. */
  haptics: boolean;
  /** The on-screen counterpart to haptics; fires for every pointer type. */
  visualFeedback: boolean;
  visualFeedbackVariant: VisualFeedbackVariant;
  visualFeedbackIntensity: VisualFeedbackIntensity;
  accent: string;
  font: SansFont;
  mono: MonoFont;
  radiusScale: number;
  /** Backdrop-blur multiplier for every glass surface. */
  frostedness: number;
  /** Visual treatment used by the docs' themed scrollbars. */
  scrollbarStyle: ScrollbarAppearance;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  density: 'comfortable',
  layout: 'floating',
  direction: 'ltr',
  haptics: false,
  visualFeedback: false,
  visualFeedbackVariant: 'shockwave',
  visualFeedbackIntensity: 'subtle',
  accent: accentOptions[0]!.name,
  font: 'inter',
  mono: 'jetbrains',
  radiusScale: 1,
  frostedness: 1,
  scrollbarStyle: ScrollbarAppearance.Default,
};

interface PreferencesModalProps {
  open: boolean;
  onClose: () => void;
  preferences: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

/**
 * The docs preferences, grouped into a sectioned settings dialog: Appearance
 * (theme, accent), Typography (typeface, monospace), Layout (density, frame,
 * direction), and Effects (rounding, frost, haptics). Every control drives a
 * design token, so changes apply to the whole kit at once.
 */
export function PreferencesModal({ open, onClose, preferences, onChange, locale, onLocaleChange }: PreferencesModalProps) {
  const t = useT();

  const VISUAL_FEEDBACK_VARIANTS: Array<{ value: VisualFeedbackVariant; label: string }> = [
    { value: 'shockwave', label: t(m.prefsShockwave) },
    { value: 'pulse', label: t(m.prefsPulse) },
    { value: 'glow', label: t(m.prefsGlow) },
    { value: 'nudge', label: t(m.prefsNudge) },
  ];

  const VISUAL_FEEDBACK_INTENSITIES: Array<{ value: VisualFeedbackIntensity; label: string }> = [
    { value: 'subtle', label: t(m.prefsSubtle) },
    { value: 'normal', label: t(m.prefsNormal) },
    { value: 'strong', label: t(m.prefsStrong) },
  ];

  const SANS_OPTIONS: Array<{ value: SansFont; label: string }> = [
    { value: 'inter', label: t(m.prefsInter) },
    { value: 'noto', label: t(m.prefsNotoSans) },
    { value: 'plex', label: t(m.prefsIbmPlex) },
  ];

  const MONO_OPTIONS: Array<{ value: MonoFont; label: string }> = [
    { value: 'jetbrains', label: t(m.prefsJetBrains) },
    { value: 'plex', label: t(m.prefsIbmPlex) },
  ];

  const appearance = (
    <div className="prefsBody">
      <div className="prefsSection">
        <Label>{t(m.language)}</Label>
        <Select
          fullWidth
          aria-label={t(m.language)}
          value={locale}
          onValueChange={(value) => onLocaleChange(value as Locale)}
          options={LANGUAGES.map((language) => ({
            value: language.code,
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--glacier-space-2)' }}>
                <FlagSquircle code={language.code} />
                {language.label}
              </span>
            ),
          }))}
        />
      </div>
      <Divider />
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
        <Label>{t(m.scrollbarStyle)}</Label>
        <SegmentedControl
          aria-label={t(m.scrollbarStyle)}
          fullWidth
          value={preferences.scrollbarStyle}
          onValueChange={(value) => onChange({ scrollbarStyle: value as ScrollbarAppearance })}
          options={[
            { value: ScrollbarAppearance.Subtle, label: t(m.scrollbarSubtle) },
            { value: ScrollbarAppearance.Default, label: t(m.scrollbarDefault) },
            { value: ScrollbarAppearance.Accent, label: t(m.scrollbarAccent) },
          ]}
        />
        <Text size={Size.XSmall} tone={TextTone.Subtle}>
          {t(m.scrollbarStyleHelp)}
        </Text>
      </div>
    </div>
  );

  const typography = (
    <div className="prefsBody">
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
    </div>
  );

  const layout = (
    <div className="prefsBody">
      <div className="prefsSection">
        <Label>{t(m.density)}</Label>
        <DensitySelector
          aria-label={t(m.density)}
          value={preferences.density}
          onValueChange={(density) => onChange({ density })}
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
        <Label>{t(m.direction)}</Label>
        <SegmentedControl
          aria-label={t(m.direction)}
          fullWidth
          value={preferences.direction}
          onValueChange={(value) => onChange({ direction: value as Preferences['direction'] })}
          options={[
            { value: 'ltr', label: t(m.ltr) },
            { value: 'rtl', label: t(m.rtl) },
          ]}
        />
      </div>
    </div>
  );

  const effects = (
    <div className="prefsBody">
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
      <Divider />
      <div className="prefsSection">
        <Label htmlFor="prefs-haptics">{t(m.haptics)}</Label>
        <Switch
          id="prefs-haptics"
          checked={preferences.haptics}
          onCheckedChange={(haptics) => onChange({ haptics })}
        />
        <Text size={Size.XSmall} tone={TextTone.Subtle}>
          {t(m.hapticsHelp)}
        </Text>
      </div>
      <Divider />
      <div className="prefsSection">
        <Label htmlFor="prefs-visual-feedback">{t(m.visualFeedback)}</Label>
        <Switch
          id="prefs-visual-feedback"
          checked={preferences.visualFeedback}
          onCheckedChange={(visualFeedback) => onChange({ visualFeedback })}
        />
        <Text size={Size.XSmall} tone={TextTone.Subtle}>
          {t(m.visualFeedbackHelp)}
        </Text>
        {preferences.visualFeedback && (
          <div style={{ display: 'grid', gap: 'var(--glacier-space-3)', marginBlockStart: 'var(--glacier-space-2)' }}>
            <SegmentedControl
              aria-label={t(m.visualFeedback)}
              value={preferences.visualFeedbackVariant}
              onValueChange={(value) => onChange({ visualFeedbackVariant: value as VisualFeedbackVariant })}
              options={VISUAL_FEEDBACK_VARIANTS}
            />
            <SegmentedControl
              size={Size.Small}
              aria-label={t(m.visualFeedbackHelp)}
              value={preferences.visualFeedbackIntensity}
              onValueChange={(value) => onChange({ visualFeedbackIntensity: value as VisualFeedbackIntensity })}
              options={VISUAL_FEEDBACK_INTENSITIES}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <TabbedModal
      open={open}
      onClose={onClose}
      title={t(m.preferences)}
      sections={[
        { id: 'appearance', label: t(m.appearance), icon: <Palette size={16} />, content: appearance },
        { id: 'typography', label: t(m.typographySection), icon: <Type size={16} />, content: typography },
        { id: 'layout', label: t(m.layoutSection), icon: <LayoutTemplate size={16} />, content: layout },
        { id: 'effects', label: t(m.effects), icon: <Sparkles size={16} />, content: effects },
      ]}
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
    />
  );
}
