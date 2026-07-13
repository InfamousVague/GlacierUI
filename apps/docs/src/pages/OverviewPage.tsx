import { useT, Heading, Text, Size, TextTone } from '@glacier/react';
import { m } from '../i18n.ts';
import { BlueprintGallery } from '../BlueprintGallery.tsx';

export function OverviewPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.overviewGlacierui)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">{t(m.ovLede)}</Text>
      <BlueprintGallery />
    </>
  );
}
