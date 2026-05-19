import { useState } from 'react'
import WeatherBackground from '../backgrounds/WeatherBackground'
import DesktopRail from '../desktop/DesktopRail'
import DesktopHero from '../desktop/DesktopHero'
import HourlyStrip from '../desktop/HourlyStrip'
import DesktopAside from '../desktop/DesktopAside'
import SkeletonLoader from '../states/SkeletonLoader'
import EmptyState from '../states/EmptyStates'
import Astronomy from '../mobile/Astronomy'
import Glass from '../primitives/Glass'

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
  addSavedCity,
  cityTemps,
}) {
  const [activeCityName, setActiveCityName] = useState(null)
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)

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
          addSavedCity={addSavedCity}
          cityTemps={cityTemps}
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
              <HourlyStrip
                hourly={data.forecast?.[selectedDayIdx]?.hourly || data.hourly}
                data={data}
                unit={unit}
                tr={tr}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Astronomy data={data} tr={tr} noPadding />
                <Glass style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                    {tr?.dailyHealthScore || 'Daily Health Score'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {(() => {
                      const score = data.health?.score ?? 0
                      const color = score >= 75 ? '#3ed28b' : score >= 50 ? '#ffa850' : '#ff5a5a'
                      const r = 26, circ = 2 * Math.PI * r, dash = (score / 100) * circ
                      return (
                        <>
                          <svg width={64} height={64} viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
                            <circle cx={32} cy={32} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} />
                            <circle cx={32} cy={32} r={r} fill="none" stroke={color} strokeWidth={6}
                              strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.25}
                              strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
                            <text x={32} y={37} textAnchor="middle" fill={color} fontSize={16} fontWeight={600}
                              fontFamily="Geist, system-ui, sans-serif">{score}</text>
                          </svg>
                          <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                            {data.health?.tip || ''}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </Glass>
              </div>
            </>
          )}
        </main>

        {data && (
          <DesktopAside
            data={data}
            unit={unit}
            tr={tr}
            language={language}
            selectedDayIdx={selectedDayIdx}
            onDaySelect={setSelectedDayIdx}
          />
        )}
      </div>
    </div>
  )
}
