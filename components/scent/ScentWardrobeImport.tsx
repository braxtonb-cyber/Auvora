'use client'

import { useMemo, useState } from 'react'
import type { ScentWardrobeItem } from '@/lib/scent/types'

interface ScentWardrobeImportProps {
  onImport: (items: ScentWardrobeItem[]) => void
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

export default function ScentWardrobeImport({ onImport }: ScentWardrobeImportProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<ScentWardrobeItem[]>([])

  const hasItems = useMemo(() => items.length > 0, [items])

  async function parseInput() {
    if (!input.trim()) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/scent-import-wardrobe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      const data = (await response.json()) as { wardrobeItems?: ScentWardrobeItem[]; error?: string }
      if (!response.ok || !Array.isArray(data.wardrobeItems)) {
        throw new Error(data.error || 'Could not parse wardrobe input')
      }
      setItems(data.wardrobeItems)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not parse wardrobe input')
    } finally {
      setLoading(false)
    }
  }

  function updateItem(index: number, patch: Partial<ScentWardrobeItem>) {
    setItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)))
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  return (
    <div
      style={{
        background: T.card,
        border: `0.5px solid ${T.cardBorder}`,
        borderRadius: 16,
        padding: '16px 18px',
        marginBottom: 10,
      }}
    >
      <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.gold, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>
        Wardrobe import
      </p>
      <h3 style={{ fontFamily: T.fontC, fontWeight: 300, fontSize: 25, color: T.textPrimary, marginBottom: 8 }}>
        Add what you already own
      </h3>
      <p style={{ fontFamily: T.fontM, fontSize: 11, color: T.textSub, lineHeight: 1.6, letterSpacing: '0.03em', marginBottom: 10 }}>
        Paste bottles line by line. AUVORA structures them into editable wardrobe cards.
      </p>

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={4}
        placeholder={'e.g. Lattafa - Khamrah\nLattafa - Yara\nMaison Francis Kurkdjian - Baccarat Rouge 540'}
        style={{
          width: '100%',
          resize: 'none',
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '12px 13px',
          fontFamily: T.fontM,
          fontSize: 11,
          color: T.textBody,
          lineHeight: 1.6,
          marginBottom: 10,
        }}
      />

      <button
        onClick={parseInput}
        disabled={!input.trim() || loading}
        style={{
          width: '100%',
          padding: '11px',
          borderRadius: 12,
          border: `0.5px solid ${loading || !input.trim() ? 'rgba(196,164,107,0.08)' : T.goldBorder}`,
          background: loading || !input.trim() ? 'rgba(196,164,107,0.04)' : T.goldGlow,
          color: loading || !input.trim() ? 'rgba(196,164,107,0.3)' : T.gold,
          fontFamily: T.fontM,
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: loading || !input.trim() ? 'default' : 'pointer',
          marginBottom: error || hasItems ? 10 : 0,
        }}
      >
        {loading ? 'Parsing wardrobe...' : 'Parse into cards'}
      </button>

      {error && (
        <p style={{ fontFamily: T.fontM, fontSize: 10, color: 'rgba(190,90,90,0.85)', letterSpacing: '0.03em', marginBottom: 8 }}>
          {error}
        </p>
      )}

      {hasItems && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {items.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                style={{
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  padding: '10px',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <input
                    value={item.brand ?? ''}
                    placeholder="Brand"
                    onChange={(event) => updateItem(index, { brand: event.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '0.5px solid rgba(255,255,255,0.08)',
                      borderRadius: 9,
                      padding: '8px',
                      fontFamily: T.fontM,
                      fontSize: 10,
                      color: T.textBody,
                    }}
                  />
                  <input
                    value={item.name}
                    placeholder="Name"
                    onChange={(event) => updateItem(index, { name: event.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '0.5px solid rgba(255,255,255,0.08)',
                      borderRadius: 9,
                      padding: '8px',
                      fontFamily: T.fontM,
                      fontSize: 10,
                      color: T.textBody,
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
                  <input
                    value={item.families.join(', ')}
                    onChange={(event) =>
                      updateItem(index, {
                        families: event.target.value
                          .split(',')
                          .map((value) => value.trim().toLowerCase())
                          .filter(Boolean)
                          .slice(0, 3),
                      })
                    }
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '0.5px solid rgba(255,255,255,0.08)',
                      borderRadius: 9,
                      padding: '8px',
                      fontFamily: T.fontM,
                      fontSize: 10,
                      color: T.textSub,
                    }}
                  />
                  <button
                    onClick={() => removeItem(index)}
                    style={{
                      border: '0.5px solid rgba(255,255,255,0.08)',
                      background: 'none',
                      borderRadius: 9,
                      padding: '8px 10px',
                      fontFamily: T.fontM,
                      fontSize: 9,
                      color: T.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onImport(items)}
            disabled={!items.length}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: 12,
              border: `0.5px solid ${items.length ? T.goldBorder : 'rgba(196,164,107,0.08)'}`,
              background: items.length ? T.goldGlow : 'rgba(196,164,107,0.04)',
              color: items.length ? T.gold : 'rgba(196,164,107,0.3)',
              fontFamily: T.fontM,
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: items.length ? 'pointer' : 'default',
            }}
          >
            Add to wardrobe view
          </button>
        </>
      )}
    </div>
  )
}
