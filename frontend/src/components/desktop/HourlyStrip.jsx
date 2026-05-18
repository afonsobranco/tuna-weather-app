import Glass from '../primitives/Glass'
import { ForecastIcon } from '../icons/WeatherIcons'
import { T } from '../../utils/unitUtils'

export default function HourlyStrip({ data, unit, tr }) {
  const hourly = data?.hourly || []
  if (!hourly.length) return null

  const W = 1200, H = 64
  const padX = W / hourly.length / 2
  const temps = hourly.map(h => h.tempC)
  const minT = Math.min(...temps)
  const maxT = Math.max(...temps)
  const range = maxT - minT || 1

  const pts = hourly.map((h, i) => ({
    x: padX + (i / (hourly.length - 1)) * (W - padX * 2),
    y: H - 10 - ((h.tempC - minT) / range) * (H - 28),
  }))

  // Smooth bezier path
  const path = pts.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = a[i - 1]
    const cx = prev.x + (p.x - prev.x) * 0.5
    return acc + ` C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`
  }, '')
  const last = pts[pts.length - 1]
  const first = pts[0]
  const areaPath = `${path} L ${last.x} ${H} L ${first.x} ${H} Z`

  return (
    <Glass style={{ padding: '14px 18px' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 6,
      }}>
        <div style={{
          color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600,
          letterSpacing: 1.2, textTransform: 'uppercase',
        }}>{tr?.hourlyForecast || 'Hourly Forecast'}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{tr?.next24h || 'next 24h'}</div>
      </div>

      <div style={{ position: 'relative', height: H, marginTop: 4 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="sparkArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#FFD18A" stopOpacity="0.55" />
              <stop offset="0.6" stopColor="#FFD18A" stopOpacity="0.10" />
              <stop offset="1" stopColor="#FFD18A" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sparkLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#9DCDF2" />
              <stop offset="0.5" stopColor="#FFD18A" />
              <stop offset="1" stopColor="#F4825F" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#sparkArea)" />
          <path
            d={path} fill="none" stroke="url(#sparkLine)"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {pts.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x} cy={p.y}
                r={hourly[i].isNow ? 4 : 2.2}
                fill={hourly[i].isNow ? '#fff' : '#FFD18A'}
                stroke={hourly[i].isNow ? '#FFD18A' : 'rgba(0,0,0,0.15)'}
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={p.x} y={p.y - 8} textAnchor="middle"
                style={{
                  fontFamily: 'Geist, system-ui, sans-serif',
                  fontWeight: 400, fontSize: 14,
                  fill: '#fff', letterSpacing: -0.3,
                }}
              >
                {T(hourly[i].tempC, unit)}°
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Icon + time row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${hourly.length}, 1fr)`,
        marginTop: 4,
      }}>
        {hourly.map((h, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '6px 0 4px', borderRadius: 10,
            background: h.isNow ? 'rgba(255,255,255,0.10)' : 'transparent',
          }}>
            <ForecastIcon kind={h.icon} size={20} />
            <div style={{
              color: h.isNow ? '#fff' : 'rgba(255,255,255,0.65)',
              fontSize: 10.5,
              fontWeight: h.isNow ? 700 : 600,
              letterSpacing: h.isNow ? 0.6 : 0.4,
              textTransform: h.isNow ? 'uppercase' : 'none',
            }}>
              {h.isNow ? (tr?.now || 'Now') : h.label}
            </div>
          </div>
        ))}
      </div>
    </Glass>
  )
}
