import { Button, Row, Stack, ToastProvider, useToast, Heading, Text, Size, TextTone, Tone, Variant, useT } from '@glacier/react';
import { Check } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

function ToneDemo() {
  const t = useT();
  const { toast } = useToast();
  return (
    <Row gap={3} wrap>
      <Button variant={Variant.Soft} onClick={() => toast({ message: t(m.toastMsgDraft) })}>
        {t(m.toastNeutral)}
      </Button>
      <Button variant={Variant.Soft} onClick={() => toast({ tone: 'info', message: t(m.toastMsgVersion) })}>
        {t(m.toastInfo)}
      </Button>
      <Button variant={Variant.Soft} onClick={() => toast({ tone: 'success', message: t(m.toastMsgPublished) })}>
        {t(m.toastSuccess)}
      </Button>
      <Button variant={Variant.Soft} onClick={() => toast({ tone: 'warning', message: t(m.toastMsgStorage) })}>
        {t(m.toastWarning)}
      </Button>
      <Button variant={Variant.Soft} onClick={() => toast({ tone: 'danger', message: t(m.toastMsgServer) })}>
        {t(m.toastDanger)}
      </Button>
    </Row>
  );
}

function IconDemo() {
  const t = useT();
  const { toast } = useToast();
  return (
    <Button
      variant={Variant.Soft}
      onClick={() =>
        toast({ tone: 'success', message: t(m.toastMsgCopied), icon: <Check size={16} /> })
      }
    >
      {t(m.toastBtnIcon)}
    </Button>
  );
}

function LatestWinsDemo() {
  const t = useT();
  const { toast } = useToast();
  return (
    <Button
      variant={Variant.Soft}
      onClick={() => {
        toast({ message: t(m.toastMsgUpload1) });
        setTimeout(() => toast({ message: t(m.toastMsgUpload2) }), 600);
        setTimeout(() => toast({ tone: 'success', message: t(m.toastMsgUpload3) }), 1200);
      }}
    >
      {t(m.toastBtnBurst)}
    </Button>
  );
}

function StickyDemo() {
  const t = useT();
  const { toast, dismiss } = useToast();
  return (
    <Row gap={3} wrap>
      <Button
        variant={Variant.Soft}
        onClick={() => toast({ tone: 'warning', message: t(m.toastMsgReconnect), duration: 0 })}
      >
        {t(m.toastBtnSticky)}
      </Button>
      <Button variant={Variant.Ghost} onClick={dismiss}>
        {t(m.toastBtnDismiss)}
      </Button>
    </Row>
  );
}

export function ToastPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.toastName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.toastLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <ComponentBlueprint specId="toast" />
      <Text tone={TextTone.Muted}>{prose(t(m.toastAnatomyIntro))}</Text>

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <ToastProvider>
        <Example
          title={t(m.secTones)}
          description={prose(t(m.toastEx1Desc))}
          code={`import { ToastProvider, useToast } from '@glacier/react';

function Publish() {
  const { toast } = useToast();
  return (
    <Button onClick={() => toast({ tone: 'success', message: 'Your changes were published.' })}>
      Publish
    </Button>
  );
}

// Wrap the app once, near the root.
<ToastProvider>
  <Publish />
</ToastProvider>`}
        >
          <ToneDemo />
        </Example>

        <Example
          title={t(m.toastEx2Title)}
          description={prose(t(m.toastEx2Desc))}
          code={`const { toast } = useToast();

toast({
  tone: 'success',
  message: 'Copied to clipboard.',
  icon: <Check size={16} />,
});`}
        >
          <IconDemo />
        </Example>

        <Example
          title={t(m.toastEx3Title)}
          description={t(m.toastEx3Desc)}
          code={`const { toast } = useToast();

toast({ message: 'Uploading photo 1 of 3' });
setTimeout(() => toast({ message: 'Uploading photo 2 of 3' }), 600);
setTimeout(() => toast({ tone: 'success', message: 'All 3 photos uploaded' }), 1200);`}
        >
          <LatestWinsDemo />
        </Example>

        <Example
          title={t(m.toastEx4Title)}
          description={prose(t(m.toastEx4Desc))}
          code={`const { toast, dismiss } = useToast();

toast({ tone: 'warning', message: 'Reconnecting to the network...', duration: 0 });
// later
dismiss();`}
        >
          <StickyDemo />
        </Example>
      </ToastProvider>

      <Example
        title={t(m.toastEx5Title)}
        description={prose(t(m.toastEx5Desc))}
        component="Toast"
        render={(K) => (
          <Stack gap={3} style={{ width: '100%', maxWidth: '28rem' }}>
            <K.Toast tone={Tone.Success} message={t(m.toastMsgPublished)} dismissible={false} />
            <K.Toast tone={Tone.Danger} message={t(m.toastMsgServer)} dismissible={false} />
            <K.Toast skeleton message="" />
          </Stack>
        )}
        code={`<Toast tone={Tone.Success} message="Your changes were published." />
<Toast tone={Tone.Danger} message="Could not reach the server." />
<Toast skeleton message="" />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.toastPropsIntro))}</Text>
      <PropsTable
        props={[
          {
            name: 'message',
            type: 'ReactNode',
            description: t(m.toastPropMessage),
          },
          {
            name: 'tone',
            type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
            default: "'neutral'",
            description: t(m.toastPropTone),
          },
          {
            name: 'icon',
            type: 'ReactNode',
            description: t(m.toastPropIcon),
          },
          {
            name: 'duration',
            type: 'number',
            default: '3500 to 7000 by tone',
            description: t(m.toastPropDuration),
          },
          {
            name: 'dismissible',
            type: 'boolean',
            default: 'true',
            description: t(m.toastPropDismissible),
          },
          {
            name: 'glass',
            type: 'boolean',
            default: 'false',
            description: t(m.toastPropGlass),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.toastPropSkeleton),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.toastA11y1))}</li>
        <li>{prose(t(m.toastA11y2))}</li>
        <li>{prose(t(m.toastA11y3))}</li>
        <li>{prose(t(m.toastA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.toastUse1))}</li>
        <li>{prose(t(m.toastUse2))}</li>
        <li>{prose(t(m.toastUse3))}</li>
        <li>{prose(t(m.toastUse4))}</li>
      </ul>
    </>
  );
}
