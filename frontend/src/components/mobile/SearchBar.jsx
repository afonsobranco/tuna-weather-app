import CitySearch, { SearchStatus } from '../search/CitySearch'
import UnitToggle from '../primitives/UnitToggle'
import Flag from '../primitives/Flag'
import { useAppStore } from '../../context/AppContext'
import { placeFromData, samePlace } from '../../utils/place'
import { countryName } from '../../utils/i18nUtils'
import { relativeTime } from '../../utils/unitUtils'
import { useNow } from '../../hooks/useNow'

const FONT = '"Geist", system-ui, sans-serif'
const LANG_CC = { en: 'GB', pt: 'PT' }

export default function SearchBar({ data, unit, language, tr, onToggleUnit, onSearch, onLanguageChange, searchStatus, onClearSearchStatus, onRetrySearch, onRefetch, isStale }) {
  useNow(30000) // keeps "Last updated" current
  const { savedCities, addSavedCity, removeSavedCity } = useAppStore()
  const nextLang = language === 'en' ? 'pt' : 'en'
  const place = data ? placeFromData(data) : null
  const isSaved = place ? savedCities.some((p) => samePlace(p, place)) : false

  const dateStr = data?.localDate
    ? new Date(`${data.localDate}T12:00:00Z`).toLocaleDateString(tr.locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
    : ''

  return (
    <div style={{ padding: '12px 16px 8px', position: 'relative', zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CitySearch
          tr={tr}
          language={language}
          onSearch={onSearch}
          status={searchStatus}
          onClearStatus={onClearSearchStatus}
        />
        <UnitToggle unit={unit} onToggle={onToggleUnit} tr={tr} height={44} />
        <button
          type="button"
          onClick={() => onLanguageChange(nextLang)}
          aria-label={tr.languageToggle}
          title={tr.languageToggle}
          style={{
            width: 44, height: 44, borderRadius: 999, flexShrink: 0, cursor: 'pointer',
            background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Flag cc={LANG_CC[language]} size={18} />
        </button>
      </div>

      <SearchStatus status={searchStatus} tr={tr} onRetry={onRetrySearch} style={{ marginTop: 8, paddingLeft: 6 }} />

      {data && (
        <div style={{ marginTop: 6, paddingLeft: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', minWidth: 0 }}>
            <h1 style={{ margin: 0, fontFamily: FONT, fontWeight: 500, fontSize: 15, color: 'rgba(255,255,255,0.95)' }}>
              {data.city}
            </h1>
            <span style={{ fontFamily: FONT, fontWeight: 400, fontSize: 13, color: 'rgba(255,255,255,0.88)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span aria-hidden>·</span> <Flag cc={data.countryCode} size={13} /> {countryName(data.countryCode, tr.locale, data.country)} · {dateStr}
            </span>
          </div>
          <button
            type="button"
            onClick={() => (isSaved ? removeSavedCity(place) : addSavedCity(place))}
            aria-pressed={isSaved}
            aria-label={tr.saveCity(data.city)}
            title={isSaved ? tr.unsaveCity(data.city) : tr.saveCity(data.city)}
            style={{
              width: 44, height: 44, flexShrink: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', padding: 0,
            }}
          >
            <span aria-hidden style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 38, height: 30, borderRadius: 8, fontSize: 16, lineHeight: 1,
              background: isSaved ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: isSaved ? '#FFD45A' : 'rgba(255,255,255,0.88)',
            }}>
              {isSaved ? '★' : '☆'}
            </span>
          </button>
        </div>
      )}

      {data && (
        <div style={{ paddingLeft: 4, display: 'flex', alignItems: 'center', gap: 4, marginTop: -6 }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: isStale ? '#FFC58A' : 'rgba(255,255,255,0.88)' }}>
            {tr.lastUpdated(relativeTime(data.fetchedAt, tr))}
          </span>
          <button
            type="button"
            onClick={() => onRefetch?.()}
            aria-label={tr.refresh}
            title={tr.refresh}
            style={{
              width: 44, height: 44, marginLeft: -6, border: 'none', background: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.8)', fontSize: 16,
            }}
          >
            <span aria-hidden>↻</span>
          </button>
        </div>
      )}
    </div>
  )
}
