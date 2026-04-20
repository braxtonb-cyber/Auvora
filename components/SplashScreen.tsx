'use client'

import { useEffect, useState } from 'react'

// Shows once per browser session (not once ever — refreshing gives the experience again)
// Change to localStorage if you want truly once-per-device behavior

interface SplashScreenProps {
  onComplete: () => void
}

const LETTERS = 'AUVORA'.split('')

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'entering' | 'holding' | 'exiting'>('entering')

  useEffect(() => {
    // Letter stagger: 6 letters × 90ms = 540ms
    // Then shimmer: 400ms
    // Hold: 500ms
    // Exit: 600ms
    const holdTimer = setTimeout(() => setPhase('holding'), 980)
    const exitTimer = setTimeout(() => setPhase('exiting'), 1480)
    const doneTimer = setTimeout(() => onComplete(), 2080)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#060606',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        opacity: phase === 'exiting' ? 0 : 1,
        transition: phase === 'exiting' ? 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* Ambient glow behind wordmark */}
      <div
        style={{
          position: 'absolute',
          width: 280,
          height: 120,
          background: 'radial-gradient(ellipse, rgba(196,164,107,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'au-splash-glow 2s ease-in-out infinite',
        }}
      />

      {/* Wordmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          position: 'relative',
        }}
      >
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", serif',
              fontWeight: 300,
              fontSize: 'clamp(42px, 10vw, 56px)',
              letterSpacing: '0.18em',
              color: '#c4a46b',
              opacity: 0,
              transform: 'translateY(14px)',
              display: 'inline-block',
              // Gold shimmer overlay
              backgroundImage:
                phase === 'holding'
                  ? 'linear-gradient(105deg, #c4a46b 0%, #e8d5a8 40%, #c4a46b 60%, #a88a52 100%)'
                  : 'none',
              backgroundClip: phase === 'holding' ? 'text' : 'unset',
              WebkitBackgroundClip: phase === 'holding' ? 'text' : 'unset',
              WebkitTextFillColor: phase === 'holding' ? 'transparent' : '#c4a46b',
              backgroundSize: '200% 100%',
              animation:
                phase === 'holding'
                  ? `au-letter-rise 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms forwards, au-gold-sweep 0.9s ease-out 0.1s forwards`
                  : `au-letter-rise 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms forwards`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Tagline */}
      <p
        style={{
          fontFamily: 'var(--font-mono), "DM Mono", monospace',
          fontSize: 10,
          letterSpacing: '0.32em',
          color: 'rgba(196,164,107,0.45)',
          textTransform: 'uppercase',
          opacity: 0,
          animation: 'au-fade-in 0.6s ease 700ms forwards',
          marginTop: 4,
        }}
      >
        aura operating system
      </p>

      {/* Bottom line ornament */}
      <div
        style={{
          position: 'absolute',
          bottom: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          opacity: 0,
          animation: 'au-fade-in 0.5s ease 900ms forwards',
        }}
      >
        <div style={{ width: 24, height: 0.5, background: 'rgba(196,164,107,0.2)' }} />
        <div
          style={{
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: 'rgba(196,164,107,0.3)',
          }}
        />
        <div style={{ width: 24, height: 0.5, background: 'rgba(196,164,107,0.2)' }} />
      </div>
    </div>
  )
}
