'use client'

import { computeRotationInsights } from '@/lib/scent/rotation'
import type { ScentProfile } from '@/lib/scent/types'
import ScentEmptyState from '@/components/scent/ScentEmptyState'

interface ScentRotationCardProps {
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

function Section({ label, ids, profile }: { label: string; ids: string[]; profile: ScentProfile }) {
  if (ids.length === 0) return null

  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
        {label}
      </p>
      {ids.map((id) => (
        <p key={id} style={{ fontFamily: T.fontM, fontSize: 10, color: T.textSub, lineHeight: 1.55, letterSpacing: '0.03em' }}>
          {labelFor(profile, id)}
        </p>
      ))}
    </div>
  )
}

export default function ScentRotationCard({ profile }: ScentRotationCardProps) {
  const insights = computeRotationInsights(profile)

  if (profile.wardrobe.filter((item) => item.owned).length === 0) {
    return <ScentEmptyState title="Rotation & Reach" body={insights.summary} />
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
      <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.gold, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>
        Rotation & Reach
      </p>
      <h3 style={{ fontFamily: T.fontC, fontWeight: 300, fontSize: 25, color: T.textPrimary, marginBottom: 8 }}>
        Keep the wardrobe alive.
      </h3>
      <p style={{ fontFamily: T.fontM, fontSize: 11, color: T.textSub, lineHeight: 1.6, letterSpacing: '0.03em', marginBottom: 12 }}>
        {insights.summary}
      </p>

      <Section label="Most worn" ids={insights.mostWornIds} profile={profile} />
      <Section label="Underused gems" ids={insights.underusedGemIds} profile={profile} />
      <Section label="Overdue reaches" ids={insights.overdueReachIds} profile={profile} />
      <Section label="This week" ids={insights.weeklyRotationIds} profile={profile} />
    </div>
  )
}
