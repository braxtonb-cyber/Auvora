export type ScentPersonality =
  | 'Warm Signature Wearer'
  | 'Warm Layering Specialist'
  | 'Fresh & Functional'
  | 'Clean Projection'
  | 'Dark & Deliberate'
  | 'Quiet Luxury'
  | 'Date Night Specialist'
  | 'Seasonal Rotator'
  | 'Undiscovered'

export type ProjectionPreference = 'skin' | 'soft' | 'moderate' | 'assertive'
export type SweetnessLevel = 'low' | 'medium' | 'high'
export type FreshnessLevel = 'low' | 'medium' | 'high'
export type WearCadence = 'rare' | 'occasional' | 'weekly' | 'heavy-rotation'
export type LayeringTendency = 'solo-first' | 'balanced' | 'layer-first'
export type LayeringRole = 'anchor' | 'booster' | 'projection' | 'softener'

export interface ScentWardrobeItem {
  id: string
  name: string
  brand?: string
  concentration?: string
  families: string[]
  notes?: string[]
  seasonTags?: string[]
  occasionTags?: string[]
  energyTags?: string[]
  projection?: ProjectionPreference
  sweetness?: SweetnessLevel
  freshness?: FreshnessLevel
  longevityHours?: number | null
  layeringFriendly?: boolean
  signatureScore?: number
  wearCount?: number
  lastWornAt?: string | null
  compliments?: string[]
  personalRating?: number | null
  owned: boolean
  productType?: 'fragrance' | 'body_mist' | 'body_spray' | 'body_oil' | 'body_cream' | 'fragrance_oil' | 'roll_on_oil'
  layeringRole?: LayeringRole
  family?: string
  isFavorite?: boolean
  isSignature?: boolean
  personalNote?: string
}

export interface WearLogEntry {
  id: string
  itemId: string
  wornAt: string
  occasion?: string
  weather?: 'hot' | 'mild' | 'cool' | 'cold'
  note?: string
}

export interface ScentWearPatterns {
  topFamilies: string[]
  neglectedFamilies: string[]
  topOccasions: string[]
  undercoveredOccasions: string[]
  projectionBias: ProjectionPreference
  overusedItemIds: string[]
  rotationLeaders: string[]
  recentWearVelocity: Record<string, number>
  wearLogs: WearLogEntry[]
  timeOfDayBias: 'morning' | 'evening' | 'no-pattern'
  averageWearsPerWeek: number
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  lastWornItemId: string | null
  streakProductId: string | null
}

export interface ScentPreferences {
  desiredImpressionWords: string[]
  avoidWords: string[]
  complimentStyle: string[]
  projectionComfort: ProjectionPreference
  sweetnessTolerance: SweetnessLevel
  freshnessTolerance: FreshnessLevel
  layeringInterest: 'low' | 'medium' | 'high'
  favoriteFamilies: string[]
  preferredMoods: string[]
  preferredSeasons: string[]
  occasionPriorities: string[]
  layeringTendency: LayeringTendency
  signatureDirection: string
  favoriteItemIds: string[]
}

export interface ComputedScentIdentity {
  scentPersonality: ScentPersonality
  supportingTraits: string[]
  signatureFamilies: string[]
  contrastFamilies: string[]
  wardrobeStrengths: string[]
  wardrobeGaps: string[]
  dailyReachItemIds: string[]
  confidenceNotes: string[]
}

export interface ScentOnboardingAnswers {
  atmosphere: string
  scentTrailPreference: string
  complimentLanguage: string[]
  currentWardrobeHighlights: string[]
  missingFeeling: string
}

export interface ScentProfile {
  version: number
  createdAt: string
  updatedAt: string
  onboarding: ScentOnboardingAnswers
  wardrobe: ScentWardrobeItem[]
  wearPatterns: ScentWearPatterns
  preferences: ScentPreferences
  identity: ComputedScentIdentity
}

export interface DailyReachResult {
  title: string
  primaryItemId: string | null
  alternateItemIds: string[]
  rationale: string
}

export interface RotationInsights {
  mostWornIds: string[]
  underusedGemIds: string[]
  overdueReachIds: string[]
  weeklyRotationIds: string[]
  summary: string
}

export interface GapRadarInsights {
  blindSpots: string[]
  undercoveredOccasions: string[]
  familyImbalance: string[]
  nextDirection: string
  summary: string
}

export interface SituationRecommendation {
  mode: 'single' | 'layer'
  primaryItemId: string
  secondaryItemId: string | null
  title: string
  reasoning: string
  wearingNote: string
  futureDirection: string | null
  tryNext: string
}

export interface AuraContext {
  moment?: string
  vibe?: string
  focus?: string
}

export interface AuraScentRecommendation {
  title: string
  rationale: string
  primaryItemId: string | null
  alternateItemIds: string[]
  auraAlignmentNotes: string[]
}

export interface LayeringSuggestion {
  title: string
  primaryItemId: string | null
  secondaryItemId: string | null
  rationale: string
  wearingNote: string
}
