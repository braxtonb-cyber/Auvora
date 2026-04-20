interface Swatch {
  hex: string;
  name: string;
}

interface PaletteSwatchRowProps {
  palette: Swatch[];
}

export default function PaletteSwatchRow({ palette }: PaletteSwatchRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
        padding: '8px 0',
      }}
    >
      {palette.map((swatch, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            title={swatch.name}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: swatch.hex,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: `0 6px 20px ${swatch.hex}44`,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.58rem',
              color: 'var(--text-disabled)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {swatch.hex.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}
