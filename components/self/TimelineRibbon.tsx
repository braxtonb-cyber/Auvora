'use client';

import { m } from 'framer-motion';
import AuraOrb from '@/components/AuraOrb';
import { color, type, space } from '@/design/tokens';
import { SOFT } from '@/components/motion/springs';
import type { AuraEntryRow } from '@/lib/types/aura';
import type { SectionAtmosphere } from '@/lib/self/useSectionAtmosphere';

interface TimelineRibbonProps {
  entries: AuraEntryRow[];
  atmosphere: SectionAtmosphere;
  onSelect: (entry: AuraEntryRow) => void;
  /** Loading skeleton count. Default 3. */
  skeletonCount?: number;
  loading?: boolean;
}

function timeAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7)  return `${d}d`;
  if (d < 30) return `${Math.floor(d / 7)}w`;
  return `${Math.floor(d / 30)}mo`;
}

/**
 * Horizontal aura ribbon — the archival timeline.
 *
 * Design:
 *   • One rail across the full width, scrolls horizontally
 *   • Each tile is a compact orb + italic vibe name + mono timestamp
 *   • Reverse-chronological from left (newest first)
 *   • Tap a tile → parent opens AuraMomentReplay
 *
 * This is the ONLY archive surface in the app after Step 4. The Aura portal
 * no longer carries an inline archive, and the legacy Profile archive card
 * is retired with the tab rename.
 */
export default function TimelineRibbon({
  entries,
  atmosphere,
  onSelect,
  skeletonCount = 3,
  loading = false,
}: TimelineRibbonProps) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: space.lg,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
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
          ○ Timeline
        </span>
        <span
          style={{
            ...type.caption,
            color: color.textSecondary,
            opacity: 0.55,
          }}
        >
          {entries.length > 0 ? `${entries.length} recorded` : ''}
        </span>
      </div>

      {/* Rail */}
      <div
        style={{
          position: 'relative',
          marginLeft: -16,
          marginRight: -16,
          padding: `${space.sm}px 16px ${space.xl}px`,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          background: `linear-gradient(to bottom, transparent 0%, ${atmosphere.accent.replace(/[\d.]+\)$/, '0.05)')} 45%, transparent 100%)`,
          borderTop: `0.5px solid ${color.borderSubtle}`,
          borderBottom: `0.5px solid ${color.borderSubtle}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: space.xl,
            minWidth: 'min-content',
          }}
        >
          {loading && Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              style={{
                width: 120,
                height: 120,
                borderRadius: 20,
                background: 'linear-gradient(90deg, #111 0%, #1a1916 50%, #111 100%)',
                backgroundSize: '400px 100%',
                animation: `au-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`,
              }}
            />
          ))}

          {!loading && entries.length === 0 && (
            <p
              style={{
                ...type.subhead,
                color: color.textDisabled,
                padding: `${space.xl}px ${space.md}px`,
              }}
            >
              Your recorded moments will appear here.
            </p>
          )}

          {!loading && entries.map((entry, i) => {
            const output = entry.output_json;
            const palette = (output?.palette ?? []).map((p) => p.hex);
            const clean = entry.vibe_input.replace(/\[context:.*?\]/gi, '').trim();

            return (
              <m.button
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SOFT, delay: Math.min(i, 8) * 0.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(entry)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: space.sm,
                  padding: `${space.md}px ${space.md}px ${space.md}px ${space.md}px`,
                  borderRadius: 18,
                  background: color.surfaceBase,
                  border: `0.5px solid ${color.borderSubtle}`,
                  cursor: 'pointer',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  width: 168,
                  flexShrink: 0,
                  textAlign: 'left',
                }}
              >
                <div style={{ transform: 'translateX(-6px)' }}>
                  <AuraOrb size="sm" colors={palette} isActive />
                </div>

                <p
                  style={{
                    ...type.subhead,
                    fontSize: '0.95rem',
                    color: color.textPrimary,
                    margin: 0,
                    letterSpacing: '0.005em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                  }}
                >
                  {output?.vibeName || 'Untitled'}
                </p>

                <p
                  style={{
                    ...type.caption,
                    color: color.textSecondary,
                    opacity: 0.7,
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                  }}
                >
                  {clean || '—'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginTop: 2,
                  }}
                >
                  <div style={{ display: 'flex', gap: 3 }}>
                    {palette.slice(0, 4).map((hex, idx) => (
                      <span
                        key={idx}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: hex,
                          border: '0.5px solid rgba(255,255,255,0.08)',
                        }}
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      ...type.caption,
                      color: color.textDisabled,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {timeAgo(entry.created_at)}
                  </span>
                </div>
              </m.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
