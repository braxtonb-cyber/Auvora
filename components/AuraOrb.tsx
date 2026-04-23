'use client';

import { m } from 'framer-motion';
import { CINEMATIC } from '@/components/motion/springs';
import { color as tokenColor } from '@/design/tokens';

/**
 * AuraOrb — the signature animated visual.
 *
 * Upgraded to Framer Motion for spring-driven color transitions and
 * phase-based scale behavior. The orb is the through-line across
 * ceremony → reveal: it narrows while the app draws breath, breathes
 * through loading, and blooms into the palette on reveal.
 *
 * Backward compatibility: callers that pass `isActive` without `phase`
 * still get the original two-state behavior (isActive → bloomed colors).
 * Archive tile callers (`size="sm"`) render without the outer padding
 * wrapper, unchanged.
 */

export type OrbPhase = 'idle' | 'narrowing' | 'breathing' | 'bloomed';

interface AuraOrbProps {
  /** Aura palette hex values. Used when phase is "breathing" or "bloomed". */
  colors?: string[];
  /** Legacy prop — isActive=true maps to phase="bloomed" if phase is unset. */
  isActive?: boolean;
  /** Drives scale + color behavior. Default "idle". */
  phase?: OrbPhase;
  /** Size preset. Default "lg". */
  size?: 'lg' | 'sm';
}

export default function AuraOrb({
  colors = [],
  isActive = false,
  phase,
  size = 'lg',
}: AuraOrbProps) {
  // Resolve phase: explicit prop wins; else derive from legacy isActive.
  const resolved: OrbPhase = phase ?? (isActive ? 'bloomed' : 'idle');

  // Color selection — palette colors only when the phase has "settled".
  const useAura = resolved === 'breathing' || resolved === 'bloomed';
  const c1 = (useAura && colors[0]) ? colors[0] : tokenColor.gold;
  const c2 = (useAura && colors[1]) ? colors[1] : '#8c6b48';

  // Geometry
  const isCompact = size === 'sm';
  const dim  = isCompact ? 52 : 120;
  const i1   = isCompact ? 2  : 4;
  const i2   = isCompact ? 6  : 14;
  const i3   = isCompact ? 12 : 26;
  const dot  = isCompact ? 3  : 5;
  const halo = isCompact ? 72 : 170;

  // Phase-driven scale for the whole orb
  const phaseScale =
    resolved === 'narrowing' ? 0.35 :
    resolved === 'breathing' ? 1 :   // handled by breath loop below
    1;

  // Breath loop (scale only applies when phase is breathing/bloomed)
  const breathAnimate =
    resolved === 'breathing'
      ? { scale: [0.92, 1.04, 0.92] }
      : resolved === 'bloomed'
        ? { scale: [0.98, 1.02, 0.98] }
        : { scale: phaseScale };

  const breathTransition =
    resolved === 'breathing'
      ? { duration: 1.6, ease: [0.42, 0, 0.58, 1] as [number, number, number, number], repeat: Infinity }
      : resolved === 'bloomed'
        ? { duration: 3.2, ease: [0.42, 0, 0.58, 1] as [number, number, number, number], repeat: Infinity }
        : CINEMATIC;

  const orb = (
    <m.div
      style={{ position: 'relative', width: dim, height: dim, flexShrink: 0 }}
      animate={breathAnimate}
      transition={breathTransition}
    >
      {/* Outer ring — slow 14s rotation, border tint tracks palette */}
      <m.div
        style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid' }}
        animate={{ rotate: 360, borderColor: `${c1}22` }}
        transition={{
          rotate: { duration: 14, ease: 'linear', repeat: Infinity },
          borderColor: CINEMATIC,
        }}
      />

      {/* Spinning arc — 2.6s */}
      <m.div
        style={{
          position: 'absolute', inset: i1, borderRadius: '50%',
          borderStyle: 'solid',
          borderWidth: isCompact ? 1 : 1.5,
          borderColor: 'transparent',
        }}
        animate={{
          rotate: 360,
          borderTopColor: c1,
          borderRightColor: `${c1}55`,
        }}
        transition={{
          rotate: { duration: 2.6, ease: 'linear', repeat: Infinity },
          borderTopColor: CINEMATIC,
          borderRightColor: CINEMATIC,
        }}
      />

      {/* Counter arc — 3.8s reverse */}
      <m.div
        style={{
          position: 'absolute', inset: i2, borderRadius: '50%',
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: 'transparent',
        }}
        animate={{
          rotate: -360,
          borderBottomColor: c2,
          borderLeftColor: `${c2}44`,
        }}
        transition={{
          rotate: { duration: 3.8, ease: 'linear', repeat: Infinity },
          borderBottomColor: CINEMATIC,
          borderLeftColor: CINEMATIC,
        }}
      />

      {/* Inner glow — breath-synced opacity pulse */}
      <m.div
        style={{
          position: 'absolute', inset: i3, borderRadius: '50%',
          background: `radial-gradient(circle, ${c1}55 0%, ${c2}22 55%, transparent 100%)`,
        }}
        animate={{ opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 2.8, ease: [0.42, 0, 0.58, 1], repeat: Infinity }}
      />

      {/* Center dot — color transitions on palette change */}
      <m.div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          translateX: '-50%', translateY: '-50%',
          width: dot, height: dot, borderRadius: '50%',
        }}
        animate={{
          backgroundColor: c1,
          boxShadow: `0 0 ${isCompact ? 6 : 10}px ${c1}cc`,
        }}
        transition={{ backgroundColor: CINEMATIC, boxShadow: CINEMATIC }}
      />

      {/* Ambient halo — pulses in sync with inner glow */}
      <m.div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          translateX: '-50%', translateY: '-50%',
          width: halo, height: halo, borderRadius: '50%',
          background: `radial-gradient(circle, ${c1}0d 0%, transparent 68%)`,
          pointerEvents: 'none',
        }}
        animate={{ opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 2.8, ease: [0.42, 0, 0.58, 1], repeat: Infinity }}
      />
    </m.div>
  );

  if (isCompact) return orb;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '32px 0' }}>
      {orb}
    </div>
  );
}
