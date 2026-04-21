'use client'

import { computeGapRadar } from '@/lib/scent/gap-radar'
import type { ScentProfile } from '@/lib/scent/types'

interface ScentGapRadarCardProps {
  profile: ScentProfile
}

const T = {
  card: '#0d0d0d',
  cardBorder: 'rgba(255,255,255,0.05)',
  textPrimary: '#f0ebe3',
  textBody: '#c8c2b8',
  textSub: '#8a8278',
  textMuted: '#4a4540',
  gold: '#c4a46b',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

export default function ScentGapRadarCard({ profile }: ScentGapRadarCardProps) {
  const radar = computeGapRadar(profile)

  return (
    <div
      style={{
        background: T.card,
        border: `0.5px solid ${T.cardBorder}`,
        borderRadius: 16,
        padding: '16px 18px',
        marginBottom: 14,
      }}
    >
      <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.gold, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>
        Gap Radar
      </p>
      <h3 style={{ fontFamily: T.fontC, fontWeight: 300, fontSize: 25, color: T.textPrimary, marginBottom: 8 }}>
        Coverage, not clutter.
      </h3>
      <p style={{ fontFamily: T.fontM, fontSize: 11, color: T.textSub, lineHeight: 1.7, letterSpacing: '0.03em', marginBottom: 12 }}>
        {radar.summary}
      </p>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
          Blind spots
        </p>
        {radar.blindSpots.map((spot) => (
          <p key={spot} style={{ fontFamily: T.fontM, fontSize: 10, color: T.textBody, lineHeight: 1.55, letterSpacing: '0.03em' }}>
            {spot}
          </p>
        ))}
      </div>

      {radar.undercoveredOccasions.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
            Undercovered occasions
          </p>
          {radar.undercoveredOccasions.map((occasion) => (
            <p key={occasion} style={{ fontFamily: T.fontM, fontSize: 10, color: T.textBody, lineHeight: 1.55, letterSpacing: '0.03em' }}>
              {occasion}
            </p>
          ))}
        </div>
      )}

      {radar.familyImbalance.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
            Family imbalance
          </p>
          {radar.familyImbalance.map((line) => (
            <p key={line} style={{ fontFamily: T.fontM, fontSize: 10, color: T.textBody, lineHeight: 1.55, letterSpacing: '0.03em' }}>
              {line}
            </p>
          ))}
        </div>
      )}

      <div style={{ paddingTop: 10, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
          Next direction
        </p>
        <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textSub, lineHeight: 1.6, letterSpacing: '0.03em' }}>
          {radar.nextDirection}
        </p>
      </div>
    </div>
  )
}
