import {
  DEFAULT_FRESHNESS,
  DEFAULT_ONBOARDING_ANSWERS,
  DEFAULT_PROJECTION,
  DEFAULT_SWEETNESS,
  FAMILY_VOCAB,
  MOOD_VOCAB,
  OCCASION_VOCAB,
  SCENT_PROFILE_VERSION,
  SEASON_VOCAB,
} from '@/lib/scent/constants'
import { assignScentPersonality, deriveSupportingTraits } from '@/lib/scent/personality'
import { computeDailyReach } from '@/lib/scent/daily-reach'
import { computeGapRadar } from '@/lib/scent/gap-radar'
import type {
  ComputedScentIdentity,
  FreshnessLevel,
  ProjectionPreference,
  ScentOnboardingAnswers,
  ScentPreferences,
  ScentProfile,
  ScentWardrobeItem,
  ScentWearPatterns,
  SweetnessLevel,
  WearLogEntry,
} from '@/lib/scent/types'

const FAMILY_KEYWORDS: Record<string, string[]> = {
  amber: ['amber', 'labdanum', 'benzoin', 'resin'],
  woody: ['wood', 'cedar', 'sandal', 'vetiver', 'oud', 'patchouli'],
  vanilla: ['vanilla', 'tonka'],
  fresh: ['fresh', 'clean', 'soap'],
  musky: ['musk', 'skin'],
  floral: ['rose', 'jasmine', 'floral', 'iris', 'violet'],
  citrus: ['bergamot', 'citrus', 'lemon', 'lime', 'orange', 'grapefruit'],
  spicy: ['pepper', 'spice', 'cardamom', 'cinnamon', 'clove'],
  green: ['green', 'leaf', 'fig', 'tea', 'herbal'],
  aquatic: ['marine', 'aquatic', 'water', 'ocean'],
  powdery: ['powder', 'aldehydic', 'lipstick'],
  gourmand: ['gourmand', 'caramel', 'chocolate', 'praline'],
  resinous: ['incense', 'myrrh', 'frankincense', 'resin'],
}

const OCCASION_KEYWORDS: Record<string, string[]> = {
  daily: ['daily', 'everyday', 'routine', 'class'],
  office: ['office', 'work', 'meeting', 'interview'],
  evening: ['evening', 'night', 'dinner'],
  'date-night': ['date', 'romantic'],
  social: ['social', 'party', 'event'],
  formal: ['formal', 'black tie'],
  travel: ['travel', 'flight', 'trip'],
  studio: ['creative', 'studio', 'writing'],
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
}

function detectFamilies(input: string): string[] {
  const text = input.toLowerCase()
  const families = Object.entries(FAMILY_KEYWORDS)
    .filter(([, terms]) => terms.some((term) => text.includes(term)))
    .map(([family]) => family)

  if (families.length === 0) {
    return ['woody', 'fresh']
  }

  return families.slice(0, 3)
}

function detectOccasions(input: string): string[] {
  const text = input.toLowerCase()
  const occasions = Object.entries(OCCASION_KEYWORDS)
    .filter(([, terms]) => terms.some((term) => text.includes(term)))
    .map(([occasion]) => occasion)
  return occasions.length > 0 ? occasions.slice(0, 2) : ['daily']
}

function inferProjection(input: string): ProjectionPreference {
  const text = input.toLowerCase()
  if (text.includes('skin') || text.includes('intimate')) return 'skin'
  if (text.includes('soft')) return 'soft'
  if (text.includes('assertive') || text.includes('statement') || text.includes('loud')) return 'assertive'
  return 'moderate'
}

function inferSweetness(input: string): SweetnessLevel {
  const text = input.toLowerCase()
  if (text.includes('vanilla') || text.includes('amber') || text.includes('gourmand')) return 'high'
  if (text.includes('clean') || text.includes('dry') || text.includes('fresh')) return 'low'
  return 'medium'
}

