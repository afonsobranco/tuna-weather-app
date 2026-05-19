import Glass from '../primitives/Glass'
import { ForecastIcon } from '../icons/WeatherIcons'
import { GExternal, GDrop } from '../icons/UIGlyphs'
import { T } from '../../utils/unitUtils'

// Parchment grain overlay
function ParchmentGrain() {
  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 24, pointerEvents: 'none', opacity: 0.45,
      background: `
        radial-gradient(ellipse at 20% 10%, rgba(140,100,40,0.15), transparent 55%),
        radial-gradient(ellipse at 80% 90%, rgba(120,80,30,0.15), transparent 60%),
        repeating-linear-gradient(0deg, rgba(120,90,50,0.05) 0 1px, transparent 1px 3px),
        repeating-linear-gradient(90deg, rgba(120,90,50,0.04) 0 1px, transparent 1px 4px)`,
      mixBlendMode: 'overlay',
    }} />
  )
}

export default function DesktopAside({ data, unit, tr, language, selectedDayIdx = 0, onDaySelect }) {
  if (!data) return null

  const locale = tr?.dateLocale || 'en'
  const today = new Date()
  const dateLabel = `${today.getDate()} ${today.toLocaleDateString(locale, { month: 'short' })}`

  const translateDay = (d) => {
    if (d === 'Today')    return tr?.today    || d
    if (d === 'Tomorrow') return tr?.tomorrow || d
    return tr?.days?.[d] || d
  }

  // 7-day forecast range normalization
  const allHi = data.forecast.map(d => d.hi)
  const allLo = data.forecast.map(d => d.lo)
  const minT = Math.min(...allLo)
  const maxT = Math.max(...allHi)
  const range = maxT - minT || 1

  return (
    <aside style={{
      width: 330, flexShrink: 0,
      padding: '26px 22px 26px 4px',
      display: 'flex', flexDirection: 'column', gap: 18,
      overflowY: 'auto',
    }} className="hide-scroll">

      {/* On This Day */}
      <Glass antique accent="rgba(220,190,140,0.4)" style={{ padding: '18px 18px 14px' }}>
        <ParchmentGrain />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative',
        }}>
          <div style={{
            fontFamily: '"Geist", system-ui, sans-serif', fontStyle: 'italic',
            color: '#fff8e7', fontSize: 26, letterSpacing: -0.3, lineHeight: 1,
          }}>
            {tr?.onThisDay || 'On this day'}
          </div>
          <span style={{
            fontSize: 10.5, color: 'rgba(255,240,210,0.7)', fontWeight: 600,
            letterSpacing: 1.2, textTransform: 'uppercase',
          }}>
            {dateLabel} · {data.city}
          </span>
        </div>

        <div style={{ marginTop: 12, position: 'relative' }}>
          {data.history.map((h, i) => (
            <a
              key={i}
              href={h.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'grid', gridTemplateColumns: '68px 1fr', gap: 14,
                padding: '14px 0', textDecoration: 'none',
                borderTop: i ? '1px solid rgba(220,195,150,0.22)' : 'none',
              }}
            >
              <div style={{
                fontFamily: '"Geist", system-ui, sans-serif', fontStyle: 'italic',
                color: '#ffe7b8', fontSize: 32, letterSpacing: -0.6, lineHeight: 1, paddingTop: 2,
              }}>
                {h.year}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  color: '#fff8e7', fontSize: 14, fontWeight: 600,
                  lineHeight: 1.25, letterSpacing: -0.1,
                }}>
                  {h.title}
                </div>
                <div style={{
                  color: 'rgba(255,240,210,0.78)', fontSize: 12.5, lineHeight: 1.4,
                  marginTop: 4,
                }}>
                  {h.body}
                </div>
                <div style={{
                  marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                  color: 'rgba(255,225,180,0.75)', fontSize: 10, fontWeight: 600,
                  letterSpacing: 1, textTransform: 'uppercase',
                }}>
                  {tr?.wikipedia || 'Wikipedia'} <GExternal color="currentColor" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </Glass>

      {/* 7-Day Forecast (vertical) */}
      <Glass style={{ padding: '16px 18px' }}>
        <div style={{
          color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600,
          letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8,
        }}>
          {tr?.forecast7day || '5-Day Forecast'}
        </div>
        {data.forecast.map((d, i) => {
          const loPct = (d.lo - minT) / range
          const hiPct = (d.hi - minT) / range
          return (
            <button
              key={i}
              onClick={() => onDaySelect?.(i)}
              style={{
                display: 'grid',
                gridTemplateColumns: '46px 24px 40px 1fr 40px',
                alignItems: 'center', gap: 10,
                padding: '8px 6px',
                borderRadius: 10,
                border: 'none',
                background: i === selectedDayIdx ? 'rgba(255,255,255,0.08)' : 'transparent',
                cursor: 'pointer',
                width: '100%',
                borderTop: i ? '1px solid rgba(255,255,255,0.10)' : 'none',
              }}
            >
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{translateDay(d.d)}</div>
              <ForecastIcon kind={d.i} size={22} />
              <div style={{
                color: 'rgba(160,200,255,0.95)', fontSize: 11, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 3,
              }}>
                <GDrop size={10} color="currentColor" />{d.p}%
              </div>
              {/* Temperature range bar */}
              <div style={{ position: 'relative', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.10)' }}>
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${loPct * 100}%`,
                  width: `${(hiPct - loPct) * 100}%`,
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #6FA8E8 0%, #F9C26B 60%, #F4825F 100%)',
                }} />
              </div>
              <div style={{
                color: '#fff', fontFamily: '"Geist", sans-serif', fontWeight: 400,
                fontSize: 13, letterSpacing: -0.3, textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {T(d.hi, unit)}°<span style={{ opacity: 0.5, marginLeft: 4 }}>{T(d.lo, unit)}°</span>
              </div>
            </button>
          )
        })}
      </Glass>
    </aside>
  )
}
