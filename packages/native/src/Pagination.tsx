import { type ReactNode } from 'react';
import { View, Text, Pressable, type ViewProps } from 'react-native';
import { paginationSpec } from '@glacier/spec';
import { press } from '@glacier/commons';
import { t } from './tokens.ts';

/**
 * The Glacier Pagination, rendered with React Native primitives.
 *
 * Pagination is a `compose` molecule: it does not wrap other kit components, it
 * lays out its own previous / page-number / next controls. Its `paginationSpec`
 * declares an empty `paint` map (the page buttons are painted in
 * Pagination.module.css, not tokenised into the spec), so the box paint here is
 * read from the same `--glacier-*` tokens the web CSS uses, wrapped with `t()`:
 *
 *   .button/.page  -> border hairline solid `border`, bg `surface`, text `text`,
 *                     radius-full, min 2.25rem square, padding-inline `space-3`
 *   .page.current  -> bg `accent-soft`, border `accent-border`, text `accent-contrast`
 *   .button:disabled -> opacity 0.5
 *   .ellipsis      -> text `text-subtle`, padding-inline `space-2`
 *   root / .pages  -> row, centered, gap `space-2` (root wraps)
 *
 * The page-window maths (`clampPage` / `buildPageItems`) is copied verbatim from
 * the web component so both bindings compute the identical set of page tokens.
 *
 * Public prop contract matches @glacier/react's Pagination 1:1 (page, total,
 * pageSize, onPageChange, siblingCount, boundaryCount). `page` is fully driven
 * by the parent via `onPageChange`, exactly like the web — there is no internal
 * state, so no `useControlled` is needed. Web-only escape hatches (className,
 * style, DOM nav attributes) are not part of this surface.
 *
 * Resting visuals only: the web control has no rest animation; the Pressable's
 * `press.control` dip matches the shared tap feedback used across the kit. The
 * web builds the "Previous"/"Next" labels through the React i18n provider; this
 * binding has no locale runtime, so it emits the default English strings — the
 * same fallback the native Steps binding uses.
 */

// Derived from the spec so the prop list cannot drift from the web kit.
export type PaginationProps = Omit<ViewProps, 'children' | 'style'> & {
  /** The current page number, one-based. */
  page: number;
  /** Total number of rows or items across all pages. */
  total: number;
  /** Items shown per page. */
  pageSize?: number;
  /** Invoked with the clicked page number. */
  onPageChange: (page: number) => void;
  /** How many pages to show around the active one. */
  siblingCount?: number;
  /** How many pages to keep visible at the start and end for very large ranges. */
  boundaryCount?: number;
};

const DEFAULTS = paginationSpec.defaults as {
  pageSize: number;
  siblingCount: number;
  boundaryCount: number;
};

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), totalPages);
}

function buildPageItems(page: number, totalPages: number, siblingCount: number, boundaryCount: number) {
  const items: Array<number | 'ellipsis'> = [];
  const seen = new Set<number>();
  const pushPage = (value: number) => {
    if (value < 1 || value > totalPages || seen.has(value)) return;
    seen.add(value);
    items.push(value);
  };

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) pushPage(i);
    return items;
  }

  const leftBoundaryCount = Math.max(1, Math.min(boundaryCount, totalPages));
  for (let i = 1; i <= leftBoundaryCount; i += 1) pushPage(i);

  const start = Math.max(2, page - siblingCount);
  const end = Math.min(totalPages - 1, page + siblingCount);

  if (start > leftBoundaryCount + 1) items.push('ellipsis');
  for (let i = start; i <= end; i += 1) pushPage(i);
  if (end < totalPages - leftBoundaryCount) items.push('ellipsis');

  const rightBoundaryStart = Math.max(totalPages - leftBoundaryCount + 1, leftBoundaryCount + 1);
  for (let i = rightBoundaryStart; i <= totalPages; i += 1) pushPage(i);
  return items;
}

// The shared `.button, .page` box, read from the tokens the web CSS uses.
const BOX = {
  minWidth: '2.25rem',
  minHeight: '2.25rem',
  paddingHorizontal: t('space-3'),
  borderRadius: t('radius-full'),
  borderWidth: t('hairline'),
  borderStyle: 'solid' as const,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

/** One previous/next or page-number control, painted resting or current. */
function PageButton({
  label,
  current = false,
  disabled = false,
  onPress,
  accessibilityLabel,
}: {
  label: ReactNode;
  current?: boolean;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const backgroundColor = current ? t('accent-soft') : t('surface');
  const borderColor = current ? t('accent-border') : t('border');
  const color = current ? t('accent-contrast') : t('text');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected: current }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          ...BOX,
          backgroundColor,
          borderColor,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed && !disabled ? press.control : 1 }],
        },
      ]}
    >
      <Text
        style={{
          color,
          fontSize: t('font-size-sm'),
          fontFamily: t('font-sans'),
          fontWeight: t('font-weight-medium') as never,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Pagination({
  page,
  total,
  pageSize = DEFAULTS.pageSize,
  onPageChange,
  siblingCount = DEFAULTS.siblingCount,
  boundaryCount = DEFAULTS.boundaryCount,
  ...rest
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = clampPage(page, totalPages);
  const items = buildPageItems(currentPage, totalPages, siblingCount, boundaryCount);

  return (
    <View
      accessibilityLabel="Pagination"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        flexWrap: 'wrap',
        gap: t('space-2'),
      }}
      {...rest}
    >
      <PageButton
        label="Previous"
        disabled={currentPage <= 1}
        onPress={() => onPageChange(currentPage - 1)}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t('space-2') }}>
        {items.map((item, index) => {
          if (item === 'ellipsis') {
            return (
              <Text
                key={`ellipsis-${index}`}
                aria-hidden
                style={{
                  color: t('text-subtle'),
                  fontSize: t('font-size-sm'),
                  fontFamily: t('font-sans'),
                  paddingHorizontal: t('space-2'),
                }}
              >
                …
              </Text>
            );
          }
          const isCurrent = item === currentPage;
          return (
            <PageButton
              key={item}
              label={String(item)}
              current={isCurrent}
              accessibilityLabel={`Page ${item}`}
              onPress={() => onPageChange(item)}
            />
          );
        })}
      </View>
      <PageButton
        label="Next"
        disabled={currentPage >= totalPages}
        onPress={() => onPageChange(currentPage + 1)}
      />
    </View>
  );
}
