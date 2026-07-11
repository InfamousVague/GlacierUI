import { Button, Card, Heading, Pill, Size, Text, TextTone } from '@glacier/react';
import {
  buttonVariants,
  cardVariants,
  compactSizes,
  controlSizes,
  pillVariants,
  tones,
} from '@glacier/spec';
import type { CSSProperties, ReactNode } from 'react';

// Every sample on this page is addressed by the spec-parity harness
// (tests/parity.spec.ts) through its data-parity key, so the grids must stay
// exhaustive: one resting sample for every variant x tone x size combination
// the spec declares for the beachhead set (Button, Pill, Card). Axes a spec
// does not have are written as "-" in the key.
const GRID: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--glacier-space-5)',
  alignItems: 'flex-start',
  marginBottom: 'var(--glacier-space-7)',
};

const CELL: CSSProperties = {
  display: 'grid',
  gap: 'var(--glacier-space-1)',
  justifyItems: 'start',
};

// The data-part attribute lands on the component root through the rest spread.
// It is typed as a loose record because data attributes are not declared on
// the component prop contracts.
const PART_ROOT = { 'data-part': 'root' } as Record<string, string>;

function Sample({
  id,
  variant,
  tone = '-',
  size = '-',
  children,
}: {
  id: string;
  variant: string;
  tone?: string;
  size?: string;
  children: ReactNode;
}) {
  const key = `${id}:${variant}:${tone}:${size}`;
  return (
    <div style={CELL} data-parity={key}>
      <Text as="span" size={Size.XSmall} tone={TextTone.Subtle} mono>
        {key}
      </Text>
      {children}
    </div>
  );
}

export function ParityMatrixPage() {
  return (
    <>
      <Heading level={1}>Parity Matrix</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A machine-readable render of the beachhead components in every variant, tone, and size their
        specs declare. The browser parity test walks this page and asserts that each sample&rsquo;s
        computed geometry and paint equal the spec&rsquo;s resolved token values, so any framework
        port can be held to the same pixels.
      </Text>

      <Heading level={2}>Button</Heading>
      <Text tone={TextTone.Muted}>
        Every spec variant crossed with the three control sizes. Button has no tone axis.
      </Text>
      <div style={GRID}>
        {buttonVariants.map((variant) =>
          controlSizes.map((size) => (
            <Sample key={`${variant}-${size}`} id="button" variant={variant} size={size}>
              <Button variant={variant} size={size} {...PART_ROOT}>
                Button
              </Button>
            </Sample>
          )),
        )}
      </div>

      <Heading level={2}>Pill</Heading>
      <Text tone={TextTone.Muted}>
        Every spec variant crossed with every semantic tone and both compact sizes.
      </Text>
      <div style={GRID}>
        {pillVariants.map((variant) =>
          tones.map((tone) =>
            compactSizes.map((size) => (
              <Sample
                key={`${variant}-${tone}-${size}`}
                id="pill"
                variant={variant}
                tone={tone}
                size={size}
              >
                <Pill variant={variant} tone={tone} size={size} {...PART_ROOT}>
                  Pill
                </Pill>
              </Sample>
            )),
          ),
        )}
      </div>

      <Heading level={2}>Card</Heading>
      <Text tone={TextTone.Muted}>
        Both surface materials at the default elevation. Card has no tone or size axis.
      </Text>
      <div style={GRID}>
        {cardVariants.map((variant) => (
          <Sample key={variant} id="card" variant={variant}>
            <Card variant={variant} style={{ maxWidth: '16rem' }} {...PART_ROOT}>
              <Text size={Size.Small} tone={TextTone.Muted}>
                A resting card sample for the parity harness.
              </Text>
            </Card>
          </Sample>
        ))}
      </div>
    </>
  );
}
