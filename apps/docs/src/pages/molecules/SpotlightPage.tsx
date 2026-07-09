import { useRef, useState } from 'react';
import { Button, Spotlight, Heading, Text, Size, TextTone, Variant } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const STEPS = [
  { title: 'Your dashboard', description: 'Everything you track lives here. Let’s walk through the essentials.' },
  { title: 'Create anything', description: 'This button starts a new project, note, or task in one place.' },
  { title: 'Stay in the loop', description: 'Alerts and mentions collect here so nothing slips by.' },
];

function TourDemo() {
  const startRef = useRef<HTMLButtonElement>(null);
  const createRef = useRef<HTMLButtonElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const targets = [startRef, createRef, bellRef];

  const [index, setIndex] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button ref={startRef} onClick={() => setIndex(0)}>
        Start tour
      </Button>
      <Button ref={createRef} variant={Variant.Soft}>
        New
      </Button>
      <Button ref={bellRef} variant={Variant.Ghost} aria-label="Notifications">
        🔔
      </Button>

      {index !== null && (
        <Spotlight
          open
          targetRef={targets[index]!}
          title={STEPS[index]!.title}
          description={STEPS[index]!.description}
          step={index + 1}
          total={STEPS.length}
          onBack={index > 0 ? () => setIndex(index - 1) : undefined}
          onNext={index < STEPS.length - 1 ? () => setIndex(index + 1) : () => setIndex(null)}
          onClose={() => setIndex(null)}
        />
      )}
    </div>
  );
}

function SingleStepDemo() {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button ref={ref} variant={Variant.Soft} onClick={() => setOpen(true)}>
        Highlight me
      </Button>
      <Spotlight
        open={open}
        targetRef={ref}
        placement="right"
        title="One highlight"
        description="A single-step Spotlight makes a great “what’s new” pointer - no step count, no Back, just a Next that dismisses."
        onNext={() => setOpen(false)}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

export function SpotlightPage() {
  return (
    <>
      <Heading level={1}>Spotlight</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A guided-tour step. It dims the whole screen, punches a highlighted cutout around a target
        element, and anchors a callout to it - carrying a title, body, step count, and Back / Next /
        Close controls. The cutout is click-through, so the highlighted control stays usable.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>A schematic of the anatomy with the exact spec measurements labelled.</Text>
      <ComponentBlueprint specId="spotlight" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="A multi-step tour"
        description="Point targetRef at each step’s element and drive step / total from state. Back and Next appear only when you pass their handlers; the cutout eases from one target to the next."
        code={`const startRef = useRef(null);
const [index, setIndex] = useState(null);

<Button ref={startRef} onClick={() => setIndex(0)}>Start tour</Button>

{index !== null && (
  <Spotlight
    open
    targetRef={targets[index]}
    title={steps[index].title}
    description={steps[index].description}
    step={index + 1}
    total={steps.length}
    onBack={index > 0 ? () => setIndex(index - 1) : undefined}
    onNext={index < steps.length - 1 ? () => setIndex(index + 1) : () => setIndex(null)}
    onClose={() => setIndex(null)}
  />
)}`}
      >
        <TourDemo />
      </Example>

      <Example
        title="A single highlight"
        description="Omit step and total for a one-off pointer. With only onNext, the callout shows a single Next that dismisses; placement moves the callout to any side."
        code={`const ref = useRef(null);
const [open, setOpen] = useState(false);

<Button ref={ref} onClick={() => setOpen(true)}>Highlight me</Button>
<Spotlight
  open={open}
  targetRef={ref}
  placement="right"
  title="One highlight"
  description="A single-step Spotlight makes a great what's-new pointer."
  onNext={() => setOpen(false)}
  onClose={() => setOpen(false)}
/>`}
      >
        <SingleStepDemo />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'open', type: 'boolean', description: 'Required. Whether the tour step is shown.' },
          { name: 'targetRef', type: 'RefObject<HTMLElement>', description: 'Required. Ref to the element to highlight; the cutout and callout are positioned against it.' },
          { name: 'title', type: 'ReactNode', description: 'Step heading.' },
          { name: 'description', type: 'ReactNode', description: 'Step body copy.' },
          { name: 'placement', type: 'Placement', default: "'bottom'", description: 'Callout position relative to the target; flips when it would overflow.' },
          { name: 'cutoutPadding', type: 'number', default: '8', description: 'Padding around the target inside the cutout, in pixels.' },
          { name: 'step', type: 'number', description: '1-based index of this step; with total, renders the count.' },
          { name: 'total', type: 'number', description: 'Total number of steps in the tour.' },
          { name: 'onNext', type: '() => void', description: 'Advances to the next step; the Next button is hidden when omitted.' },
          { name: 'onBack', type: '() => void', description: 'Returns to the previous step; the Back button is hidden when omitted.' },
          { name: 'onClose', type: '() => void', description: 'Required. Dismisses the tour, via the close button, Escape, or a backdrop press.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The callout is a <code>role="dialog"</code> with <code>aria-modal</code>. It labels itself
          from the title and describes itself from the body, and focus moves into it on open.
        </li>
        <li>Tab and Shift+Tab cycle within the callout’s controls; Escape dismisses and restores focus to the opener.</li>
        <li>The step count is announced via an <code>aria-label</code> such as “Step 2 of 4”.</li>
        <li>The highlighted target stays interactive - the cutout ring is click-through while the surrounding backdrop dismisses on press.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use a Spotlight to onboard a user through a few key controls; keep a tour to a handful of steps.</li>
        <li>Point <code>targetRef</code> at the element the step is about so the cutout frames exactly it; pass <code>cutoutPadding</code> to loosen the frame.</li>
        <li>Drive <code>step</code> / <code>total</code> and the <code>onBack</code> / <code>onNext</code> handlers from your own step state; omit them for a single what’s-new pointer.</li>
      </ul>
    </>
  );
}
