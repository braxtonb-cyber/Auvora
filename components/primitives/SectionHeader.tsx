'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';
import { color, type, type SectionKey } from '@/design/tokens';
import { sectionEnter, sectionStagger } from '@/components/motion/vectors';

interface SectionHeaderProps {
  /** Which AUVORA section this header is for. Drives motion vector + glyph. */
  section: SectionKey;
  /** Large editorial title (Cormorant). */
  title: string;
  /** Optional muted sub-line (mono or serif italic). */
  subtitle?: ReactNode;
  /** Optional top-right action (e.g. "Edit" link). */
  trailing?: ReactNode;
  /** Show the small uppercased section tag ("◈ Style" etc). Default true. */
  showTag?: boolean;
  /** Optional className for layout hooks. */
  className?: string;
}

/**
 * Section-aware header.
 *
 * Each AUVORA section has its own visual register — this header is the one
 * place that register shows up textually. The glyph + label combination is
 * kept (it's AUVORA's vocabulary), but the header enters with the section's
 * motion vector so the air changes as you arrive.
 *
 * Sections use:
 *   aura  — ◈  radial bloom
 *   scent — ◉  vertical settle
 *   style — ◇  lateral-asymmetric
 *   sound — ♩  linear enter
 *   self  — ○  centripetal
 */

const GLYPH: Record<SectionKey, string> = {
  aura:  '◈',
  scent: '◉',
  style: '◇',
  sound: '♩',
  self:  '○',
};

const LABEL: Record<SectionKey, string> = {
  aura:  'Aura',
  scent: 'Scent',
  style: 'Style',
  sound: 'Sound',
  self:  'Self',
};

export default function SectionHeader({
  section,
  title,
  subtitle,
  trailing,
  showTag = true,
  className,
}: SectionHeaderProps) {
  return (
    <m.header
      className={className}
      initial="hidden"
      animate="visible"
      variants={sectionStagger(section)}
      style={{
        paddingTop: 52,
        paddingBottom: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {showTag && (
        <m.div
          variants={sectionEnter(section, 0)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              ...type.label,
              color: color.gold,
              opacity: 0.7,
            }}
          >
            {GLYPH[section]} {LABEL[section]}
          </span>
          {trailing}
        </m.div>
      )}

      <m.h1
        variants={sectionEnter(section, 1)}
        style={{
          ...type.title,
          color: color.textPrimary,
          lineHeight: 1.2,
        }}
      >
        {title}
      </m.h1>

      {subtitle && (
        <m.div
          variants={sectionEnter(section, 2)}
          style={{
            ...type.caption,
            color: color.textSecondary,
          }}
        >
          {subtitle}
        </m.div>
      )}
    </m.header>
  );
}
