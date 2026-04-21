'use client'

import type { ScentProfile } from '@/lib/scent/types'

interface ScentIdentityCardProps {
  profile: ScentProfile
}

const T = {
  card: '#0d0d0d',
  cardBorder: 'rgba(255,255,255,0.05)',
  textPrimary: '#f0ebe3',
  textBody: '#c8c2b8',
  textSub: '#8a8278',
  textMuted: '#4a4540',
  gold: '#c4a46b',
  goldBorder: 'rgba(196,164,107,0.2)',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        border: '0.5px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 20,
        padding: '5px 10px',
        fontFamily: T.fontM,
        fontSize: 10,
        color: T.textSub,
        letterSpacing: '0.03em',
      }}
    >
      {children}
    </span>
  )
}

export default function ScentIdentityCard({ profile }: ScentIdentityCardProps) {
  const identity = profile.identity

  return (
    <div
      style={{
        background: T.card,
        border: `0.5px solid ${T.cardBorder}`,
        borderRadius: 16,
        padding: '18px',
        marginBottom: 10,
      }}
    >
      <p
        style={{
          fontFamily: T.fontM,
          fontSize: 9,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: T.gold,
          opacity: 0.65,
          marginBottom: 6,
        }}
      >
        Identity Card
      </p>

      <h2
        style={{
          fontFamily: T.fontC,
          fontWeight: 300,
          fontSize: 28,
          color: T.textPrimary,
          lineHeight: 1.2,
          marginBottom: 8,
        }}
      >
        {identity.scentPersonality}
      </h2>

      <p
        style={{
          fontFamily: T.fontC,
          fontStyle: 'italic',
          fontSize: 16,
          color: T.textBody,
          lineHeight: 1.6,
          marginBottom: 12,
        }}
      >
        You lean {identity.supportingTraits.slice(0, 2).join(', ').toLowerCase()}.
      </p>

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>
          Signature direction
        </p>
        <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textBody, lineHeight: 1.55, letterSpacing: '0.03em' }}>
          {profile.preferences.signatureDirection}
        </p>
      </div>

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>
          Signature families
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {identity.signatureFamilies.map((family) => (
            <Pill key={family}>{family}</Pill>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>
          Wardrobe strengths
        </p>
        {identity.wardrobeStrengths.map((line) => (
          <p key={line} style={{ fontFamily: T.fontM, fontSize: 10, color: T.textSub, lineHeight: 1.55, letterSpacing: '0.03em' }}>
            {line}
          </p>
        ))}
      </div>

      <div>
        <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>
          Current gaps
        </p>
        {identity.wardrobeGaps.map((gap) => (
          <p key={gap} style={{ fontFamily: T.fontM, fontSize: 10, color: T.textSub, lineHeight: 1.55, letterSpacing: '0.03em' }}>
            {gap}
          </p>
        ))}
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '14px 0 10px' }} />

      <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textMuted, letterSpacing: '0.02em', marginBottom: 4 }}>
        {profile.identity.confidenceNotes[0]}
      </p>
      <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textMuted, letterSpacing: '0.02em' }}>
        Preferred moods: {profile.preferences.preferredMoods.slice(0, 3).join(', ') || 'not set'}
      </p>
    </div>
  )
}
