'use client';

import { Drawer } from 'vaul';
import AuraRevealScene from '@/components/aura/AuraRevealScene';
import { color, type, space } from '@/design/tokens';
import type { AuraEntryRow } from '@/lib/types/aura';

interface AuraMomentReplayProps {
  /** When set, the drawer opens and replays this entry. null closes it. */
  entry: AuraEntryRow | null;
  onClose: () => void;
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day:   'numeric',
    year:  'numeric',
  });
}

/**
 * Bottom drawer that replays a past aura in compressed form.
 *
 * Uses Vaul (already installed) for the sheet physics — drag-to-close,
 * snap points, body scroll lock. Inside, AuraRevealScene renders in
 * `mode="replay"`: no refine UI, tighter pacing, smaller palette band,
 * still composed cinematically.
 *
 * This is the Self section's tap-through into a moment. It is NOT a
 * re-performance of the ceremony — it is a leafing-through.
 */
export default function AuraMomentReplay({ entry, onClose }: AuraMomentReplayProps) {
  const open = entry !== null;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(o) => { if (!o) onClose(); }}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 200,
          }}
        />
        <Drawer.Content
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: '92vh',
            background: color.surfaceBase,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            zIndex: 201,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
            outline: 'none',
          }}
        >
          <Drawer.Title style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
            Replay aura
          </Drawer.Title>

          {/* Handle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 12,
              paddingBottom: 8,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 44,
                height: 4,
                borderRadius: 999,
                background: color.borderInteractive,
              }}
            />
          </div>

          {/* Eyebrow */}
          {entry && (
            <div
              style={{
                padding: `${space.sm}px ${space.xl}px ${space.md}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  ...type.label,
                  color: color.gold,
                  opacity: 0.72,
                }}
              >
                ○ Moment
              </span>
              <span
                style={{
                  ...type.caption,
                  color: color.textSecondary,
                  opacity: 0.65,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {formatFullDate(entry.created_at)}
              </span>
            </div>
          )}

          {/* Body — scrollable */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
              padding: `0 ${space.xl}px`,
            }}
          >
            {entry && (
              <AuraRevealScene
                aura={entry.output_json}
                mode="replay"
              />
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
