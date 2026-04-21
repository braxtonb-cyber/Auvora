import { SCENT_PROFILE_VERSION } from '@/lib/scent/constants'
import { buildScentProfile, isScentProfile, refreshScentProfile } from '@/lib/scent/profile-builders'
import type { ScentOnboardingAnswers, ScentProfile } from '@/lib/scent/types'

const PROFILE_KEY = 'auvora.scentProfile'
const DRAFT_KEY = 'auvora.scentRoutineDraft'
const LEGACY_DRAFT_KEY = 'auvora.scentRitualDraft'

export interface ScentProfileStoreAdapter {
  load: () => Promise<ScentProfile | null> | ScentProfile | null
  save: (profile: ScentProfile) => Promise<void> | void
}

export const localScentProfileAdapter: ScentProfileStoreAdapter = {
  load() {
    return loadLocalScentProfile()
  },
  save(profile) {
    saveLocalScentProfile(profile)
  },
}

export function loadLocalScentProfile(): ScentProfile | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!isScentProfile(parsed)) return null

    const hydrated = parsed.version === SCENT_PROFILE_VERSION
      ? refreshScentProfile(parsed)
      : buildScentProfile({
          onboarding: parsed.onboarding,
          wardrobe: parsed.wardrobe,
          createdAt: parsed.createdAt,
        })

    saveLocalScentProfile(hydrated)
    return hydrated
  } catch {
    return null
  }
}

export function saveLocalScentProfile(profile: ScentProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function clearLocalScentProfile(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PROFILE_KEY)
}

export function loadRitualDraft(): Partial<ScentOnboardingAnswers> | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(DRAFT_KEY) ?? localStorage.getItem(LEGACY_DRAFT_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<ScentOnboardingAnswers>
    if (localStorage.getItem(LEGACY_DRAFT_KEY)) {
      localStorage.setItem(DRAFT_KEY, raw)
      localStorage.removeItem(LEGACY_DRAFT_KEY)
    }
    return parsed
  } catch {
    return null
  }
}

export function saveRitualDraft(draft: Partial<ScentOnboardingAnswers>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

export function clearRitualDraft(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DRAFT_KEY)
  localStorage.removeItem(LEGACY_DRAFT_KEY)
}

// Future hook: keep storage contract stable so Supabase profile persistence can
// replace local adapter without rewriting Scent UI surfaces.
export function toServerScentProfilePayload(profile: ScentProfile): Record<string, unknown> {
  return {
    version: profile.version,
    profile_json: profile,
    updated_at: profile.updatedAt,
  }
}
