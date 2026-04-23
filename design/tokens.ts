/**
 * AUVORA Design Tokens — single source of truth.
 *
 * Components read from these. Never re-declare a local `const T = {}` object.
 * Dynamic palette hex values (from user auras) stay in inline `style` props
 * per the Tailwind v4 constraint (arbitrary color classes are stripped in
 * production builds).
 *
 * CSS variables mirror this file in globals.css `:root` so typography and
 * surface colors can be referenced as `var(--surface-base)` without an import.
 */

// ── Color ─────────────────────────────────────────────────────────────────────

export const color = {
  // Surface hierarchy — three levels + sheet material
  surfaceVoid:    '#050404', // ceremony, fullscreen backdrops
  surfaceBase:    '#0E0C0B', // default body
  surfaceRaised:  '#161311', // inline chapters, selected surfaces
  surfaceSheet:   '#1F1B17', // sheets, overlays (level 3, different material)

  // Text
  textPrimary:    '#F5F0E8',
  textBody:       '#C8C2B8',
  textSecondary:  '#8C8578',
  textDisabled:   '#4A4642',

  // Gold — the single accent
  gold:           '#C4A46B',
  goldHover:      '#B8945A',
  goldSubtle:     'rgba(196, 164, 107, 0.08)',
  goldBorder:     'rgba(196, 164, 107, 0.18)',
  goldDim:        'rgba(196, 164, 107, 0.35)',

  // Borders
  borderSubtle:       'rgba(255, 255, 255, 0.06)',
  borderInteractive:  'rgba(255, 255, 255, 0.12)',

  // Error (rationed — only for destructive confirmations)
  errorSoft:      'rgba(180, 60, 60, 0.22)',
  errorText:      '#C97070',
} as const;

// ── Resting palette (first-run users, before first aura) ──────────────────────

export const restingPalette = ['#F5F0E8', '#0E0C0B', '#C4A46B'] as const;

// ── Typography ────────────────────────────────────────────────────────────────

export const font = {
  display:  'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
  body:     'var(--font-jost), "Jost", system-ui, sans-serif',
  mono:     'var(--font-mono), "DM Mono", ui-monospace, monospace',
} as const;

export const type = {
  // Display — hero vibe names, screen titles. Max 1 per screen.
  display: {
    fontFamily: font.display,
    fontStyle:  'italic',
    fontWeight: 300,
    fontSize:   'clamp(40px, 11vw, 64px)',
    letterSpacing: '0.01em',
    lineHeight: 1.05,
  },
  // Title — section titles, direction names.
  title: {
    fontFamily: font.display,
    fontWeight: 300,
    fontSize:   '2rem',           // 32px
    letterSpacing: '0.02em',
    lineHeight: 1.2,
  },
  // Subhead — rationale, stylist voice.
  subhead: {
    fontFamily: font.display,
    fontStyle:  'italic',
    fontWeight: 300,
    fontSize:   '1.0625rem',      // 17px
    letterSpacing: 'normal',
    lineHeight: 1.55,
  },
  // Body — neutral mid-tier.
  body: {
    fontFamily: font.mono,
    fontWeight: 300,
    fontSize:   '0.8125rem',      // 13px
    letterSpacing: '0.02em',
    lineHeight: 1.65,
  },
  // Label — section tags. Rationed: max 1 per viewport.
  label: {
    fontFamily: font.mono,
    fontWeight: 400,
    fontSize:   '0.5625rem',      // 9px
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
  },
  // Caption — metadata, timestamps.
  caption: {
    fontFamily: font.mono,
    fontWeight: 300,
    fontSize:   '0.5625rem',      // 9px
    letterSpacing: '0.04em',
  },
} as const;

// ── Spacing scale ─────────────────────────────────────────────────────────────

export const space = {
  px:   1,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 28,
  '3xl': 36,
  '4xl': 48,
  '5xl': 64,
} as const;

// ── Radii ─────────────────────────────────────────────────────────────────────

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  pill: 999,
} as const;

// ── Z-index ───────────────────────────────────────────────────────────────────

