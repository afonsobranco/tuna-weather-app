import { T } from '../../utils/unitUtils'
import { IconRain, IconMoon, IconPartlyCloudy, IconSun } from '../icons/WeatherIcons'

function HeroIcon({ weatherState, size = 104 }) {
  switch (weatherState) {
    case 'rainy': return <IconRain size={size} />
    case 'clear-night': return <IconMoon size={size} />
    case 'clear-day': return <IconSun size={size} />
    default: return <IconPartlyCloudy size={size} />
  }
}

export default function Hero({ data, unit, tr, weatherState }) {
  if (!data) return null

  const temp = T(data.tempC, unit)
  const hi = T(data.hiC, unit)
  const lo = T(data.loC, unit)
  const feels = T(data.feelsLikeC, unit)

  return (
    <div style={{ padding: '0 16px 4px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      {/* Left: Temp + condition */}
      <div style={{ flex: 1 }}>
        {/* Temperature */}
        <div style={{ display: 'flex', alignItems: 'flex-start', lineHeight: 1 }}>
          <span
            style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontWeight: 200,
              fontSize: 132,
              letterSpacing: '-6px',
              lineHeight: 0.88,
              color: '#fff',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {temp}
          </span>
          <span
            style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontWeight: 200,
              fontSize: 62,
              lineHeight: 1,
              color: 'rgba(255,255,255,0.7)',
              marginTop: 4,
            }}
          >
            °
          </span>
        </div>

        {/* Condition */}
        <div
          style={{
            fontFamily: '"Geist", system-ui, sans-serif',
            fontWeight: 400,
            fontSize: 18,
            color: 'rgba(255,255,255,0.75)',
            marginTop: 4,
            letterSpacing: '-0.2px',
          }}
        >
          {data.condition}
        </div>

        {/* Feels like + H/L */}
        <div
          style={{
            marginTop: 6,
            display: 'flex',
            gap: 12,
            fontFamily: '"Geist", system-ui, sans-serif',
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          <span>{tr.feels} {feels}°</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {tr.hiLo(hi, lo)}
          </span>
        </div>
      </div>

      {/* Right: Weather icon */}
      <div style={{ paddingTop: 8, flexShrink: 0 }}>
        <HeroIcon weatherState={weatherState} size={104} />
      </div>
    </div>
  )
}
