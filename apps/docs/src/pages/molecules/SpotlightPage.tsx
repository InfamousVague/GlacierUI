import { useRef, useState } from 'react';
import { Button, Spotlight, Heading, Text, Size, TextTone, Variant, useT } from '@glacier/react';
import { Bell } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

function TourDemo() {
  const t = useT();
  const STEPS = [
    { title: t(m.spotStep1Title), description: t(m.spotStep1Desc) },
    { title: t(m.spotStep2Title), description: t(m.spotStep2Desc) },
    { title: t(m.spotStep3Title), description: t(m.spotStep3Desc) },
  ];

  const startRef = useRef<HTMLButtonElement>(null);
  const createRef = useRef<HTMLButtonElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const targets = [startRef, createRef, bellRef];

  const [index, setIndex] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button ref={startRef} onClick={() => setIndex(0)}>
        {t(m.spotStartTour)}
      </Button>
      <Button ref={createRef} variant={Variant.Soft}>
        {t(m.spotlightNew)}
      </Button>
      <Button ref={bellRef} variant={Variant.Ghost} aria-label={t(m.spotNotifications)}>
        <Bell size={16} />
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
  const t = useT();
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button ref={ref} variant={Variant.Soft} onClick={() => setOpen(true)}>
        {t(m.spotHighlightMe)}
      </Button>
      <Spotlight
        open={open}
        targetRef={ref}
        placement="right"
        title={t(m.spotOneHighlight)}
        description={t(m.spotSingleDesc)}
        onNext={() => setOpen(false)}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

export function SpotlightPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.spotName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.spotLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.spotAnatomyIntro)}</Text>
      <ComponentBlueprint specId="spotlight" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.spotEx1Title)}
        description={t(m.spotEx1Desc)}
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
        title={t(m.spotEx2Title)}
        description={t(m.spotEx2Desc)}
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

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'open', type: 'boolean', description: t(m.spotPropOpen) },
          { name: 'targetRef', type: 'RefObject<HTMLElement>', description: t(m.spotPropTargetRef) },
          { name: 'title', type: 'ReactNode', description: t(m.spotPropTitle) },
          { name: 'description', type: 'ReactNode', description: t(m.spotPropDescription) },
          { name: 'placement', type: 'Placement', default: "'bottom'", description: t(m.spotPropPlacement) },
          { name: 'cutoutPadding', type: 'number', default: '8', description: t(m.spotPropCutoutPadding) },
          { name: 'step', type: 'number', description: t(m.spotPropStep) },
          { name: 'total', type: 'number', description: t(m.spotPropTotal) },
          { name: 'onNext', type: '() => void', description: t(m.spotPropOnNext) },
          { name: 'onBack', type: '() => void', description: t(m.spotPropOnBack) },
          { name: 'onClose', type: '() => void', description: t(m.spotPropOnClose) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.spotA11y1))}</li>
        <li>{prose(t(m.spotA11y2))}</li>
        <li>{prose(t(m.spotA11y3))}</li>
        <li>{prose(t(m.spotA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.spotUse1))}</li>
        <li>{prose(t(m.spotUse2))}</li>
        <li>{prose(t(m.spotUse3))}</li>
      </ul>
    </>
  );
}
