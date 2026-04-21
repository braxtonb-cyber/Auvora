import type {
  FreshnessLevel,
  ProjectionPreference,
  ScentOnboardingAnswers,
  ScentPersonality,
  SweetnessLevel,
} from '@/lib/scent/types'

export const SCENT_PROFILE_VERSION = 1

export const SCENT_PERSONALITIES: readonly ScentPersonality[] = [
  'Warm Signature Wearer',
  'Warm Layering Specialist',
  'Fresh & Functional',
  'Clean Projection',
  'Dark & Deliberate',
  'Quiet Luxury',
  'Date Night Specialist',
  'Seasonal Rotator',
  'Undiscovered',
] as const

export const FAMILY_VOCAB = [
  'amber',
  'woody',
  'vanilla',
  'fresh',
  'musky',
  'floral',
  'citrus',
  'spicy',
  'green',
  'aquatic',
  'powdery',
  'gourmand',
  'resinous',
] as const

export const OCCASION_VOCAB = [
  'daily',
  'office',
  'evening',
  'date-night',
  'social',
  'formal',
  'travel',
  'studio',
] as const

export const ENERGY_VOCAB = [
  'polished',
  'seductive',
  'clean',
  'cozy',
  'mysterious',
  'focused',
  'warm',
  'textured',
] as const

export const MOOD_VOCAB = [
  'polished',
  'magnetic',
  'intimate',
  'clean',
  'mysterious',
  'warm',
  'focused',
  'cozy',
] as const

export const SEASON_VOCAB = ['spring', 'summer', 'fall', 'winter'] as const

export const BANNED_CHEESY_PHRASES = [
  'boss energy',
  'fragrance queen',
  'screams',
  'main character',
  'iconic',
  'slay',
  'baddie',
  'it girl',
  'vibes',
] as const

export const DEFAULT_ONBOARDING_ANSWERS: ScentOnboardingAnswers = {
  atmosphere: 'clean and deliberate',
  scentTrailPreference: 'soft',
  complimentLanguage: ['you smell clean'],
  currentWardrobeHighlights: [],
  missingFeeling: 'more structure for daytime',
}

export const DEFAULT_PROJECTION: ProjectionPreference = 'soft'
export const DEFAULT_SWEETNESS: SweetnessLevel = 'medium'
export const DEFAULT_FRESHNESS: FreshnessLevel = 'medium'

export const RITUAL_QUESTIONS = {
  atmosphere: {
    title: 'What kind of presence feels most like you?',
    subtitle: 'Choose the atmosphere that reads like your baseline signature.',
    options: [
      'dark and deliberate',
      'clean and collected',
      'warm and textured',
      'bright and magnetic',
      'soft and intimate',
      'balanced and versatile',
    ],
  },
  scentTrailPreference: {
    title: 'How should your scent arrive?',
    subtitle: 'Pick how close or far your scent should register in a room.',
    options: [
      { label: 'Skin-close', value: 'skin' },
      { label: 'Soft', value: 'soft' },
      { label: 'Moderate', value: 'moderate' },
      { label: 'Assertive', value: 'assertive' },
    ],
  },
  complimentLanguage: {
    title: 'What do people actually say when they smell you?',
    subtitle: 'Select what you hear most often; this calibrates your social scent read.',
    options: [
      'you smell clean',
      'you smell warm',
      'you smell expensive',
      'you smell comforting',
      'you smell magnetic',
      'you smell soft',
    ],
  },
  currentWardrobeHighlights: {
    title: 'What do you already reach for?',
    subtitle: 'List bottles you already use so recommendations start from reality.',
  },
  missingFeeling: {
    title: 'What feels missing from your scent life right now?',
    subtitle: 'Name the gap so we can guide from profile instead of from scratch.',
    options: [
      'clean daytime structure',
      'warmer evening depth',
      'more intimate signature',
      'a sharper professional edge',
      'better rotation variety',
      'a confident statement option',
    ],
  },
} as const
