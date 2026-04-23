'use client';

import { useEffect, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import AuraOrb, { type OrbPhase } from '@/components/AuraOrb';
import OracleStream from '@/components/aura/OracleStream';
import { shufflePhrases } from '@/lib/aura/oracle-phrases';
import { CINEMATIC } from '@/components/motion/springs';
import { color, z, type } from '@/design/tokens';

interface GenerateCeremonyProps {
  /** When true, the ceremony is active. Toggle false on API return or cancel. */
  isOpen: boolean;
  /** Called when the user dismisses the ceremony (tap or pull-down gesture). */
  onCancel?: () => void;
}

/**
 * Full-screen ceremony overlay shown during aura generation.
 *
 * Replaces the 5-box skeleton shimmer. The orb is the progress indicator —
 * it narrows for 800ms while the first oracle phrase types in, then breathes
 * through the remainder of the API call. Phrases shuffle per ceremony so
 * repeat generations don't feel scripted.
 *
 * Dismiss gestures:
 *   • tap anywhere on the backdrop
 *   • pull the orb down past ~120px (or fling with velocity)
 *
 * The ceremony is intentionally not a modal — no close button, no spinner,
 * no progress bar. This is a signature moment; it earns its space.
 */
export default function GenerateCeremony({ isOpen, onCancel }: GenerateCeremonyProps) {
  // A fresh shuffle every time a ceremony opens — state + effect so the
  // phrase order reshuffles on each isOpen transition without React's
  // exhaustive-deps complaint about a "used-as-trigger" useMemo dep.
  const [phrases, setPhrases] = useState<string[]>(() => shufflePhrases());

  // Orb phase: narrow for the first 800ms, then breathe.
  const [orbPhase, setOrbPhase] = useState<OrbPhase>('narrowing');

  useEffect(() => {
    if (!isOpen) return;
    setPhrases(shufflePhrases());
    setOrbPhase('narrowing');
    const id = setTimeout(() => setOrbPhase('breathing'), 800);
    return () => clearTimeout(id);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="ceremony"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          aria-label="Reading your aura"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: z.ceremony,
            background: 'rgba(5, 4, 4, 0.96)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 48,
            padding: '12vh 32px',
            cursor: 'default',
          }}
        >
          {/* Orb — draggable down to dismiss, fades + scales on enter/exit */}
          <m.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.22}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) {
                onCancel?.();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.88, opacity: 0 }}
            transition={CINEMATIC}
            style={{
              cursor: 'grab',
              touchAction: 'pan-y',
            }}
            whileDrag={{ cursor: 'grabbing', scale: 0.96 }}
          >
            <AuraOrb size="lg" phase={orbPhase} />
          </m.div>

          {/* Oracle phrases — typing stream */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'linear', delay: 0.4 }}
            style={{ width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <OracleStream phrases={phrases} active={isOpen} />
          </m.div>

          {/* Subtle hint — shown only if a cancel handler is wired. Appears
             after 3s of ceremony so it doesn't crowd the initial moment. */}
          {onCancel && (
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.28 }}
              transition={{ duration: 0.8, ease: 'linear', delay: 3.2 }}
              style={{
                ...type.caption,
                color: color.textSecondary,
                textAlign: 'center',
                position: 'absolute',
                bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
                left: 0,
                right: 0,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              pull to dismiss
            </m.p>
          )}
        </m.div>
      )}
    </AnimatePresence>
  );
}
