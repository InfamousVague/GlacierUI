/**
 * @perfect/spec — the language-agnostic contract for the Perfect kit.
 *
 * Import the specs to render docs or drive a framework binding, or read the
 * generated JSON (dist/spec.json) from any language. The React kit consumes the
 * shared vocabulary and per-component enums exported here so it cannot drift.
 */

export * from './schema.ts';
export * from './vocab.ts';

// re-export every component module (each exports its `*Spec` plus any shared
// enum const arrays, e.g. buttonVariants, textTones, inputSizes)
export * from './components/avatar.ts';
export * from './components/button.ts';
export * from './components/callout.ts';
export * from './components/card.ts';
export * from './components/checkbox.ts';
export * from './components/code-block.ts';
export * from './components/counter-badge.ts';
export * from './components/divider.ts';
export * from './components/heading.ts';
export * from './components/icon-button.ts';
export * from './components/input.ts';
export * from './components/kbd.ts';
export * from './components/label.ts';
export * from './components/link.ts';
export * from './components/meter.ts';
export * from './components/number-input.ts';
export * from './components/pill.ts';
export * from './components/progress-bar.ts';
export * from './components/progress-ring.ts';
export * from './components/radio.ts';
export * from './components/search-field.ts';
export * from './components/segmented-bar.ts';
export * from './components/skeleton.ts';
export * from './components/slider.ts';
export * from './components/sparkline.ts';
export * from './components/spinner.ts';
export * from './components/status-dot.ts';
export * from './components/surface.ts';
export * from './components/switch.ts';
export * from './components/text.ts';
export * from './components/textarea.ts';
export * from './components/toggle.ts';
export * from './components/toolbar.ts';

import type { ComponentSpec } from './schema.ts';
import { avatarSpec } from './components/avatar.ts';
import { buttonSpec } from './components/button.ts';
import { calloutSpec } from './components/callout.ts';
import { cardSpec } from './components/card.ts';
import { checkboxSpec } from './components/checkbox.ts';
import { codeBlockSpec } from './components/code-block.ts';
import { counterBadgeSpec } from './components/counter-badge.ts';
import { dividerSpec } from './components/divider.ts';
import { headingSpec } from './components/heading.ts';
import { iconButtonSpec } from './components/icon-button.ts';
import { inputSpec } from './components/input.ts';
import { kbdSpec } from './components/kbd.ts';
import { labelSpec } from './components/label.ts';
import { linkSpec } from './components/link.ts';
import { meterSpec } from './components/meter.ts';
import { numberInputSpec } from './components/number-input.ts';
import { pillSpec } from './components/pill.ts';
import { progressBarSpec } from './components/progress-bar.ts';
import { progressRingSpec } from './components/progress-ring.ts';
import { radioSpec } from './components/radio.ts';
import { searchFieldSpec } from './components/search-field.ts';
import { segmentedBarSpec } from './components/segmented-bar.ts';
import { skeletonSpec } from './components/skeleton.ts';
import { sliderSpec } from './components/slider.ts';
import { sparklineSpec } from './components/sparkline.ts';
import { spinnerSpec } from './components/spinner.ts';
import { statusDotSpec } from './components/status-dot.ts';
import { surfaceSpec } from './components/surface.ts';
import { switchSpec } from './components/switch.ts';
import { textSpec } from './components/text.ts';
import { textareaSpec } from './components/textarea.ts';
import { toggleSpec } from './components/toggle.ts';
import { toolbarSpec } from './components/toolbar.ts';

/** Bump when the schema shape changes in a breaking way. */
export const SPEC_VERSION = '0.1.0';

/** Every component spec, grouped roughly by role for display. */
export const specs: ComponentSpec[] = [
  // text and content
  textSpec,
  headingSpec,
  labelSpec,
  linkSpec,
  kbdSpec,
  codeBlockSpec,
  // actions
  buttonSpec,
  iconButtonSpec,
  toggleSpec,
  // form controls
  inputSpec,
  textareaSpec,
  numberInputSpec,
  searchFieldSpec,
  checkboxSpec,
  radioSpec,
  switchSpec,
  sliderSpec,
  // status and feedback
  pillSpec,
  counterBadgeSpec,
  statusDotSpec,
  avatarSpec,
  calloutSpec,
  meterSpec,
  progressBarSpec,
  progressRingSpec,
  spinnerSpec,
  skeletonSpec,
  // data viz
  sparklineSpec,
  segmentedBarSpec,
  // containers
  cardSpec,
  surfaceSpec,
  dividerSpec,
  // structures
  toolbarSpec,
];

/** Specs keyed by id for O(1) lookup. */
export const specsById: Record<string, ComponentSpec> = Object.fromEntries(specs.map((s) => [s.id, s]));

export function getSpec(id: string): ComponentSpec | undefined {
  return specsById[id];
}
