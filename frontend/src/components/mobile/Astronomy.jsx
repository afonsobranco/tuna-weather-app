import Glass from '../primitives/Glass'
import { GSunrise, GSunset, GHourglass } from '../icons/UIGlyphs'
import { formatMinutes } from '../../utils/i18nUtils'
import { useNow } from '../../hooks/useNow'

const FONT = '"Geist", system-ui, sans-serif'

// Point on the arc's quadratic curve: (10,45) → control (60,-5) → (110,45)
function arcPoint(t) {
  const u = 1 - t
  return { x: u * u * 10 + 2 * u * t * 60 + t * t * 110, y: u * u * 45 + 2 * u * t * -5 + t * t * 45 }
}

// Local wall-clock strings parsed as UTC; adding the city's offset to Date.now() puts
// "now" on the same scale, so differences come out exact to the second.
const localMs = (s) => (s ? Date.parse(`${s.length === 16 ? `${s}:00` : s}Z`) : NaN)

function liveSun(data, now) {
  const base = data.sun
  if (!base) return null
  const nowL = now + (data.utcOffsetSeconds || 0) * 1000
  const sr = localMs(base.sunriseAt), ss = localMs(base.sunsetAt), next = localMs(base.nextSunriseAt)
  if (![sr, ss].every(Number.isFinite)) return base
  const mins = (ms) => Math.max(0, Math.floor((ms - nowL) / 60000))
  if (nowL < sr) return { phase: 'before', minutes: mins(sr), progress: null }
  if (nowL < ss) return { phase: 'day', minutes: mins(ss), progress: (nowL - sr) / (ss - sr) }
  return { phase: 'after', minutes: Number.isFinite(next) ? mins(next) : null, progress: null }
}

function TimeBlock({ icon, label, value }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 }}>
        {icon}
        <span style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {label}
        </span>
      </div>
      <span style={{ fontFamily: FONT, fontSize: 30, color: '#fff', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  )
}

export default function Astronomy({ data, tr, noPadding }) {
  const now = useNow(30000)
  if (!data) return null
  const { sunrise, sunset } = data

  const sun = liveSun(data, now)

  const isDay = sun?.phase === 'day'
  const dot = arcPoint(isDay ? sun.progress : sun?.phase === 'before' ? 0 : 1)
  const statusLabel = sun?.phase === 'before' ? tr.sunriseIn : sun?.phase === 'after' ? tr.sunHasSet : tr.daylightRemaining

  return (
    <div style={noPadding ? {} : { padding: '0 16px 12px' }}>
      <Glass style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <TimeBlock icon={<GSunrise size={14} color="rgba(255,220,120,0.8)" />} label={tr.sunrise} value={sunrise} />

          <div style={{ flex: 1, padding: '0 8px', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 120 50" style={{ width: '100%', maxWidth: 200, overflow: 'visible' }} aria-hidden>
              <path d="M 10 45 Q 60 -5 110 45" fill="none" stroke="rgba(255,220,120,0.25)" strokeWidth="1.5" strokeDasharray="3 4" />
              <line x1="5" y1="45" x2="115" y2="45" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              {sun && (
                <>
                  <circle cx={dot.x} cy={dot.y} r="10" fill={isDay ? 'rgba(255,220,100,0.15)' : 'rgba(255,255,255,0.05)'} />
                  <circle cx={dot.x} cy={dot.y} r="5" fill={isDay ? 'rgba(255,220,100,0.9)' : 'rgba(255,255,255,0.3)'} />
                </>
              )}
            </svg>
          </div>

          <TimeBlock icon={<GSunset size={14} color="rgba(255,160,80,0.8)" />} label={tr.sunset} value={sunset} />
        </div>

        {sun && (
          <div style={{
            marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, flexWrap: 'wrap',
          }}>
            <GHourglass size={14} color="rgba(255,255,255,0.55)" />
            <span style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{statusLabel}</span>
            <span style={{ fontFamily: FONT, fontSize: 16, color: 'rgba(255,255,255,0.9)', fontVariantNumeric: 'tabular-nums' }}>
              {formatMinutes(sun.minutes)}
            </span>
          </div>
        )}
      </Glass>
    </div>
  )
}
