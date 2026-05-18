import WeatherBackground from '../backgrounds/WeatherBackground'

function SkeletonCard({ height = 80, style = {} }) {
  return (
    <div style={{
      borderRadius: 24, overflow: 'hidden', height,
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      backdropFilter: 'blur(22px)',
      WebkitBackdropFilter: 'blur(22px)',
      position: 'relative',
      ...style,
    }}>
      <div className="skeleton-shimmer" style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s ease-in-out infinite',
      }} />
    </div>
  )
}

function SkeletonLine({ width = '60%', height = 12, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: 6,
      background: 'rgba(255,255,255,0.12)',
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s ease-in-out infinite',
      }} />
    </div>
  )
}

export default function SkeletonLoader({ weatherState = 'clear-day', isMobile = true, tr }) {
  const scrimStyle = {
    position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, transparent 25%, rgba(0,0,0,0.20) 100%)',
  }

  const content = (
    <div style={{
      position: 'relative', zIndex: 2,
      height: '100%', overflowY: 'auto', paddingBottom: 32,
      scrollbarWidth: 'none',
    }} className="hide-scroll">
      {/* "Waking up" message */}
      <div style={{
        padding: '80px 18px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500, letterSpacing: 0.2 }}>
          {tr?.wakeUp || 'Waking up the weather station…'}
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              width: 5, height: 5, borderRadius: '50%',
              background: 'rgba(255,255,255,0.6)',
              animation: `splashPulse 1.2s ${i * 0.15}s ease-in-out infinite`,
            }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Search bar skeleton */}
        <SkeletonCard height={46} style={{ borderRadius: 23 }} />

        {/* Hero skeleton */}
        <div style={{ padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SkeletonLine width={120} height={80} style={{ borderRadius: 8 }} />
            <SkeletonLine width={160} height={16} />
            <SkeletonLine width={100} height={12} />
          </div>
          <SkeletonCard height={104} style={{ width: 104, borderRadius: '50%' }} />
        </div>

        {/* Tomorrow tile */}
        <SkeletonCard height={72} />

        {/* Health card */}
        <SkeletonCard height={160} />

        {/* Astronomy */}
        <SkeletonCard height={100} />

        {/* History */}
        <SkeletonCard height={140} />

        {/* Forecast */}
        <div style={{ display: 'flex', gap: 10, overflowX: 'hidden' }}>
          {[1,2,3,4,5].map(i => (
            <SkeletonCard key={i} height={110} style={{ minWidth: 84, flexShrink: 0 }} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <WeatherBackground state={weatherState} />
      </div>
      <div style={scrimStyle} />
      {content}
    </div>
  )
}
