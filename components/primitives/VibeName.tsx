'use client';

import { m, AnimatePresence } from 'framer-motion';
import { color, type, ceremony } from '@/design/tokens';
import { CINEMATIC } from '@/components/motion/springs';

interface VibeNameProps {
  /** The vibe name to render. Empty string renders nothing. */
  name: string;
  /** Size preset. Default `display` (clamp 40–64px). */
  size?: 'display' | 'title';
  /** When true, characters stagger in (ceremony reveal). Default false. */
  animate?: boolean;
  /** Delay before animation begins. Default 0ms. */
  delayMs?: number;
  /** Optional className for layout hooks. */
  className?: string;
}

/**
 * Cormorant italic typography primitive for vibe names and hero titles.
 *
 * When `animate` is true, renders a character-by-character type-in using the
 * ceremony choreography from design/tokens (45ms/char). This is the signature
 * Aura reveal behavior. When false, renders static.
 */
export default function VibeName({
  name,
  size = 'display',
  animate = false,
  delayMs = 0,
  className,
}: VibeNameProps) {
  if (!name) return null;

  const style = {
    ...(size === 'display' ? type.display : type.title),
    color: color.textPrimary,
    textAlign: 'center' as const,
  };

  if (!animate) {
    return (
      <h1 className={className} style={style}>
        {name}
      </h1>
    );
  }

  const chars = Array.from(name);
  const charMs = ceremony.phase3.vibeNameCharMs / 1000;
  const delayS = delayMs / 1000;

  return (
    <AnimatePresence mode="wait">
      <m.h1
        key={name}
        className={className}
        style={style}
        initial="hidden"
        animate="visible"
        variants={{
          hidden:  {},
          visible: {
            transition: {
              staggerChildren: charMs,
              delayChildren: delayS,
            },
          },
        }}
      >
        {chars.map((ch, i) => (
          <m.span
            key={`${ch}-${i}`}
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
            variants={{
              hidden:  { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: CINEMATIC },
            }}
          >
            {ch}
          </m.span>
        ))}
      </m.h1>
    </AnimatePresence>
  );
}
