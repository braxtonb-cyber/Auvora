/**
 * useSectionAtmosphere — time-aware palette modulation for Self surfaces.
 *
 * Returns a subtle atmosphere descriptor derived from the hour of day. Self
 * is the "slow cadence, quiet archival" section (see docs/design/section-
 * differentiation-matrix.md), so the hook expresses time of day through a
 * faint background tint and a signature ambient accent — never through
 * theme-level color changes.
 *
 * Consumers:
 *   • SelfTab background wash
 *   • TimelineRibbon rail tint
 *   • IdentityParagraph accent underline
 *
 * Output is stable across renders (updates only when the hour rolls over).
 */

'use client';

import { useEffect, useState } from 'react';

export type AtmospherePhase = 'dawn' | 'morning' | 'midday' | 'dusk' | 'night';

export interface SectionAtmosphere {
  phase: AtmospherePhase;
  /** Word the Self header uses underneath the title (e.g. "a quiet evening"). */
  epithet: string;
  /** Faint full-screen wash — apply as `background` on the tab body. */
  wash: string;
  /** Accent tint for underlines, subtle dividers. Respects gold heritage. */
  accent: string;
}

function phaseFromHour(h: number): AtmospherePhase {
  if (h >= 5  && h < 8)  return 'dawn';
  if (h >= 8  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'midday';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

function atmosphereForPhase(phase: AtmospherePhase): SectionAtmosphere {
  switch (phase) {
    case 'dawn':
      return {
        phase,
        epithet: 'a quiet dawn',
        wash:    'radial-gradient(120% 60% at 50% 0%, rgba(196,164,107,0.045) 0%, transparent 70%), #0B0A09',
        accent:  'rgba(196,164,107,0.32)',
      };
    case 'morning':
      return {
        phase,
        epithet: 'a clear morning',
        wash:    'radial-gradient(120% 60% at 50% 0%, rgba(208,180,130,0.035) 0%, transparent 70%), #0C0B0A',
        accent:  'rgba(208,180,130,0.28)',
      };
    case 'midday':
      return {
        phase,
        epithet: 'the middle of the day',
        wash:    'radial-gradient(120% 60% at 50% 0%, rgba(196,164,107,0.02) 0%, transparent 70%), #0E0C0B',
        accent:  'rgba(196,164,107,0.22)',
      };
    case 'dusk':
      return {
        phase,
        epithet: 'a slow dusk',
        wash:    'radial-gradient(120% 60% at 50% 0%, rgba(176,108,96,0.055) 0%, transparent 70%), #0C0A09',
        accent:  'rgba(200,130,110,0.3)',
      };
    case 'night':
    default:
      return {
        phase: 'night',
        epithet: 'a quiet evening',
        wash:    'radial-gradient(120% 60% at 50% 0%, rgba(96,100,132,0.04) 0%, transparent 70%), #09080A',
        accent:  'rgba(140,148,180,0.28)',
      };
  }
}

export function useSectionAtmosphere(): SectionAtmosphere {
  // Deterministic default so SSR + first paint match before the hour is known.
  const [phase, setPhase] = useState<AtmospherePhase>('midday');

  useEffect(() => {
    const tick = () => setPhase(phaseFromHour(new Date().getHours()));
    tick();
    // Check every 5 minutes — cheap, keeps the phase fresh without polling.
    const id = window.setInterval(tick, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  return atmosphereForPhase(phase);
}
