import { refreshScentProfile } from '@/lib/scent/profile-builders'
import type {
  ScentPreferences,
  ScentProfile,
  ScentWardrobeItem,
  WearLogEntry,
} from '@/lib/scent/types'

interface WearLogInput {
  itemId: string
  occasion?: string
  weather?: 'hot' | 'mild' | 'cool' | 'cold'
  note?: string
}

export function withUpdatedPreferences(
  profile: ScentProfile,
  updates: Partial<ScentPreferences>
): ScentProfile {
  return refreshScentProfile({
    ...profile,
    updatedAt: new Date().toISOString(),
    preferences: {
      ...profile.preferences,
      ...updates,
    },
  })
}

export function withFavoriteToggled(profile: ScentProfile, itemId: string): ScentProfile {
  const set = new Set(profile.preferences.favoriteItemIds)
  if (set.has(itemId)) set.delete(itemId)
  else set.add(itemId)

  const wardrobe = profile.wardrobe.map((item) =>
    item.id === itemId
      ? { ...item, isFavorite: !item.isFavorite }
      : item
  )

  return refreshScentProfile({
    ...profile,
    wardrobe,
    preferences: {
      ...profile.preferences,
      favoriteItemIds: Array.from(set).slice(0, 12),
    },
  })
}

export function withImportedProducts(
  profile: ScentProfile,
  products: ScentWardrobeItem[]
): ScentProfile {
  const existingById = new Map(profile.wardrobe.map((item) => [item.id, item]))
  const merged = [...profile.wardrobe]

  for (const product of products) {
    const existing = existingById.get(product.id)
    if (existing) {
      const idx = merged.findIndex((item) => item.id === product.id)
      merged[idx] = {
        ...existing,
        ...product,
        wearCount: existing.wearCount ?? product.wearCount ?? 0,
        lastWornAt: existing.lastWornAt ?? product.lastWornAt ?? null,
      }
      continue
    }
    merged.push(product)
  }

  return refreshScentProfile({
    ...profile,
    wardrobe: merged,
    onboarding: {
      ...profile.onboarding,
      currentWardrobeHighlights: merged.map((item) => (item.brand ? `${item.brand} - ${item.name}` : item.name)).slice(0, 20),
    },
  })
}

export function withWearLogged(profile: ScentProfile, input: WearLogInput): ScentProfile {
  const now = new Date().toISOString()
  const wearLog: WearLogEntry = {
    id: `wear-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    itemId: input.itemId,
    wornAt: now,
    occasion: input.occasion,
    weather: input.weather,
    note: input.note?.trim() || undefined,
  }

  const wardrobe = profile.wardrobe.map((item) =>
    item.id === input.itemId
      ? {
          ...item,
          wearCount: (item.wearCount ?? 0) + 1,
          lastWornAt: now,
        }
      : item
  )

  const wearLogs = [...profile.wearPatterns.wearLogs, wearLog].slice(-200)

  return refreshScentProfile({
    ...profile,
    wardrobe,
    wearPatterns: {
      ...profile.wearPatterns,
      wearLogs,
    },
  })
}
