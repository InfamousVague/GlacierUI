/**
 * Strictness suite for the spec catalog.
 *
 * Cross-framework parity needs more than geometry: a port that matches every
 * height and radius can still paint with the wrong tokens. These tests hold
 * the catalog to the strictness auditor - the core atoms must bind their
 * paint completely, and the catalog-wide completeness fraction is ratcheted
 * so it can only improve.
 */

import { describe, expect, it } from 'vitest';
import { auditCatalogStrictness, auditStrictness, getSpec, specs, validateSpec } from '../src/index.ts';

describe('spec catalog schema validity', () => {
  it('every spec passes structural validation', () => {
    expect(specs.flatMap(validateSpec)).toEqual([]);
  });

  it('every paint, focus ring, and transition binding is a $token reference', () => {
    // validateSpec checks these too; this spells the contract out for readers
    for (const spec of specs) {
      for (const style of [...(spec.variants ?? []), ...(spec.tones ?? [])]) {
        for (const value of Object.values(style.paint ?? {})) expect(value).toMatch(/^\$/);
      }
      for (const state of spec.states ?? []) {
        for (const value of Object.values(state.paint ?? {})) expect(value).toMatch(/^\$/);
      }
      if (spec.focusRing) expect(spec.focusRing.ring).toMatch(/^\$/);
      if (spec.transition) {
        expect(spec.transition.duration).toMatch(/^\$/);
        expect(spec.transition.ease).toMatch(/^\$/);
      }
    }
  });
});

/** The core atoms held to full paint strictness: a port can bind these blind. */
const CORE_ATOMS = [
  'button',
  'icon-button',
  'pill',
  'input',
  'textarea',
  'search-field',
  'checkbox',
  'radio',
  'switch',
  'callout',
  'banner',
  'card',
];

describe('core atom strictness', () => {
  it.each(CORE_ATOMS)('%s is 100%% strict', (id) => {
    const spec = getSpec(id);
    expect(spec).toBeDefined();
    const report = auditStrictness(spec!);
    expect(report.missing).toEqual([]);
    expect(report.completeness).toBe(1);
  });
});

describe('catalog strictness ratchet', () => {
  // Measured 2026-07-10 at 0.996 (318 checks, 138 missing). Raise this floor
  // as more specs gain paint bindings; never lower it.
  const COMPLETENESS_FLOOR = 0.99;

  it(`catalog-wide completeness stays at or above ${COMPLETENESS_FLOOR}`, () => {
    const catalog = auditCatalogStrictness(specs);
    expect(catalog.checks).toBeGreaterThan(0);
    expect(catalog.completeness).toBeGreaterThanOrEqual(COMPLETENESS_FLOOR);
  });

  it('per-spec summaries roll up to the catalog fraction', () => {
    const catalog = auditCatalogStrictness(specs);
    expect(catalog.components.map((c) => c.id)).toEqual(specs.map((s) => s.id));
    const checks = catalog.components.reduce((sum, c) => sum + c.checks, 0);
    const missing = catalog.components.reduce((sum, c) => sum + c.missing.length, 0);
    expect(catalog.checks).toBe(checks);
    expect(catalog.missing).toBe(missing);
    expect(catalog.completeness).toBeCloseTo((checks - missing) / checks, 10);
  });
});
