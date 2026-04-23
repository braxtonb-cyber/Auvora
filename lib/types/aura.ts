/**
 * Aura domain types.
 *
 * Source of truth: supabase/migrations/001_aura_entries.sql
 * Output shape mirrors /api/generate-aura/route.ts; keep both in sync.
 */

// ── Generated output (output_json column) ─────────────────────────────────────

export interface AuraRationale {
  signal:    string;
  outfit:    string;
  fragrance: string;
  playlist:  string;
}

export interface AuraOutfit {
  title:       string;
  description: string;
}

export interface AuraFragrance {
  title: string;
  notes: string;
}

export interface AuraPlaylist {
  title:  string;
  tracks: string[];
}

export interface AuraPaletteSwatch {
  hex:  string;
  name: string;
}

export interface AuraOutput {
  vibeName:  string;
  outfit:    AuraOutfit;
  fragrance: AuraFragrance;
  playlist:  AuraPlaylist;
  palette:   AuraPaletteSwatch[];
  caption:   string;
  rationale: AuraRationale | null;
}

// ── Table row (public.aura_entries) ───────────────────────────────────────────

export interface AuraEntryRow {
  id:          string;
  user_id:     string;
  created_at:  string;
  vibe_input:  string;
  output_json: AuraOutput;
  is_saved:    boolean;
}

// ── Compact summaries (list views, timeline ribbon, pattern analysis) ─────────

export interface AuraSummary {
  id:         string;
  vibeName:   string;
  palette:    AuraPaletteSwatch[];
  createdAt:  string;
  vibeInput:  string;
}

/** Projects a full row into the compact shape used by ribbons and chips. */
export function summarizeAura(row: AuraEntryRow): AuraSummary {
  return {
    id:        row.id,
    vibeName:  row.output_json?.vibeName ?? 'Untitled',
    palette:   row.output_json?.palette ?? [],
    createdAt: row.created_at,
    vibeInput: row.vibe_input.replace(/\[context:.*?\]/gi, '').trim(),
  };
}
