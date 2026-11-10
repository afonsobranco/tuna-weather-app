import Glass from '../primitives/Glass'
import { ForecastIcon } from '../icons/WeatherIcons'
import { GExternal, GDrop } from '../icons/UIGlyphs'
import { T } from '../../utils/unitUtils'
import { translateDay } from '../../utils/i18nUtils'

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

export default function DesktopAside({ data, unit, tr, selectedDayIdx = 0, onDaySelect, forecastRef, historyRef }) {
  if (!data) return null

  const dateLabel = new Date(`${data.localDate}T12:00:00Z`)
    .toLocaleDateString(tr.locale, { day: 'numeric', month: 'short', timeZone: 'UTC' })

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

      {/* 5-day forecast */}
      <div ref={forecastRef} style={{ scrollMarginTop: 26 }}>
      <Glass style={{ padding: '16px 18px' }}>
        <h2 style={{
          margin: '0 0 8px', color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600,
          letterSpacing: 1.2, textTransform: 'uppercase',
        }}>
          {tr?.forecast7day || '5-Day Forecast'}
        </h2>
        {data.forecast.map((d, i) => {
          const loPct = (d.lo - minT) / range
          const hiPct = (d.hi - minT) / range
          return (
            <button
              key={i}
              onClick={() => onDaySelect?.(i)}
              aria-pressed={i === selectedDayIdx}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(64px, auto) 24px 40px 1fr 52px',
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
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 500, textAlign: 'left', whiteSpace: 'nowrap' }}>{translateDay(d.d, tr)}</div>
              <ForecastIcon kind={d.i} size={22} />
              <div style={{
                color: '#CFE6FF', fontSize: 11, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 3,
              }}>
                <GDrop size={10} color="currentColor" />{d.p}%
              </div>
              {/* Temperature range bar */}
              <div style={{ position: 'relative', height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.25)' }}>
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
                {T(d.hi, unit)}°<span style={{ opacity: 0.7, marginLeft: 4 }}>{T(d.lo, unit)}°</span>
              </div>
            </button>
          )
        })}
      </Glass>
      </div>

      {/* On This Day */}
      <div ref={historyRef} style={{ scrollMarginTop: 26 }}>
      <Glass antique accent="rgba(220,190,140,0.4)" style={{ padding: '18px 18px 14px' }}>
        <ParchmentGrain />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
          position: 'relative',
        }}>
          <h2 style={{
            margin: 0, fontFamily: '"Geist", system-ui, sans-serif', fontWeight: 600,
            color: '#fff8e7', fontSize: 26, letterSpacing: -0.3, lineHeight: 1,
          }}>
            {tr?.onThisDay || 'On this day'}
          </h2>
          <span style={{
            fontSize: 10.5, color: 'rgba(255,240,210,0.8)', fontWeight: 600,
            letterSpacing: 1.2, textTransform: 'uppercase',
          }}>
            {dateLabel} · {data.city}
          </span>
        </div>

        <div style={{ marginTop: 12, position: 'relative' }}>
          {data.history.map((h, i) => (
            <a
              key={i}
              href={h.href || undefined}
              target={h.href ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{
                display: 'grid', gridTemplateColumns: '68px 1fr', gap: 14,
                padding: '14px 0', textDecoration: 'none',
                borderTop: i ? '1px solid rgba(220,195,150,0.22)' : 'none',
              }}
            >
              <div style={{
                fontFamily: '"Geist", system-ui, sans-serif', fontWeight: 300,
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
                {h.href && <div style={{
                  marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                  color: 'rgba(255,225,180,0.75)', fontSize: 10, fontWeight: 600,
                  letterSpacing: 1, textTransform: 'uppercase',
                }}>
                  {tr?.wikipedia || 'Wikipedia'} <GExternal color="currentColor" />
                </div>}
              </div>
            </a>
          ))}
        </div>
      </Glass>
      </div>
    </aside>
  )
}
