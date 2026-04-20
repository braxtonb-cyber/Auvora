'use client';

const CHIPS = [
  'rain on warm concrete',
  'cold marble at dawn',
  'bass through a thin wall',
  'cigarette smoke at 2am',
  'dried roses in a drawer',
  'heavy silk on bare skin',
  'the last song at a party',
  'fog lifting off still water',
] as const;

interface StillPointInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function StillPointInput({
  value,
  onChange,
  disabled = false,
}: StillPointInputProps) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="name a texture, a tension, a moment..."
        disabled={disabled}
        rows={3}
        aria-label="Describe your vibe"
        style={{
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          fontSize: '1.05rem',
          fontStyle: 'italic',
          fontWeight: 300,
          lineHeight: 1.65,
          resize: 'none',
          outline: 'none',
          transition: 'border-color 0.2s ease',
          caretColor: 'var(--gold)',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'default' : 'text',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-interactive)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      />

      {/* Suggestion chips */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 12,
          opacity: disabled ? 0.35 : 1,
          transition: 'opacity 0.2s ease',
        }}
      >
        {CHIPS.map((chip) => {
          const isActive = value === chip;
          return (
            <button
              key={chip}
              onClick={() => !disabled && onChange(chip)}
              disabled={disabled}
              style={{
                background: isActive ? 'rgba(202, 138, 4, 0.1)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(202, 138, 4, 0.35)' : 'var(--border-subtle)'}`,
                borderRadius: 100,
                padding: '7px 13px',
                color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                fontWeight: 300,
                cursor: disabled ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (disabled || isActive) return;
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  'var(--border-interactive)';
                (e.currentTarget as HTMLButtonElement).style.color =
                  'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (isActive) return;
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  'var(--border-subtle)';
                (e.currentTarget as HTMLButtonElement).style.color =
                  'var(--text-secondary)';
              }}
            >
              {chip}
            </button>
          );
        })}
      </div>
    </div>
  );
}
