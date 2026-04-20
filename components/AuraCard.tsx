'use client';

import { useState } from 'react';
import { parseColors, formatDate, copyToClipboard } from '@/lib/utils';

interface AuraData {
  id: string;
  created_at: string;
  prompt?: string;
  vibe_name?: string;
  vibe?: string;
  outfit?: string;
  fragrance?: string;
  playlist?: string;
  colors?: string;
  caption?: string;
  favorite: boolean;
}

interface AuraCardProps {
  aura: AuraData;
  onFavorite: (id: string, current: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function AuraCard({ aura, onFavorite, onDelete }: AuraCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const colors = parseColors(aura.colors || '[]');
  const vibeName = aura.vibe_name || aura.vibe || 'Untitled Aura';
  const playlistLines = (aura.playlist || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  async function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    if (isToggling) return;
    setIsToggling(true);
    await onFavorite(aura.id, aura.favorite);
    setIsToggling(false);
  }

  async function handleDeleteConfirmed(e: React.MouseEvent) {
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    await onDelete(aura.id);
  }

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!aura.caption) return;
    await copyToClipboard(aura.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-gold)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
      }}
    >
      {/* Card header / collapsed view */}
      <div
        onClick={() => {
          setExpanded(!expanded);
          setConfirmDelete(false);
        }}
        style={{
          padding: '16px 18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          userSelect: 'none',
        }}
      >
        {/* Color strip */}
        {colors.length > 0 && (
          <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
            {colors.slice(0, 3).map((c, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 36,
                  borderRadius: 4,
                  background: c,
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
        )}

        {/* Name + date */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            className="font-display"
            style={{
              fontSize: '1.05rem',
              fontStyle: 'italic',
              fontWeight: 400,
              color: 'var(--text-primary)',
              marginBottom: 3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {vibeName}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: 'var(--text-tertiary)',
              letterSpacing: '0.1em',
            }}
          >
            {formatDate(aura.created_at)}
          </p>
        </div>

        {/* Actions */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Favorite */}
          <button
            onClick={handleFavorite}
            aria-label={aura.favorite ? 'Unfavorite' : 'Favorite'}
            disabled={isToggling}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              opacity: isToggling ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={aura.favorite ? 'var(--gold)' : 'none'}
              stroke={aura.favorite ? 'var(--gold)' : 'var(--text-tertiary)'}
              strokeWidth="1.5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>

          {/* Expand chevron */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-tertiary)"
            strokeWidth="1.5"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s var(--transition)',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            animation: 'fadeInUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div style={{ padding: '18px 18px 0' }}>
            {/* Outfit */}
            {aura.outfit && (
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: 6,
                    opacity: 0.8,
                  }}
                >
                  Outfit
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 300 }}>
                  {aura.outfit}
                </p>
              </div>
            )}

            {/* Fragrance */}
            {aura.fragrance && (
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: 6,
                    opacity: 0.8,
                  }}
                >
                  Fragrance
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic', fontWeight: 300 }}>
                  {aura.fragrance}
                </p>
              </div>
            )}

            {/* Playlist */}
            {aura.playlist && (
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: 8,
                    opacity: 0.8,
                  }}
                >
                  Playlist
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {playlistLines.length > 0 ? (
                    playlistLines.map((line, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--gold)', opacity: 0.6 }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 300 }}>{line}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 300 }}>{aura.playlist}</p>
                  )}
                </div>
              </div>
            )}

            {/* Caption */}
            {aura.caption && (
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: 6,
                    opacity: 0.8,
                  }}
                >
                  Caption
                </p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <p
                    className="font-display"
                    style={{
                      fontSize: '0.95rem',
                      fontStyle: 'italic',
                      color: 'var(--text-primary)',
                      lineHeight: 1.5,
                      flex: 1,
                      fontWeight: 300,
                    }}
                  >
                    &quot;{aura.caption}&quot;
                  </p>
                  <button
                    onClick={handleCopy}
                    aria-label="Copy caption"
                    style={{
                      background: 'transparent',
                      border: `1px solid ${copied ? 'var(--border-gold)' : 'var(--border)'}`,
                      borderRadius: 6,
                      padding: '5px 8px',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke={copied ? 'var(--gold)' : 'var(--text-tertiary)'} strokeWidth="2">
                      {copied
                        ? <polyline points="20 6 9 17 4 12" />
                        : <>
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </>
                      }
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Color palette */}
            {colors.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: 8,
                    opacity: 0.8,
                  }}
                >
                  Palette
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {colors.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: c,
                        border: '1.5px solid rgba(255,255,255,0.08)',
                      }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card footer actions */}
          <div
            style={{
              padding: '12px 18px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            {!confirmDelete ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                  padding: '4px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#c97070';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)';
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Delete
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
                  Remove this aura?
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                  style={{
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  Keep
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  disabled={isDeleting}
                  style={{
                    background: 'rgba(201, 112, 112, 0.1)',
                    border: '1px solid rgba(201, 112, 112, 0.25)',
                    borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: '#c97070', opacity: isDeleting ? 0.5 : 1,
                  }}
                >
                  {isDeleting ? '...' : 'Remove'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
