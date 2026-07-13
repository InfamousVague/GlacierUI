import {
  Button,
  Fieldset,
  FormSection,
  Label,
  Modal,
  Row,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  Text,
  Size,
  TextTone,
  useToast,
} from '@glacier/react';
import { accentSteps } from '@glacier/tokens';
import { ACCENTS, DEFAULT_PREFERENCES, MONO_FONTS, SANS_FONTS, type Preferences } from './preferences.ts';
import { LANGUAGES, useT, type AppLocale } from './i18n.ts';

function resolveTheme(theme: Preferences['theme']): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

/**
 * The app preferences, in a modal. Every control writes straight to the
 * persisted preferences and re-themes the app live through Glacier tokens, so
 * there is nothing to save: Reset restores the defaults, Done closes. Labels
 * are translated, and the language control drives the app-wide locale.
 */
export function SettingsModal({
  open,
  onClose,
  preferences,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  preferences: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
}) {
  const t = useT();
  const { toast } = useToast();
  const swatchTheme = resolveTheme(preferences.theme);
  // Fall back to the defaults for the numeric sliders, so a preferences object
  // that is missing a field (an older persisted version, or Fast Refresh state
  // that predates the field) renders instead of crashing on `undefined.toFixed`.
  const radiusScale = preferences.radiusScale ?? DEFAULT_PREFERENCES.radiusScale;
  const frostedness = preferences.frostedness ?? DEFAULT_PREFERENCES.frostedness;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={t('setTitle')}
      footer={
        <Row justify="between" align="center">
          <Button
            variant="outline"
            onClick={() => {
              onChange(DEFAULT_PREFERENCES);
              toast({ tone: 'neutral', message: 'Settings reset to defaults' });
            }}
          >
            Reset
          </Button>
          <Button onClick={onClose}>Done</Button>
        </Row>
      }
    >
      <div style={{ display: 'grid', gap: 'var(--glacier-space-6)' }}>
        <FormSection title={t('setAppearance')} description={t('setAppearanceHint')}>
          <div className="split">
            <div className="control">
              <Label>{t('setTheme')}</Label>
              <SegmentedControl
                aria-label={t('setTheme')}
                value={preferences.theme}
                onValueChange={(value) => onChange({ theme: value as Preferences['theme'] })}
                options={[
                  { value: 'system', label: t('setSystem') },
                  { value: 'light', label: t('setLight') },
                  { value: 'dark', label: t('setDark') },
                ]}
              />
            </div>
            <div className="control">
              <Label>{t('setDensity')}</Label>
              <SegmentedControl
                aria-label={t('setDensity')}
                value={preferences.density}
                onValueChange={(value) => onChange({ density: value as Preferences['density'] })}
                options={[
                  { value: 'comfortable', label: t('setComfortable') },
                  { value: 'compact', label: t('setCompact') },
                ]}
              />
            </div>
          </div>

          <div className="split">
            <div className="control">
              <Label>{t('setAccent')}</Label>
              <div className="accentSwatches" role="radiogroup" aria-label={t('setAccent')}>
                {ACCENTS.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    role="radio"
                    aria-checked={preferences.accent === option.name}
                    aria-label={option.label}
                    className="accentSwatch"
                    data-selected={preferences.accent === option.name || undefined}
                    style={{ background: accentSteps(option, swatchTheme)[8] }}
                    onClick={() => onChange({ accent: option.name })}
                  />
                ))}
              </div>
            </div>
            <div className="control">
              <Label>{t('setLanguage')}</Label>
              <Select
                aria-label={t('setLanguage')}
                value={preferences.locale}
                onValueChange={(value) => onChange({ locale: value as AppLocale })}
                options={LANGUAGES.map((lang) => ({ value: lang.code, label: lang.label }))}
              />
            </div>
          </div>

          <div className="split">
            <div className="control">
              <Label>{t('setTypeface')}</Label>
              <SegmentedControl
                aria-label={t('setTypeface')}
                value={preferences.font}
                onValueChange={(value) => onChange({ font: value as Preferences['font'] })}
                options={SANS_FONTS}
              />
            </div>
            <div className="control">
              <Label>{t('setMonospace')}</Label>
              <SegmentedControl
                aria-label={t('setMonospace')}
                value={preferences.mono}
                onValueChange={(value) => onChange({ mono: value as Preferences['mono'] })}
                options={MONO_FONTS}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title={t('setShape')} description={t('setShapeHint')} divider>
          <div className="split">
            <div className="control" style={{ width: '100%' }}>
              <Label>{t('setRounding')}</Label>
              <Row gap={3} align="center" style={{ width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <Slider
                    aria-label={t('setRounding')}
                    min={0}
                    max={2}
                    step={0.05}
                    value={radiusScale}
                    onValueChange={(next) => onChange({ radiusScale: next })}
                  />
                </div>
                <Text as="span" size={Size.Small} tone={TextTone.Muted} mono>
                  {radiusScale.toFixed(2)}×
                </Text>
              </Row>
            </div>
            <div className="control" style={{ width: '100%' }}>
              <Label>{t('setFrost')}</Label>
              <Row gap={3} align="center" style={{ width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <Slider
                    aria-label={t('setFrost')}
                    min={0}
                    max={2}
                    step={0.05}
                    value={frostedness}
                    onValueChange={(next) => onChange({ frostedness: next })}
                  />
                </div>
                <Text as="span" size={Size.Small} tone={TextTone.Muted} mono>
                  {frostedness.toFixed(2)}×
                </Text>
              </Row>
            </div>
          </div>
        </FormSection>

        <FormSection title={t('setLayout')} description={t('setLayoutHint')} divider>
          <div className="control">
            <Label>{t('setSidebar')}</Label>
            <SegmentedControl
              aria-label={t('setSidebar')}
              value={preferences.layout}
              onValueChange={(value) => onChange({ layout: value as Preferences['layout'] })}
              options={[
                { value: 'floating', label: t('setFloating') },
                { value: 'full', label: t('setFullHeight') },
              ]}
            />
          </div>
          <Fieldset legend={t('setHaptics')} description={t('setHapticsHint')}>
            <Switch
              label={t('setHaptics')}
              checked={preferences.haptics}
              onCheckedChange={(checked) => onChange({ haptics: checked })}
            />
          </Fieldset>
          <Fieldset legend={t('setVisualFeedback')} description={t('setVisualFeedbackHint')}>
            <Switch
              label={t('setVisualFeedback')}
              checked={preferences.visualFeedback}
              onCheckedChange={(checked) => onChange({ visualFeedback: checked })}
            />
            {preferences.visualFeedback && (
              <div className="split" style={{ marginBlockStart: 'var(--glacier-space-3)' }}>
                <div className="control">
                  <Label>{t('setEffect')}</Label>
                  <SegmentedControl
                    aria-label={t('setEffect')}
                    value={preferences.visualFeedbackVariant}
                    onValueChange={(value) =>
                      onChange({ visualFeedbackVariant: value as Preferences['visualFeedbackVariant'] })
                    }
                    options={[
                      { value: 'shockwave', label: 'Shockwave' },
                      { value: 'pulse', label: 'Pulse' },
                      { value: 'glow', label: 'Glow' },
                      { value: 'nudge', label: 'Nudge' },
                    ]}
                  />
                </div>
                <div className="control">
                  <Label>{t('setIntensity')}</Label>
                  <SegmentedControl
                    size={Size.Small}
                    aria-label={t('setIntensity')}
                    value={preferences.visualFeedbackIntensity}
                    onValueChange={(value) =>
                      onChange({ visualFeedbackIntensity: value as Preferences['visualFeedbackIntensity'] })
                    }
                    options={[
                      { value: 'subtle', label: 'Subtle' },
                      { value: 'normal', label: 'Normal' },
                      { value: 'strong', label: 'Strong' },
                    ]}
                  />
                </div>
              </div>
            )}
          </Fieldset>
        </FormSection>
      </div>
    </Modal>
  );
}
