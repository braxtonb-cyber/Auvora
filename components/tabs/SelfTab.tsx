'use client';

import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import SelfPortrait from '@/components/self/SelfPortrait';
import TimelineRibbon from '@/components/self/TimelineRibbon';
import AuraMomentReplay from '@/components/self/AuraMomentReplay';
import SettingsView from '@/components/SettingsView';
import { useSectionAtmosphere } from '@/lib/self/useSectionAtmosphere';
import { buildIdentityParagraph, extractDominantColors, extractSignatureWords, buildPatternInsight, type StylePrefs, type SoundPrefs } from '@/lib/self/identity-paragraph';
import { summarizeAura, type AuraEntryRow } from '@/lib/types/aura';
import type { SelfPortrait as SelfPortraitData } from '@/lib/types/self';
import { restingPortrait } from '@/lib/types/self';
import { color, type, space } from '@/design/tokens';
import { capture } from '@/lib/posthog';

/**
 * Self tab — the Aura section's archive and reflection surface.
 *
 * Derivation for Step 4:
 *   • aura_entries from Supabase (authoritative)
 *   • stylePrefs / soundPrefs from localStorage (current reality until the
 *     Supabase tables for style_boards / sound_moods are populated by their
 *     own section rebuilds in Steps 5–7)
 *
 * The SelfPortrait type stays the canonical UI input — we just populate it
 * from the sources that exist today. When the structured tables come online
 * in later steps, the portrait-builder can take over without touching this
 * surface.
 */
export default function SelfTab() {
  const atmosphere = useSectionAtmosphere();

  const [entries, setEntries]       = useState<AuraEntryRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [replayEntry, setReplayEntry] = useState<AuraEntryRow | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [stylePrefs, setStylePrefs] = useState<StylePrefs | null>(null);
  const [soundPrefs, setSoundPrefs] = useState<SoundPrefs | null>(null);

  useEffect(() => {
    try {
      const rawStyle = localStorage.getItem('stylePrefs');
      if (rawStyle) setStylePrefs(JSON.parse(rawStyle));

      const rawSound = localStorage.getItem('soundPrefs');
      if (rawSound) setSoundPrefs(JSON.parse(rawSound));
    } catch { /* ignore */ }

    void loadEntries();
    capture('self_tab_viewed');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadEntries() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('aura_entries')
        .select('id, user_id, created_at, vibe_input, output_json, is_saved')
        .order('created_at', { ascending: false })
        .limit(50);
      setEntries((data ?? []) as AuraEntryRow[]);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  // ── Derive portrait data from the sources available today ──────────────────
  const summaries = entries.map(summarizeAura);
  const dominantColors = extractDominantColors(summaries);
  const signatureWords = extractSignatureWords(summaries);
  const patternInsight = buildPatternInsight(summaries);

  const styleRegister =
    stylePrefs
      ? [stylePrefs.aesthetic, stylePrefs.fit, stylePrefs.color]
          .filter(Boolean)
          .map((s) => s.toLowerCase())
          .join(' · ')
          || null
      : null;

  const sonicRegister =
    soundPrefs
      ? [soundPrefs.sonic, soundPrefs.era]
          .filter((v) => v && v !== 'Spanning all eras')
          .map((s) => s.toLowerCase())
          .join(' · ')
          || null
      : null;

  const identityParagraph = buildIdentityParagraph({
    stylePrefs,
    soundPrefs,
    auras: summaries,
  });

  const portrait: SelfPortraitData = entries.length === 0 && !stylePrefs && !soundPrefs
    ? restingPortrait
    : {
        signatureWords,
        dominantColors,
        styleRegister,
        sonicRegister,
        scentSignature: null, // Populated in Step 5 scent rebuild
        lastAuraId:     entries[0]?.id ?? null,
        totalAuras:     entries.length,
        patternInsight,
        updatedAt:      new Date().toISOString(),
      };

  function handleReplay(entry: AuraEntryRow) {
    setReplayEntry(entry);
    capture('self_moment_replay_opened', { aura_id: entry.id });
  }

  if (showSettings) {
    return <SettingsView onBack={() => setShowSettings(false)} />;
  }

  return (
    <m.div
      key="self-tab"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
        background: atmosphere.wash,
        transition: 'background 600ms ease',
      }}
    >
      <div
        style={{
          maxWidth: 440,
          margin: '0 auto',
          padding: '0 16px 40px',
        }}
      >
        {/* Settings affordance — a quiet mono link, preserves reachability
            until Step 8 consolidates profile/settings. */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: 24,
          }}
        >
          <button
            onClick={() => setShowSettings(true)}
            style={{
              ...type.caption,
              color: color.textSecondary,
              opacity: 0.6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: `${space.xs}px ${space.sm}px`,
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}
          >
            Settings
          </button>
        </div>

        <SelfPortrait
          portrait={portrait}
          identityParagraph={identityParagraph}
          atmosphere={atmosphere}
        />

        <div style={{ marginTop: space['3xl'] }}>
          <TimelineRibbon
            entries={entries}
            atmosphere={atmosphere}
            onSelect={handleReplay}
            loading={loading}
          />
        </div>

        <div
          style={{
            textAlign: 'center',
            paddingTop: space['4xl'],
            marginTop: space['4xl'],
          }}
        >
          <p
            style={{
              ...type.caption,
              color: color.textDisabled,
              opacity: 0.6,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            AUVORA by Brogan Atelier
          </p>
        </div>
      </div>

      <AuraMomentReplay
        entry={replayEntry}
        onClose={() => setReplayEntry(null)}
      />
    </m.div>
  );
}
