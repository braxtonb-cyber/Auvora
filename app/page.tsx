'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Generator from '@/components/Generator';
import AuraResult from '@/components/AuraResult';
import AuraHistory from '@/components/AuraHistory';
import { parseColors } from '@/lib/utils';

type AppView = 'generate' | 'history';

interface Aura {
  vibe_name: string;
  outfit: string;
  fragrance: string;
  playlist: string;
  colors: string;
  caption: string;
}

interface SavedAura extends Aura {
  id: string;
  created_at: string;
  prompt?: string;
  vibe?: string;
  favorite: boolean;
}

export default function AuvoraApp() {
  const [view, setView] = useState<AppView>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAura, setCurrentAura] = useState<Aura | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedAuras, setSavedAuras] = useState<SavedAura[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch aura history
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('auras')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setSavedAuras(data || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle generation
  async function handleGenerate(prompt: string) {
    setIsGenerating(true);
    setCurrentAura(null);
    setError(null);
    setIsSaved(false);
    setCurrentPrompt(prompt);

    try {
      const res = await fetch('/api/generate-aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation did not complete. Refine the input and try again.');
      }

      setCurrentAura(data.aura);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Generation did not complete. Refine the input and try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  }

  // Handle save
  async function handleSave() {
    if (!currentAura || isSaved || isSaving) return;
    setIsSaving(true);
    try {
      const { error: insertError } = await supabase.from('auras').insert([
        {
          prompt: currentPrompt,
          vibe_name: currentAura.vibe_name,
          vibe: currentAura.vibe_name, // legacy compat
          outfit: currentAura.outfit,
          fragrance: currentAura.fragrance,
          playlist: currentAura.playlist,
          colors: currentAura.colors,
          caption: currentAura.caption,
          favorite: false,
        },
      ]);

      if (insertError) throw insertError;
      setIsSaved(true);
      await fetchHistory();
    } catch (err: unknown) {
      console.error('Save failed:', err);
      setError('Save did not complete. Try again in a moment.');
    } finally {
      setIsSaving(false);
    }
  }

  // Handle favorite toggle
  async function handleFavorite(id: string, currentFavorite: boolean) {
    try {
      const { error: updateError } = await supabase
        .from('auras')
        .update({ favorite: !currentFavorite })
        .eq('id', id);

      if (updateError) throw updateError;
      setSavedAuras((prev) =>
        prev.map((a) => (a.id === id ? { ...a, favorite: !currentFavorite } : a))
      );
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  }

  // Handle delete
  async function handleDelete(id: string) {
    try {
      const { error: deleteError } = await supabase
        .from('auras')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setSavedAuras((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  const ambientColors = currentAura ? parseColors(currentAura.colors) : [];

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Ambient top glow */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80vw',
          height: '40vh',
          background: `radial-gradient(ellipse at center top, rgba(196, 164, 107, 0.07) 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Dynamic color atmosphere */}
      {ambientColors.length > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            background: `
              radial-gradient(ellipse at 15% 60%, ${ambientColors[0]}18 0%, transparent 55%),
              radial-gradient(ellipse at 85% 30%, ${ambientColors[1] || ambientColors[0]}12 0%, transparent 50%)
            `,
            transition: 'background 1.5s ease',
            animation: 'fadeIn 1.5s ease forwards',
          }}
        />
      )}

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
          padding: '0 20px',
          flex: 1,
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: '32px 0 0',
            textAlign: 'center',
            animation: 'fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          }}
        >
          <div style={{ marginBottom: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                letterSpacing: '0.3em',
                color: 'var(--gold)',
                opacity: 0.7,
                textTransform: 'uppercase',
              }}
            >
              ◈ Aura OS
            </span>
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(2.6rem, 10vw, 3.8rem)',
              fontWeight: 300,
              letterSpacing: '0.12em',
              color: 'var(--text-primary)',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            AUVORA
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              color: 'var(--text-tertiary)',
              marginTop: 10,
              textTransform: 'uppercase',
            }}
          >
            Editorial aura operating system
          </p>
        </header>

        {/* Nav tabs */}
        <nav
          style={{
            display: 'flex',
            gap: 4,
            marginTop: 28,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 100,
            padding: 4,
            animation: 'fadeIn 0.6s 0.2s ease both',
          }}
        >
          {(['generate', 'history'] as AppView[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              style={{
                flex: 1,
                padding: '9px 16px',
                borderRadius: 100,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                transition: 'all 0.25s var(--transition)',
                background:
                  view === tab
                    ? 'rgba(196, 164, 107, 0.12)'
                    : 'transparent',
                color: view === tab ? 'var(--gold)' : 'var(--text-tertiary)',
                borderColor: view === tab ? 'transparent' : 'transparent',
              }}
            >
              {tab === 'generate' ? 'Generate' : `Archive${savedAuras.length ? ` (${savedAuras.length})` : ''}`}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div style={{ marginTop: 24 }}>
          {view === 'generate' ? (
            <div key="generate">
              {/* Generator input */}
              <div style={{ animation: 'fadeInUp 0.5s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
                <Generator
                  onGenerate={handleGenerate}
                  isLoading={isGenerating}
                  phase={isGenerating ? 'loading' : 'idle'}
                />
              </div>

              {/* Error state */}
              {error && (
                <div
                  style={{
                    marginTop: 20,
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(201, 112, 112, 0.25)',
                    background: 'rgba(201, 112, 112, 0.06)',
                    animation: 'fadeIn 0.3s ease forwards',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      color: '#c97070',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {error}
                  </p>
                </div>
              )}

              {/* Result */}
              {!isGenerating && currentAura && (
                <div
                  style={{
                    marginTop: 8,
                    animation: 'fadeInUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                  }}
                >
                  <div className="gold-divider" style={{ marginBottom: 0 }} />
                  <AuraResult
                    aura={currentAura}
                    onSave={handleSave}
                    isSaving={isSaving}
                    isSaved={isSaved}
                  />
                </div>
              )}

              {/* Empty state (no aura yet) */}
              {!isGenerating && !currentAura && !error && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '52px 24px',
                    animation: 'fadeIn 0.5s 0.3s ease both',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      margin: '0 auto 20px',
                      borderRadius: '50%',
                      border: '1px solid var(--border-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.5,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4l3 3" />
                    </svg>
                  </div>
                  <p
                    className="font-display"
                    style={{
                      fontSize: '1rem',
                      fontStyle: 'italic',
                      color: 'var(--text-tertiary)',
                      marginBottom: 6,
                    }}
                  >
                    Name a detail, a texture, a tension
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
                    We compose the rest
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div key="history" style={{ animation: 'fadeIn 0.4s ease forwards' }}>
              <AuraHistory
                auras={savedAuras}
                isLoading={isLoadingHistory}
                onFavorite={handleFavorite}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid var(--border)',
          marginTop: 'auto',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            color: 'var(--text-tertiary)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            opacity: 0.5,
          }}
        >
          AUVORA — Aura OS © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
