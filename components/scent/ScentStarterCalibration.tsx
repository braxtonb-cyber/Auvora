'use client'

import { useMemo, useState } from 'react'
import { FAMILY_VOCAB, MOOD_VOCAB, OCCASION_VOCAB, SEASON_VOCAB } from '@/lib/scent/constants'
import type { ScentPreferences, ScentProfile } from '@/lib/scent/types'

interface ScentStarterCalibrationProps {
  profile: ScentProfile
  onSave: (updates: Partial<ScentPreferences>) => void
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
  goldBorder: 'rgba(196,164,107,0.22)',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

function toggle(list: string[], value: string, limit: number): string[] {
  const set = new Set(list)
  if (set.has(value)) set.delete(value)
  else if (set.size < limit) set.add(value)
  return Array.from(set)
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `0.5px solid ${selected ? T.goldBorder : 'rgba(255,255,255,0.06)'}`,
        background: selected ? T.goldGlow : 'rgba(255,255,255,0.02)',
        color: selected ? T.gold : T.textBody,
        borderRadius: 18,
        padding: '5px 9px',
        fontFamily: T.fontM,
        fontSize: 9,
        letterSpacing: '0.03em',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

export default function ScentStarterCalibration({ profile, onSave }: ScentStarterCalibrationProps) {
  const [favoriteFamilies, setFavoriteFamilies] = useState<string[]>(profile.preferences.favoriteFamilies)
  const [preferredMoods, setPreferredMoods] = useState<string[]>(profile.preferences.preferredMoods)
  const [preferredSeasons, setPreferredSeasons] = useState<string[]>(profile.preferences.preferredSeasons)
  const [occasionPriorities, setOccasionPriorities] = useState<string[]>(profile.preferences.occasionPriorities)
  const [layeringTendency, setLayeringTendency] = useState(profile.preferences.layeringTendency)
  const [signatureDirection, setSignatureDirection] = useState(profile.preferences.signatureDirection)

  const hasEdits = useMemo(() => {
    return (
      favoriteFamilies.join('|') !== profile.preferences.favoriteFamilies.join('|') ||
      preferredMoods.join('|') !== profile.preferences.preferredMoods.join('|') ||
      preferredSeasons.join('|') !== profile.preferences.preferredSeasons.join('|') ||
      occasionPriorities.join('|') !== profile.preferences.occasionPriorities.join('|') ||
      layeringTendency !== profile.preferences.layeringTendency ||
      signatureDirection.trim() !== profile.preferences.signatureDirection
    )
  }, [favoriteFamilies, preferredMoods, preferredSeasons, occasionPriorities, layeringTendency, signatureDirection, profile.preferences])

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
        Starter calibration
      </p>
      <h3 style={{ fontFamily: T.fontC, fontWeight: 300, fontSize: 24, color: T.textPrimary, marginBottom: 8 }}>
        Teach Scent your taste memory
      </h3>
      <p style={{ fontFamily: T.fontM, fontSize: 11, color: T.textSub, lineHeight: 1.6, letterSpacing: '0.03em', marginBottom: 12 }}>
        Save quick preferences so recommendations stay personal and collection-aware.
      </p>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
          Favorite families
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {FAMILY_VOCAB.map((family) => (
            <Chip
              key={family}
              label={family}
              selected={favoriteFamilies.includes(family)}
              onClick={() => setFavoriteFamilies((prev) => toggle(prev, family, 4))}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
          Preferred moods
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {MOOD_VOCAB.map((mood) => (
            <Chip
              key={mood}
              label={mood}
              selected={preferredMoods.includes(mood)}
              onClick={() => setPreferredMoods((prev) => toggle(prev, mood, 4))}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
          Seasons and occasions
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
          {SEASON_VOCAB.map((season) => (
            <Chip
              key={season}
              label={season}
              selected={preferredSeasons.includes(season)}
              onClick={() => setPreferredSeasons((prev) => toggle(prev, season, 2))}
            />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {OCCASION_VOCAB.map((occasion) => (
            <Chip
              key={occasion}
              label={occasion}
              selected={occasionPriorities.includes(occasion)}
              onClick={() => setOccasionPriorities((prev) => toggle(prev, occasion, 3))}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
          Layering tendency
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {[
            { label: 'solo-first', value: 'solo-first' },
            { label: 'balanced', value: 'balanced' },
            { label: 'layer-first', value: 'layer-first' },
          ].map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={layeringTendency === option.value}
              onClick={() => setLayeringTendency(option.value as typeof layeringTendency)}
            />
          ))}
        </div>

        <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
          Signature direction
        </p>
        <input
          value={signatureDirection}
          onChange={(event) => setSignatureDirection(event.target.value)}
          placeholder="e.g. controlled projection, warm woods"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '10px 11px',
            fontFamily: T.fontM,
            fontSize: 10,
            color: T.textBody,
          }}
        />
      </div>

      <button
        onClick={() =>
          onSave({
            favoriteFamilies,
            preferredMoods,
            preferredSeasons,
            occasionPriorities,
            layeringTendency,
            signatureDirection: signatureDirection.trim(),
          })
        }
        disabled={!hasEdits}
        style={{
          width: '100%',
          padding: '11px',
          borderRadius: 12,
          border: `0.5px solid ${hasEdits ? T.goldBorder : 'rgba(196,164,107,0.08)'}`,
          background: hasEdits ? T.goldGlow : 'rgba(196,164,107,0.04)',
          color: hasEdits ? T.gold : 'rgba(196,164,107,0.3)',
          fontFamily: T.fontM,
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: hasEdits ? 'pointer' : 'default',
        }}
      >
        Save scent memory
      </button>
    </div>
  )
}
