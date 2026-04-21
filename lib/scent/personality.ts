import type {
  ProjectionPreference,
  ScentOnboardingAnswers,
  ScentPersonality,
  ScentPreferences,
  ScentWardrobeItem,
  ScentWearPatterns,
} from '@/lib/scent/types'

interface PersonalityInputs {
  onboarding: ScentOnboardingAnswers
  wardrobe: ScentWardrobeItem[]
  wearPatterns: ScentWearPatterns
  preferences: ScentPreferences
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function projectionStyle(projection: ProjectionPreference): 'close' | 'moderate' | 'commanding' {
  if (projection === 'assertive') return 'commanding'
  if (projection === 'moderate') return 'moderate'
  return 'close'
}

function dominantFamily(wardrobe: ScentWardrobeItem[]): string {
  const counts: Record<string, number> = {}
  for (const item of wardrobe) {
    for (const family of item.families) {
      counts[family] = (counts[family] ?? 0) + 1 + (item.wearCount ?? 0) * 0.2
    }
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  return sorted[0]?.[0] ?? 'woody'
}

function wearsConcentrated(wardrobe: ScentWardrobeItem[]): boolean {
  const ranked = wardrobe
    .slice()
    .sort((a, b) => (b.wearCount ?? 0) - (a.wearCount ?? 0))
    .slice(0, 2)

  const topWears = ranked.reduce((sum, item) => sum + (item.wearCount ?? 0), 0)
  const totalWears = wardrobe.reduce((sum, item) => sum + (item.wearCount ?? 0), 0)
  if (totalWears === 0) return false
  return topWears / totalWears >= 0.65
}

function seasonCoverageCount(wardrobe: ScentWardrobeItem[]): number {
  const set = new Set<string>()
  for (const item of wardrobe) {
    for (const season of item.seasonTags ?? []) set.add(season)
  }
  return set.size
}

export function assignScentPersonality(inputs: PersonalityInputs): ScentPersonality {
  const { wardrobe, wearPatterns, preferences } = inputs

  if (wardrobe.length < 3) return 'Undiscovered'

  const dominant = dominantFamily(wardrobe)
  const warmFamilies = new Set(['gourmand', 'amber', 'vanilla', 'oriental', 'resinous'])
  const freshFamilies = new Set(['fresh', 'citrus', 'aquatic'])
  const darkFamilies = new Set(['woody', 'oriental', 'resinous', 'amber'])

  const sweetnessTendency = average(wardrobe.map((item) => item.sweetness === 'high' ? 8 : item.sweetness === 'medium' ? 5 : 2))
  const proj = projectionStyle(wearPatterns.projectionBias)
  const topOccasions = wearPatterns.topOccasions

  if (warmFamilies.has(dominant) && preferences.layeringTendency === 'layer-first') {
    return 'Warm Layering Specialist'
  }

  if (warmFamilies.has(dominant) && (preferences.layeringTendency === 'solo-first' || wearsConcentrated(wardrobe))) {
    return 'Warm Signature Wearer'
  }

  if (topOccasions.includes('date-night') && sweetnessTendency > 6) {
    return 'Date Night Specialist'
  }

  if (darkFamilies.has(dominant) && (proj === 'commanding' || wearPatterns.timeOfDayBias === 'evening')) {
    return 'Dark & Deliberate'
  }

  if (freshFamilies.has(dominant) && proj === 'commanding') {
    return 'Clean Projection'
  }

  if (freshFamilies.has(dominant) && sweetnessTendency < 4.5) {
    return 'Fresh & Functional'
  }

  if (proj === 'close' && !preferences.complimentStyle.some((line) => line.includes('ask what'))) {
    return 'Quiet Luxury'
  }

  if (seasonCoverageCount(wardrobe) >= 3) {
    return 'Seasonal Rotator'
  }

  return 'Seasonal Rotator'
}

export function deriveSupportingTraits(
  personality: ScentPersonality,
  topFamilies: string[],
  projection: ProjectionPreference
): string[] {
  const traitSet = new Set<string>()

  const familyLine = topFamilies.slice(0, 2).join(' + ')
  if (familyLine) traitSet.add(`Signature families: ${familyLine}`)

  if (projection === 'skin') traitSet.add('Skin-close presence')
  if (projection === 'soft') traitSet.add('Soft projection discipline')
  if (projection === 'moderate') traitSet.add('Room-aware moderation')
  if (projection === 'assertive') traitSet.add('Commanding projection')

  const personalityTraits: Record<ScentPersonality, string[]> = {
    'Warm Signature Wearer': ['Warm anchor concentration', 'Reliable signature continuity'],
    'Warm Layering Specialist': ['Layer-built warmth', 'Textural routine confidence'],
    'Fresh & Functional': ['Daytime usability', 'Clean practical structure'],
    'Clean Projection': ['Fresh profile with projection intent', 'High-clarity trail'],
    'Dark & Deliberate': ['Evening precision', 'Deliberate depth control'],
    'Quiet Luxury': ['Low-noise elegance', 'Close-range confidence'],
    'Date Night Specialist': ['Evening warmth priority', 'High social resonance'],
    'Seasonal Rotator': ['Season-aware range', 'Flexible wardrobe orchestration'],
    Undiscovered: ['Profile still forming', 'Needs wardrobe depth'],
  }

  for (const trait of personalityTraits[personality]) traitSet.add(trait)
  return Array.from(traitSet).slice(0, 4)
}
