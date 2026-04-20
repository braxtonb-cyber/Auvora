'use client'

import { useState } from 'react'

export interface AuvoraProfile {
  moment: string   // What moment are you preparing for
  vibe: string     // Your natural vibe direction
  focus: string    // What matters most right now
}

interface OnboardingFlowProps {
  onComplete: (profile: AuvoraProfile) => void
}

// ─── Question data ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'moment',
    question: 'What moment are you\npreparing for?',
    sub: "We'll tune your aura to fit the occasion.",
    options: [
      { value: 'social',       label: 'Night Out',    icon: '◈', desc: 'Events, dates, gatherings' },
      { value: 'professional', label: 'Work Mode',    icon: '◉', desc: 'Meetings, interviews, focus' },
      { value: 'creative',     label: 'Creative Work',icon: '◬', desc: 'Studio, writing, ideating' },
      { value: 'daily',        label: 'Everyday',     icon: '○', desc: 'Routine, errands, self-care' },
    ],
  },
  {
    id: 'vibe',
    question: "What's your natural\naura direction?",
    sub: "Your default energy — not who you're trying to be.",
    options: [
      { value: 'bold',   label: 'Bold',   icon: '▲', desc: 'Direct, magnetic, commanding' },
      { value: 'soft',   label: 'Soft',   icon: '●', desc: 'Warm, grounded, approachable' },
      { value: 'sharp',  label: 'Sharp',  icon: '◇', desc: 'Clean, precise, intentional' },
      { value: 'fluid',  label: 'Fluid',  icon: '~', desc: 'Expressive, layered, evolving' },
    ],
  },
  {
    id: 'focus',
    question: 'What matters most\nto you right now?',
    sub: 'This shapes where your aura puts its energy.',
    options: [
      { value: 'look',   label: 'How I Look',  icon: '◈', desc: 'Outfit, style, first impression' },
      { value: 'feel',   label: 'How I Feel',  icon: '◉', desc: 'Mood, energy, inner alignment' },
      { value: 'scent',  label: 'My Scent',    icon: '◬', desc: 'Fragrance, signature smell' },
      { value: 'sound',  label: 'My Sound',    icon: '♩', desc: 'Music, playlist, atmosphere' },
    ],
  },
]

const T = {
  bg:          '#060606',
  card:        '#0d0d0d',
  cardBorder:  'rgba(255,255,255,0.05)',
  textPrimary: '#f0ebe3',
  textBody:    '#c8c2b8',
  textSub:     '#8a8278',
  textMuted:   '#4a4540',
  gold:        '#c4a46b',
  goldGlow:    'rgba(196,164,107,0.1)',
  goldBorder:  'rgba(196,164,107,0.25)',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [exiting, setExiting] = useState(false)

  const current = STEPS[step]
  const selectedValue = selections[current.id]

  function select(value: string) {
    const next = { ...selections, [current.id]: value }
    setSelections(next)

    // Auto-advance after a short moment so the selection registers visually
    setTimeout(() => {
      if (step < STEPS.length - 1) {
        setStep(s => s + 1)
      } else {
        // Last step — complete onboarding
        setExiting(true)
        const profile: AuvoraProfile = {
          moment: next.moment || 'daily',
          vibe:   next.vibe   || 'fluid',
          focus:  next.focus  || 'feel',
        }
        localStorage.setItem('auvoraProfile', JSON.stringify(profile))
        localStorage.setItem('auvoraOnboarded', '1')
        setTimeout(() => onComplete(profile), 500)
      }
    }, 280)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: T.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        opacity: exiting ? 0 : 1,
        transition: exiting ? 'opacity 0.5s ease' : 'none',
      }}
    >
      {/* Progress dots */}
      <div
        style={{
          position: 'absolute',
          top: 52,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}
      >
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 18 : 5,
              height: 5,
              borderRadius: 3,
              background: i === step ? T.gold : i < step ? 'rgba(196,164,107,0.35)' : 'rgba(255,255,255,0.08)',
              transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        ))}
      </div>

      {/* Step content */}
      <div
        key={step}
        style={{
          width: '100%',
          maxWidth: 380,
          animation: 'au-onboard-in 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        {/* Question */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <p
            style={{
              fontFamily: T.fontM,
              fontSize: 9,
              letterSpacing: '0.28em',
              color: T.gold,
              textTransform: 'uppercase',
              marginBottom: 16,
              opacity: 0.7,
            }}
          >
            {step + 1} of {STEPS.length}
          </p>
          <h2
            style={{
              fontFamily: T.fontC,
              fontWeight: 300,
              fontSize: 'clamp(26px, 7vw, 32px)',
              lineHeight: 1.25,
              color: T.textPrimary,
              letterSpacing: '0.02em',
              whiteSpace: 'pre-line',
              marginBottom: 10,
            }}
          >
            {current.question}
          </h2>
          <p
            style={{
              fontFamily: T.fontM,
              fontSize: 11,
              color: T.textSub,
              letterSpacing: '0.04em',
              lineHeight: 1.5,
            }}
          >
            {current.sub}
          </p>
        </div>

        {/* Options grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          {current.options.map((opt, i) => {
            const isSelected = selectedValue === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                style={{
                  background: isSelected ? T.goldGlow : 'rgba(255,255,255,0.02)',
                  border: `0.5px solid ${isSelected ? T.goldBorder : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 16,
                  padding: '18px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  animation: `au-onboard-option 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both`,
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                }}
              >
                <div
                  style={{
                    fontFamily: T.fontM,
                    fontSize: 14,
                    color: isSelected ? T.gold : T.textSub,
                    marginBottom: 8,
                    transition: 'color 0.2s ease',
                  }}
                >
                  {opt.icon}
                </div>
                <div
                  style={{
                    fontFamily: T.fontC,
                    fontWeight: 400,
                    fontSize: 15,
                    color: isSelected ? T.textPrimary : T.textBody,
                    marginBottom: 4,
                    letterSpacing: '0.01em',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {opt.label}
                </div>
                <div
                  style={{
                    fontFamily: T.fontM,
                    fontSize: 10,
                    color: isSelected ? 'rgba(196,164,107,0.6)' : T.textMuted,
                    letterSpacing: '0.03em',
                    lineHeight: 1.4,
                    transition: 'color 0.2s ease',
                  }}
                >
                  {opt.desc}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom brand mark */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          fontFamily: T.fontM,
          fontSize: 9,
          letterSpacing: '0.22em',
          color: 'rgba(196,164,107,0.2)',
          textTransform: 'uppercase',
        }}
      >
        AUVORA
      </div>
    </div>
  )
}
