'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import PaletteBand from '@/components/primitives/PaletteBand';
import VibeName from '@/components/primitives/VibeName';
import InlineChapter from '@/components/primitives/InlineChapter';
import { color, type, space, ceremony as ceremonyTokens } from '@/design/tokens';
import { SOFT, FIRM } from '@/components/motion/springs';
import type { AuraOutput } from '@/lib/types/aura';

interface AuraRevealSceneProps {
  /** The generated aura to reveal. */
  aura: AuraOutput;
  /** Called when user submits a refinement. Parent runs the regeneration. */
  onRefine?: (refinement: string) => void;
  /**
   * "reveal" (default) plays the full ceremony with character-staggered
   * vibe name, palette unfurl, and inline refine affordance.
   *
   * "replay" strips the ceremony for Self timeline tap-throughs: palette is
   * static, vibe name is static, delays collapse, caption-copy stays, refine
   * is hidden. The scene still composes cinematically — it simply does not
   * re-perform the reveal.
   */
  mode?: 'reveal' | 'replay';
}

/**
 * The reveal composition — the cinematic payoff after the ceremony.
 *
 * Layout (top to bottom):
 *   • PaletteBand — horizontal gradient field, unfurls left-to-right
 *   • VibeName — display italic Cormorant, character-stagger type-in
 *   • Caption — subhead italic muted, centered, single line
 *   • 3 InlineChapters — outfit direction / scent pairing / sonic mood
 *   • Rationale (collapsed) — "why this aura" with expansion
 *   • Bottom affordances — copy caption + extend this moment (inline refine)
 *
 * The orb is NOT rendered here — it persists in the parent hero zone and
 * transitions to palette colors via AuraOrb's `phase="bloomed"`. This is
 * intentional: the orb is the through-line across ceremony → reveal, not
 * a decoration inside the reveal.
 */
