-- ── scent_profiles ───────────────────────────────────────────────────────────
-- Server-side home for the Scent concierge state. One row per user; JSONB
-- columns hold the ScentOnboardingAnswers, wardrobe, preferences, and wear
-- log already defined in lib/scent/types.ts. The existing 10 lib/scent/
-- intelligence modules consume these shapes unchanged.

CREATE TABLE IF NOT EXISTS scent_profiles (
  user_id     UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  onboarding  JSONB       NOT NULL DEFAULT '{}'::jsonb,
  wardrobe    JSONB       NOT NULL DEFAULT '[]'::jsonb,
  preferences JSONB       NOT NULL DEFAULT '{}'::jsonb,
  wear_log    JSONB       NOT NULL DEFAULT '[]'::jsonb
);

-- ── updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION scent_profiles_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scent_profiles_updated_at ON scent_profiles;
CREATE TRIGGER trg_scent_profiles_updated_at
  BEFORE UPDATE ON scent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION scent_profiles_set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE scent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: select own scent_profile"
  ON scent_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users: insert own scent_profile"
  ON scent_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users: update own scent_profile"
  ON scent_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users: delete own scent_profile"
  ON scent_profiles FOR DELETE
  USING (auth.uid() = user_id);
