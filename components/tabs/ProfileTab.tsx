'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AuraEntry {
  id:          string
  created_at:  string
  vibe_input:  string
  output_json: {
    vibeName:   string
    outfit:     { title: string; description: string }
    fragrance:  { title: string; notes: string }
    playlist:   { title: string; tracks: string[] }
    palette:    { hex: string; name: string }[]
    caption:    string
  }
}

interface AuvoraProfile {
  moment: string
  vibe:   string
  focus:  string
}

// ─── Design tokens ─────────────────────────────────────────────────────────────

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

// ─── Helpers ───────────────────────────────────────────────────────────────────

function extractColors(entry: AuraEntry): string[] {
  return (entry.output_json?.palette ?? []).map(p => p.hex).filter(h => /^#[0-9a-fA-F]{6}$/.test(h))
}

function extractTopColors(entries: AuraEntry[]): string[] {
  const freq: Record<string, number> = {}
  entries.forEach(e => {
    extractColors(e).forEach(c => { freq[c] = (freq[c] || 0) + 1 })
  })
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([c]) => c)
}

function timeAgo(dateStr: string): string {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 7)  return `${d} days ago`
  if (d < 30) return `${Math.floor(d / 7)}w ago`
  if (d < 365) return `${Math.floor(d / 30)}mo ago`
  return `${Math.floor(d / 365)}y ago`
}

const MOMENT_LABELS: Record<string, string> = {
  social: 'Night Out', professional: 'Work Mode',
  creative: 'Creative Work', daily: 'Everyday',
}
const VIBE_LABELS: Record<string, string> = {
  bold: 'Bold', soft: 'Soft', sharp: 'Sharp', fluid: 'Fluid',
}
const FOCUS_LABELS: Record<string, string> = {
  look: 'How I Look', feel: 'How I Feel', scent: 'My Scent', sound: 'My Sound',
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      background: T.card, border: `0.5px solid ${T.cardBorder}`,
      borderRadius: 14, padding: '14px 16px', flex: 1, minWidth: 0,
    }}>
      <div style={{
        fontFamily: T.fontM, fontSize: 9,
        letterSpacing: '0.2em', textTransform: 'uppercase',
        color: T.textMuted, marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: T.fontC, fontSize: 26,
        fontWeight: 300, color: T.textPrimary, letterSpacing: '0.02em',
      }}>
        {value}
      </div>
    </div>
  )
}

function ColorDot({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <div title={color} style={{
      width: size, height: size, borderRadius: '50%',
      background: color, border: '0.5px solid rgba(255,255,255,0.08)',
      flexShrink: 0,
    }} />
  )
}

