'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { capture } from '@/lib/posthog'

// ── Types ──────────────────────────────────────────────────────────────────────

interface StylePrefs {
  aesthetic: string
  fit:       string
  color:     string
  expression:string[]
}

interface SoundPrefs {
  sonic:    string
  era:      string
  platform: string
  contexts: string[]
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

const MOMENT_LABELS: Record<string, string> = {
  social: 'Night Out', professional: 'Work Mode',
  creative: 'Creative Work', daily: 'Everyday',
}
const VIBE_LABELS: Record<string, string> = {
  bold: 'Bold', soft: 'Soft', sharp: 'Sharp', fluid: 'Fluid',
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: T.textMuted, marginBottom: 8,
      }}>
        {label}
      </p>
      <div style={{
        background: T.card, border: `0.5px solid ${T.cardBorder}`,
        borderRadius: 16, padding: '0 18px', overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}

// ── Row ────────────────────────────────────────────────────────────────────────

function Row({
  label, sub, value, action, last = false,
}: {
  label:   string
  sub?:    string
  value?:  string
  action?: React.ReactNode
  last?:   boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', gap: 12,
      padding: '13px 0',
      borderBottom: last ? 'none' : '0.5px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: T.fontM, fontSize: 12,
          color: T.textBody, letterSpacing: '0.02em',
        }}>
          {label}
        </div>
        {sub && (
          <div style={{
            fontFamily: T.fontM, fontSize: 10,
            color: T.textMuted, marginTop: 3, letterSpacing: '0.03em', lineHeight: 1.5,
          }}>
            {sub}
          </div>
        )}
      </div>
      {value && (
        <div style={{
          fontFamily: T.fontC, fontSize: 13,
          color: T.textSub, textAlign: 'right',
          maxWidth: '45%', lineHeight: 1.4, flexShrink: 0,
        }}>
          {value}
        </div>
      )}
      {action}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function SettingsView({ onBack }: { onBack: () => void }) {
  const [userId,      setUserId]      = useState<string | null>(null)
  const [stylePrefs,  setStylePrefs]  = useState<StylePrefs | null>(null)
  const [soundPrefs,  setSoundPrefs]  = useState<SoundPrefs | null>(null)
  const [auProfile,   setAuProfile]   = useState<AuvoraProfile | null>(null)
  const [confirm,     setConfirm]     = useState<string | null>(null)
  const [savedLooksCount,     setSavedLooksCount]     = useState(0)
  const [savedPlaylistsCount, setSavedPlaylistsCount] = useState(0)

  useEffect(() => {
    capture('settings_opened')
    try {
      const sp = localStorage.getItem('stylePrefs')
      if (sp) setStylePrefs(JSON.parse(sp))

      const snp = localStorage.getItem('soundPrefs')
      if (snp) setSoundPrefs(JSON.parse(snp))

      const ap = localStorage.getItem('auvoraProfile')
      if (ap) setAuProfile(JSON.parse(ap))

      const looks = localStorage.getItem('styleSavedLooks')
      if (looks) setSavedLooksCount((JSON.parse(looks) as unknown[]).length)

      const pls = localStorage.getItem('soundSavedPlaylists')
      if (pls) setSavedPlaylistsCount((JSON.parse(pls) as unknown[]).length)
    } catch { /* ignore */ }

    createClient().auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null)
    })
  }, [])

  function act(key: string, fn: () => void) {
    if (confirm === key) {
      fn()
      setConfirm(null)
    } else {
      setConfirm(key)
    }
  }

  function ActionBtn({ id, label, danger = false }: { id: string; danger?: boolean; label: string }) {
    const isActive = confirm === id
    return (
      <button
        onClick={() => act(id, () => {
          if (id === 'reset-style') {
            capture('settings_style_reset')
            localStorage.removeItem('stylePrefs')
            setStylePrefs(null)
          } else if (id === 'reset-sound') {
            capture('settings_sound_reset')
            localStorage.removeItem('soundPrefs')
            setSoundPrefs(null)
          } else if (id === 'reset-aura') {
            localStorage.removeItem('auvoraProfile')
            localStorage.removeItem('auvoraOnboarded')
            setAuProfile(null)
          } else if (id === 'clear-looks') {
            localStorage.removeItem('styleSavedLooks')
            setSavedLooksCount(0)
          } else if (id === 'clear-playlists') {
            localStorage.removeItem('soundSavedPlaylists')
            setSavedPlaylistsCount(0)
          } else if (id === 'reset-all') {
            capture('settings_full_reset')
            createClient().auth.signOut().finally(() => {
              localStorage.clear()
              window.location.reload()
            })
          }
        })}
        style={{
          fontFamily: T.fontM, fontSize: 9, letterSpacing: '0.08em',
          color: isActive
            ? 'rgba(200,100,100,0.75)'
            : danger ? 'rgba(200,100,100,0.45)' : T.textMuted,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, textTransform: 'uppercase', flexShrink: 0,
          outline: 'none', WebkitTapHighlightColor: 'transparent',
          transition: 'color 0.15s ease',
        }}
      >
        {isActive ? 'Confirm?' : label}
      </button>
    )
  }

  return (
    <div style={{
      maxWidth: 440, margin: '0 auto',
      padding: '0 16px 40px',
      animation: 'au-spring-in 0.45s linear',
    }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 52, marginBottom: 28 }}>
        <button onClick={onBack} style={{
          fontFamily: T.fontM, fontSize: 10, letterSpacing: '0.1em',
          color: T.textMuted, background: 'none', border: 'none',
          cursor: 'pointer', padding: 0, textTransform: 'uppercase',
          outline: 'none', marginBottom: 20,
          WebkitTapHighlightColor: 'transparent',
        }}>
          ← Profile
        </button>
        <h1 style={{
          fontFamily: T.fontC, fontWeight: 300,
          fontSize: 32, color: T.textPrimary,
          letterSpacing: '0.02em', lineHeight: 1.2,
        }}>
          Settings
        </h1>
      </div>

      {/* ── Account ────────────────────────────────────────────────────────── */}
      <Section label="Account">
        <Row
          label="Account type"
          sub="No email or sign-in required"
          value="Anonymous"
        />
        <Row
          label="Your ID"
          sub="Share with support if you need help"
          value={userId ? userId.slice(0, 12) + '…' : '—'}
          last
        />
      </Section>

      {/* ── Personalization ────────────────────────────────────────────────── */}
      <Section label="Personalization">
        <Row
          label="Aura calibration"
          sub={auProfile ? `${MOMENT_LABELS[auProfile.moment] || auProfile.moment} · ${VIBE_LABELS[auProfile.vibe] || auProfile.vibe}` : 'Not calibrated — complete onboarding'}
          action={<ActionBtn id="reset-aura" label="Reset" />}
        />
        <Row
          label="Style profile"
          sub={stylePrefs
            ? `${[stylePrefs.aesthetic, stylePrefs.fit].filter(Boolean).join(' · ')}`
            : 'Not set — go to Style tab'}
          action={stylePrefs ? <ActionBtn id="reset-style" label="Reset" /> : undefined}
        />
        <Row
          label="Sound profile"
          sub={soundPrefs
            ? `${[soundPrefs.sonic, soundPrefs.era].filter(Boolean).join(' · ')}`
            : 'Not set — go to Sound tab'}
          action={soundPrefs ? <ActionBtn id="reset-sound" label="Reset" /> : undefined}
        />
        <Row
          label="Saved looks"
          value={savedLooksCount > 0 ? `${savedLooksCount} saved` : 'None'}
          action={savedLooksCount > 0 ? <ActionBtn id="clear-looks" label="Clear" danger /> : undefined}
        />
        <Row
          label="Archived playlists"
          value={savedPlaylistsCount > 0 ? `${savedPlaylistsCount} archived` : 'None'}
          action={savedPlaylistsCount > 0 ? <ActionBtn id="clear-playlists" label="Clear" danger /> : undefined}
          last
        />
      </Section>

      {/* ── Privacy ────────────────────────────────────────────────────────── */}
      <Section label="Privacy">
        <Row
          label="Aura sessions"
          sub="Stored anonymously in the cloud — not linked to your identity"
          value="Anonymous"
        />
        <Row
          label="Style & Sound prefs"
          sub="Stored on this device only — never sent to a server"
          value="On-device"
        />
        <Row
          label="No tracking"
          sub="No email, name, location, or behavioral profiling"
          value="None"
          last
        />
      </Section>

      {/* ── About ──────────────────────────────────────────────────────────── */}
      <Section label="About">
        <Row label="AUVORA" value="Version 0.1" />
        <Row label="Made by" value="Brogan Atelier" />
        <Row
          label="What this is"
          sub="A personal aura OS — style, scent, sound, and self — curated by AI, authored by you."
          last
        />
      </Section>

      {/* ── Reset all ──────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 8 }}>
        <Section label="Danger zone">
          <Row
            label="Reset everything"
            sub="Clears all data and starts fresh. Cannot be undone."
            action={<ActionBtn id="reset-all" label="Reset" danger />}
            last
          />
        </Section>
      </div>

      {/* ── Brand footer ───────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', paddingTop: 16 }}>
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
