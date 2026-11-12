import { useEffect } from 'react'
import { useAppStore } from '../../context/AppContext'
import { displayName } from '../../utils/place'

const SHOW_MS = 8000

// Shown when saving a city pushed the oldest one out of a full list, with an undo
export default function SavedToast({ tr, language }) {
  const { savedNotice, undoEviction, dismissSavedNotice } = useAppStore()

  useEffect(() => {
    if (!savedNotice) return
    const timer = setTimeout(dismissSavedNotice, SHOW_MS)
    return () => clearTimeout(timer)
  }, [savedNotice?.at])

  return (
    <div role="status" aria-live="polite" style={{
      position: 'fixed', left: 16, right: 16, bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
      zIndex: 1000, display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    }}>
      {savedNotice && (
        <div style={{
          pointerEvents: 'auto', maxWidth: 440, display: 'flex', alignItems: 'center', gap: 12,
          padding: '8px 8px 8px 16px', borderRadius: 16,
          background: 'rgba(10,15,30,0.92)', border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
          fontFamily: '"Geist", system-ui, sans-serif', fontSize: 13, lineHeight: 1.4, color: '#fff',
        }}>
          <span style={{ flex: 1 }}>
            {tr.savedFull(displayName(savedNotice.added, language), displayName(savedNotice.evicted, language))}
          </span>
          <button
            type="button"
            onClick={undoEviction}
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
            onClick={dismissSavedNotice}
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