function RecentAuraRow({ entry, onDelete }: { entry: AuraEntry; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const colors = extractColors(entry)

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
      padding: '12px 0',
      borderBottom: '0.5px solid rgba(255,255,255,0.04)',
      animation: 'au-fade-up 0.4s ease both',
    }}>
      {/* Color dots */}
      <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
        {colors.slice(0, 3).map((c, i) => <ColorDot key={i} color={c} size={10} />)}
      </div>

      {/* Vibe text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: T.fontC, fontSize: 14, color: T.textBody,
          letterSpacing: '0.01em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {entry.vibe_input.replace(/\[context:.*?\]/gi, '').trim()}
        </div>
        <div style={{
          fontFamily: T.fontM, fontSize: 10,
          color: T.textMuted, marginTop: 2, letterSpacing: '0.04em',
        }}>
          {timeAgo(entry.created_at)}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px 6px',
          color: deleting ? T.textMuted : 'rgba(122,64,64,0.6)',
          fontFamily: T.fontM, fontSize: 14,
          outline: 'none', WebkitTapHighlightColor: 'transparent',
          transition: 'color 0.2s ease', flexShrink: 0,
        }}
        aria-label="Delete aura"
      >
        {deleting ? '…' : '×'}
      </button>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ProfileTab() {
  const [entries,  setEntries]  = useState<AuraEntry[]>([])
  const [loading,  setLoading]  = useState(true)
  const [profile,  setProfile]  = useState<AuvoraProfile | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auvoraProfile')
      if (raw) setProfile(JSON.parse(raw))
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

  function handleDelete(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function resetOnboarding() {
    localStorage.removeItem('auvoraProfile')
    localStorage.removeItem('auvoraOnboarded')
    window.location.reload()
  }

  const topColors  = extractTopColors(entries)
  const totalAuras = entries.length
  const thisWeek   = entries.filter(e => {
    return (Date.now() - new Date(e.created_at).getTime()) / 86400000 <= 7
  }).length

  // Top recurring words from vibe inputs
  const allWords = entries
    .map(e => e.vibe_input.replace(/\[context:.*?\]/gi, '').toLowerCase())
    .join(' ')
    .split(/\s+/)
    .filter(w => w.length > 4 && !['their', 'about', 'would', 'could', 'should', 'which', 'where', 'there', 'these', 'those'].includes(w))
  const wordFreq: Record<string, number> = {}
  allWords.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1 })
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w)

  return (
    <div style={{
      maxWidth: 440, margin: '0 auto',
      padding: '0 16px 40px',
      animation: 'au-tab-switch 0.5s linear',
    }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 52, paddingBottom: 24 }}>
        <p style={{
          fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.28em',
          color: T.gold, textTransform: 'uppercase', marginBottom: 10, opacity: 0.7,
        }}>
          ○ Your Profile
        </p>
        <h1 style={{
          fontFamily: T.fontC, fontWeight: 300,
          fontSize: 32, color: T.textPrimary,
          letterSpacing: '0.02em', lineHeight: 1.2,
        }}>
          Your aura identity
        </h1>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <StatPill label="Total auras" value={loading ? '—' : totalAuras} />
        <StatPill label="This week"   value={loading ? '—' : thisWeek} />
        <StatPill label="Colors seen" value={loading ? '—' : topColors.length} />
      </div>

      {/* ── Color language ─────────────────────────────────────────────────── */}
      {topColors.length > 0 && (
        <div style={{
          background: T.card, border: `0.5px solid ${T.cardBorder}`,
          borderRadius: 16, padding: '16px 18px', marginBottom: 12,
        }}>
          <p style={{
            fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: T.textMuted, marginBottom: 12,
          }}>
            Your color language
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {topColors.map((c, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <ColorDot color={c} size={28} />
                <span style={{ fontFamily: T.fontM, fontSize: 8, color: T.textMuted }}>
                  {c.slice(1).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recurring energy ───────────────────────────────────────────────── */}
      {topWords.length > 0 && (
        <div style={{
          background: T.card, border: `0.5px solid ${T.cardBorder}`,
          borderRadius: 16, padding: '16px 18px', marginBottom: 12,
        }}>
          <p style={{
            fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: T.textMuted, marginBottom: 12,
          }}>
            Your recurring energy
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {topWords.map((w, i) => (
              <span key={i} style={{
                fontFamily: T.fontC, fontStyle: 'italic',
                fontSize: 15, color: T.textBody,
                background: 'rgba(255,255,255,0.03)',
                border: '0.5px solid rgba(255,255,255,0.06)',
                borderRadius: 20, padding: '4px 12px',
              }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Calibration profile ────────────────────────────────────────────── */}
      {profile && (
        <div style={{
          background: T.goldGlow, border: `0.5px solid ${T.goldBorder}`,
          borderRadius: 16, padding: '16px 18px', marginBottom: 12,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 12,
          }}>
            <p style={{
              fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: T.gold, opacity: 0.7,
            }}>
              ✦ Calibration
            </p>
            <button
              onClick={resetOnboarding}
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
              { label: 'Focus',        value: FOCUS_LABELS[profile.focus]   || profile.focus },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{
                  fontFamily: T.fontM, fontSize: 11,
                  color: T.textMuted, letterSpacing: '0.04em',
                }}>
                  {label}
                </span>
                <span style={{
                  fontFamily: T.fontC, fontSize: 15,
                  color: T.textBody, letterSpacing: '0.02em',
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Aura archive ───────────────────────────────────────────────────── */}
      <div style={{
        background: T.card, border: `0.5px solid ${T.cardBorder}`,
        borderRadius: 16, padding: '16px 18px', marginBottom: 12,
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
                height: 36, borderRadius: 8, marginBottom: 8,
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
              <RecentAuraRow key={e.id} entry={e} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', paddingTop: 12 }}>
        <p style={{
          fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.18em',
          color: 'rgba(196,164,107,0.15)', textTransform: 'uppercase',
        }}>
          AUVORA — Aura Operating System
        </p>
      </div>
    </div>
  )
}
