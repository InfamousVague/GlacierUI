import { useState } from 'react';
import { Button, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Bell, Shield, User } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const accountIcon = <User size={18} />;
const bellIcon = <Bell size={18} />;
const shieldIcon = <Shield size={18} />;

function useSections() {
  const t = useT();
  return [
    {
      id: 'account',
      label: t(m.tbmSecAccount),
      icon: accountIcon,
      content: (
        <div>
          <Heading level={3} style={{ marginTop: 0 }}>{t(m.tbmSecAccount)}</Heading>
          <Text tone={TextTone.Muted}>{t(m.tbmAccountBody)}</Text>
        </div>
      ),
    },
    {
      id: 'notifications',
      label: t(m.tbmSecNotifications),
      icon: bellIcon,
      content: (
        <div>
          <Heading level={3} style={{ marginTop: 0 }}>{t(m.tbmSecNotifications)}</Heading>
          <Text tone={TextTone.Muted}>{t(m.tbmNotificationsBody)}</Text>
        </div>
      ),
    },
    {
      id: 'privacy',
      label: t(m.tbmSecPrivacy),
      icon: shieldIcon,
      content: (
        <div>
          <Heading level={3} style={{ marginTop: 0 }}>{t(m.tbmSecPrivacy)}</Heading>
          <Text tone={TextTone.Muted}>{t(m.tbmPrivacyBody)}</Text>
        </div>
      ),
    },
  ];
}

function BasicDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const sections = useSections();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t(m.tbmOpenSettings)}</Button>
      <K.TabbedModal open={open} onClose={() => setOpen(false)} title={t(m.tbmDemoTitleSettings)} sections={sections} />
    </>
  );
}

function ControlledDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const sections = useSections();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('notifications');
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t(m.tbmOpenNotifications)}</Button>
      <K.TabbedModal
        open={open}
        onClose={() => setOpen(false)}
        title={t(m.tbmDemoTitlePreferences)}
        sections={sections}
        value={value}
        onValueChange={setValue}
      />
    </>
  );
}

export function TabbedModalPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.tbmName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.tbmLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.tbmAnatomyIntro)}</Text>
      <ComponentBlueprint specId="tabbed-modal" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.tbmEx1Desc)}
        component="TabbedModal"
        render={(K) => <BasicDemo K={K} />}
        code={`import { Button, TabbedModal } from '@glacier/react';

const sections = [
  { id: 'account', label: 'Account', icon: accountIcon, content: <AccountPane /> },
  { id: 'notifications', label: 'Notifications', icon: bellIcon, content: <NotificationsPane /> },
  { id: 'privacy', label: 'Privacy', icon: shieldIcon, content: <PrivacyPane /> },
];

function Settings() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open settings</Button>
      <TabbedModal open={open} onClose={() => setOpen(false)} title="Settings" sections={sections} />
    </>
  );
}`}
      />

      <Example
        title={t(m.tbmEx2Title)}
        description={t(m.tbmEx2Desc)}
        component="TabbedModal"
        render={(K) => <ControlledDemo K={K} />}
        code={`const [value, setValue] = useState('notifications');

<TabbedModal
  open={open}
  onClose={close}
  title="Preferences"
  sections={sections}
  value={value}
  onValueChange={setValue}
/>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'open', type: 'boolean', description: t(m.tbmPropOpen) },
          { name: 'onClose', type: '() => void', description: t(m.tbmPropOnClose) },
          { name: 'sections', type: 'TabbedModalSection[]', description: t(m.tbmPropSections) },
          { name: 'value', type: 'string', description: t(m.tbmPropValue) },
          { name: 'defaultValue', type: 'string', description: t(m.tbmPropDefaultValue) },
          { name: 'onValueChange', type: '(value: string) => void', description: t(m.tbmPropOnValueChange) },
          { name: 'title', type: 'ReactNode', description: t(m.tbmPropTitle) },
        ]}
      />
      <Heading level={3}>{t(m.tbmSectionHeading)}</Heading>
      <PropsTable
        props={[
          { name: 'id', type: 'string', description: t(m.tbmSecPropId) },
          { name: 'label', type: 'ReactNode', description: t(m.tbmSecPropLabel) },
          { name: 'icon', type: 'ReactNode', description: t(m.tbmSecPropIcon) },
          { name: 'content', type: 'ReactNode', description: t(m.tbmSecPropContent) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.tbmSecPropDisabled) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.tbmA11y1))}</li>
        <li>{prose(t(m.tbmA11y2))}</li>
        <li>{prose(t(m.tbmA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.tbmUse1))}</li>
        <li>{prose(t(m.tbmUse2))}</li>
        <li>{prose(t(m.tbmUse3))}</li>
      </ul>
    </>
  );
}
