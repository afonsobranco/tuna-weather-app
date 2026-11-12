import { useState, useEffect, useRef } from 'react'
import { useAppStore } from './context/AppContext'
import { useWeather } from './hooks/useWeather'
import { useGeolocation } from './hooks/useGeolocation'
import SplashScreen from './components/states/SplashScreen'
import MobileLayout from './components/layout/MobileLayout'
import DesktopLayout from './components/layout/DesktopLayout'
import { DEFAULT_PLACE, hasCoords, localizePlace, placeFromData, placeKey, resolvePlaceName, samePlace } from './utils/place'
import SavedToast from './components/states/SavedToast'

const SPLASH_MIN_MS = 600
const SPLASH_MAX_MS = 2500

export default function App() {
  const { unit, toggleUnit, language, setLanguage, t,
          lastCity, setLastCity, setCityTemp, savedCities, upgradeSavedCity, localizeSavedCity } = useAppStore()
  const tr = t()

  const [requestedPlace, setRequestedPlace] = useState(() => lastCity || null)
  const [searchError, setSearchError] = useState(null) // { status: 'error' | 'failed', query, place }
  const userSearchRef = useRef(false)
  const lastGoodRef = useRef(null)

  const { place: geoPlace, status: geoStatus } = useGeolocation()
  // Never wait on a slow GPS lock: requested place, else GPS, else Lisbon
  const activePlace = requestedPlace || geoPlace || DEFAULT_PLACE
  const { data, isLoading, error, notFound, failed, failReason, isStale, isSwitching, refetch } = useWeather(activePlace, language)

  useEffect(() => { document.documentElement.lang = language }, [language])

  // Saved cities from before places had coordinates: resolve each once
  useEffect(() => {
    savedCities.filter((p) => !hasCoords(p)).forEach(async (p) => {
      const resolved = await resolvePlaceName(p.name)
      if (resolved) upgradeSavedCity(p, resolved)
    })
  }, [])

  // Saved cities show their name and region in the current language: look up the ones we
  // haven't seen in it yet (once per city and language; the result is persisted)
  useEffect(() => {
    savedCities
      .filter((p) => hasCoords(p) && (!p.names?.[language] || p.regions?.[language] === undefined))
      .forEach(async (p) => {
        const localized = await localizePlace(p, language)
        if (localized) localizeSavedCity(p, language, localized)
      })
  }, [language, savedCities.length])

  // Data on screen belongs to the active place
  useEffect(() => {
    if (!data || isLoading || error) return
    lastGoodRef.current = activePlace
    userSearchRef.current = false
    setSearchError((s) => (s?.status === 'retrying' ? null : s))
    const resolved = placeFromData(data)
    setCityTemp(resolved, data.tempC)
    // Remember this saved city's name and region in the current language
    const saved = savedCities.find((p) => samePlace(p, resolved))
    if (saved && data.lang && (saved.names?.[data.lang] !== data.city || saved.regions?.[data.lang] !== (data.region || ''))) {
      upgradeSavedCity(saved, {
        ...saved,
        names: { ...saved.names, [data.lang]: data.city },
        regions: { ...saved.regions, [data.lang]: data.region || '' },
        region: saved.region || data.region || '',
      })
    }
    if (requestedPlace) {
      setLastCity(resolved)
      const nameOnly = savedCities.find((p) => !hasCoords(p) && samePlace(p, requestedPlace))
      if (nameOnly) upgradeSavedCity(nameOnly, resolved)
      // From now on ask by coordinates (the response is already cached under them)
      if (!hasCoords(requestedPlace)) setRequestedPlace(resolved)
    }
  }, [data, isLoading, error])

  // Unknown city: keep showing the last good place and tell the user
  useEffect(() => {
    if (!notFound || isLoading) return
    if (userSearchRef.current) setSearchError({ status: 'error', query: activePlace.name })
    userSearchRef.current = false
    if (!lastGoodRef.current) setLastCity(null)
    setRequestedPlace(lastGoodRef.current)
  }, [notFound, isLoading])

  // Network or server failure: say so, offer a retry, and go back to the last good place
  useEffect(() => {
    if (!failed || isLoading) return
    userSearchRef.current = false
    if (!lastGoodRef.current) return // nothing to show yet: the layouts render the offline state
    setSearchError({ status: 'failed', reason: failReason, query: activePlace.name, place: activePlace })
    if (placeKey(lastGoodRef.current) !== placeKey(activePlace)) setRequestedPlace(lastGoodRef.current)
  }, [failed, isLoading])

  const handleSearch = (place, keepStatus = false) => {
    if (!place?.name?.trim()) return
    if (place.noMatch) {
      setSearchError({ status: 'error', query: place.name.trim() })
      return
    }
    userSearchRef.current = true
    if (!keepStatus) setSearchError(null)
    const next = { ...place, name: place.name.trim() }
    // Same place again (e.g. after a failure): force a real request instead of a no-op
    if (placeKey(next) === placeKey(activePlace)) refetch(true)
    else setRequestedPlace(next)
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

  // Same place, other language, still loading: the language buttons show they're busy
  const langBusy = isLoading && !!data?.lang && data.lang !== language

  const searchStatus = searchError
    || (isSwitching ? { status: 'loading', query: activePlace.name } : null)

  const commonProps = {
    data,
    isLoading,
    error,
    isStale,
    langBusy,
    unit,
    language,
    tr,
    activePlace,
    searchStatus,
    onClearSearchStatus: () => setSearchError(null),
    onRetrySearch: () => {
      if (!searchError?.place) return
      setSearchError({ ...searchError, status: 'retrying' })
      handleSearch(searchError.place, true)
    },
    onToggleUnit: toggleUnit,
    onSearch: handleSearch,
    onLanguageChange: setLanguage,
    onRefetch: () => { setSearchError(null); refetch(true) },
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

      <SavedToast tr={tr} language={language} />
    </>
  )
}
