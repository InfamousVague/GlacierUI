import { expect, test } from '@playwright/test';
import { buttonSpec } from '../../../packages/spec/src/components/button.ts';
import { cardSpec } from '../../../packages/spec/src/components/card.ts';
import { pillSpec } from '../../../packages/spec/src/components/pill.ts';
import { cssValue } from '../../../packages/spec/src/vocab.ts';
import type { ComponentSpec, Measure } from '../../../packages/spec/src/schema.ts';

/**
 * Spec parity, proven in a real browser.
 *
 * For every variant x tone x size combination of the beachhead specs (Button,
 * Pill, Card) the Parity Matrix page renders one resting sample tagged
 * data-parity="<specId>:<variant>:<tone>:<size>". This suite resolves each
 * spec measurement ($token -> var(--glacier-<name>)) inside the live page via
 * a sibling probe element (so theme, accent, and scale knobs all apply), then
 * asserts the rendered sample's computed style equals the resolved
 * expectation for height, padding-inline, border-radius, font-size,
 * background-color, color, and border-color. Lengths tolerate +-0.5px;
 * colors must match exactly.
 *
 * Paint (background/text/border) is read from the spec's structured `paint`
 * bindings: the variant's rest paint, overlaid by the tone's paint where the
 * variant binds that role, with variant-qualified tone tokens (for example
 * `solid-background`) winning. A role a paint-bearing variant omits is, per
 * the schema, genuinely non-token and expected to be transparent. Where a
 * spec carries no structured paint at all (Card text at the time of writing)
 * the expectation falls back to a table mirroring the component CSS, and the
 * test annotates how many roles came from that fallback so the gap stays
 * visible until the spec is backfilled.
 */

const MATRIX_URL = '/#/foundations/paritymatrix';

type Paint = { background?: Measure; text?: Measure; border?: Measure };
type PaintRole = keyof Paint;
const PAINT_ROLES: PaintRole[] = ['background', 'text', 'border'];

/** Paint mirrored from the React kit CSS, used only where the spec is silent. */
function cssFallbackPaint(specId: string, variant: string, tone: string): Paint {
  if (specId === 'button') {
    // Button.module.css
    const table: Record<string, Paint> = {
      solid: { background: '$accent-solid', text: '$accent-contrast', border: 'transparent' },
      soft: { background: '$accent-soft', text: '$accent-text', border: 'transparent' },
      outline: { background: 'transparent', text: '$text', border: '$border-strong' },
      ghost: { background: 'transparent', text: '$text', border: 'transparent' },
      glass: { background: '$glass-regular', text: '$text', border: '$glass-border' },
      danger: { background: '$danger-solid', text: '$danger-contrast', border: 'transparent' },
    };
    return table[variant] ?? {};
  }
  if (specId === 'pill') {
    // Pill.module.css: neutral is the odd tone out in every variant.
    if (variant === 'soft') {
      return tone === 'neutral'
        ? { background: '$hover', text: '$text-muted', border: 'transparent' }
        : { background: `$${tone}-soft`, text: `$${tone}-text`, border: 'transparent' };
    }
    if (variant === 'solid') {
      return tone === 'neutral'
        ? { background: '$gray-9', text: '$accent-contrast', border: 'transparent' }
        : { background: `$${tone}-solid`, text: `$${tone}-contrast`, border: 'transparent' };
    }
    if (variant === 'outline') {
      return tone === 'neutral'
        ? { background: 'transparent', text: '$text-muted', border: '$border-strong' }
        : { background: 'transparent', text: `$${tone}-text`, border: `$${tone}-border` };
    }
    return {};
  }
  if (specId === 'card') {
    // Surface.module.css (.card / .glass)
    const table: Record<string, Paint> = {
      solid: { background: '$surface-raised', text: '$text', border: '$border-subtle' },
      glass: { background: '$glass-regular', text: '$text', border: '$glass-border' },
    };
    return table[variant] ?? {};
  }
  return {};
}

/**
 * Paint from the spec itself. Resolution per role:
 * 1. the tone's variant-qualified token (`solid-background`) when present;
 * 2. the tone's structured paint, but only for roles the variant itself
 *    paints with a token (a tone's paint describes the default variant's
 *    rendering, so it must not invent a fill for, say, outline);
 * 3. the variant's own structured paint (or its legacy tokens map, which
 *    older specs like Card still use for background/border).
 * Roles left unresolved on a variant that binds structured paint are, per
 * the PaintSpec contract, painted with a non-token value: expect transparent.
 */
function specPaint(spec: ComponentSpec, variant: string, tone: string): Paint {
  const variantSpec = spec.variants?.find((v) => v.name === variant);
  const toneSpec = tone === '-' ? undefined : spec.tones?.find((t) => t.name === tone);
  const variantPaint: Partial<Record<PaintRole, Measure>> = {
    background: variantSpec?.paint?.background ?? variantSpec?.tokens?.background,
    text: variantSpec?.paint?.text ?? variantSpec?.tokens?.text,
    border: variantSpec?.paint?.border ?? variantSpec?.tokens?.border,
  };
  const strict = variantSpec?.paint !== undefined;
  const pick = (role: PaintRole): Measure | undefined => {
    const qualified = toneSpec?.tokens?.[`${variant}-${role}`];
    if (qualified !== undefined) return qualified;
    const base = variantPaint[role];
    if (toneSpec !== undefined) {
      if (base === undefined) return strict ? 'transparent' : undefined;
      return toneSpec.paint?.[role] ?? base;
    }
    if (base === undefined) return strict ? 'transparent' : undefined;
    return base;
  };
  return { background: pick('background'), text: pick('text'), border: pick('border') };
}

