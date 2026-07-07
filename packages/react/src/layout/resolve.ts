import type { CSSProperties } from 'react';
import type { SpaceStep } from '@perfect/tokens';
import type { BoxStyleProps, FlowProps, Responsive } from './types.ts';

const BREAKPOINTS = ['base', 'sm', 'md', 'lg', 'xl'] as const;

const spaceToken = (step: SpaceStep): string => `var(--perfect-space-${step})`;

/** Emit the per-breakpoint custom properties for a responsive space value. */
function assignSpace(
  style: Record<string, string>,
  key: string,
  value: Responsive<SpaceStep> | undefined,
): void {
  if (value === undefined) return;
  if (typeof value === 'number') {
    style[`--pl-${key}-base`] = spaceToken(value);
    return;
  }
  for (const bp of BREAKPOINTS) {
    const step = value[bp];
    if (step !== undefined) style[`--pl-${key}-${bp}`] = spaceToken(step);
  }
}

/** Emit the per-breakpoint column-count properties for a Grid. */
export function assignColumns(
  style: Record<string, string>,
  value: Responsive<number> | undefined,
): void {
  if (value === undefined) return;
  if (typeof value === 'number') {
    style['--pl-cols-base'] = String(value);
    return;
  }
  for (const bp of BREAKPOINTS) {
    const count = value[bp];
    if (count !== undefined) style[`--pl-cols-${bp}`] = String(count);
  }
}

export interface Resolved {
  style: CSSProperties;
  attrs: Record<string, string | undefined>;
}

/** Turn box style props into custom properties and data attributes. */
export function resolveBox(props: BoxStyleProps): Resolved {
  const style: Record<string, string> = {};

  // Padding resolves widest to narrowest: all sides, then axes, then edges,
  // so a later, more specific prop wins per breakpoint.
  assignSpace(style, 'pt', props.padding);
  assignSpace(style, 'pr', props.padding);
  assignSpace(style, 'pb', props.padding);
  assignSpace(style, 'pl', props.padding);
  assignSpace(style, 'pl', props.paddingX);
  assignSpace(style, 'pr', props.paddingX);
  assignSpace(style, 'pt', props.paddingY);
  assignSpace(style, 'pb', props.paddingY);
  if (props.paddingTop !== undefined) style['--pl-pt-base'] = spaceToken(props.paddingTop);
  if (props.paddingRight !== undefined) style['--pl-pr-base'] = spaceToken(props.paddingRight);
  if (props.paddingBottom !== undefined) style['--pl-pb-base'] = spaceToken(props.paddingBottom);
  if (props.paddingLeft !== undefined) style['--pl-pl-base'] = spaceToken(props.paddingLeft);

  const attrs: Record<string, string | undefined> = {
    'data-bg': props.background,
    'data-radius': props.radius,
    'data-border': props.border === true ? 'default' : props.border || undefined,
    'data-elevation': props.elevation !== undefined ? String(props.elevation) : undefined,
    'data-w': props.width,
    'data-maxw': props.maxWidth,
    'data-h': props.height,
    'data-grow': props.grow ? '' : undefined,
    'data-shrink': props.shrink ? '' : undefined,
    'data-self': props.alignSelf,
  };

  return { style: style as CSSProperties, attrs };
}

/** Turn flow props (gap, align, justify) into properties and attributes. */
export function resolveFlow(props: FlowProps): Resolved {
  const style: Record<string, string> = {};
  assignSpace(style, 'gap', props.gap);
  const attrs: Record<string, string | undefined> = {
    'data-align': props.align,
    'data-justify': props.justify,
  };
  return { style: style as CSSProperties, attrs };
}

/** Split the layout props off a component's props, keeping the rest for the DOM. */
export function splitBoxProps<T extends BoxStyleProps>(
  props: T,
): { box: BoxStyleProps; rest: Omit<T, keyof BoxStyleProps> } {
  const {
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    background,
    radius,
    border,
    elevation,
    width,
    maxWidth,
    height,
    grow,
    shrink,
    alignSelf,
    ...rest
  } = props;
  return {
    box: {
      padding,
      paddingX,
      paddingY,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      background,
      radius,
      border,
      elevation,
      width,
      maxWidth,
      height,
      grow,
      shrink,
      alignSelf,
    },
    rest: rest as Omit<T, keyof BoxStyleProps>,
  };
}
