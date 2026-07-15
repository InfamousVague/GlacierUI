import { Image, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/** A deterministic, offline SVG "cover" so the docs render without network images. */
function cover(title: string, from: string, to: string, w = 200, h = 300): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/>
    </linearGradient></defs>
    <rect width='${w}' height='${h}' fill='url(#g)'/>
    <text x='50%' y='50%' fill='white' font-family='Georgia, serif' font-size='16' text-anchor='middle' dominant-baseline='middle'>${title}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const dune = cover('Dune', '%23b45309', '%23d97706');
const wide = cover('Panorama', '%230ea5e9', '%236366f1', 320, 180);
const square = cover('LP', '%23db2777', '%239333ea', 240, 240);

export function ImagePage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.imgName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.imgLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="image" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.imgEx1Title)}
        description={t(m.imgEx1Desc)}
        component="Image"
        render={(K) => (
          <div style={{ display: 'flex', gap: 'var(--glacier-space-4)', alignItems: 'flex-start' }}>
            <K.Image src={dune} alt={t(m.imageDune)} aspectRatio="2 / 3" style={{ width: 120 }} />
            <K.Image src={wide} alt={t(m.imagePanorama)} aspectRatio="16 / 9" style={{ width: 200 }} />
            <K.Image src={square} alt={t(m.imageAlbumArt)} aspectRatio={1} style={{ width: 120 }} />
          </div>
        )}
        code={`import { Image } from '@glacier/react';

<Image src={cover} alt="Dune" aspectRatio="2 / 3" />
<Image src={photo} alt="Panorama" aspectRatio="16 / 9" />
<Image src={art} alt="Album" aspectRatio={1} />`}
      />

      <Example
        title={t(m.imgEx2Title)}
        description={t(m.imgEx2Desc)}
        component="Image"
        render={(K) => (
          <div style={{ display: 'flex', gap: 'var(--glacier-space-4)' }}>
            <K.Image src={square} alt="" aspectRatio="2 / 3" fit="cover" style={{ width: 120 }} />
            <K.Image src={square} alt="" aspectRatio="2 / 3" fit="contain" style={{ width: 120 }} />
          </div>
        )}
        code={`<Image src={art} alt="" aspectRatio="2 / 3" fit="cover" />
<Image src={art} alt="" aspectRatio="2 / 3" fit="contain" />`}
      />

      <Example
        title={t(m.imgEx3Title)}
        description={t(m.imgEx3Desc)}
        component="Image"
        render={(K) => (
          <div style={{ display: 'flex', gap: 'var(--glacier-space-4)' }}>
            <K.Image src={square} alt="" aspectRatio={1} radius="lg" style={{ width: 100 }} />
            <K.Image src={square} alt="" aspectRatio={1} radius="full" style={{ width: 100 }} />
          </div>
        )}
        code={`<Image src={art} alt="" aspectRatio={1} radius="lg" />
<Image src={art} alt="" aspectRatio={1} radius="full" />`}
      />

      <Example
        title={t(m.imgEx4Title)}
        description={t(m.imgEx4Desc)}
        component="Image"
        render={(K) => (
          <div style={{ display: 'flex', gap: 'var(--glacier-space-4)' }}>
            <K.Image src="/missing-cover.jpg" alt={t(m.imageMissingCover)} aspectRatio="2 / 3" style={{ width: 120 }} />
            <K.Image src={dune} alt={t(m.imageLoading)} aspectRatio="2 / 3" skeleton style={{ width: 120 }} />
          </div>
        )}
        code={`<Image src="/missing.jpg" alt="Missing cover" aspectRatio="2 / 3" />
<Image src={cover} alt="Loading" aspectRatio="2 / 3" skeleton />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'src', type: 'string', description: t(m.imgPropSrc) },
          { name: 'alt', type: 'string', description: t(m.imgPropAlt) },
          { name: 'aspectRatio', type: 'string | number', description: t(m.imgPropAspectRatio) },
          { name: 'fit', type: "'cover' | 'contain' | 'fill' | 'none' | 'scale-down'", default: "'cover'", description: t(m.imgPropFit) },
          { name: 'radius', type: "'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'", default: "'md'", description: t(m.imgPropRadius) },
          { name: 'fallback', type: 'ReactNode', description: t(m.imgPropFallback) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.imgPropSkeleton) },
          { name: 'loading', type: "'lazy' | 'eager'", default: "'lazy'", description: t(m.imgPropLoading) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.imgA11y1))}</li>
        <li>{prose(t(m.imgA11y2))}</li>
        <li>{prose(t(m.imgA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.imgUse1))}</li>
        <li>{prose(t(m.imgUse2))}</li>
        <li>{prose(t(m.imgUse3))}</li>
      </ul>
    </>
  );
}
