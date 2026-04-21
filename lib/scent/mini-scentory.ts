import { computeDailyReach } from '@/lib/scent/daily-reach'
import type {
  AuraContext,
  AuraScentRecommendation,
  LayeringSuggestion,
  ScentProfile,
  ScentWardrobeItem,
} from '@/lib/scent/types'

interface AuraMapping {
  targetFamilies: string[]
  projection: 'skin' | 'soft' | 'moderate' | 'assertive'
  notes: string[]
}

function auraMapping(aura?: AuraContext): AuraMapping {
  const moment = aura?.moment?.toLowerCase() ?? ''
  const vibe = aura?.vibe?.toLowerCase() ?? ''
  const focus = aura?.focus?.toLowerCase() ?? ''

  const targetFamilies = new Set<string>()
  const notes: string[] = []
  let projection: AuraMapping['projection'] = 'moderate'

  if (moment.includes('social') || moment.includes('night')) {
    targetFamilies.add('amber')
    targetFamilies.add('spicy')
    projection = 'assertive'
    notes.push('Social moments benefit from deeper projection control.')
  }

  if (moment.includes('professional') || moment.includes('work')) {
    targetFamilies.add('woody')
    targetFamilies.add('musky')
    projection = 'soft'
    notes.push('Professional settings favor clear, composed diffusion.')
  }

  if (moment.includes('daily')) {
    targetFamilies.add('fresh')
    targetFamilies.add('citrus')
    projection = 'soft'
    notes.push('Everyday aura reads best with clean structure.')
  }

  if (vibe.includes('bold')) {
    targetFamilies.add('woody')
    targetFamilies.add('amber')
    projection = 'assertive'
    notes.push('Bold aura maps to stronger woody-amber architecture.')
  }

  if (vibe.includes('soft')) {
    targetFamilies.add('musky')
    targetFamilies.add('floral')
    projection = 'skin'
    notes.push('Soft aura leans skin-close with musky-floral lift.')
  }

  if (vibe.includes('sharp')) {
    targetFamilies.add('citrus')
    targetFamilies.add('woody')
    projection = 'moderate'
    notes.push('Sharp aura performs with crisp citrus and dry woods.')
  }

  if (focus.includes('feel')) {
    targetFamilies.add('musky')
    targetFamilies.add('vanilla')
    notes.push('Mood focus supports warmer skin-level coherence.')
  }

  if (focus.includes('look')) {
    targetFamilies.add('woody')
    targetFamilies.add('spicy')
  }

  if (focus.includes('scent')) {
    targetFamilies.add('amber')
    targetFamilies.add('fresh')
  }

  if (targetFamilies.size === 0) {
    targetFamilies.add('woody')
    targetFamilies.add('fresh')
    notes.push('Aura defaults to balanced woody-fresh discipline.')
  }

  return {
    targetFamilies: Array.from(targetFamilies),
    projection,
    notes,
  }
}

function scoreForAura(item: ScentWardrobeItem, mapping: AuraMapping, profile: ScentProfile): number {
  const familyHit = item.families.reduce((sum, family) => sum + (mapping.targetFamilies.includes(family) ? 12 : 0), 0)
  const projectionFit = item.projection === mapping.projection ? 8 : 0
  const moodFit = (item.energyTags ?? []).reduce(
    (sum, tag) => sum + (profile.preferences.preferredMoods.includes(tag) ? 3 : 0),
    0
  )
  const preferenceFit = item.families.reduce(
    (sum, family) => sum + (profile.preferences.favoriteFamilies.includes(family) ? 5 : 0),
    0
  )
  const noveltyLift = Math.max(0, 7 - (item.wearCount ?? 0))
  const signature = (item.signatureScore ?? 55) * 0.35

  return familyHit + projectionFit + moodFit + preferenceFit + noveltyLift + signature
}

function labelFor(item: ScentWardrobeItem): string {
  return item.brand ? `${item.brand} ${item.name}` : item.name
}

export function getOwnedCollection(profile: ScentProfile): ScentWardrobeItem[] {
  return profile.wardrobe.filter((item) => item.owned)
}

export function computeAuraScentRecommendation(
  profile: ScentProfile,
  aura?: AuraContext
): AuraScentRecommendation {
  const owned = getOwnedCollection(profile)
  const mapping = auraMapping(aura)

  if (owned.length === 0) {
    return {
      title: 'For this aura',
      rationale:
        'No owned bottles are saved yet. Anchor in your identity card and build one core bottle aligned to your signature direction.',
      primaryItemId: null,
      alternateItemIds: [],
      auraAlignmentNotes: mapping.notes,
    }
  }

  const sorted = owned
    .map((item) => ({ item, score: scoreForAura(item, mapping, profile) }))
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))

  const primary = sorted[0].item
  const alternateItemIds = sorted.slice(1, 3).map((entry) => entry.item.id)

  const auraDescriptor = [aura?.moment, aura?.vibe, aura?.focus].filter(Boolean).join(' · ')

  return {
    title: auraDescriptor ? `For this aura: ${auraDescriptor}` : 'For this aura',
    rationale: `${labelFor(primary)} aligns with your ${profile.identity.scentPersonality.toLowerCase()} profile and supports ${profile.preferences.signatureDirection}.`,
    primaryItemId: primary.id,
    alternateItemIds,
    auraAlignmentNotes: mapping.notes.slice(0, 3),
  }
}

function complementaryFamily(item: ScentWardrobeItem): string {
  if (item.families.includes('fresh') || item.families.includes('citrus')) return 'woody'
  if (item.families.includes('amber') || item.families.includes('spicy')) return 'musky'
  if (item.families.includes('musky')) return 'citrus'
  return 'fresh'
}

export function computeLayeringSuggestion(profile: ScentProfile): LayeringSuggestion {
  const owned = getOwnedCollection(profile)

  if (owned.length === 0) {
    return {
      title: 'Layering studio',
      primaryItemId: null,
      secondaryItemId: null,
      rationale: 'Add at least one bottle to unlock collection-aware layering logic.',
      wearingNote: 'Start with one skin-close base and add one accent only after 10 minutes.',
    }
  }

  const layeringPool = owned.filter((item) => item.layeringFriendly)
  const primaryCandidate =
    layeringPool.sort((a, b) => (b.signatureScore ?? 0) - (a.signatureScore ?? 0))[0] ??
    computeDailyReach(profile).primaryItemId

  const primary = typeof primaryCandidate === 'string'
    ? owned.find((item) => item.id === primaryCandidate) ?? owned[0]
    : primaryCandidate

  const targetComplement = complementaryFamily(primary)
  const secondary =
    owned.find((item) => item.id !== primary.id && item.families.includes(targetComplement)) ??
    owned.find((item) => item.id !== primary.id && item.layeringFriendly) ??
    null

  if (!secondary) {
    return {
      title: 'Layering studio',
      primaryItemId: primary.id,
      secondaryItemId: null,
      rationale: `${labelFor(primary)} is currently your most reliable solo signature for layered depth without clutter.`,
      wearingNote: 'Use two sprays at chest and one at collar for controlled trail.',
    }
  }

  return {
    title: 'Layering studio',
    primaryItemId: primary.id,
    secondaryItemId: secondary.id,
    rationale: `${labelFor(primary)} + ${labelFor(secondary)} creates texture contrast while staying coherent with your signature direction.`,
    wearingNote: `Apply ${labelFor(primary)} first, then one light pass of ${labelFor(secondary)} on outer fabric.`,
  }
}
