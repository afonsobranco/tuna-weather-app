import AppMark from '../primitives/AppMark'
import UnitToggle from '../primitives/UnitToggle'
import Flag from '../primitives/Flag'
import CitySearch, { SearchStatus } from '../search/CitySearch'
import { useAppStore } from '../../context/AppContext'
import { placeFromData, placeKey, samePlace } from '../../utils/place'
import { T } from '../../utils/unitUtils'
import { countryName } from '../../utils/i18nUtils'

const FONT = '"Geist", system-ui, sans-serif'
const LANG_CC = { en: 'GB', pt: 'PT' }

export default function DesktopRail({
  data,
  unit,
  language,
  tr,
  onCity,
  onToggleUnit,
  onSearch,
  onLanguageChange,
  searchStatus,
  onClearSearchStatus,
  onRetrySearch,
  activeSection,
  onNavigate,
}) {
  const { savedCities, cityTemps, addSavedCity, removeSavedCity } = useAppStore()
  const current = data ? placeFromData(data) : null
  const isCitySaved = current ? savedCities.some((p) => samePlace(p, current)) : false
  const nextLang = language === 'en' ? 'pt' : 'en'

  const nav = [
    { key: 'today',   label: tr.today },
    { key: 'forecast', label: tr.forecast7day },
    { key: 'history', label: tr.onThisDay },
  ]

  return (
    <div
      style={{
        width: 280, flexShrink: 0, height: '100%',
        display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: 16,
        background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        overflowY: 'auto', position: 'relative', zIndex: 10,
      }}
    >
      {/* Brand lockup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 4 }}>
        <AppMark size={44} />
        <div>
          <div style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 22, color: '#fff', lineHeight: 1, letterSpacing: '-0.5px' }}>
            Tuna
          </div>
          <div style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 1 }}>
            WEATHER APP
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <CitySearch
          tr={tr}
          language={language}
          onSearch={onSearch}
          status={searchStatus}
          onClearStatus={onClearSearchStatus}
          size="sm"
        />
        <SearchStatus status={searchStatus} tr={tr} onRetry={onRetrySearch} style={{ paddingLeft: 8 }} />
      </div>

      {/* Section navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(({ key, label }) => {
          const active = activeSection === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              aria-current={active ? 'true' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                padding: '10px 12px', minHeight: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
              }}
            >
              <span aria-hidden style={{
                width: 6, height: 6, borderRadius: 999, flexShrink: 0,
                background: active ? '#FFD45A' : 'rgba(255,255,255,0.25)',
              }} />
              <span style={{
                fontFamily: FONT, fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? '#fff' : 'rgba(255,255,255,0.65)',
              }}>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Saved cities */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: FONT, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4,
        }}>
          {tr.saved}
        </div>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 4, listStyle: 'none', margin: 0, padding: 0 }}>
          {savedCities.map((city) => {
            const isActive = current ? samePlace(city, current) : false
            const temp = cityTemps?.[placeKey(city)]
            const country = countryName(city.cc, tr.locale, city.country || '')
            const fullName = country ? `${city.name}, ${country}` : city.name
            return (
              <li key={placeKey(city)} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => onCity(city)}
                  aria-current={isActive ? 'true' : undefined}
                  aria-label={fullName}
                  style={{
                    width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    justifyContent: 'center', padding: '8px 48px 8px 12px', borderRadius: 12, minHeight: 48,
                    border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    cursor: 'pointer', transition: 'background 0.15s ease', textAlign: 'left',
                  }}
                >
                  <span style={{
                    fontFamily: FONT, fontSize: 14, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                  }}>
                    {city.name}
                  </span>
                  {(country || temp != null) && (
                    <span style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
                      {[country, temp != null ? `${T(temp, unit)}°` : null].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => removeSavedCity(city)}
                  aria-label={tr.removeCity(fullName)}
                  title={tr.removeCity(fullName)}
                  style={{
                    position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                    width: 40, height: 40, borderRadius: 10, border: 'none', background: 'none',
                    cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1,
                  }}
                >
                  <span aria-hidden>×</span>
                </button>
              </li>
            )
          })}
        </ul>
        {current && (
          <button
            type="button"
            onClick={() => (isCitySaved ? removeSavedCity(current) : addSavedCity(current))}
            aria-pressed={isCitySaved}
            style={{
              marginTop: 8, width: '100%', padding: '9px 12px', minHeight: 40, borderRadius: 10,
              border: '1px dashed rgba(255,255,255,0.25)', background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              color: isCitySaved ? '#FFD45A' : 'rgba(255,255,255,0.65)', fontFamily: FONT, fontSize: 13,
            }}
          >
            <span aria-hidden>{isCitySaved ? '★' : '+'}</span>
            <span>{isCitySaved ? tr.citySaved(current.name) : tr.saveCity(current.name)}</span>
          </button>
        )}
      </div>

      {/* Footer controls */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <UnitToggle unit={unit} onToggle={onToggleUnit} tr={tr} height={36} />
        <button
          type="button"
          onClick={() => onLanguageChange(nextLang)}
          aria-label={tr.languageToggle}
          title={tr.languageToggle}
          style={{
            width: 40, height: 40, borderRadius: 999, cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Flag cc={LANG_CC[language]} size={16} />
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: FONT, fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'right', lineHeight: 1.4 }}>
          🐟 {tr.madeWith}
        </div>
      </div>
    </div>
  )
}
