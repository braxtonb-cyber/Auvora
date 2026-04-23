'use client';

import { useEffect, useMemo, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { color, type, ceremony as ceremonyTokens } from '@/design/tokens';
import { ease } from '@/design/tokens';

interface OracleStreamProps {
  /** Phrase pool to cycle through. First phrase is rendered immediately. */
  phrases: readonly string[];
  /** When false, holds the current phrase without advancing. Default true. */
  active?: boolean;
  /** Milliseconds per character for the type-in stagger. */
  charMs?: number;
  /** Milliseconds to hold a fully-typed phrase before crossfading out. */
  dwellMs?: number;
  /** Crossfade duration between phrases. */
  crossfadeMs?: number;
  /** Optional className for layout hooks. */
  className?: string;
}

/**
 * Character-staggered typing sequencer for the GenerateCeremony.
 *
 * Each phrase types in character-by-character using Framer Motion variants
 * (no setInterval char-poking — the animation stops cleanly on unmount).
 * Phrases are advanced on a timer tuned to the actual typed length + dwell
 * window, so long phrases get proportionally more air.
 *
 * This is a *reader's* voice, not a progress bar. It does not know about
 * loading percentages, and should never pretend to.
 */
export default function OracleStream({
  phrases,
  active = true,
  charMs = ceremonyTokens.phase1.oraclePhraseCharMs,
  dwellMs = ceremonyTokens.phase2.phraseDwellMs,
  crossfadeMs = ceremonyTokens.phase2.phraseCrossfadeMs,
  className,
}: OracleStreamProps) {
  const [index, setIndex] = useState(0);

  const current = phrases[index % phrases.length] ?? '';
  const chars = useMemo(() => Array.from(current), [current]);

  // Compute dwell for this phrase: type-in time + static dwell window
  const phraseTotalMs = chars.length * charMs + dwellMs;

  useEffect(() => {
    if (!active) return;
    if (phrases.length <= 1) return;

    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, phraseTotalMs);

    return () => clearTimeout(id);
  }, [active, phraseTotalMs, phrases.length, index]);

  const containerStyle: React.CSSProperties = {
    ...type.subhead,
    color: color.textSecondary,
    textAlign: 'center',
    lineHeight: 1.55,
    maxWidth: '26ch',
    margin: '0 auto',
    minHeight: '3.2em',
  };

  return (
    <div className={className} style={containerStyle}>
      <AnimatePresence mode="wait">
        <m.p
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: crossfadeMs / 1000, ease: 'linear' }}
          style={{ display: 'inline-block' }}
        >
          <m.span
            initial="hidden"
            animate="visible"
            variants={{
              hidden:  {},
              visible: {
                transition: {
                  staggerChildren: charMs / 1000,
                  delayChildren: crossfadeMs / 2000,
                },
              },
            }}
            style={{ display: 'inline-block' }}
          >
            {chars.map((ch, i) => (
              <m.span
                key={`${index}-${i}`}
                variants={{
                  hidden:  { opacity: 0, y: 6 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.22,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
                style={{ display: 'inline-block', whiteSpace: 'pre' }}
                aria-hidden={ch === ' '}
              >
                {ch}
              </m.span>
            ))}
          </m.span>
        </m.p>
      </AnimatePresence>
    </div>
  );
}

/**
 * Re-export fallback easing for callers that want to match the stream's
 * timing curve without importing framer-motion directly.
 */
export const ORACLE_EASE = ease;
