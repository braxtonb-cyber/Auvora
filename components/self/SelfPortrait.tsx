'use client';

import { m } from 'framer-motion';
import { color, type, space } from '@/design/tokens';
import { sectionEnter, sectionStagger } from '@/components/motion/vectors';
import IdentityParagraph from '@/components/self/IdentityParagraph';
import type { SelfPortrait as SelfPortraitData } from '@/lib/types/self';
import type { SectionAtmosphere } from '@/lib/self/useSectionAtmosphere';

interface SelfPortraitProps {
  portrait: SelfPortraitData;
  identityParagraph: string | null;
  atmosphere: SectionAtmosphere;
}

/**
 * The Self portrait — the composed identity hero.
 *
 * Composition (centripetal; see design/tokens sectionVector.self):
 *   • Header tag  — ○ Self · epithet of the hour
 *   • Title       — "Your AUVORA identity"
 *   • Paragraph   — IdentityParagraph (Cormorant italic, with rule)
 *   • Satellites  — signature words, arranged as converging chips
 *   • Register    — style · sonic · scent trinity (not cards — editorial rows)
 *   • Palette     — dominant colors as a slow horizontal field
 *   • Insight     — pattern line, full-width pullquote
 *
 * Archive and timeline live below this composition in SelfTab.
 */
