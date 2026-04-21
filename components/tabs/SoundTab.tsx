'use client'

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { capture } from '@/lib/posthog'

// ── Types ──────────────────────────────────────────────────────────────────────

interface SoundPrefs {
  contexts: string[]
  sonic:    string
  era:      string
  platform: string
}

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
  rationale:    string | null
}

interface SavedPlaylist extends SoundResult {
  id:      string
  vibe:    string
  savedAt: string
}

interface AuvoraProfile {
  moment: string
  vibe:   string
  focus:  string
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
  fontD: 'var(--font-display), "Bodoni Moda", serif',
}

// ── Platform links ─────────────────────────────────────────────────────────────

const PLATFORM_SEARCH: Record<string, (q: string) => string> = {
  'Spotify':       q => `https://open.spotify.com/search/${encodeURIComponent(q)}`,
  'Apple Music':   q => `https://music.apple.com/search?term=${encodeURIComponent(q)}`,
  'YouTube Music': q => `https://music.youtube.com/search?q=${encodeURIComponent(q)}`,
}

// ── Onboarding config ──────────────────────────────────────────────────────────

interface OnboardStep {
  key:     keyof SoundPrefs
  question:string
  sub:     string
  multi:   boolean
  options: string[]
}

const STEPS: OnboardStep[] = [
  {
    key:      'contexts',
    question: 'How do you use sound?',
    sub:      'Select all that apply.',
    multi:    true,
    options:  [
      'Focus & deep work',
      'Movement & exercise',
      'Getting ready',
      'Late night sessions',
      'Long drives',
      'Emotional processing',
      'Social settings',
    ],
  },
  {
    key:      'sonic',
    question: 'Your sonic signature.',
    sub:      'Choose one direction.',
    multi:    false,
    options:  [
      'Electronic & synthetic',
      'Organic & acoustic',
      'Experimental & abstract',
      'Rhythm-first',
      'Genre-fluid',
    ],
  },
  {
    key:      'era',
    question: 'The era you return to.',
    sub:      'Choose one.',
    multi:    false,
    options:  [
      'Contemporary (2010–now)',
      'Late golden (90s–2000s)',
      'Classic (70s–80s)',
      'Spanning all eras',
    ],
  },
  {
    key:      'platform',
    question: 'Where you listen.',
    sub:      'Choose one.',
    multi:    false,
    options:  ['Spotify', 'Apple Music', 'YouTube Music', 'Other'],
  },
]

const SEEDS = [
  'focused creative work, no distractions',
  'getting ready for a night out',
  'slow Sunday morning, expansive and warm',
  'driving alone, feeling cinematic',
]

// ── Waveform ───────────────────────────────────────────────────────────────────

const WAVE_H = [0.35, 0.65, 1, 0.75, 0.5, 0.85, 0.4, 0.9, 0.6, 0.3]

function SoundWaveform({ active, color = T.gold }: { active: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 18 }}>
      {WAVE_H.map((h, i) => (
        <div key={i} style={{
          width: 2, height: '100%', borderRadius: 2, background: color,
          transformOrigin: 'center',
          transform: active ? `scaleY(${h})` : 'scaleY(0.15)',
          animation: active
            ? `au-waveform ${0.9 + i * 0.08}s ease-in-out ${i * 0.07}s infinite`
            : 'none',
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          opacity: active ? 0.7 : 0.2,
        }} />
      ))}
    </div>
  )
}

function MiniWave({ color = T.gold }: { color?: string }) {
  const heights = [0.4, 0.8, 0.6, 1, 0.5, 0.9, 0.3]
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center', height: 12 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 2, height: '100%', borderRadius: 2, background: color,
          transform: `scaleY(${h})`, transformOrigin: 'center', opacity: 0.4,
        }} />
      ))}
    </div>
  )
}

// ── Track row ──────────────────────────────────────────────────────────────────

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
          fontFamily: T.fontM, fontSize: 10, color: T.textSub,
          marginTop: 2, letterSpacing: '0.04em',
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

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7)  return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

// ── Onboarding ─────────────────────────────────────────────────────────────────

