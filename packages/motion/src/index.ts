/**
 * @perfect/motion — the kit's micro-animation vocabulary as enums, backed by
 * framer-motion (the `motion` package) and the @perfect/tokens motion tokens.
 *
 * Usage:
 *   import { motion } from 'motion/react';
 *   import { Motion, Speed, Ease, motionProps } from '@perfect/motion';
 *
 *   <motion.div {...motionProps(Motion.ScaleIn, Speed.Fast)} />
 */

import type { TargetAndTransition, Transition } from 'motion/react';
import { durations, easings } from '@perfect/tokens';

/** Every micro-animation the kit ships. Values are stable kebab-case ids. */
export enum Motion {
  FadeIn = 'fade-in',
  FadeOut = 'fade-out',
  ScaleIn = 'scale-in',
  ScaleOut = 'scale-out',
  SlideUp = 'slide-up',
  SlideDown = 'slide-down',
  SlideLeft = 'slide-left',
  SlideRight = 'slide-right',
  Collapse = 'collapse',
  Expand = 'expand',
  Shake = 'shake',
  Pulse = 'pulse',
  Bounce = 'bounce',
  Shimmer = 'shimmer',
}

/** Duration roles — mirror --perfect-duration-*. */
export enum Speed {
  Instant = 'instant',
  Fast = 'fast',
  Normal = 'normal',
  Slow = 'slow',
  Slower = 'slower',
}

/** Easing roles — mirror --perfect-ease-*. */
export enum Ease {
  Out = 'out',
  InOut = 'in-out',
  Spring = 'spring',
  Exit = 'exit',
}

/** Physics spring presets for interruptible motion (thumbs, layout moves). */
export enum Spring {
  Snappy = 'snappy',
  Smooth = 'smooth',
  Bouncy = 'bouncy',
}

const SPRINGS: Record<Spring, Transition> = {
  [Spring.Snappy]: { type: 'spring', stiffness: 520, damping: 38, mass: 0.9 },
  [Spring.Smooth]: { type: 'spring', stiffness: 300, damping: 34, mass: 1 },
  [Spring.Bouncy]: { type: 'spring', stiffness: 460, damping: 26, mass: 1 },
};

/** Build an interruptible spring transition from a preset. */
export function springTransition(preset: Spring = Spring.Snappy): Transition {
  return { ...SPRINGS[preset] };
}

type Bezier = [number, number, number, number];

/** Build a framer-motion transition from token roles. */
export function transition(speed: Speed = Speed.Normal, ease: Ease = Ease.Out): Transition {
  return {
    duration: durations[speed] / 1000,
    ease: [...easings[ease]] as Bezier,
  };
}

export interface MotionProps {
  initial?: TargetAndTransition;
  animate: TargetAndTransition;
  exit?: TargetAndTransition;
  transition: Transition;
  style?: { overflow?: 'hidden' };
}

/**
 * Ready-to-spread props for a motion element. Entrances/exits carry
 * initial/animate/exit; attention effects (Shake, Pulse, Bounce, Shimmer)
 * animate in place — re-mount (change `key`) to replay one-shots.
 */
export function motionProps(kind: Motion, speed?: Speed, ease?: Ease): MotionProps {
  const t = (fallbackSpeed: Speed, fallbackEase: Ease) =>
    transition(speed ?? fallbackSpeed, ease ?? fallbackEase);

  switch (kind) {
    case Motion.FadeIn:
      return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: t(Speed.Normal, Ease.Out) };
    case Motion.FadeOut:
      return { initial: { opacity: 1 }, animate: { opacity: 0 }, transition: t(Speed.Fast, Ease.Exit) };
    case Motion.ScaleIn:
      return {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
        transition: t(Speed.Fast, Ease.Out),
      };
    case Motion.ScaleOut:
      return { initial: { opacity: 1, scale: 1 }, animate: { opacity: 0, scale: 0.96 }, transition: t(Speed.Fast, Ease.Exit) };
    case Motion.SlideUp:
      return { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 }, transition: t(Speed.Normal, Ease.Out) };
    case Motion.SlideDown:
      return { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: t(Speed.Normal, Ease.Out) };
    case Motion.SlideLeft:
      return { initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 8 }, transition: t(Speed.Normal, Ease.Out) };
    case Motion.SlideRight:
      return { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -8 }, transition: t(Speed.Normal, Ease.Out) };
    case Motion.Collapse:
      return {
        initial: { height: 'auto', opacity: 1 },
        animate: { height: 0, opacity: 0 },
        transition: t(Speed.Normal, Ease.InOut),
        style: { overflow: 'hidden' },
      };
    case Motion.Expand:
      return {
        initial: { height: 0, opacity: 0 },
        animate: { height: 'auto', opacity: 1 },
        exit: { height: 0, opacity: 0 },
        transition: t(Speed.Normal, Ease.InOut),
        style: { overflow: 'hidden' },
      };
    case Motion.Shake:
      return { animate: { x: [0, -6, 6, -4, 4, 0] }, transition: { duration: durations.slow / 1000, ease: 'easeInOut' } };
    case Motion.Pulse:
      return { animate: { scale: [1, 1.04, 1] }, transition: { duration: 1.2, ease: 'easeInOut', repeat: Infinity } };
    case Motion.Bounce:
      return { animate: { y: [0, -6, 0] }, transition: { duration: 0.6, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.4 } };
    case Motion.Shimmer:
      return { animate: { opacity: [0.45, 1, 0.45] }, transition: { duration: 1.4, ease: 'easeInOut', repeat: Infinity } };
  }
}

/** Tactile press feedback — spread onto any motion element. */
export const press = {
  whileTap: { scale: 0.97 },
  transition: transition(Speed.Fast, Ease.Out),
} as const;

/** Hover lift for interactive surfaces. */
export const lift = {
  whileHover: { y: -2 },
  transition: transition(Speed.Fast, Ease.Out),
} as const;
