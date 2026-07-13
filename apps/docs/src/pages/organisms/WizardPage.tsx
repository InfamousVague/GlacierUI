import { useState } from 'react';
import {
  Button,
  Field,
  Heading,
  Input,
  Size,
  Text,
  TextTone,
  useT,
  type WizardStep,
} from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

function buildPlanSteps(t: ReturnType<typeof useT>): WizardStep[] {
  return [
    { id: 'scope', label: t(m.wizardScope), content: <Text tone={TextTone.Muted}>{t(m.wizPlanScope)}</Text> },
    { id: 'team', label: t(m.wizardTeam), content: <Text tone={TextTone.Muted}>{t(m.wizPlanTeam)}</Text> },
    { id: 'billing', label: t(m.wizardBilling), content: <Text tone={TextTone.Muted}>{t(m.wizPlanBilling)}</Text> },
  ];
}

function SignupWizard({ K }: { K: PlatformKit }) {
  const t = useT();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [done, setDone] = useState(false);
  const steps: WizardStep[] = [
    {
      id: 'account',
      label: t(m.wizardAccount),
      content: (
        <Field label={t(m.wizFieldEmail)} hint={t(m.wizHintEmail)}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t(m.wizardAdaExampleCom)} />
        </Field>
      ),
      validate: () => (email.includes('@') ? true : t(m.wizValidateEmail)),
    },
    {
      id: 'profile',
      label: t(m.wizardProfile),
      content: (
        <Field label={t(m.wizFieldName)} hint={t(m.wizHintName)}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t(m.wizardAdaLovelace)} />
        </Field>
      ),
      validate: () => (name.trim() ? true : t(m.wizValidateName)),
    },
    {
      id: 'review',
      label: t(m.wizardReview),
      content: (
        <Text tone={TextTone.Muted}>
          {t(m.wizReviewCreating)} <code>{name || t(m.wizReviewSomeone)}</code> {t(m.wizReviewWith)}{' '}
          <code>{email || t(m.wizReviewNoEmail)}</code>. {t(m.wizReviewFinish)}
        </Text>
      ),
    },
  ];
  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-3)' }}>
      <K.Wizard aria-label={t(m.wizAriaSignUp)} steps={steps} onComplete={() => setDone(true)} />
      <Text size={Size.Small} tone={TextTone.Muted}>
        {t(m.wizCompletedLabel)} <code>{done ? t(m.wizYes) : t(m.wizNotYet)}</code>
      </Text>
    </div>
  );
}

function AsyncWizard({ K }: { K: PlatformKit }) {
  const t = useT();
  const steps: WizardStep[] = [
    {
      id: 'handle',
      label: t(m.wizardClaimAHandle),
      content: (
        <Field label={t(m.wizFieldHandle)} hint={t(m.wizHintHandle)}>
          <Input placeholder={t(m.wizardAda)} />
        </Field>
      ),
      // Simulate a server round trip; the footer is inert while it settles.
      validate: () => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 1500)),
    },
    {
      id: 'confirm',
      label: t(m.wizardConfirm),
      content: <Text tone={TextTone.Muted}>{t(m.wizAsyncConfirm)}</Text>,
    },
  ];
  return <K.Wizard aria-label={t(m.wizAriaClaimHandle)} steps={steps} />;
}

function ControlledWizard({ K }: { K: PlatformKit }) {
  const t = useT();
  const [active, setActive] = useState(1);
  const [savedThrough, setSavedThrough] = useState<number | null>(0);
  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-3)' }}>
      <K.Wizard
        aria-label={t(m.wizAriaProjectSetup)}
        steps={buildPlanSteps(t)}
        activeStep={active}
        onStepChange={setActive}
        onSave={(index) => setSavedThrough((prev) => Math.max(prev ?? -1, index))}
      />
      <Text size={Size.Small} tone={TextTone.Muted}>
        {t(m.wizActiveStepLabel)} <code>{active + 1}</code>, {t(m.wizSavedThroughLabel)}{' '}
        <code>{savedThrough == null ? t(m.wizNone) : savedThrough + 1}</code>
      </Text>
      <div>
        <Button size={Size.Small} onClick={() => setActive(0)}>
          {t(m.wizJumpBack)}
        </Button>
      </div>
    </div>
  );
}

