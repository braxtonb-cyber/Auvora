'use client'

import { useEffect, useMemo, useState } from 'react'
import ScentEntryGate from '@/components/scent/ScentEntryGate'
import ScentRitualFlow from '@/components/scent/ScentRitualFlow'
import ScentIdentityCard from '@/components/scent/ScentIdentityCard'
import ScentDailyReachCard from '@/components/scent/ScentDailyReachCard'
import ScentCollectionCard from '@/components/scent/ScentCollectionCard'
import ScentForAuraCard from '@/components/scent/ScentForAuraCard'
import ScentStarterCalibration from '@/components/scent/ScentStarterCalibration'
import ScentSituationEngine from '@/components/scent/ScentSituationEngine'
import ScentRotationCard from '@/components/scent/ScentRotationCard'
import ScentGapRadarCard from '@/components/scent/ScentGapRadarCard'
import ScentWardrobeImport from '@/components/scent/ScentWardrobeImport'
import ScentProductDetailSheet from '@/components/scent/ScentProductDetailSheet'
import { buildScentProfile, emptyWardrobeFallbackProfile, refreshScentProfile } from '@/lib/scent/profile-builders'
import {
  withFavoriteToggled,
  withImportedProducts,
  withUpdatedPreferences,
  withWearLogged,
} from '@/lib/scent/profile-actions'
import {
  clearRitualDraft,
  loadLocalScentProfile,
  loadRitualDraft,
  saveLocalScentProfile,
  saveRitualDraft,
} from '@/lib/scent/storage'
import type {
  AuraContext,
  ScentOnboardingAnswers,
  ScentPreferences,
  ScentProfile,
  ScentWardrobeItem,
} from '@/lib/scent/types'

type ScentTabMode = 'loading' | 'gate' | 'routine' | 'shell'

const T = {
  gold: '#c4a46b',
  textPrimary: '#f0ebe3',
  textSub: '#8a8278',
  textMuted: '#4a4540',
  fontC: 'var(--font-cormorant), "Cormorant Garamond", serif',
  fontM: 'var(--font-mono), "DM Mono", monospace',
}

