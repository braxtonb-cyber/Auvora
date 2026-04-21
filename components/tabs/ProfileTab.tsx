'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────────

interface AuraEntry {
  id:          string
  created_at:  string
  vibe_input:  string
  output_json: {
    vibeName:  string
    palette:   { hex: string; name: string }[]
  }
}

interface AuvoraProfile {
  moment: string
  vibe:   string
  focus:  string
}

interface StylePrefs {
  expression: string[]
  aesthetic:  string
  fit:        string
  color:      string
}

interface SoundPrefs {
  contexts: string[]
  sonic:    string
  era:      string
  platform: string
}

interface SavedLook {
  id:      string
  concept: string
  savedAt: string
}

interface SavedPlaylist {
  id:          string
  playlistName:string
  energy:      string
  savedAt:     string
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

const MOMENT_LABELS: Record<string, string> = {
  social: 'Night Out', professional: 'Work Mode',
  creative: 'Creative Work', daily: 'Everyday',
}
const VIBE_LABELS: Record<string, string> = {
  bold: 'Bold', soft: 'Soft', sharp: 'Sharp', fluid: 'Fluid',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d < 7)  return `${d}d ago`
  if (d < 30) return `${Math.floor(d / 7)}w ago`
  return `${Math.floor(d / 30)}mo ago`
}

function extractColors(entries: AuraEntry[]): string[] {
  const freq: Record<string, number> = {}
  entries.forEach(e => {
    (e.output_json?.palette ?? []).forEach(p => {
      if (/^#[0-9a-fA-F]{6}$/.test(p.hex)) {
        freq[p.hex] = (freq[p.hex] || 0) + 1
      }
    })
  })
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([c]) => c)
}

function extractTopWords(entries: AuraEntry[]): string[] {
  const STOP = new Set([
    'their','about','would','could','should','which','where','there',
    'these','those','being','having','something','feeling','going','want',
    'need','that','this','with','from','just','some','like','feel',
  ])
  const freq: Record<string, number> = {}
  entries
    .map(e => e.vibe_input.replace(/\[context:.*?\]/gi, '').toLowerCase())
    .join(' ')
    .split(/\s+/)
    .filter(w => w.length > 4 && !STOP.has(w))
    .forEach(w => { freq[w] = (freq[w] || 0) + 1 })
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w)
}

function buildIdentityParagraph(
  stylePrefs: StylePrefs | null,
  soundPrefs: SoundPrefs | null,
  topWords:   string[],
  entries:    AuraEntry[],
): string | null {
  const parts: string[] = []

  if (stylePrefs) {
    parts.push(
      `Visually, you operate in a ${(stylePrefs.aesthetic || 'considered').toLowerCase()} register — ` +
      `${(stylePrefs.fit || '').toLowerCase()}, ` +
      `${(stylePrefs.color || '').toLowerCase()}.`
    )
  }

  if (soundPrefs) {
    const contexts = (soundPrefs.contexts || []).slice(0, 2).map(c => c.toLowerCase()).join(' and ')
    const eraNote  = soundPrefs.era && soundPrefs.era !== 'Spanning all eras'
      ? `, rooted in ${soundPrefs.era.toLowerCase()}`
      : ''
    parts.push(
      `Sonically, you gravitate toward ${(soundPrefs.sonic || 'curated').toLowerCase()} textures${eraNote}` +
      `${contexts ? `, most often for ${contexts}` : ''}.`
    )
  }

  if (topWords.length >= 3 && entries.length >= 3) {
    parts.push(
      `Your aura returns to ${topWords.slice(0, 3).join(', ')} — ` +
      `a consistent signal across ${entries.length} recorded moment${entries.length === 1 ? '' : 's'}.`
    )
  }

  return parts.length > 0 ? parts.join(' ') : null
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function AuraRow({ entry, onDelete }: { entry: AuraEntry; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const colors = (entry.output_json?.palette ?? [])
    .map(p => p.hex)
    .filter(h => /^#[0-9a-fA-F]{6}$/.test(h))

  async function handleDelete() {
    setDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from('aura_entries').delete().eq('id', entry.id)
      onDelete(entry.id)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 0',
      borderBottom: '0.5px solid rgba(255,255,255,0.04)',
      animation: 'au-fade-up 0.4s ease both',
    }}>
      <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
        {colors.slice(0, 3).map((c, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%', background: c,
            border: '0.5px solid rgba(255,255,255,0.08)',
          }} />
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: T.fontC, fontSize: 14, color: T.textBody,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {entry.vibe_input.replace(/\[context:.*?\]/gi, '').trim()}
        </div>
        <div style={{
          fontFamily: T.fontM, fontSize: 9, color: T.textMuted,
          marginTop: 2, letterSpacing: '0.04em',
        }}>
          {timeAgo(entry.created_at)}
        </div>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px 6px',
          color: deleting ? T.textMuted : 'rgba(122,64,64,0.5)',
          fontFamily: T.fontM, fontSize: 14,
          outline: 'none', WebkitTapHighlightColor: 'transparent',
          flexShrink: 0,
        }}
        aria-label="Delete"
      >
        {deleting ? '…' : '×'}
      </button>
    </div>
  )
}

