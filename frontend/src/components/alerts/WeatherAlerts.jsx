import { useState } from 'react'

const LEVEL_COLORS = {
  yellow: { fg: '#FFD45A', bg: 'rgba(255,212,90,0.16)',  bgOpen: 'rgba(255,212,90,0.30)',  border: 'rgba(255,212,90,0.45)' },
  orange: { fg: '#FFA14A', bg: 'rgba(255,161,74,0.18)',  bgOpen: 'rgba(255,161,74,0.32)',  border: 'rgba(255,161,74,0.5)' },
  red:    { fg: '#FF6B6B', bg: 'rgba(255,107,107,0.20)', bgOpen: 'rgba(255,107,107,0.34)', border: 'rgba(255,107,107,0.55)' },
}

function formatWhen(iso, timezone, locale) {
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: timezone,
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

function pickText(alert, lang) {
  return alert.text[lang] || alert.text.en || Object.values(alert.text)[0] || { title: alert.type, description: '' }
}

export default function WeatherAlerts({ alerts, timezone, tr, size = 'md' }) {
  const [open, setOpen] = useState(null)
  if (!alerts?.length) return null

  const locale = tr?.locale || 'en-GB'
  const lang = locale.slice(0, 2)
  const small = size === 'sm'
  const now = Date.now()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: small ? 8 : 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {alerts.map((a, i) => {
          const c = LEVEL_COLORS[a.level] || LEVEL_COLORS.yellow
          const { title } = pickText(a, lang)
          const isOpen = open === i
          const active = new Date(a.onset).getTime() <= now
          const when = active
            ? tr.alertUntil(formatWhen(a.expires, timezone, locale))
            : tr.alertFrom(formatWhen(a.onset, timezone, locale))
          return (
            <button
              key={i}
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: small ? '5px 10px' : '6px 12px',
                borderRadius: 999,
                background: isOpen ? c.bgOpen : c.bg,
                border: `1px solid ${c.border}`,
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                color: '#fff', cursor: 'pointer',
                fontFamily: '"Geist", system-ui, sans-serif',
                fontSize: small ? 12 : 13, lineHeight: 1.2, textAlign: 'left',
              }}
            >
              <span style={{ fontSize: small ? 11 : 12, color: c.fg }} aria-hidden>⚠</span>
              <span style={{ fontWeight: 600 }}>{title}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>· {when}</span>
            </button>
          )
        })}
      </div>

      {open !== null && alerts[open] && (() => {
        const a = alerts[open]
        const c = LEVEL_COLORS[a.level] || LEVEL_COLORS.yellow
        const { description } = pickText(a, lang)
        return (
          <div style={{
            padding: small ? '10px 12px' : '12px 14px',
            borderRadius: 14,
            background: 'rgba(0,0,0,0.25)',
            borderLeft: `3px solid ${c.fg}`,
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            fontFamily: '"Geist", system-ui, sans-serif',
            fontSize: small ? 12.5 : 13, lineHeight: 1.45,
            color: 'rgba(255,255,255,0.85)',
            maxWidth: 560,
          }}>
            {description && <div style={{ whiteSpace: 'pre-line' }}>{description}</div>}
            <div style={{ marginTop: description ? 6 : 0, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              {tr.alertSource}:{' '}
              <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {a.source}
              </a>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
