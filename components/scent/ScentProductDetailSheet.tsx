'use client'

import { useMemo, useState } from 'react'
import type { ScentProfile, ScentWardrobeItem } from '@/lib/scent/types'

interface ScentProductDetailSheetProps {
  profile: ScentProfile
  item: ScentWardrobeItem
  onClose: () => void
  onLogWear: (input: {
    itemId: string
    occasion?: string
    weather?: 'hot' | 'mild' | 'cool' | 'cold'
    note?: string
  }) => void
}

const T = {
  panel: '#0b0a09',
  border: 'rgba(255,255,255,0.06)',
  textPrimary: '#f0ebe3',
  textBody: '#c8c2b8',
  textSub: '#8a8278',
  textMuted: '#4a4540',
  gold: '#c4a46b',
  goldGlow: 'rgba(196,164,107,0.08)',
  goldBorder: 'rgba(196,164,107,0.2)',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

const OCCASIONS = ['everyday', 'office', 'date night', 'casual', 'gym', 'travel', 'formal', 'special occasion'] as const
const WEATHERS = ['hot', 'mild', 'cool', 'cold'] as const

function daysAgo(iso?: string | null): string {
  if (!iso) return 'never'
  const diff = Math.floor((Date.now() - Date.parse(iso)) / (1000 * 60 * 60 * 24))
  if (!Number.isFinite(diff)) return 'unknown'
  if (diff <= 0) return 'today'
  if (diff === 1) return '1 day ago'
  return `${diff} days ago`
}

export default function ScentProductDetailSheet({ profile, item, onClose, onLogWear }: ScentProductDetailSheetProps) {
  const [occasion, setOccasion] = useState<string>(item.occasionTags?.[0] ?? 'everyday')
  const [weather, setWeather] = useState<'hot' | 'mild' | 'cool' | 'cold'>('mild')
  const [note, setNote] = useState('')

  const logs = useMemo(
    () =>
      profile.wearPatterns.wearLogs
        .filter((entry) => entry.itemId === item.id)
        .sort((a, b) => Date.parse(b.wornAt) - Date.parse(a.wornAt))
        .slice(0, 7),
    [profile.wearPatterns.wearLogs, item.id]
  )

  const wardrobeFamilyCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const product of profile.wardrobe) {
      for (const family of product.families) counts[family] = (counts[family] ?? 0) + 1
    }
    return counts
  }, [profile.wardrobe])

  const familyDominance = item.families
    .map((family) => `${family} (${wardrobeFamilyCounts[family] ?? 0})`)
    .join(' · ')

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.62)',
          zIndex: 401,
          animation: 'au-fade-in 0.25s ease',
        }}
      />

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 402,
          margin: '0 auto',
          maxWidth: 480,
          borderTop: `0.5px solid ${T.border}`,
          borderRadius: '20px 20px 0 0',
          background: T.panel,
          padding: '20px 18px calc(env(safe-area-inset-bottom, 0px) + 18px)',
          maxHeight: '84vh',
          overflowY: 'auto',
          animation: 'au-onboard-in 0.3s ease',
        }}
      >
        <div style={{ width: 34, height: 3, borderRadius: 4, background: 'rgba(255,255,255,0.14)', margin: '0 auto 14px' }} />

        <p style={{ fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em', color: T.gold, opacity: 0.7, textTransform: 'uppercase', marginBottom: 6 }}>
          Product detail
        </p>
        <h3 style={{ fontFamily: T.fontC, fontSize: 30, fontWeight: 300, color: T.textPrimary, lineHeight: 1.15, marginBottom: 6 }}>
          {item.brand ? `${item.brand} ${item.name}` : item.name}
        </h3>
        <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textSub, letterSpacing: '0.03em', marginBottom: 12 }}>
          {item.families.join(' · ')}
        </p>

        <div style={{ border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 11px', marginBottom: 10 }}>
          <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
            AUVORA analysis
          </p>
          <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textBody, lineHeight: 1.6, letterSpacing: '0.03em', marginBottom: 6 }}>
            This bottle supports your {profile.identity.scentPersonality.toLowerCase()} profile with {familyDominance} in the current wardrobe mix.
          </p>
          <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textSub, lineHeight: 1.6, letterSpacing: '0.03em' }}>
            Layering role: {item.layeringRole ?? 'anchor'} · Last worn: {daysAgo(item.lastWornAt)} · Wear count: {item.wearCount ?? 0}
          </p>
        </div>

        <div style={{ border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 11px', marginBottom: 10 }}>
          <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
            When to wear
          </p>
          <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textBody, lineHeight: 1.55, letterSpacing: '0.03em' }}>
            Seasons: {(item.seasonTags ?? []).join(', ') || 'all-season'}
          </p>
          <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textBody, lineHeight: 1.55, letterSpacing: '0.03em', marginBottom: 6 }}>
            Occasions: {(item.occasionTags ?? []).join(', ') || 'everyday'}
          </p>
          <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textSub, lineHeight: 1.6, letterSpacing: '0.03em' }}>
            Layering suggestion: use this as {item.layeringRole ?? 'anchor'} then follow with a {item.families.includes('fresh') ? 'woody' : 'fresh'} accent from your wardrobe.
          </p>
        </div>

        <div style={{ border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 11px', marginBottom: 10 }}>
          <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
            Wear history
          </p>
          {logs.length === 0 ? (
            <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textSub, lineHeight: 1.6, letterSpacing: '0.03em' }}>
              No wear logs yet for this bottle.
            </p>
          ) : (
            logs.map((entry) => (
              <p key={entry.id} style={{ fontFamily: T.fontM, fontSize: 10, color: T.textBody, lineHeight: 1.6, letterSpacing: '0.03em' }}>
                {new Date(entry.wornAt).toLocaleDateString()} · {entry.occasion ?? 'everyday'} · {entry.weather ?? 'mild'}
                {entry.note ? ` · ${entry.note}` : ''}
              </p>
            ))
          )}
        </div>

        <div style={{ border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 11px', marginBottom: 10 }}>
          <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
            Log wear
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {OCCASIONS.map((option) => (
              <button
                key={option}
                onClick={() => setOccasion(option)}
                style={{
                  border: `0.5px solid ${occasion === option ? T.goldBorder : 'rgba(255,255,255,0.07)'}`,
                  background: occasion === option ? T.goldGlow : 'rgba(255,255,255,0.02)',
                  color: occasion === option ? T.gold : T.textSub,
                  borderRadius: 16,
                  padding: '4px 8px',
                  fontFamily: T.fontM,
                  fontSize: 9,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                }}
              >
                {option}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {WEATHERS.map((option) => (
              <button
                key={option}
                onClick={() => setWeather(option)}
                style={{
                  border: `0.5px solid ${weather === option ? T.goldBorder : 'rgba(255,255,255,0.07)'}`,
                  background: weather === option ? T.goldGlow : 'rgba(255,255,255,0.02)',
                  color: weather === option ? T.gold : T.textSub,
                  borderRadius: 16,
                  padding: '4px 8px',
                  fontFamily: T.fontM,
                  fontSize: 9,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                }}
              >
                {option}
              </button>
            ))}
          </div>

          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: 9,
              padding: '8px',
              fontFamily: T.fontM,
              fontSize: 10,
              color: T.textBody,
              marginBottom: 8,
            }}
          />

          <button
            onClick={() => {
              onLogWear({ itemId: item.id, occasion, weather, note })
              onClose()
            }}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 10,
              border: `0.5px solid ${T.goldBorder}`,
              background: T.goldGlow,
              color: T.gold,
              fontFamily: T.fontM,
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Log this wear
          </button>
        </div>
      </div>
    </>
  )
}
