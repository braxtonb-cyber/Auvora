'use client';

import { useState, useEffect, useRef } from 'react';
import { Cormorant_Garamond, DM_Mono } from 'next/font/google';
import { createClient } from '@/lib/supabase/client';
import AuraShell from '@/components/AuraShell';
import StillPointInput from '@/components/StillPointInput';
import AuraGenerateButton from '@/components/AuraGenerateButton';
import AuraOrb from '@/components/AuraOrb';
import SplashScreen from '@/components/SplashScreen';
import OnboardingFlow, { AuvoraProfile } from '@/components/OnboardingFlow';
import BottomNav, { AuvoraTab } from '@/components/BottomNav';
import StyleTab from '@/components/tabs/StyleTab';
import ScentTab from '@/components/tabs/ScentTab';
import SoundTab from '@/components/tabs/SoundTab';
import SelfTab  from '@/components/tabs/SelfTab';
import CheckInCard, { PendingCheckin } from '@/components/CheckInCard';
import GenerateCeremony from '@/components/aura/GenerateCeremony';
import AuraRevealScene from '@/components/aura/AuraRevealScene';
import { capture, identify } from '@/lib/posthog';

// ── New fonts (Cormorant + DM Mono) used by splash / onboarding / nav ─────────

const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  weight:   ['300', '400', '500'],
  style:    ['normal', 'italic'],
  variable: '--font-cormorant',
});

