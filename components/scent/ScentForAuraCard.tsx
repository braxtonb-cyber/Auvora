'use client'

import {
  computeAuraScentRecommendation,
  computeLayeringSuggestion,
} from '@/lib/scent/mini-scentory'
import type { AuraContext, ScentProfile } from '@/lib/scent/types'

interface ScentForAuraCardProps {
  profile: ScentProfile
  auraContext: AuraContext | null
}

const T = {
  card: '#0d0d0d',
  cardBorder: 'rgba(255,255,255,0.05)',
  textPrimary: '#f0ebe3',
  textBody: '#c8c2b8',
  textSub: '#8a8278',
  textMuted: '#4a4540',
  gold: '#c4a46b',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

function labelFor(profile: ScentProfile, itemId: string | null): string {
  if (!itemId) return 'Identity-led direction'
  const item = profile.wardrobe.find((entry) => entry.id === itemId)
  if (!item) return 'Unknown item'
  return item.brand ? `${item.brand} ${item.name}` : item.name
}

export default function ScentForAuraCard({ profile, auraContext }: ScentForAuraCardProps) {
  const auraRec = computeAuraScentRecommendation(profile, auraContext ?? undefined)
  const layering = computeLayeringSuggestion(profile)

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
        For this aura
      </p>
      <h3 style={{ fontFamily: T.fontC, fontWeight: 300, fontSize: 25, color: T.textPrimary, marginBottom: 8 }}>
        {auraRec.title}
      </h3>
      <p style={{ fontFamily: T.fontM, fontSize: 11, color: T.textSub, lineHeight: 1.65, letterSpacing: '0.03em', marginBottom: 10 }}>
        {auraRec.rationale}
      </p>

      <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
        Primary
      </p>
      <p style={{ fontFamily: T.fontC, fontSize: 22, color: T.textPrimary, lineHeight: 1.2, marginBottom: 8 }}>
        {labelFor(profile, auraRec.primaryItemId)}
      </p>

      {auraRec.alternateItemIds.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
            Alternates
          </p>
          {auraRec.alternateItemIds.map((id) => (
            <p key={id} style={{ fontFamily: T.fontM, fontSize: 10, color: T.textBody, lineHeight: 1.55, letterSpacing: '0.03em' }}>
              {labelFor(profile, id)}
            </p>
          ))}
        </div>
      )}

      {auraRec.auraAlignmentNotes.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 5 }}>
            Aura alignment
          </p>
          {auraRec.auraAlignmentNotes.map((line) => (
            <p key={line} style={{ fontFamily: T.fontM, fontSize: 10, color: T.textSub, lineHeight: 1.55, letterSpacing: '0.03em' }}>
              {line}
            </p>
          ))}
        </div>
      )}

      <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
        <p style={{ fontFamily: T.fontM, fontSize: 9, color: T.gold, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.68, marginBottom: 5 }}>
          Layering / pairing
        </p>
        <p style={{ fontFamily: T.fontC, fontSize: 20, color: T.textPrimary, marginBottom: 4 }}>
          {layering.title}
        </p>
        <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textBody, lineHeight: 1.55, letterSpacing: '0.03em', marginBottom: 6 }}>
          {layering.secondaryItemId
            ? `${labelFor(profile, layering.primaryItemId)} + ${labelFor(profile, layering.secondaryItemId)}`
            : labelFor(profile, layering.primaryItemId)}
        </p>
        <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textSub, lineHeight: 1.6, letterSpacing: '0.03em', marginBottom: 6 }}>
          {layering.rationale}
        </p>
        <p style={{ fontFamily: T.fontM, fontSize: 10, color: T.textMuted, lineHeight: 1.6, letterSpacing: '0.03em' }}>
          {layering.wearingNote}
        </p>
      </div>
    </div>
  )
}
