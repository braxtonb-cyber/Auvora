interface OutfitData   { title: string; description: string; }
interface FragranceData { title: string; notes: string; }
interface PlaylistData  { title: string; tracks: string[]; }

type AuraCardProps =
  | { type: 'outfit';    data: OutfitData;    delay?: number }
  | { type: 'fragrance'; data: FragranceData; delay?: number }
  | { type: 'playlist';  data: PlaylistData;  delay?: number }
  | { type: 'caption';   data: string;        delay?: number };

const LABELS: Record<AuraCardProps['type'], string> = {
  outfit:    'Outfit',
  fragrance: 'Fragrance',
  playlist:  'Playlist',
  caption:   'Caption',
};

function CardLabel({ children }: { children: string }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.6rem',
        fontWeight: 500,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--gold)',
        marginBottom: 14,
        opacity: 0.85,
      }}
    >
      {children}
    </p>
  );
}

function CardTitle({ children }: { children: string }) {
  return (
    <p
      className="font-display"
      style={{
        fontSize: '1.1rem',
        fontStyle: 'italic',
        fontWeight: 400,
        color: 'var(--text-primary)',
        marginBottom: 10,
        lineHeight: 1.3,
      }}
    >
      {children}
    </p>
  );
}

function renderContent(props: AuraCardProps) {
  if (props.type === 'outfit') {
    return (
      <>
        <CardTitle>{props.data.title}</CardTitle>
        <p
          style={{
            fontSize: '0.88rem',
            lineHeight: 1.75,
            color: 'var(--text-secondary)',
            fontWeight: 300,
          }}
        >
          {props.data.description}
        </p>
      </>
    );
  }

  if (props.type === 'fragrance') {
    return (
      <>
        <CardTitle>{props.data.title}</CardTitle>
        <p
          style={{
            fontSize: '0.88rem',
            lineHeight: 1.75,
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            fontWeight: 300,
          }}
        >
          {props.data.notes}
        </p>
      </>
    );
  }

  if (props.type === 'playlist') {
    return (
      <>
        <CardTitle>{props.data.title}</CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {props.data.tracks.map((track, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.58rem',
                  color: 'var(--gold)',
                  opacity: 0.6,
                  minWidth: 18,
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontSize: '0.86rem',
                  color: 'var(--text-primary)',
                  fontWeight: 300,
                  lineHeight: 1.5,
                }}
              >
                {track}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // caption
  return (
    <p
      className="font-display"
      style={{
        fontSize: '1.2rem',
        fontStyle: 'italic',
        fontWeight: 300,
        lineHeight: 1.5,
        color: 'var(--text-primary)',
        letterSpacing: '0.01em',
      }}
    >
      &ldquo;{props.data}&rdquo;
    </p>
  );
}

export default function AuraCard(props: AuraCardProps) {
  const delay = props.delay ?? 0;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 22px',
        animation: `driftUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both`,
      }}
    >
      <CardLabel>{LABELS[props.type]}</CardLabel>
      {renderContent(props)}
    </div>
  );
}
