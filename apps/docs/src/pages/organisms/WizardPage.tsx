import { useState } from 'react';
import {
  Button,
  Field,
  Heading,
  Input,
  Size,
  Text,
  TextTone,
  Wizard,
  type WizardStep,
} from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

function SignupWizard() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [done, setDone] = useState(false);
  const steps: WizardStep[] = [
    {
      id: 'account',
      label: 'Account',
      content: (
        <Field label="Email" hint="You will sign in with this address.">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ada@example.com" />
        </Field>
      ),
      validate: () => (email.includes('@') ? true : 'Enter a valid email address to continue.'),
    },
    {
      id: 'profile',
      label: 'Profile',
      content: (
        <Field label="Display name" hint="Shown on everything you publish.">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
        </Field>
      ),
      validate: () => (name.trim() ? true : 'Add a display name before moving on.'),
    },
    {
      id: 'review',
      label: 'Review',
      content: (
        <Text tone={TextTone.Muted}>
          Creating <code>{name || 'someone'}</code> with <code>{email || 'no email'}</code>. Press
          Done to finish.
        </Text>
      ),
    },
  ];
  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-3)' }}>
      <Wizard aria-label="Sign up" steps={steps} onComplete={() => setDone(true)} />
      <Text size={Size.Small} tone={TextTone.Muted}>
        Completed: <code>{done ? 'yes' : 'not yet'}</code>
      </Text>
    </div>
  );
}

function AsyncWizard() {
  const steps: WizardStep[] = [
    {
      id: 'handle',
      label: 'Claim a handle',
      content: (
        <Field label="Handle" hint="Checked against the server when you press Next.">
          <Input placeholder="ada" />
        </Field>
      ),
      // Simulate a server round trip; the footer is inert while it settles.
      validate: () => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 1500)),
    },
    {
      id: 'confirm',
      label: 'Confirm',
      content: <Text tone={TextTone.Muted}>The handle is yours. Press Done to keep it.</Text>,
    },
  ];
  return <Wizard aria-label="Claim a handle" steps={steps} />;
}

const PLAN_STEPS: WizardStep[] = [
  { id: 'scope', label: 'Scope', content: <Text tone={TextTone.Muted}>Pick what the project covers.</Text> },
  { id: 'team', label: 'Team', content: <Text tone={TextTone.Muted}>Invite the people who will work on it.</Text> },
  { id: 'billing', label: 'Billing', content: <Text tone={TextTone.Muted}>Choose a plan and confirm.</Text> },
];

function ControlledWizard() {
  const [active, setActive] = useState(1);
  const [savedThrough, setSavedThrough] = useState<number | null>(0);
  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-3)' }}>
      <Wizard
        aria-label="Project setup"
        steps={PLAN_STEPS}
        activeStep={active}
        onStepChange={setActive}
        onSave={(index) => setSavedThrough((prev) => Math.max(prev ?? -1, index))}
      />
      <Text size={Size.Small} tone={TextTone.Muted}>
        Active step: <code>{active + 1}</code>, saved through step:{' '}
        <code>{savedThrough == null ? 'none' : savedThrough + 1}</code>
      </Text>
      <div>
        <Button size={Size.Small} onClick={() => setActive(0)}>
          Jump back to start
        </Button>
      </div>
    </div>
  );
}