export default function AuraRevealScene({ aura, onRefine, mode = 'reveal' }: AuraRevealSceneProps) {
  const [rationaleOpen, setRationaleOpen] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [refinement, setRefinement] = useState('');
  const [copied, setCopied] = useState(false);

  const isReplay = mode === 'replay';

  const paletteHex = aura.palette.map((p) => p.hex);

  // Chapters — the three subordinate movements of the portrait.
  const chapters = [
    {
      label: 'Outfit direction',
      title: aura.outfit?.title ?? '',
      body:  aura.outfit?.description ?? '',
    },
    {
      label: 'Scent pairing',
      title: aura.fragrance?.title ?? '',
      body:  aura.fragrance?.notes ?? '',
    },
    {
      label: 'Sonic mood',
      title: aura.playlist?.title ?? '',
      // Render tracks as a lyrical line, not a bullet list. First 3 tracks
      // joined with an en-dash separator, Cormorant italic.
      body:  (aura.playlist?.tracks ?? []).slice(0, 3).join(' — '),
    },
  ];

  const rationaleRows = aura.rationale
    ? [
        { label: 'Signal read',   text: aura.rationale.signal    },
        { label: 'Outfit logic',  text: aura.rationale.outfit    },
        { label: 'Scent logic',   text: aura.rationale.fragrance },
        { label: 'Playlist arc',  text: aura.rationale.playlist  },
      ]
    : [];

  // Copy caption — retained as a small mono link at the bottom, no icon.
  async function handleCopy() {
    if (!aura.caption) return;
    try {
      await navigator.clipboard.writeText(aura.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silent
    }
  }

  function handleRefineSubmit() {
    const trimmed = refinement.trim();
    if (!trimmed || !onRefine) return;
    onRefine(trimmed);
    setRefinement('');
    setRefineOpen(false);
  }

  // Chapter stagger timings from ceremony tokens (120ms between chapters).
  // In replay mode the pacing tightens so tapping through the archive feels
  // like leafing through a book, not rewatching a film.
  const chapterStaggerMs = isReplay ? 60 : ceremonyTokens.phase4.chapterStaggerMs;
  const chapterBaseDelayMs = isReplay ? 120 : 1300; // after vibeName settles
  const captionDelayMs = isReplay ? 180 : 1100;
  const rationaleDelayMs = isReplay ? 260 : 1900;
  const affordanceDelayMs = isReplay ? 320 : 2200;

  return (
    <div style={{ marginTop: isReplay ? 0 : space['2xl'] }}>
      {/* ─── Palette band — hero field (lean in replay) ────────────────── */}
      <PaletteBand
        colors={paletteHex}
        height={isReplay ? 54 : 96}
        bleed={!isReplay}
        animate={!isReplay}
        delayMs={isReplay ? 0 : 100}
      />

      {/* ─── Vibe name ─────────────────────────────────────────────────── */}
      <div style={{
        marginTop: isReplay ? space.xl : space['2xl'],
        marginBottom: isReplay ? space.sm : space.lg,
      }}>
        <VibeName
          name={aura.vibeName}
          size={isReplay ? 'title' : 'display'}
          animate={!isReplay}
          delayMs={isReplay ? 0 : 400}
        />
      </div>

      {/* ─── Caption ───────────────────────────────────────────────────── */}
      {aura.caption && (
        <m.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SOFT, delay: captionDelayMs / 1000 }}
          style={{
            ...type.subhead,
            color: color.textSecondary,
            textAlign: 'center',
            maxWidth: '28ch',
            margin: '0 auto',
          }}
        >
          {aura.caption}
        </m.p>
      )}

      {/* ─── Chapters ──────────────────────────────────────────────────── */}
      <m.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden:  {},
          visible: {
            transition: {
              staggerChildren: chapterStaggerMs / 1000,
              delayChildren: chapterBaseDelayMs / 1000,
            },
          },
        }}
        style={{ marginTop: isReplay ? space['2xl'] : space['4xl'] }}
      >
        {chapters.map((ch, i) => (
          ch.title || ch.body
            ? (
              <InlineChapter
                key={ch.label}
                label={ch.label}
                title={ch.title}
                index={i}
              >
                {ch.body}
              </InlineChapter>
            )
            : null
        ))}
      </m.div>

      {/* ─── Rationale — collapsible ──────────────────────────────────── */}
      {aura.rationale && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...SOFT, delay: rationaleDelayMs / 1000 }}
          style={{ marginTop: space['3xl'] }}
        >
          <button
            onClick={() => setRationaleOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: `${space.md}px 0`,
              background: 'none',
              border: 'none',
              borderTop: `0.5px solid ${color.borderSubtle}`,
              cursor: 'pointer',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-expanded={rationaleOpen}
          >
            <span
              style={{
                ...type.label,
                color: color.gold,
                opacity: 0.75,
              }}
            >
              Why this aura
            </span>
            <m.span
              animate={{ rotate: rationaleOpen ? 180 : 0 }}
              transition={FIRM}
              style={{
                ...type.caption,
                color: color.textSecondary,
                display: 'inline-block',
              }}
            >
              ↓
            </m.span>
          </button>

          <AnimatePresence initial={false}>
            {rationaleOpen && (
              <m.div
                key="rationale-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.3, ease: 'linear' },
                }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: space['xl'],
                    paddingTop: space.md,
                    paddingBottom: space.sm,
                  }}
                >
                  {rationaleRows.map(({ label, text }) => (
                    <div key={label}>
                      <p
                        style={{
                          ...type.label,
                          color: color.gold,
                          opacity: 0.6,
                          marginBottom: space.xs + 2,
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          ...type.subhead,
                          color: color.textBody,
                        }}
                      >
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      )}

      {/* ─── Bottom affordances: copy + refine ────────────────────────── */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SOFT, delay: affordanceDelayMs / 1000 }}
        style={{
          marginTop: isReplay ? space['3xl'] : space['5xl'],
          paddingBottom: isReplay ? space.xl : space['4xl'],
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: space.xl,
        }}
      >
        {/* Copy caption — subtle mono link */}
        {aura.caption && (
          <button
            onClick={handleCopy}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: `${space.sm}px ${space.md}px`,
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              ...type.caption,
              color: copied ? color.gold : color.textSecondary,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              transition: 'color 0.2s ease',
            }}
          >
            {copied ? 'copied' : 'copy caption'}
          </button>
        )}

        {/* Extend this moment — expands into inline refine textarea */}
        {!isReplay && (
        <AnimatePresence mode="wait">
          {!refineOpen ? (
            <m.button
              key="refine-trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setRefineOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: `${space.md}px ${space.lg}px`,
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                ...type.caption,
                color: color.textSecondary,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: space.sm,
              }}
            >
              extend this moment
              <span style={{ opacity: 0.6 }}>→</span>
            </m.button>
          ) : (
            <m.div
              key="refine-open"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={SOFT}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: space.md,
              }}
            >
              <textarea
                value={refinement}
                onChange={(e) => setRefinement(e.target.value)}
                placeholder="what's shifted?"
                rows={2}
                autoFocus
                style={{
                  width: '100%',
                  resize: 'none',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `0.5px solid ${color.borderInteractive}`,
                  padding: `${space.md}px 0`,
                  ...type.subhead,
                  color: color.textPrimary,
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <button
                  onClick={() => { setRefineOpen(false); setRefinement(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: `${space.xs}px ${space.sm}px`,
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    ...type.caption,
                    color: color.textDisabled,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                  }}
                >
                  cancel
                </button>
                <button
                  onClick={handleRefineSubmit}
                  disabled={!refinement.trim()}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: refinement.trim() ? 'pointer' : 'default',
                    padding: `${space.xs}px ${space.sm}px`,
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    ...type.caption,
                    color: refinement.trim() ? color.gold : color.textDisabled,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                  }}
                >
                  read again →
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
        )}
      </m.div>
    </div>
  );
}
