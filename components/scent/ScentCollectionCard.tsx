'use client'

import { getOwnedCollection } from '@/lib/scent/mini-scentory'
import type { ScentProfile } from '@/lib/scent/types'
import ScentEmptyState from '@/components/scent/ScentEmptyState'

interface ScentCollectionCardProps {
  profile: ScentProfile
  onToggleFavorite: (itemId: string) => void
  onOpenDetails: (itemId: string) => void
}

const T = {
  card: '#0d0d0d',
  cardBorder: 'rgba(255,255,255,0.05)',
  textPrimary: '#f0ebe3',
  textBody: '#c8c2b8',
  textSub: '#8a8278',
  textMuted: '#4a4540',
  gold: '#c4a46b',
  goldGlow: 'rgba(196,164,107,0.1)',
  goldBorder: 'rgba(196,164,107,0.24)',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

function badgeLabel(profile: ScentProfile, itemId: string): string {
  if (profile.preferences.favoriteItemIds.includes(itemId)) return 'Favorite'
  if (profile.identity.dailyReachItemIds.includes(itemId)) return 'Daily reach'
  return 'Owned'
}

function daysAgo(iso?: string | null): string {
  if (!iso) return 'Not logged yet'
  const diff = Math.floor((Date.now() - Date.parse(iso)) / (1000 * 60 * 60 * 24))
  if (!Number.isFinite(diff) || diff < 0) return 'Recently worn'
  if (diff === 0) return 'Worn today'
  if (diff === 1) return 'Worn yesterday'
  return `Worn ${diff} days ago`
}

function insightLine(wearCount: number, isDailyReach: boolean): string {
  if (isDailyReach) return 'Current daily reach anchor.'
  if (wearCount >= 8) return 'High-rotation staple.'
  if (wearCount <= 1) return 'Underused gem worth pulling back in.'
  return 'Flexible mid-rotation option.'
}

export default function ScentCollectionCard({ profile, onToggleFavorite, onOpenDetails }: ScentCollectionCardProps) {
  const collection = getOwnedCollection(profile)

  if (collection.length === 0) {
    return (
      <ScentEmptyState
        title="Wardrobe View"
        body="Add a few owned bottles in the routine flow so recommendations can anchor to your real wardrobe."
      />
    )
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
        Wardrobe View
      </p>
      <h3 style={{ fontFamily: T.fontC, fontWeight: 300, fontSize: 25, color: T.textPrimary, marginBottom: 8 }}>
        Your collection shelf
      </h3>
      <p style={{ fontFamily: T.fontM, fontSize: 11, color: T.textSub, lineHeight: 1.6, letterSpacing: '0.03em', marginBottom: 12 }}>
        Everything you own, with usage signals and one-tap product analysis.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {collection.slice(0, 12).map((item) => {
          const favorite = profile.preferences.favoriteItemIds.includes(item.id)
          const dailyReach = profile.identity.dailyReachItemIds.includes(item.id)
          const label = item.brand ? `${item.brand} ${item.name}` : item.name

          return (
            <div
              key={item.id}
              style={{
                border: '0.5px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: '10px',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div>
                <p style={{ fontFamily: T.fontC, fontSize: 17, color: T.textPrimary, lineHeight: 1.2, marginBottom: 4 }}>
                  {label}
                </p>
                <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {badgeLabel(profile, item.id)}
                </p>
                <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textSub, lineHeight: 1.45, letterSpacing: '0.02em' }}>
                  {daysAgo(item.lastWornAt)}
                </p>
                <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, lineHeight: 1.45, letterSpacing: '0.02em', marginTop: 4 }}>
                  {insightLine(item.wearCount ?? 0, dailyReach)}
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {item.families.slice(0, 2).map((family) => (
                  <span
                    key={`${item.id}-${family}`}
                    style={{
                      border: '0.5px solid rgba(255,255,255,0.06)',
                      borderRadius: 20,
                      padding: '3px 7px',
                      fontFamily: T.fontM,
                      fontSize: 9,
                      color: T.textSub,
                      letterSpacing: '0.03em',
                    }}
                  >
                    {family}
                  </span>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 'auto' }}>
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  style={{
                    border: `0.5px solid ${favorite ? T.goldBorder : 'rgba(255,255,255,0.07)'}`,
                    background: favorite ? T.goldGlow : 'rgba(255,255,255,0.02)',
                    color: favorite ? T.gold : T.textSub,
                    borderRadius: 10,
                    padding: '7px 8px',
                    fontFamily: T.fontM,
                    fontSize: 9,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {favorite ? 'Saved' : 'Favorite'}
                </button>

                <button
                  onClick={() => onOpenDetails(item.id)}
                  style={{
                    border: '0.5px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.02)',
                    color: T.textBody,
                    borderRadius: 10,
                    padding: '7px 8px',
                    fontFamily: T.fontM,
                    fontSize: 9,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Details
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
