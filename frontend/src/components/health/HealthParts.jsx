import { ringColor } from '../../utils/weatherUtils'

const FONT = '"Geist", system-ui, sans-serif'

export function ProgressBar({ value, max = 100, color }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div style={{ height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
    </div>
  )
}

export function HealthRing({ score, size = 64 }) {
  const color = ringColor(score)
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${score}/100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.25}
        strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fill={color} fontSize={16} fontWeight={600}
        fontFamily={FONT} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {score}
      </text>
    </svg>
  )
}

export function healthTip(health, tr) {
  return tr.healthTips?.[health?.tipKey] || health?.tip || ''
}

export function HealthBreakdown({ health, tr }) {
  const factors = health?.factors || []
  return (
    <div>
      <div style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.88)', marginBottom: 10 }}>
        {tr.howWeCalculate}
      </div>
      {factors.map((f) => (
        <div key={f.key} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, gap: 8 }}>
            <span style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              {tr.healthFactors?.[f.key] || f.key}
            </span>
            <span style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.88)', fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>{f.score}</span>/100 · {tr.healthWeight(f.weight)}
            </span>
          </div>
          <ProgressBar value={f.score} color={ringColor(f.score)} />
        </div>
      ))}
      {health?.penalty > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontSize: 12, marginTop: 4 }}>
          <span style={{ color: 'rgba(255,255,255,0.8)' }}>{tr.healthPenalty}</span>
          <span style={{ color: '#FF9B9B', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>−{health.penalty}</span>
        </div>
      )}
    </div>
  )
}