export const z = {
  base:       0,
  raised:     10,
  sticky:     20,
  nav:        100,
  sheet:      200,
  ceremony:   300,
  modal:      400,
  toast:      500,
} as const;

// ── Motion — spring configs ───────────────────────────────────────────────────
// Used via Framer Motion's `transition` prop.

export const spring = {
  /** Ambient defaults — page/section entrances, soft reveals. */
  SOFT: {
    type: 'spring',
    stiffness: 140,
    damping: 26,
    mass: 1.1,
  },
  /** Interactive — buttons, chip selection, tap feedback. */
  FIRM: {
    type: 'spring',
    stiffness: 420,
    damping: 32,
    mass: 0.9,
  },
  /** Hero reveals — orb bloom, vibe name type-in, signature curve draw. */
  CINEMATIC: {
    type: 'spring',
    stiffness: 80,
    damping: 18,
    mass: 1.4,
  },
  /** Sensual — Scent section default; softer than SOFT, longer dwell. */
  SENSUAL: {
    type: 'spring',
    stiffness: 110,
    damping: 24,
    mass: 1.2,
  },
} as const;

// ── Motion — durations (for non-spring CSS fallbacks) ─────────────────────────

export const duration = {
  tap:        120,    // 100–130ms, FIRM spring, scale 0.96
  micro:      200,    // small state changes
  standard:   300,    // default transitions
  pageSwap:   460,    // 420–520ms, SOFT spring + 12px lift
  sheet:      380,    // SOFT from translateY(40)
  cinematic:  900,    // 800–1100ms, CINEMATIC hero reveal
} as const;

/** Easing fallback for non-spring CSS transitions. Never `ease-in-out`. */
export const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';

// ── Motion — per-section vectors ──────────────────────────────────────────────
// Each section gets not just a tempo but a *direction* of motion.

export type SectionKey = 'aura' | 'scent' | 'style' | 'sound' | 'self';

export const sectionVector = {
  aura: {
    origin: 'center',
    direction: 'radial',            // bloom from orb center
    staggerMs: 120,
    defaultSpring: 'CINEMATIC',
  },
  scent: {
    origin: 'bottom',
    direction: 'vertical',          // sheet-from-bottom, sensual gravity
    staggerMs: 140,
    defaultSpring: 'SENSUAL',
  },
  style: {
    origin: 'alternating',
    direction: 'lateral-asymmetric', // tiles enter alternating sides w/ jitter
    staggerMs: 60,
    lateralJitterPx: [3, 8],
    defaultSpring: 'SOFT',
  },
  sound: {
    origin: 'left',
    direction: 'linear',            // left-to-right stroke, metronomic
    staggerMs: 80,
    defaultSpring: 'SOFT',
  },
  self: {
    origin: 'satellites',
    direction: 'centripetal',       // converge toward center glyph
    staggerMs: 150,
    defaultSpring: 'CINEMATIC',
  },
} as const;

// ── Ceremony choreography ─────────────────────────────────────────────────────
// The single most iconic motion moment in AUVORA. See Gate 5c.

export const ceremony = {
  phase1: { startMs: 0,     endMs: 800,  oraclePhraseCharMs: 38 },
  phase2: { minDurationMs: 0, orbBreathMs: 1600, phraseDwellMs: 1800, phraseCrossfadeMs: 220 },
  phase3: { durationMs: 900, vibeNameCharMs: 45 },
  phase4: { durationMs: 700, paletteSwatchMs: 180, captionFadeMs: 250, chapterStaggerMs: 120 },
} as const;

// ── Orb sizing ────────────────────────────────────────────────────────────────

export const orbSize = {
  hero:    120,  // Aura portal, result scene
  compact: 52,   // archive tiles, nav badges
  micro:   18,   // timeline ribbon orbs
} as const;

// ── Type exports ──────────────────────────────────────────────────────────────

export type Spring = keyof typeof spring;
export type SpacingKey = keyof typeof space;
export type RadiusKey = keyof typeof radius;
