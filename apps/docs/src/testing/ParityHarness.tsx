import { Button, Card, Pill, Text, Size, TextTone } from '@glacier/react';
import {
  buttonVariants,
  cardVariants,
  compactSizes,
  controlSizes,
  pillVariants,
  tones,
} from '@glacier/spec';
import type { CSSProperties, ReactNode } from 'react';

// Browser-only fixture for tests/parity.spec.ts. This is intentionally not
// registered as a docs page or indexed by navigation and search.
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

export function ParityHarness() {
  return (
    <main aria-label="Spec parity test harness">
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

      <div style={GRID}>
        {pillVariants.map((variant) =>
          tones.map((tone) =>
            compactSizes.map((size) => (
              <Sample key={`${variant}-${tone}-${size}`} id="pill" variant={variant} tone={tone} size={size}>
                <Pill variant={variant} tone={tone} size={size} {...PART_ROOT}>
                  Pill
                </Pill>
              </Sample>
            )),
          ),
        )}
      </div>

      <div style={GRID}>
        {cardVariants.map((variant) => (
          <Sample key={variant} id="card" variant={variant}>
            <Card variant={variant} style={{ maxWidth: '16rem' }} {...PART_ROOT}>
              <Text size={Size.Small} tone={TextTone.Muted}>
                Resting card sample
              </Text>
            </Card>
          </Sample>
        ))}
      </div>
    </main>
  );
}