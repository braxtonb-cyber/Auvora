import { BANNED_CHEESY_PHRASES } from '@/lib/scent/constants'
import type { ScentProfile, SituationRecommendation, ScentWardrobeItem } from '@/lib/scent/types'

export const IDENTITY_LED_ITEM_ID = 'identity-led'

const BANNED_OPENERS = [
  'great question',
  'based on your preferences',
  'i recommend',
]

function compact(value: string | undefined | null, fallback = 'none'): string {
  return value && value.trim() ? value.trim() : fallback
}

function list(values: string[] | undefined, fallback = 'none'): string {
  if (!values || values.length === 0) return fallback
  return values.join(', ')
}

function isFavorite(item: ScentWardrobeItem, profile: ScentProfile): boolean {
  return Boolean(item.isFavorite || profile.preferences.favoriteItemIds.includes(item.id))
}

function stringifyWardrobe(profile: ScentProfile): string {
  const owned = profile.wardrobe.filter((item) => item.owned)
  if (owned.length === 0) return 'Wardrobe is empty.'

  return owned
    .map((item) => {
      const name = item.brand ? `${item.brand} ${item.name}` : item.name
      return [
        `- id=${item.id}`,
        `name=${name}`,
        `family=${compact(item.family, item.families[0])}`,
        `families=${list(item.families, 'unclassified')}`,
        `seasons=${list(item.seasonTags, 'all-season')}`,
        `occasions=${list(item.occasionTags, 'everyday')}`,
        `projection=${compact(item.projection, 'moderate')}`,
        `sweetness=${compact(item.sweetness, 'medium')}`,
        `freshness=${compact(item.freshness, 'medium')}`,
        `layeringRole=${compact(item.layeringRole, 'anchor')}`,
        `productType=${compact(item.productType, 'fragrance')}`,
        `wearCount=${item.wearCount ?? 0}`,
        `lastWornAt=${compact(item.lastWornAt, 'never')}`,
        `isFavorite=${isFavorite(item, profile)}`,
        `isSignature=${Boolean(item.isSignature)}`,
      ].join('; ')
    })
    .join('\n')
}

export function buildSituationPrompt(situation: string, profile: ScentProfile): string {
  const wardrobeBlock = stringifyWardrobe(profile)
  const gaps = profile.identity.wardrobeGaps.join(', ') || 'none currently detected'

  return [
    'You are AUVORA\'s Scent Intelligence, a wardrobe-first advisor inside an identity OS.',
    'Return only strict JSON. Do not include markdown.',
    'Voice rules:',
    '- Never open with "I".',
    '- Never say "Great question" or "Based on your preferences".',
    '- Speak in decisions, not menus: use phrasing like "Reach for...".',
    '- Be concise and editorial. 1-2 short reasoning sentences.',
    '- Mention what to skip when it improves clarity.',
    '',
    `User situation: ${situation.trim()}`,
    `Locked scent personality: ${profile.identity.scentPersonality}`,
    `Supporting traits: ${profile.identity.supportingTraits.join(', ')}`,
    `Signature families: ${profile.identity.signatureFamilies.join(', ')}`,
    `Wardrobe strengths: ${profile.identity.wardrobeStrengths.join(', ')}`,
    `Wardrobe gaps: ${gaps}`,
    `Projection comfort: ${profile.preferences.projectionComfort}`,
    `Signature direction: ${profile.preferences.signatureDirection}`,
    `Preferred moods: ${profile.preferences.preferredMoods.join(', ')}`,
    `Current season: ${profile.wearPatterns.currentSeason}`,
    `Time-of-day bias: ${profile.wearPatterns.timeOfDayBias}`,
    `Top occasions: ${profile.wearPatterns.topOccasions.join(', ')}`,
    'Owned wardrobe inventory:',
    wardrobeBlock,
    'Rules:',
    '1) If wardrobe has owned items, primaryItemId must be one of those ids.',
    '2) Only use mode="layer" when the second owned item meaningfully improves the scenario.',
    `3) If wardrobe is empty, set primaryItemId="${IDENTITY_LED_ITEM_ID}" and explain the nearest identity-led direction.`,
    '4) Do not invent owned products. FutureDirection may mention a gap direction only.',
    '5) Keep title under 45 characters and reasoning concise.',
    '6) tryNext must begin with "Try asking for..."',
    'Return exactly this JSON shape:',
    '{"mode":"single|layer","primaryItemId":"string","secondaryItemId":"string|null","title":"string","reasoning":"string","wearingNote":"string","futureDirection":"string|null","tryNext":"Try asking for a sharper, warmer, cleaner, or more intimate version."}',
  ].join('\n')
}

