import type { ElementType, FunctionComponent, ReactNode } from 'react';

/**
 * A polymorphic element resolved from an `as` prop. JSX treats it as a component
 * that accepts arbitrary props and children, so the `<Component as={...}>`
 * pattern in the layout primitives stays well-typed even when a consumer app
 * augments `JSX.IntrinsicElements` - react-three-fiber, for example, adds
 * hundreds of three.js elements to the namespace. A bare `ElementType` would
 * otherwise collapse the children of that union to `never` and break every
 * primitive that renders through an `as` prop.
 */
export type PolymorphicComponent = FunctionComponent<Record<string, unknown> & { children?: ReactNode }>;

/** Resolve an `as` prop to a render component, falling back to `fallback`. */
export function asPolymorphic(as: ElementType | undefined, fallback: ElementType): PolymorphicComponent {
  return (as ?? fallback) as unknown as PolymorphicComponent;
}