function inferFreshness(input: string): FreshnessLevel {
  const text = input.toLowerCase()
  if (text.includes('fresh') || text.includes('citrus') || text.includes('clean')) return 'high'
  if (text.includes('resin') || text.includes('amber') || text.includes('dense')) return 'low'
  return 'medium'
}

function normalizeWords(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[,/|]+|\band\b/g)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 6)
}

function buildWardrobeFromHighlights(highlights: string[]): ScentWardrobeItem[] {
  return highlights
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((highlight, index) => {
      const [brandMaybe, nameMaybe] = highlight.split(/[-:]/).map((p) => p.trim())
      const hasBrand = Boolean(brandMaybe && nameMaybe)
      const familyGuess = detectFamilies(highlight)

      return {
        id: `${slugify(hasBrand ? `${brandMaybe}-${nameMaybe}` : highlight)}-${index + 1}`,
        name: hasBrand ? (nameMaybe as string) : highlight,
        brand: hasBrand ? brandMaybe : undefined,
        family: familyGuess[0] ?? 'woody',
        families: familyGuess,
        occasionTags: detectOccasions(highlight),
        energyTags: [],
        projection: inferProjection(highlight),
        sweetness: inferSweetness(highlight),
        freshness: inferFreshness(highlight),
        layeringFriendly: familyGuess.some((family) => ['woody', 'musky', 'vanilla', 'fresh'].includes(family)),
        signatureScore: 58 + (index % 4) * 7,
        wearCount: Math.max(0, 4 - index),
        lastWornAt: null,
        compliments: [],
        personalRating: null,
        owned: true,
        productType: 'fragrance',
        layeringRole: 'anchor',
        isFavorite: false,
        isSignature: index === 0,
        personalNote: '',
      }
    })
}

function projectionRank(value: ProjectionPreference): number {
  return { skin: 0, soft: 1, moderate: 2, assertive: 3 }[value]
}

function toProjectionPreference(values: ProjectionPreference[]): ProjectionPreference {
  if (values.length === 0) return DEFAULT_PROJECTION
  const sorted = [...values].sort((a, b) => projectionRank(a) - projectionRank(b))
  return sorted[Math.floor(sorted.length / 2)]
}

function getTopValues(map: Record<string, number>, limit: number): string[] {
  return Object.entries(map)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value]) => value)
}

function inferCurrentSeason(date = new Date()): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = date.getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

function computeTimeOfDayBias(wearLogs: WearLogEntry[]): 'morning' | 'evening' | 'no-pattern' {
  if (wearLogs.length === 0) return 'no-pattern'
  let morning = 0
  let evening = 0
  for (const log of wearLogs) {
    const hour = new Date(log.wornAt).getHours()
    if (Number.isFinite(hour)) {
      if (hour < 14) morning += 1
      if (hour >= 17) evening += 1
    }
  }
  if (morning === evening) return 'no-pattern'
  return morning > evening ? 'morning' : 'evening'
}

function computeAverageWearsPerWeek(wearLogs: WearLogEntry[]): number {
  if (wearLogs.length === 0) return 0
  const sorted = wearLogs
    .map((log) => Date.parse(log.wornAt))
    .filter((ts) => Number.isFinite(ts))
    .sort((a, b) => a - b)
  if (sorted.length < 2) return Number((wearLogs.length / 1).toFixed(2))
  const days = Math.max(1, (sorted[sorted.length - 1] - sorted[0]) / (1000 * 60 * 60 * 24))
  return Number(((wearLogs.length / days) * 7).toFixed(2))
}

function computeStreakProductId(wearLogs: WearLogEntry[]): string | null {
  if (wearLogs.length < 3) return null
  const sorted = wearLogs
    .slice()
    .sort((a, b) => Date.parse(b.wornAt) - Date.parse(a.wornAt))
    .slice(0, 5)
  const candidate = sorted[0]?.itemId
  if (!candidate) return null
  const streak = sorted.filter((entry) => entry.itemId === candidate).length
  return streak >= 3 ? candidate : null
}