export default function ScentTab() {
  const [mode, setMode] = useState<ScentTabMode>('loading')
  const [profile, setProfile] = useState<ScentProfile | null>(null)
  const [draft, setDraft] = useState<Partial<ScentOnboardingAnswers>>({})
  const [auraContext, setAuraContext] = useState<AuraContext | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  useEffect(() => {
    const existing = loadLocalScentProfile()
    const existingDraft = loadRitualDraft() ?? {}

    setDraft(existingDraft)

    if (existing) {
      const refreshed = refreshScentProfile(existing)
      setProfile(refreshed)
      saveLocalScentProfile(refreshed)
      setMode('shell')
    } else {
      setMode('gate')
    }

    try {
      const rawAura = localStorage.getItem('auvoraProfile')
      if (rawAura) {
        const parsed = JSON.parse(rawAura) as AuraContext
        setAuraContext(parsed)
      }
    } catch {
      // ignore aura context hydration failures
    }
  }, [])

  const hasProfile = useMemo(() => Boolean(profile), [profile])

  function handleSkip() {
    const fallback = emptyWardrobeFallbackProfile()
    saveLocalScentProfile(fallback)
    clearRitualDraft()
    setProfile(fallback)
    setMode('shell')
  }

  function handleDraftChange(next: Partial<ScentOnboardingAnswers>) {
    setDraft(next)
    saveRitualDraft(next)
  }

  function handleRoutineComplete(answers: ScentOnboardingAnswers) {
    const nextProfile = buildScentProfile({ onboarding: answers })
    saveLocalScentProfile(nextProfile)
    clearRitualDraft()
    setProfile(nextProfile)
    setMode('shell')
  }

  function persistProfile(next: ScentProfile) {
    setProfile(next)
    saveLocalScentProfile(next)
  }

  function updatePreferenceMemory(updates: Partial<ScentPreferences>) {
    if (!profile) return
    persistProfile(withUpdatedPreferences(profile, updates))
  }

  function toggleFavoriteItem(itemId: string) {
    if (!profile) return
    persistProfile(withFavoriteToggled(profile, itemId))
  }

  function importWardrobeItems(items: ScentWardrobeItem[]) {
    if (!profile || items.length === 0) return
    persistProfile(withImportedProducts(profile, items))
  }

  function logWear(input: {
    itemId: string
    occasion?: string
    weather?: 'hot' | 'mild' | 'cool' | 'cold'
    note?: string
  }) {
    if (!profile) return
    persistProfile(withWearLogged(profile, input))
  }

  function reopenRoutine() {
    if (profile) {
      setDraft(profile.onboarding)
      saveRitualDraft(profile.onboarding)
    }
    setMode('routine')
  }

  if (mode === 'loading') {
    return null
  }

  if (mode === 'gate') {
    return <ScentEntryGate onStart={() => setMode('routine')} onSkip={handleSkip} />
  }

  if (mode === 'routine') {
    return (
      <ScentRitualFlow
        initial={draft}
        onDraftChange={handleDraftChange}
        onComplete={handleRoutineComplete}
        onSkip={handleSkip}
      />
    )
  }

  if (!hasProfile || !profile) {
    return null
  }

  const selectedItem = selectedItemId
    ? profile.wardrobe.find((item) => item.id === selectedItemId) ?? null
    : null

  const needsStarterCalibration =
    profile.preferences.favoriteFamilies.length === 0 ||
    profile.preferences.preferredMoods.length === 0 ||
    !profile.preferences.signatureDirection

  return (
    <div
      style={{
        maxWidth: 440,
        margin: '0 auto',
        padding: '0 16px 40px',
        animation: 'au-tab-switch 0.5s linear',
      }}
    >
      <div style={{ paddingTop: 52, paddingBottom: 20 }}>
        <p
          style={{
            fontFamily: T.fontM,
            fontSize: 9,
            letterSpacing: '0.28em',
            color: T.gold,
            textTransform: 'uppercase',
            marginBottom: 10,
            opacity: 0.7,
          }}
        >
          ◉ Scent
        </p>

        <h1
          style={{
            fontFamily: T.fontC,
            fontWeight: 300,
            fontSize: 32,
            color: T.textPrimary,
            lineHeight: 1.2,
            marginBottom: 8,
          }}
        >
          Wardrobe-first scent intelligence
        </h1>

        <p
          style={{
            fontFamily: T.fontM,
            fontSize: 11,
            color: T.textSub,
            letterSpacing: '0.03em',
            lineHeight: 1.6,
            marginBottom: 10,
          }}
        >
          Mini Scentory inside AUVORA: your owned collection, behavior signals, and decisive scent direction.
        </p>

        <button
          onClick={reopenRoutine}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: T.fontM,
            fontSize: 10,
            color: T.textMuted,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Refine routine answers
        </button>
      </div>

      {needsStarterCalibration && (
        <ScentStarterCalibration
          profile={profile}
          onSave={updatePreferenceMemory}
        />
      )}
      <ScentWardrobeImport onImport={importWardrobeItems} />
      <ScentCollectionCard
        profile={profile}
        onToggleFavorite={toggleFavoriteItem}
        onOpenDetails={(itemId) => setSelectedItemId(itemId)}
      />
      <ScentIdentityCard profile={profile} />
      <ScentDailyReachCard profile={profile} />
      <ScentForAuraCard profile={profile} auraContext={auraContext} />
      <ScentSituationEngine profile={profile} />
      <ScentRotationCard profile={profile} />
      <ScentGapRadarCard profile={profile} />

      {selectedItem && (
        <ScentProductDetailSheet
          profile={profile}
          item={selectedItem}
          onClose={() => setSelectedItemId(null)}
          onLogWear={logWear}
        />
      )}
    </div>
  )
}
