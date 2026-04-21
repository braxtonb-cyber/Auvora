'use client'

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { capture } from '@/lib/posthog'

// ── Types ──────────────────────────────────────────────────────────────────────

interface StylePrefs {
  expression: string[]
  aesthetic:  string
  fit:        string
  color:      string
}

interface StyleResult {
  concept:   string
  story:     string
  pieces:    string[]
  palette:   string[]
  occasion:  string
  tip:       string
  avoid:     string
  rationale: string | null
}

interface SavedLook extends StyleResult {
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
  bg:         '#060606',
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

// ── Onboarding steps ───────────────────────────────────────────────────────────

interface OnboardStep {
  key:     keyof StylePrefs
  question:string
  sub:     string
  multi:   boolean
  options: string[]
}

const STEPS: OnboardStep[] = [
  {
    key:      'expression',
    question: 'How do you dress yourself?',
    sub:      'Select everything that feels true.',
    multi:    true,
    options:  ['Feminine', 'Androgynous', 'Masculine', 'Fluid', 'Depends on the day'],
  },
  {
    key:      'aesthetic',
    question: 'Your aesthetic signature.',
    sub:      'Choose one direction.',
    multi:    false,
    options:  ['Minimal', 'Structural', 'Romantic', 'Editorial', 'Street-influenced'],
  },
  {
    key:      'fit',
    question: 'How clothes should feel on your body.',
    sub:      'Choose one.',
    multi:    false,
    options:  ['Tailored close', 'Relaxed and easy', 'Deliberately oversized', 'Layered and complex'],
  },
  {
    key:      'color',
    question: 'Your relationship with color.',
    sub:      'Choose one.',
    multi:    false,
    options:  ['All neutrals', 'Earth spectrum', 'Controlled accents', 'Confident bold', 'Open to anything'],
  },
]

const SEEDS = [
  'dinner party at a downtown art gallery',
  'first day at a new creative job',
  'weekend farmers market, relaxed but put together',
  'rooftop evening, confident and warm',
]

// ── Sub-components ─────────────────────────────────────────────────────────────

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
  const valid = (colors || []).filter(c => /^#[0-9a-fA-F]{6}$/.test(c))
  if (!valid.length) return null
  return (
    <div style={{ display: 'flex', gap: 8 }}>
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

function PaletteDots({ colors }: { colors: string[] }) {
  const valid = (colors || []).filter(c => /^#[0-9a-fA-F]{6}$/.test(c))
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {valid.slice(0, 3).map((c, i) => (
        <div key={i} style={{
          width: 12, height: 12, borderRadius: '50%', background: c,
          border: '0.5px solid rgba(255,255,255,0.1)', flexShrink: 0,
        }} />
      ))}
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7)  return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

// ── Onboarding ─────────────────────────────────────────────────────────────────

function Onboarding({ onDone }: { onDone: (prefs: StylePrefs) => void }) {
  const [step,  setStep]  = useState(0)
  const [draft, setDraft] = useState<Partial<StylePrefs>>({})

  function toggle(key: keyof StylePrefs, val: string, multi: boolean) {
    setDraft(prev => {
      if (multi) {
        const arr = (prev[key] as string[] | undefined) || []
        return { ...prev, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] }
      }
      return { ...prev, [key]: val }
    })
  }

  function isSelected(key: keyof StylePrefs, opt: string, multi: boolean) {
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
      onDone(draft as StylePrefs)
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
        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 36 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              height: 2, flex: 1, borderRadius: 2,
              background: i <= step ? T.gold : 'rgba(255,255,255,0.06)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        <p style={{
          fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.28em',
          color: T.gold, textTransform: 'uppercase', marginBottom: 16, opacity: 0.7,
        }}>
          ◈ Style Profile · {step + 1} of {STEPS.length}
        </p>

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

        {/* Options */}
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
          {step < STEPS.length - 1 ? 'Continue' : 'Build my style profile'}
        </button>
      </div>
    </div>
  )
}

// ── Expanded saved look ────────────────────────────────────────────────────────

function ExpandedLook({ look, onBack, onDelete }: {
  look:     SavedLook
  onBack:   () => void
  onDelete: (id: string) => void
}) {
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
          cursor: 'pointer', padding: 0, textTransform: 'uppercase',
          outline: 'none',
        }}>
          ← Moodboard
        </button>
      </div>

      <div style={{
        background: T.card, border: `0.5px solid ${T.cardBorder}`,
        borderRadius: 16, padding: '20px 18px', marginBottom: 10,
      }}>
        <p style={{
          fontFamily: T.fontM, fontSize: 8, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: T.textMuted, marginBottom: 8,
        }}>
          {timeAgo(look.savedAt)} · {look.vibe.slice(0, 48)}{look.vibe.length > 48 ? '…' : ''}
        </p>
        <h2 style={{
          fontFamily: T.fontC, fontWeight: 300, fontSize: 26,
          color: T.textPrimary, letterSpacing: '0.02em', marginBottom: 12,
        }}>
          {look.concept}
        </h2>
        <p style={{
          fontFamily: T.fontC, fontStyle: 'italic',
          fontSize: 15, color: T.textBody, lineHeight: 1.65,
        }}>
          {look.story}
        </p>
      </div>

      {(look.palette?.length ?? 0) > 0 && (
        <div style={{
          background: T.card, border: `0.5px solid ${T.cardBorder}`,
          borderRadius: 16, padding: '16px 18px', marginBottom: 10,
        }}>
          <p style={{
            fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: T.textMuted, marginBottom: 12,
          }}>
            Palette
          </p>
          <SwatchRow colors={look.palette} />
        </div>
      )}

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
        {look.pieces?.map((p, i) => <PieceCard key={i} piece={p} index={i} />)}
      </div>

      {look.rationale && (
        <div style={{
          background: T.card, border: `0.5px solid ${T.goldBorder}`,
          borderRadius: 16, padding: '16px 18px', marginBottom: 10,
        }}>
          <p style={{
            fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: T.gold, opacity: 0.6, marginBottom: 8,
          }}>
            Why this is yours
          </p>
          <p style={{
            fontFamily: T.fontC, fontStyle: 'italic',
            fontSize: 15, color: T.textBody, lineHeight: 1.65,
          }}>
            {look.rationale}
          </p>
        </div>
      )}

      <div style={{
        background: T.card, border: `0.5px solid ${T.cardBorder}`,
        borderRadius: 16, padding: '16px 18px', marginBottom: 10,
      }}>
        {[
          { label: 'Best for',    value: look.occasion },
          { label: 'Stylist tip', value: look.tip },
          { label: 'Avoid',       value: look.avoid },
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
        onClick={() => onDelete(look.id)}
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
        Remove from moodboard
      </button>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function StyleTab() {
  const [prefs,        setPrefs]        = useState<StylePrefs | null>(null)
  const [prefsLoaded,  setPrefsLoaded]  = useState(false)
  const [onboarding,   setOnboarding]   = useState(false)
  const [savedLooks,   setSavedLooks]   = useState<SavedLook[]>([])
  const [expandedLook, setExpandedLook] = useState<SavedLook | null>(null)

  const [vibe,    setVibe]    = useState('')
  const [result,  setResult]  = useState<StyleResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [saved,   setSaved]   = useState(false)

  const [profile, setProfile] = useState<AuvoraProfile | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auvoraProfile')
      if (raw) setProfile(JSON.parse(raw))

      const rawPrefs = localStorage.getItem('stylePrefs')
      if (rawPrefs) {
        setPrefs(JSON.parse(rawPrefs))
      } else {
        setOnboarding(true)
      }

      const rawLooks = localStorage.getItem('styleSavedLooks')
      if (rawLooks) setSavedLooks(JSON.parse(rawLooks))
    } catch { /* ignore */ }
    setPrefsLoaded(true)
  }, [])

  function handleOnboardingDone(completed: StylePrefs) {
    localStorage.setItem('stylePrefs', JSON.stringify(completed))
    setPrefs(completed)
    setOnboarding(false)
    capture('style_onboarding_completed', { aesthetic: completed.aesthetic, fit: completed.fit, color: completed.color })
  }

  function deleteSavedLook(id: string) {
    const updated = savedLooks.filter(l => l.id !== id)
    setSavedLooks(updated)
    localStorage.setItem('styleSavedLooks', JSON.stringify(updated))
    setExpandedLook(null)
  }

  async function generate(vibeOverride?: string) {
    const v = vibeOverride ?? vibe
    if (!v.trim()) return
    if (vibeOverride) setVibe(vibeOverride)
    setLoading(true)
    setError('')
    setResult(null)
    setSaved(false)
    capture('style_generate_started', { has_prefs: !!prefs })

    try {
      const res = await fetch('/api/generate-domain', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ domain: 'style', vibe: v, profile, stylePrefs: prefs }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data as StyleResult)
      capture('style_generate_completed', { concept: (data as StyleResult).concept })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'The signal dropped — try again.')
    } finally {
      setLoading(false)
    }
  }

  function saveLook() {
    if (!result || saved) return
    const look: SavedLook = {
      ...result,
      id:      crypto.randomUUID(),
      vibe,
      savedAt: new Date().toISOString(),
    }
    const updated = [look, ...savedLooks].slice(0, 20)
    setSavedLooks(updated)
    localStorage.setItem('styleSavedLooks', JSON.stringify(updated))
    setSaved(true)
    capture('style_look_saved', { concept: result.concept, total_saved: updated.length })
  }

  // ── Early returns ─────────────────────────────────────────────────────────────

  if (!prefsLoaded) return null

  if (onboarding) {
    return <Onboarding onDone={handleOnboardingDone} />
  }

  if (expandedLook) {
    return (
      <ExpandedLook
        look={expandedLook}
        onBack={() => setExpandedLook(null)}
        onDelete={deleteSavedLook}
      />
    )
  }

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
            ◈ Style
          </p>
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
        </div>
        <h1 style={{
          fontFamily: T.fontC, fontWeight: 300,
          fontSize: 32, color: T.textPrimary,
          letterSpacing: '0.02em', lineHeight: 1.2, marginBottom: 8,
        }}>
          Dress the aura
        </h1>
        {prefs && (
          <p style={{
            fontFamily: T.fontM, fontSize: 10,
            color: T.textMuted, letterSpacing: '0.04em',
          }}>
            {[prefs.aesthetic, prefs.fit].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* ── Moodboard ──────────────────────────────────────────────────────── */}
      {savedLooks.length > 0 && !result && !loading && (
        <div style={{ marginBottom: 24 }}>
          <p style={{
            fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: T.textMuted, marginBottom: 10,
          }}>
            Your moodboard · {savedLooks.length}
          </p>
          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto',
            scrollbarWidth: 'none',
            marginLeft: -16, marginRight: -16,
            paddingLeft: 16, paddingRight: 16, paddingBottom: 4,
          } as CSSProperties}>
            {savedLooks.map(look => (
              <button
                key={look.id}
                onClick={() => setExpandedLook(look)}
                style={{
                  flexShrink: 0, width: 136,
                  background: T.card, border: `0.5px solid ${T.cardBorder}`,
                  borderRadius: 12, padding: '12px 12px 10px',
                  cursor: 'pointer', outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  textAlign: 'left',
                }}
              >
                <PaletteDots colors={look.palette} />
                <p style={{
                  fontFamily: T.fontC, fontStyle: 'italic',
                  fontSize: 13, color: T.textPrimary,
                  letterSpacing: '0.01em', lineHeight: 1.4,
                  marginTop: 8, marginBottom: 4,
                  maxHeight: '2.8em', overflow: 'hidden',
                }}>
                  {look.concept}
                </p>
                <p style={{
                  fontFamily: T.fontM, fontSize: 9,
                  color: T.textMuted, letterSpacing: '0.03em',
                }}>
                  {timeAgo(look.savedAt)}
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
      {!result && (
        <>
          <div style={{ marginBottom: 10 }}>
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
            {loading ? 'Styling your aura…' : 'Build this look'}
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
        <div style={{ animation: 'au-spring-in 0.55s linear' }}>

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
          {(result.palette?.length ?? 0) > 0 && (
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
                Why this is yours
              </p>
              <p style={{
                fontFamily: T.fontC, fontStyle: 'italic',
                fontSize: 15, color: T.textBody, lineHeight: 1.65,
              }}>
                {result.rationale}
              </p>
            </div>
          )}

          {/* Stylist notes */}
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

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={saveLook}
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
              {saved ? 'Saved' : 'Save look'}
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
              New look
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