export function WizardPage() {
  return (
    <>
      <Heading level={1}>Wizard</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A stepped flow for tasks too long for one form. It shows one short, labelled step at a
        time behind a connected progress header, and gates forward movement on each step's own
        validation, so people fix problems where they happen instead of scrolling back through a
        wall of fields after a failed submit.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="wizard" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Gated steps"
        description="Each step may carry a validate gate, run when Next or Finish is pressed. Return true to pass, false to block silently (the step's own fields show their errors), or a string to block and voice that message in the wizard's live region."
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
      >
        <SignupWizard />
      </Example>

      <Example
        title="Async validation"
        description="A gate may return a Promise. While it settles, the Next button shows its loading state and both footer actions go inert; a resolved true advances, a resolved string blocks with the message, and a rejection blocks silently."
        code={`{
  id: 'handle',
  label: 'Claim a handle',
  content: <Field label="Handle"><Input /></Field>,
  validate: async () => {
    const free = await checkHandle(handle);
    return free ? true : 'That handle is taken.';
  },
}`}
      >
        <AsyncWizard />
      </Example>

      <Example
        title="Controlled, with save and resume"
        description="Drive activeStep from state via onStepChange to own navigation. onSave fires with the index being left each time its gate passes going forward; persist it, then remount later with defaultActiveStep to resume where the person stopped."
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
      >
        <ControlledWizard />
      </Example>

      <Example
        title="Skeleton"
        description="While the flow's data loads, skeleton renders exact-geometry placeholders: the Steps header, a heading line, three content lines, and the two footer actions, all hidden from assistive tech."
        code={`<Wizard aria-label="Sign up" steps={steps} skeleton />`}
      >
        <Wizard aria-label="Sign up (loading)" steps={PLAN_STEPS} skeleton />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'steps', type: 'WizardStep[]', description: 'Required. The steps in order: { id, label, content, validate? }. validate returns true to pass, false to block silently, a string to block with a message, or a Promise of any of those.' },
          { name: 'aria-label', type: 'string', description: 'Required. Accessible name for the wizard region.' },
          { name: 'activeStep', type: 'number', description: 'Controlled zero-based index; clamped into range when rendering.' },
          { name: 'defaultActiveStep', type: 'number', default: '0', description: 'Uncontrolled start, and the resume point when restoring a saved draft.' },
          { name: 'onStepChange', type: '(index: number) => void', description: 'Fires with the new index on every committed navigation, forward or back.' },
          { name: 'onSave', type: '(index: number) => void', description: 'Fires with the index being left when its gate passes on forward navigation; persist it to support resume.' },
          { name: 'onComplete', type: '() => void', description: 'Fires when Finish is pressed on the last step and its gate passes.' },
          { name: 'previousLabel', type: 'ReactNode', description: 'Previous action label; defaults to the localized kit Previous message.' },
          { name: 'nextLabel', type: 'ReactNode', description: 'Next action label; defaults to the localized kit Next message.' },
          { name: 'finishLabel', type: 'ReactNode', description: 'Finish action label on the last step; defaults to the localized kit Done message.' },
          { name: 'headingLevel', type: '2 | 3', default: '2', description: 'Heading element for the step label.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the component’s exact geometry.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The root is a labelled <code>role="region"</code>; the active step body is a{' '}
          <code>role="group"</code> named by the step heading, which begins with a visually hidden
          localized <code>Step X of Y</code> so the panel name carries position.
        </li>
        <li>
          A blocking gate message is announced by an always-present polite live region
          (<code>role="status"</code>) in danger text; focus stays where it is so nobody loses
          their place in a field.
        </li>
        <li>
          After a committed navigation, focus moves to the panel (<code>tabIndex -1</code>) so
          keyboard and screen reader users land at the top of the new step. Focus is never stolen
          on the initial mount.
        </li>
        <li>
          The Steps progress header is numbered and announces position as its own group label, so
          progress never relies on color alone.
        </li>
        <li>
          The footer actions are native buttons with the kit focus ring: Previous is disabled on
          the first step, and both go inert (Next in its loading state) while an async gate
          settles.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Reach for a wizard when a task has natural phases and later steps depend on earlier
          answers; keep a single form when everything fits on one screen and can be corrected in
          place.
        </li>
        <li>
          Gate a step only when advancing with bad data would be costly. Leave{' '}
          <code>validate</code> off for browse-and-review steps so Previous and Next stay free.
        </li>
        <li>
          Keep steps short, a handful of fields each, and give every step a label that reads as a
          noun (Account, Profile, Review), since it becomes the heading and the panel name.
        </li>
        <li>
          For resumable flows, persist the index from <code>onSave</code> together with the field
          values, and remount with <code>defaultActiveStep</code> to drop people back at the first
          unsaved step.
        </li>
        <li>
          Prefer a string return from <code>validate</code> for cross-field or server problems the
          fields cannot voice themselves; return <code>false</code> when the step's own inline
          errors already explain the block.
        </li>
      </ul>
    </>
  );
}