export function computeWearPatterns(
  wardrobe: ScentWardrobeItem[],
  wearLogs: WearLogEntry[] = []
): ScentWearPatterns {
  const familyCounts: Record<string, number> = {}
  const occasionCounts: Record<string, number> = {}
  const projections: ProjectionPreference[] = []
  const recentWearVelocity: Record<string, number> = {}

  for (const family of FAMILY_VOCAB) familyCounts[family] = 0
  for (const occasion of OCCASION_VOCAB) occasionCounts[occasion] = 0

  for (const item of wardrobe) {
    for (const family of item.families) {
      if (family in familyCounts) familyCounts[family] += 1
    }

    for (const occasion of item.occasionTags ?? []) {
      if (occasion in occasionCounts) occasionCounts[occasion] += 1
    }

    if (item.projection) projections.push(item.projection)

    const wearCount = item.wearCount ?? 0
    const recencyPenalty = item.lastWornAt ? Math.max(0, 30 - daysSince(item.lastWornAt)) / 30 : 0.5
    recentWearVelocity[item.id] = Number((wearCount * 0.55 + recencyPenalty * 3).toFixed(2))
  }

  const topFamilies = getTopValues(familyCounts, 3)
  const neglectedFamilies = Object.entries(familyCounts)
    .filter(([, count]) => count === 0)
    .map(([family]) => family)
    .slice(0, 3)

  const topOccasions = getTopValues(occasionCounts, 3)
  const undercoveredOccasions = Object.entries(occasionCounts)
    .filter(([, count]) => count === 0)
    .map(([occasion]) => occasion)
    .slice(0, 3)

  const overusedItemIds = wardrobe
    .filter((item) => (item.wearCount ?? 0) >= 6)
    .sort((a, b) => (b.wearCount ?? 0) - (a.wearCount ?? 0))
    .slice(0, 3)
    .map((item) => item.id)

  const rotationLeaders = wardrobe
    .slice()
    .sort((a, b) => (b.wearCount ?? 0) - (a.wearCount ?? 0))
    .slice(0, 3)
    .map((item) => item.id)

  return {
    topFamilies,
    neglectedFamilies,
    topOccasions,
    undercoveredOccasions,
    projectionBias: toProjectionPreference(projections),
    overusedItemIds,
    rotationLeaders,
    recentWearVelocity,
    wearLogs: wearLogs.slice(-100),
    timeOfDayBias: computeTimeOfDayBias(wearLogs),
    averageWearsPerWeek: computeAverageWearsPerWeek(wearLogs),
    currentSeason: inferCurrentSeason(),
    lastWornItemId: wearLogs.length > 0
      ? wearLogs.slice().sort((a, b) => Date.parse(b.wornAt) - Date.parse(a.wornAt))[0]?.itemId ?? null
      : wardrobe
          .slice()
          .sort((a, b) => Date.parse(b.lastWornAt ?? '') - Date.parse(a.lastWornAt ?? ''))[0]?.id ?? null,
    streakProductId: computeStreakProductId(wearLogs),
  }
}

