/**
 * Identity paragraph builder.
 *
 * Extracted from the legacy ProfileTab so the same Cormorant-voiced sentence
 * can be reused on the Self portrait without the surrounding account-page
 * scaffolding. Pure function — the caller reads state (localStorage, fetched
 * aura entries) and hands in the shaped inputs.
 *
 * Voice is preserved verbatim from the prior ProfileTab implementation so
 * the Step 4 cutover does not regress tone.
 */

import type { AuraSummary } from '@/lib/types/aura';

// ── Input shapes (match existing localStorage blobs) ──────────────────────────

export interface StylePrefs {
  expression: string[];
  aesthetic:  string;
  fit:        string;
  color:      string;
}

export interface SoundPrefs {
  contexts: string[];
  sonic:    string;
  era:      string;
  platform: string;
}

export interface IdentityInputs {
  stylePrefs: StylePrefs | null;
  soundPrefs: SoundPrefs | null;
  auras:      AuraSummary[];
}

// ── Stop words for signature-word extraction ──────────────────────────────────

const STOP = new Set([
  'their', 'about', 'would', 'could', 'should', 'which', 'where', 'there',
  'these', 'those', 'being', 'having', 'something', 'feeling', 'going', 'want',
  'need', 'that', 'this', 'with', 'from', 'just', 'some', 'like', 'feel',
  'really', 'through', 'while', 'when', 'after', 'before', 'still',
]);

/** Top N words pulled from vibe inputs, length > 4, excluding stop words. */
export function extractSignatureWords(auras: AuraSummary[], limit = 5): string[] {
  const freq: Record<string, number> = {};
  auras
    .map((a) => a.vibeInput.replace(/\[context:.*?\]/gi, '').toLowerCase())
    .join(' ')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOP.has(w))
    .forEach((w) => {
      const clean = w.replace(/[^a-z]/g, '');
      if (!clean) return;
      freq[clean] = (freq[clean] ?? 0) + 1;
    });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

/** Most-frequent hex colors across saved aura palettes. */
export function extractDominantColors(auras: AuraSummary[], limit = 8): string[] {
  const freq: Record<string, number> = {};
  for (const a of auras) {
    for (const p of a.palette ?? []) {
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

/**
 * The editorial identity paragraph shown at the top of the Self portrait.
 * Returns null if there isn't enough signal to warrant a sentence.
 */
export function buildIdentityParagraph(inputs: IdentityInputs): string | null {
  const { stylePrefs, soundPrefs, auras } = inputs;
  const parts: string[] = [];

  if (stylePrefs && (stylePrefs.aesthetic || stylePrefs.fit || stylePrefs.color)) {
    parts.push(
      `Visually, you operate in a ${(stylePrefs.aesthetic || 'considered').toLowerCase()} register — ` +
      `${(stylePrefs.fit || '').toLowerCase()}, ` +
      `${(stylePrefs.color || '').toLowerCase()}.`
    );
  }

  if (soundPrefs && (soundPrefs.sonic || soundPrefs.era || soundPrefs.contexts?.length)) {
    const contexts = (soundPrefs.contexts || []).slice(0, 2).map((c) => c.toLowerCase()).join(' and ');
    const eraNote  = soundPrefs.era && soundPrefs.era !== 'Spanning all eras'
      ? `, rooted in ${soundPrefs.era.toLowerCase()}`
      : '';
    parts.push(
      `Sonically, you gravitate toward ${(soundPrefs.sonic || 'curated').toLowerCase()} textures${eraNote}` +
      `${contexts ? `, most often for ${contexts}` : ''}.`
    );
  }

  const words = extractSignatureWords(auras, 3);
  if (words.length >= 3 && auras.length >= 3) {
    parts.push(
      `Your aura returns to ${words.join(', ')} — ` +
      `a consistent signal across ${auras.length} recorded moment${auras.length === 1 ? '' : 's'}.`
    );
  }

  return parts.length > 0 ? parts.join(' ') : null;
}

/** Pattern insight line — ported from page.tsx analyzePattern, kept verbatim. */
export function buildPatternInsight(auras: AuraSummary[]): string | null {
  if (auras.length < 2) return null;
  const text = auras
    .map((a) => a.vibeInput.replace(/\[context:.*?\]/gi, '').toLowerCase())
    .join(' ');
  const m = (re: RegExp) => (text.match(re) || []).length;
  const quiet  = m(/\b(quiet|still|silent|alone|soft|slow|calm|gentle|peace|solitude|intimate|empty|muted|fog|rain|interior|hush|subdued)\b/g);
  const active = m(/\b(energy|sharp|confident|vibrant|alive|social|power|drive|pulse|city|electric|bold|loud|charged|momentum)\b/g);
  const night  = m(/\b(night|midnight|late|dark|evening|neon|dusk|2am|after dark)\b/g);
  const warm   = m(/\b(warm|sun|golden|summer|heat|afternoon|morning|light|dawn)\b/g);
  if (quiet > active && night > warm)  return "Lately, you've been drawn toward stillness in the dark — interior, unrushed, low signal.";
  if (quiet > active)                  return "Lately, you've been reaching for quiet — soft atmospheres, unhurried light, subdued presence.";
  if (active > quiet && night > warm)  return 'Your recent auras carry nocturnal charge — high contrast, deliberate energy, present in the city.';
  if (active > quiet)                  return 'Your recent auras have momentum — focused, outward-facing, present-tense.';
  return "Your recent auras span different registers — you're moving through varied emotional terrain.";
}
