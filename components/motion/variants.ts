/**
 * Shared Framer Motion variants.
 *
 * These cover the common cross-section motions. Section-specific choreography
 * (orb bloom, ceremony phases, timeline ribbon scrub, etc.) lives with each
 * section's components.
 */

import type { Variants } from 'framer-motion';
import { SOFT, CINEMATIC } from './springs';

/** Soft lift entrance — default for section content. */
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SOFT,
  },
};

/** Cinematic lift + scale — hero moments (vibe name, orb bloom). */
export const heroReveal: Variants = {
  hidden:  { opacity: 0, y: 20, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: CINEMATIC,
  },
};

/** Container that staggers children. Default 120ms; override per section. */
export const staggerParent = (staggerMs = 120, delayMs = 0): Variants => ({
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: staggerMs / 1000,
      delayChildren:   delayMs / 1000,
    },
  },
});

/** Soft page/section swap — 12px lift + fade. */
export const sectionSwap: Variants = {
  initial: { opacity: 0, y: 12 },
  enter:   {
    opacity: 1,
    y: 0,
    transition: SOFT,
  },
  exit:    {
    opacity: 0,
    y: -8,
    transition: { ...SOFT, mass: 0.8 },
  },
};

/** Sheet/drawer from bottom. Used by SheetDialog. */
export const sheetFromBottom: Variants = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SOFT,
  },
  exit:    {
    opacity: 0,
    y: 40,
    transition: { ...SOFT, mass: 0.9 },
  },
};
