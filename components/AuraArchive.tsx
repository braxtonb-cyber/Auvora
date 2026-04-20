'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import AuraOrb from '@/components/AuraOrb';
import AuraCard from '@/components/AuraCard';
import PaletteSwatchRow from '@/components/PaletteSwatchRow';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuraResult {
  vibeName: string;
  outfit:    { title: string; description: string };
  fragrance: { title: string; notes: string };
  playlist:  { title: string; tracks: string[] };
  palette:   { hex: string; name: string }[];
  caption:   string;
}

interface AuraEntry {
  id:          string;
  created_at:  string;
  vibe_input:  string;
  output_json: AuraResult;
  is_saved:    boolean;
}

interface AuraArchiveProps {
  refreshKey?:      number;
  generationCount?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

// ── Entry card ────────────────────────────────────────────────────────────────

interface EntryCardProps {
  entry:     AuraEntry;
  onDelete:  (id: string) => Promise<void>;
}

function EntryCard({ entry, onDelete }: EntryCardProps) {
  const [expanded,       setExpanded]       = useState(false);
  const [confirmDelete,  setConfirmDelete]  = useState(false);
  const [isDeleting,     setIsDeleting]     = useState(false);

  const aura    = entry.output_json;
  const palette = aura.palette ?? [];

  async function handleDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3500);
      return;
    }
    setIsDeleting(true);
    await onDelete(entry.id);
  }

  return (
    <div
      style={{
        background:   'var(--surface)',
        border:       '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow:     'hidden',
        transition:   'border-color 0.2s ease',
      }}
    >
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width:          '100%',
          background:     'transparent',
          border:         'none',
          padding:        '14px 16px',
          cursor:         'pointer',
          display:        'flex',
          alignItems:     'center',
          gap:            14,
          textAlign:      'left',
        }}
      >
        {/* Mini orb */}
        <AuraOrb
          size="sm"
          colors={palette.map((p) => p.hex)}
          isActive
        />

        {/* Meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <p
              className="font-display"
              style={{
                fontSize:    '1rem',
                fontStyle:   'italic',
                fontWeight:  400,
                color:       'var(--text-primary)',
                whiteSpace:  'nowrap',
                overflow:    'hidden',
                textOverflow:'ellipsis',
              }}
            >
              {aura.vibeName}
            </p>
            <span
              style={{
                fontFamily:  'var(--font-body)',
                fontSize:    '0.6rem',
                color:       'var(--text-disabled)',
                letterSpacing: '0.06em',
                flexShrink:  0,
              }}
            >
              {formatDate(entry.created_at)}
            </span>
          </div>

          {/* Vibe input */}
          <p
            style={{
              fontFamily:   'var(--font-body)',
              fontSize:     '0.76rem',
              color:        'var(--text-secondary)',
              fontWeight:   300,
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              marginBottom: 8,
            }}
          >
            {entry.vibe_input}
          </p>

          {/* Palette strip */}
          <div style={{ display: 'flex', gap: 5 }}>
            {palette.slice(0, 4).map((swatch, i) => (
              <div
                key={i}
                title={swatch.name}
                style={{
                  width:        16,
                  height:       16,
                  borderRadius: '50%',
                  backgroundColor: swatch.hex,
                  border:       '1px solid rgba(255,255,255,0.08)',
                  flexShrink:   0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Expand chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="var(--text-disabled)" strokeWidth="1.5"
          style={{
            flexShrink:  0,
            transform:   expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition:  'transform 0.25s ease',
          }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            padding:   '16px',
            animation: 'driftUp 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AuraCard type="outfit"    data={aura.outfit}    delay={0}   />
            <AuraCard type="fragrance" data={aura.fragrance} delay={60}  />
            <AuraCard type="playlist"  data={aura.playlist}  delay={120} />
            <AuraCard type="caption"   data={aura.caption}   delay={180} />
          </div>

          <div style={{ marginTop: 16 }}>
            <PaletteSwatchRow palette={palette} />
          </div>

          {/* Delete */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              style={{
                background:     confirmDelete ? 'rgba(180,60,60,0.1)' : 'transparent',
                border:         `1px solid ${confirmDelete ? 'rgba(180,60,60,0.3)' : 'var(--border-subtle)'}`,
                borderRadius:   'var(--radius-md)',
                padding:        '8px 16px',
                color:          confirmDelete ? '#c97070' : 'var(--text-disabled)',
                fontFamily:     'var(--font-body)',
                fontSize:       '0.72rem',
                letterSpacing:  '0.06em',
                cursor:         isDeleting ? 'default' : 'pointer',
                transition:     'all 0.2s ease',
                opacity:        isDeleting ? 0.5 : 1,
              }}
            >
              {isDeleting ? 'Removing...' : confirmDelete ? 'Tap again to confirm' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Archive ───────────────────────────────────────────────────────────────────

export default function AuraArchive({ refreshKey = 0, generationCount = 0 }: AuraArchiveProps) {
  const supabase   = createClient();
  const [isOpen,   setIsOpen]   = useState(false);
  const [entries,  setEntries]  = useState<AuraEntry[]>([]);
  const [loading,  setLoading]  = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('aura_entries')
        .select('id, created_at, vibe_input, output_json, is_saved')
        .order('created_at', { ascending: false });
      if (error) console.error('[AUVORA] archive fetch failed:', error);
      setEntries((data ?? []) as AuraEntry[]);
    } catch (err) {
      console.error('[AUVORA] archive fetch threw:', err);
    } finally {
      setLoading(false);
    }
  }, []);                           // eslint-disable-line react-hooks/exhaustive-deps

  // Preload entry count on mount (populates badge even while collapsed)
  useEffect(() => {
    fetchEntries();
  }, []);                           // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-open and re-fetch when a new generation completes
  useEffect(() => {
    if (generationCount > 0) {
      setIsOpen(true);
      fetchEntries();
    }
  }, [generationCount]);            // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when a save confirms (refreshKey increments)
  useEffect(() => {
    if (isOpen) fetchEntries();
  }, [refreshKey]);                 // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(id: string) {
    try {
      await supabase.from('aura_entries').delete().eq('id', id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      // silent
    }
  }

  return (
    <div style={{ marginTop: 48 }}>
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          width:          '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          background:     'transparent',
          border:         '1px solid var(--border-subtle)',
          borderRadius:   isOpen ? '20px 20px 0 0' : 'var(--radius-lg)',
          padding:        '16px 20px',
          cursor:         'pointer',
          transition:     'border-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-interactive)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p
            className="font-display"
            style={{
              fontSize:  '1.1rem',
              fontStyle: 'italic',
              fontWeight: 400,
              color:     'var(--text-primary)',
            }}
          >
            Aura Archive
          </p>
          {entries.length > 0 && (
            <span
              style={{
                fontFamily:    'var(--font-body)',
                fontSize:      '0.6rem',
                color:         'var(--text-disabled)',
                letterSpacing: '0.1em',
              }}
            >
              {entries.length}
            </span>
          )}
        </div>

        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"
          style={{
            transform:  isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded body */}
      {isOpen && (
        <div
          style={{
            border:       '1px solid var(--border-subtle)',
            borderTop:    'none',
            borderRadius: '0 0 20px 20px',
            padding:      '16px',
            background:   'var(--elevated)',
            animation:    'fadeIn 0.25s ease forwards',
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: 88, opacity: 1 - (i - 1) * 0.25 }}
                />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px 0' }}>
              <p
                className="font-display"
                style={{
                  fontStyle: 'italic',
                  color:     'var(--text-disabled)',
                  fontSize:  '1rem',
                  lineHeight: 1.5,
                }}
              >
                Your aura archive will appear here
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
