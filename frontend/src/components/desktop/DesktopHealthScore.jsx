import Glass from '../primitives/Glass'
import { HealthRing, HealthBreakdown, healthTip } from '../health/HealthParts'

const FONT = '"Geist", system-ui, sans-serif'

export default function DesktopHealthScore({ data, tr }) {
  if (!data) return null
  const { health } = data

  return (
    <Glass style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <HealthRing score={health?.score ?? 0} size={64} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            {tr.dailyHealthScore}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
            {healthTip(health, tr)}
          </div>
        </div>
      </div>
      <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <HealthBreakdown health={health} tr={tr} />
      </div>
    </Glass>
  )
}
