/**
 * Per-section motion vectors.
 *
 * Beyond spring tempo, each AUVORA section has a *direction* of motion:
 *   • Aura  — radial (bloom from orb center)
 *   • Scent — vertical (sheet-from-bottom, sensual gravity)
 *   • Style — lateral-asymmetric (tiles enter from alternating sides w/ jitter)
 *   • Sound — linear (left-to-right strokes, metronomic)
 *   • Self  — centripetal (satellites converge toward center glyph)
 *
 * A user walking through sections should feel their body pulled differently
 * by each. Use these vector-aware variants where a section's content enters
 * the viewport.
 */

import type { Variants } from 'framer-motion';
import { sectionVector, type SectionKey } from '@/design/tokens';
import { SOFT, CINEMATIC, SENSUAL, FIRM } from './springs';

type SpringKey = 'SOFT' | 'FIRM' | 'CINEMATIC' | 'SENSUAL';
const springs: Record<SpringKey, object> = { SOFT, FIRM, CINEMATIC, SENSUAL };

/** Returns the default spring transition for a section. */
export function springFor(section: SectionKey) {
  const key = sectionVector[section].defaultSpring as SpringKey;
  return springs[key];
}

/** Section-aware entrance variants. Composes `hidden` + `visible` states. */
export function sectionEnter(section: SectionKey, index = 0): Variants {
  const v = sectionVector[section];
  const spring = springFor(section);

  switch (v.direction) {
    case 'radial':
      // Aura: bloom outward from orb center — scale from 0.9, soft opacity
      return {
        hidden:  { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: spring },
      };

    case 'vertical':
      // Scent: from below, sensual gravity
      return {
        hidden:  { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: spring },
      };

    case 'lateral-asymmetric': {
      // Style: tiles enter alternating sides with small lateral jitter
      const direction = index % 2 === 0 ? -18 : 18;
      const jitter = 3 + (index * 1.6) % 5; // deterministic micro-jitter
      return {
        hidden:  { opacity: 0, x: direction, y: jitter },
        visible: { opacity: 1, x: 0, y: 0, transition: spring },
      };
    }

    case 'linear':
      // Sound: from the left, metronomic
      return {
        hidden:  { opacity: 0, x: -16 },
        visible: { opacity: 1, x: 0, transition: spring },
      };

    case 'centripetal': {
      // Self: satellites converge toward center; index decides origin angle
      const angle = (index * 137.5) * (Math.PI / 180); // golden-angle scatter
      const dist = 24;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      return {
        hidden:  { opacity: 0, x: dx, y: dy, scale: 0.92 },
        visible: { opacity: 1, x: 0, y: 0, scale: 1, transition: spring },
      };
    }

    default:
      return {
        hidden:  { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: SOFT },
      };
  }
}

/** Section stagger parent — reads stagger delay from tokens. */
export function sectionStagger(section: SectionKey, delayMs = 0): Variants {
  const v = sectionVector[section];
  return {
    hidden:  {},
    visible: {
      transition: {
        staggerChildren: v.staggerMs / 1000,
        delayChildren:   delayMs / 1000,
      },
    },
  };
}
