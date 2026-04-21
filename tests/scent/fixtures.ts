import { buildScentProfile } from '@/lib/scent/profile-builders'
import type { ScentProfile, ScentWardrobeItem } from '@/lib/scent/types'

export function makeWardrobe(items: Partial<ScentWardrobeItem>[]): ScentWardrobeItem[] {
  return items.map((item, index) => ({
    id: item.id ?? `item-${index + 1}`,
    name: item.name ?? `Item ${index + 1}`,
    brand: item.brand,
    concentration: item.concentration,
    families: item.families ?? ['woody'],
    notes: item.notes,
    seasonTags: item.seasonTags,
    occasionTags: item.occasionTags ?? ['daily'],
    energyTags: item.energyTags,
    projection: item.projection ?? 'moderate',
    sweetness: item.sweetness ?? 'medium',
    freshness: item.freshness ?? 'medium',
    longevityHours: item.longevityHours ?? null,
    layeringFriendly: item.layeringFriendly ?? false,
    signatureScore: item.signatureScore ?? 60,
    wearCount: item.wearCount ?? 0,
    lastWornAt: item.lastWornAt ?? null,
    compliments: item.compliments ?? [],
    personalRating: item.personalRating ?? null,
    owned: item.owned ?? true,
    layeringRole: item.layeringRole ?? 'anchor',
  }))
}

export function makeProfile(overrides?: {
  wardrobe?: ScentWardrobeItem[]
  atmosphere?: string
  trail?: string
  missingFeeling?: string
}): ScentProfile {
  return buildScentProfile({
    onboarding: {
      atmosphere: overrides?.atmosphere ?? 'warm and textured',
      scentTrailPreference: overrides?.trail ?? 'moderate',
      complimentLanguage: ['you smell clean', 'you smell warm'],
      currentWardrobeHighlights: [],
      missingFeeling: overrides?.missingFeeling ?? 'clean daytime structure',
    },
    wardrobe: overrides?.wardrobe ??
      makeWardrobe([
        { id: 'a', name: 'Amber Silk', families: ['amber', 'woody'], wearCount: 7, signatureScore: 85, layeringFriendly: true },
        { id: 'b', name: 'Musk Linen', families: ['fresh', 'musky'], wearCount: 1, signatureScore: 74, lastWornAt: '2026-01-01T00:00:00.000Z' },
        { id: 'c', name: 'Cedar Ink', families: ['woody', 'spicy'], wearCount: 3, signatureScore: 68 },
      ]),
  })
}
