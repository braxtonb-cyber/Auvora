'use client'

interface ScentEmptyStateProps {
  title: string
  body: string
}

const T = {
  card: '#0d0d0d',
  cardBorder: 'rgba(255,255,255,0.05)',
  textPrimary: '#f0ebe3',
  textSub: '#8a8278',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

export default function ScentEmptyState({ title, body }: ScentEmptyStateProps) {
  return (
    <div
      style={{
        background: T.card,
        border: `0.5px solid ${T.cardBorder}`,
        borderRadius: 16,
        padding: '16px 18px',
      }}
    >
      <p
        style={{
          fontFamily: T.fontM,
          fontSize: 9,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(196,164,107,0.6)',
          marginBottom: 6,
        }}
      >
        Scent
      </p>
      <h3
        style={{
          fontFamily: T.fontC,
          fontWeight: 300,
          fontSize: 24,
          color: T.textPrimary,
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: T.fontM,
          fontSize: 11,
          color: T.textSub,
          lineHeight: 1.7,
          letterSpacing: '0.03em',
        }}
      >
        {body}
      </p>
    </div>
  )
}
