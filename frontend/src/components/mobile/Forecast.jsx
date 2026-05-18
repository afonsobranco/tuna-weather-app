import Glass from '../primitives/Glass'
import { ForecastIcon } from '../icons/WeatherIcons'
import { T } from '../../utils/unitUtils'

export default function Forecast({ data, unit, tr }) {
  if (!data || !data.forecast || data.forecast.length === 0) return null

  const forecast = data.forecast
  const translateDay = (d) => {
    if (d === 'Today')    return tr.today
    if (d === 'Tomorrow') return tr.tomorrow
    return tr.days?.[d] || d
  }

  return (
    <div style={{ padding: '0 16px 12px' }}>
      {/* Section header */}
      <div
        style={{
          fontFamily: '"Geist", system-ui, sans-serif',
          fontSize: 12,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 8,
          paddingLeft: 2,
        }}
      >
        {tr.forecast7day}
      </div>

      {/* Scrollable row */}
      <div
        className="hide-scroll"
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {forecast.map((day, idx) => {
          const hi = T(day.hi, unit)
          const lo = T(day.lo, unit)
          const isToday = idx === 0

          return (
            <Glass
              key={idx}
              style={{
                minWidth: 84,
                flexShrink: 0,
                padding: '12px 8px',
                textAlign: 'center',
                border: isToday
                  ? '1px solid rgba(255,255,255,0.28)'
                  : '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {/* Day label */}
              <div
                style={{
                  fontFamily: '"Geist", system-ui, sans-serif',
                  fontSize: 11,
                  fontWeight: isToday ? 600 : 400,
                  color: isToday ? '#fff' : 'rgba(255,255,255,0.55)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 0.3,
                }}
              >
                {translateDay(day.d)}
              </div>

              {/* Icon */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <ForecastIcon kind={day.i} size={28} />
              </div>

              {/* Hi */}
              <div
                style={{
                  fontFamily: '"Geist", system-ui, sans-serif',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#fff',
                  fontVariantNumeric: 'tabular-nums',
                  marginBottom: 2,
                }}
              >
                {hi}°
              </div>

              {/* Lo */}
              <div
                style={{
                  fontFamily: '"Geist", system-ui, sans-serif',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.45)',
                  fontVariantNumeric: 'tabular-nums',
                  marginBottom: 6,
                }}
              >
                {lo}°
              </div>

              {/* Rain % */}
              {typeof day.p === 'number' && (
                <div
                  style={{
                    fontFamily: '"Geist", system-ui, sans-serif',
                    fontSize: 10,
                    color: 'rgba(130,190,255,0.75)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {day.p}%
                </div>
              )}
            </Glass>
          )
        })}
      </div>
    </div>
  )
}
