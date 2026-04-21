import type { DailyReachResult, ScentProfile, ScentWardrobeItem } from '@/lib/scent/types'

interface ScoredItem {
  item: ScentWardrobeItem
  score: number
}

function daysSince(isoDate: string | null | undefined): number {
  if (!isoDate) return 60
  const parsed = Date.parse(isoDate)
  if (!Number.isFinite(parsed)) return 60
  return Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24))
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function scoreItem(item: ScentWardrobeItem, profile: ScentProfile): number {
  const signatureFamilies = new Set(profile.identity.signatureFamilies)
  const contrastFamilies = new Set(profile.identity.contrastFamilies)
  const overused = new Set(profile.wearPatterns.overusedItemIds)

  const signatureFit = item.families.reduce((sum, family) => sum + (signatureFamilies.has(family) ? 10 : 0), 0)
  const contrastLift = item.families.reduce((sum, family) => sum + (contrastFamilies.has(family) ? 4 : 0), 0)

  const wearCount = item.wearCount ?? 0
  const recencyDays = daysSince(item.lastWornAt)
  const underuseBonus = clamp(8 - wearCount, 0, 8)
  const rotationBonus = clamp(recencyDays / 7, 0, 8)
  const signatureScore = (item.signatureScore ?? 55) * 0.4
  const ratingBonus = (item.personalRating ?? 7) * 2
  const projectionMatch = item.projection === profile.preferences.projectionComfort ? 8 : 0
  const overusedPenalty = overused.has(item.id) ? 12 : 0
  const heavyRotationPenalty = wearCount >= 8 ? (wearCount - 7) * 1.5 : 0

  return (
    signatureFit +
    contrastLift +
    underuseBonus +
    rotationBonus +
    signatureScore +
    ratingBonus +
    projectionMatch -
    overusedPenalty -
    heavyRotationPenalty
  )
}

function explain(primary: ScentWardrobeItem, profile: ScentProfile): string {
  const familySlice = primary.families.slice(0, 2).join(' and ')
  const personality = profile.identity.scentPersonality
  const overusedSet = new Set(profile.wearPatterns.overusedItemIds)
  const rotationCue = overusedSet.has(primary.id)
    ? 'It still fits your profile, but rotate it lightly this week.'
    : 'It matches your profile without repeating your loudest habit.'

  return `${primary.name} aligns with your ${personality.toLowerCase()} profile through ${familySlice || 'balanced structure'}. ${rotationCue}`
}

export function computeDailyReach(profile: ScentProfile): DailyReachResult {
  const owned = profile.wardrobe.filter((item) => item.owned)

  if (owned.length === 0) {
    return {
      title: 'Identity-led reach',
      primaryItemId: null,
      alternateItemIds: [],
      rationale:
        'No wardrobe is logged yet. Anchor your next wear in your profile: keep projection controlled and center your signature families.',
    }
  }

  const scored: ScoredItem[] = owned
    .map((item) => ({ item, score: scoreItem(item, profile) }))
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))

  const primary = scored[0].item
  const alternates = scored.slice(1, 3).map((entry) => entry.item.id)

  return {
    title: 'Daily Reach',
    primaryItemId: primary.id,
    alternateItemIds: alternates,
    rationale: explain(primary, profile),
  }
}
