import { accentOptions, accentSteps, type SansFont, type MonoFont } from '@perfect/tokens';
import { Button, Divider, Label, Modal, SegmentedControl, Slider, Text } from '@perfect/react';

export interface Preferences {
  theme: 'system' | 'light' | 'dark';
  density: 'comfortable' | 'compact';
  layout: 'floating' | 'full';
  accent: string;
  font: SansFont;
  mono: MonoFont;
  radiusScale: number;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  density: 'comfortable',
  layout: 'floating',
  accent: accentOptions[0]!.name,
  font: 'inter',
  mono: 'jetbrains',
  radiusScale: 1,
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
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Preferences"
      description="Everything here drives design tokens, so changes apply to the whole kit at once."
      size="md"
      footer={
        <>
          <Button variant="ghost" size="lg" onClick={() => onChange(DEFAULT_PREFERENCES)}>
            Reset
          </Button>
          <Button size="lg" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="prefsBody">
      <div className="prefsSection">
        <Label>Theme</Label>
        <SegmentedControl
          aria-label="Theme"
          fullWidth
          value={preferences.theme}
          onValueChange={(value) => onChange({ theme: value as Preferences['theme'] })}
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </div>
      <Divider />
      <div className="prefsSection">
        <Label>Density</Label>
        <SegmentedControl
          aria-label="Density"
          fullWidth
          value={preferences.density}
          onValueChange={(value) => onChange({ density: value as Preferences['density'] })}
          options={[
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'compact', label: 'Compact' },
          ]}
        />
      </div>
      <Divider />
      <div className="prefsSection">
        <Label>Layout</Label>
        <SegmentedControl
          aria-label="Layout"
          fullWidth
          value={preferences.layout}
          onValueChange={(value) => onChange({ layout: value as Preferences['layout'] })}
          options={[
            { value: 'floating', label: 'Floating' },
            { value: 'full', label: 'Full' },
          ]}
        />
        <Text size="xs" tone="subtle">
          Floating detaches the sidebar and toolbar into cards; full pins them to the edges. Applies
          on wide screens; narrow screens use the drawer either way.
        </Text>
      </div>
      <Divider />
      <div className="prefsSection">
        <Label>Accent</Label>
        <div className="accentSwatches" role="radiogroup" aria-label="Accent color">
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
        <Label>Typeface</Label>
        <SegmentedControl
          aria-label="Typeface"
          fullWidth
          value={preferences.font}
          onValueChange={(value) => onChange({ font: value as SansFont })}
          options={SANS_OPTIONS}
        />
        <Text size="xs" tone="subtle">
          The interface sans. All three are bundled and cover a wide range of scripts.
        </Text>
      </div>
      <Divider />
      <div className="prefsSection">
        <Label>Monospace</Label>
        <SegmentedControl
          aria-label="Monospace"
          fullWidth
          value={preferences.mono}
          onValueChange={(value) => onChange({ mono: value as MonoFont })}
          options={MONO_OPTIONS}
        />
        <Text size="xs" tone="subtle">
          Used for code, values, and measurements.
        </Text>
      </div>
      <Divider />
      <div className="prefsSection">
        <Label htmlFor="prefs-radius">Corner rounding</Label>
        <div className="prefsRange">
          <Slider
            id="prefs-radius"
            min={0}
            max={2}
            step={0.05}
            value={preferences.radiusScale}
            onValueChange={(radiusScale) => onChange({ radiusScale })}
          />
          <Text as="span" size="sm" tone="muted" mono>
            {preferences.radiusScale.toFixed(2)}×
          </Text>
        </div>
        <Text size="xs" tone="subtle">
          Scales every radius token except none and full.
        </Text>
      </div>
      </div>
    </Modal>
  );
}
