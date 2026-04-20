interface AuraOrbProps {
  colors?: string[];
  isActive?: boolean;
  size?: 'lg' | 'sm';
}

export default function AuraOrb({
  colors = [],
  isActive = false,
  size = 'lg',
}: AuraOrbProps) {
  const c1 = (isActive && colors[0]) ? colors[0] : '#CA8A04';
  const c2 = (isActive && colors[1]) ? colors[1] : '#7A5002';

  const isCompact = size === 'sm';
  const dim       = isCompact ? 52 : 120;
  const i1        = isCompact ? 2  : 4;
  const i2        = isCompact ? 6  : 14;
  const i3        = isCompact ? 12 : 26;
  const dot       = isCompact ? 3  : 5;
  const halo      = isCompact ? 72 : 170;

  const orb = (
    <div style={{ position: 'relative', width: dim, height: dim, flexShrink: 0 }}>
      {/* Outer ring */}
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `1px solid ${c1}22`,
          animation: 'spin 14s linear infinite',
          transition: 'border-color 1.2s ease',
        }}
      />
      {/* Spinning arc */}
      <div
        style={{
          position: 'absolute', inset: i1, borderRadius: '50%',
          border: `${isCompact ? '1px' : '1.5px'} solid transparent`,
          borderTopColor: c1,
          borderRightColor: `${c1}55`,
          animation: 'spin 2.6s linear infinite',
          transition: 'border-top-color 1.2s ease, border-right-color 1.2s ease',
        }}
      />
      {/* Counter arc */}
      <div
        style={{
          position: 'absolute', inset: i2, borderRadius: '50%',
          border: '1px solid transparent',
          borderBottomColor: c2,
          borderLeftColor: `${c2}44`,
          animation: 'spin 3.8s linear infinite reverse',
          transition: 'border-bottom-color 1.2s ease, border-left-color 1.2s ease',
        }}
      />
      {/* Inner glow */}
      <div
        style={{
          position: 'absolute', inset: i3, borderRadius: '50%',
          background: `radial-gradient(circle, ${c1}55 0%, ${c2}22 55%, transparent 100%)`,
          animation: 'orbPulse 2.8s ease-in-out infinite',
        }}
      />
      {/* Center dot */}
      <div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: dot, height: dot, borderRadius: '50%',
          backgroundColor: c1,
          boxShadow: `0 0 ${isCompact ? '6px' : '10px'} ${c1}cc`,
          transition: 'background-color 1.2s ease, box-shadow 1.2s ease',
        }}
      />
      {/* Ambient halo */}
      <div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: halo, height: halo, borderRadius: '50%',
          background: `radial-gradient(circle, ${c1}0d 0%, transparent 68%)`,
          pointerEvents: 'none',
          animation: 'orbPulse 2.8s ease-in-out infinite',
        }}
      />
    </div>
  );

  if (isCompact) return orb;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '32px 0' }}>
      {orb}
    </div>
  );
}
