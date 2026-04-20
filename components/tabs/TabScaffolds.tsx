// ─── components/tabs/ComingSoonTab.tsx ───────────────────────────────────────
// Shared "coming soon" shell for unbuilt tabs.
// Each tab gets its own identity but uses this base.
'use client'

const T = {
  textPrimary: '#f0ebe3',
  textSub:     '#8a8278',
  textMuted:   '#4a4540',
  gold:        '#c4a46b',
  goldBorder:  'rgba(196,164,107,0.15)',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

interface ComingSoonTabProps {
  icon: string
  title: string
  sub: string
  teaser: string
  phase: string
}

export function ComingSoonTab({ icon, title, sub, teaser, phase }: ComingSoonTabProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px 28px',
        textAlign: 'center',
        animation: 'au-fade-up 0.5s ease forwards',
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: 32,
          marginBottom: 20,
          opacity: 0.5,
          fontFamily: T.fontC,
        }}
      >
        {icon}
      </div>

      {/* Phase label */}
      <p style={{
        fontFamily: T.fontM, fontSize: 9,
        letterSpacing: '0.28em', color: T.gold,
        textTransform: 'uppercase', marginBottom: 14,
        opacity: 0.5,
      }}>
        {phase}
      </p>

      {/* Title */}
      <h2 style={{
        fontFamily: T.fontC, fontWeight: 300,
        fontSize: 30, color: T.textPrimary,
        letterSpacing: '0.02em', marginBottom: 10,
      }}>
        {title}
      </h2>

      {/* Sub */}
      <p style={{
        fontFamily: T.fontM, fontSize: 12,
        color: T.textSub, letterSpacing: '0.04em',
        lineHeight: 1.6, marginBottom: 24, maxWidth: 260,
      }}>
        {sub}
      </p>

      {/* Divider ornament */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 10, marginBottom: 24,
      }}>
        <div style={{ width: 20, height: 0.5, background: T.goldBorder }} />
        <div style={{ width: 3, height: 3, borderRadius: '50%', background: T.goldBorder }} />
        <div style={{ width: 20, height: 0.5, background: T.goldBorder }} />
      </div>

      {/* Teaser */}
      <p style={{
        fontFamily: T.fontC, fontStyle: 'italic',
        fontSize: 16, color: T.textMuted,
        letterSpacing: '0.02em', lineHeight: 1.6,
        maxWidth: 280,
      }}>
        {teaser}
      </p>
    </div>
  )
}

// ─── Individual tab exports ────────────────────────────────────────────────────

export function StyleTab() {
  return (
    <ComingSoonTab
      icon="◈"
      title="Your Style Aura"
      sub="Outfit curation powered by your aura profile and the moment you're entering."
      teaser="Imagine your wardrobe knowing your mood before you open it."
      phase="Coming in Phase 2"
    />
  )
}

export function ScentTab() {
  return (
    <ComingSoonTab
      icon="◉"
      title="Your Scent Profile"
      sub="Fragrance recommendations calibrated to your aura, season, and occasion."
      teaser="The right scent is the invisible part of your presence."
      phase="Coming in Phase 2"
    />
  )
}

export function SoundTab() {
  return (
    <ComingSoonTab
      icon="♩"
      title="Your Sound Space"
      sub="Curated playlists and sonic atmospheres that hold your aura's frequency."
      teaser="Music is the only aura you can share with a room."
      phase="Coming in Phase 3"
    />
  )
}

export function ProfileTab() {
  return (
    <ComingSoonTab
      icon="○"
      title="Your Aura Profile"
      sub="Your identity over time — patterns, evolution, and the deeper you."
      teaser="Who you are becoming is more interesting than who you were."
      phase="Coming in Phase 2"
    />
  )
}
