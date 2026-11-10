import { useRef, useState, useEffect } from 'react'
import WeatherBackground from '../backgrounds/WeatherBackground'
import DesktopRail from '../desktop/DesktopRail'
import DesktopHero from '../desktop/DesktopHero'
import HourlyStrip from '../desktop/HourlyStrip'
import DesktopAside from '../desktop/DesktopAside'
import SkeletonLoader from '../states/SkeletonLoader'
import EmptyState from '../states/EmptyStates'
import Astronomy from '../mobile/Astronomy'
import DesktopHealthScore from '../desktop/DesktopHealthScore'
import { WARM_GLASS, WARM_STATES } from '../../utils/weatherUtils'

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
  searchStatus,
  onClearSearchStatus,
  onRetrySearch,
}) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [activeSection, setActiveSection] = useState('today')
  const mainRef = useRef(null)
  const forecastRef = useRef(null)
  const historyRef = useRef(null)

  // A new place starts on today's hourly strip
  useEffect(() => { setSelectedDayIdx(0) }, [data?.lat, data?.lon])

  const handleNavigate = (key) => {
    setActiveSection(key)
    if (key === 'today') mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    else (key === 'forecast' ? forecastRef : historyRef).current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  const selectedDay = data?.forecast?.[selectedDayIdx]

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      overflow: 'hidden', color: '#fff',
      fontFamily: '"Geist", system-ui, -apple-system, sans-serif',
      ...(WARM_STATES.includes(weatherState) ? WARM_GLASS : {}),
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <WeatherBackground state={weatherState} />
      </div>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: WARM_STATES.includes(weatherState)
          ? 'linear-gradient(180deg, rgba(8,12,30,0.56) 0%, rgba(8,12,30,0.5) 35%, rgba(8,12,30,0.56) 100%)'
          : 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, transparent 30%, rgba(0,0,0,0.18) 100%)',
      }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', height: '100%' }}>
        <DesktopRail
          data={data}
          unit={unit}
          language={language}
          tr={tr}
          onCity={onSearch}
          onSearch={onSearch}
          onToggleUnit={onToggleUnit}
          onLanguageChange={onLanguageChange}
          searchStatus={searchStatus}
          onClearSearchStatus={onClearSearchStatus}
          onRetrySearch={onRetrySearch}
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />

        <main
          ref={mainRef}
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
              ↻ {tr.refreshing}
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
                hourly={selectedDayIdx === 0 ? data.hourly : selectedDay?.hourly}
                dayLabel={selectedDayIdx === 0 ? null : selectedDay?.d}
                unit={unit}
                tr={tr}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                <Astronomy data={data} tr={tr} noPadding />
                <DesktopHealthScore data={data} tr={tr} />
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
            forecastRef={forecastRef}
            historyRef={historyRef}
          />
        )}
      </div>
    </div>
  )
}
