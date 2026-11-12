import { useEffect, useId, useRef } from 'react'
import Glass from '../primitives/Glass'
import { GSearch } from '../icons/UIGlyphs'
import { useCitySearch } from '../../hooks/useCitySearch'
import { placeFromSuggestion } from '../../utils/place'
import { countryName } from '../../utils/i18nUtils'

const FONT = '"Geist", system-ui, sans-serif'

export function SearchStatus({ status, tr, onRetry, style }) {
  if (!status) return null
  const isError = status.status === 'error' || status.status === 'failed'
  const message = status.status === 'failed'
    ? (status.reason === 'server' ? tr.searchFailedServer(status.query) : tr.searchFailed(status.query))
    : status.status === 'error' ? tr.searchNotFound(status.query)
    : status.status === 'retrying' ? tr.searchRetrying(status.query)
    : tr.searchLoading(status.query)
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: FONT, fontSize: 12, lineHeight: 1.35,
        color: isError ? '#FFB4B4' : 'rgba(255,255,255,0.88)',
        ...style,
      }}
    >
      {isError
        ? <span aria-hidden style={{ fontSize: 12 }}>⚠</span>
        : <span aria-hidden className="tuna-spinner" />}
      <span>{message}</span>
      {status.status === 'failed' && onRetry && (
        <button
          type="button"
          onClick={(e) => {
            // The button disappears on retry; keep keyboard focus in the search box
            const input = e.currentTarget.closest('[data-search-root]')?.querySelector('input[role=combobox]')
            onRetry()
            input?.focus()
          }}
          style={{
            marginLeft: 'auto', flexShrink: 0, minHeight: 32, padding: '4px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {tr.retryShort}
        </button>
      )}
    </div>
  )
}

export default function CitySearch({ tr, language, onSearch, status, onClearStatus, size = 'md' }) {
  const search = useCitySearch(language)
  const { query, suggestions, open, activeIndex } = search
  const wrapperRef = useRef(null)
  const listId = useId()
  const small = size === 'sm'

  // A failed search puts the typed text back so it can be corrected
  const prevStatusRef = useRef(null)
  useEffect(() => {
    const prev = prevStatusRef.current
    prevStatusRef.current = status
    if (status?.status === 'error' || status?.status === 'failed') search.setQuery(status.query)
    // The failed query loaded on retry: clear it, unless the user has typed something else
    else if (!status && ['loading', 'retrying'].includes(prev?.status) && search.query === prev.query) search.setQuery('')
  }, [status?.status, status?.query])

  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) search.close() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const pick = (s) => {
    search.reset()
    onSearch(placeFromSuggestion(s))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (open && activeIndex >= 0 && suggestions[activeIndex]) return pick(suggestions[activeIndex])
    const text = query.trim()
    if (!text) return
    // The list already says nothing matches: don't let the server guess an unrelated place
    if (open && suggestions.length === 0 && text.length >= 2) {
      search.close()
      onSearch({ name: text, noMatch: true })
      return
    }
    search.reset()
    onSearch({ name: text })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); search.move(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); search.move(-1) }
    else if (e.key === 'Escape') { search.close() }
  }

  const showList = open && query.trim().length >= 2
  const optionId = (i) => `${listId}-opt-${i}`

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <Glass className="search-pill" style={{
        borderRadius: 999, height: small ? 44 : 46,
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8,
      }}>
        <GSearch size={small ? 15 : 16} color="rgba(255,255,255,0.55)" />
        <form onSubmit={handleSubmit} role="search" style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          <input
            value={query}
            onChange={(e) => { onClearStatus?.(); search.change(e.target.value) }}
            onKeyDown={handleKeyDown}
            placeholder={tr.searchPlaceholder}
            aria-label={tr.searchPlaceholder}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={listId}
            aria-activedescendant={showList && activeIndex >= 0 ? optionId(activeIndex) : undefined}
            enterKeyHint="search"
            autoComplete="off"
            style={{
              flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none',
              color: '#fff', fontFamily: FONT, fontSize: small ? 13 : 14,
            }}
          />
        </form>
      </Glass>

      <span role="status" aria-live="polite" className="sr-only">
        {showList ? (suggestions.length ? tr.suggestionsCount(suggestions.length) : tr.noMatches) : ''}
      </span>

      {showList && (
        <div
          id={listId}
          role="listbox"
          aria-label={tr.searchPlaceholder}
          style={{
            // On mobile the box shares its row with the unit and language buttons; let the
            // list use the full screen width so suggestions don't wrap
            position: 'absolute', top: '100%', left: 0, zIndex: 100,
            ...(small ? { right: 0 } : { width: 'calc(100vw - 32px)' }),
            marginTop: 6, borderRadius: 14, overflow: 'hidden',
            background: 'rgba(10,25,50,0.96)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {suggestions.length === 0 ? (
            <div style={{ padding: '12px 14px', fontFamily: FONT, fontSize: 13, color: 'rgba(255,255,255,0.88)' }}>
              {tr.noMatches}
            </div>
          ) : suggestions.map((s, i) => (
            <div
              key={`${s.id ?? i}`}
              id={optionId(i)}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(s)}
              onMouseMove={() => i !== activeIndex && search.setActiveIndex(i)}
              style={{
                cursor: 'pointer', padding: '11px 14px', minHeight: 44, boxSizing: 'border-box',
                borderTop: i ? '1px solid rgba(255,255,255,0.08)' : 'none',
                background: i === activeIndex ? 'rgba(255,255,255,0.20)' : 'transparent',
                boxShadow: i === activeIndex ? 'inset 3px 0 0 #FFD45A' : 'none',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <GSearch size={12} color="rgba(255,255,255,0.35)" />
              <div style={{ minWidth: 0 }}>
                <span style={{ fontFamily: FONT, fontSize: small ? 13 : 14, color: '#fff', fontWeight: 500 }}>
                  {s.name}
                </span>
                <span style={{ fontFamily: FONT, fontSize: small ? 11 : 12, color: 'rgba(255,255,255,0.88)', marginLeft: 6 }}>
                  {[s.admin1, s.country || countryName(s.country_code, tr.locale, s.country_code)].filter(Boolean).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
