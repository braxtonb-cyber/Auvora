# Self — Step 4 Composition Notes

## What shipped
- `components/self/SelfPortrait.tsx` — centripetal hero composition: atmospheric epithet → identity paragraph → signature word satellites → register trinity (Style · Sonic · Scent) → color language field → pattern insight pullquote → recorded-moments footer.
- `components/self/IdentityParagraph.tsx` — Cormorant-italic paragraph primitive with a thin vertical accent rule. Resting-state fallback reads "Your portrait is still gathering."
- `components/self/TimelineRibbon.tsx` — the app's single archive surface; horizontal-scroll rail of aura tiles (compact orb, vibe name, preview line, palette dots, time-ago chip).
- `components/self/AuraMomentReplay.tsx` — Vaul drawer that plays back a past aura via `AuraRevealScene mode="replay"`.
- `components/tabs/SelfTab.tsx` — orchestrates portrait + ribbon + replay, guarded by `useSectionAtmosphere` for time-of-day body wash.
- `lib/self/identity-paragraph.ts` — extracted from legacy ProfileTab. Pure builders for the identity paragraph, signature words, dominant colors, and pattern insight.
- `lib/self/useSectionAtmosphere.ts` — dawn/morning/midday/dusk/night phase. Returns an epithet, a body wash, and an accent tint.
- `AuraRevealScene` gains `mode: 'reveal' | 'replay'`. Replay tightens pacing, shrinks the palette band, and hides the refine UI.

## Section identity
Per `docs/design/section-differentiation-matrix.md`, Self owns *quiet archival cadence* and *centripetal motion*.
- Header reads "Your AUVORA identity" with an atmospheric epithet ("a quiet dusk", "a clear morning").
- Signature words enter as satellites on golden-angle offsets (see `sectionEnter('self', i)`).
- The register trinity uses borderline typography-only rows — not cards. No dashboards.
- The Timeline is one horizontal rail, not a stacked list. Archival, not settings-like.

## Archive consolidation
- Aura portal no longer renders `AuraArchive`. The portal is a generation surface.
- Bottom nav `profile` → `self` with a new centripetal glyph (concentric rings + center dot).
- Legacy `ProfileTab.tsx` is unreferenced but untouched — Step 8 retires it when the profile/settings consolidation lands.

## Data flow (Step 4 reality)
- `aura_entries` is read from Supabase (authoritative).
- `stylePrefs` / `soundPrefs` are read from localStorage (current reality; Steps 5–7 move them into `style_boards` / `sound_moods`).
- `scent_signature` stays `null` until Step 5 rebuild wires scent profiles.
- The portrait builder in `lib/self/portrait-builder.ts` is still the canonical shape; Step 4 hand-composes a `SelfPortrait` from the sources that currently exist and plugs in to that type.

## Motion pacing
- Self uses the `CINEMATIC` spring with 150ms stagger and `centripetal` vector — slower than Aura, slower than Sound, closer to Scent's sensual cadence but colder.
- Replay drawer skips the character-by-character type-in so taps don't feel like watching a cutscene.
- Time-of-day body wash transitions over 600ms when the hour rolls over.

## What Step 4 does not address
- Persistence of derived portraits into `self_portraits` table.
- Unifying aggregation across `style_boards` / `sound_moods` / `scent_profiles` (those tables are not yet populated).
- Profile/calibration/settings consolidation (Step 8).
- Onboarding collapse into one calibration (Step 9).
