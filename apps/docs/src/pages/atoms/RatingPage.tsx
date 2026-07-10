import { useState } from 'react';
import { Rating, Heading, Text, Size, TextTone } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

function ControlledRating() {
  const [value, setValue] = useState(3);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--glacier-space-3)' }}>
      <Rating value={value} onChange={setValue} aria-label="Rate this book" />
      <span style={{ color: 'var(--glacier-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
        {value} / 5
      </span>
    </div>
  );
}

export function RatingPage() {
  return (
    <>
      <Heading level={1}>Rating</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A star rating. Interactive by default - a native radio group, so arrow keys move between
        stars and the value participates in forms - or <code>readOnly</code> for a display badge that
        supports fractional fill, like a 4.3 average.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="rating" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Interactive"
        description="Uncontrolled with defaultValue. Click a star to rate; the group is a native radiogroup, so arrow keys select as well."
        code={`import { Rating } from '@glacier/react';

<Rating defaultValue={4} aria-label="Rate this title" />`}
      >
        <Rating defaultValue={4} aria-label="Rate this title" />
      </Example>

      <Example
        title="Controlled"
        description="Drive the value from state to show it alongside or persist it."
        code={`const [value, setValue] = useState(3);

<Rating value={value} onChange={setValue} aria-label="Rate this book" />`}
      >
        <ControlledRating />
      </Example>

      <Example
        title="Read-only and fractional"
        description="readOnly renders role='img' with the value as its label and supports fractional fill for an average score."
        code={`<Rating readOnly value={4.3} aria-label="Rated 4.3 of 5" />
<Rating readOnly value={5} aria-label="Rated 5 of 5" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-2)' }}>
          <Rating readOnly value={4.3} aria-label="Rated 4.3 of 5" />
          <Rating readOnly value={2.5} aria-label="Rated 2.5 of 5" />
          <Rating readOnly value={5} aria-label="Rated 5 of 5" />
        </div>
      </Example>

      <Example
        title="Sizes"
        description="Three sizes step the star size from sm to lg."
        code={`<Rating readOnly value={4} size={Size.Small} aria-label="Rated 4 of 5" />
<Rating readOnly value={4} size={Size.Medium} aria-label="Rated 4 of 5" />
<Rating readOnly value={4} size={Size.Large} aria-label="Rated 4 of 5" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-2)' }}>
          <Rating readOnly value={4} size={Size.Small} aria-label="Rated 4 of 5" />
          <Rating readOnly value={4} size={Size.Medium} aria-label="Rated 4 of 5" />
          <Rating readOnly value={4} size={Size.Large} aria-label="Rated 4 of 5" />
        </div>
      </Example>

      <Example
        title="Custom max, disabled, and skeleton"
        description="Set max for a different scale; disabled dims and blocks input; skeleton reserves the geometry with one star-shaped bone per star."
        code={`<Rating readOnly value={7} max={10} aria-label="Rated 7 of 10" />
<Rating defaultValue={3} disabled aria-label="Rating (disabled)" />
<Rating skeleton />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-2)' }}>
          <Rating readOnly value={7} max={10} aria-label="Rated 7 of 10" />
          <Rating defaultValue={3} disabled aria-label="Rating (disabled)" />
          <Rating skeleton />
        </div>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'number', description: 'Controlled rating value, 0 to max.' },
          { name: 'defaultValue', type: 'number', description: 'Initial value when uncontrolled.' },
          { name: 'max', type: 'number', default: '5', description: 'Number of stars.' },
          { name: 'onChange', type: '(value: number) => void', description: 'Called with the new value when the user picks a star.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Display-only; renders fractional fill and no controls.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dim and disable interaction.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Star size step.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Render a placeholder with the component geometry.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name for the rating group.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          Interactive ratings render a native radio group. Arrow keys move between and select stars,
          and the value participates in forms for free.
        </li>
        <li>Provide an <code>aria-label</code> to name the group, e.g. &ldquo;Rate this book&rdquo;.</li>
        <li>
          Read-only ratings expose <code>role="img"</code> with the value as their accessible label,
          so assistive tech announces the score rather than five separate stars.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use an interactive Rating to collect a score and a read-only one to display an average.</li>
        <li>Read-only supports fractional values; interactive input snaps to whole stars.</li>
        <li>Keep the default 5-star scale unless your data genuinely uses another <code>max</code>.</li>
      </ul>
    </>
  );
}
