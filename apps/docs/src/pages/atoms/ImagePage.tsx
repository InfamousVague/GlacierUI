import { Image, Heading, Text, Size, TextTone } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';

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
  return (
    <>
      <Heading level={1}>Image</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A framed image with a fixed aspect ratio. It holds its box while the source loads (showing a
        skeleton), fits the image with <code>object-fit</code>, rounds its corners, and swaps in a
        fallback if the source fails. Built for content imagery like cover art, thumbnails, and hero
        shots.
      </Text>

      <Heading level={2}>Examples</Heading>

      <Example
        title="Aspect ratio"
        description="Set aspectRatio to reserve the box before the image decodes, so a grid of covers never shifts. Book covers are 2 / 3."
        code={`import { Image } from '@glacier/react';

<Image src={cover} alt="Dune" aspectRatio="2 / 3" />
<Image src={photo} alt="Panorama" aspectRatio="16 / 9" />
<Image src={art} alt="Album" aspectRatio={1} />`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-4)', alignItems: 'flex-start' }}>
          <Image src={dune} alt="Dune" aspectRatio="2 / 3" style={{ width: 120 }} />
          <Image src={wide} alt="Panorama" aspectRatio="16 / 9" style={{ width: 200 }} />
          <Image src={square} alt="Album art" aspectRatio={1} style={{ width: 120 }} />
        </div>
      </Example>

      <Example
        title="Fit"
        description="object-fit controls how the image fills its frame. cover crops to fill (the default); contain letterboxes to show the whole image."
        code={`<Image src={art} alt="" aspectRatio="2 / 3" fit="cover" />
<Image src={art} alt="" aspectRatio="2 / 3" fit="contain" />`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-4)' }}>
          <Image src={square} alt="" aspectRatio="2 / 3" fit="cover" style={{ width: 120 }} />
          <Image src={square} alt="" aspectRatio="2 / 3" fit="contain" style={{ width: 120 }} />
        </div>
      </Example>

      <Example
        title="Radius"
        description="Round the corners from the radius scale. Use full with a square ratio for a circular avatar-style crop."
        code={`<Image src={art} alt="" aspectRatio={1} radius="lg" />
<Image src={art} alt="" aspectRatio={1} radius="full" />`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-4)' }}>
          <Image src={square} alt="" aspectRatio={1} radius="lg" style={{ width: 100 }} />
          <Image src={square} alt="" aspectRatio={1} radius="full" style={{ width: 100 }} />
        </div>
      </Example>

      <Example
        title="Fallback and skeleton"
        description="A source that fails to load is replaced by a muted broken-image glyph (or your own fallback). Pass skeleton to hold the frame while data is still loading."
        code={`<Image src="/missing.jpg" alt="Missing cover" aspectRatio="2 / 3" />
<Image src={cover} alt="Loading" aspectRatio="2 / 3" skeleton />`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-4)' }}>
          <Image src="/missing-cover.jpg" alt="Missing cover" aspectRatio="2 / 3" style={{ width: 120 }} />
          <Image src={dune} alt="Loading" aspectRatio="2 / 3" skeleton style={{ width: 120 }} />
        </div>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'src', type: 'string', description: 'Required. Image source URL.' },
          { name: 'alt', type: 'string', description: 'Required. Alternative text; pass an empty string for a decorative image.' },
          { name: 'aspectRatio', type: 'string | number', description: 'Aspect ratio of the frame, e.g. "2 / 3" or 1.' },
          { name: 'fit', type: "'cover' | 'contain' | 'fill' | 'none' | 'scale-down'", default: "'cover'", description: 'How the image fills its frame (object-fit).' },
          { name: 'radius', type: "'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'", default: "'md'", description: 'Corner radius from the radius scale.' },
          { name: 'fallback', type: 'ReactNode', description: 'Rendered when the image fails to load. Defaults to a muted broken-image glyph.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Render a placeholder with the frame geometry.' },
          { name: 'loading', type: "'lazy' | 'eager'", default: "'lazy'", description: 'Native loading hint.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          <code>alt</code> is required. Describe the image for content imagery, or pass an empty
          string for purely decorative pictures so screen readers skip them.
        </li>
        <li>While the source loads a skeleton holds the frame; on error a muted broken-image glyph replaces it.</li>
        <li>Images are lazy-loaded by default; pass <code>loading="eager"</code> for above-the-fold hero art.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Always set an <code>aspectRatio</code> in a grid so covers reserve their box and the layout never jumps.</li>
        <li>Use <code>fit="cover"</code> for art that can crop and <code>fit="contain"</code> when the whole image must stay visible.</li>
        <li>Reach for <code>Avatar</code> instead when you need initials and a status ring for a person.</li>
      </ul>
    </>
  );
}