function derivePreferences(
  onboarding: ScentOnboardingAnswers,
  wardrobe: ScentWardrobeItem[],
  wearPatterns: ScentWearPatterns,
  seed?: Partial<ScentPreferences>
): ScentPreferences {
  const atmosphere = onboarding.atmosphere.toLowerCase()
  const missing = onboarding.missingFeeling.toLowerCase()
  const combined = `${atmosphere} ${missing}`

  const projectionComfort = inferProjection(onboarding.scentTrailPreference || atmosphere)
  const sweetnessTolerance = inferSweetness(combined)
  const freshnessTolerance = inferFreshness(combined)

  const layeringInterest =
    combined.includes('layer') || combined.includes('textured')
      ? 'high'
      : combined.includes('simple') || combined.includes('minimal')
        ? 'low'
        : 'medium'

  const desiredImpressionWords = Array.from(
    new Set([
      ...normalizeWords(onboarding.atmosphere),
      ...normalizeWords(onboarding.missingFeeling),
    ])
  ).slice(0, 6)

  const complimentStyle = onboarding.complimentLanguage
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 4)

  const avoidWords: string[] = []
  if (projectionComfort === 'skin' || projectionComfort === 'soft') avoidWords.push('loud', 'abrasive')
  if (sweetnessTolerance === 'low') avoidWords.push('sugary')
  if (freshnessTolerance === 'low') avoidWords.push('too bright')
  if (wardrobe.length < 2) avoidWords.push('repetition')

  const moodSet = new Set(MOOD_VOCAB as readonly string[])
  const inferredPreferredMoods = desiredImpressionWords.filter((word) => moodSet.has(word)).slice(0, 4)

  const seasonCounts: Record<string, number> = { spring: 0, summer: 0, fall: 0, winter: 0 }
  for (const item of wardrobe) {
    for (const season of item.seasonTags ?? []) {
      if (season in seasonCounts) seasonCounts[season] += 1
    }
  }
  const inferredPreferredSeasons = Object.entries(seasonCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([season]) => season)
    .slice(0, 2)

  if (inferredPreferredSeasons.length === 0) {
    if (onboarding.atmosphere.includes('dark') || onboarding.atmosphere.includes('warm')) {
      inferredPreferredSeasons.push('fall', 'winter')
    } else {
      inferredPreferredSeasons.push('spring', 'summer')
    }
  }

  const inferredFavoriteFamilies = wearPatterns.topFamilies.slice(0, 3)
  const inferredOccasionPriorities = wearPatterns.topOccasions.slice(0, 3)
  const favoriteItemIds = wardrobe
    .slice()
    .sort((a, b) => {
      const scoreA = (a.signatureScore ?? 0) + (a.wearCount ?? 0) * 2
      const scoreB = (b.signatureScore ?? 0) + (b.wearCount ?? 0) * 2
      return scoreB - scoreA
    })
    .slice(0, 3)
    .map((item) => item.id)

  const layeringFriendlyCount = wardrobe.filter((item) => item.layeringFriendly).length
  const layeringTendency =
    layeringInterest === 'high' || layeringFriendlyCount >= 3
      ? 'layer-first'
      : layeringInterest === 'low'
        ? 'solo-first'
        : 'balanced'

  const signatureDirection = [
    projectionComfort === 'assertive' ? 'statement projection' : projectionComfort === 'skin' ? 'skin-trail intimacy' : 'controlled projection',
    inferredFavoriteFamilies.slice(0, 2).join('-') || 'balanced families',
  ].join(', ')

  return {
    desiredImpressionWords: desiredImpressionWords.length > 0 ? desiredImpressionWords : ['polished', 'intentional'],
    avoidWords: Array.from(new Set(avoidWords)).slice(0, 5),
    complimentStyle: complimentStyle.length > 0 ? complimentStyle : ['you smell clean'],
    projectionComfort,
    sweetnessTolerance: sweetnessTolerance || DEFAULT_SWEETNESS,
    freshnessTolerance: freshnessTolerance || DEFAULT_FRESHNESS,
    layeringInterest,
    favoriteFamilies: seed?.favoriteFamilies?.length ? seed.favoriteFamilies.slice(0, 6) : inferredFavoriteFamilies,
    preferredMoods: seed?.preferredMoods?.length ? seed.preferredMoods.slice(0, 6) : (inferredPreferredMoods.length ? inferredPreferredMoods : ['polished', 'warm']),
    preferredSeasons: seed?.preferredSeasons?.length
      ? seed.preferredSeasons.filter((season) => (SEASON_VOCAB as readonly string[]).includes(season)).slice(0, 4)
      : inferredPreferredSeasons.slice(0, 4),
    occasionPriorities: seed?.occasionPriorities?.length ? seed.occasionPriorities.slice(0, 4) : inferredOccasionPriorities,
    layeringTendency: seed?.layeringTendency ?? layeringTendency,
    signatureDirection: seed?.signatureDirection?.trim() ? seed.signatureDirection.trim() : signatureDirection,
    favoriteItemIds: seed?.favoriteItemIds?.length ? seed.favoriteItemIds.slice(0, 6) : favoriteItemIds,
  }
}

