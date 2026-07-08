import { Button, Card, Row, Stack, useT, Heading, Text, Size, TextTone, Variant } from '@glacier/react';
import { m } from '../i18n.ts';
import { BlueprintGallery } from '../BlueprintGallery.tsx';

export function OverviewPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>Perfect</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">{t(m.ovLede)}</Text>

      <Heading level={2}>{t(m.ovPrinciples)}</Heading>
      <Stack gap={4}>
        <Card>
          <strong>{t(m.ovP1Title)}</strong>
          <Text tone={TextTone.Muted}>{t(m.ovP1Body)}</Text>
        </Card>
        <Card>
          <strong>{t(m.ovP2Title)}</strong>
          <Text tone={TextTone.Muted}>{t(m.ovP2Body)}</Text>
        </Card>
        <Card>
          <strong>{t(m.ovP3Title)}</strong>
          <Text tone={TextTone.Muted}>{t(m.ovP3Body)}</Text>
        </Card>
      </Stack>

      <Heading level={2}>{t(m.ovPackages)}</Heading>
      <ul>
        <li>
          <code>@glacier/tokens</code>: {t(m.ovPkgTokens)}
        </li>
        <li>
          <code>@glacier/motion</code>: {t(m.ovPkgMotion)}
        </li>
        <li>
          <code>@glacier/react</code>: {t(m.ovPkgReact)}
        </li>
        <li>
          <code>@glacier/icons</code>: {t(m.ovPkgIcons)}
        </li>
      </ul>

      <Heading level={2}>{t(m.ovTryIt)}</Heading>
      <Row gap={4} wrap>
        <Button onClick={() => (window.location.hash = '#/atoms/button')}>{t(m.ovBrowse)}</Button>
        <Button variant={Variant.Outline} onClick={() => (window.location.hash = '#/foundations/colors')}>
          {t(m.ovSeeTokens)}
        </Button>
      </Row>

      <Heading level={2}>{t(m.ovBlueprints)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.ovBlueprintsBody)}</Text>
      <BlueprintGallery />
    </>
  );
}