function IdentityCard({
  icon, label, summary, lastItem, count, countLabel, emptyText,
}: {
  icon:       string
  label:      string
  summary:    string | null
  lastItem:   { name: string; time: string } | null
  count:      number
  countLabel: string
  emptyText:  string
}) {
  return (
    <div style={{
      background: T.card, border: `0.5px solid ${T.cardBorder}`,
      borderRadius: 16, padding: '16px 18px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{
          fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.28em',
          color: T.gold, textTransform: 'uppercase', opacity: 0.7,
        }}>
          {icon} {label}
        </p>
        <span style={{
          fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.08em',
          color: T.textMuted,
        }}>
          {count > 0 ? `${count} ${countLabel}` : ''}
        </span>
      </div>

      {summary ? (
        <p style={{
          fontFamily: T.fontM, fontSize: 10, letterSpacing: '0.04em',
          color: T.textSub, lineHeight: 1.7, marginBottom: lastItem ? 12 : 0,
        }}>
          {summary}
        </p>
      ) : (
        <p style={{
          fontFamily: T.fontC, fontStyle: 'italic',
          fontSize: 14, color: T.textMuted, lineHeight: 1.5,
          marginBottom: 0,
        }}>
          {emptyText}
        </p>
      )}

      {lastItem && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 10, borderTop: '0.5px solid rgba(255,255,255,0.04)',
        }}>
          <span style={{
            fontFamily: T.fontC, fontStyle: 'italic',
            fontSize: 13, color: T.textBody, letterSpacing: '0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '75%',
          }}>
            {lastItem.name}
          </span>
          <span style={{
            fontFamily: T.fontM, fontSize: 9,
            color: T.textMuted, letterSpacing: '0.03em', flexShrink: 0,
          }}>
            {lastItem.time}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ProfileTab() {
  const [entries,  setEntries]  = useState<AuraEntry[]>([])
  const [loading,  setLoading]  = useState(true)
  const [profile,  setProfile]  = useState<AuvoraProfile | null>(null)
  const [stylePrefs, setStylePrefs] = useState<StylePrefs | null>(null)
  const [soundPrefs, setSoundPrefs] = useState<SoundPrefs | null>(null)
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([])
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([])
  const [resetConfirm, setResetConfirm] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auvoraProfile')
      if (raw) setProfile(JSON.parse(raw))

      const rawStyle = localStorage.getItem('stylePrefs')
      if (rawStyle) setStylePrefs(JSON.parse(rawStyle))

      const rawSound = localStorage.getItem('soundPrefs')
      if (rawSound) setSoundPrefs(JSON.parse(rawSound))

      const rawLooks = localStorage.getItem('styleSavedLooks')
      if (rawLooks) setSavedLooks(JSON.parse(rawLooks))

      const rawPl = localStorage.getItem('soundSavedPlaylists')
      if (rawPl) setSavedPlaylists(JSON.parse(rawPl))
    } catch { /* ignore */ }

    loadEntries()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadEntries() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('aura_entries')
        .select('id, created_at, vibe_input, output_json')
        .order('created_at', { ascending: false })
        .limit(50)
      setEntries((data ?? []) as AuraEntry[])
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  function handleDeleteEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  async function handleReset() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch { /* ignore */ }
    localStorage.clear()
    window.location.reload()
  }

  // ── Derived data ────────────────────────────────────────────────────────────

  const topColors  = extractColors(entries)
  const topWords   = extractTopWords(entries)
  const totalAuras = entries.length
  const thisWeek   = entries.filter(
    e => (Date.now() - new Date(e.created_at).getTime()) / 86400000 <= 7
  ).length

  const identityParagraph = buildIdentityParagraph(stylePrefs, soundPrefs, topWords, entries)

  const styleSummary = stylePrefs
    ? [stylePrefs.aesthetic, stylePrefs.fit, stylePrefs.color].filter(Boolean).join(' · ')
    : null

  const soundSummary = soundPrefs
    ? [soundPrefs.sonic, soundPrefs.era].filter(Boolean).join(' · ')
    : null

  const lastLook = savedLooks[0]
    ? { name: savedLooks[0].concept, time: timeAgo(savedLooks[0].savedAt) }
    : null

  const lastPlaylist = savedPlaylists[0]
    ? { name: savedPlaylists[0].playlistName, time: timeAgo(savedPlaylists[0].savedAt) }
    : null

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{
      maxWidth: 440, margin: '0 auto',
      padding: '0 16px 40px',
      animation: 'au-tab-switch 0.5s linear',
    }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 52, paddingBottom: 28 }}>
        <p style={{
          fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.28em',
          color: T.gold, textTransform: 'uppercase', marginBottom: 12, opacity: 0.7,
        }}>
          ○ Profile
        </p>
        <h1 style={{
          fontFamily: T.fontC, fontWeight: 300,
          fontSize: 32, color: T.textPrimary,
          letterSpacing: '0.02em', lineHeight: 1.2, marginBottom: 16,
        }}>
          Your AUVORA identity
        </h1>

        {/* Identity paragraph */}
        {identityParagraph && (
          <p style={{
            fontFamily: T.fontC, fontStyle: 'italic',
            fontSize: 15, color: T.textBody,
            lineHeight: 1.75, letterSpacing: '0.01em',
          }}>
            {identityParagraph}
          </p>
        )}

        {!identityParagraph && (
          <p style={{
            fontFamily: T.fontC, fontStyle: 'italic',
            fontSize: 15, color: T.textMuted, lineHeight: 1.65,
          }}>
            Complete your Style and Sound profiles to build your identity portrait.
          </p>
        )}
      </div>

      {/* ── Aura stats strip ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 10,
      }}>
        {[
          { label: 'Auras', value: loading ? '—' : String(totalAuras) },
          { label: 'This week', value: loading ? '—' : String(thisWeek) },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: T.card, border: `0.5px solid ${T.cardBorder}`,
            borderRadius: 14, padding: '12px 16px', flex: 1,
          }}>
            <div style={{
              fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: T.textMuted, marginBottom: 6,
            }}>
              {label}
            </div>
            <div style={{
              fontFamily: T.fontC, fontSize: 24,
              fontWeight: 300, color: T.textPrimary, letterSpacing: '0.02em',
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Style identity ─────────────────────────────────────────────────── */}
      <IdentityCard
        icon="◈"
        label="Style"
        summary={styleSummary}
        lastItem={lastLook}
        count={savedLooks.length}
        countLabel={savedLooks.length === 1 ? 'look saved' : 'looks saved'}
        emptyText="Build your style profile in the Style tab."
      />

      {/* ── Sound identity ─────────────────────────────────────────────────── */}
      <IdentityCard
        icon="♩"
        label="Sound"
        summary={soundSummary}
        lastItem={lastPlaylist}
        count={savedPlaylists.length}
        countLabel={savedPlaylists.length === 1 ? 'playlist archived' : 'playlists archived'}
        emptyText="Build your sound profile in the Sound tab."
      />

      {/* ── Color language ─────────────────────────────────────────────────── */}
      {topColors.length > 0 && (
        <div style={{
          background: T.card, border: `0.5px solid ${T.cardBorder}`,
          borderRadius: 16, padding: '16px 18px', marginBottom: 10,
        }}>
          <p style={{
            fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: T.textMuted, marginBottom: 14,
          }}>
            Your color language
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {topColors.map((c, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: c,
                  border: '0.5px solid rgba(255,255,255,0.08)',
                }} />
                <span style={{ fontFamily: T.fontM, fontSize: 8, color: T.textMuted }}>
                  {c.slice(1).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Aura archive ───────────────────────────────────────────────────── */}
      <div style={{
        background: T.card, border: `0.5px solid ${T.cardBorder}`,
        borderRadius: 16, padding: '16px 18px', marginBottom: 10,
      }}>
        <p style={{
          fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: T.textMuted, marginBottom: 4,
        }}>
          Aura archive
        </p>

        {loading ? (
          <div style={{ paddingTop: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 34, borderRadius: 8, marginBottom: 8,
                background: 'linear-gradient(90deg, #111 0px, #1a1916 60px, #111 120px)',
                backgroundSize: '400px 100%',
                animation: `au-shimmer 1.6s ease-in-out ${i * 0.1}s infinite`,
              }} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p style={{
            fontFamily: T.fontC, fontStyle: 'italic',
            fontSize: 15, color: T.textMuted, paddingTop: 12,
          }}>
            Your saved auras will appear here.
          </p>
        ) : (
          <div>
            {entries.map(e => (
              <AuraRow key={e.id} entry={e} onDelete={handleDeleteEntry} />
            ))}
          </div>
        )}
      </div>

      {/* ── Calibration ────────────────────────────────────────────────────── */}
      {profile && (
        <div style={{
          background: T.goldGlow, border: `0.5px solid ${T.goldBorder}`,
          borderRadius: 16, padding: '16px 18px', marginBottom: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{
              fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: T.gold, opacity: 0.7,
            }}>
              ✦ Aura calibration
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('auvoraProfile')
                localStorage.removeItem('auvoraOnboarded')
                window.location.reload()
              }}
              style={{
                fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.08em',
                color: T.textMuted, background: 'none', border: 'none',
                cursor: 'pointer', outline: 'none',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(74,69,64,0.4)',
              }}
            >
              Recalibrate
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Moment',       value: MOMENT_LABELS[profile.moment] || profile.moment },
              { label: 'Natural vibe', value: VIBE_LABELS[profile.vibe]     || profile.vibe },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: T.fontM, fontSize: 11, color: T.textMuted, letterSpacing: '0.04em',
                }}>
                  {label}
                </span>
                <span style={{
                  fontFamily: T.fontC, fontSize: 15, color: T.textBody, letterSpacing: '0.02em',
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Reset ──────────────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 8, marginBottom: 24 }}>
        {resetConfirm ? (
          <button
            onClick={handleReset}
            style={{
              width: '100%', padding: '12px',
              background: 'rgba(180,60,60,0.06)',
              border: '0.5px solid rgba(180,60,60,0.2)',
              borderRadius: 14, cursor: 'pointer',
              fontFamily: T.fontM, fontSize: 10, letterSpacing: '0.1em',
              color: 'rgba(200,100,100,0.7)', textTransform: 'uppercase',
              outline: 'none', WebkitTapHighlightColor: 'transparent',
            }}
          >
            Confirm — this clears all your data
          </button>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            style={{
              width: '100%', padding: '12px',
              background: 'none', border: '0.5px solid rgba(255,255,255,0.04)',
              borderRadius: 14, cursor: 'pointer',
              fontFamily: T.fontM, fontSize: 10, letterSpacing: '0.1em',
              color: T.textMuted, textTransform: 'uppercase',
              outline: 'none', WebkitTapHighlightColor: 'transparent',
            }}
          >
            Reset profile
          </button>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <p style={{
          fontFamily: T.fontD, fontSize: 11, letterSpacing: '0.18em',
          color: 'rgba(196,164,107,0.12)', textTransform: 'uppercase',
        }}>
          AUVORA by Brogan Atelier
        </p>
      </div>

    </div>
  )
}
