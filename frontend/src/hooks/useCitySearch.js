import { useState, useRef, useEffect } from 'react'

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'

function dedupe(results) {
  const seen = new Set()
  return results.filter((r) => {
    const key = `${r.name}|${r.admin1 || ''}|${r.country_code || ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function useCitySearch(language) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)
  const requestRef = useRef(0)

  // Any later lookup result for an older request is ignored
  const cancel = () => {
    clearTimeout(debounceRef.current)
    abortRef.current?.abort()
    requestRef.current++
  }

  useEffect(() => cancel, [])

  const close = () => {
    setOpen(false)
    setActiveIndex(-1)
  }

  const change = (value) => {
    setQuery(value)
    cancel()
    setActiveIndex(-1)
    if (value.trim().length < 2) {
      setSuggestions([])
      close()
      return
    }
    const id = requestRef.current
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const res = await fetch(
          `${GEO_URL}?name=${encodeURIComponent(value.trim())}&count=8&language=${language}&format=json`,
          { signal: controller.signal })
        const json = await res.json()
        if (id !== requestRef.current) return
        setSuggestions(dedupe(json.results || []).slice(0, 5))
        setOpen(true)
      } catch {
        if (id === requestRef.current) setSuggestions([])
      }
    }, 300)
  }

  const move = (delta) => {
    if (!open || !suggestions.length) return
    setActiveIndex((i) => (i + delta + suggestions.length) % suggestions.length)
  }

  const reset = () => {
    cancel()
    setQuery('')
    setSuggestions([])
    close()
  }

  return { query, setQuery, suggestions, open, activeIndex, setActiveIndex, change, move, close, cancel, reset }
}
