import { useId } from 'react'
import Glass from '../primitives/Glass'
import { ForecastIcon } from '../icons/WeatherIcons'
import { T } from '../../utils/unitUtils'

function formatHour(timeStr) {
  if (!timeStr) return '—'
  const t = timeStr.split('T')[1]
  return t ? t.slice(0, 5) : '—'
}

export default function HourlyStrip({ hourly: hourlyProp, data, unit, tr }) {
  const uid    = useId().replace(/:/g, '')
  const areaId = `sparkArea-${uid}`
  const lineId = `sparkLine-${uid}`

  const hourly = hourlyProp || data?.hourly || []
  if (!hourly.length) return null

  // SVG dimensions — no overflow needed, labels are in a separate HTML row
  const W = 1000, H = 56
  const padX = W / hourly.length / 2
  const temps = hourly.map(h => h.tempC)
  const minT  = Math.min(...temps)
  const maxT  = Math.max(...temps)
  const range = maxT - minT || 1

  const pts = hourly.map((h, i) => ({
    x: padX + (i / (hourly.length - 1)) * (W - padX * 2),
    // leave 8px padding top and bottom so dots don't touch the edges
    y: H - 8 - ((h.tempC - minT) / range) * (H - 16),
  }))

  const path = pts.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = a[i - 1]
    const cx = prev.x + (p.x - prev.x) * 0.5
    return acc + ` C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`
  }, '')
  const areaPath = `${path} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`

  return (
    <Glass style={{ padding: '16px 28px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          {tr?.hourlyForecast || 'Hourly Forecast'}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
          {tr?.next24h || 'next 24h'}
        </div>
      </div>

      {/* Temperature labels row — plain HTML, no overflow risk */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${hourly.length}, 1fr)`, marginBottom: 2 }}>
        {hourly.map((h, i) => (
          <div key={i} style={{
            textAlign: 'center',
            fontFamily: '"Geist", system-ui, sans-serif',
            fontSize: 12, fontWeight: 500,
            color: h.isNow ? '#fff' : 'rgba(255,255,255,0.75)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {T(h.tempC, unit)}°
          </div>
        ))}
      </div>

      {/* SVG chart — fits exactly within its container, no overflow */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: H, display: 'block' }}
      >
        <defs>
          <linearGradient id={areaId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0"   stopColor="#FFD18A" stopOpacity="0.50" />
            <stop offset="0.7" stopColor="#FFD18A" stopOpacity="0.08" />
            <stop offset="1"   stopColor="#FFD18A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={lineId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0"   stopColor="#9DCDF2" />
            <stop offset="0.5" stopColor="#FFD18A" />
            <stop offset="1"   stopColor="#F4825F" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${areaId})`} />
        <path d={path} fill="none" stroke={`url(#${lineId})`}
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {pts.map((p, i) => (
          <circle key={i}
            cx={p.x} cy={p.y}
            r={hourly[i].isNow ? 4.5 : 2.5}
            fill={hourly[i].isNow ? '#fff' : '#FFD18A'}
            stroke={hourly[i].isNow ? '#FFD18A' : 'rgba(0,0,0,0.2)'}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Icon + time row */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${hourly.length}, 1fr)`, marginTop: 4 }}>
        {hourly.map((h, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '6px 0 4px', borderRadius: 10,
            background: h.isNow ? 'rgba(255,255,255,0.10)' : 'transparent',
          }}>
            <ForecastIcon kind={h.icon} size={20} />
            <div style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              color: h.isNow ? '#fff' : 'rgba(255,255,255,0.65)',
              fontSize: 10.5,
              fontWeight: h.isNow ? 700 : 500,
              letterSpacing: h.isNow ? 0.6 : 0.3,
              textTransform: h.isNow ? 'uppercase' : 'none',
            }}>
              {h.isNow ? (tr?.now || 'Now') : formatHour(h.time)}
            </div>
          </div>
        ))}
      </div>
    </Glass>
  )
}
