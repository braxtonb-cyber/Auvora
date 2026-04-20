'use client';

import AuraCard from './AuraCard';

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

interface AuraHistoryProps {
  auras: AuraData[];
  isLoading: boolean;
  onFavorite: (id: string, current: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function AuraHistory({
  auras,
  isLoading,
  onFavorite,
  onDelete,
}: AuraHistoryProps) {
  if (isLoading) {
    return (
      <div style={{ padding: '0 0 40px' }}>
        <SectionHeader />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: 72,
                borderRadius: 'var(--radius-lg)',
                opacity: 1 - i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!auras.length) {
    return (
      <div style={{ padding: '0 0 40px' }}>
        <SectionHeader />
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <p
            className="font-display"
            style={{
              fontSize: '1.1rem',
              fontStyle: 'italic',
              color: 'var(--text-tertiary)',
              marginBottom: 8,
            }}
          >
            No auras saved yet
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
            Generate and save your first aura above
          </p>
        </div>
      </div>
    );
  }

  // Sort: favorites first, then by date
  const sorted = [...auras].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div style={{ padding: '0 0 80px' }}>
      <SectionHeader count={auras.length} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((aura, i) => (
          <div
            key={aura.id}
            style={{
              animation: `staggerReveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms forwards`,
              opacity: 0,
            }}
          >
            <AuraCard
              aura={aura}
              onFavorite={onFavorite}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ count }: { count?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 14,
        borderBottom: '1px solid var(--border)',
      }}
    >
      <h2
        className="font-display"
        style={{
          fontSize: '1.4rem',
          fontStyle: 'italic',
          fontWeight: 300,
          color: 'var(--text-primary)',
        }}
      >
        Aura Archive
      </h2>
      {count !== undefined && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            color: 'var(--text-tertiary)',
          }}
        >
          {count} {count === 1 ? 'aura' : 'auras'}
        </span>
      )}
    </div>
  );
}
