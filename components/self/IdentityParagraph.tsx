'use client';

import { m } from 'framer-motion';
import { color, type } from '@/design/tokens';
import { SOFT } from '@/components/motion/springs';

interface IdentityParagraphProps {
  /** The composed paragraph — when null, the resting fallback is shown. */
  text: string | null;
  /** Softer single-line accent above the paragraph. Optional. */
  eyebrow?: string;
  /** Accent color for a thin left rule. Defaults to gold dim. */
  accent?: string;
  /** Reveal delay (ms) if rendered inside a stagger parent. Default 0. */
  delayMs?: number;
}

/**
 * Cormorant-italic identity paragraph primitive.
 *
 * The paragraph is the "voice" of the Self section — the one line that speaks
 * back to the user in their own cadence. It owes its existence to the old
 * ProfileTab but now stands on its own so the Self portrait can lead with it
 * instead of burying it beneath account-page chrome.
 */
export default function IdentityParagraph({
  text,
  eyebrow,
  accent = color.goldDim,
  delayMs = 0,
}: IdentityParagraphProps) {
  const hasText = Boolean(text);

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SOFT, delay: delayMs / 1000 }}
      style={{
        position: 'relative',
        paddingLeft: 18,
      }}
    >
      {/* Thin vertical rule — gives the paragraph a breath and a scene boundary */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: 0,
          bottom: 4,
          width: 1,
          background: `linear-gradient(to bottom, transparent, ${accent} 28%, ${accent} 72%, transparent)`,
        }}
      />

      {eyebrow && (
        <p
          style={{
            ...type.label,
            color: color.gold,
            opacity: 0.7,
            marginBottom: 10,
          }}
        >
          {eyebrow}
        </p>
      )}

      {hasText ? (
        <p
          style={{
            ...type.subhead,
            fontSize: '1.125rem',
            color: color.textBody,
            lineHeight: 1.7,
            letterSpacing: '0.005em',
            margin: 0,
          }}
        >
          {text}
        </p>
      ) : (
        <p
          style={{
            ...type.subhead,
            color: color.textSecondary,
            opacity: 0.75,
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          Your portrait is still gathering. A few more auras and the register
          begins to set.
        </p>
      )}
    </m.div>
  );
}
