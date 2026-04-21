'use client'

import { useState, useEffect } from 'react'

interface Track {
  artist: string
  title:  string
  why:    string
}

interface SoundResult {
  playlistName: string
  atmosphere:   string
  tracks:       Track[]
  artists:      string[]
  bpm:          string
  energy:       string
  genres:       string[]
}

interface AuvoraProfile {
  moment: string
  vibe:   string
  focus:  string
}

const T = {
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
  'focused creative work, no distractions',
  'getting ready for a night out',
  'slow Sunday morning, expansive and warm',
  'driving alone, feeling cinematic',
  'pre-game energy, building confidence',
  'late night introspective, emotional',
]

// Bar heights that create a natural waveform shape when animated
const WAVEFORM_HEIGHTS = [0.35, 0.65, 1, 0.75, 0.5, 0.85, 0.4, 0.9, 0.6, 0.3]

function SoundWaveform({ active, color = T.gold }: { active: boolean; color?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 3,
        alignItems: 'center',
        height: 18,
      }}
    >
      {WAVEFORM_HEIGHTS.map((h, i) => (
        <div
          key={i}
          style={{
            width: 2,
            height: '100%',
            borderRadius: 2,
            background: color,
            transformOrigin: 'center',
            transform: active ? `scaleY(${h})` : 'scaleY(0.15)',
            animation: active
              ? `au-waveform ${0.9 + i * 0.08}s ease-in-out ${i * 0.07}s infinite`
              : 'none',
            transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
            opacity: active ? 0.7 : 0.2,
          }}
        />
      ))}
    </div>
  )
}

function TrackRow({ track, index }: { track: Track; index: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 0',
      borderBottom: '0.5px solid rgba(255,255,255,0.04)',
      animation: `au-fade-up 0.4s ease ${index * 70}ms both`,
    }}>
      <div style={{
        fontFamily: T.fontM, fontSize: 10, color: T.textMuted,
        minWidth: 16, marginTop: 2, textAlign: 'right', flexShrink: 0,
      }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: T.fontC, fontSize: 15, color: T.textPrimary,
          letterSpacing: '0.01em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {track.title}
        </div>
        <div style={{
          fontFamily: T.fontM, fontSize: 10,
          color: T.textSub, marginTop: 2, letterSpacing: '0.04em',
        }}>
          {track.artist}
        </div>
        <div style={{
          fontFamily: T.fontC, fontStyle: 'italic',
          fontSize: 13, color: T.textMuted, marginTop: 3, lineHeight: 1.5,
        }}>
          {track.why}
        </div>
      </div>
    </div>
  )
}

export default function SoundTab() {
  const [vibe,    setVibe]    = useState('')
  const [result,  setResult]  = useState<SoundResult | null>(null)
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
        body:    JSON.stringify({ domain: 'sound', vibe: v, profile }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data as SoundResult)
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
      animation: 'au-tab-switch 0.5s linear',
    }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 52, paddingBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{
            fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.28em',
            color: T.gold, textTransform: 'uppercase', opacity: 0.7,
          }}>
            ♩ Sound
          </p>
          <SoundWaveform active={loading} />
        </div>
        <h1 style={{
          fontFamily: T.fontC, fontWeight: 300, fontSize: 32, color: T.textPrimary,
          letterSpacing: '0.02em', lineHeight: 1.2, marginBottom: 8,
        }}>
          Score your aura
        </h1>
        <p style={{
          fontFamily: T.fontM, fontSize: 11,
          color: T.textSub, letterSpacing: '0.03em', lineHeight: 1.6,
        }}>
          Tell the oracle what you need to feel. It builds you a world.
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
          placeholder="e.g. Getting ready for something important, need to feel grounded and sharp…"
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
        {loading ? 'Tuning your frequency…' : 'Build my playlist'}
      </button>

      {error && (
        <p style={{ fontFamily: T.fontM, fontSize: 11, color: 'rgba(180,80,80,0.8)', marginBottom: 16 }}>
          {error}
        </p>
      )}

      {/* ── Loading skeleton ───────────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[65, 90, 75, 100, 60].map((w, i) => (
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
        <div style={{ animation: 'au-spring-in 0.55s linear' }}>
          {/* Playlist header */}
          <div style={{
            background: T.card, border: `0.5px solid ${T.cardBorder}`,
            borderRadius: 16, padding: '20px 18px', marginBottom: 10,
          }}>
            {/* Energy row with waveform */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 10,
            }}>
              <p style={{
                fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: T.gold, opacity: 0.6,
              }}>
                {result.energy} · {result.bpm}
              </p>
              <SoundWaveform active={true} />
            </div>
            <h2 style={{
              fontFamily: T.fontC, fontWeight: 300, fontSize: 24,
              color: T.textPrimary, letterSpacing: '0.02em', marginBottom: 12,
            }}>
              {result.playlistName}
            </h2>
            <p style={{
              fontFamily: T.fontC, fontStyle: 'italic',
              fontSize: 15, color: T.textBody, lineHeight: 1.65, marginBottom: 12,
            }}>
              {result.atmosphere}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {result.genres?.map((g, i) => (
                <span key={i} style={{
                  fontFamily: T.fontM, fontSize: 9,
                  letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted,
                  border: '0.5px solid rgba(255,255,255,0.06)',
                  borderRadius: 20, padding: '3px 9px',
                }}>
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Tracks */}
          <div style={{
            background: T.card, border: `0.5px solid ${T.cardBorder}`,
            borderRadius: 16, padding: '16px 18px', marginBottom: 10,
          }}>
            <p style={{
              fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: T.textMuted, marginBottom: 4,
            }}>
              Tracks
            </p>
            {result.tracks?.map((t, i) => <TrackRow key={i} track={t} index={i} />)}
          </div>

          {/* Artists */}
          {result.artists?.length > 0 && (
            <div style={{
              background: T.card, border: `0.5px solid ${T.cardBorder}`,
              borderRadius: 16, padding: '16px 18px', marginBottom: 10,
            }}>
              <p style={{
                fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: T.textMuted, marginBottom: 10,
              }}>
                Artists in this world
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {result.artists.map((a, i) => (
                  <span key={i} style={{
                    fontFamily: T.fontC, fontStyle: 'italic', fontSize: 15, color: T.textBody,
                    background: 'rgba(255,255,255,0.03)',
                    border: '0.5px solid rgba(255,255,255,0.06)',
                    borderRadius: 20, padding: '4px 12px',
                  }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

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
            New playlist
          </button>
        </div>
      )}
    </div>
  )
}
