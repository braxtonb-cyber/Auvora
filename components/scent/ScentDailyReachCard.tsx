'use client'

import { computeDailyReach } from '@/lib/scent/daily-reach'
import type { ScentProfile } from '@/lib/scent/types'
import ScentEmptyState from '@/components/scent/ScentEmptyState'

interface ScentDailyReachCardProps {
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

function labelFor(profile: ScentProfile, itemId: string): string {
  const item = profile.wardrobe.find((entry) => entry.id === itemId)
  if (!item) return 'Unknown item'
  return item.brand ? `${item.brand} ${item.name}` : item.name
}

export default function ScentDailyReachCard({ profile }: ScentDailyReachCardProps) {
  const daily = computeDailyReach(profile)

  if (!daily.primaryItemId) {
    return <ScentEmptyState title={daily.title} body={daily.rationale} />
  }

  return (
    <div
      style={{
        background: T.card,
        border: `0.5px solid ${T.cardBorder}`,
        borderRadius: 16,
        padding: '16px 18px',
        marginBottom: 10,
      }}
    >
      <p
        style={{
          fontFamily: T.fontM,
          fontSize: 9,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: T.gold,
          opacity: 0.7,
          marginBottom: 6,
        }}
      >
        Daily Reach
      </p>

      <h3
        style={{
          fontFamily: T.fontC,
          fontWeight: 300,
          fontSize: 26,
          color: T.textPrimary,
          lineHeight: 1.2,
          marginBottom: 8,
        }}
      >
        {labelFor(profile, daily.primaryItemId)}
      </h3>

      <p
        style={{
          fontFamily: T.fontM,
          fontSize: 11,
          color: T.textSub,
          lineHeight: 1.7,
          letterSpacing: '0.03em',
          marginBottom: 12,
        }}
      >
        {daily.rationale}
      </p>

      {daily.alternateItemIds.length > 0 && (
        <div>
          <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>
            Alternates
          </p>
          {daily.alternateItemIds.map((id) => (
            <p key={id} style={{ fontFamily: T.fontM, fontSize: 10, color: T.textBody, lineHeight: 1.5, letterSpacing: '0.03em' }}>
              {labelFor(profile, id)}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