function ensureString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid ${field}`)
  }
  return value.trim()
}

function containsBannedPhrase(input: string): boolean {
  const lower = input.toLowerCase()
  return BANNED_CHEESY_PHRASES.some((phrase) => lower.includes(phrase))
}

function hasBadOpener(input: string): boolean {
  const lower = input.trim().toLowerCase()
  return BANNED_OPENERS.some((line) => lower.startsWith(line)) || /^i\b/.test(lower)
}

export function validateSituationResponse(raw: unknown, profile: ScentProfile): SituationRecommendation {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Situation response must be an object')
  }

  const data = raw as Record<string, unknown>
  const mode = data.mode
  if (mode !== 'single' && mode !== 'layer') {
    throw new Error('mode must be "single" or "layer"')
  }

  const title = ensureString(data.title, 'title')
  const reasoning = ensureString(data.reasoning, 'reasoning')
  const wearingNote = ensureString(data.wearingNote, 'wearingNote')
  const tryNext = ensureString(data.tryNext, 'tryNext')

  if (containsBannedPhrase(`${title} ${reasoning} ${wearingNote}`)) {
    throw new Error('Response violated voice constraints')
  }

  if (hasBadOpener(reasoning)) {
    throw new Error('Response violated opening voice constraints')
  }

  if (title.length > 45 || reasoning.length > 280 || wearingNote.length > 220) {
    throw new Error('Response copy too long')
  }

  const futureDirection = data.futureDirection == null ? null : ensureString(data.futureDirection, 'futureDirection')
  const secondaryItemId = data.secondaryItemId == null ? null : ensureString(data.secondaryItemId, 'secondaryItemId')
  const primaryItemId = ensureString(data.primaryItemId, 'primaryItemId')

  const ownedIds = new Set(profile.wardrobe.filter((item) => item.owned).map((item) => item.id))
  const hasWardrobe = ownedIds.size > 0

  if (hasWardrobe) {
    if (!ownedIds.has(primaryItemId)) {
      throw new Error('primaryItemId must be one of owned wardrobe item ids')
    }

    if (mode === 'layer') {
      if (!secondaryItemId || !ownedIds.has(secondaryItemId) || secondaryItemId === primaryItemId) {
        throw new Error('layer mode requires a different valid secondaryItemId')
      }
    }
  } else {
    if (primaryItemId !== IDENTITY_LED_ITEM_ID) {
      throw new Error('empty wardrobe fallback must use identity-led id')
    }
  }

  if (!tryNext.toLowerCase().startsWith('try asking for')) {
    throw new Error('tryNext must start with "Try asking for"')
  }

  return {
    mode,
    primaryItemId,
    secondaryItemId: mode === 'layer' ? secondaryItemId : null,
    title,
    reasoning,
    wearingNote,
    futureDirection,
    tryNext,
  }
}

export function emptyWardrobeSituationFallback(situation: string, profile: ScentProfile): SituationRecommendation {
  return {
    mode: 'single',
    primaryItemId: IDENTITY_LED_ITEM_ID,
    secondaryItemId: null,
    title: 'Identity-Led Direction',
    reasoning: `For ${situation.trim()}, reach for a profile-aligned direction built around ${profile.identity.signatureFamilies[0] ?? 'balanced'} structure and controlled projection.`,
    wearingNote: 'Keep application focused at pulse points and avoid overspraying until the wardrobe is deeper.',
    futureDirection: profile.identity.wardrobeGaps[0] ?? 'Build one versatile daily anchor next.',
    tryNext: 'Try asking for a sharper, warmer, cleaner, or more intimate version.',
  }
}
