import { BANNED_CHEESY_PHRASES } from '@/lib/scent/constants'

export function hasBannedCheesyPhrase(input: string): boolean {
  const lower = input.toLowerCase()
  return BANNED_CHEESY_PHRASES.some((phrase) => lower.includes(phrase))
}

export function enforceEditorialLine(input: string, fallback: string): string {
  const trimmed = input.trim()
  if (!trimmed) return fallback

  const concise = trimmed.length > 220 ? `${trimmed.slice(0, 217).trim()}...` : trimmed
  if (hasBannedCheesyPhrase(concise)) return fallback

  return concise
}
