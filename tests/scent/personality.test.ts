import test from 'node:test'
import assert from 'node:assert/strict'
import { assignScentPersonality } from '@/lib/scent/personality'
import { makeProfile } from '@/tests/scent/fixtures'

test('scent personality assignment is deterministic for the same profile', () => {
  const profile = makeProfile({ atmosphere: 'dark and deliberate', trail: 'assertive' })

  const one = assignScentPersonality({
    onboarding: profile.onboarding,
    wardrobe: profile.wardrobe,
    wearPatterns: profile.wearPatterns,
    preferences: profile.preferences,
  })

  const two = assignScentPersonality({
    onboarding: profile.onboarding,
    wardrobe: profile.wardrobe,
    wearPatterns: profile.wearPatterns,
    preferences: profile.preferences,
  })

  assert.equal(one, two)
})
