import { useState } from 'react'

const LEVEL_COLORS = {
  // Dark translucent base so pills stay legible on bright sunset/sunny backgrounds
  yellow: { fg: '#FFD45A', bg: 'rgba(30,26,10,0.62)', bgOpen: 'rgba(60,50,15,0.72)', border: 'rgba(255,212,90,0.75)' },
  orange: { fg: '#FFA14A', bg: 'rgba(35,20,8,0.62)',  bgOpen: 'rgba(70,38,12,0.72)', border: 'rgba(255,161,74,0.8)' },
  red:    { fg: '#FF7A7A', bg: 'rgba(40,10,12,0.66)', bgOpen: 'rgba(80,18,20,0.76)', border: 'rgba(255,107,107,0.85)' },
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
  const text = alert.text[lang] || alert.text.en || Object.values(alert.text)[0] || { title: alert.type, description: '' }
  // Some agencies (e.g. DWD) send lowercase event names like "fog"
  return { ...text, title: text.title ? text.title.charAt(0).toUpperCase() + text.title.slice(1) : '' }
}

export default function WeatherAlerts({ alerts, timezone, tr, size = 'md' }) {
  const [open, setOpen] = useState(null)
  if (!alerts?.length) return null

  const locale = tr?.locale || 'en-GB'
  const lang = locale.slice(0, 2)
  const small = size === 'sm'
  const now = Date.now()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{
                display: 'inline-flex', alignItems: 'baseline', gap: 7,
                padding: small ? '11px 13px' : '8px 13px', minHeight: small ? 44 : 34,
                borderRadius: 18, maxWidth: '100%',
                background: isOpen ? c.bgOpen : c.bg,
                border: `1px solid ${c.border}`,
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                color: '#fff', cursor: 'pointer',
                fontFamily: '"Geist", system-ui, sans-serif',
                fontSize: small ? 12 : 13, lineHeight: 1.2, textAlign: 'left',
              }}
            >
              <span style={{ fontSize: small ? 12 : 13, color: c.fg, flexShrink: 0 }} aria-hidden>⚠</span>
              <span>
                <span style={{ fontWeight: 600 }}>{title}</span>{' '}
                <span style={{ color: 'rgba(255,255,255,0.75)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>· {when}</span>
              </span>
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
            background: 'rgba(10,15,28,0.7)',
            borderLeft: `3px solid ${c.fg}`,
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            fontFamily: '"Geist", system-ui, sans-serif',
            fontSize: small ? 12.5 : 13, lineHeight: 1.45,
            color: 'rgba(255,255,255,0.85)',
            maxWidth: 560,
          }}>
            {description && <div style={{ whiteSpace: 'pre-line' }}>{description}</div>}
            <div style={{ marginTop: description ? 6 : 0, fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
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
