import { describe, expect, it } from 'vitest';
import { auditStrictness, validateSpec, type ComponentSpec } from '../src/schema.ts';
// Direct file paths: these specs are not registered in src/index.ts yet.
import { reactionPillSpec, reactionIntents } from '../src/components/reaction-pill.ts';
import { reactionBarSpec, reactionBarAddModes } from '../src/components/reaction-bar.ts';
import { reactionPickerSpec } from '../src/components/reaction-picker.ts';
import { messageActionsSpec, messageActionOrder, messageActionLayouts } from '../src/components/message-actions.ts';

const reactionSpecs: ComponentSpec[] = [reactionPillSpec, reactionBarSpec, reactionPickerSpec, messageActionsSpec];

describe('reaction specs', () => {
  it.each(reactionSpecs)('$id is structurally valid', (spec) => {
    expect(validateSpec(spec)).toEqual([]);
  });

  it.each(reactionSpecs)('$id binds every paint the strictness audit asks for', (spec) => {
    expect(auditStrictness(spec).missing).toEqual([]);
  });

  it('keeps every measurement on the token scale', () => {
    for (const spec of reactionSpecs) {
      for (const [metric, value] of Object.entries(spec.dimensions ?? {})) {
        // A raw CSS length is allowed by the schema but should be the exception;
        // none of these four needs one.
        expect(`${spec.id}.${metric}=${value}`).toMatch(/=\$/);
      }
    }
  });

  it('declares the enums both bindings derive from', () => {
    expect([...reactionIntents]).toEqual(['add', 'remove']);
    expect([...reactionBarAddModes]).toEqual(['auto', 'always', 'never']);
    expect([...messageActionLayouts]).toEqual(['cluster', 'menu']);
    // The order is the contract: it decides what folds into the overflow.
    expect([...messageActionOrder]).toEqual(['react', 'reply', 'thread', 'more']);
  });

  it('gives every id a unique kebab-case name, ready to register', () => {
    const ids = reactionSpecs.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
  });
});
