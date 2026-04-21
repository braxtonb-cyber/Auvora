import type { GapRadarInsights, ScentProfile } from '@/lib/scent/types'

const FAMILY_DIRECTIONS: Record<string, string> = {
  fresh: 'clean daytime structure',
  woody: 'dry backbone for sharper tailoring moments',
  amber: 'warmer evening architecture',
  citrus: 'bright opening energy',
  musky: 'skin-close continuity',
  floral: 'soft diffusion for intimate settings',
  spicy: 'textured contrast for nights',
  green: 'air and lift for daytime edits',
  aquatic: 'transparent clarity for heat',
}

function familyCounts(profile: ScentProfile): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const item of profile.wardrobe) {
    for (const family of item.families) {
      counts[family] = (counts[family] ?? 0) + 1
    }
  }
  return counts
}

export function computeGapRadar(profile: ScentProfile): GapRadarInsights {
  const counts = familyCounts(profile)
  const topFamilies = profile.wearPatterns.topFamilies

  const blindSpots = profile.wearPatterns.neglectedFamilies.length > 0
    ? profile.wearPatterns.neglectedFamilies.map((family) =>
        FAMILY_DIRECTIONS[family] ?? `${family} coverage`
      )
    : ['No critical blind spot; focus on texture balance instead']

  const familyImbalance: string[] = []
  const dominantCount = topFamilies.length > 0 ? (counts[topFamilies[0]] ?? 0) : 0

  if (topFamilies.length > 0 && dominantCount >= 2) {
    familyImbalance.push(`Current wardrobe leans heavily toward ${topFamilies[0]}`)
  }

  if ((counts.fresh ?? 0) === 0 && (counts.citrus ?? 0) === 0) {
    familyImbalance.push('Daytime freshness is underrepresented')
  }

  if ((counts.woody ?? 0) === 0 && (counts.amber ?? 0) === 0) {
    familyImbalance.push('Evening structure is thinner than ideal')
  }

  const undercoveredOccasions = profile.wearPatterns.undercoveredOccasions

  const nextDirection = undercoveredOccasions.includes('daily')
    ? 'Build one quiet daytime anchor with controlled projection.'
    : undercoveredOccasions.includes('evening')
      ? 'Add one textured evening direction with stronger longevity.'
      : undercoveredOccasions.includes('office')
        ? 'Add a polished office-safe signature that stays precise at close range.'
        : 'Refine family balance before increasing bottle count.'

  const summary = blindSpots[0]
    ? `You are covered in ${topFamilies.slice(0, 2).join(' and ') || 'core families'}, but ${blindSpots[0]} is still missing.`
    : 'Your wardrobe is balanced; prioritize smarter weekly rotation over expansion.'

  return {
    blindSpots: blindSpots.slice(0, 3),
    undercoveredOccasions: undercoveredOccasions.slice(0, 3),
    familyImbalance: familyImbalance.slice(0, 3),
    nextDirection,
    summary,
  }
}
