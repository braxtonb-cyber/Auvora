-- ── sound_moods ──────────────────────────────────────────────────────────────
-- Saved sonic portraits from the Sound section. Stored as a frequency
-- signature (name, atmosphere, tracks, energy, bpm, genres) — the curve
-- IS the portrait; tracks are chapters beneath it.

CREATE TABLE IF NOT EXISTS sound_moods (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aura_id     UUID        REFERENCES aura_entries(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  name        TEXT        NOT NULL,
  atmosphere  TEXT        NOT NULL,
  tracks      JSONB       NOT NULL DEFAULT '[]'::jsonb,
  energy      TEXT,
  bpm         TEXT,
  genres      JSONB       NOT NULL DEFAULT '[]'::jsonb,
  rationale   TEXT
);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE sound_moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: select own sound_moods"
  ON sound_moods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users: insert own sound_moods"
  ON sound_moods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users: update own sound_moods"
  ON sound_moods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users: delete own sound_moods"
  ON sound_moods FOR DELETE
  USING (auth.uid() = user_id);

-- ── Index ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_sound_moods_user_created
  ON sound_moods (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sound_moods_aura
  ON sound_moods (aura_id)
  WHERE aura_id IS NOT NULL;
