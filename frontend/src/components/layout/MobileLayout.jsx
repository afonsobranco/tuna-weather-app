import WeatherBackground from '../backgrounds/WeatherBackground'
import SearchBar from '../mobile/SearchBar'
import Hero from '../mobile/Hero'
import TomorrowTile from '../mobile/TomorrowTile'
import HealthDashboard from '../mobile/HealthDashboard'
import Astronomy from '../mobile/Astronomy'
import OnThisDay from '../mobile/OnThisDay'
import Forecast from '../mobile/Forecast'
import SkeletonLoader from '../states/SkeletonLoader'
import EmptyState from '../states/EmptyStates'

export default function MobileLayout({
  data,
  isLoading,
  error,
  isStale,
  unit,
  language,
  tr,
  weatherState,
  geoStatus,
  onToggleUnit,
  onSearch,
  onLanguageChange,
  onRefetch,
  addSavedCity,
}) {
  // Determine which state to show
  const showSkeleton = isLoading && !data
  const showGeoDenied = geoStatus === 'denied' && !data && !isLoading
  const showOffline = error && !data && !isLoading
  const showSearchEmpty = error?.toLowerCase().includes('not found') && !data

  if (showSkeleton) {
    return <SkeletonLoader weatherState={weatherState} isMobile tr={tr} />
  }
  if (showGeoDenied) {
    return <EmptyState variant="geo-denied" tr={tr} onCta={() => {}} />
  }
  if (showSearchEmpty) {
    return <EmptyState variant="search-empty" tr={tr} />
  }
  if (showOffline) {
    return <EmptyState variant="offline" tr={tr} onCta={onRefetch} />
  }

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      overflow: 'hidden', color: '#fff',
      fontFamily: '"Geist", system-ui, -apple-system, sans-serif',
    }}>
      {/* Dynamic background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <WeatherBackground state={weatherState} />
      </div>

      {/* Readability scrim */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, transparent 25%, rgba(0,0,0,0.20) 100%)',
      }} />

      {/* Scrollable content */}
      <div
        className="hide-scroll"
        style={{
          position: 'relative', zIndex: 2,
          height: '100%', overflowY: 'auto',
          paddingTop: 56, paddingBottom: 46,
        }}
      >
        {/* Stale indicator */}
        {isStale && (
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            textAlign: 'center', padding: '4px 12px',
            background: 'rgba(255,170,80,0.18)',
            backdropFilter: 'blur(10px)',
            color: 'rgba(255,200,120,0.95)', fontSize: 11, fontWeight: 600,
            letterSpacing: 0.5,
          }}>
            ↻ Refreshing data…
          </div>
        )}

        {data ? (
          <>
            <SearchBar
              data={data}
              unit={unit}
              language={language}
              tr={tr}
              onToggleUnit={onToggleUnit}
              onSearch={onSearch}
              onLanguageChange={onLanguageChange}
              addSavedCity={addSavedCity}
            />
            <Hero data={data} unit={unit} tr={tr} weatherState={weatherState} />
            <TomorrowTile data={data} unit={unit} tr={tr} />
            <HealthDashboard data={data} tr={tr} />
            <Astronomy data={data} tr={tr} />
            <OnThisDay data={data} tr={tr} />
            <Forecast data={data} unit={unit} tr={tr} />
            <div style={{ height: 18 }} />
          </>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: 'rgba(255,255,255,0.5)', fontSize: 14,
          }}>
            {tr?.wakeUp || 'Waking up the weather station…'}
          </div>
        )}
      </div>
    </div>
  )
}
