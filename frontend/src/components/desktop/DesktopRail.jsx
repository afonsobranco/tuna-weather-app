import { useState } from 'react'
import Glass from '../primitives/Glass'
import AppMark from '../primitives/AppMark'
import { GSearch, GLocate } from '../icons/UIGlyphs'
import { useAppStore } from '../../context/AppContext'

const LANG_FLAGS = { en: '🇬🇧', pt: '🇵🇹' }

export default function DesktopRail({
  cityKey,
  unit,
  language,
  tr,
  onCity,
  onToggleUnit,
  onSearch,
  onLanguageChange,
}) {
  const [query, setQuery] = useState('')
  const { savedCities, removeSavedCity } = useAppStore()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
      setQuery('')
    }
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
              fontFamily: '"Instrument Serif", serif',
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

      {/* Search */}
      <Glass style={{ borderRadius: 999, height: 44, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
        <GSearch size={15} color="rgba(255,255,255,0.45)" />
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
                <span
                  style={{
                    fontFamily: '"Geist", system-ui, sans-serif',
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                  }}
                >
                  {city}
                </span>
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
