// S&D monogram logo from the design — dark rounded tile with red "S" + blue "D",
// and the wordmark "S&D Solution / ELECTRONICS · SINCE 2014".
export function Logo({ wordmark = true, tile = 42 }: { wordmark?: boolean; tile?: number }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <span style={{ position: 'relative', width: tile, height: tile, borderRadius: 13, background: '#0B1020', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px -6px rgba(11,16,32,0.5)', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', inset: 0, background: 'radial-gradient(80% 80% at 30% 20%,rgba(91,124,255,0.5),transparent 60%)' }} />
        <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: tile * 0.48, letterSpacing: '-0.03em', position: 'relative' }}>
          <span style={{ color: '#FF3B4E' }}>S</span><span style={{ color: '#5B8CFF' }}>D</span>
        </span>
      </span>
      {wordmark && (
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
          <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em', color: '#0B1020' }}>S&amp;D <span style={{ color: '#1A4DF0' }}>Solution</span></span>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', color: '#A8AEBD', marginTop: 3 }}>ELECTRONICS · SINCE 2014</span>
        </span>
      )}
    </span>
  );
}
