import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { API_BASE } from '../utils/api'
import { placeKey } from '../utils/place'

const TYPING_DEBOUNCE_MS = 500

// On This Day state shared by the mobile card and the desktop aside: the picked date,
// its events, a loading flag (also while a language switch is in flight), and the
// height to hold while loading so the page doesn't jump.
export function useOnThisDay(data, language, heightOffset = 0) {
  const today = data?.localDate || ''
  const [selectedDate, setSelectedDate] = useState(today)
  const [picked, setPicked] = useState(null) // { date, loading, history } for a non-today date
  const requestRef = useRef(0)
  const debounceRef = useRef(null)
  const lastRequestedRef = useRef('')
  const cardRef = useRef(null)
  const lastHeightRef = useRef(0)

  const load = async (value, force = false) => {
    const mmdd = value?.slice(5) || ''
    if (!force && mmdd === lastRequestedRef.current) return
    lastRequestedRef.current = mmdd
    const id = ++requestRef.current
    if (!value || mmdd === today.slice(5)) { setPicked(null); return }
    setPicked({ date: value, loading: true, history: [] })
    const params = new URLSearchParams({ date: mmdd, city: data.city, cc: data.countryCode || '', lang: language })
    let history = []
    try {
      const res = await fetch(`${API_BASE}/history?${params}`)
      history = (await res.json()).history || []
    } catch {}
    if (id === requestRef.current) setPicked({ date: value, loading: false, history })
  }

  // New place (compared by rounded coordinates, so "Tokyo"/"Tóquio" or 139.69171/139.6917
  // count as the same place): back to its today
  const place = data ? placeKey({ lat: data.lat, lon: data.lon }) : ''
  useEffect(() => {
    clearTimeout(debounceRef.current)
    setSelectedDate(today)
    setPicked(null)
    lastRequestedRef.current = today.slice(5)
    requestRef.current++
  }, [today, place])

  // Same place in another language: reload the picked date once the localized data is in
  const dataLang = data?.lang ?? language
  useEffect(() => {
    if (dataLang === language && selectedDate && selectedDate !== today) load(selectedDate, true)
  }, [dataLang, language])

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  // Typing a date fires change events for every digit; wait until it settles
  const onDateChange = (value) => {
    setSelectedDate(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(value), TYPING_DEBOUNCE_MS)
  }

  const awaitingLang = dataLang !== language
  const loading = !!picked?.loading || awaitingLang

  // Remember the height while events are shown, so the loader can hold it
  useLayoutEffect(() => {
    if (!loading && cardRef.current) lastHeightRef.current = Math.max(0, cardRef.current.offsetHeight - heightOffset)
  })

  return {
    selectedDate,
    onDateChange,
    loading,
    picked: !!picked,
    history: picked ? picked.history : data?.history || [],
    cardRef,
    holdHeight: loading ? lastHeightRef.current : undefined,
  }
}
