'use client'

import { useState, useEffect } from 'react'

interface FragranceRec {
  house: string
  name:  string
  why:   string
}

interface ScentResult {
  profile:    string
  story:      string
  topNotes:   string[]
  midNotes:   string[]
  baseNotes:  string[]
  fragrances: FragranceRec[]
  ritual:     string
  mood:       string
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
  'something that makes me feel powerful and expensive',
  'clean and fresh but still memorable',
  'cozy evening at home, candlelit and soft',
  'night out, confident and magnetic',
  'professional but not corporate — creative energy',
  'romantic, warm, skin-close',
]

function NoteTag({ note, index }: { note: string; index: number }) {
  return (
    <span style={{
      fontFamily: T.fontC, fontStyle: 'italic',
      fontSize: 14, color: T.textBody,
      background: 'rgba(255,255,255,0.03)',
      border: '0.5px solid rgba(255,255,255,0.06)',
      borderRadius: 20, padding: '4px 12px',
      animation: `au-fade-up 0.35s ease ${index * 50}ms both`,
      display: 'inline-block',
    }}>
      {note}
    </span>
  )
}

function FragranceCard({ frag, index }: { frag: FragranceRec; index: number }) {
  return (
    <div style={{
      padding: '14px 0',
      borderBottom: '0.5px solid rgba(255,255,255,0.04)',
      animation: `au-fade-up 0.4s ease ${index * 80}ms both`,
    }}>
      <span style={{
        fontFamily: T.fontM, fontSize: 9,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: T.gold, opacity: 0.6, display: 'block', marginBottom: 4,
      }}>
        {frag.house}
      </span>
      <div style={{
        fontFamily: T.fontC, fontSize: 17,
        color: T.textPrimary, letterSpacing: '0.01em', marginBottom: 5,
      }}>
        {frag.name}
      </div>
      <div style={{
        fontFamily: T.fontC, fontStyle: 'italic',
        fontSize: 14, color: T.textSub, lineHeight: 1.55,
      }}>
        {frag.why}
      </div>
    </div>
  )
}

export default function ScentTab() {
  const [vibe,    setVibe]    = useState('')
  const [result,  setResult]  = useState<ScentResult | null>(null)
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
        body:    JSON.stringify({ domain: 'scent', vibe: v, profile }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data as ScentResult)
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
          ◉ Scent
        </p>
        <h1 style={{
          fontFamily: T.fontC, fontWeight: 300, fontSize: 32, color: T.textPrimary,
          letterSpacing: '0.02em', lineHeight: 1.2, marginBottom: 8,
        }}>
          Your scent aura
        </h1>
        <p style={{
          fontFamily: T.fontM, fontSize: 11,
          color: T.textSub, letterSpacing: '0.03em', lineHeight: 1.6,
        }}>
          Describe the feeling or occasion. The oracle finds your scent.
        </p>
      </div>

      {/* ── Seeds ──────────────────────────────────────────────────────────── */}
      {!result && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {SEEDS.slice(0, 4).map(s => (
            <button key={s} onClick={() => generate(s)} style={{
              fontFamily: T.fontM, fontSize: 10, color: T.textSub,
              background: 'rgba(255,255,255,0.02)',
              border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: '6px 10px',
              cursor: 'pointer', outline: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ──────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 10 }}>
        <textarea
          value={vibe}
          onChange={e => setVibe(e.target.value)}
          placeholder="e.g. Quiet confidence, going into a meeting I need to own…"
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
        {loading ? 'Reading your scent…' : 'Find my scent'}
      </button>

      {error && (
        <p style={{
          fontFamily: T.fontM, fontSize: 11,
          color: 'rgba(180,80,80,0.8)', marginBottom: 16,
        }}>
          {error}
        </p>
      )}

      {/* ── Loading skeleton ───────────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[70, 100, 55, 85].map((w, i) => (
            <div key={i} style={{
              height: 16, width: `${w}%`, borderRadius: 6,
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
          {/* Profile header */}
          <div style={{
            background: T.card, border: `0.5px solid ${T.cardBorder}`,
            borderRadius: 16, padding: '20px 18px', marginBottom: 10,
          }}>
            <p style={{
              fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: T.gold, opacity: 0.6, marginBottom: 6,
            }}>
              Scent profile
            </p>
            <h2 style={{
              fontFamily: T.fontC, fontWeight: 300, fontSize: 26,
              color: T.textPrimary, letterSpacing: '0.02em', marginBottom: 12,
            }}>
              {result.profile}
            </h2>
            <p style={{
              fontFamily: T.fontC, fontStyle: 'italic',
              fontSize: 15, color: T.textBody, lineHeight: 1.65,
            }}>
              {result.story}
            </p>
          </div>

          {/* Notes pyramid */}
          <div style={{
            background: T.card, border: `0.5px solid ${T.cardBorder}`,
            borderRadius: 16, padding: '16px 18px', marginBottom: 10,
          }}>
            {[
              { label: 'Top notes',   notes: result.topNotes },
              { label: 'Heart notes', notes: result.midNotes },
              { label: 'Base notes',  notes: result.baseNotes },
            ].map(({ label, notes }, i) => (
              <div key={label} style={{
                marginBottom: i < 2 ? 14 : 0, paddingBottom: i < 2 ? 14 : 0,
                borderBottom: i < 2 ? '0.5px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <p style={{
                  fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: T.textMuted, marginBottom: 8,
                }}>
                  {label}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {notes?.map((n, j) => <NoteTag key={j} note={n} index={j} />)}
                </div>
              </div>
            ))}
          </div>

          {/* Recommended fragrances */}
          <div style={{
            background: T.card, border: `0.5px solid ${T.cardBorder}`,
            borderRadius: 16, padding: '16px 18px', marginBottom: 10,
          }}>
            <p style={{
              fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: T.textMuted, marginBottom: 4,
            }}>
              Recommended fragrances
            </p>
            {result.fragrances?.map((f, i) => (
              <FragranceCard key={i} frag={f} index={i} />
            ))}
          </div>

          {/* Ritual + Mood */}
          <div style={{
            background: T.card, border: `0.5px solid ${T.cardBorder}`,
            borderRadius: 16, padding: '16px 18px', marginBottom: 10,
          }}>
            {[
              { label: 'Application ritual',  value: result.ritual },
              { label: 'The mood it creates', value: result.mood },
            ].map(({ label, value }, i) => (
              <div key={label} style={{
                paddingBottom: i === 0 ? 12 : 0, marginBottom: i === 0 ? 12 : 0,
                borderBottom: i === 0 ? '0.5px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <p style={{
                  fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: T.textMuted, marginBottom: 6,
                }}>
                  {label}
                </p>
                <p style={{
                  fontFamily: T.fontC, fontSize: 15, color: T.textBody, lineHeight: 1.6,
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
            New scent reading
          </button>
        </div>
      )}
    </div>
  )
}
