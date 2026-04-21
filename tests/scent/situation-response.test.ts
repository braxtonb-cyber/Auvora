import test from 'node:test'
import assert from 'node:assert/strict'
import { validateSituationResponse } from '@/lib/scent/situation-prompt'
import { makeProfile } from '@/tests/scent/fixtures'

test('Situation Engine response validation rejects malformed output', () => {
  const profile = makeProfile()

  assert.throws(
    () =>
      validateSituationResponse(
        {
          mode: 'single',
          primaryItemId: '',
          title: 'x',
          reasoning: 'x',
          wearingNote: 'x',
          tryNext: 'Try sharper',
          secondaryItemId: null,
          futureDirection: null,
        },
        profile
      ),
    /Invalid primaryItemId/
  )

  assert.throws(
    () =>
      validateSituationResponse(
        {
          mode: 'layer',
          primaryItemId: profile.wardrobe[0].id,
          secondaryItemId: profile.wardrobe[0].id,
          title: 'Layer test',
          reasoning: 'Valid length reasoning.',
          wearingNote: 'Apply lightly.',
          futureDirection: null,
          tryNext: 'Try warmer',
        },
        profile
      ),
    /layer mode requires/
  )
})