export default function SelfPortrait({
  portrait,
  identityParagraph,
  atmosphere,
}: SelfPortraitProps) {
  const hasSignature = portrait.signatureWords.length > 0;
  const hasColors = portrait.dominantColors.length > 0;
  const hasRegister =
    Boolean(portrait.styleRegister) ||
    Boolean(portrait.sonicRegister) ||
    Boolean(portrait.scentSignature);
  const hasInsight = Boolean(portrait.patternInsight);

  return (
    <m.section
      initial="hidden"
      animate="visible"
      variants={sectionStagger('self')}
      style={{
        paddingTop: 56,
        paddingBottom: space['4xl'],
        display: 'flex',
        flexDirection: 'column',
        gap: space['3xl'],
      }}
    >
      {/* ── Eyebrow: section tag + atmospheric epithet ─────────────────────── */}
      <m.header
        variants={sectionEnter('self', 0)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: space.md,
        }}
      >
        <div
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
              opacity: 0.72,
            }}
          >
            ○ Self
          </span>
          <span
            style={{
              ...type.caption,
              color: color.textSecondary,
              opacity: 0.6,
              fontStyle: 'italic',
              fontFamily: type.subhead.fontFamily,
              letterSpacing: 'normal',
              textTransform: 'none',
            }}
          >
            {atmosphere.epithet}
          </span>
        </div>

        <h1
          style={{
            ...type.display,
            fontSize: 'clamp(34px, 9vw, 52px)',
            color: color.textPrimary,
            letterSpacing: '0.005em',
            margin: 0,
          }}
        >
          Your AUVORA identity
        </h1>
      </m.header>

      {/* ── Identity paragraph ─────────────────────────────────────────────── */}
      <m.div variants={sectionEnter('self', 1)}>
        <IdentityParagraph
          text={identityParagraph}
          accent={atmosphere.accent}
        />
      </m.div>

      {/* ── Signature words — satellites ───────────────────────────────────── */}
      {hasSignature && (
        <m.div variants={sectionEnter('self', 2)}>
          <p
            style={{
              ...type.label,
              color: color.textSecondary,
              opacity: 0.65,
              marginBottom: space.md,
            }}
          >
            Signature
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: space.sm,
            }}
          >
            {portrait.signatureWords.map((word, i) => (
              <m.span
                key={word}
                variants={sectionEnter('self', i + 1)}
                style={{
                  ...type.subhead,
                  fontSize: '0.95rem',
                  color: color.textBody,
                  padding: `${space.xs + 2}px ${space.md + 2}px`,
                  borderRadius: 999,
                  border: `0.5px solid ${atmosphere.accent}`,
                  background: color.goldSubtle,
                  letterSpacing: '0.01em',
                }}
              >
                {word}
              </m.span>
            ))}
          </div>
        </m.div>
      )}

      {/* ── Register trinity: style · sonic · scent ────────────────────────── */}
      {hasRegister && (
        <m.div variants={sectionEnter('self', 3)}>
          <p
            style={{
              ...type.label,
              color: color.textSecondary,
              opacity: 0.65,
              marginBottom: space.lg,
            }}
          >
            Register
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderTop: `0.5px solid ${color.borderSubtle}`,
            }}
          >
            {[
              { label: 'Style', value: portrait.styleRegister },
              { label: 'Sonic', value: portrait.sonicRegister },
              { label: 'Scent', value: portrait.scentSignature },
            ].map(({ label, value }, i) => (
              <m.div
                key={label}
                variants={sectionEnter('self', i + 2)}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: space.lg,
                  padding: `${space.lg}px 0`,
                  borderBottom: `0.5px solid ${color.borderSubtle}`,
                }}
              >
                <span
                  style={{
                    ...type.label,
                    color: color.gold,
                    opacity: 0.65,
                    flexShrink: 0,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    ...type.subhead,
                    fontSize: '1rem',
                    color: value ? color.textPrimary : color.textDisabled,
                    textAlign: 'right',
                    letterSpacing: '0.005em',
                  }}
                >
                  {value ?? '—'}
                </span>
              </m.div>
            ))}
          </div>
        </m.div>
      )}

      {/* ── Color language — slow horizontal field ─────────────────────────── */}
      {hasColors && (
        <m.div variants={sectionEnter('self', 4)}>
          <p
            style={{
              ...type.label,
              color: color.textSecondary,
              opacity: 0.65,
              marginBottom: space.md,
            }}
          >
            Color language
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(portrait.dominantColors.length, 8)}, 1fr)`,
              gap: 0,
              borderRadius: 16,
              overflow: 'hidden',
              border: `0.5px solid ${color.borderSubtle}`,
              height: 72,
            }}
          >
            {portrait.dominantColors.slice(0, 8).map((hex, i) => (
              <div
                key={`${hex}-${i}`}
                title={hex.toUpperCase()}
                style={{
                  background: hex,
                  position: 'relative',
                }}
              />
            ))}
          </div>
        </m.div>
      )}

      {/* ── Pattern insight — italic pullquote ─────────────────────────────── */}
      {hasInsight && (
        <m.figure
          variants={sectionEnter('self', 5)}
          style={{
            margin: 0,
            padding: `${space['2xl']}px ${space.xl}px`,
            borderRadius: 20,
            background: color.surfaceRaised,
            border: `0.5px solid ${color.borderSubtle}`,
          }}
        >
          <p
            style={{
              ...type.label,
              color: color.gold,
              opacity: 0.7,
              marginBottom: space.md,
            }}
          >
            Pattern
          </p>
          <blockquote
            style={{
              margin: 0,
              ...type.subhead,
              fontSize: '1.125rem',
              color: color.textPrimary,
              lineHeight: 1.6,
              letterSpacing: '0.005em',
            }}
          >
            {portrait.patternInsight}
          </blockquote>
        </m.figure>
      )}

      {/* ── Aura count, quiet footer inside portrait ───────────────────────── */}
      {portrait.totalAuras > 0 && (
        <m.div
          variants={sectionEnter('self', 6)}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingTop: space.lg,
            borderTop: `0.5px solid ${color.borderSubtle}`,
          }}
        >
          <span style={{ ...type.label, color: color.textSecondary, opacity: 0.6 }}>
            Recorded moments
          </span>
          <span
            style={{
              ...type.title,
              fontSize: '1.5rem',
              color: color.textPrimary,
              letterSpacing: '0.02em',
            }}
          >
            {portrait.totalAuras}
          </span>
        </m.div>
      )}
    </m.section>
  );
}