function Onboarding({ onDone }: { onDone: (prefs: SoundPrefs) => void }) {
  const [step,  setStep]  = useState(0)
  const [draft, setDraft] = useState<Partial<SoundPrefs>>({})

  function toggle(key: keyof SoundPrefs, val: string, multi: boolean) {
    setDraft(prev => {
      if (multi) {
        const arr = (prev[key] as string[] | undefined) || []
        return { ...prev, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] }
      }
      return { ...prev, [key]: val }
    })
  }

  function isSelected(key: keyof SoundPrefs, opt: string, multi: boolean) {
    const val = draft[key]
    if (multi) return Array.isArray(val) && val.includes(opt)
    return val === opt
  }

  function stepValid() {
    const { key, multi } = STEPS[step]
    const val = draft[key]
    if (multi) return Array.isArray(val) && val.length > 0
    return typeof val === 'string' && val.length > 0
  }

  function advance() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      onDone(draft as SoundPrefs)
    }
  }

  const s = STEPS[step]

  return (
    <div style={{
      maxWidth: 440, margin: '0 auto',
      padding: '0 16px 40px',
      animation: 'au-tab-switch 0.5s linear',
    }}>
      <div style={{ paddingTop: 64 }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 36 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              height: 2, flex: 1, borderRadius: 2,
              background: i <= step ? T.gold : 'rgba(255,255,255,0.06)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16,
        }}>
          <p style={{
            fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.28em',
            color: T.gold, textTransform: 'uppercase', opacity: 0.7,
          }}>
            ♩ Sound Profile · {step + 1} of {STEPS.length}
          </p>
          <SoundWaveform active={false} />
        </div>

        <h1 style={{
          fontFamily: T.fontD, fontWeight: 400,
          fontSize: 28, color: T.textPrimary,
          letterSpacing: '0.01em', lineHeight: 1.25, marginBottom: 6,
        }}>
          {s.question}
        </h1>
        <p style={{
          fontFamily: T.fontM, fontSize: 11,
          color: T.textSub, marginBottom: 28, letterSpacing: '0.04em',
        }}>
          {s.sub}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {s.options.map(opt => {
            const sel = isSelected(s.key, opt, s.multi)
            return (
              <button
                key={opt}
                onClick={() => toggle(s.key, opt, s.multi)}
                style={{
                  width: '100%', padding: '14px 18px',
                  background: sel ? T.goldGlow : 'rgba(255,255,255,0.02)',
                  border: `0.5px solid ${sel ? T.goldBorder : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{
                  fontFamily: T.fontC, fontSize: 17,
                  color: sel ? T.textPrimary : T.textBody,
                  letterSpacing: '0.01em',
                }}>
                  {opt}
                </span>
                {sel && (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: T.gold, flexShrink: 0,
                  }} />
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={advance}
          disabled={!stepValid()}
          style={{
            width: '100%', padding: '14px',
            background: stepValid() ? T.goldGlow : 'rgba(196,164,107,0.03)',
            border: `0.5px solid ${stepValid() ? T.goldBorder : 'rgba(196,164,107,0.06)'}`,
            borderRadius: 14, cursor: stepValid() ? 'pointer' : 'default',
            fontFamily: T.fontM, fontSize: 11, letterSpacing: '0.12em',
            color: stepValid() ? T.gold : 'rgba(196,164,107,0.25)',
            textTransform: 'uppercase', transition: 'all 0.2s ease',
            outline: 'none', WebkitTapHighlightColor: 'transparent',
          }}
        >
          {step < STEPS.length - 1 ? 'Continue' : 'Build my sound profile'}
        </button>
      </div>
    </div>
  )
}

// ── Expanded saved playlist ────────────────────────────────────────────────────

function ExpandedPlaylist({ pl, prefs, onBack, onDelete }: {
  pl:       SavedPlaylist
  prefs:    SoundPrefs | null
  onBack:   () => void
  onDelete: (id: string) => void
}) {
  const platformLink = prefs?.platform && PLATFORM_SEARCH[prefs.platform]
    ? PLATFORM_SEARCH[prefs.platform](pl.playlistName)
    : null

  return (
    <div style={{
      maxWidth: 440, margin: '0 auto',
      padding: '0 16px 40px',
      animation: 'au-spring-in 0.45s linear',
    }}>
      <div style={{ paddingTop: 52, marginBottom: 20 }}>
        <button onClick={onBack} style={{
          fontFamily: T.fontM, fontSize: 10, letterSpacing: '0.1em',
          color: T.textMuted, background: 'none', border: 'none',
          cursor: 'pointer', padding: 0, textTransform: 'uppercase', outline: 'none',
        }}>
          ← Archive
        </button>
      </div>

      {/* Header */}
      <div style={{
        background: T.card, border: `0.5px solid ${T.cardBorder}`,
        borderRadius: 16, padding: '20px 18px', marginBottom: 10,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <p style={{
            fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: T.gold, opacity: 0.6,
          }}>
            {pl.energy} · {pl.bpm}
          </p>
          <SoundWaveform active={false} />
        </div>
        <p style={{
          fontFamily: T.fontM, fontSize: 8, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: T.textMuted, marginBottom: 8,
        }}>
          {timeAgo(pl.savedAt)} · {pl.vibe.slice(0, 48)}{pl.vibe.length > 48 ? '…' : ''}
        </p>
        <h2 style={{
          fontFamily: T.fontC, fontWeight: 300, fontSize: 24,
          color: T.textPrimary, letterSpacing: '0.02em', marginBottom: 12,
        }}>
          {pl.playlistName}
        </h2>
        <p style={{
          fontFamily: T.fontC, fontStyle: 'italic',
          fontSize: 15, color: T.textBody, lineHeight: 1.65, marginBottom: 12,
        }}>
          {pl.atmosphere}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {pl.genres?.map((g, i) => (
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

      {/* Rationale */}
      {pl.rationale && (
        <div style={{
          background: T.card, border: `0.5px solid ${T.goldBorder}`,
          borderRadius: 16, padding: '16px 18px', marginBottom: 10,
        }}>
          <p style={{
            fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: T.gold, opacity: 0.6, marginBottom: 8,
          }}>
            Why this arc
          </p>
          <p style={{
            fontFamily: T.fontC, fontStyle: 'italic',
            fontSize: 15, color: T.textBody, lineHeight: 1.65,
          }}>
            {pl.rationale}
          </p>
        </div>
      )}

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
        {pl.tracks?.map((t, i) => <TrackRow key={i} track={t} index={i} />)}
      </div>

      {/* Platform link */}
      {platformLink && (
        <a
          href={platformLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', width: '100%', padding: '13px',
            background: T.goldGlow,
            border: `0.5px solid ${T.goldBorder}`,
            borderRadius: 14, cursor: 'pointer',
            fontFamily: T.fontM, fontSize: 10, letterSpacing: '0.1em',
            color: T.gold, textTransform: 'uppercase', textAlign: 'center',
            textDecoration: 'none', marginBottom: 8,
          }}
        >
          Search on {prefs?.platform}
        </a>
      )}

      <button
        onClick={() => onDelete(pl.id)}
        style={{
          width: '100%', padding: '12px', background: 'none',
          border: '0.5px solid rgba(255,80,80,0.1)',
          borderRadius: 14, cursor: 'pointer',
          fontFamily: T.fontM, fontSize: 10,
          letterSpacing: '0.1em', color: 'rgba(200,100,100,0.45)',
          textTransform: 'uppercase',
          outline: 'none', WebkitTapHighlightColor: 'transparent',
        }}
      >
        Remove from archive
      </button>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function SoundTab() {
  const [prefs,          setPrefs]          = useState<SoundPrefs | null>(null)
  const [prefsLoaded,    setPrefsLoaded]    = useState(false)
  const [onboarding,     setOnboarding]     = useState(false)
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([])
  const [expandedPl,     setExpandedPl]     = useState<SavedPlaylist | null>(null)

  const [vibe,    setVibe]    = useState('')
  const [result,  setResult]  = useState<SoundResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [saved,   setSaved]   = useState(false)

  const [profile, setProfile] = useState<AuvoraProfile | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auvoraProfile')
      if (raw) setProfile(JSON.parse(raw))

      const rawPrefs = localStorage.getItem('soundPrefs')
      if (rawPrefs) {
        setPrefs(JSON.parse(rawPrefs))
      } else {
        setOnboarding(true)
      }

      const rawSaved = localStorage.getItem('soundSavedPlaylists')
      if (rawSaved) setSavedPlaylists(JSON.parse(rawSaved))
    } catch { /* ignore */ }
    setPrefsLoaded(true)
  }, [])

  function handleOnboardingDone(completed: SoundPrefs) {
    localStorage.setItem('soundPrefs', JSON.stringify(completed))
    setPrefs(completed)
    setOnboarding(false)
    capture('sound_onboarding_completed', {
      sonic:          completed.sonic,
      era:            completed.era,
      platform:       completed.platform,
      contexts_count: completed.contexts.length,
    })
  }

  function deleteSavedPlaylist(id: string) {
    const updated = savedPlaylists.filter(p => p.id !== id)
    setSavedPlaylists(updated)
    localStorage.setItem('soundSavedPlaylists', JSON.stringify(updated))
    setExpandedPl(null)
  }

  async function generate(vibeOverride?: string) {
    const v = vibeOverride ?? vibe
    if (!v.trim()) return
    if (vibeOverride) setVibe(vibeOverride)
    setLoading(true)
    setError('')
    setResult(null)
    setSaved(false)

    capture('sound_generate_started', { vibe_length: v.trim().length, has_prefs: !!prefs })

    try {
      const res = await fetch('/api/generate-domain', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ domain: 'sound', vibe: v, profile, soundPrefs: prefs }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      const sound = data as SoundResult
      setResult(sound)
      capture('sound_generate_completed', {
        playlist_name: sound.playlistName,
        energy:        sound.energy,
        track_count:   sound.tracks?.length ?? 0,
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setError(msg)
      capture('sound_generate_failed', { error: msg })
    } finally {
      setLoading(false)
    }
  }

  function savePlaylist() {
    if (!result || saved) return
    const pl: SavedPlaylist = {
      ...result,
      id:      crypto.randomUUID(),
      vibe,
      savedAt: new Date().toISOString(),
    }
    const updated = [pl, ...savedPlaylists].slice(0, 20)
    setSavedPlaylists(updated)
    localStorage.setItem('soundSavedPlaylists', JSON.stringify(updated))
    setSaved(true)
    capture('sound_playlist_archived', { playlist_name: result.playlistName, energy: result.energy })
  }

  // ── Early returns ─────────────────────────────────────────────────────────────

  if (!prefsLoaded) return null

  if (onboarding) {
    return <Onboarding onDone={handleOnboardingDone} />
  }

  if (expandedPl) {
    return (
      <ExpandedPlaylist
        pl={expandedPl}
        prefs={prefs}
        onBack={() => setExpandedPl(null)}
        onDelete={deleteSavedPlaylist}
      />
    )
  }

  const platformLink = prefs?.platform && result && PLATFORM_SEARCH[prefs.platform]
    ? PLATFORM_SEARCH[prefs.platform](result.playlistName)
    : null

  // ── Main render ───────────────────────────────────────────────────────────────

  return (
    <div style={{
      maxWidth: 440, margin: '0 auto',
      padding: '0 16px 40px',
      animation: 'au-tab-switch 0.5s linear',
    }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 52, paddingBottom: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 10,
        }}>
          <p style={{
            fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.28em',
            color: T.gold, textTransform: 'uppercase', opacity: 0.7,
          }}>
            ♩ Sound
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {prefs && (
              <button
                onClick={() => setOnboarding(true)}
                style={{
                  fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.1em',
                  color: T.textMuted, background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, textTransform: 'uppercase',
                  outline: 'none', WebkitTapHighlightColor: 'transparent',
                }}
              >
                Edit profile
              </button>
            )}
            <SoundWaveform active={loading} />
          </div>
        </div>
        <h1 style={{
          fontFamily: T.fontC, fontWeight: 300, fontSize: 32, color: T.textPrimary,
          letterSpacing: '0.02em', lineHeight: 1.2, marginBottom: 8,
        }}>
          Score your aura
        </h1>
        {prefs && (
          <p style={{
            fontFamily: T.fontM, fontSize: 10,
            color: T.textMuted, letterSpacing: '0.04em',
          }}>
            {[prefs.sonic, prefs.era].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* ── Archive ────────────────────────────────────────────────────────── */}
      {savedPlaylists.length > 0 && !result && !loading && (
        <div style={{ marginBottom: 24 }}>
          <p style={{
            fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: T.textMuted, marginBottom: 10,
          }}>
            Your archive · {savedPlaylists.length}
          </p>
          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto',
            scrollbarWidth: 'none',
            marginLeft: -16, marginRight: -16,
            paddingLeft: 16, paddingRight: 16, paddingBottom: 4,
          } as CSSProperties}>
            {savedPlaylists.map(pl => (
              <button
                key={pl.id}
                onClick={() => setExpandedPl(pl)}
                style={{
                  flexShrink: 0, width: 148,
                  background: T.card, border: `0.5px solid ${T.cardBorder}`,
                  borderRadius: 12, padding: '12px 12px 10px',
                  cursor: 'pointer', outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  textAlign: 'left',
                }}
              >
                <MiniWave />
                <p style={{
                  fontFamily: T.fontC, fontStyle: 'italic',
                  fontSize: 13, color: T.textPrimary,
                  letterSpacing: '0.01em', lineHeight: 1.4,
                  marginTop: 7, marginBottom: 4,
                  maxHeight: '2.8em', overflow: 'hidden',
                }}>
                  {pl.playlistName}
                </p>
                <p style={{
                  fontFamily: T.fontM, fontSize: 9,
                  color: T.textMuted, letterSpacing: '0.03em',
                }}>
                  {pl.energy} · {timeAgo(pl.savedAt)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Seeds ──────────────────────────────────────────────────────────── */}
      {!result && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {SEEDS.map(s => (
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
      {!result && (
        <>
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
        </>
      )}

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

          {/* Rationale */}
          {result.rationale && (
            <div style={{
              background: T.card, border: `0.5px solid ${T.goldBorder}`,
              borderRadius: 16, padding: '16px 18px', marginBottom: 10,
              animation: 'au-fade-up 0.5s ease 0.25s both',
            }}>
              <p style={{
                fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: T.gold, opacity: 0.6, marginBottom: 8,
              }}>
                Why this arc
              </p>
              <p style={{
                fontFamily: T.fontC, fontStyle: 'italic',
                fontSize: 15, color: T.textBody, lineHeight: 1.65,
              }}>
                {result.rationale}
              </p>
            </div>
          )}

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
          {(result.artists?.length ?? 0) > 0 && (
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

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginBottom: platformLink ? 8 : 0 }}>
            <button
              onClick={savePlaylist}
              disabled={saved}
              style={{
                flex: 1, padding: '13px',
                background: saved ? 'rgba(196,164,107,0.04)' : T.goldGlow,
                border: `0.5px solid ${saved ? 'rgba(196,164,107,0.08)' : T.goldBorder}`,
                borderRadius: 14, cursor: saved ? 'default' : 'pointer',
                fontFamily: T.fontM, fontSize: 10, letterSpacing: '0.1em',
                color: saved ? 'rgba(196,164,107,0.3)' : T.gold,
                textTransform: 'uppercase', transition: 'all 0.2s ease',
                outline: 'none', WebkitTapHighlightColor: 'transparent',
              }}
            >
              {saved ? 'Archived' : 'Archive'}
            </button>
            <button
              onClick={() => { setResult(null); setVibe(''); setSaved(false) }}
              style={{
                flex: 1, padding: '13px', background: 'none',
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

          {/* Platform link */}
          {platformLink && (
            <a
              href={platformLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => capture('sound_platform_link_tapped', { platform: prefs?.platform })}
              style={{
                display: 'block', width: '100%', padding: '13px',
                background: 'none',
                border: '0.5px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                fontFamily: T.fontM, fontSize: 10, letterSpacing: '0.1em',
                color: T.textSub, textTransform: 'uppercase', textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Search on {prefs?.platform}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
