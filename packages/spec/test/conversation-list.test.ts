import { describe, expect, it } from 'vitest';
import { auditStrictness, validateSpec } from '../src/index.ts';
import {
  conversationDensities,
  conversationListItemSpec,
  conversationListSpec,
  conversationMarkerOrder,
  conversationSections,
  conversationSkeletonSpec,
} from '../src/components/conversation-list.ts';

const conversationSpecs = [conversationListItemSpec, conversationListSpec, conversationSkeletonSpec];

// The token catalog these specs are allowed to name. Kept as a literal rather
// than parsed from tokens.css so a typo in a spec fails here instead of being
// silently accepted by a regex that also matches nothing.
const KNOWN_TOKEN_PREFIXES = [
  'space-', 'size-', 'control-height-', 'radius-', 'font-', 'leading-', 'tracking-',
  'text', 'hover', 'active', 'accent-', 'danger-', 'warning-', 'success-', 'info-',
  'gray-', 'surface', 'border', 'focus-ring', 'duration-', 'ease-', 'hairline', 'shadow-',
];

describe('conversation specs', () => {
  it('are structurally valid', () => {
    expect(conversationSpecs.flatMap(validateSpec)).toEqual([]);
  });

  it('bind their paint completely', () => {
    for (const spec of conversationSpecs) expect(auditStrictness(spec).missing).toEqual([]);
  });

  it('name only tokens that exist on the scale', () => {
    for (const spec of conversationSpecs)
      for (const name of spec.tokens ?? [])
        expect(
          KNOWN_TOKEN_PREFIXES.some((prefix) => name === prefix || name.startsWith(prefix)),
          `${spec.id} names an unknown token: ${name}`,
        ).toBe(true);
  });

  it('declare every measurement as a token reference, never a raw length', () => {
    // Glyph boxes are the documented exception: an icon sits off the scale.
    for (const size of conversationListItemSpec.sizes ?? [])
      for (const [metric, value] of Object.entries(size))
        if (metric !== 'name' && metric !== 'iconSize')
          expect(String(value).startsWith('$'), `${size.name}.${metric}`).toBe(true);
  });

  it('publish the marker precedence order as the contract both bindings read', () => {
    expect([...conversationMarkerOrder]).toEqual(['failed', 'draft', 'unread', 'muted', 'pinned']);
  });

  it('publish the density and section vocabularies', () => {
    expect([...conversationDensities]).toEqual(['compact', 'comfortable']);
    expect([...conversationSections]).toEqual(['pinned', 'all']);
  });

  it('give the row every marker as a state, so a port cannot skip one', () => {
    const states = (conversationListItemSpec.states ?? []).map((s) => s.name);
    for (const marker of conversationMarkerOrder) expect(states).toContain(marker);
  });

  it('declare a size step for every density', () => {
    const sizes = (conversationListItemSpec.sizes ?? []).map((s) => s.name);
    expect(sizes).toEqual([...conversationDensities]);
  });
});
