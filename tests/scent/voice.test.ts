import test from 'node:test'
import assert from 'node:assert/strict'
import { enforceEditorialLine, hasBannedCheesyPhrase } from '@/lib/scent/voice'

test('voice guard flags banned cheesy phrases', () => {
  assert.equal(hasBannedCheesyPhrase('This perfume screams boss energy.'), true)
  assert.equal(hasBannedCheesyPhrase('You lean warm, textured, and intentional.'), false)
})

test('deterministic copy stays concise and tasteful', () => {
  const longInput = 'You lean warm, textured, and intentional. '.repeat(20)
  const line = enforceEditorialLine(longInput, 'Fallback line')
  assert.equal(line.length <= 220, true)
  assert.equal(hasBannedCheesyPhrase(line), false)
})
