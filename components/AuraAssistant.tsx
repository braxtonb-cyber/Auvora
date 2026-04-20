'use client'

import { useState, useRef, useEffect } from 'react'

interface AuraAssistantProps {
  currentAura?: {
    vibe: string
    outfit: string
    fragrance: string
    playlist: string
    caption: string
  } | null
  onRefinement?: (refinedVibe: string) => void
}

const T = {
  bg:         '#060606',
  sheet:      '#0c0b0a',
  border:     'rgba(255,255,255,0.06)',
  textPrimary:'#f0ebe3',
  textBody:   '#c8c2b8',
  textSub:    '#8a8278',
  textMuted:  '#4a4540',
  gold:       '#c4a46b',
  goldGlow:   'rgba(196,164,107,0.08)',
  goldBorder: 'rgba(196,164,107,0.2)',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

const PROMPTS = [
  'Make this more evening-appropriate',
  'Dial up the confidence',
  'Soften the energy',
  'Make it more romantic',
  'Push it sharper and cleaner',
  'More mysterious, less obvious',
]

export default function AuraAssistant({ currentAura, onRefinement }: AuraAssistantProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [fabVisible, setFabVisible] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // FAB appears only when there's an active aura
    setFabVisible(!!currentAura)
    if (!currentAura) {
      setOpen(false)
      setResponse(null)
    }
  }, [currentAura])

  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 400)
    }
  }, [open])

  async function refine() {
    if (!input.trim() || !currentAura) return
    setLoading(true)
    setResponse(null)

    try {
      const res = await fetch('/api/refine-aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAura,
          userRequest: input.trim(),
        }),
      })

      const data = await res.json()
      const text = data.text || ''
      setResponse(text)

      // Extract the "→ Try:" suggestion if present
      const tryMatch = text.match(/→ Try: (.+)/i)
      if (tryMatch && onRefinement) {
        // Don't auto-trigger — let user choose
      }
    } catch {
      setResponse('The oracle is momentarily unavailable. Try again shortly.')
    } finally {
      setLoading(false)
    }
  }

  function applyRefinement() {
    if (!response || !onRefinement) return
    const tryMatch = response.match(/→ Try: (.+)/i)
    if (tryMatch) {
      onRefinement(tryMatch[1].trim())
      setOpen(false)
      setInput('')
      setResponse(null)
    }
  }

  if (!fabVisible) return null

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 90,  // Above bottom nav
          right: 20,
          zIndex: 200,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(10,9,8,0.95)',
          border: `0.5px solid ${T.goldBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(196,164,107,0.1)',
          opacity: fabVisible ? 1 : 0,
          transform: fabVisible ? 'scale(1)' : 'scale(0.8)',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          animation: 'au-fab-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
        aria-label="Refine your aura"
      >
        {/* Copilot icon */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2L10.5 6.5L15 8L10.5 9.5L9 14L7.5 9.5L3 8L7.5 6.5L9 2Z" stroke="#c4a46b" strokeWidth="0.75" strokeLinejoin="round"/>
          <path d="M14 1L14.75 3.25L17 4L14.75 4.75L14 7L13.25 4.75L11 4L13.25 3.25L14 1Z" stroke="rgba(196,164,107,0.5)" strokeWidth="0.5" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0,0,0,0.6)',
            animation: 'au-fade-in 0.25s ease',
          }}
        />
      )}

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 301,
          background: T.sheet,
          borderTop: `0.5px solid ${T.border}`,
          borderRadius: '20px 20px 0 0',
          padding: '20px 20px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.45s cubic-bezier(0.16,1,0.3,1)',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        {/* Handle */}
        <div style={{
          width: 32, height: 3, borderRadius: 2,
          background: 'rgba(255,255,255,0.1)',
          margin: '0 auto 20px',
        }} />

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <p style={{
            fontFamily: T.fontM, fontSize: 9,
            letterSpacing: '0.26em', color: T.gold,
            textTransform: 'uppercase', marginBottom: 6, opacity: 0.7,
          }}>
            ✦ Aura Copilot
          </p>
          <h3 style={{
            fontFamily: T.fontC, fontWeight: 300,
            fontSize: 22, color: T.textPrimary, letterSpacing: '0.02em',
          }}>
            Refine your aura
          </h3>
          <p style={{
            fontFamily: T.fontM, fontSize: 11,
            color: T.textSub, marginTop: 4, letterSpacing: '0.03em',
          }}>
            Tell me what to adjust — mood, occasion, energy.
          </p>
        </div>

        {/* Quick prompts */}
        {!response && (
          <div style={{
            display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14,
          }}>
            {PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => setInput(p)}
                style={{
                  fontFamily: T.fontM, fontSize: 10, letterSpacing: '0.02em',
                  color: input === p ? T.gold : T.textSub,
                  background: input === p ? T.goldGlow : 'rgba(255,255,255,0.03)',
                  border: `0.5px solid ${input === p ? T.goldBorder : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 20, padding: '6px 10px',
                  cursor: 'pointer', outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        {!response && (
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. More intellectual, less flashy. Evening gallery opening."
              rows={3}
              style={{
                width: '100%', resize: 'none',
                background: 'rgba(255,255,255,0.03)',
                border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                padding: '12px 14px',
                fontFamily: T.fontM, fontSize: 12, color: T.textBody,
                lineHeight: 1.6, letterSpacing: '0.02em',
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            />
          </div>
        )}

        {/* Response */}
        {response && (
          <div style={{
            background: T.goldGlow,
            border: `0.5px solid ${T.goldBorder}`,
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 14,
            animation: 'au-fade-up 0.4s ease',
          }}>
            <p style={{
              fontFamily: T.fontC, fontSize: 15, color: T.textBody,
              lineHeight: 1.65, letterSpacing: '0.01em',
              whiteSpace: 'pre-wrap',
            }}>
              {response}
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          {response ? (
            <>
              <button
                onClick={() => { setResponse(null); setInput('') }}
                style={{
                  flex: 1, padding: '13px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '0.5px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, cursor: 'pointer',
                  fontFamily: T.fontM, fontSize: 11,
                  letterSpacing: '0.06em', color: T.textSub,
                  textTransform: 'uppercase',
                  outline: 'none', WebkitTapHighlightColor: 'transparent',
                }}
              >
                Try again
              </button>
              <button
                onClick={applyRefinement}
                style={{
                  flex: 2, padding: '13px',
                  background: 'rgba(196,164,107,0.12)',
                  border: `0.5px solid ${T.goldBorder}`,
                  borderRadius: 12, cursor: 'pointer',
                  fontFamily: T.fontM, fontSize: 11,
                  letterSpacing: '0.06em', color: T.gold,
                  textTransform: 'uppercase',
                  outline: 'none', WebkitTapHighlightColor: 'transparent',
                }}
              >
                Apply → Regenerate
              </button>
            </>
          ) : (
            <button
              onClick={refine}
              disabled={!input.trim() || loading}
              style={{
                width: '100%', padding: '14px',
                background: loading || !input.trim() ? 'rgba(196,164,107,0.06)' : 'rgba(196,164,107,0.12)',
                border: `0.5px solid ${loading || !input.trim() ? 'rgba(196,164,107,0.1)' : T.goldBorder}`,
                borderRadius: 12,
                cursor: loading || !input.trim() ? 'default' : 'pointer',
                fontFamily: T.fontM, fontSize: 11,
                letterSpacing: '0.1em', color: loading || !input.trim() ? 'rgba(196,164,107,0.35)' : T.gold,
                textTransform: 'uppercase', transition: 'all 0.2s ease',
                outline: 'none', WebkitTapHighlightColor: 'transparent',
              }}
            >
              {loading ? 'Reading the aura…' : 'Refine'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
