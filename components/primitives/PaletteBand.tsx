'use client';

import { m } from 'framer-motion';
import { ceremony } from '@/design/tokens';
import { CINEMATIC } from '@/components/motion/springs';

interface PaletteBandProps {
  /** Hex colors, in order. Invalid values are filtered out. */
  colors: string[];
  /** Band height in pixels. Default 96. */
  height?: number;
  /** Soft gradient bleed between swatches. Default true. */
  bleed?: boolean;
  /** When true, swatches unfurl left-to-right on enter. Default true. */
  animate?: boolean;
  /** Delay before entrance. Default 0ms. */
  delayMs?: number;
  /** Optional className for layout hooks. */
  className?: string;
}

/**
 * Full-width horizontal color field.
 *
 * This is the hero palette rendering for Aura result scenes — a soft
 * gradient field, not a row of swatches. The Aura result uses `bleed=true`
 * so colors flow into each other; archive detail scenes can set `bleed=false`
 * for a firmer read.
 *
 * For small contexts (chips, archive tiles) use `PaletteSwatchRow` instead.
 */
export default function PaletteBand({
  colors,
  height = 96,
  bleed = true,
  animate = true,
  delayMs = 0,
  className,
}: PaletteBandProps) {
  const valid = colors.filter((c) => /^#[0-9a-fA-F]{6}$/.test(c));
  if (valid.length === 0) return null;

  const swatchMs = ceremony.phase4.paletteSwatchMs / 1000;

  // Build a gradient string — each color at an anchor point, with soft
  // overlap if bleed is on.
  const stops = valid.map((c, i) => {
    const pct = (i / (valid.length - 1 || 1)) * 100;
    return `${c} ${pct}%`;
  });
  const gradient = bleed
    ? `linear-gradient(90deg, ${stops.join(', ')})`
    : `linear-gradient(90deg, ${valid.map((c, i) => {
        const start = (i / valid.length) * 100;
        const end = ((i + 1) / valid.length) * 100;
        return `${c} ${start}%, ${c} ${end}%`;
      }).join(', ')})`;

  if (!animate) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height,
          background: gradient,
          borderRadius: 20,
          overflow: 'hidden',
        }}
      />
    );
  }

  // Animate by masking the band from the left — a gradient reveal mask
  // that drives from 0% to 100% with a spring.
  return (
    <m.div
      className={className}
      style={{
        width: '100%',
        height,
        background: gradient,
        borderRadius: 20,
        overflow: 'hidden',
      }}
      initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
      animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
      transition={{
        ...CINEMATIC,
        delay: delayMs / 1000,
        // Give clipPath a slightly longer unfurl than the spring default
        clipPath: { duration: (swatchMs * valid.length) + 0.2, ease: [0.22, 1, 0.36, 1], delay: delayMs / 1000 },
      }}
    />
  );
}
