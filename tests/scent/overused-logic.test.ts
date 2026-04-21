import test from 'node:test'
import assert from 'node:assert/strict'
import { computeDailyReach } from '@/lib/scent/daily-reach'
import { makeProfile, makeWardrobe } from '@/tests/scent/fixtures'

test('Overused-item logic prevents the same bottle from always winning', () => {
  const wardrobe = makeWardrobe([
    {
      id: 'dominant',
      name: 'Dominant Bottle',
      families: ['woody', 'amber'],
      wearCount: 14,
      signatureScore: 90,
      lastWornAt: new Date().toISOString(),
      owned: true,
    },
    {
      id: 'rotation-candidate',
      name: 'Rotation Candidate',
      families: ['woody', 'amber'],
      wearCount: 2,
      signatureScore: 84,
      lastWornAt: '2026-01-01T00:00:00.000Z',
      owned: true,
    },
  ])

  const profile = makeProfile({ wardrobe })
  const reach = computeDailyReach(profile)

  assert.equal(reach.primaryItemId, 'rotation-candidate')
})
