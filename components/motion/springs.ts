/**
 * Shared Framer Motion spring configurations.
 *
 * Import these — do not write inline spring objects in components, or
 * cross-section motion drifts over time.
 *
 * Usage:
 *   import { SOFT, CINEMATIC } from '@/components/motion/springs';
 *   <motion.div transition={CINEMATIC} ... />
 */

import { spring } from '@/design/tokens';

/** Ambient defaults — page/section entrances, soft reveals. */
export const SOFT = spring.SOFT;

/** Interactive — buttons, chip selection, tap feedback. */
export const FIRM = spring.FIRM;

/** Hero reveals — orb bloom, vibe name type-in, signature curve draw. */
export const CINEMATIC = spring.CINEMATIC;

/** Sensual — Scent section default; softer than SOFT, longer dwell. */
export const SENSUAL = spring.SENSUAL;
