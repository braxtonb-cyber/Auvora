'use client';

interface LoadingOrbProps {
  colors?: string[];
  compact?: boolean;
}

export default function LoadingOrb({ colors = [], compact = false }: LoadingOrbProps) {
  const c1 = colors[0] || '#c4a46b';
  const c2 = colors[1] || '#8b7355';
  const orbSize = compact ? 92 : 120;
  const ringInset1 = compact ? 3 : 4;
  const ringInset2 = compact ? 9 : 12;
  const ringInset3 = compact ? 18 : 24;
  const centerSize = compact ? 5 : 6;
  const glowSize = compact ? 126 : 160;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? '20px' : '32px',
        padding: compact ? '28px 16px' : '64px 24px',
        animation: 'fadeIn 0.4s ease forwards',
      }}
    >
      {/* Orb */}
      <div style={{ position: 'relative', width: orbSize, height: orbSize }}>
        {/* Outer ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `1px solid rgba(196, 164, 107, 0.15)`,
            animation: 'spin 8s linear infinite',
          }}
        />
        {/* Rotating arc */}
        <div
          style={{
            position: 'absolute',
            inset: ringInset1,
            borderRadius: '50%',
            border: '1.5px solid transparent',
            borderTopColor: c1,
            borderRightColor: `${c1}60`,
            animation: 'spin 2s linear infinite',
          }}
        />
        {/* Counter arc */}
        <div
          style={{
            position: 'absolute',
            inset: ringInset2,
            borderRadius: '50%',
            border: '1px solid transparent',
            borderBottomColor: c2,
            borderLeftColor: `${c2}40`,
            animation: 'spin 3s linear infinite reverse',
          }}
        />
        {/* Inner glow orb */}
        <div
          style={{
            position: 'absolute',
            inset: ringInset3,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c1}30 0%, ${c2}15 50%, transparent 100%)`,
            animation: 'pulseGlow 2.5s ease-in-out infinite',
          }}
        />
        {/* Center dot */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: centerSize,
            height: centerSize,
            borderRadius: '50%',
            background: c1,
            boxShadow: `0 0 12px ${c1}`,
          }}
        />
        {/* Ambient glow behind orb */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: glowSize,
            height: glowSize,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c1}12 0%, transparent 70%)`,
            animation: 'pulseGlow 2.5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Loading text */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p
          className="font-display shimmer-text"
          style={{
            fontSize: compact ? '1.02rem' : '1.25rem',
            fontStyle: 'italic',
            letterSpacing: '0.02em',
          }}
        >
          Composing your aura
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: compact ? '0.62rem' : '0.68rem',
            color: 'var(--text-tertiary)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Reading the room
        </p>
      </div>
    </div>
  );
}
