/**
 * Sound domain types — frequency signature + chapters.
 *
 * Source of truth: supabase/migrations/003_sound_moods.sql
 *
 * Sound produces a *signature* (name, atmosphere, energy, bpm), and
 * tracks are narrative *chapters* rendered beneath it — not a row-based
 * tracklist. Maintain that separation in downstream components.
 */

// ── Track (chapter) ───────────────────────────────────────────────────────────

export interface SoundTrack {
  title:  string;
  artist: string;
  /** One-line lyrical note — why this track belongs in this arc. */
  why: string;
}

// ── Generated output ──────────────────────────────────────────────────────────

export interface SoundMood {
  name:       string;
  atmosphere: string;
  tracks:     SoundTrack[];
  energy:     string | null;
  bpm:        string | null;
  genres:     string[];
  rationale:  string | null;
}

// ── Table row (public.sound_moods) ────────────────────────────────────────────

export interface SoundMoodRow {
  id:          string;
  user_id:     string;
  aura_id:     string | null;
  created_at:  string;

  name:        string;
  atmosphere:  string;
  tracks:      SoundTrack[];
  energy:      string | null;
  bpm:         string | null;
  genres:      string[];
  rationale:   string | null;
}

// ── Compact summaries (Sound archive strip, Self satellites) ──────────────────

export interface SoundMoodSummary {
  id:         string;
  name:       string;
  atmosphere: string;
  energy:     string | null;
  bpm:        string | null;
  createdAt:  string;
}

export function summarizeSoundMood(row: SoundMoodRow): SoundMoodSummary {
  return {
    id:         row.id,
    name:       row.name,
    atmosphere: row.atmosphere,
    energy:     row.energy,
    bpm:        row.bpm,
    createdAt:  row.created_at,
  };
}
