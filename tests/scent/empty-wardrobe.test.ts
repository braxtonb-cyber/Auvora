import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyWardrobeFallbackProfile } from '@/lib/scent/profile-builders'
import {
  IDENTITY_LED_ITEM_ID,
  emptyWardrobeSituationFallback,
  validateSituationResponse,
} from '@/lib/scent/situation-prompt'

test('Empty wardrobe fallback works', () => {
  const profile = emptyWardrobeFallbackProfile()
  const fallback = emptyWardrobeSituationFallback('everyday class', profile)

  assert.equal(fallback.primaryItemId, IDENTITY_LED_ITEM_ID)

  const validated = validateSituationResponse(fallback, profile)
  assert.equal(validated.primaryItemId, IDENTITY_LED_ITEM_ID)
})
