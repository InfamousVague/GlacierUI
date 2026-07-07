import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  buttonSpec,
  cardElevations,
  cardSpec,
  cardVariants,
  dividerSpec,
  pillSpec,
  segmentedBarSizes,
  segmentedBarTones,
  specs,
  statusDotSpec,
  validateSpec,
  type ComponentSpec,
} from '@perfect/spec';
import { Button, Card, Divider, Pill, SegmentedBar, StatusDot } from '../src/index.ts';

/**
 * The spec is the contract; these tests hold the React kit to it. If a
 * component gains a variant, drops a size, or changes a default without the
 * spec moving too (or the reverse), one of these fails.
 */

describe('spec catalog', () => {
  it('every spec is structurally valid', () => {
    expect(specs.flatMap(validateSpec)).toEqual([]);
  });
});

const names = (list?: readonly { name: string }[]) => list?.map((x) => x.name) ?? [undefined];

/** Every variant x tone x size combination a spec declares. */
function combos(spec: ComponentSpec): { variant?: string; tone?: string; size?: string }[] {
  const out: { variant?: string; tone?: string; size?: string }[] = [];
  for (const variant of names(spec.variants))
    for (const tone of names(spec.tones))
      for (const size of names(spec.sizes)) out.push({ variant, tone, size });
  return out;
}

describe('React matches its spec', () => {
  it('Button covers every spec variant and size, and defaults agree', () => {
    for (const { variant, size } of combos(buttonSpec))
      expect(() =>
        render(
          <Button variant={variant as never} size={size as never}>
            Go
          </Button>,
        ),
      ).not.toThrow();

    const bare = render(<Button>Go</Button>).container.innerHTML;
    const explicit = render(
      <Button variant={buttonSpec.defaults!.variant as never} size={buttonSpec.defaults!.size as never}>
        Go
      </Button>,
    ).container.innerHTML;
    expect(bare).toBe(explicit);
  });

  it('Pill covers every spec variant, tone, and size, and defaults agree', () => {
    for (const { variant, tone, size } of combos(pillSpec))
      expect(() =>
        render(
          <Pill variant={variant as never} tone={tone as never} size={size as never}>
            Tag
          </Pill>,
        ),
      ).not.toThrow();

    const bare = render(<Pill>Tag</Pill>).container.innerHTML;
    const explicit = render(
      <Pill
        variant={pillSpec.defaults!.variant as never}
        tone={pillSpec.defaults!.tone as never}
        size={pillSpec.defaults!.size as never}
      >
        Tag
      </Pill>,
    ).container.innerHTML;
    expect(bare).toBe(explicit);
  });

  it('StatusDot covers every spec tone and size', () => {
    for (const { tone, size } of combos(statusDotSpec))
      expect(() => render(<StatusDot tone={tone as never} size={size as never} />)).not.toThrow();
  });

  it('Divider covers every orientation from its spec', () => {
    const orientations = dividerSpec.props.find((p) => p.name === 'orientation')?.values ?? [];
    expect(orientations.length).toBeGreaterThan(0);
    for (const orientation of orientations)
      expect(() => render(<Divider orientation={orientation as never} />)).not.toThrow();
  });

  it('Card covers every spec variant and elevation, and defaults agree', () => {
    for (const variant of cardVariants)
      for (const elevation of cardElevations)
        expect(() =>
          render(
            <Card variant={variant} elevation={elevation}>
              Body
            </Card>,
          ),
        ).not.toThrow();

    const bare = render(<Card>Body</Card>).container.innerHTML;
    const explicit = render(
      <Card variant={cardSpec.defaults!.variant as never} elevation={cardSpec.defaults!.elevation as never}>
        Body
      </Card>,
    ).container.innerHTML;
    expect(bare).toBe(explicit);
  });

  it('SegmentedBar covers every spec tone and size', () => {
    for (const tone of segmentedBarTones)
      for (const size of segmentedBarSizes)
        expect(() => render(<SegmentedBar size={size} data={[{ value: 1, tone }]} />)).not.toThrow();
  });
});
