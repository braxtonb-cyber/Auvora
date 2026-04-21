'use client'

import { useState } from 'react'
import { IDENTITY_LED_ITEM_ID } from '@/lib/scent/situation-prompt'
import type { ScentProfile, SituationRecommendation } from '@/lib/scent/types'

interface ScentSituationEngineProps {
  profile: ScentProfile
}

const QUICK_CONTEXTS = [
  'Late dinner in warm weather',
  'Interview morning, sharp and clear',
  'Everyday class, clean but memorable',
  'Night city walk, more deliberate',
]

const T = {
  card: '#0d0d0d',
  cardBorder: 'rgba(255,255,255,0.05)',
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

function labelFor(profile: ScentProfile, itemId: string): string {
  if (itemId === IDENTITY_LED_ITEM_ID) return 'Identity-led direction'
  const item = profile.wardrobe.find((entry) => entry.id === itemId)
  if (!item) return 'Unknown item'
  return item.brand ? `${item.brand} ${item.name}` : item.name
}

export default function ScentSituationEngine({ profile }: ScentSituationEngineProps) {
  const [situation, setSituation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SituationRecommendation | null>(null)

  async function runSituation(value?: string) {
    const text = (value ?? situation).trim()
    if (!text || loading) return

    if (value) setSituation(value)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/scent-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: text, scentProfile: profile }),
      })
      const data = (await response.json()) as { recommendation?: SituationRecommendation; error?: string }

      if (!response.ok || !data.recommendation) {
        throw new Error(data.error || 'Situation engine unavailable')
      }

      setResult(data.recommendation)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Situation engine unavailable'
      setError(message)
      setResult(null)
    } finally {
      setLoading(false)
    }
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
        Situation Engine
      </p>
      <h3 style={{ fontFamily: T.fontC, fontWeight: 300, fontSize: 25, color: T.textPrimary, marginBottom: 8 }}>
        Mini Nose advisory
      </h3>
      <p style={{ fontFamily: T.fontM, fontSize: 11, color: T.textSub, lineHeight: 1.65, letterSpacing: '0.03em', marginBottom: 10 }}>
        Describe the moment. AUVORA advises from your wardrobe, personality, and current gaps.
      </p>

      {!result && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {QUICK_CONTEXTS.map((context) => (
            <button
              key={context}
              onClick={() => runSituation(context)}
              style={{
                border: '0.5px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 20,
                padding: '6px 10px',
                fontFamily: T.fontM,
                fontSize: 10,
                color: T.textSub,
                cursor: 'pointer',
              }}
            >
              {context}
            </button>
          ))}
        </div>
      )}

      <textarea
        value={situation}
        onChange={(event) => setSituation(event.target.value)}
        rows={3}
        placeholder="e.g. Dinner after work, I want cleaner precision without feeling cold."
        style={{
          width: '100%',
          resize: 'none',
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 13,
          padding: '12px 13px',
          fontFamily: T.fontM,
          fontSize: 11,
          color: T.textBody,
          lineHeight: 1.6,
          marginBottom: 10,
        }}
      />

      <button
        onClick={() => runSituation()}
        disabled={!situation.trim() || loading}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 12,
          border: `0.5px solid ${loading || !situation.trim() ? 'rgba(196,164,107,0.08)' : T.goldBorder}`,
          background: loading || !situation.trim() ? 'rgba(196,164,107,0.05)' : T.goldGlow,
          color: loading || !situation.trim() ? 'rgba(196,164,107,0.3)' : T.gold,
          fontFamily: T.fontM,
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: loading || !situation.trim() ? 'default' : 'pointer',
          marginBottom: error || result ? 10 : 0,
        }}
      >
        {loading ? 'Advising...' : 'Advise from profile'}
      </button>

      {error && (
        <p style={{ fontFamily: T.fontM, fontSize: 10, color: 'rgba(180,80,80,0.85)', letterSpacing: '0.02em' }}>
          {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: 2, borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
          <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>
            Recommendation
          </p>
          <h4 style={{ fontFamily: T.fontC, fontWeight: 300, fontSize: 22, color: T.textPrimary, marginBottom: 4 }}>
            {result.title}
          </h4>
          <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textSub, letterSpacing: '0.03em', lineHeight: 1.55, marginBottom: 7 }}>
            {result.mode === 'layer'
              ? `${labelFor(profile, result.primaryItemId)} + ${labelFor(profile, result.secondaryItemId || '')}`
              : labelFor(profile, result.primaryItemId)}
          </p>
          <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textBody, lineHeight: 1.6, letterSpacing: '0.03em', marginBottom: 7 }}>
            {result.reasoning}
          </p>
          <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textSub, lineHeight: 1.6, letterSpacing: '0.03em', marginBottom: result.futureDirection ? 7 : 9 }}>
            {result.wearingNote}
          </p>
          {result.futureDirection && (
            <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textMuted, lineHeight: 1.6, letterSpacing: '0.03em', marginBottom: 8 }}>
              {result.futureDirection}
            </p>
          )}
          <p style={{ fontFamily: T.fontC, fontStyle: 'italic', fontSize: 14, color: T.textSub, lineHeight: 1.6 }}>
            {result.tryNext}
          </p>
        </div>
      )}
    </div>
  )
}
