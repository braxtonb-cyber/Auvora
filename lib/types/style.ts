/**
 * Style domain types — inspiration, never prescription.
 *
 * Source of truth: supabase/migrations/002_style_boards.sql
 *
 * HARD RULE: neither `StyleDirection` nor `StyleBoardRow` carries a
 * `pieces: string[]` field. Style produces editorial direction (palette,
 * silhouette language, typographic treatment, mood words) — never a
 * shopping list. If a future API ever returns a pieces field, reject it
 * at the boundary rather than widening this type.
 */

// ── Generated output ──────────────────────────────────────────────────────────

export interface StylePalette {
  hex:  string;
  name: string;
}

export interface StyleSilhouetteKeyword {
  word: string;
  /** Optional: emphasis (0-1) for weighting the moodboard composition. */
  emphasis?: number;
}

export interface StyleTypographyTreatment {
  /** Treatment name ('engraved', 'stenciled', 'handwritten', 'set in lead'). */
  name: string;
  /** One-line descriptive phrase used in the moodboard tile. */
  phrase: string;
}

export interface StyleDirection {
  concept:     string;
  story:       string;
  palette:     StylePalette[];
  silhouette:  StyleSilhouetteKeyword[];
  typography:  StyleTypographyTreatment;
  moodWords:   string[];
  rationale:   string | null;
}

// ── Table row (public.style_boards) ───────────────────────────────────────────

export interface StyleBoardRow {
  id:          string;
  user_id:     string;
  aura_id:     string | null;
  created_at:  string;

  concept:     string;
  story:       string;
  palette:     StylePalette[];
  silhouette:  StyleSilhouetteKeyword[];
  typography:  StyleTypographyTreatment;
  mood_words:  string[];
  rationale:   string | null;
}

// ── Compact summaries (moodboard strips, Self satellites) ─────────────────────

export interface StyleBoardSummary {
  id:         string;
  concept:    string;
  palette:    StylePalette[];
  moodWords:  string[];
  createdAt:  string;
}

export function summarizeStyleBoard(row: StyleBoardRow): StyleBoardSummary {
  return {
    id:        row.id,
    concept:   row.concept,
    palette:   row.palette ?? [],
    moodWords: row.mood_words ?? [],
    createdAt: row.created_at,
  };
}
