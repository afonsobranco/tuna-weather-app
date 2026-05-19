import { useState, useRef, useEffect } from 'react'
import Glass from '../primitives/Glass'
import AppMark from '../primitives/AppMark'
import { GSearch, GLocate } from '../icons/UIGlyphs'
import { useAppStore } from '../../context/AppContext'

const LANG_FLAGS = { en: '🇬🇧', pt: '🇵🇹' }
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export default function DesktopRail({
  cityKey,
  data,
  unit,
  language,
  tr,
  onCity,
  onToggleUnit,
  onSearch,
  onLanguageChange,
  activeCityName,
  addSavedCity,
  cityTemps,
}) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)
  const { savedCities, removeSavedCity } = useAppStore()
  const isCitySaved = data?.city ? savedCities.includes(data.city) : false

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

  const nextLang = language === 'en' ? 'pt' : 'en'

  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        gap: 16,
        background: 'rgba(0,0,0,0.18)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Brand lockup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 4 }}>
        <AppMark size={44} />
        <div>
          <div
            style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontStyle: 'italic',
              fontSize: 22,
              color: '#fff',
              lineHeight: 1,
              letterSpacing: '-0.5px',
            }}
          >
            Tuna
          </div>
          <div
            style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontSize: 9,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginTop: 1,
            }}
          >
            WEATHER APP
          </div>
        </div>
      </div>

      {/* Search + autocomplete */}
      <div ref={wrapperRef} style={{ position: 'relative' }}>
        <Glass style={{ borderRadius: 999, height: 44, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
          <GSearch size={15} color="rgba(255,255,255,0.45)" />
          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex' }}>
            <input
              value={query}
              onChange={handleChange}
              placeholder={tr.searchPlaceholder}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontFamily: '"Geist", system-ui, sans-serif',
                fontSize: 13,
              }}
            />
          </form>
        </Glass>
        {suggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
            marginTop: 6, borderRadius: 14, overflow: 'hidden',
            background: 'rgba(10,25,50,0.96)', backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {suggestions.map((s, i) => (
              <button key={i} onMouseDown={() => handleSuggestionClick(s)} style={{
                width: '100%', background: 'none', cursor: 'pointer', padding: '9px 12px',
                border: 'none', borderTop: i ? '1px solid rgba(255,255,255,0.08)' : 'none',
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <GSearch size={12} color="rgba(255,255,255,0.3)" />
                <div>
                  <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 13, color: '#fff', fontWeight: 500 }}>
                    {s.name}
                  </span>
                  <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 5 }}>
                    {[s.admin1, s.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[
          { key: 'today', label: tr?.today || 'Today', active: true },
          { key: '5day', label: tr?.forecast7day || '5-Day', active: false },
          { key: 'history', label: tr?.onThisDay || 'On this day', active: false },
        ].map(({ key, label, active }) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10,
            background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
            cursor: active ? 'default' : 'default',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: 999,
              background: active ? '#FFD45A' : 'rgba(255,255,255,0.2)',
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              color: active ? '#fff' : 'rgba(255,255,255,0.5)',
            }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Saved cities */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: '"Geist", system-ui, sans-serif',
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 8,
            paddingLeft: 4,
          }}
        >
          {tr.saved}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {savedCities.map((city) => {
            const isActive = city === cityKey
            return (
              <button
                key={city}
                onClick={() => onCity(city)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  cursor: 'pointer',
                  minHeight: 44,
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: '"Geist", system-ui, sans-serif',
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                  }}>
                    {city}
                  </span>
                  {cityTemps?.[city] != null && (
                    <span style={{
                      fontFamily: '"Geist", system-ui, sans-serif',
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.35)',
                    }}>
                      {unit === 'F' ? Math.round(cityTemps[city] * 9/5 + 32) : Math.round(cityTemps[city])}°
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeSavedCity(city) }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 14,
                    lineHeight: 1,
                    padding: '2px 6px',
                    borderRadius: 4,
                    minHeight: 28,
                    minWidth: 28,
                  }}
                >
                  ×
                </button>
              </button>
            )
          })}
        </div>
        {data?.city && (
          <button
            onClick={() => isCitySaved ? removeSavedCity(data.city) : addSavedCity?.(data.city)}
            style={{
              marginTop: 8,
              width: '100%',
              padding: '9px 12px',
              borderRadius: 10,
              border: '1px dashed rgba(255,255,255,0.2)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: isCitySaved ? '#FFD45A' : 'rgba(255,255,255,0.45)',
              fontFamily: '"Geist", system-ui, sans-serif',
              fontSize: 13,
            }}
          >
            <span>{isCitySaved ? '★' : '+'}</span>
            <span>{isCitySaved ? `${data.city} saved` : `Save ${data.city}`}</span>
          </button>
        )}
      </div>

      {/* Footer controls */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Unit toggle */}
        <button
          onClick={onToggleUnit}
          style={{
            width: 64,
            height: 32,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            position: 'relative',
            flexShrink: 0,
            padding: 0,
          }}
          aria-label={`Switch to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
        >
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 600, color: unit === 'C' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)', fontFamily: '"Geist", system-ui, sans-serif', pointerEvents: 'none' }}>°F</span>
          <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 600, color: unit === 'C' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', fontFamily: '"Geist", system-ui, sans-serif', pointerEvents: 'none' }}>°C</span>
          <span style={{ position: 'absolute', top: 3, left: unit === 'C' ? 31 : 3, width: 26, height: 26, borderRadius: 999, background: 'rgba(255,255,255,0.95)', transition: 'left 250ms cubic-bezier(.4,1.2,.5,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
        </button>

        {/* Language flag */}
        <button
          onClick={() => onLanguageChange(nextLang)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label={`Switch to ${nextLang}`}
        >
          {LANG_FLAGS[language]}
        </button>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontFamily: '"Geist", system-ui, sans-serif',
            fontSize: 10,
            color: 'rgba(255,255,255,0.3)',
            textAlign: 'right',
            lineHeight: 1.4,
          }}
        >
          🐟 {tr.madeWith}
        </div>
      </div>
    </div>
  )
}
