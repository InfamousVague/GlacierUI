import {
  Button,
  Fieldset,
  FormSection,
  Heading,
  Label,
  Row,
  SegmentedControl,
  Switch,
  Text,
  TextTone,
  useToast,
} from '@glacier/react';
import { accentSteps } from '@glacier/tokens';
import { ACCENTS, DEFAULT_PREFERENCES, type Preferences } from '../preferences.ts';

function resolveTheme(theme: Preferences['theme']): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

export function SettingsPage({
  preferences,
  onChange,
}: {
  preferences: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
}) {
  const { toast } = useToast();
  const swatchTheme = resolveTheme(preferences.theme);

  return (
    <div className="page">
      <div>
        <Heading level={1}>Settings</Heading>
        <Text tone={TextTone.Muted} className="pageLede">
          Every control here writes straight to the persisted preferences and re-themes the app
          live, all through Glacier tokens. Nothing to save.
        </Text>
      </div>

      <FormSection title="Appearance" description="Theme, accent, and density. These are stamped as data attributes the token layer reads.">
        <div className="split">
          <div className="control">
            <Label>Theme</Label>
            <SegmentedControl
              aria-label="Theme"
              value={preferences.theme}
              onValueChange={(value) => onChange({ theme: value as Preferences['theme'] })}
              options={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </div>
          <div className="control">
            <Label>Density</Label>
            <SegmentedControl
              aria-label="Density"
              value={preferences.density}
              onValueChange={(value) => onChange({ density: value as Preferences['density'] })}
              options={[
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'compact', label: 'Compact' },
              ]}
            />
          </div>
        </div>

        <div className="control">
          <Label>Accent</Label>
          <div className="accentSwatches" role="radiogroup" aria-label="Accent color">
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
      </FormSection>

      <FormSection title="Layout" description="How the shell frames itself." divider>
        <div className="control">
          <Label>Sidebar</Label>
          <SegmentedControl
            aria-label="Sidebar layout"
            value={preferences.layout}
            onValueChange={(value) => onChange({ layout: value as Preferences['layout'] })}
            options={[
              { value: 'floating', label: 'Floating' },
              { value: 'full', label: 'Full height' },
            ]}
          />
        </div>
      </FormSection>

      <FormSection title="Interaction" description="Feedback and behavior." divider>
        <Fieldset legend="Feedback" description="Haptics use the Web Vibration API on supported devices.">
          <Switch
            label="Enable haptic feedback"
            checked={preferences.haptics}
            onCheckedChange={(checked) => onChange({ haptics: checked })}
          />
        </Fieldset>
      </FormSection>

      <Row>
        <Button
          variant="outline"
          onClick={() => {
            onChange(DEFAULT_PREFERENCES);
            toast({ tone: 'neutral', message: 'Settings reset to defaults' });
          }}
        >
          Reset to defaults
        </Button>
      </Row>
    </div>
  );
}