function deriveSignatureFamilies(wardrobe: ScentWardrobeItem[]): string[] {
  const counts: Record<string, number> = {}
  for (const item of wardrobe) {
    for (const family of item.families) {
      counts[family] = (counts[family] ?? 0) + 1
    }
  }
  return getTopValues(counts, 3)
}

function deriveContrastFamilies(signatureFamilies: string[]): string[] {
  const contrast = FAMILY_VOCAB.filter((family) => !signatureFamilies.includes(family))
  return contrast.slice(0, 2)
}

function deriveStrengths(wardrobe: ScentWardrobeItem[], wearPatterns: ScentWearPatterns): string[] {
  const strengths: string[] = []

  if (wardrobe.length >= 4) strengths.push('Enough wardrobe depth for rotation planning')
  if (wearPatterns.topOccasions.length >= 2) strengths.push('Clear occasion anchors already present')
  if (wearPatterns.topFamilies.length >= 2) strengths.push(`Strong core in ${wearPatterns.topFamilies.slice(0, 2).join(' and ')}`)
  if (wardrobe.some((item) => item.layeringFriendly)) strengths.push('Layer-capable anchors available')

  if (strengths.length === 0) strengths.push('A focused base ready to expand deliberately')
  return strengths.slice(0, 3)
}

function deriveConfidenceNotes(onboarding: ScentOnboardingAnswers, personality: string): string[] {
  const notes = [
    `Assigned profile: ${personality}`,
    `Missing feeling captured: ${onboarding.missingFeeling}`,
    'Profile updates each time wardrobe and wear data changes',
  ]
  return notes
}

function daysSince(isoDate: string): number {
  const parsed = Date.parse(isoDate)
  if (!Number.isFinite(parsed)) return 365
  return Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24))
}

export function deriveIdentity(
  onboarding: ScentOnboardingAnswers,
  wardrobe: ScentWardrobeItem[],
  wearPatterns: ScentWearPatterns,
  preferences: ScentPreferences
): ComputedScentIdentity {
  const scentPersonality = assignScentPersonality({ onboarding, wardrobe, wearPatterns, preferences })
  const signatureFamilies = deriveSignatureFamilies(wardrobe)
  const gapInsights = computeGapRadar({
    version: SCENT_PROFILE_VERSION,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    onboarding,
    wardrobe,
    wearPatterns,
    preferences,
    identity: {
      scentPersonality,
      supportingTraits: [],
      signatureFamilies,
      contrastFamilies: [],
      wardrobeStrengths: [],
      wardrobeGaps: [],
      dailyReachItemIds: [],
      confidenceNotes: [],
    },
  })

  const supportingTraits = deriveSupportingTraits(
    scentPersonality,
    wearPatterns.topFamilies,
    preferences.projectionComfort
  )

  const dailyReach = computeDailyReach({
    version: SCENT_PROFILE_VERSION,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    onboarding,
    wardrobe,
    wearPatterns,
    preferences,
    identity: {
      scentPersonality,
      supportingTraits,
      signatureFamilies,
      contrastFamilies: [],
      wardrobeStrengths: [],
      wardrobeGaps: gapInsights.blindSpots,
      dailyReachItemIds: [],
      confidenceNotes: [],
    },
  })

  return {
    scentPersonality,
    supportingTraits,
    signatureFamilies,
    contrastFamilies: deriveContrastFamilies(signatureFamilies),
    wardrobeStrengths: deriveStrengths(wardrobe, wearPatterns),
    wardrobeGaps: gapInsights.blindSpots,
    dailyReachItemIds: dailyReach.primaryItemId
      ? [dailyReach.primaryItemId, ...dailyReach.alternateItemIds].slice(0, 3)
      : [],
    confidenceNotes: deriveConfidenceNotes(onboarding, scentPersonality),
  }
}

