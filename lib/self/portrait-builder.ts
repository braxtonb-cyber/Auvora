/**
 * Self portrait derivation.
 *
 * Pure function: takes aggregated inputs from the four sections and returns
 * a composed SelfPortrait. Pattern analysis and word/color extraction logic
 * is ported from the existing ProfileTab + page.tsx pattern analyzer —
 * preserved behavior so the first rebuild commit does not regress tone.
 *
 * Not a side-effecting module: the caller is responsible for upserting the
 * returned portrait into `self_portraits`.
 */

import type {
  PortraitInputs,
  SelfPortrait,
} from '@/lib/types/self';
import { restingPortrait } from '@/lib/types/self';

// ── Stop words for signature-word extraction ──────────────────────────────────

const STOP_WORDS = new Set([
  'their', 'about', 'would', 'could', 'should', 'which', 'where', 'there',
  'these', 'those', 'being', 'having', 'something', 'feeling', 'going', 'want',
  'need', 'that', 'this', 'with', 'from', 'just', 'some', 'like', 'feel',
  'really', 'through', 'while', 'when', 'after', 'before', 'still',
]);

// ── Signal word banks for pattern analysis ────────────────────────────────────

const QUIET_WORDS = /\b(quiet|still|silent|alone|soft|slow|calm|gentle|peace|solitude|intimate|empty|muted|fog|rain|interior|hush|subdued)\b/g;
const ACTIVE_WORDS = /\b(energy|sharp|confident|vibrant|alive|social|power|drive|pulse|city|electric|bold|loud|charged|momentum)\b/g;
const NIGHT_WORDS = /\b(night|midnight|late|dark|evening|neon|dusk|2am|after dark)\b/g;
const WARM_WORDS = /\b(warm|sun|golden|summer|heat|afternoon|morning|light|dawn)\b/g;

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractDominantColors(inputs: PortraitInputs, limit = 8): string[] {
  const freq: Record<string, number> = {};

  for (const a of inputs.auras) {
    for (const p of a.palette ?? []) {
      if (/^#[0-9a-fA-F]{6}$/.test(p.hex)) {
        freq[p.hex] = (freq[p.hex] ?? 0) + 2; // auras count double
      }
    }
  }
  for (const b of inputs.boards) {
    for (const p of b.palette ?? []) {
      if (/^#[0-9a-fA-F]{6}$/.test(p.hex)) {
        freq[p.hex] = (freq[p.hex] ?? 0) + 1;
      }
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([hex]) => hex);
}

function extractSignatureWords(inputs: PortraitInputs, limit = 5): string[] {
  const freq: Record<string, number> = {};

  const auraText = inputs.auras.map((a) => a.vibeInput ?? '').join(' ').toLowerCase();
  const moodText = inputs.moods.map((m) => `${m.name} ${m.atmosphere}`).join(' ').toLowerCase();
  const boardText = inputs.boards.map((b) => `${b.concept} ${b.moodWords.join(' ')}`).join(' ').toLowerCase();

  const combined = `${auraText} ${moodText} ${boardText}`;

  for (const word of combined.split(/\s+/)) {
    const clean = word.replace(/[^a-z]/g, '');
    if (clean.length <= 4) continue;
    if (STOP_WORDS.has(clean)) continue;
    freq[clean] = (freq[clean] ?? 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

function matchCount(haystack: string, pattern: RegExp): number {
  return (haystack.match(pattern) ?? []).length;
}

function derivePatternInsight(inputs: PortraitInputs): string | null {
  if (inputs.auras.length < 2) return null;

  const text = inputs.auras.map((a) => a.vibeInput).join(' ').toLowerCase();
  const quiet  = matchCount(text, QUIET_WORDS);
  const active = matchCount(text, ACTIVE_WORDS);
  const night  = matchCount(text, NIGHT_WORDS);
  const warm   = matchCount(text, WARM_WORDS);

  if (quiet > active && night > warm) {
    return "Lately, you've been drawn toward stillness in the dark — interior, unrushed, low signal.";
  }
  if (quiet > active) {
    return "Lately, you've been reaching for quiet — soft atmospheres, unhurried light, subdued presence.";
  }
  if (active > quiet && night > warm) {
    return 'Your recent auras carry nocturnal charge — high contrast, deliberate energy, present in the city.';
  }
  if (active > quiet) {
    return 'Your recent auras have momentum — focused, outward-facing, present-tense.';
  }
  return "Your recent auras span different registers — you're moving through varied emotional terrain.";
}

function deriveStyleRegister(inputs: PortraitInputs): string | null {
  const latest = inputs.boards[0];
  if (!latest) return null;

  const words = [latest.concept, ...latest.moodWords].filter(Boolean).slice(0, 3);
  if (words.length === 0) return null;
  return words.join(' · ').toLowerCase();
}

function deriveSonicRegister(inputs: PortraitInputs): string | null {
  const latest = inputs.moods[0];
  if (!latest) return null;

  const parts = [latest.energy, latest.bpm].filter((v): v is string => Boolean(v));
  if (parts.length === 0 && latest.atmosphere) return latest.atmosphere.toLowerCase();
  return parts.join(' · ').toLowerCase() || null;
}

function deriveScentSignature(inputs: PortraitInputs): string | null {
  if (!inputs.scent) return null;

  const { signatureDirection, favoriteFamilies, scentPersonality } = inputs.scent;

  if (signatureDirection) return signatureDirection.toLowerCase();
  if (scentPersonality)   return scentPersonality.toLowerCase();
  if (favoriteFamilies.length > 0) return favoriteFamilies.slice(0, 2).join(' + ').toLowerCase();

  return null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Derive a SelfPortrait from aggregates.
 *
 * Returns the resting portrait (first-run users) when there is nothing to
 * build from.
 */
export function buildPortrait(inputs: PortraitInputs): SelfPortrait {
  const hasAnyData =
    inputs.auras.length > 0 ||
    inputs.boards.length > 0 ||
    inputs.moods.length > 0 ||
    (inputs.scent !== null);

  if (!hasAnyData) {
    return { ...restingPortrait, updatedAt: new Date().toISOString() };
  }

  return {
    signatureWords:  extractSignatureWords(inputs),
    dominantColors:  extractDominantColors(inputs),
    styleRegister:   deriveStyleRegister(inputs),
    sonicRegister:   deriveSonicRegister(inputs),
    scentSignature:  deriveScentSignature(inputs),
    lastAuraId:      inputs.auras[0]?.id ?? null,
    totalAuras:      inputs.auras.length,
    patternInsight:  derivePatternInsight(inputs),
    updatedAt:       new Date().toISOString(),
  };
}

/**
 * Shape for upsert into public.self_portraits.
 * Handy when the caller wants to persist the derived portrait.
 */
export function portraitToUpsertRow(userId: string, p: SelfPortrait) {
  return {
    user_id:          userId,
    signature_words:  p.signatureWords,
    dominant_colors:  p.dominantColors,
    style_register:   p.styleRegister,
    sonic_register:   p.sonicRegister,
    scent_signature:  p.scentSignature,
    last_aura_id:     p.lastAuraId,
    total_auras:      p.totalAuras,
    pattern_insight:  p.patternInsight,
  };
}
