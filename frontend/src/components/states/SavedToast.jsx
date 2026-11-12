import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../context/AppContext'
import { displayName, displayRegion, samePlace } from '../../utils/place'
import { countryName } from '../../utils/i18nUtils'

const SHOW_MS = 10000

// "Portland" alone is ambiguous when another saved Portland exists: add its region or country
function placeLabel(place, others, language, tr) {
  const name = displayName(place, language)
  const twin = others.some((p) => p && !samePlace(p, place) && displayName(p, language) === name)
  if (!twin) return name
  const where = displayRegion(place, language) || countryName(place.cc, tr.locale, place.country || '')
  return where ? `${name}, ${where}` : name
}

// Shown when saving a city pushed the oldest one out of a full list, with an undo.
// The timer pauses while the pointer or focus is on it; keyboard users are taken to
// Undo, and focus goes back to where it was when the toast closes.
export default function SavedToast({ tr, language }) {
  const { savedNotice, savedCities, undoEviction, dismissSavedNotice } = useAppStore()
  const [paused, setPaused] = useState(false)
  const undoRef = useRef(null)
  const returnRef = useRef(null)

  useEffect(() => {
    if (!savedNotice) return
    const from = document.activeElement
    returnRef.current = from && from !== document.body ? from : null
    setPaused(false)
    let keyboard = false
    try { keyboard = !!from?.matches(':focus-visible') } catch {}
    if (keyboard) undoRef.current?.focus()
  }, [savedNotice?.at])

  useEffect(() => {
    if (!savedNotice || paused) return
    const timer = setTimeout(dismissSavedNotice, SHOW_MS)
    return () => clearTimeout(timer)
  }, [savedNotice?.at, paused])

  const close = (action) => {
    const back = returnRef.current
    const hadFocus = document.activeElement?.closest?.('[data-saved-toast]')
    action()
    if (hadFocus && back?.isConnected) requestAnimationFrame(() => back.focus())
  }

  const others = savedNotice ? [...savedCities, savedNotice.evicted, savedNotice.added] : []

  return (
    <div role="status" aria-live="polite" style={{
      position: 'fixed', left: 16, right: 16, bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
      zIndex: 1000, display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    }}>
      {savedNotice && (
        <div
          data-saved-toast
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false) }}
          onKeyDown={(e) => { if (e.key === 'Escape') close(dismissSavedNotice) }}
          style={{
            pointerEvents: 'auto', maxWidth: 460, display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 8px 8px 16px', borderRadius: 16,
            background: 'rgba(10,15,30,0.92)', border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
            fontFamily: '"Geist", system-ui, sans-serif', fontSize: 13, lineHeight: 1.4, color: '#fff',
          }}
        >
          <span style={{ flex: 1 }}>
            {tr.savedFull(placeLabel(savedNotice.added, others, language, tr), placeLabel(savedNotice.evicted, others, language, tr))}
          </span>
          <button
            ref={undoRef}
            type="button"
            onClick={() => close(undoEviction)}
            style={{
              minHeight: 44, padding: '0 14px', borderRadius: 12, cursor: 'pointer', flexShrink: 0,
              background: 'rgba(255,212,90,0.14)', border: '1px solid rgba(255,212,90,0.5)',
              color: '#FFD45A', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            }}
          >
            {tr.undo}
          </button>
          <button
            type="button"
            onClick={() => close(dismissSavedNotice)}
            aria-label={tr.dismiss}
            title={tr.dismiss}
            style={{
              width: 44, height: 44, flexShrink: 0, border: 'none', background: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.8)', fontSize: 18, lineHeight: 1,
            }}
          >
            <span aria-hidden>×</span>
          </button>
        </div>
      )}
    </div>
  )
}
