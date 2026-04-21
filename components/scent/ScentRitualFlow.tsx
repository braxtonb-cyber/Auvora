'use client'

import { useMemo, useState } from 'react'
import { RITUAL_QUESTIONS } from '@/lib/scent/constants'
import type { ScentOnboardingAnswers } from '@/lib/scent/types'

interface ScentRitualFlowProps {
  initial: Partial<ScentOnboardingAnswers>
  onDraftChange: (draft: Partial<ScentOnboardingAnswers>) => void
  onComplete: (answers: ScentOnboardingAnswers) => void
  onSkip: () => void
}

const T = {
  card: '#0d0d0d',
  cardBorder: 'rgba(255,255,255,0.05)',
  textPrimary: '#f0ebe3',
  textBody: '#c8c2b8',
  textSub: '#8a8278',
  textMuted: '#4a4540',
  gold: '#c4a46b',
  goldGlow: 'rgba(196,164,107,0.08)',
  goldBorder: 'rgba(196,164,107,0.2)',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

const STEPS = [
  'atmosphere',
  'scentTrailPreference',
  'complimentLanguage',
  'currentWardrobeHighlights',
  'missingFeeling',
] as const

type StepId = (typeof STEPS)[number]

function parseWardrobeText(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12)
}

function normalizeAnswers(draft: Partial<ScentOnboardingAnswers>): ScentOnboardingAnswers {
  return {
    atmosphere: draft.atmosphere?.trim() || 'clean and collected',
    scentTrailPreference: draft.scentTrailPreference?.trim() || 'soft',
    complimentLanguage: (draft.complimentLanguage ?? []).filter(Boolean),
    currentWardrobeHighlights: (draft.currentWardrobeHighlights ?? []).filter(Boolean),
    missingFeeling: draft.missingFeeling?.trim() || 'clean daytime structure',
  }
}

