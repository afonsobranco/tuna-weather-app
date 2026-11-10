import { useState, useEffect, useRef, useCallback } from 'react'
import { placeKey, hasCoords } from '../utils/place'
import { API_BASE } from '../utils/api'

const STALE_MS = 15 * 60 * 1000 // 15 minutes

function getCached(key) {
  try {
    const raw = localStorage.getItem(`tuna:${key}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > STALE_MS) return null
    return data
  } catch { return null }
}

function setCached(key, data) {
  try {
    localStorage.setItem(`tuna:${key}`, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

function getStale(key) {
  try {
    const raw = localStorage.getItem(`tuna:${key}`)
    if (!raw) return null
    return JSON.parse(raw).data
  } catch { return null }
}

function weatherUrl(place, language, fresh) {
  const p = new URLSearchParams({ city: place.name, lang: language })
  if (fresh) p.set('fresh', Date.now())
  if (hasCoords(place)) {
    p.set('lat', place.lat.toFixed(4))
    p.set('lon', place.lon.toFixed(4))
    if (place.country) p.set('country', place.country)
    if (place.cc) p.set('cc', place.cc)
  }
  return `${API_BASE}/weather?${p}`
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

class WeatherError extends Error {
  constructor(message, status) { super(message); this.status = status }
}

// One automatic retry for network errors and server errors; a 404 is final.
async function requestWeather(url, signal) {
  for (let attempt = 0; ; attempt++) {
    try {
      const resp = await window.fetch(url, { signal })
      if (resp.ok) return await resp.json()
      const body = await resp.json().catch(() => ({}))
      throw new WeatherError(body.error || `Error ${resp.status}`, resp.status)
    } catch (err) {
      const retryable = err.name !== 'AbortError' && !(err.status && err.status < 500)
      if (attempt >= 1 || !retryable) throw err
      await sleep(700)
    }
  }
}

export function useWeather(place, language) {
  const [data, setData] = useState(null)
  const [dataKey, setDataKey] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [failed, setFailed] = useState(false)
  const [isStale, setIsStale] = useState(false)
  const abortRef = useRef(null)
  const placeRef = useRef(place)
  placeRef.current = place
  const key = place ? `${placeKey(place)}:${language}` : null

  const fetchWeather = useCallback(async (force = false) => {
    const target = placeRef.current
    if (!target || !key) return

    if (!force) {
      const cached = getCached(key)
      if (cached) {
        setData(cached)
        setDataKey(key)
        setIsStale(false)
        setError(null)
        setNotFound(false)
        setFailed(false)
        return
      }
    }

    // Show stale data for this place while loading (avoids blank flash)
    const stale = getStale(key)
    if (stale) {
      setData(stale)
      setDataKey(key)
      setIsStale(true)
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)
    setNotFound(false)
    setFailed(false)

    try {
      const json = await requestWeather(weatherUrl(target, language, force), controller.signal)
      setCached(key, json)
      // A name lookup also answers for its exact place, so switching to coordinates is free
      if (!hasCoords(target)) setCached(`${placeKey({ lat: json.lat, lon: json.lon })}:${language}`, json)
      setData(json)
      setDataKey(key)
      setIsStale(false)
    } catch (err) {
      if (err.name === 'AbortError') return
      setNotFound(err.status === 404)
      setFailed(err.status !== 404)
      setError(err.message || 'Network error')
    } finally {
      if (abortRef.current === controller) setIsLoading(false)
    }
  }, [key, language])

  useEffect(() => {
    fetchWeather()
    return () => { if (abortRef.current) abortRef.current.abort() }
  }, [fetchWeather])

  return {
    data,
    isLoading,
    error,
    notFound,
    failed,
    isStale,
    // Old place's data is still on screen while a different place loads
    isSwitching: isLoading && !!data && dataKey !== key,
    refetch: (force) => fetchWeather(force ?? true),
  }
}
