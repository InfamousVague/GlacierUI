import { Box, Center, Container, Grid, Row, Spacer, Stack, Text, Heading, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

const Swatch = ({ label }: { label: string }) => (
  <Box padding={4} background="surfaceSunken" radius="md" border>
    <Text size={Size.Small} tone={TextTone.Muted}>
      {label}
    </Text>
  </Box>
);

export function LayoutPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.layoutName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.layoutLede)}
      </Text>

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.layoutEx1Title)}
        description={t(m.layoutEx1Desc)}
        code={`import { Stack } from '@glacier/react';

<Stack gap={4}>
  <div>First</div>
  <div>Second</div>
  <div>Third</div>
</Stack>`}
      >
        <Box width="full">
          <Stack gap={4}>
            <Swatch label={t(m.layoutFirst)} />
            <Swatch label={t(m.layoutSecond)} />
            <Swatch label={t(m.layoutThird)} />
          </Stack>
        </Box>
      </Example>

      <Example
        title={t(m.layoutEx2Title)}
        description={t(m.layoutEx2Desc)}
        code={`import { Row, Spacer, Button } from '@glacier/react';

<Row gap={3}>
  <Button variant={Variant.Soft}>Back</Button>
  <Spacer />
  <Button>Continue</Button>
</Row>`}
      >
        <Box width="full">
          <Row gap={3}>
            <Swatch label={t(m.layoutBack)} />
            <Spacer />
            <Swatch label={t(m.layoutContinue)} />
          </Row>
        </Box>
      </Example>

      <Example
        title={t(m.layoutEx3Title)}
        description={t(m.layoutEx3Desc)}
        code={`<Grid minChildWidth="12rem" gap={4}>
  <Card>A</Card>
  <Card>B</Card>
  <Card>C</Card>
  <Card>D</Card>
</Grid>`}
      >
        <Box width="full">
          <Grid minChildWidth="10rem" gap={4}>
            <Swatch label={t(m.layoutA)} />
            <Swatch label={t(m.layoutB)} />
            <Swatch label={t(m.layoutC)} />
            <Swatch label={t(m.layoutD)} />
          </Grid>
        </Box>
      </Example>

      <Example
        title={t(m.layoutEx4Title)}
        description={t(m.layoutEx4Desc)}
        code={`<Grid columns={{ base: 2, md: 4 }} gap={3}>
  {items}
</Grid>`}
      >
        <Box width="full">
          <Grid columns={{ base: 2, md: 4 }} gap={3}>
            <Swatch label="1" />
            <Swatch label="2" />
            <Swatch label="3" />
            <Swatch label="4" />
          </Grid>
        </Box>
      </Example>

      <Example
        title={t(m.layoutEx5Title)}
        description={t(m.layoutEx5Desc)}
        code={`<Box padding={5} background="surfaceRaised" radius="lg" elevation={2}>
  <Stack gap={2}>
    <Text weight="semibold">Weekly report</Text>
    <Text size={Size.Small} tone={TextTone.Muted}>Ready to review.</Text>
  </Stack>
</Box>`}
      >
        <Box padding={5} background="surfaceRaised" radius="lg" elevation={2} maxWidth="xs" width="full">
          <Stack gap={2}>
            <Text weight="semibold">{t(m.layoutWeeklyReport)}</Text>
            <Text size={Size.Small} tone={TextTone.Muted}>
              {t(m.layoutReadyToReview)}
            </Text>
          </Stack>
        </Box>
      </Example>

      <Example
        title={t(m.layoutEx6Title)}
        description={t(m.layoutEx6Desc)}
        code={`<Center height="auto" padding={8} background="surfaceSunken" radius="lg">
  <Text tone={TextTone.Muted}>Nothing here yet</Text>
</Center>`}
      >
        <Box width="full">
          <Center padding={8} background="surfaceSunken" radius="lg">
            <Text tone={TextTone.Muted}>{t(m.layoutNothingHere)}</Text>
          </Center>
        </Box>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <Heading level={3}>{t(m.layoutPropsBox)}</Heading>
      <PropsTable
        props={[
          { name: 'padding', type: 'SpaceStep | Responsive', description: t(m.layoutPropPadding) },
          { name: 'background', type: "'surface' | 'surfaceRaised' | 'surfaceSunken' | 'accent' | 'accentSoft' | 'glass' | 'bg'", description: t(m.layoutPropBackground) },
          { name: 'radius', type: "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'", description: t(m.layoutPropRadius) },
          { name: 'border', type: "boolean | 'subtle' | 'strong' | 'accent'", description: t(m.layoutPropBorder) },
          { name: 'elevation', type: '0 | 1 | 2 | 3 | 4 | 5', description: t(m.layoutPropElevation) },
          { name: 'maxWidth', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'prose' | 'full'", description: t(m.layoutPropMaxWidth) },
          { name: 'grow', type: 'boolean', description: t(m.layoutPropGrow) },
        ]}
      />
      <Heading level={3}>{t(m.layoutPropsStackRowGrid)}</Heading>
      <PropsTable
        props={[
          { name: 'gap', type: 'SpaceStep | Responsive', default: 'Stack 4, Row 3, Grid 4', description: t(m.layoutPropGap) },
          { name: 'align', type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'", description: t(m.layoutPropAlign) },
          { name: 'justify', type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'", description: t(m.layoutPropJustify) },
          { name: 'wrap', type: 'boolean', description: t(m.layoutPropWrap) },
          { name: 'columns', type: 'number | Responsive', description: t(m.layoutPropColumns) },
          { name: 'minChildWidth', type: 'string', description: t(m.layoutPropMinChildWidth) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.layoutA11y1))}</li>
        <li>{prose(t(m.layoutA11y2))}</li>
        <li>{prose(t(m.layoutA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.layoutUse1))}</li>
        <li>{prose(t(m.layoutUse2))}</li>
        <li>{prose(t(m.layoutUse3))}</li>
        <li>{prose(t(m.layoutUse4))}</li>
        <li>{prose(t(m.layoutUse5))}</li>
      </ul>
    </>
  );
}
