import type { RotationInsights, ScentProfile, ScentWardrobeItem } from '@/lib/scent/types'

function daysSince(isoDate: string | null | undefined): number {
  if (!isoDate) return 999
  const parsed = Date.parse(isoDate)
  if (!Number.isFinite(parsed)) return 999
  return Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24))
}

function owned(profile: ScentProfile): ScentWardrobeItem[] {
  return profile.wardrobe.filter((item) => item.owned)
}

export function computeRotationInsights(profile: ScentProfile): RotationInsights {
  const items = owned(profile)

  if (items.length === 0) {
    return {
      mostWornIds: [],
      underusedGemIds: [],
      overdueReachIds: [],
      weeklyRotationIds: [],
      summary: 'No wardrobe data yet. Add a few regular wears to unlock rotation intelligence.',
    }
  }

  const mostWornIds = items
    .slice()
    .sort((a, b) => (b.wearCount ?? 0) - (a.wearCount ?? 0))
    .slice(0, 3)
    .map((item) => item.id)

  const underusedGemIds = items
    .filter((item) => (item.signatureScore ?? 0) >= 65 || (item.personalRating ?? 0) >= 8)
    .slice()
    .sort((a, b) => {
      const wearDelta = (a.wearCount ?? 0) - (b.wearCount ?? 0)
      if (wearDelta !== 0) return wearDelta
      return (b.signatureScore ?? 0) - (a.signatureScore ?? 0)
    })
    .slice(0, 3)
    .map((item) => item.id)

  const overdueReachIds = items
    .slice()
    .sort((a, b) => daysSince(b.lastWornAt) - daysSince(a.lastWornAt))
    .filter((item) => daysSince(item.lastWornAt) >= 10)
    .slice(0, 3)
    .map((item) => item.id)

  const weeklyRotationIds = items
    .slice()
    .sort((a, b) => {
      const freshness = daysSince(b.lastWornAt) - daysSince(a.lastWornAt)
      if (freshness !== 0) return freshness
      return (a.wearCount ?? 0) - (b.wearCount ?? 0)
    })
    .slice(0, 4)
    .map((item) => item.id)

  const summary =
    underusedGemIds.length > 0
      ? 'Your strongest move this week is rotating back high-fit bottles you have underplayed.'
      : 'Your rotation is active; keep spacing high-frequency bottles to preserve signature impact.'

  return {
    mostWornIds,
    underusedGemIds,
    overdueReachIds,
    weeklyRotationIds,
    summary,
  }
}
