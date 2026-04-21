'use client';

interface AuraGenerateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function AuraGenerateButton({
  onClick,
  isLoading = false,
  disabled = false,
}: AuraGenerateButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      aria-label={isLoading ? 'Composing your aura...' : 'Compose aura'}
      style={{
        width: '100%',
        height: 52,
        borderRadius: 'var(--radius-md)',
        border: 'none',
        background: isDisabled ? 'var(--elevated)' : 'var(--gold)',
        color: isDisabled ? 'var(--text-disabled)' : '#0E0C0B',
        fontFamily: 'var(--font-body)',
        fontSize: '0.82rem',
        fontWeight: 500,
        letterSpacing: '0.13em',
        textTransform: 'uppercase',
        cursor: isDisabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        transition: 'background 0.2s ease, color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)';
        }
      }}
    >
      {isLoading ? (
        <>
          <span
            aria-hidden="true"
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              border: '1.5px solid rgba(14, 12, 11, 0.3)',
              borderTopColor: '#0E0C0B',
              animation: 'spin 0.7s linear infinite',
              display: 'block',
              flexShrink: 0,
            }}
          />
          Composing...
        </>
      ) : (
        'Compose aura'
      )}
    </button>
  );
}
