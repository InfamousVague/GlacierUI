import { Card, Row, Stack, Surface } from '@perfect/react';
import { ComponentBlueprint } from '../Blueprint.tsx';
import { Example, PropsTable } from '../docs-ui.tsx';

const label: React.CSSProperties = {
  display: 'block',
  marginTop: '0.5rem',
  textAlign: 'center',
};

export function SurfacesPage() {
  return (
    <>
      <h1>Card &amp; Surface</h1>
      <p className="lede">
        Card is a contained block for grouping related content, with optional elevation, hover
        interaction, and a glass material. Surface is a plain background layer that maps directly
        to the surface tokens.
      </p>

      <h2>Anatomy</h2>
      <p>An inspection with the exact spec measurements labelled on the box.</p>
      <ComponentBlueprint specId="card" />
      <ComponentBlueprint specId="surface" />

      <h2>Examples</h2>

      <Example
        title="Elevation"
        description="Six elevation levels are available. Levels 0 through 3 cover most layouts: 0 sits flat, 1 is the default, 2 and 3 separate floating content from the page."
        code={`import { Card } from '@perfect/react';

<Row gap={4}>
  <Card elevation={0}>Elevation 0</Card>
  <Card elevation={1}>Elevation 1</Card>
  <Card elevation={2}>Elevation 2</Card>
  <Card elevation={3}>Elevation 3</Card>
</Row>`}
      >
        <Row gap={4}>
          {([0, 1, 2, 3] as const).map((level) => (
            <div key={level}>
              <Card elevation={level} style={{ width: '9rem', padding: '1.25rem' }}>
                Content
              </Card>
              <code style={label}>elevation={level}</code>
            </div>
          ))}
        </Row>
      </Example>

      <Example
        title="Interactive"
        description="Set interactive when the whole card is clickable. The card lifts 2px on hover and presses down slightly on tap. Both effects are skipped when the user prefers reduced motion."
        code={`<Card interactive elevation={1} onClick={() => console.log('open')}>
  <strong>Quarterly report</strong>
  <p>Updated 2 hours ago</p>
</Card>`}
      >
        <Card
          interactive
          elevation={1}
          style={{ width: '16rem', padding: '1.25rem', cursor: 'pointer' }}
        >
          <strong>Quarterly report</strong>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--perfect-text-secondary)' }}>
            Updated 2 hours ago
          </p>
        </Card>
      </Example>

      <Example
        title="Glass"
        description="The glass variant is a translucent material that blurs whatever is rendered behind it. Use it for chrome that floats over content, such as toolbars, overlays, and heads-up panels."
        code={`<div style={{ position: 'relative' }}>
  <img src="/artwork.jpg" alt="" />
  <Card variant="glass" elevation={2} style={{ position: 'absolute', inset: '2rem' }}>
    Now playing
  </Card>
</div>`}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '24rem',
            height: '11rem',
            borderRadius: 'var(--perfect-radius-lg)',
            overflow: 'hidden',
            background:
              'radial-gradient(circle at 20% 30%, oklch(0.7 0.19 300), transparent 55%), radial-gradient(circle at 80% 20%, oklch(0.75 0.17 200), transparent 55%), radial-gradient(circle at 60% 90%, oklch(0.72 0.18 25), transparent 55%), var(--perfect-surface)',
          }}
        >
          <Card
            variant="glass"
            elevation={2}
            style={{
              position: 'absolute',
              inset: '1.75rem',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            Now playing
          </Card>
        </div>
      </Example>

      <Example
        title="Surface levels"
        description="Surface renders a background layer with no shadow or padding of its own. Level 0 is the app background, 1 is the standard surface, 2 is raised, and 'sunken' is for inset wells such as code blocks and empty states."
        code={`import { Surface } from '@perfect/react';

<Surface level={0}>App background</Surface>
<Surface level={1}>Surface</Surface>
<Surface level={2}>Raised</Surface>
<Surface level="sunken">Sunken well</Surface>`}
      >
        <Stack gap={4} style={{ width: '100%', maxWidth: '22rem' }}>
          {([0, 1, 2, 'sunken'] as const).map((level) => (
            <Surface
              key={String(level)}
              level={level}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--perfect-radius-md)',
                border: 'var(--perfect-hairline) solid var(--perfect-border-subtle)',
              }}
            >
              <code>level={typeof level === 'string' ? `"${level}"` : `{${level}}`}</code>
            </Surface>
          ))}
        </Stack>
      </Example>

      <Example
        title="Skeleton"
        description="A skeleton Card keeps the real chrome, elevation, and padding, and swaps its content for placeholder text lines. A skeleton Surface is a plain block placeholder for background regions."
        code={`<Card skeleton elevation={1} />
<Card elevation={1}>
  <strong>Quarterly report</strong>
  <p>Updated 2 hours ago</p>
</Card>
<Surface skeleton />`}
      >
        <Row gap={4} align="stretch">
          <div style={{ width: '16rem' }}>
            <Card skeleton elevation={1} />
          </div>
          <Card elevation={1} style={{ width: '16rem' }}>
            <strong>Quarterly report</strong>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--perfect-text-secondary)' }}>
              Updated 2 hours ago
            </p>
          </Card>
        </Row>
        <div style={{ width: '100%', maxWidth: '22rem' }}>
          <Surface skeleton />
        </div>
      </Example>

      <h2>Props</h2>

      <h3>Card</h3>
      <PropsTable
        props={[
          {
            name: 'elevation',
            type: '0 | 1 | 2 | 3 | 4 | 5',
            default: '1',
            description: 'Shadow level. Higher values read as closer to the viewer.',
          },
          {
            name: 'interactive',
            type: 'boolean',
            default: 'false',
            description:
              'Adds a hover lift and a press animation for clickable cards. Disabled under prefers-reduced-motion.',
          },
          {
            name: 'variant',
            type: "'solid' | 'glass'",
            default: "'solid'",
            description:
              'Solid uses an opaque surface token. Glass is a translucent material that blurs the content behind it.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'Card content.',
          },
        ]}
      />

      <h3>Surface</h3>
      <PropsTable
        props={[
          {
            name: 'level',
            type: "0 | 1 | 2 | 'sunken'",
            default: '1',
            description:
              "Background layer: 0 maps to the bg token, 1 to surface, 2 to surface-raised, and 'sunken' to surface-sunken.",
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: '...div props',
            type: "ComponentProps<'div'>",
            description: 'All native div props, including style, className, and event handlers.',
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          Card and Surface render as plain <code>div</code> elements with no implicit role.
          Elevation and level are visual only.
        </li>
        <li>
          An interactive Card is not focusable by itself. Put the click target on a nested link or
          button, or pass <code>role="button"</code>, <code>tabIndex={0}</code>, and a keyboard
          handler when the whole card acts as one control.
        </li>
        <li>
          The hover lift and tap press on interactive cards are skipped when the user has
          prefers-reduced-motion enabled.
        </li>
        <li>
          Glass surfaces keep text contrast readable over the blurred backdrop, but verify contrast
          when placing them over user-supplied imagery.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>
          Use Card to group related content into one unit: a summary, a list item, a settings
          section. Use Surface when you only need a background layer with no shadow.
        </li>
        <li>
          Keep most cards at elevation 0 or 1. Reserve 2 and above for content that floats over the
          page, such as popovers and dialogs.
        </li>
        <li>
          Set <code>interactive</code> only when the card is clickable. A hover lift on static
          content suggests an action that does not exist.
        </li>
        <li>
          Use the glass variant for chrome and floating layers over content: toolbars, media
          overlays, panels above imagery. Solid cards are the default for page content.
        </li>
        <li>
          Do not nest glass on glass. Stacked blurs are expensive to render and the layers become
          hard to tell apart.
        </li>
        <li>
          Use <code>level="sunken"</code> for inset areas such as code samples, drop zones, and
          empty states.
        </li>
      </ul>
    </>
  );
}
