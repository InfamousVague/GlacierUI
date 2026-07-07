/**
 * Density modes: control heights scale together via data-density on any
 * ancestor (usually <html>). Paddings/gaps stay on the space scale so
 * everything keeps lining up.
 *
 * Comfortable heights are generous, close to Apple touch targets. Compact
 * pulls everything back for dense desktop tools.
 */

export type Density = 'comfortable' | 'compact';

export const controlHeights: Record<Density, Record<'sm' | 'md' | 'lg', string>> = {
  comfortable: { sm: '2.25rem', md: '2.75rem', lg: '3.25rem' },
  compact: { sm: '1.875rem', md: '2.25rem', lg: '2.75rem' },
};
