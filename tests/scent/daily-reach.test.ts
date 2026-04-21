import test from 'node:test'
import assert from 'node:assert/strict'
import { computeDailyReach } from '@/lib/scent/daily-reach'
import { makeProfile, makeWardrobe } from '@/tests/scent/fixtures'

test('Daily Reach returns owned item IDs only', () => {
  const wardrobe = makeWardrobe([
    { id: 'owned-1', name: 'Owned 1', owned: true, wearCount: 1, signatureScore: 80, families: ['woody'] },
    { id: 'owned-2', name: 'Owned 2', owned: true, wearCount: 4, signatureScore: 70, families: ['fresh'] },
    { id: 'not-owned', name: 'Not Owned', owned: false, wearCount: 0, signatureScore: 99, families: ['amber'] },
  ])

  const profile = makeProfile({ wardrobe })
  const result = computeDailyReach(profile)

  const ownedIds = new Set(profile.wardrobe.filter((item) => item.owned).map((item) => item.id))

  assert.ok(result.primaryItemId)
  assert.ok(ownedIds.has(result.primaryItemId as string))
  result.alternateItemIds.forEach((id) => assert.ok(ownedIds.has(id)))
})
