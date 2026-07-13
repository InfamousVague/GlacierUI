import { type ReactNode } from 'react';
import { View, Text, Pressable, type ViewProps } from 'react-native';
import { useControlled } from '@glacier/commons';
import { t } from './tokens.ts';

/**
 * Accordion — the @glacier/native binding of the web Accordion (a vertically
 * stacked list of disclosure panels that expand to reveal content).
 *
 * `accordionSpec` declares no paint or dimensions (its `paint` is `{}` and it
 * has no `sizes`/`dimensions`) — the web reads its box + type tokens straight
 * from Accordion.module.css. So there is nothing to pull through the resolvers;
 * instead the exact CSS tokens are mirrored here via `t()` (bare names wrapped
 * in `var(--glacier-*)`), and the two raw rems the web hardcodes for the chevron
 * and content font-size pass through verbatim, exactly like Steps/Callout do
 * with the raw lengths their CSS declares. This keeps the binding pixel-matched
 * to the DOM kit and unable to drift:
 *   - item:    hairline `border` box, `radius-lg`, `surface` fill, overflow hidden
 *   - trigger: row with `space-2`/`space-3` padding; disabled dims to 0.5 opacity
 *   - title:   inherits the ambient body type (`text` / `font-size-md` / regular)
 *   - chevron: `text-subtle`, raw `0.85rem`, `+`/`−` glyph, hidden from a11y
 *   - content: `space-2`/`space-3` padding, `text-subtle`, raw `0.95rem`
 *
 * Open state is uncontrolled (there is no controlled `open` prop on the web
 * component either): it is seeded from `defaultOpen` and owned internally via
 * useControlled, and each trigger is a Pressable that toggles it. Resting
 * visuals only — the expand/collapse is state-driven (the open panel is mounted,
 * the closed one is not), with no height animation runtime on this binding.
 *
 * Text color + fontSize live on <Text> (a bare string cannot sit in a View and
 * color does not inherit across a View); `title`/`content` arrive as ReactNode
 * and are wrapped in <Text>, matching Callout/Button. The web-only `className`
 * and `style` escape hatches are not part of ViewProps and are accepted-but-noop.
 */

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps extends Omit<ViewProps, 'children' | 'style'> {
  items: AccordionItem[];
  defaultOpen?: string | string[];
  allowMultiple?: boolean;
}

function normalizeOpenIds(defaultOpen?: string | string[]): string[] {
  if (Array.isArray(defaultOpen)) return defaultOpen;
  return defaultOpen ? [defaultOpen] : [];
}

export function Accordion({ items, defaultOpen, allowMultiple = false, ...rest }: AccordionProps) {
  // No controlled `open` prop on the web component; useControlled with only a
  // defaultValue is a pure uncontrolled store, matching the web's useState.
  const [openIds, setOpenIds] = useControlled<string[]>({
    defaultValue: normalizeOpenIds(defaultOpen),
  });
  const safeItems = items ?? [];

  const toggle = (id: string) => {
    const isOpen = openIds.includes(id);
    if (allowMultiple) {
      setOpenIds(isOpen ? openIds.filter((value) => value !== id) : [...openIds, id]);
    } else {
      setOpenIds(isOpen ? [] : [id]);
    }
  };

  return (
    <View style={{ flexDirection: 'column', rowGap: t('space-2') }} {...rest}>
      {safeItems.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <View
            key={item.id}
            style={{
              borderWidth: t('hairline'),
              borderStyle: 'solid',
              borderColor: t('border'),
              borderRadius: t('radius-lg'),
              overflow: 'hidden',
              backgroundColor: t('surface'),
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen, disabled: item.disabled }}
              aria-expanded={isOpen}
              disabled={item.disabled}
              onPress={() => toggle(item.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                columnGap: t('space-2'),
                width: '100%',
                paddingVertical: t('space-2'),
                paddingHorizontal: t('space-3'),
                // The web trigger is `text-align: start`; disabled dims the whole
                // header to 0.5, matching `.trigger:disabled`.
                opacity: item.disabled ? 0.5 : 1,
              }}
            >
              <Text
                style={{
                  // `.trigger` is `color: inherit` / `font: inherit` — the
                  // ambient body type (regular weight, base size).
                  flexShrink: 1,
                  color: t('text'),
                  fontSize: t('font-size-md'),
                  fontFamily: t('font-sans'),
                  fontWeight: t('font-weight-regular') as never,
                }}
              >
                {item.title}
              </Text>
              <Text
                aria-hidden={true}
                style={{
                  color: t('text-subtle'),
                  fontSize: '0.85rem',
                  lineHeight: 1 as never,
                }}
              >
                {isOpen ? '−' : '+'}
              </Text>
            </Pressable>
            {isOpen && (
              <View style={{ paddingVertical: t('space-2'), paddingHorizontal: t('space-3') }}>
                <Text
                  style={{
                    color: t('text-subtle'),
                    fontSize: '0.95rem',
                    lineHeight: 1.45 as never,
                    fontFamily: t('font-sans'),
                  }}
                >
                  {item.content}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
