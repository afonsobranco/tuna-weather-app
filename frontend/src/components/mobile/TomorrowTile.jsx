import Glass from '../primitives/Glass'
import { ForecastIcon } from '../icons/WeatherIcons'
import { tomorrowCondition } from '../../utils/weatherUtils'
import { T } from '../../utils/unitUtils'

export default function TomorrowTile({ data, unit, tr }) {
  if (!data || !data.forecast || data.forecast.length < 2) return null

  const tomorrow = data.forecast[1]
  const iconKind = tomorrow?.i || 'partly'
  const condition = tomorrowCondition(iconKind)
  const hi = T(tomorrow.hi, unit)
  const lo = T(tomorrow.lo, unit)

  return (
    <div style={{ padding: '0 16px 12px' }}>
      <Glass
        style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}
        accent={condition.accent + '55'}
      >
        {/* Icon */}
        <div style={{ flexShrink: 0 }}>
          <ForecastIcon kind={condition.icon} size={40} />
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {tr.tomorrowAt8}
          </div>
          <div
            style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              marginTop: 2,
            }}
          >
            {condition.label}
          </div>
          <div
            style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontSize: 12,
              color: 'rgba(255,255,255,0.55)',
              marginTop: 2,
            }}
          >
            {condition.tip}
          </div>
        </div>

        {/* H/L */}
        <div
          style={{
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontSize: 18,
              fontWeight: 500,
              color: '#fff',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {hi}°
          </div>
          <div
            style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {lo}°
          </div>
        </div>
      </Glass>
    </div>
  )
}