export default function ScentRitualFlow({ initial, onDraftChange, onComplete, onSkip }: ScentRitualFlowProps) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Partial<ScentOnboardingAnswers>>(initial)
  const [wardrobeText, setWardrobeText] = useState((initial.currentWardrobeHighlights ?? []).join('\n'))

  const stepId: StepId = STEPS[step]

  const canContinue = useMemo(() => {
    if (stepId === 'complimentLanguage') return (draft.complimentLanguage?.length ?? 0) > 0
    if (stepId === 'currentWardrobeHighlights') return true
    if (stepId === 'atmosphere') return Boolean(draft.atmosphere?.trim())
    if (stepId === 'scentTrailPreference') return Boolean(draft.scentTrailPreference?.trim())
    if (stepId === 'missingFeeling') return Boolean(draft.missingFeeling?.trim())
    return true
  }, [draft, stepId])

  function patch(next: Partial<ScentOnboardingAnswers>) {
    const merged = { ...draft, ...next }
    setDraft(merged)
    onDraftChange(merged)
  }

  function nextStep() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
      return
    }

    onComplete(normalizeAnswers(draft))
  }

  function toggleCompliment(value: string) {
    const list = new Set(draft.complimentLanguage ?? [])
    if (list.has(value)) list.delete(value)
    else list.add(value)
    patch({ complimentLanguage: Array.from(list).slice(0, 3) })
  }

  return (
    <div style={{ paddingTop: 46, animation: 'au-tab-switch 0.35s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <p
          style={{
            fontFamily: T.fontM,
            fontSize: 9,
            letterSpacing: '0.26em',
            color: T.gold,
            textTransform: 'uppercase',
            opacity: 0.7,
          }}
        >
          {step + 1} of {STEPS.length}
        </p>
        <button
          onClick={onSkip}
          style={{
            fontFamily: T.fontM,
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: T.textMuted,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Skip
        </button>
      </div>

      <div
        key={stepId}
        style={{
          background: T.card,
          border: `0.5px solid ${T.cardBorder}`,
          borderRadius: 18,
          padding: '22px 18px',
          marginBottom: 12,
          animation: 'au-onboard-in 0.35s ease',
        }}
      >
        <h2
          style={{
            fontFamily: T.fontC,
            fontWeight: 300,
            fontSize: 30,
            lineHeight: 1.2,
            color: T.textPrimary,
            marginBottom: 9,
          }}
        >
          {RITUAL_QUESTIONS[stepId].title}
        </h2>

        <p
          style={{
            fontFamily: T.fontM,
            fontSize: 11,
            color: T.textSub,
            letterSpacing: '0.03em',
            lineHeight: 1.6,
            marginBottom: 18,
          }}
        >
          {RITUAL_QUESTIONS[stepId].subtitle}
        </p>

        {stepId === 'atmosphere' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {RITUAL_QUESTIONS.atmosphere.options.map((option) => {
              const selected = draft.atmosphere === option
              return (
                <button
                  key={option}
                  onClick={() => patch({ atmosphere: option })}
                  style={{
                    border: `0.5px solid ${selected ? T.goldBorder : 'rgba(255,255,255,0.06)'}`,
                    background: selected ? T.goldGlow : 'rgba(255,255,255,0.02)',
                    color: selected ? T.gold : T.textBody,
                    borderRadius: 20,
                    padding: '7px 12px',
                    fontFamily: T.fontM,
                    fontSize: 10,
                    letterSpacing: '0.03em',
                    cursor: 'pointer',
                  }}
                >
                  {option}
                </button>
              )
            })}
          </div>
        )}

        {stepId === 'scentTrailPreference' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {RITUAL_QUESTIONS.scentTrailPreference.options.map((option) => {
              const selected = draft.scentTrailPreference === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => patch({ scentTrailPreference: option.value })}
                  style={{
                    border: `0.5px solid ${selected ? T.goldBorder : 'rgba(255,255,255,0.06)'}`,
                    background: selected ? T.goldGlow : 'rgba(255,255,255,0.02)',
                    color: selected ? T.gold : T.textBody,
                    borderRadius: 14,
                    padding: '12px',
                    fontFamily: T.fontC,
                    fontSize: 18,
                    cursor: 'pointer',
                  }}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        )}

        {stepId === 'complimentLanguage' && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {RITUAL_QUESTIONS.complimentLanguage.options.map((option) => {
                const selected = (draft.complimentLanguage ?? []).includes(option)
                return (
                  <button
                    key={option}
                    onClick={() => toggleCompliment(option)}
                    style={{
                      border: `0.5px solid ${selected ? T.goldBorder : 'rgba(255,255,255,0.06)'}`,
                      background: selected ? T.goldGlow : 'rgba(255,255,255,0.02)',
                      color: selected ? T.gold : T.textBody,
                      borderRadius: 20,
                      padding: '7px 12px',
                      fontFamily: T.fontM,
                      fontSize: 10,
                      letterSpacing: '0.03em',
                      cursor: 'pointer',
                    }}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textMuted, letterSpacing: '0.03em' }}>
              Pick up to three.
            </p>
          </>
        )}

        {stepId === 'currentWardrobeHighlights' && (
          <textarea
            value={wardrobeText}
            onChange={(event) => {
              const value = event.target.value
              setWardrobeText(value)
              patch({ currentWardrobeHighlights: parseWardrobeText(value) })
            }}
            rows={6}
            placeholder={'e.g. Maison Francis Kurkdjian - Gentle Fluidity Gold\nLe Labo - Another 13'}
            style={{
              width: '100%',
              resize: 'none',
              background: 'rgba(255,255,255,0.03)',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '12px 13px',
              fontFamily: T.fontM,
              fontSize: 11,
              letterSpacing: '0.02em',
              color: T.textBody,
              lineHeight: 1.6,
              outline: 'none',
            }}
          />
        )}

        {stepId === 'missingFeeling' && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {RITUAL_QUESTIONS.missingFeeling.options.map((option) => {
                const selected = draft.missingFeeling === option
                return (
                  <button
                    key={option}
                    onClick={() => patch({ missingFeeling: option })}
                    style={{
                      border: `0.5px solid ${selected ? T.goldBorder : 'rgba(255,255,255,0.06)'}`,
                      background: selected ? T.goldGlow : 'rgba(255,255,255,0.02)',
                      color: selected ? T.gold : T.textBody,
                      borderRadius: 20,
                      padding: '7px 12px',
                      fontFamily: T.fontM,
                      fontSize: 10,
                      letterSpacing: '0.03em',
                      cursor: 'pointer',
                    }}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            <input
              value={draft.missingFeeling ?? ''}
              onChange={(event) => patch({ missingFeeling: event.target.value })}
              placeholder="Or phrase it in your own words"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '10px 12px',
                fontFamily: T.fontM,
                fontSize: 11,
                color: T.textBody,
              }}
            />
          </>
        )}
      </div>

      <button
        onClick={nextStep}
        disabled={!canContinue}
        style={{
          width: '100%',
          padding: '14px',
          background: canContinue ? T.goldGlow : 'rgba(196,164,107,0.05)',
          border: `0.5px solid ${canContinue ? T.goldBorder : 'rgba(196,164,107,0.08)'}`,
          borderRadius: 14,
          cursor: canContinue ? 'pointer' : 'default',
          color: canContinue ? T.gold : 'rgba(196,164,107,0.3)',
          fontFamily: T.fontM,
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {step === STEPS.length - 1 ? 'Finish profile' : 'Continue'}
      </button>
    </div>
  )
}
