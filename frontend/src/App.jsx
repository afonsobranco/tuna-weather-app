import { useState, useEffect, useRef } from 'react'
import { useAppStore } from './context/AppContext'
import { useWeather } from './hooks/useWeather'
import { useGeolocation } from './hooks/useGeolocation'
import SplashScreen from './components/states/SplashScreen'
import MobileLayout from './components/layout/MobileLayout'
import DesktopLayout from './components/layout/DesktopLayout'
import { DEFAULT_PLACE, hasCoords, placeFromData, resolvePlaceName, samePlace } from './utils/place'

const SPLASH_MIN_MS = 600
const SPLASH_MAX_MS = 2500

export default function App() {
  const { unit, toggleUnit, language, setLanguage, t,
          lastCity, setLastCity, setCityTemp, savedCities, upgradeSavedCity } = useAppStore()
  const tr = t()

  const [requestedPlace, setRequestedPlace] = useState(() => lastCity || null)
  const [searchError, setSearchError] = useState(null) // query that matched no city
  const userSearchRef = useRef(false)
  const lastGoodRef = useRef(null)

  const { place: geoPlace, status: geoStatus } = useGeolocation()
  // Never wait on a slow GPS lock: requested place, else GPS, else Lisbon
  const activePlace = requestedPlace || geoPlace || DEFAULT_PLACE
  const { data, isLoading, error, notFound, isStale, isSwitching, refetch } = useWeather(activePlace, language)

  // Saved cities from before places had coordinates: resolve each once
  useEffect(() => {
    savedCities.filter((p) => !hasCoords(p)).forEach(async (p) => {
      const resolved = await resolvePlaceName(p.name)
      if (resolved) upgradeSavedCity(p, resolved)
    })
  }, [])

  // Data on screen belongs to the active place
  useEffect(() => {
    if (!data || isLoading || error) return
    lastGoodRef.current = activePlace
    userSearchRef.current = false
    const resolved = placeFromData(data)
    setCityTemp(resolved, data.tempC)
    if (requestedPlace) {
      setLastCity(resolved)
      const nameOnly = savedCities.find((p) => !hasCoords(p) && samePlace(p, requestedPlace))
      if (nameOnly) upgradeSavedCity(nameOnly, resolved)
    }
  }, [data, isLoading, error])

  // Unknown city: keep showing the last good place and tell the user
  useEffect(() => {
    if (!notFound || isLoading) return
    if (userSearchRef.current) setSearchError(activePlace.name)
    userSearchRef.current = false
    if (!lastGoodRef.current) setLastCity(null)
    setRequestedPlace(lastGoodRef.current)
  }, [notFound, isLoading])

  const handleSearch = (place) => {
    if (!place?.name?.trim()) return
    userSearchRef.current = true
    setSearchError(null)
    setRequestedPlace({ ...place, name: place.name.trim() })
  }

  // Splash: leave as soon as there is something to show (min 600ms, max 2.5s)
  const [splash, setSplash] = useState('show') // show | fading | gone
  const startRef = useRef(Date.now())
  useEffect(() => {
    if (splash !== 'show') return
    const elapsed = Date.now() - startRef.current
    const wait = data || error ? Math.max(0, SPLASH_MIN_MS - elapsed) : Math.max(0, SPLASH_MAX_MS - elapsed)
    const timer = setTimeout(() => setSplash('fading'), wait)
    return () => clearTimeout(timer)
  }, [data, error, splash])
  useEffect(() => {
    if (splash !== 'fading') return
    const timer = setTimeout(() => setSplash('gone'), 600)
    return () => clearTimeout(timer)
  }, [splash])

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1200)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const searchStatus = searchError
    ? { status: 'error', query: searchError }
    : isSwitching ? { status: 'loading', query: activePlace.name } : null

  const commonProps = {
    data,
    isLoading,
    error,
    isStale,
    unit,
    language,
    tr,
    activePlace,
    searchStatus,
    onClearSearchStatus: () => setSearchError(null),
    onToggleUnit: toggleUnit,
    onSearch: handleSearch,
    onLanguageChange: setLanguage,
    onRefetch: refetch,
    weatherState: data?.weatherState || 'clear-day',
    geoStatus,
  }

  return (
    <>
      {splash !== 'gone' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            opacity: splash === 'fading' ? 0 : 1,
            transition: 'opacity 0.6s ease',
            pointerEvents: splash === 'fading' ? 'none' : 'auto',
          }}
        >
          <SplashScreen isDetecting={geoStatus === 'detecting'} tr={tr} />
        </div>
      )}

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
