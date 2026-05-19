import Glass from '../primitives/Glass'
import { ringColor } from '../../utils/weatherUtils'

function ProgressBar({ value, max = 100, color }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div style={{ height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
    </div>
  )
}

function HealthRing({ score, size = 64 }) {
  const color = ringColor(score)
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.25}
        strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fill={color} fontSize={16} fontWeight={600}
        fontFamily='"Geist", system-ui, sans-serif' style={{ fontVariantNumeric: 'tabular-nums' }}>
        {score}
      </text>
    </svg>
  )
}

export default function DesktopHealthScore({ data, tr }) {
  if (!data) return null

  const { uv, aqi, health } = data
  const score     = health?.score ?? 0
  const tip       = health?.tip ?? ''
  const windSpeed = data.windSpeed ?? 0
  const humidity  = data.humidity ?? 0

  const uvFactor   = Math.min(100, ((uv?.value ?? 0) / 11) * 100)
  const aqiFactor  = Math.min(100, Math.max(0, 100 - ((aqi?.value ?? 0) / 200) * 100))
  const dewFactor  = Math.min(100, Math.max(0, 100 - ((humidity - 40) / 60) * 100))
  const windFactor = Math.min(100, Math.max(0, 100 - (windSpeed / 60) * 100))

  const rcUv   = ringColor(100 - uvFactor)
  const rcAqi  = ringColor(aqiFactor)
  const rcDew  = ringColor(dewFactor)
  const rcWind = ringColor(windFactor)

  const factors = [
    { weight: '25%', value: uvFactor,   color: rcUv   },
    { weight: '40%', value: aqiFactor,  color: rcAqi  },
    { weight: '20%', value: dewFactor,  color: rcDew  },
    { weight: '15%', value: windFactor, color: rcWind },
  ]

  return (
    <Glass style={{ padding: '16px 20px' }}>
      {/* Score row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <HealthRing score={score} size={64} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            {tr?.dailyHealthScore || 'Daily Health Score'}
          </div>
          <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>
            {tip}
          </div>
        </div>
      </div>

      {/* Breakdown — always visible */}
      <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>
          {tr?.howWeCalculate || 'How we calculate this'}
        </div>
        {(tr?.healthFactors || ['UV Index', 'Air Quality', 'Dewpoint / Humidity', 'Wind']).map((label, i) => {
          const f = { label, ...factors[i] }
          return (
            <div key={f.label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{f.label}</span>
                <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{f.weight}</span>
              </div>
              <ProgressBar value={f.value} max={100} color={f.color} />
            </div>
          )
        })}
      </div>
    </Glass>
  )
}
