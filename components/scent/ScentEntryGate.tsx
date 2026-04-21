'use client'

interface ScentEntryGateProps {
  onStart: () => void
  onSkip: () => void
}

const T = {
  card: '#0d0d0d',
  cardBorder: 'rgba(255,255,255,0.05)',
  textPrimary: '#f0ebe3',
  textBody: '#c8c2b8',
  textSub: '#8a8278',
  gold: '#c4a46b',
  goldGlow: 'rgba(196,164,107,0.08)',
  goldBorder: 'rgba(196,164,107,0.2)',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

export default function ScentEntryGate({ onStart, onSkip }: ScentEntryGateProps) {
  return (
    <div style={{ paddingTop: 52, animation: 'au-tab-switch 0.35s ease' }}>
      <p
        style={{
          fontFamily: T.fontM,
          fontSize: 9,
          letterSpacing: '0.28em',
          color: T.gold,
          textTransform: 'uppercase',
          marginBottom: 12,
          opacity: 0.72,
        }}
      >
        ◉ Scent Routine
      </p>

      <div
        style={{
          background: T.card,
          border: `0.5px solid ${T.cardBorder}`,
          borderRadius: 18,
          padding: '24px 20px',
          marginBottom: 12,
        }}
      >
        <h1
          style={{
            fontFamily: T.fontC,
            fontWeight: 300,
            fontSize: 32,
            lineHeight: 1.2,
            color: T.textPrimary,
            marginBottom: 10,
          }}
        >
          Build your scent profile once.
        </h1>
        <p
          style={{
            fontFamily: T.fontM,
            fontSize: 11,
            color: T.textSub,
            letterSpacing: '0.03em',
            lineHeight: 1.7,
          }}
        >
          AUVORA will use your wardrobe, wear habits, identity, and gaps to advise from profile instead of starting from zero.
        </p>
      </div>

      <button
        onClick={onStart}
        style={{
          width: '100%',
          padding: '14px',
          background: T.goldGlow,
          border: `0.5px solid ${T.goldBorder}`,
          borderRadius: 14,
          cursor: 'pointer',
          fontFamily: T.fontM,
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: T.gold,
          marginBottom: 10,
        }}
      >
        Start routine
      </button>

      <button
        onClick={onSkip}
        style={{
          width: '100%',
          padding: '12px',
          background: 'none',
          border: '0.5px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          cursor: 'pointer',
          fontFamily: T.fontM,
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: T.textSub,
        }}
      >
        Skip for now
      </button>
    </div>
  )
}