interface Check {
  /** CSS property read off the rendered sample. */
  prop: string;
  /** CSS property the probe resolves the expectation with. */
  probeProp: string;
  /** Expectation as a CSS expression (token refs already through cssValue). */
  css: string;
  /** Compare the sample's border-box rect instead of a computed property. */
  useRect?: boolean;
}

interface Item {
  key: string;
  checks: Check[];
}

interface Combo {
  variant: string;
  tone: string;
  size: string;
}

function combos(spec: ComponentSpec): Combo[] {
  const variants = spec.variants?.map((v) => v.name) ?? ['-'];
  const tones = spec.tones?.map((t) => t.name) ?? ['-'];
  const sizes = spec.sizes?.map((s) => s.name) ?? ['-'];
  const out: Combo[] = [];
  for (const variant of variants)
    for (const tone of tones) for (const size of sizes) out.push({ variant, tone, size });
  return out;
}

/** Build the checks for one combo; also reports which paint roles fell back. */
function buildItem(
  spec: ComponentSpec,
  combo: Combo,
  fallbackRoles: string[],
): Item {
  const { variant, tone, size } = combo;
  const key = `${spec.id}:${variant}:${tone}:${size}`;
  const sizeSpec = spec.sizes?.find((s) => s.name === size);
  const checks: Check[] = [];

  const push = (prop: string, probeProp: string, measure: Measure | undefined, useRect = false) => {
    if (measure === undefined) return;
    checks.push({ prop, probeProp, css: cssValue(measure), useRect });
  };

  // Geometry. The rendered height is the border-box, so it is compared via
  // getBoundingClientRect; computed `height` is the content box and would be
  // off by the hairline border.
  push('height', 'height', sizeSpec?.height, true);
  push('padding-inline-start', 'padding-inline-start', sizeSpec?.paddingInline ?? spec.dimensions?.padding);
  push('padding-inline-end', 'padding-inline-end', sizeSpec?.paddingInline ?? spec.dimensions?.padding);
  push('border-top-left-radius', 'border-top-left-radius', sizeSpec?.radius ?? spec.dimensions?.radius);
  push('font-size', 'font-size', sizeSpec?.fontSize);

  // Paint: spec bindings first, CSS mirror where the spec is silent.
  const fromSpec = specPaint(spec, variant, tone);
  const fallback = cssFallbackPaint(spec.id, variant, tone);
  const paintProp: Record<PaintRole, string> = {
    background: 'background-color',
    text: 'color',
    border: 'border-top-color',
  };
  for (const role of PAINT_ROLES) {
    const bound = fromSpec[role];
    const value = bound ?? fallback[role];
    if (bound === undefined && value !== undefined) fallbackRoles.push(`${key}:${role}`);
    push(paintProp[role], 'color', value);
  }

  return { key, checks };
}

interface Delta {
  key: string;
  prop: string;
  expected: string;
  actual: string;
}

/** Resolve expectations and read actuals inside the page, next to each sample. */
async function measure(page: import('@playwright/test').Page, items: Item[]): Promise<Delta[]> {
  return page.evaluate((entries: Item[]) => {
    const out: Delta[] = [];
    for (const entry of entries) {
      const host = document.querySelector(`[data-parity="${entry.key}"]`);
      const el = host?.querySelector('[data-part="root"]') as HTMLElement | null;
      if (!el) {
        out.push({ key: entry.key, prop: 'presence', expected: 'rendered sample', actual: 'missing' });
        continue;
      }
      // The probe lives beside the sample so every custom property resolves in
      // the exact same cascade context (theme, accent, density, scale knobs).
      const probe = document.createElement('div');
      el.parentElement!.appendChild(probe);
      for (const check of entry.checks) {
        probe.style.cssText = '';
        probe.style.setProperty(check.probeProp, check.css);
        const expected = getComputedStyle(probe).getPropertyValue(check.probeProp);
        const actual = check.useRect
          ? `${el.getBoundingClientRect().height}px`
          : getComputedStyle(el).getPropertyValue(check.prop);
        out.push({ key: entry.key, prop: check.prop, expected, actual });
      }
      probe.remove();
    }
    return out;
  }, items);
}

const PX = /^-?\d*\.?\d+px$/;

function matches(expected: string, actual: string): boolean {
  const e = expected.trim();
  const a = actual.trim();
  if (PX.test(e) && PX.test(a)) return Math.abs(parseFloat(e) - parseFloat(a)) <= 0.5;
  return e === a;
}

const SPECS = [buttonSpec, pillSpec, cardSpec];

for (const spec of SPECS) {
  test(`${spec.id} renders its spec-resolved token values`, async ({ page }, testInfo) => {
    const fallbackRoles: string[] = [];
    const items = combos(spec).map((combo) => buildItem(spec, combo, fallbackRoles));

    await page.goto(MATRIX_URL);
    await page.waitForSelector(`[data-parity^="${spec.id}:"]`);

    // The matrix must be exhaustive: one sample per spec combo, none extra.
    const rendered = await page.locator(`[data-parity^="${spec.id}:"]`).count();
    expect(rendered, `${spec.id}: matrix sample count`).toBe(items.length);

    const results = await measure(page, items);
    const failures = results.filter((r) => !matches(r.expected, r.actual));

    const assertions = results.length;
    testInfo.annotations.push({
      type: 'parity',
      description: `${items.length} combos, ${assertions} assertions, ${fallbackRoles.length} paint roles from CSS fallback (spec unbound)`,
    });
    if (fallbackRoles.length > 0) {
      testInfo.annotations.push({
        type: 'paint-fallback',
        description: fallbackRoles.join(', '),
      });
    }

    expect(
      failures,
      failures
        .map((f) => `${f.key} ${f.prop}: expected ${f.expected}, got ${f.actual}`)
        .join('\n'),
    ).toEqual([]);
  });
}
