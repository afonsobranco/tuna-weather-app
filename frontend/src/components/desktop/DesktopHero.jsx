import Glass from '../primitives/Glass'
import Tone from '../primitives/Tone'
import { ForecastIcon, IconRain, IconMoon, IconSun, IconPartlyCloudy } from '../icons/WeatherIcons'
import { GLeaf, GUV, GDrop } from '../icons/UIGlyphs'
import { T, relativeTime } from '../../utils/unitUtils'

function HeroIcon({ weatherState, size = 180 }) {
  switch (weatherState) {
    case 'rainy': return <IconRain size={size} />
    case 'clear-night': return <IconMoon size={size} />
    case 'clear-day': return <IconSun size={size} />
    default: return <IconPartlyCloudy size={size} />
  }
}

function MetricCell({ icon, label, value, unit: uLabel, tone, toneTone }) {
  return (
    <Glass style={{ padding: '14px 16px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
        {icon}
        <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 24, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
        {uLabel && (
          <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            {uLabel}
          </span>
        )}
        {tone && <Tone tone={toneTone}>{tone}</Tone>}
      </div>
    </Glass>
  )
}

export default function DesktopHero({
  data,
  unit,
  tr,
  weatherState,
  onToggleUnit,
  onRefetch,
  isStale,
}) {
  if (!data) return null

  const temp = T(data.tempC, unit)
  const hi = T(data.hiC, unit)
  const lo = T(data.loC, unit)
  const feels = T(data.feelsLikeC, unit)
  const lastUpd = relativeTime(data.fetchedAt)

  return (
    <div style={{ padding: '28px 28px 0' }}>
      {/* Location header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            {data.flag} {data.country}
          </div>
          <h1
            style={{
              fontFamily: '"Geist", system-ui, sans-serif',
              fontWeight: 500,
              fontSize: 54,
              color: '#fff',
              letterSpacing: '-2px',
              margin: 0,
              lineHeight: 1,
            }}
          >
            {data.city}
          </h1>
          <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 12, color: isStale ? '#ffa850' : 'rgba(255,255,255,0.4)', marginTop: 6 }}>
            {tr.lastUpdated(lastUpd)}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Unit toggle */}
          <button
            onClick={onToggleUnit}
            style={{
              width: 68,
              height: 34,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
              cursor: 'pointer',
              position: 'relative',
              padding: 0,
            }}
          >
            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 600, color: unit === 'C' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)', fontFamily: '"Geist", system-ui, sans-serif', pointerEvents: 'none' }}>°F</span>
            <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 600, color: unit === 'C' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', fontFamily: '"Geist", system-ui, sans-serif', pointerEvents: 'none' }}>°C</span>
            <span style={{ position: 'absolute', top: 4, left: unit === 'C' ? 33 : 4, width: 26, height: 26, borderRadius: 999, background: 'rgba(255,255,255,0.95)', transition: 'left 250ms cubic-bezier(.4,1.2,.5,1)' }} />
          </button>

          {/* Refresh */}
          <button
            onClick={() => onRefetch(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 16,
            }}
            aria-label="Refresh"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Main hero card */}
      <Glass style={{ padding: '24px 28px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Temp block */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <span
                style={{
                  fontFamily: '"Geist", system-ui, sans-serif',
                  fontWeight: 300,
                  fontSize: 172,
                  letterSpacing: '-9px',
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
                  fontSize: 72,
                  lineHeight: 1,
                  color: 'rgba(255,255,255,0.6)',
                  marginTop: 8,
                }}
              >
                °
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 22, fontWeight: 400, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
                {data.condition}
              </div>
              <div style={{ display: 'flex', gap: 16, fontFamily: '"Geist", system-ui, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
                <span>{tr.feels} {feels}°</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{tr.hiLo(hi, lo)}</span>
              </div>
            </div>
          </div>

          {/* Weather icon */}
          <div style={{ flexShrink: 0, paddingRight: 16 }}>
            <HeroIcon weatherState={weatherState} size={180} />
          </div>
        </div>
      </Glass>

      {/* 4-up metric grid */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 0 }}>
        <MetricCell
          icon={<GUV size={13} color="rgba(255,255,255,0.5)" />}
          label={tr.uvIndex}
          value={data.uv?.value ?? 0}
          tone={data.uv?.label}
          toneTone={data.uv?.tone}
        />
        <MetricCell
          icon={<GLeaf size={13} color="rgba(255,255,255,0.5)" />}
          label={tr.airQuality}
          value={data.aqi?.value ?? 0}
          tone={data.aqi?.label}
          toneTone={data.aqi?.tone}
        />
        <MetricCell
          icon={null}
          label={tr.wind}
          value={data.windSpeed ?? 0}
          unit={`km/h ${data.windDir || ''}`}
        />
        <MetricCell
          icon={<GDrop size={13} color="rgba(255,255,255,0.5)" />}
          label={tr.humidity}
          value={`${data.humidity ?? 0}%`}
        />
      </div>
    </div>
  )
}
