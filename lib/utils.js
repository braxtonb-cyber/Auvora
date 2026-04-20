/**
 * Parse colors from stored JSON string or array
 */
export function parseColors(colors) {
  if (!colors) return [];
  if (Array.isArray(colors)) return colors;
  try {
    const parsed = JSON.parse(colors);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Create ambient gradient CSS from aura colors
 */
export function createAmbientGradient(colors) {
  const parsed = parseColors(colors);
  if (!parsed.length) return null;
  const [c1, c2, c3] = parsed;
  return `radial-gradient(ellipse at 20% 50%, ${c1}22 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, ${c2 || c1}18 0%, transparent 55%),
          radial-gradient(ellipse at 60% 80%, ${c3 || c1}14 0%, transparent 50%)`;
}

/**
 * Format date to elegant string
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  // Fallback
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return true;
}

/**
 * Sanitize and validate aura response fields
 */
const BANNED_PATTERNS = [
  /\bmain character energy\b/i,
  /\biconic\b/i,
  /\bslay\b/i,
  /\bbaddie\b/i,
  /\baesthetic\s*af\b/i,
  /\brevolutionary\b/i,
  /\bdisruptive\b/i,
  /\bai-powered magic\b/i,
  /\bquiet luxury\b/i,
  /\bexpensive-looking\b/i,
  /\bsoul portal awakening\b/i,
];

const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function hasBannedLanguage(text) {
  return BANNED_PATTERNS.some((pattern) => pattern.test(text));
}

function assertBannedLanguageFree(field, value) {
  if (hasBannedLanguage(value)) {
    throw new Error(`Banned language found in ${field}`);
  }
}

function sanitizePalette(input) {
  const rawColors = Array.isArray(input) ? input : parseColors(input);
  const normalized = rawColors
    .map((color) => cleanText(color))
    .map((color) => color.toLowerCase())
    .filter((color) => HEX_PATTERN.test(color));
  const unique = [...new Set(normalized)];
  if (unique.length < 4) {
    throw new Error('Palette requires at least 4 valid hex colors');
  }
  return unique.slice(0, 5);
}

export function validateAura(data) {
  const required = ['vibe_name', 'outfit', 'fragrance', 'playlist', 'colors', 'caption'];
  for (const field of required) {
    if (!data[field]) throw new Error(`Missing field: ${field}`);
  }

  const vibeName = cleanText(data.vibe_name);
  const outfit = cleanText(data.outfit);
  const fragrance = cleanText(data.fragrance);
  const playlist = String(data.playlist || '')
    .split('\n')
    .map((line) => cleanText(line))
    .filter(Boolean)
    .join('\n');
  const caption = cleanText(data.caption);

  const vibeWordCount = vibeName.split(/\s+/).filter(Boolean).length;
  if (vibeWordCount < 2 || vibeWordCount > 4) {
    throw new Error('vibe_name must be 2-4 words');
  }

  if (outfit.length < 90) {
    throw new Error('outfit is too vague');
  }

  if (fragrance.length < 55) {
    throw new Error('fragrance is too vague');
  }

  const playlistLines = playlist.split('\n').filter(Boolean);
  if (playlistLines.length < 3) {
    throw new Error('playlist needs at least 3 specific entries');
  }

  const captionWordCount = caption.split(/\s+/).filter(Boolean).length;
  if (captionWordCount < 5 || captionWordCount > 16) {
    throw new Error('caption must be concise and controlled');
  }

  assertBannedLanguageFree('vibe_name', vibeName);
  assertBannedLanguageFree('outfit', outfit);
  assertBannedLanguageFree('fragrance', fragrance);
  assertBannedLanguageFree('caption', caption);

  const palette = sanitizePalette(data.colors);

  return {
    vibe_name: vibeName,
    outfit,
    fragrance,
    playlist,
    colors: JSON.stringify(palette),
    caption,
  };
}

/**
 * Quick vibe prompts for random generation
 */
export const QUICK_VIBES = [
  'quiet morning in a Parisian flat, coffee and rain',
  'midnight drive through neon city streets alone',
  'golden hour on an empty Italian coast',
  'library at 2am, searching for something unnamed',
  'first cold morning of autumn, fog on the hills',
  'rooftop party winding down, warm lights and last songs',
  'Kyoto side street in cherry blossom season',
  'late summer heat in the American Southwest',
  'winter solstice, candlelit room, old vinyl',
  'after a long flight, hotel room with city view at dawn',
  'underground art opening, crowd of strangers who feel known',
  'slow Sunday, nowhere to be, everything soft',
];

export function getRandomVibe() {
  return QUICK_VIBES[Math.floor(Math.random() * QUICK_VIBES.length)];
}
