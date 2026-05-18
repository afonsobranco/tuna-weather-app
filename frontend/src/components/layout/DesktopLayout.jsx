import { useState } from 'react'
import WeatherBackground from '../backgrounds/WeatherBackground'
import DesktopRail from '../desktop/DesktopRail'
import DesktopHero from '../desktop/DesktopHero'
import HourlyStrip from '../desktop/HourlyStrip'
import DesktopAside from '../desktop/DesktopAside'
import SkeletonLoader from '../states/SkeletonLoader'
import EmptyState from '../states/EmptyStates'

export default function DesktopLayout({
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
}) {
  const [activeCityName, setActiveCityName] = useState(null)

  const handleCityClick = (city) => {
    setActiveCityName(city)
    onSearch(city)
  }

  const showSkeleton  = isLoading && !data
  const showGeoDenied = geoStatus === 'denied' && !data && !isLoading
  const showOffline   = error && !data && !isLoading
  const showSearchEmpty = error?.toLowerCase().includes('not found') && !data

  if (showSkeleton) {
    return <SkeletonLoader weatherState={weatherState} isMobile={false} tr={tr} />
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
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <WeatherBackground state={weatherState} />
      </div>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, transparent 30%, rgba(0,0,0,0.18) 100%)',
      }} />

      {/* 3-column layout */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', height: '100%' }}>
        <DesktopRail
          data={data}
          unit={unit}
          language={language}
          tr={tr}
          onCity={handleCityClick}
          onSearch={onSearch}
          onToggleUnit={onToggleUnit}
          onLanguageChange={onLanguageChange}
          activeCityName={activeCityName || data?.city}
        />

        {/* Center: hero + hourly */}
        <main
          className="hide-scroll"
          style={{
            flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
            gap: 20, padding: '26px 28px', overflowY: 'auto',
          }}
        >
          {isStale && (
            <div style={{
              padding: '6px 14px', borderRadius: 12,
              background: 'rgba(255,170,80,0.18)',
              color: 'rgba(255,200,120,0.95)', fontSize: 11, fontWeight: 600,
              alignSelf: 'flex-start',
            }}>
              ↻ Refreshing data…
            </div>
          )}

          {data && (
            <>
              <DesktopHero
                data={data}
                unit={unit}
                tr={tr}
                weatherState={weatherState}
                onToggleUnit={onToggleUnit}
                onRefetch={onRefetch}
                isStale={isStale}
              />
              <HourlyStrip data={data} unit={unit} tr={tr} />
            </>
          )}
        </main>

        {data && (
          <DesktopAside data={data} unit={unit} tr={tr} language={language} />
        )}
      </div>
    </div>
  )
}