export function WizardPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.wizName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.wizLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="wizard" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.wizEx1Title)}
        description={t(m.wizEx1Desc)}
        component="Wizard"
        render={(K) => <SignupWizard K={K} />}
        code={`const steps: WizardStep[] = [
  {
    id: 'account',
    label: 'Account',
    content: <Field label="Email"><Input value={email} onChange={...} /></Field>,
    validate: () => (email.includes('@') ? true : 'Enter a valid email address to continue.'),
  },
  {
    id: 'profile',
    label: 'Profile',
    content: <Field label="Display name"><Input value={name} onChange={...} /></Field>,
    validate: () => (name.trim() ? true : 'Add a display name before moving on.'),
  },
  { id: 'review', label: 'Review', content: <Summary /> },
];

<Wizard aria-label="Sign up" steps={steps} onComplete={createAccount} />`}
      />

      <Example
        title={t(m.wizEx2Title)}
        description={t(m.wizEx2Desc)}
        component="Wizard"
        render={(K) => <AsyncWizard K={K} />}
        code={`{
  id: 'handle',
  label: 'Claim a handle',
  content: <Field label="Handle"><Input /></Field>,
  validate: async () => {
    const free = await checkHandle(handle);
    return free ? true : 'That handle is taken.';
  },
}`}
      />

      <Example
        title={t(m.wizEx3Title)}
        description={t(m.wizEx3Desc)}
        component="Wizard"
        render={(K) => <ControlledWizard K={K} />}
        code={`const [active, setActive] = useState(1);

<Wizard
  aria-label="Project setup"
  steps={steps}
  activeStep={active}
  onStepChange={setActive}
  onSave={(index) => persistDraft(index)}
/>

// next visit: resume from the persisted draft
<Wizard aria-label="Project setup" steps={steps} defaultActiveStep={draft.step} />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.wizEx4Desc)}
        component="Wizard"
        render={(K) => <K.Wizard aria-label={t(m.wizAriaSignUpLoading)} steps={buildPlanSteps(t)} skeleton />}
        code={`<Wizard aria-label="Sign up" steps={steps} skeleton />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'steps', type: 'WizardStep[]', description: t(m.wizPropSteps) },
          { name: 'aria-label', type: 'string', description: t(m.wizPropAriaLabel) },
          { name: 'activeStep', type: 'number', description: t(m.wizPropActiveStep) },
          { name: 'defaultActiveStep', type: 'number', default: '0', description: t(m.wizPropDefaultActiveStep) },
          { name: 'onStepChange', type: '(index: number) => void', description: t(m.wizPropOnStepChange) },
          { name: 'onSave', type: '(index: number) => void', description: t(m.wizPropOnSave) },
          { name: 'onComplete', type: '() => void', description: t(m.wizPropOnComplete) },
          { name: 'previousLabel', type: 'ReactNode', description: t(m.wizPropPreviousLabel) },
          { name: 'nextLabel', type: 'ReactNode', description: t(m.wizPropNextLabel) },
          { name: 'finishLabel', type: 'ReactNode', description: t(m.wizPropFinishLabel) },
          { name: 'headingLevel', type: '2 | 3', default: '2', description: t(m.wizPropHeadingLevel) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.wizPropSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.wizA11y1))}</li>
        <li>{prose(t(m.wizA11y2))}</li>
        <li>{prose(t(m.wizA11y3))}</li>
        <li>{prose(t(m.wizA11y4))}</li>
        <li>{prose(t(m.wizA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.wizUse1))}</li>
        <li>{prose(t(m.wizUse2))}</li>
        <li>{prose(t(m.wizUse3))}</li>
        <li>{prose(t(m.wizUse4))}</li>
        <li>{prose(t(m.wizUse5))}</li>
      </ul>
    </>
  );
}
