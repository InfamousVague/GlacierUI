import { accentOptions, accentSteps } from '@perfect/tokens';
import { Button, Divider, Label, Modal, SegmentedControl, Slider, Text } from '@perfect/react';

export interface Preferences {
  theme: 'system' | 'light' | 'dark';
  density: 'comfortable' | 'compact';
  accent: string;
  radiusScale: number;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  density: 'comfortable',
  accent: accentOptions[0]!.name,
  radiusScale: 1,
};

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
