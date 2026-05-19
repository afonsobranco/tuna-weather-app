import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''
const STALE_MS = 15 * 60 * 1000 // 15 minutes

// Simple localStorage cache
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

export function useWeather(city) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isStale, setIsStale] = useState(false)
  const abortRef = useRef(null)

  const fetchWeather = useCallback(async (cityName, force = false) => {
    if (!cityName) return
    const key = cityName.toLowerCase().trim()

    // Serve from cache if fresh
    if (!force) {
      const cached = getCached(key)
      if (cached) {
        setData(cached)
        setIsStale(false)
        setError(null)
        return
      }
    }

    // Show stale data while loading (avoids blank flash)
    const stale = getStale(key)
    if (stale) {
      setData(stale)
      setIsStale(true)
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      const resp = await window.fetch(
        `${API_BASE}/weather?city=${encodeURIComponent(cityName)}`,
        { signal: controller.signal }
      )
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}))
        throw new Error(body.detail || `Error ${resp.status}`)
      }
      const json = await resp.json()
      setCached(key, json)
      setData(json)
      setIsStale(false)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Network error')
      // Keep stale data visible
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (city) fetchWeather(city)
    return () => { if (abortRef.current) abortRef.current.abort() }
  }, [city, fetchWeather])

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch: (force) => fetchWeather(city, force ?? true),
  }
}
