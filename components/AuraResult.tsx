'use client';

import { useState } from 'react';
import { parseColors, createAmbientGradient, copyToClipboard } from '@/lib/utils';

interface Aura {
  vibe_name: string;
  outfit: string;
  fragrance: string;
  playlist: string;
  colors: string;
  caption: string;
  prompt?: string;
}

interface AuraResultProps {
  aura: Aura;
  onSave: () => Promise<void>;
  isSaving: boolean;
  isSaved: boolean;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.62rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--gold)',
        marginBottom: 10,
        opacity: 0.8,
      }}
    >
      {children}
    </p>
  );
}

function Section({
  label,
  children,
  delay = 0,
}: {
  label: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      style={{
        animation: `staggerReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms forwards`,
        opacity: 0,
      }}
    >
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

export default function AuraResult({
  aura,
  onSave,
  isSaving,
  isSaved,
}: AuraResultProps) {
  const [copied, setCopied] = useState(false);
  const colors = parseColors(aura.colors);
  const ambientGradient = createAmbientGradient(aura.colors);

  const playlistLines = aura.playlist
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  async function handleCopy() {
    try {
      await copyToClipboard(aura.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Ambient background glow */}
      {ambientGradient && (
        <div
          style={{
            position: 'absolute',
            inset: '-60px -40px',
            background: ambientGradient,
            pointerEvents: 'none',
            zIndex: 0,
            filter: 'blur(40px)',
            animation: 'fadeIn 1.2s ease forwards',
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Vibe name header */}
        <div
          style={{
            textAlign: 'center',
            padding: '36px 0 28px',
            animation: 'fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
              marginBottom: 12,
            }}
          >
            Your Aura
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(2.2rem, 7vw, 3.2rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
            }}
          >
            {aura.vibe_name}
          </h2>

          {/* Color palette */}
          {colors.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                marginTop: 20,
                animation: 'fadeIn 0.8s 0.3s ease forwards',
                opacity: 0,
              }}
            >
              {colors.map((color, i) => (
                <div
                  key={i}
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        <div className="gold-divider" />

        {/* Content sections */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          {/* Outfit */}
          <Section label="Outfit" delay={200}>
            <div
              className="glass"
              style={{
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                margin: '0 0 2px',
              }}
            >
              <p
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  color: 'var(--text-primary)',
                  fontWeight: 300,
                }}
              >
                {aura.outfit}
              </p>
            </div>
          </Section>

          <div className="gold-divider" style={{ margin: '16px 0' }} />

          {/* Fragrance */}
          <Section label="Fragrance" delay={320}>
            <div
              className="glass"
              style={{
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <p
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  color: 'var(--text-primary)',
                  fontWeight: 300,
                  fontStyle: 'italic',
                }}
              >
                {aura.fragrance}
              </p>
            </div>
          </Section>

          <div className="gold-divider" style={{ margin: '16px 0' }} />

          {/* Playlist */}
          <Section label="Playlist" delay={440}>
            <div
              className="glass"
              style={{
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {playlistLines.length > 0
                ? playlistLines.map((line, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6rem',
                          color: 'var(--gold)',
                          opacity: 0.7,
                          minWidth: 16,
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                          fontWeight: 300,
                        }}
                      >
                        {line}
                      </span>
                    </div>
                  ))
                : (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 300 }}>
                      {aura.playlist}
                    </p>
                  )}
            </div>
          </Section>

          <div className="gold-divider" style={{ margin: '16px 0' }} />

          {/* Caption */}
          <Section label="Caption" delay={560}>
            <div
              className="glass-gold"
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                position: 'relative',
              }}
            >
              <p
                className="font-display"
                style={{
                  fontSize: '1.15rem',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  lineHeight: 1.5,
                  color: 'var(--text-primary)',
                  paddingRight: 44,
                }}
              >
                &quot;{aura.caption}&quot;
              </p>
              <button
                onClick={handleCopy}
                aria-label="Copy caption"
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: copied
                    ? 'rgba(196, 164, 107, 0.15)'
                    : 'transparent',
                  border: `1px solid ${copied ? 'var(--border-gold)' : 'var(--border)'}`,
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
          </Section>
        </div>

        {/* Save button */}
        <div
          style={{
            marginTop: 28,
            animation: `staggerReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) 680ms forwards`,
            opacity: 0,
          }}
        >
          <button
            onClick={onSave}
            disabled={isSaved || isSaving}
            style={{
              width: '100%',
              padding: '15px 24px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-gold)',
              background: isSaved
                ? 'rgba(196, 164, 107, 0.12)'
                : 'transparent',
              color: isSaved ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: isSaved ? 'default' : 'pointer',
              transition: 'all 0.3s var(--transition)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              if (!isSaved && !isSaving) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'rgba(196, 164, 107, 0.08)';
                (e.currentTarget as HTMLButtonElement).style.color =
                  'var(--gold)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaved && !isSaving) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'transparent';
                (e.currentTarget as HTMLButtonElement).style.color =
                  'var(--text-secondary)';
              }
            }}
          >
            {isSaving ? (
              <>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    border: '1.5px solid var(--border-gold)',
                    borderTopColor: 'var(--gold)',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }}
                />
                Saving
              </>
            ) : isSaved ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved to collection
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Save this aura
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
