/**
 * Self domain types — the identity portrait derived from every section.
 *
 * Source of truth: supabase/migrations/005_self_portraits.sql
 *
 * SelfPortrait is rebuilt from aggregates (aura_entries, style_boards,
 * sound_moods, scent_profiles) by lib/self/portrait-builder.ts. It is the
 * returning-user hero on the Aura portal and the root composition of the
 * Self tab.
 */

import type { AuraSummary } from './aura';
import type { StyleBoardSummary } from './style';
import type { SoundMoodSummary } from './sound';

// ── Table row (public.self_portraits) ─────────────────────────────────────────

export interface SelfPortraitRow {
  user_id:          string;
  created_at:       string;
  updated_at:       string;

  signature_words:  string[];
  dominant_colors:  string[];
  style_register:   string | null;
  sonic_register:   string | null;
  scent_signature:  string | null;
  last_aura_id:     string | null;
  total_auras:      number;
  pattern_insight:  string | null;
}

// ── Portrait (camelCase, consumed by UI) ──────────────────────────────────────

export interface SelfPortrait {
  signatureWords:  string[];
  dominantColors:  string[];
  styleRegister:   string | null;
  sonicRegister:   string | null;
  scentSignature:  string | null;
  lastAuraId:      string | null;
  totalAuras:      number;
  patternInsight:  string | null;
  updatedAt:       string;
}

export function portraitFromRow(row: SelfPortraitRow): SelfPortrait {
  return {
    signatureWords: row.signature_words ?? [],
    dominantColors: row.dominant_colors ?? [],
    styleRegister:  row.style_register,
    sonicRegister:  row.sonic_register,
    scentSignature: row.scent_signature,
    lastAuraId:     row.last_aura_id,
    totalAuras:     row.total_auras ?? 0,
    patternInsight: row.pattern_insight,
    updatedAt:      row.updated_at,
  };
}

// ── Aggregated inputs the builder consumes ────────────────────────────────────

export interface PortraitInputs {
  auras:      AuraSummary[];
  boards:     StyleBoardSummary[];
  moods:      SoundMoodSummary[];
  scent: {
    signatureDirection: string | null;
    favoriteFamilies:   string[];
    scentPersonality:   string | null;
  } | null;
}

// ── Zero-data resting portrait ────────────────────────────────────────────────
// Shown on first-run users before any aura exists.

export const restingPortrait: SelfPortrait = {
  signatureWords: [],
  dominantColors: ['#F5F0E8', '#0E0C0B', '#C4A46B'],
  styleRegister:  null,
  sonicRegister:  null,
  scentSignature: null,
  lastAuraId:     null,
  totalAuras:     0,
  patternInsight: null,
  updatedAt:      new Date(0).toISOString(),
};
