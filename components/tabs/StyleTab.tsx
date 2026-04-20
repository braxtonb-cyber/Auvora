'use client'

import { useState, useEffect } from 'react'

interface StyleResult {
  concept:  string
  story:    string
  pieces:   string[]
  palette:  string[]
  occasion: string
  tip:      string
  avoid:    string
}

interface AuvoraProfile {
  moment: string
  vibe:   string
  focus:  string
}

const T = {
  bg:          '#060606',
  card:        '#0d0d0d',
  cardBorder:  'rgba(255,255,255,0.05)',
  textPrimary: '#f0ebe3',
  textBody:    '#c8c2b8',
  textSub:     '#8a8278',
  textMuted:   '#4a4540',
  gold:        '#c4a46b',
  goldGlow:    'rgba(196,164,107,0.08)',
  goldBorder:  'rgba(196,164,107,0.18)',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

const SEEDS = [
  'dinner party at a downtown art gallery',
  'first day at a new creative job',
  'weekend farmers market, relaxed but put together',
  'rooftop evening, confident and warm',
  'important meeting, needs to command the room',
  'date night, intellectual and slightly mysterious',
]

function PieceCard({ piece, index }: { piece: string; index: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '11px 0',
      borderBottom: '0.5px solid rgba(255,255,255,0.04)',
      animation: `au-fade-up 0.4s ease ${index * 60}ms both`,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        border: `0.5px solid ${T.goldBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1,
      }}>
        <span style={{ fontFamily: T.fontM, fontSize: 9, color: T.gold }}>
          {index + 1}
        </span>
      </div>
      <span style={{
        fontFamily: T.fontC, fontSize: 15,
        color: T.textBody, letterSpacing: '0.01em', lineHeight: 1.5,
      }}>
        {piece}
      </span>
    </div>
  )
}

function SwatchRow({ colors }: { colors: string[] }) {
  if (!colors?.length) return null
  const valid = colors.filter(c => /^#[0-9a-fA-F]{6}$/.test(c))
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {valid.map((c, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: c,
            border: '0.5px solid rgba(255,255,255,0.08)',
          }} />
          <span style={{ fontFamily: T.fontM, fontSize: 8, color: T.textMuted }}>
            {c.slice(1).toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function StyleTab() {
  const [vibe,    setVibe]    = useState('')
  const [result,  setResult]  = useState<StyleResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [profile, setProfile] = useState<AuvoraProfile | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auvoraProfile')
      if (raw) setProfile(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  async function generate(vibeOverride?: string) {
    const v = vibeOverride ?? vibe
    if (!v.trim()) return
    if (vibeOverride) setVibe(vibeOverride)

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/generate-domain', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ domain: 'style', vibe: v, profile }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data as StyleResult)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: 440, margin: '0 auto',
      padding: '0 16px 40px',
      animation: 'au-tab-switch 0.35s ease',
    }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 52, paddingBottom: 24 }}>
        <p style={{
          fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.28em',
          color: T.gold, textTransform: 'uppercase', marginBottom: 10, opacity: 0.7,
        }}>
          ◈ Style
        </p>
        <h1 style={{
          fontFamily: T.fontC, fontWeight: 300,
          fontSize: 32, color: T.textPrimary,
          letterSpacing: '0.02em', lineHeight: 1.2, marginBottom: 8,
        }}>
          Dress the aura
        </h1>
        <p style={{
          fontFamily: T.fontM, fontSize: 11,
          color: T.textSub, letterSpacing: '0.03em', lineHeight: 1.6,
        }}>
          Describe the moment or occasion you&apos;re dressing for.
        </p>
      </div>

      {/* ── Seeds ──────────────────────────────────────────────────────────── */}
      {!result && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {SEEDS.slice(0, 4).map(s => (
            <button key={s} onClick={() => generate(s)} style={{
              fontFamily: T.fontM, fontSize: 10, letterSpacing: '0.02em', color: T.textSub,
              background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: '6px 10px', cursor: 'pointer', outline: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ──────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <textarea
          value={vibe}
          onChange={e => setVibe(e.target.value)}
          placeholder="e.g. Art gallery opening, want to look quietly powerful but approachable…"
          rows={3}
          style={{
            width: '100%', resize: 'none', background: T.card,
            border: `0.5px solid ${T.cardBorder}`, borderRadius: 14,
            padding: '13px 14px', fontFamily: T.fontM, fontSize: 12,
            color: T.textBody, lineHeight: 1.6, letterSpacing: '0.02em',
            outline: 'none', WebkitTapHighlightColor: 'transparent',
          }}
        />
      </div>

      <button
        onClick={() => generate()}
        disabled={!vibe.trim() || loading}
        style={{
          width: '100%', padding: '14px',
          background: loading || !vibe.trim() ? 'rgba(196,164,107,0.05)' : T.goldGlow,
          border: `0.5px solid ${loading || !vibe.trim() ? 'rgba(196,164,107,0.08)' : T.goldBorder}`,
          borderRadius: 14, cursor: loading || !vibe.trim() ? 'default' : 'pointer',
          fontFamily: T.fontM, fontSize: 11, letterSpacing: '0.12em',
          color: loading || !vibe.trim() ? 'rgba(196,164,107,0.3)' : T.gold,
          textTransform: 'uppercase', transition: 'all 0.2s ease',
          outline: 'none', WebkitTapHighlightColor: 'transparent', marginBottom: 20,
        }}
      >
        {loading ? 'Styling your aura…' : 'Generate look'}
      </button>

      {error && (
        <p style={{
          fontFamily: T.fontM, fontSize: 11,
          color: 'rgba(180,80,80,0.8)', marginBottom: 16, letterSpacing: '0.03em',
        }}>
          {error}
        </p>
      )}

      {/* ── Loading skeleton ───────────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[80, 120, 60, 100, 60].map((h, i) => (
            <div key={i} style={{
              height: 16, width: `${h}%`, borderRadius: 6,
              background: 'linear-gradient(90deg, #111 0px, #1a1916 60px, #111 120px)',
              backgroundSize: '400px 100%',
              animation: `au-shimmer 1.6s ease-in-out ${i * 0.12}s infinite`,
            }} />
          ))}
        </div>
      )}

      {/* ── Result ─────────────────────────────────────────────────────────── */}
      {result && !loading && (
        <div style={{ animation: 'au-fade-up 0.5s ease' }}>
          {/* Concept */}
          <div style={{
            background: T.card, border: `0.5px solid ${T.cardBorder}`,
            borderRadius: 16, padding: '20px 18px', marginBottom: 10,
          }}>
            <p style={{
              fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: T.gold, opacity: 0.6, marginBottom: 6,
            }}>
              Look concept
            </p>
            <h2 style={{
              fontFamily: T.fontC, fontWeight: 300,
              fontSize: 26, color: T.textPrimary, letterSpacing: '0.02em', marginBottom: 12,
            }}>
              {result.concept}
            </h2>
            <p style={{
              fontFamily: T.fontC, fontStyle: 'italic',
              fontSize: 15, color: T.textBody, lineHeight: 1.65,
            }}>
              {result.story}
            </p>
          </div>

          {/* Palette */}
          {result.palette?.length > 0 && (
            <div style={{
              background: T.card, border: `0.5px solid ${T.cardBorder}`,
              borderRadius: 16, padding: '16px 18px', marginBottom: 10,
            }}>
              <p style={{
                fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: T.textMuted, marginBottom: 12,
              }}>
                Color palette
              </p>
              <SwatchRow colors={result.palette} />
            </div>
          )}

          {/* Pieces */}
          <div style={{
            background: T.card, border: `0.5px solid ${T.cardBorder}`,
            borderRadius: 16, padding: '16px 18px', marginBottom: 10,
          }}>
            <p style={{
              fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: T.textMuted, marginBottom: 4,
            }}>
              The pieces
            </p>
            {result.pieces?.map((p, i) => <PieceCard key={i} piece={p} index={i} />)}
          </div>

          {/* Tip + Occasion + Avoid */}
          <div style={{
            background: T.card, border: `0.5px solid ${T.cardBorder}`,
            borderRadius: 16, padding: '16px 18px', marginBottom: 10,
          }}>
            {[
              { label: 'Best for',    value: result.occasion },
              { label: 'Stylist tip', value: result.tip },
              { label: 'Avoid',       value: result.avoid },
            ].map(({ label, value }, i) => (
              <div key={label} style={{
                paddingBottom: i < 2 ? 12 : 0, marginBottom: i < 2 ? 12 : 0,
                borderBottom: i < 2 ? '0.5px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <p style={{
                  fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: T.textMuted, marginBottom: 6,
                }}>
                  {label}
                </p>
                <p style={{
                  fontFamily: T.fontC, fontSize: 15,
                  color: T.textBody, lineHeight: 1.6, letterSpacing: '0.01em',
                }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setResult(null); setVibe('') }}
            style={{
              width: '100%', padding: '12px', background: 'none',
              border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: 14, cursor: 'pointer',
              fontFamily: T.fontM, fontSize: 10,
              letterSpacing: '0.1em', color: T.textMuted, textTransform: 'uppercase',
              outline: 'none', WebkitTapHighlightColor: 'transparent',
            }}
          >
            New look
          </button>
        </div>
      )}
    </div>
  )
}
