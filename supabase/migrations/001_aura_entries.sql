-- ── aura_entries ─────────────────────────────────────────────────────────────
-- Stores every generated aura, linked to an anonymous or authenticated user.

CREATE TABLE IF NOT EXISTS aura_entries (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vibe_input  TEXT        NOT NULL,
  output_json JSONB       NOT NULL,
  is_saved    BOOLEAN     NOT NULL DEFAULT TRUE
);

-- ── Row-level security ────────────────────────────────────────────────────────

ALTER TABLE aura_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: select own entries"
  ON aura_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users: insert own entries"
  ON aura_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users: update own entries"
  ON aura_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users: delete own entries"
  ON aura_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ── Index ─────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_aura_entries_user_created
  ON aura_entries (user_id, created_at DESC);
