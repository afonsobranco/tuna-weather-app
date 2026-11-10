import { useEffect, useRef, useState } from 'react'
import Glass from '../primitives/Glass'
import { GExternal } from '../icons/UIGlyphs'
import { API_BASE } from '../../utils/api'

const GRAIN_STYLE = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(ellipse at 20% 10%, rgba(140,100,40,0.15), transparent 55%), ' +
    'radial-gradient(ellipse at 80% 90%, rgba(120,80,30,0.15), transparent 60%), ' +
    'repeating-linear-gradient(0deg, rgba(120,90,50,0.05) 0 1px, transparent 1px 3px), ' +
    'repeating-linear-gradient(90deg, rgba(120,90,50,0.04) 0 1px, transparent 1px 4px)',
  mixBlendMode: 'overlay',
  opacity: 0.45,
  pointerEvents: 'none',
}

export default function OnThisDay({ data, tr, language }) {
  const [expanded, setExpanded] = useState(false)
  const today = data?.localDate || ''
  const [selectedDate, setSelectedDate] = useState(today)
  const [picked, setPicked] = useState(null) // { date, loading, history } for a non-today date
  const [minHeight, setMinHeight] = useState(0)
  const requestRef = useRef(0)
  const eventsRef = useRef(null)

  const loadDate = async (value) => {
    const id = ++requestRef.current
    if (!value || value.slice(5) === today.slice(5)) { setPicked(null); return }
    // Hold the card's height so the page doesn't jump while the archive loads
    setMinHeight(eventsRef.current?.offsetHeight || 0)
    setPicked({ date: value, loading: true, history: [] })
    const params = new URLSearchParams({ date: value.slice(5), city: data.city, country: data.country || '', lang: language })
    let history = []
    try {
      const res = await fetch(`${API_BASE}/history?${params}`)
      history = (await res.json()).history || []
    } catch {}
    if (id === requestRef.current) {
      setPicked({ date: value, loading: false, history })
      setMinHeight(0)
    }
  }

  // New place: back to its today
  useEffect(() => {
    setSelectedDate(today)
    setPicked(null)
    requestRef.current++
  }, [today, data?.city])

  // New language: keep the picked date, reload it in that language
  useEffect(() => {
    if (selectedDate && selectedDate !== today) loadDate(selectedDate)
  }, [language])

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
    setExpanded(false)
    loadDate(e.target.value)
  }

  if (!data) return null
  const history = picked ? picked.history : data.history || []
  const loading = !!picked?.loading
  const visible = expanded ? history : history.slice(0, 1)
  const remaining = history.length - 1

  return (
    <div style={{ padding: '0 16px 12px' }}>
      <Glass
        antique
        style={{ padding: '18px 18px 16px' }}
      >
        {/* Grain overlay */}
        <div style={GRAIN_STYLE} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
          <h2
            style={{
              margin: 0,
              fontFamily: '"Geist", system-ui, sans-serif',
              fontSize: 22,
              fontWeight: 600,
              color: 'rgba(255,240,200,0.92)',
              letterSpacing: '-0.3px',
            }}
          >
            {tr.onThisDay}
          </h2>

          {/* Date picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            aria-label={tr.pickDate}
            style={{
              background: 'rgba(220,190,140,0.15)',
              border: '1px solid rgba(220,190,140,0.3)',
              borderRadius: 8,
              padding: '8px 10px',
              minHeight: 44,
              color: 'rgba(255,240,200,0.9)',
              fontFamily: '"Geist", system-ui, sans-serif',
              fontSize: 11,
              cursor: 'pointer',
              outline: 'none',
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Events */}
        <div ref={eventsRef} style={{ position: 'relative', minHeight: loading ? minHeight : 0 }} aria-live="polite" aria-busy={loading}>
          {(loading || history.length === 0) && (
            <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 13, color: 'rgba(255,240,200,0.75)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading && <span aria-hidden className="tuna-spinner" />}
              {loading ? tr.historyLoading : tr.historyEmpty}
            </div>
          )}
          {!loading && visible.map((event, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: idx < visible.length - 1 ? 16 : 0,
                paddingBottom: idx < visible.length - 1 ? 16 : 0,
                borderBottom: idx < visible.length - 1 ? '1px solid rgba(220,190,140,0.18)' : 'none',
              }}
            >
              {/* Year */}
              <span
                style={{
                  fontFamily: '"Geist", system-ui, sans-serif',
                  fontSize: 28,
                  fontWeight: 300,
                  color: '#ffe7b8',
                  display: 'block',
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {event.year}
              </span>
              {/* Title */}
              <div
                style={{
                  fontFamily: '"Geist", system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'rgba(255,240,200,0.9)',
                  marginBottom: 4,
                  lineHeight: 1.4,
                }}
              >
                {event.title}
              </div>
              {/* Body */}
              <div
                style={{
                  fontFamily: '"Geist", system-ui, sans-serif',
                  fontSize: 13,
                  color: 'rgba(220,200,160,0.7)',
                  lineHeight: 1.5,
                  marginBottom: 6,
                }}
              >
                {event.body}
              </div>
              {/* Wikipedia link */}
              {event.href && (
                <a
                  href={event.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: '"Geist", system-ui, sans-serif',
                    fontSize: 11,
                    color: 'rgba(200,170,100,0.8)',
                    textDecoration: 'none',
                    minHeight: 44,
                    paddingTop: 8,
                  }}
                >
                  {tr.wikipedia}
                  <GExternal size={10} color="rgba(200,170,100,0.6)" />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Expand / collapse */}
        {!loading && history.length > 1 && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            style={{
              marginTop: 12,
              background: 'rgba(220,190,140,0.12)',
              border: '1px solid rgba(220,190,140,0.25)',
              borderRadius: 999,
              padding: '6px 14px',
              fontFamily: '"Geist", system-ui, sans-serif',
              fontSize: 12,
              color: 'rgba(255,230,180,0.75)',
              cursor: 'pointer',
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {expanded ? tr.showLess : tr.showMore(remaining)}
          </button>
        )}
      </Glass>
    </div>
  )
}
