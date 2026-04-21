'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PendingCheckin {
  vibeInput:   string
  vibeName:    string
  generatedAt: string
}

interface Rating {
  key:   'exact' | 'close' | 'missed' | 'diverged'
  label: string
}

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  card:       '#0d0d0d',
  cardBorder: 'rgba(255,255,255,0.05)',
  textPrimary:'#f0ebe3',
  textBody:   '#c8c2b8',
  textSub:    '#8a8278',
  textMuted:  '#4a4540',
  gold:       '#c4a46b',
  goldGlow:   'rgba(196,164,107,0.08)',
  goldBorder: 'rgba(196,164,107,0.18)',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

const RATINGS: Rating[] = [
  { key: 'exact',    label: 'It was exactly right' },
  { key: 'close',    label: 'Close — the mood shifted' },
  { key: 'missed',   label: 'Missed the mark' },
  { key: 'diverged', label: 'The day went elsewhere' },
]

// ── Component ──────────────────────────────────────────────────────────────────

export default function CheckInCard({
  checkin,
  onComplete,
  onSkip,
}: {
  checkin:    PendingCheckin
  onComplete: () => void
  onSkip:     () => void
}) {
  const [selected,   setSelected]   = useState<Rating['key'] | null>(null)
  const [note,       setNote]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done,       setDone]       = useState(false)

  const truncatedVibe = checkin.vibeInput.length > 60
    ? checkin.vibeInput.slice(0, 60).trimEnd() + '…'
    : checkin.vibeInput

  async function submit() {
    if (!selected || submitting) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await supabase.from('checkins').insert({
          user_id:   session.user.id,
          vibe_input:checkin.vibeInput,
          vibe_name: checkin.vibeName,
          rating:    selected,
          note:      note.trim() || null,
        })
      }
    } catch { /* fail silently — checkin data is non-critical */ }

    setDone(true)
    setTimeout(onComplete, 1200)
  }

  if (done) {
    return (
      <div style={{
        background: T.card, border: `0.5px solid ${T.goldBorder}`,
        borderRadius: 16, padding: '18px 18px',
        marginBottom: 20,
        animation: 'au-fade-up 0.3s ease both',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: T.gold, flexShrink: 0,
        }} />
        <p style={{
          fontFamily: T.fontC, fontStyle: 'italic',
          fontSize: 15, color: T.textBody, letterSpacing: '0.01em',
        }}>
          Noted. AUVORA is listening.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: T.card, border: `0.5px solid ${T.goldBorder}`,
      borderRadius: 16, padding: '16px 18px',
      marginBottom: 20,
      animation: 'au-spring-in 0.5s linear',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 10,
      }}>
        <p style={{
          fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.24em',
          color: T.gold, textTransform: 'uppercase', opacity: 0.7,
        }}>
          ✦ How did it land?
        </p>
        <button
          onClick={onSkip}
          style={{
            fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.08em',
            color: T.textMuted, background: 'none', border: 'none',
            cursor: 'pointer', padding: 0, textTransform: 'uppercase',
            outline: 'none', WebkitTapHighlightColor: 'transparent',
          }}
        >
          Skip
        </button>
      </div>

      {/* Vibe reference */}
      <p style={{
        fontFamily: T.fontC, fontStyle: 'italic',
        fontSize: 14, color: T.textSub,
        letterSpacing: '0.01em', lineHeight: 1.5, marginBottom: 14,
      }}>
        &ldquo;{truncatedVibe}&rdquo;
      </p>

      {/* Rating options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: selected ? 12 : 0 }}>
        {RATINGS.map(r => {
          const isSelected = selected === r.key
          const isDimmed   = selected !== null && !isSelected
          return (
            <button
              key={r.key}
              onClick={() => setSelected(r.key)}
              style={{
                width: '100%', padding: '11px 14px',
                background: isSelected ? T.goldGlow : 'rgba(255,255,255,0.02)',
                border: `0.5px solid ${isSelected ? T.goldBorder : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer', outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                transition: 'all 0.18s ease',
                opacity: isDimmed ? 0.4 : 1,
              }}
            >
              {isSelected && (
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: T.gold, flexShrink: 0,
                }} />
              )}
              <span style={{
                fontFamily: T.fontC, fontSize: 15,
                color: isSelected ? T.textPrimary : T.textBody,
                letterSpacing: '0.01em',
              }}>
                {r.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Note + submit (appears after selection) */}
      {selected && (
        <div style={{ animation: 'au-fade-up 0.3s ease both' }}>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What actually happened? (optional)"
            rows={2}
            style={{
              width: '100%', resize: 'none',
              background: 'rgba(255,255,255,0.02)',
              border: '0.5px solid rgba(255,255,255,0.05)',
              borderRadius: 10, padding: '10px 12px',
              fontFamily: T.fontM, fontSize: 11,
              color: T.textBody, lineHeight: 1.6, letterSpacing: '0.02em',
              outline: 'none', WebkitTapHighlightColor: 'transparent',
              marginBottom: 10,
            }}
          />
          <button
            onClick={submit}
            disabled={submitting}
            style={{
              width: '100%', padding: '12px',
              background: submitting ? T.goldGlow : T.goldGlow,
              border: `0.5px solid ${T.goldBorder}`,
              borderRadius: 12, cursor: submitting ? 'default' : 'pointer',
              fontFamily: T.fontM, fontSize: 10, letterSpacing: '0.12em',
              color: submitting ? 'rgba(196,164,107,0.4)' : T.gold,
              textTransform: 'uppercase', transition: 'all 0.15s ease',
              outline: 'none', WebkitTapHighlightColor: 'transparent',
            }}
          >
            {submitting ? 'Noting…' : 'Note it'}
          </button>
        </div>
      )}
    </div>
  )
}