function sanitizeOnboarding(partial?: Partial<ScentOnboardingAnswers>): ScentOnboardingAnswers {
  const merged = {
    ...DEFAULT_ONBOARDING_ANSWERS,
    ...partial,
  }

  return {
    atmosphere: (merged.atmosphere || DEFAULT_ONBOARDING_ANSWERS.atmosphere).trim(),
    scentTrailPreference: (merged.scentTrailPreference || DEFAULT_ONBOARDING_ANSWERS.scentTrailPreference).trim(),
    complimentLanguage: Array.isArray(merged.complimentLanguage)
      ? merged.complimentLanguage.map((item) => item.trim()).filter(Boolean)
      : DEFAULT_ONBOARDING_ANSWERS.complimentLanguage,
    currentWardrobeHighlights: Array.isArray(merged.currentWardrobeHighlights)
      ? merged.currentWardrobeHighlights.map((item) => item.trim()).filter(Boolean)
      : [],
    missingFeeling: (merged.missingFeeling || DEFAULT_ONBOARDING_ANSWERS.missingFeeling).trim(),
  }
}

export function buildScentProfile(input?: {
  onboarding?: Partial<ScentOnboardingAnswers>
  wardrobe?: ScentWardrobeItem[]
  wearLogs?: WearLogEntry[]
  preferencesSeed?: Partial<ScentPreferences>
  createdAt?: string
}): ScentProfile {
  const now = new Date().toISOString()
  const onboarding = sanitizeOnboarding(input?.onboarding)
  const wardrobe = (input?.wardrobe && input.wardrobe.length > 0)
    ? input.wardrobe
    : buildWardrobeFromHighlights(onboarding.currentWardrobeHighlights)
  const wearPatterns = computeWearPatterns(wardrobe, input?.wearLogs)
  const preferences = derivePreferences(onboarding, wardrobe, wearPatterns, input?.preferencesSeed)
  const identity = deriveIdentity(onboarding, wardrobe, wearPatterns, preferences)

  return {
    version: SCENT_PROFILE_VERSION,
    createdAt: input?.createdAt ?? now,
    updatedAt: now,
    onboarding,
    wardrobe,
    wearPatterns,
    preferences,
    identity,
  }
}

export function refreshScentProfile(profile: ScentProfile): ScentProfile {
  return buildScentProfile({
    onboarding: profile.onboarding,
    wardrobe: profile.wardrobe,
    wearLogs: profile.wearPatterns.wearLogs,
    preferencesSeed: profile.preferences,
    createdAt: profile.createdAt,
  })
}

export function emptyWardrobeFallbackProfile(): ScentProfile {
  return buildScentProfile({
    onboarding: {
      atmosphere: 'clean and deliberate',
      scentTrailPreference: 'soft',
      complimentLanguage: ['you smell clean'],
      currentWardrobeHighlights: [],
      missingFeeling: 'a clearer signature direction',
    },
    wardrobe: [],
    wearLogs: [],
  })
}

export function isScentProfile(value: unknown): value is ScentProfile {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ScentProfile>
  return (
    typeof candidate.version === 'number' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    !!candidate.onboarding &&
    !!candidate.preferences &&
    !!candidate.identity &&
    Array.isArray(candidate.wardrobe)
  )
}

export function parseScentProfile(value: unknown): ScentProfile {
  if (!isScentProfile(value)) {
    throw new Error('Invalid scent profile payload')
  }

  if (value.version !== SCENT_PROFILE_VERSION) {
    return buildScentProfile({
      onboarding: value.onboarding,
      wardrobe: value.wardrobe,
      wearLogs: value.wearPatterns?.wearLogs,
      preferencesSeed: value.preferences,
      createdAt: value.createdAt,
    })
  }

  return refreshScentProfile(value)
}
