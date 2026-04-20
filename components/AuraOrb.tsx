interface AuraOrbProps {
  colors?: string[];
  isActive?: boolean;
}

export default function AuraOrb({ colors = [], isActive = false }: AuraOrbProps) {
  const c1 = (isActive && colors[0]) ? colors[0] : '#CA8A04';
  const c2 = (isActive && colors[1]) ? colors[1] : '#7A5002';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '32px 0',
      }}
    >
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        {/* Outer ring — slow spin */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `1px solid ${c1}22`,
            animation: 'spin 14s linear infinite',
            transition: 'border-color 1.2s ease',
          }}
        />

        {/* Spinning arc */}
        <div
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: '50%',
            border: '1.5px solid transparent',
            borderTopColor: c1,
            borderRightColor: `${c1}55`,
            animation: 'spin 2.6s linear infinite',
            transition: 'border-top-color 1.2s ease, border-right-color 1.2s ease',
          }}
        />

        {/* Counter arc */}
        <div
          style={{
            position: 'absolute',
            inset: 14,
            borderRadius: '50%',
            border: '1px solid transparent',
            borderBottomColor: c2,
            borderLeftColor: `${c2}44`,
            animation: 'spin 3.8s linear infinite reverse',
            transition: 'border-bottom-color 1.2s ease, border-left-color 1.2s ease',
          }}
        />

        {/* Inner glow — opacity-only pulse */}
        <div
          style={{
            position: 'absolute',
            inset: 26,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c1}55 0%, ${c2}22 55%, transparent 100%)`,
            animation: 'orbPulse 2.8s ease-in-out infinite',
          }}
        />

        {/* Center dot */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 5,
            height: 5,
            borderRadius: '50%',
            backgroundColor: c1,
            boxShadow: `0 0 10px ${c1}cc`,
            transition: 'background-color 1.2s ease, box-shadow 1.2s ease',
          }}
        />

        {/* Ambient halo behind orb */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 170,
            height: 170,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${c1}0d 0%, transparent 68%)`,
            pointerEvents: 'none',
            animation: 'orbPulse 2.8s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
