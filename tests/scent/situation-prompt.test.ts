import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSituationPrompt } from '@/lib/scent/situation-prompt'
import { makeProfile } from '@/tests/scent/fixtures'

test('Situation Engine prompt includes wardrobe + personality + gaps', () => {
  const profile = makeProfile()
  const prompt = buildSituationPrompt('late-night city', profile)

  assert.equal(prompt.includes('Owned wardrobe inventory:'), true)
  assert.equal(prompt.includes(profile.identity.scentPersonality), true)
  assert.equal(prompt.includes(profile.identity.wardrobeGaps[0]), true)
  assert.equal(prompt.includes(profile.wardrobe[0].id), true)
})