const mono = DM_Mono({
  subsets:  ['latin'],
  weight:   ['300', '400'],
  variable: '--font-mono',
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuraRationale {
  signal:    string;
  outfit:    string;
  fragrance: string;
  playlist:  string;
}

interface AuraResult {
  vibeName:  string;
  outfit:    { title: string; description: string };
  fragrance: { title: string; notes: string };
  playlist:  { title: string; tracks: string[] };
  palette:   { hex: string; name: string }[];
  caption:   string;
  rationale: AuraRationale | null;
}

interface RecentEntry {
  id:          string;
  vibe_input:  string;
  created_at:  string;
  output_json: {
    vibeName: string;
    palette:  { hex: string; name: string }[];
  };
}

type Phase = 'idle' | 'loading' | 'result' | 'error';

// ── Pattern analysis — derives a 1-line insight from recent vibe history ──────

function analyzePattern(entries: RecentEntry[]): string | null {
  if (entries.length < 2) return null;
  const text = entries
    .map(e => e.vibe_input.replace(/\[context:.*?\]/gi, '').toLowerCase())
    .join(' ');
  const m = (re: RegExp) => (text.match(re) || []).length;
  const quiet  = m(/\b(quiet|still|silent|alone|soft|slow|calm|gentle|peace|solitude|intimate|empty|muted|fog|rain|interior|hush|subdued)\b/g);
  const active = m(/\b(energy|sharp|confident|vibrant|alive|social|power|drive|pulse|city|electric|bold|loud|charged|momentum)\b/g);
  const night  = m(/\b(night|midnight|late|dark|evening|neon|dusk|2am|after dark)\b/g);
  const warm   = m(/\b(warm|sun|golden|summer|heat|afternoon|morning|light|dawn)\b/g);
  if (quiet > active && night > warm)  return 'Lately, you\'ve been drawn toward stillness in the dark — interior, unrushed, low signal.';
  if (quiet > active)                  return 'Lately, you\'ve been reaching for quiet — soft atmospheres, unhurried light, subdued presence.';
  if (active > quiet && night > warm)  return 'Your recent auras carry nocturnal charge — high contrast, deliberate energy, present in the city.';
  if (active > quiet)                  return 'Your recent auras have momentum — focused, outward-facing, present-tense.';
  return 'Your recent auras span different registers — you\'re moving through varied emotional terrain this week.';
}

// ── Returning-user chip ───────────────────────────────────────────────────────

function RecentVibeChip({
  entry,
  onSelect,
}: {
  entry:    RecentEntry;
  onSelect: (vibe: string) => void;
}) {
  const palette   = entry.output_json?.palette?.slice(0, 3) ?? [];
  const cleanVibe = entry.vibe_input.replace(/\[context:.*?\]/gi, '').trim();
  const truncated = cleanVibe.length > 42 ? cleanVibe.slice(0, 40) + '…' : cleanVibe;

  return (
    <button
      onClick={() => onSelect(cleanVibe)}
      style={{
        display:              'flex',
        flexDirection:        'column',
        alignItems:           'flex-start',
        gap:                  6,
        padding:              '12px 14px',
        background:           'var(--surface)',
        border:               '0.5px solid var(--border-subtle)',
        borderRadius:         16,
        cursor:               'pointer',
        outline:              'none',
        WebkitTapHighlightColor: 'transparent',
        textAlign:            'left',
        width:                '100%',
        transition:           'border-color 0.18s ease, transform 0.12s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {palette.map((p, i) => (
            <div
              key={i}
              style={{
                width: 9, height: 9, borderRadius: '50%',
                background: p.hex,
                border: '0.5px solid rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>
        <span
          className="font-display"
          style={{
            fontSize: '0.88rem', fontStyle: 'italic', fontWeight: 300,
            color: 'var(--text-primary)', flex: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {entry.output_json?.vibeName || 'Past aura'}
        </span>
        <span style={{ color: 'var(--text-disabled)', fontSize: '0.72rem', flexShrink: 0 }}>→</span>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontWeight: 300,
          color: 'var(--text-disabled)', letterSpacing: '0.02em', lineHeight: 1.4,
        }}
      >
        {truncated}
      </span>
    </button>
  );
}

// ── Seeded vibes ──────────────────────────────────────────────────────────────

const QUICK_VIBES = [
  'quiet morning in a Parisian flat, coffee and rain on glass',
  'midnight drive through neon city streets, alone',
  'golden hour on an empty Italian coast',
  'first cold morning of autumn, fog on the hills',
  'underground art opening, strangers who feel known',
  'slow Sunday, nowhere to be, everything soft',
  'library at 2am, searching for something unnamed',
  'late summer heat, long shadows, dust and stillness',
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function AuvoraApp() {
  const supabase = createClient();

  // ── App layer state ────────────────────────────────────────────────────────
  const [splashDone,     setSplashDone]     = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [profile,        setProfile]        = useState<AuvoraProfile | null>(null);
  const [activeTab,      setActiveTab]      = useState<AuvoraTab>('aura');

  // ── Generator state ────────────────────────────────────────────────────────
  const [vibe,            setVibe]            = useState('');
  const [phase,           setPhase]           = useState<Phase>('idle');
  const [result,          setResult]          = useState<AuraResult | null>(null);
  const [errorMsg,        setErrorMsg]        = useState('');
  const [savedCount,      setSavedCount]      = useState(0);

  // ── Returning-user intelligence ────────────────────────────────────────────
  const [recentEntries,  setRecentEntries]  = useState<RecentEntry[]>([]);
  const [patternInsight, setPatternInsight] = useState<string | null>(null);

  // ── Check-in loop ─────────────────────────────────────────────────────────
  const [pendingCheckin, setPendingCheckin] = useState<PendingCheckin | null>(null);

  // ── Generation ID guard — lets the ceremony cancel invalidate in-flight
  //     fetches so a dismissed generation never pops a reveal scene later.
  const genIdRef = useRef(0);

  // ── Init: splash + onboarding gates ───────────────────────────────────────
  useEffect(() => {
    const splashSeen = sessionStorage.getItem('auvoraSplashSeen');
    if (splashSeen) setSplashDone(true);

    const savedProfile = localStorage.getItem('auvoraProfile');
    const onboarded    = localStorage.getItem('auvoraOnboarded');
    if (onboarded && savedProfile) {
      try { setProfile(JSON.parse(savedProfile)); } catch { /* ignore */ }
      setOnboardingDone(true);
    }

    // Surface pending check-in if >= 30 min since last generation
    try {
      const raw = localStorage.getItem('pendingCheckin');
      if (raw) {
        const pc = JSON.parse(raw) as PendingCheckin;
        const minsSince = (Date.now() - new Date(pc.generatedAt).getTime()) / 60000;
        if (minsSince >= 30) setPendingCheckin(pc);
      }
    } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Silent anonymous auth on first visit ──────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        identify(session.user.id);
      } else {
        supabase.auth.signInAnonymously()
          .then(({ data }) => { if (data.user) identify(data.user.id); })
          .catch((err) => { console.error('[AUVORA] signInAnonymously failed:', err); });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load returning-user history for chips + pattern ───────────────────────
  useEffect(() => {
    if (!onboardingDone) return;
    void loadRecentEntries();
  }, [onboardingDone, savedCount]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadRecentEntries() {
    try {
      const { data } = await supabase
        .from('aura_entries')
        .select('id, vibe_input, created_at, output_json')
        .order('created_at', { ascending: false })
        .limit(3);
      const entries = (data ?? []) as RecentEntry[];
      setRecentEntries(entries);
      setPatternInsight(analyzePattern(entries));
    } catch {
      // Returning-user features degrade silently
    }
  }

  function handleSplashComplete() {
    sessionStorage.setItem('auvoraSplashSeen', '1');
    setSplashDone(true);
  }

  function handleOnboardingComplete(p: AuvoraProfile) {
    setProfile(p);
    setOnboardingDone(true);
    capture('auvora_onboarding_completed', { moment: p.moment, vibe: p.vibe, focus: p.focus });
  }

  // ── Silent save after generation ──────────────────────────────────────────
  async function silentSave(vibeInput: string, aura: AuraResult) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[AUVORA] silentSave: no authenticated user — is Anonymous sign-in enabled in Supabase?');
        return;
      }
      const { error } = await supabase.from('aura_entries').insert({
        user_id:     user.id,
        vibe_input:  vibeInput,
        output_json: aura,
        is_saved:    true,
      });
      if (error) {
        console.error('[AUVORA] aura_entries insert failed:', error);
      } else {
        setSavedCount((c) => c + 1);
      }
    } catch (err) {
      console.error('[AUVORA] silentSave threw:', err);
    }
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleQuickVibe() {
    const pick = QUICK_VIBES[Math.floor(Math.random() * QUICK_VIBES.length)];
    setVibe(pick);
    capture('aura_quick_vibe_used');
  }

  async function handleGenerate(vibeOverride?: string) {
    const baseVibe = vibeOverride ?? vibe;
    const trimmed  = baseVibe.trim();
    if (!trimmed || phase === 'loading') return;

    if (vibeOverride) setVibe(vibeOverride);

    const genId = ++genIdRef.current;

    setPhase('loading');
    setResult(null);
    setErrorMsg('');
    capture('aura_generate_started', { vibe_length: trimmed.length, has_profile: !!profile, has_recent: recentEntries.length > 0 });

    // Enrich vibe with profile context if available
    const enrichedVibe = profile
      ? `${trimmed} [context: preparing for ${profile.moment} moment, natural vibe is ${profile.vibe}, focused on ${profile.focus}]`
      : trimmed;

    try {
      const res = await fetch('/api/generate-aura', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt: enrichedVibe }),
      });
      const data = await res.json();
      if (genIdRef.current !== genId) return; // cancelled
      if (!res.ok) throw new Error(data.error || 'Generation failed.');

      setResult(data.aura);
      setPhase('result');
      capture('aura_generate_completed', { vibe_name: data.aura.vibeName });

      void silentSave(trimmed, data.aura);

      // Queue a check-in for the next session (shown after 30 min idle)
      try {
        localStorage.setItem('pendingCheckin', JSON.stringify({
          vibeInput:   trimmed,
          vibeName:    data.aura.vibeName,
          generatedAt: new Date().toISOString(),
        } satisfies PendingCheckin));
        setPendingCheckin(null); // hide any existing check-in during active session
      } catch { /* ignore */ }
    } catch (err) {
      if (genIdRef.current !== genId) return; // cancelled
      const msg = err instanceof Error ? err.message : 'Generation failed. Please try again.';
      setErrorMsg(msg);
      setPhase('error');
      capture('aura_generate_failed', { error: msg });
    }
  }

  function handleCancelCeremony() {
    // Invalidate in-flight fetch; its handler will see a stale genId and bail.
    genIdRef.current++;
    setPhase('idle');
    capture('aura_generate_cancelled');
  }

  function handleRefine(refinement: string) {
    const base = vibe.replace(/\[context:.*?\]/gi, '').trim();
    const combined = base ? `${base} — ${refinement}` : refinement;
    void handleGenerate(combined);
  }

  // ── Tab handling ──────────────────────────────────────────────────────────

  function handleTabChange(tab: AuvoraTab) {
    capture('tab_changed', { tab, from: activeTab });
    const LIVE_TABS: AuvoraTab[] = ['aura', 'style', 'scent', 'sound', 'self'];
    if (!LIVE_TABS.includes(tab)) {
      setActiveTab(tab);
      setTimeout(() => setActiveTab('aura'), 1200);
      return;
    }
    setActiveTab(tab);
  }

  const orbColors  = result?.palette.map((p) => p.hex) ?? [];
  const isDisabled = !vibe.trim() || phase === 'loading';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`${cormorant.variable} ${mono.variable}`}>

      {/* ── Splash ── */}
      {!splashDone && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {/* ── Onboarding ── */}
      {splashDone && !onboardingDone && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}

      {/* ── Main app ── */}
      {splashDone && onboardingDone && (
        <>
          {/* Tab content */}
          <div
            key={activeTab}
            style={{
              paddingBottom: 80,
              animation:     'au-tab-switch 0.5s linear',
            }}
          >
            {activeTab === 'style' ? <StyleTab /> :
             activeTab === 'scent' ? <ScentTab /> :
             activeTab === 'sound' ? <SoundTab /> :
             activeTab === 'self'  ? <SelfTab />  :
             /* ── Aura tab (existing generator UI) ── */
             <AuraShell>

               {/* ── Header ── */}
               <header
                 style={{
                   paddingTop:   52,
                   textAlign:    'center',
                   marginBottom: 12,
                   animation:    'fadeIn 0.9s ease forwards',
                 }}
               >
                 <p
                   style={{
                     fontFamily:    'var(--font-body)',
                     fontSize:      '0.56rem',
                     letterSpacing: '0.32em',
                     color:         'var(--gold)',
                     opacity:       0.65,
                     textTransform: 'uppercase',
                     marginBottom:  10,
                   }}
                 >
                   ◈ Aura OS
                 </p>

                 <h1
                   className="font-display"
                   style={{
                     fontSize:      'clamp(2.8rem, 11vw, 4rem)',
                     fontWeight:    300,
                     letterSpacing: '0.15em',
                     textTransform: 'uppercase',
                     color:         'var(--text-primary)',
                     lineHeight:    1,
                   }}
                 >
                   AUVORA
                 </h1>

                 <p
                   style={{
                     fontFamily:    'var(--font-body)',
                     fontSize:      '0.72rem',
                     fontWeight:    300,
                     color:         'var(--text-secondary)',
                     letterSpacing: '0.1em',
                     marginTop:     12,
                   }}
                 >
                   Editorial aura operating system
                 </p>
               </header>

               {/* ── Orb ── */}
               <div style={{ animation: 'driftUp 0.7s 0.15s cubic-bezier(0.22,1,0.36,1) both' }}>
                 <AuraOrb colors={orbColors} isActive={phase === 'result'} />
               </div>

               {/* ── Check-in card ── */}
               {phase === 'idle' && pendingCheckin && (
                 <div style={{ animation: 'au-fade-up 0.5s 0.1s ease both' }}>
                   <CheckInCard
                     checkin={pendingCheckin}
                     onComplete={() => {
                       localStorage.removeItem('pendingCheckin');
                       setPendingCheckin(null);
                     }}
                     onSkip={() => {
                       localStorage.removeItem('pendingCheckin');
                       setPendingCheckin(null);
                     }}
                   />
                 </div>
               )}

               {/* ── Returning-user chips ── */}
               {phase === 'idle' && recentEntries.length > 0 && (
                 <div style={{ animation: 'au-fade-up 0.5s 0.15s ease both', marginBottom: 4 }}>
                   {patternInsight && (
                     <p
                       className="font-display"
                       style={{
                         fontSize: '0.84rem', fontStyle: 'italic', fontWeight: 300,
                         color: 'var(--text-secondary)', lineHeight: 1.65,
                         marginBottom: 16, opacity: 0.72, letterSpacing: '0.01em',
                       }}
                     >
                       {patternInsight}
                     </p>
                   )}
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
                     {recentEntries.map((entry, i) => (
                       <div key={entry.id} style={{ animation: `au-fade-up 0.4s ${i * 55}ms ease both` }}>
                         <RecentVibeChip
                           entry={entry}
                           onSelect={(v) => { capture('aura_chip_tapped'); setVibe(v); void handleGenerate(v); }}
                         />
                       </div>
                     ))}
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
                     <div style={{ flex: 1, height: '0.5px', background: 'var(--border-subtle)' }} />
                     <span style={{
                       fontFamily: 'var(--font-body)', fontSize: '0.56rem', fontWeight: 400,
                       letterSpacing: '0.2em', color: 'var(--text-disabled)', textTransform: 'uppercase',
                     }}>
                       or describe a new moment
                     </span>
                     <div style={{ flex: 1, height: '0.5px', background: 'var(--border-subtle)' }} />
                   </div>
                 </div>
               )}

               {/* ── Input ── */}
               <div style={{ animation: 'driftUp 0.6s 0.25s cubic-bezier(0.22,1,0.36,1) both' }}>
                 <StillPointInput
                   value={vibe}
                   onChange={setVibe}
                   disabled={phase === 'loading'}
                 />

                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                   <button
                     onClick={handleQuickVibe}
                     disabled={phase === 'loading'}
                     style={{
                       background:    'transparent',
                       border:        '1px solid var(--border-subtle)',
                       borderRadius:  'var(--radius-md)',
                       padding:       '0 16px',
                       height:        40,
                       fontFamily:    'var(--font-body)',
                       fontSize:      '0.74rem',
                       fontWeight:    300,
                       color:         'var(--text-secondary)',
                       cursor:        phase === 'loading' ? 'default' : 'pointer',
                       letterSpacing: '0.04em',
                       whiteSpace:    'nowrap',
                       flexShrink:    0,
                       transition:    'border-color 0.15s ease, color 0.15s ease',
                       opacity:       phase === 'loading' ? 0.4 : 1,
                     }}
                     onMouseEnter={(e) => {
                       if (phase !== 'loading') {
                         (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-interactive)';
                         (e.currentTarget as HTMLButtonElement).style.color       = 'var(--text-primary)';
                       }
                     }}
                     onMouseLeave={(e) => {
                       (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)';
                       (e.currentTarget as HTMLButtonElement).style.color       = 'var(--text-secondary)';
                     }}
                   >
                     Inspire me
                   </button>

                   <div style={{ flex: 1 }}>
                     <AuraGenerateButton
                       onClick={() => handleGenerate()}
                       isLoading={phase === 'loading'}
                       disabled={isDisabled}
                     />
                   </div>
                 </div>
               </div>

               {/* ── Error ── */}
               {phase === 'error' && (
                 <div
                   style={{
                     marginTop:    28,
                     padding:      '20px 22px',
                     background:   'var(--surface)',
                     border:       '1px solid rgba(180,60,60,0.22)',
                     borderRadius: 'var(--radius-lg)',
                     animation:    'driftUp 0.35s ease forwards',
                   }}
                 >
                   <p
                     style={{
                       fontFamily:   'var(--font-body)',
                       fontSize:     '0.84rem',
                       color:        '#c97070',
                       lineHeight:   1.5,
                       marginBottom: 14,
                     }}
                   >
                     {errorMsg}
                   </p>
                   <button
                     onClick={() => handleGenerate()}
                     style={{
                       background:    'transparent',
                       border:        '1px solid var(--border-interactive)',
                       borderRadius:  'var(--radius-md)',
                       padding:       '9px 18px',
                       color:         'var(--text-primary)',
                       fontFamily:    'var(--font-body)',
                       fontSize:      '0.78rem',
                       fontWeight:    400,
                       letterSpacing: '0.06em',
                       cursor:        'pointer',
                       transition:    'border-color 0.15s ease',
                     }}
                   >
                     Retry
                   </button>
                 </div>
               )}

               {/* ── Reveal ── */}
               {phase === 'result' && result && (
                 <AuraRevealScene aura={result} onRefine={handleRefine} />
               )}

               {/* Archive lives in Self — the Aura portal stays a generation
                   surface, not a history ledger. */}

               {/* ── Footer ── */}
               <footer
                 style={{
                   textAlign:  'center',
                   padding:    '52px 0 0',
                   marginTop:  48,
                   borderTop:  '1px solid var(--border-subtle)',
                 }}
               >
                 <p
                   style={{
                     fontFamily:    'var(--font-body)',
                     fontSize:      '0.58rem',
                     fontWeight:    300,
                     color:         'var(--text-disabled)',
                     letterSpacing: '0.16em',
                     textTransform: 'uppercase',
                   }}
                 >
                   AUVORA by Brogan Atelier
                 </p>
               </footer>

             </AuraShell>
            }
          </div>

          {/* ── Bottom nav ── */}
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

          {/* ── Ceremony overlay — full-screen during generation ── */}
          <GenerateCeremony
            isOpen={phase === 'loading'}
            onCancel={handleCancelCeremony}
          />
        </>
      )}

    </div>
  );
}
