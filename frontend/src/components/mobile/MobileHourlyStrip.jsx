import Glass from '../primitives/Glass'
import { ForecastIcon } from '../icons/WeatherIcons'
import { T } from '../../utils/unitUtils'
import { translateDay } from '../../utils/i18nUtils'

function formatHour(timeStr) {
  if (!timeStr) return '—'
  const t = timeStr.split('T')[1]
  return t ? t.slice(0, 5) : '—'
}

export default function MobileHourlyStrip({ hourly = [], dayLabel, unit, tr }) {
  if (!hourly.length) return null

  return (
    <section style={{ padding: '4px 16px 12px' }}>
      <h2 style={{
        margin: '0 0 8px', paddingLeft: 2,
        fontFamily: '"Geist", system-ui, sans-serif',
        fontSize: 12, fontWeight: 500,
        color: 'rgba(255,255,255,0.75)',
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
        {tr.hourlyForecast}{dayLabel ? ` · ${translateDay(dayLabel, tr)}` : ''}
      </h2>

      {/* Scrollable card row */}
      <div
        className="hide-scroll"
        style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}
      >
        {hourly.map((h, i) => (
          <Glass
            key={i}
            style={{
              minWidth: 64,
              flexShrink: 0,
              padding: '10px 6px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              border: h.isNow
                ? '1px solid rgba(255,255,255,0.35)'
                : '1px solid rgba(255,255,255,0.10)',
              background: h.isNow
                ? 'rgba(255,255,255,0.12)'
                : undefined,
            }}
          >
            {/* Time */}
            <div style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontSize: 11,
              fontWeight: h.isNow ? 700 : 500,
              color: h.isNow ? '#fff' : 'rgba(255,255,255,0.55)',
              letterSpacing: h.isNow ? 0.5 : 0.2,
              textTransform: h.isNow ? 'uppercase' : 'none',
            }}>
              {h.isNow ? (tr?.now || 'Now') : formatHour(h.time)}
            </div>

            {/* Icon */}
            <ForecastIcon kind={h.icon} size={24} />

            {/* Temperature */}
            <div style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {T(h.tempC, unit)}°
            </div>
          </Glass>
        ))}
      </div>
    </section>
  )
}
