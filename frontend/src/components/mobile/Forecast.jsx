import Glass from '../primitives/Glass'
import { ForecastIcon } from '../icons/WeatherIcons'
import { T } from '../../utils/unitUtils'
import { translateDay } from '../../utils/i18nUtils'

export default function Forecast({ data, unit, tr, selectedIdx = 0, onSelect }) {
  if (!data || !data.forecast || data.forecast.length === 0) return null

  const forecast = data.forecast

  return (
    <div style={{ padding: '0 16px 12px' }}>
      {/* Section header */}
      <h2
        style={{
          margin: '0 0 8px',
          fontFamily: '"Geist", system-ui, sans-serif',
          fontSize: 12,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.88)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          paddingLeft: 2,
        }}
      >
        {tr.forecast7day}
      </h2>

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
          const isSelected = idx === selectedIdx

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect?.(idx)}
              aria-pressed={isSelected}
              style={{ flex: '1 0 84px', padding: 0, border: 'none', background: 'none', cursor: 'pointer', color: 'inherit' }}
            >
            <Glass
              style={{
                padding: '12px 8px',
                textAlign: 'center',
                background: isSelected ? 'rgba(255,255,255,0.18)' : undefined,
                border: isSelected
                  ? '1px solid rgba(255,255,255,0.45)'
                  : '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {/* Day label */}
              <div
                style={{
                  fontFamily: '"Geist", system-ui, sans-serif',
                  fontSize: 11,
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? '#fff' : 'rgba(255,255,255,0.88)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 0.3,
                }}
              >
                {translateDay(day.d, tr)}
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
                  color: 'rgba(255,255,255,0.88)',
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
                    color: '#CFE6FF',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {day.p}%
                </div>
              )}
            </Glass>
            </button>
          )
        })}
      </div>
    </div>
  )
}
