'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';
import { color, type } from '@/design/tokens';
import { SOFT } from '@/components/motion/springs';

interface InlineChapterProps {
  /** Short uppercased mono label, e.g. "Outfit direction" or "Scent pairing". */
  label: string;
  /** Chapter title in Cormorant. */
  title: string;
  /** Body content — can be a string or JSX. Serif italic when string. */
  children?: ReactNode;
  /** Accent — when true, label uses gold instead of muted mono. Default false. */
  accent?: boolean;
  /** Enter-stagger index (for stagger parents). Default 0. */
  index?: number;
  /** Optional className. */
  className?: string;
}

/**
 * Typography-led chapter block. No card wrapper, no border.
 *
 * Replaces `AuraCard` in Aura result flows and Style/Sound detail chapters.
 * Reads as editorial copy, not as a dashboard tile.
 *
 * Used in:
 *   • Aura result — outfit direction / scent pairing / sonic mood chapters
 *   • Fragrance detail — top / heart / base movements
 *   • Sound result — tracks rendered as lyrical chapters (one-per-track)
 */
export default function InlineChapter({
  label,
  title,
  children,
  accent = false,
  index = 0,
  className,
}: InlineChapterProps) {
  return (
    <m.section
      className={className}
      variants={{
        hidden:  { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: SOFT },
      }}
      custom={index}
      style={{
        paddingTop: 20,
        paddingBottom: 20,
        borderTop: `0.5px solid ${color.borderSubtle}`,
      }}
    >
      <p
        style={{
          ...type.label,
          color: accent ? color.gold : color.textSecondary,
          opacity: accent ? 0.75 : 0.7,
          marginBottom: 10,
        }}
      >
        {label}
      </p>
      <h3
        style={{
          ...type.title,
          color: color.textPrimary,
          marginBottom: children ? 10 : 0,
        }}
      >
        {title}
      </h3>
      {children && (
        <div
          style={{
            ...type.subhead,
            color: color.textBody,
          }}
        >
          {children}
        </div>
      )}
    </m.section>
  );
}
