import type { ScentWardrobeItem } from '@/lib/scent/types'

export interface ParsedWardrobeItem {
  name: string
  brand?: string
  family?: string
  notes?: string[]
  seasons?: string[]
  occasions?: string[]
  sweetness?: number
  freshness?: number
  projection?: number
  longevity?: number
  layeringRole?: 'anchor' | 'booster' | 'projection' | 'softener'
  productType?: 'fragrance' | 'body_mist' | 'body_spray' | 'body_oil' | 'body_cream' | 'fragrance_oil' | 'roll_on_oil'
}

const FAMILY_KEYWORDS: Record<string, string[]> = {
  gourmand: ['gourmand', 'vanilla', 'caramel', 'praline', 'sweet'],
  amber: ['amber', 'resin', 'labdanum'],
  woody: ['woody', 'cedar', 'sandal', 'vetiver', 'oud', 'patchouli'],
  fresh: ['fresh', 'clean', 'soap'],
  citrus: ['citrus', 'bergamot', 'orange', 'lemon', 'grapefruit', 'lime'],
  aquatic: ['aquatic', 'marine', 'water', 'ocean'],
  floral: ['floral', 'rose', 'jasmine', 'iris', 'violet'],
  musky: ['musk', 'skin'],
  spicy: ['spice', 'pepper', 'cardamom', 'cinnamon'],
  oriental: ['oriental', 'incense', 'myrrh', 'smoke'],
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

function clamp(input: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, input))
}

function detectFamily(text: string): string {
  const lower = text.toLowerCase()
  for (const [family, words] of Object.entries(FAMILY_KEYWORDS)) {
    if (words.some((word) => lower.includes(word))) return family
  }
  return 'woody'
}

function familiesFromPrimary(primary: string, notes: string[] = []): string[] {
  const set = new Set<string>()
  set.add(primary)

  for (const note of notes) {
    set.add(detectFamily(note))
  }

  if (set.size < 2) {
    if (primary === 'gourmand' || primary === 'amber') set.add('woody')
    else if (primary === 'fresh' || primary === 'citrus') set.add('musky')
    else set.add('fresh')
  }

  return Array.from(set).slice(0, 3)
}

export function fallbackParseWardrobeInput(raw: string): ParsedWardrobeItem[] {
  const lines = raw
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.slice(0, 24).map((line) => {
    const [brandMaybe, nameMaybe] = line.split(/[-:]/).map((part) => part.trim())
    const hasBrand = Boolean(brandMaybe && nameMaybe)
    const name = hasBrand ? (nameMaybe as string) : line
    const brand = hasBrand ? brandMaybe : undefined
    const family = detectFamily(line)

    return {
      name,
      brand,
      family,
      notes: [],
      seasons: ['fall', 'winter'],
      occasions: ['everyday', 'casual'],
      sweetness: family === 'gourmand' ? 8 : family === 'fresh' || family === 'citrus' ? 3 : 5,
      freshness: family === 'fresh' || family === 'citrus' ? 8 : 4,
      projection: 6,
      longevity: 6,
      layeringRole: 'anchor',
      productType: 'fragrance',
    }
  })
}

export function toWardrobeItems(parsed: ParsedWardrobeItem[]): ScentWardrobeItem[] {
  return parsed.flatMap((item) => {
      const name = item.name?.trim()
      if (!name) return []

      const family = item.family?.trim().toLowerCase() || detectFamily(name)
      const notes = (item.notes ?? []).map((note) => note.trim()).filter(Boolean).slice(0, 6)
      const seasons = (item.seasons ?? []).map((season) => season.toLowerCase()).filter(Boolean).slice(0, 4)
      const occasions = (item.occasions ?? []).map((occasion) => occasion.toLowerCase()).filter(Boolean).slice(0, 4)
      const projectionScore = clamp(Math.round(item.projection ?? 6), 1, 10)
      const projectionPref = projectionScore >= 8 ? 'assertive' : projectionScore >= 5 ? 'moderate' : 'soft'
      const sweetnessScore = clamp(Math.round(item.sweetness ?? 5), 1, 10)
      const sweetness = sweetnessScore >= 7 ? 'high' : sweetnessScore >= 4 ? 'medium' : 'low'
      const freshnessScore = clamp(Math.round(item.freshness ?? 5), 1, 10)
      const freshness = freshnessScore >= 7 ? 'high' : freshnessScore >= 4 ? 'medium' : 'low'

      const wardrobeItem: ScentWardrobeItem = {
        id: slugify(`${item.brand ?? 'unknown'}-${name}`),
        name,
        brand: item.brand?.trim() || undefined,
        family,
        families: familiesFromPrimary(family, notes),
        notes,
        seasonTags: seasons,
        occasionTags: occasions,
        energyTags: [],
        projection: projectionPref,
        sweetness,
        freshness,
        longevityHours: clamp(Math.round(item.longevity ?? 6), 1, 14),
        layeringFriendly: item.layeringRole !== 'projection',
        signatureScore: 62,
        wearCount: 0,
        lastWornAt: null,
        compliments: [],
        personalRating: null,
        owned: true,
        layeringRole: item.layeringRole ?? 'anchor',
        productType: item.productType ?? 'fragrance',
        isFavorite: false,
        isSignature: false,
        personalNote: '',
      }

      return [wardrobeItem]
    })
}

export function validateParsedWardrobePayload(value: unknown): ParsedWardrobeItem[] {
  if (!Array.isArray(value)) throw new Error('Parsed payload must be an array')
  return value
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => {
      const item = entry as Record<string, unknown>
      return {
        name: typeof item.name === 'string' ? item.name : '',
        brand: typeof item.brand === 'string' ? item.brand : undefined,
        family: typeof item.family === 'string' ? item.family.toLowerCase() : undefined,
        notes: Array.isArray(item.notes) ? item.notes.map(String) : undefined,
        seasons: Array.isArray(item.seasons) ? item.seasons.map(String) : undefined,
        occasions: Array.isArray(item.occasions) ? item.occasions.map(String) : undefined,
        sweetness: typeof item.sweetness === 'number' ? item.sweetness : undefined,
        freshness: typeof item.freshness === 'number' ? item.freshness : undefined,
        projection: typeof item.projection === 'number' ? item.projection : undefined,
        longevity: typeof item.longevity === 'number' ? item.longevity : undefined,
        layeringRole:
          item.layeringRole === 'anchor' ||
          item.layeringRole === 'booster' ||
          item.layeringRole === 'projection' ||
          item.layeringRole === 'softener'
            ? item.layeringRole
            : undefined,
        productType:
          item.productType === 'fragrance' ||
          item.productType === 'body_mist' ||
          item.productType === 'body_spray' ||
          item.productType === 'body_oil' ||
          item.productType === 'body_cream' ||
          item.productType === 'fragrance_oil' ||
          item.productType === 'roll_on_oil'
            ? item.productType
            : undefined,
      } satisfies ParsedWardrobeItem
    })
    .filter((item) => item.name.trim().length > 0)
    .slice(0, 24)
}
