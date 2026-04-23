-- ── self_portraits ───────────────────────────────────────────────────────────
-- Derived + cultivated identity across sections. One row per user. Rebuilt
-- from aggregates (aura_entries, style_boards, sound_moods, scent_profiles)
-- via lib/self/portrait-builder.ts; surfaced as the returning-user hero on
-- the Aura portal and the Self tab.

CREATE TABLE IF NOT EXISTS self_portraits (
  user_id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  signature_words   TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[],
  dominant_colors   TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[],
  style_register    TEXT,
  sonic_register    TEXT,
  scent_signature   TEXT,
  last_aura_id      UUID        REFERENCES aura_entries(id) ON DELETE SET NULL,
  total_auras       INTEGER     NOT NULL DEFAULT 0,
  pattern_insight   TEXT
);

-- ── updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION self_portraits_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_self_portraits_updated_at ON self_portraits;
CREATE TRIGGER trg_self_portraits_updated_at
  BEFORE UPDATE ON self_portraits
  FOR EACH ROW
  EXECUTE FUNCTION self_portraits_set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE self_portraits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: select own self_portrait"
  ON self_portraits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users: insert own self_portrait"
  ON self_portraits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users: update own self_portrait"
  ON self_portraits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users: delete own self_portrait"
  ON self_portraits FOR DELETE
  USING (auth.uid() = user_id);
