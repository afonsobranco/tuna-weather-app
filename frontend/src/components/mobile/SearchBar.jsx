import { useState, useRef, useEffect } from 'react'
import Glass from '../primitives/Glass'
import { GSearch, GLocate } from '../icons/UIGlyphs'

const LANG_FLAGS = { en: '🇬🇧', pt: '🇵🇹' }
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export default function SearchBar({ data, unit, language, tr, onToggleUnit, onSearch, onLanguageChange }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  // Fetch suggestions with 300ms debounce
  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    if (val.trim().length < 2) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(val)}&count=5&language=${language}&format=json`)
        const json = await res.json()
        setSuggestions(json.results || [])
      } catch { setSuggestions([]) }
    }, 300)
  }

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setSuggestions([]) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
      setQuery('')
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (s) => {
    onSearch(s.name)
    setQuery('')
    setSuggestions([])
  }

  const dateStr = new Date().toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  const nextLang = language === 'en' ? 'pt' : 'en'

  return (
    <div ref={wrapperRef} style={{ padding: '12px 16px 8px' }}>
      {/* Search pill + controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Glass
          style={{
            flex: 1,
            height: 46,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 8,
          }}
        >
          <GSearch size={16} color="rgba(255,255,255,0.55)" />
          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex' }}>
            <input
              value={query}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={tr.searchPlaceholder}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontFamily: '"Geist", system-ui, sans-serif',
                fontSize: 14,
                fontWeight: 400,
              }}
            />
          </form>
        </Glass>

        {/* Unit toggle */}
        <button
          onClick={onToggleUnit}
          style={{
            width: 64,
            height: 32,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            cursor: 'pointer',
            position: 'relative',
            flexShrink: 0,
            padding: 0,
          }}
          aria-label={`Switch to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
        >
          {/* Track labels */}
          <span
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 11,
              fontWeight: 600,
              color: unit === 'C' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)',
              fontFamily: '"Geist", system-ui, sans-serif',
              pointerEvents: 'none',
            }}
          >
            °F
          </span>
          <span
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 11,
              fontWeight: 600,
              color: unit === 'C' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
              fontFamily: '"Geist", system-ui, sans-serif',
              pointerEvents: 'none',
            }}
          >
            °C
          </span>
          {/* Thumb */}
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: unit === 'C' ? 31 : 3,
              width: 26,
              height: 26,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.95)',
              transition: 'left 250ms cubic-bezier(.4,1.2,.5,1)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            }}
          />
        </button>

        {/* Language flag */}
        <button
          onClick={() => onLanguageChange(nextLang)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            cursor: 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-label={`Switch to ${nextLang}`}
        >
          {LANG_FLAGS[language]}
        </button>
      </div>

      {/* Autocomplete suggestions */}
      {suggestions.length > 0 && (
        <div style={{
          marginTop: 6,
          borderRadius: 16,
          overflow: 'hidden',
          background: 'rgba(10,25,50,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => handleSuggestionClick(s)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                borderTop: i ? '1px solid rgba(255,255,255,0.08)' : 'none',
                cursor: 'pointer',
                padding: '10px 14px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <GSearch size={13} color="rgba(255,255,255,0.35)" />
              <div>
                <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 14, color: '#fff', fontWeight: 500 }}>
                  {s.name}
                </span>
                <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginLeft: 6 }}>
                  {[s.admin1, s.country].filter(Boolean).join(', ')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* City name row */}
      {data && (
        <div
          style={{
            marginTop: 8,
            paddingLeft: 4,
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontWeight: 500,
              fontSize: 15,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            {data.city},
          </span>
          <span
            style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontWeight: 400,
              fontSize: 13,
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {data.flag} · {data.country} · {dateStr}
          </span>
        </div>
      )}
    </div>
  )
}
