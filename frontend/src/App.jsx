import { useState, useEffect, useRef } from 'react'
import { useAppStore } from './context/AppContext'
import { useWeather } from './hooks/useWeather'
import { useGeolocation } from './hooks/useGeolocation'
import SplashScreen from './components/states/SplashScreen'
import SkeletonLoader from './components/states/SkeletonLoader'
import EmptyState from './components/states/EmptyStates'
import MobileLayout from './components/layout/MobileLayout'
import DesktopLayout from './components/layout/DesktopLayout'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [splashFading, setSplashFading] = useState(false)
  const { unit, toggleUnit, language, setLanguage, t,
          lastCity, setLastCity, setCityTemp, cityTemps, addSavedCity } = useAppStore()
  // Restore last viewed city on mount
  const [searchCity, setSearchCity] = useState(() => lastCity || null)
  const tr = t()

  // Geolocation
  const { city: geoCity, status: geoStatus } = useGeolocation()

  // Active city: search > geo > default to Lisbon immediately so we never
  // block the weather fetch waiting for a slow mobile GPS lock
  const activeCity =
    searchCity ||
    geoCity ||
    'Lisbon'

  const { data, isLoading, error, isStale, refetch } = useWeather(activeCity)

  // Splash: hide after 2s minimum
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFading(true)
      setTimeout(() => setShowSplash(false), 600)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1200)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Persist temperature whenever fresh data arrives
  const prevCityRef = useRef(null)
  useEffect(() => {
    if (data?.city && data?.tempC != null && data.city !== prevCityRef.current) {
      prevCityRef.current = data.city
      setCityTemp(activeCity || data.city, data.tempC)
    }
  }, [data])

  const handleSearch = (city) => {
    if (city && city.trim()) {
      setSearchCity(city.trim())
      setLastCity(city.trim())
    }
  }

  const commonProps = {
    data,
    isLoading,
    error,
    isStale,
    unit,
    language,
    tr,
    onToggleUnit: toggleUnit,
    onSearch: handleSearch,
    onLanguageChange: setLanguage,
    onRefetch: refetch,
    weatherState: data?.weatherState || 'clear-day',
    geoStatus,
    addSavedCity,
    cityTemps,
  }

  return (
    <>
      {/* Splash */}
      {showSplash && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            opacity: splashFading ? 0 : 1,
            transition: 'opacity 0.6s ease',
          }}
        >
          <SplashScreen isDetecting={geoStatus === 'detecting'} tr={tr} />
        </div>
      )}

      {/* Main App */}
      <div style={{ position: 'fixed', inset: 0 }}>
        {isMobile ? (
          <MobileLayout {...commonProps} />
        ) : (
          <DesktopLayout {...commonProps} />
        )}
      </div>
    </>
  )
}
