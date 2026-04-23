-- ── style_boards ─────────────────────────────────────────────────────────────
-- Saved visual directions from the Style section. Inspiration, not prescription:
-- boards hold concept, story, palette, silhouette keywords, typographic
-- treatment, mood words — NEVER a `pieces: string[]` list.

CREATE TABLE IF NOT EXISTS style_boards (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aura_id     UUID        REFERENCES aura_entries(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  concept     TEXT        NOT NULL,
  story       TEXT        NOT NULL,
  palette     JSONB       NOT NULL DEFAULT '[]'::jsonb,
  silhouette  JSONB       NOT NULL DEFAULT '[]'::jsonb,
  typography  JSONB       NOT NULL DEFAULT '{}'::jsonb,
  mood_words  JSONB       NOT NULL DEFAULT '[]'::jsonb,
  rationale   TEXT
);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE style_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: select own style_boards"
  ON style_boards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users: insert own style_boards"
  ON style_boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users: update own style_boards"
  ON style_boards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users: delete own style_boards"
  ON style_boards FOR DELETE
  USING (auth.uid() = user_id);

-- ── Index ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_style_boards_user_created
  ON style_boards (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_style_boards_aura
  ON style_boards (aura_id)
  WHERE aura_id IS NOT NULL;
