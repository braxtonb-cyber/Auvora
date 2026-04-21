import test from 'node:test'
import assert from 'node:assert/strict'
import { computeGapRadar } from '@/lib/scent/gap-radar'
import { makeProfile } from '@/tests/scent/fixtures'

test('Gap Radar never invents owned products', () => {
  const profile = makeProfile()
  const radar = computeGapRadar(profile)

  const ownedNames = profile.wardrobe.map((item) => item.name.toLowerCase())
  const outputText = [
    ...radar.blindSpots,
    ...radar.familyImbalance,
    radar.nextDirection,
    radar.summary,
  ].join(' ').toLowerCase()

  ownedNames.forEach((name) => {
    assert.equal(outputText.includes(name), false)
  })
})
