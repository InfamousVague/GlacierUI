import { defineMessages } from './locale.ts';

/**
 * The kit's own user-facing strings, the ones baked into components (mostly
 * aria-labels on close, dismiss, and stepper controls). Routing them through a
 * catalog means every consuming app inherits real translations instead of
 * hardcoded English, and adding a locale forces translating all of them.
 *
 * These are the exact strings the audit found hardcoded across the kit.
 */
export const kitMessages = defineMessages({
  dismiss: { en: 'Dismiss' },
  close: { en: 'Close' },
  closeTour: { en: 'Close tour' },
  previous: { en: 'Previous' },
  next: { en: 'Next' },
  clearSearch: { en: 'Clear search' },
  decrease: { en: 'Decrease' },
  increase: { en: 'Increase' },
  openNavigation: { en: 'Open navigation' },
  loading: { en: 'Loading' },
  back: { en: 'Back' },
  done: { en: 'Done' },
  less: { en: 'Less' },
  more: { en: 'More' },
  /** Parameterized: t(kitMessages.stepOf, { step, total }). */
  stepOf: { en: 'Step {step} of {total}' },
});

export type KitMessageKey = keyof typeof kitMessages;
