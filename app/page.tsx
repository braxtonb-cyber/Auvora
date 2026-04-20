'use client';

import { useState } from 'react';
import AuraShell from '@/components/AuraShell';
import StillPointInput from '@/components/StillPointInput';
import AuraGenerateButton from '@/components/AuraGenerateButton';
import AuraOrb from '@/components/AuraOrb';
import AuraCard from '@/components/AuraCard';
import PaletteSwatchRow from '@/components/PaletteSwatchRow';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuraResult {
  vibeName: string;
  outfit: { title: string; description: string };
  fragrance: { title: string; notes: string };
  playlist: { title: string; tracks: string[] };
  palette: { hex: string; name: string }[];
  caption: string;
}

type Phase = 'idle' | 'loading' | 'result' | 'error';

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
  const [vibe, setVibe]     = useState('');
  const [phase, setPhase]   = useState<Phase>('idle');
  const [result, setResult] = useState<AuraResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied]  = useState(false);

  function handleQuickVibe() {
    const pick = QUICK_VIBES[Math.floor(Math.random() * QUICK_VIBES.length)];
    setVibe(pick);
  }

  async function handleGenerate() {
    const trimmed = vibe.trim();
    if (!trimmed || phase === 'loading') return;

    setPhase('loading');
    setResult(null);
    setErrorMsg('');
    setCopied(false);

    try {
      const res = await fetch('/api/generate-aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed.');
      setResult(data.aura);
      setPhase('result');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Generation failed. Please try again.');
      setPhase('error');
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // clipboard unavailable — silent
    }
  }

  const orbColors  = result?.palette.map((p) => p.hex) ?? [];
  const isDisabled = !vibe.trim() || phase === 'loading';

  return (
    <AuraShell>

      {/* ── Header ── */}
      <header
        style={{
          paddingTop: 52,
          textAlign: 'center',
          marginBottom: 12,
          animation: 'fadeIn 0.9s ease forwards',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.56rem',
            letterSpacing: '0.32em',
            color: 'var(--gold)',
            opacity: 0.65,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          ◈ Aura OS
        </p>

        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(2.8rem, 11vw, 4rem)',
            fontWeight: 300,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          AUVORA
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.72rem',
            fontWeight: 300,
            color: 'var(--text-secondary)',
            letterSpacing: '0.1em',
            marginTop: 12,
          }}
        >
          Editorial aura operating system
        </p>
      </header>

      {/* ── Orb — always visible, recolors on result ── */}
      <div style={{ animation: 'driftUp 0.7s 0.15s cubic-bezier(0.22,1,0.36,1) both' }}>
        <AuraOrb colors={orbColors} isActive={phase === 'result'} />
      </div>

      {/* ── Input section ── */}
      <div style={{ animation: 'driftUp 0.6s 0.25s cubic-bezier(0.22,1,0.36,1) both' }}>
        <StillPointInput
          value={vibe}
          onChange={setVibe}
          disabled={phase === 'loading'}
        />

        {/* Quick Vibe + Generate row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 12,
          }}
        >
          <button
            onClick={handleQuickVibe}
            disabled={phase === 'loading'}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0 16px',
              height: 40,
              fontFamily: 'var(--font-body)',
              fontSize: '0.74rem',
              fontWeight: 300,
              color: 'var(--text-secondary)',
              cursor: phase === 'loading' ? 'default' : 'pointer',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'border-color 0.15s ease, color 0.15s ease',
              opacity: phase === 'loading' ? 0.4 : 1,
            }}
            onMouseEnter={(e) => {
              if (phase !== 'loading') {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  'var(--border-interactive)';
                (e.currentTarget as HTMLButtonElement).style.color =
                  'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                'var(--border-subtle)';
              (e.currentTarget as HTMLButtonElement).style.color =
                'var(--text-secondary)';
            }}
          >
            Quick Vibe
          </button>

          <div style={{ flex: 1 }}>
            <AuraGenerateButton
              onClick={handleGenerate}
              isLoading={phase === 'loading'}
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>

      {/* ── Skeleton loader ── */}
      {phase === 'loading' && (
        <div
          style={{
            marginTop: 36,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            animation: 'fadeIn 0.35s ease forwards',
          }}
        >
          <div className="skeleton" style={{ height: 48 }} />
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 96 }} />
          <div className="skeleton" style={{ height: 140 }} />
          <div className="skeleton" style={{ height: 72 }} />
        </div>
      )}

      {/* ── Error state ── */}
      {phase === 'error' && (
        <div
          style={{
            marginTop: 28,
            padding: '20px 22px',
            background: 'var(--surface)',
            border: '1px solid rgba(180, 60, 60, 0.22)',
            borderRadius: 'var(--radius-lg)',
            animation: 'driftUp 0.35s ease forwards',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.84rem',
              color: '#c97070',
              lineHeight: 1.5,
              marginBottom: 14,
            }}
          >
            {errorMsg}
          </p>
          <button
            onClick={handleGenerate}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-interactive)',
              borderRadius: 'var(--radius-md)',
              padding: '9px 18px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.78rem',
              fontWeight: 400,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Result ── */}
      {phase === 'result' && result && (
        <div style={{ marginTop: 36 }}>

          {/* Vibe name */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: 28,
              animation: 'driftUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.58rem',
                fontWeight: 400,
                letterSpacing: '0.22em',
                color: 'var(--text-disabled)',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Your Aura
            </p>
            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(1.9rem, 7vw, 2.8rem)',
                fontStyle: 'italic',
                fontWeight: 300,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
              }}
            >
              {result.vibeName}
            </h2>
          </div>

          {/* Palette */}
          <div
            style={{
              animation: 'driftUp 0.5s 60ms cubic-bezier(0.22,1,0.36,1) both',
              marginBottom: 24,
            }}
          >
            <PaletteSwatchRow palette={result.palette} />
          </div>

          {/* Staggered cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AuraCard type="outfit"    data={result.outfit}    delay={0}   />
            <AuraCard type="fragrance" data={result.fragrance} delay={80}  />
            <AuraCard type="playlist"  data={result.playlist}  delay={160} />
            <AuraCard type="caption"   data={result.caption}   delay={240} />
          </div>

          {/* Copy caption button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 20,
              animation: 'driftUp 0.5s 320ms cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            <button
              onClick={handleCopy}
              aria-label="Copy caption to clipboard"
              style={{
                background: copied ? 'rgba(202, 138, 4, 0.1)' : 'transparent',
                border: `1px solid ${copied ? 'rgba(202, 138, 4, 0.35)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '10px 22px',
                color: copied ? 'var(--gold)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.74rem',
                fontWeight: 300,
                letterSpacing: '0.07em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
            >
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Caption
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer
        style={{
          textAlign: 'center',
          padding: '52px 0 0',
          marginTop: phase === 'idle' ? 60 : 48,
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.58rem',
            fontWeight: 300,
            color: 'var(--text-disabled)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          AUVORA — Aura OS &copy; {new Date().getFullYear()}
        </p>
      </footer>

    </AuraShell>
  );
}
