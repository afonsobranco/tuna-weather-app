import Glass from '../primitives/Glass'
import Tone from '../primitives/Tone'
import WeatherAlerts from '../alerts/WeatherAlerts'
import UnitToggle from '../primitives/UnitToggle'
import Flag from '../primitives/Flag'
import { countryName } from '../../utils/i18nUtils'
import { ForecastIcon } from '../icons/WeatherIcons'
import { heroIconKind } from '../../utils/weatherUtils'
import { GLeaf, GUV, GDrop } from '../icons/UIGlyphs'
import { T, relativeTime, formatNumber, windDisplay } from '../../utils/unitUtils'
import { useNow } from '../../hooks/useNow'

const FONT = '"Geist", system-ui, sans-serif'

function MetricCell({ icon, label, value, unit: uLabel, tone, toneTone, caption }) {
  return (
    <Glass style={{ padding: '14px 16px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, minWidth: 0 }}>
        {icon}
        <span title={label} style={{
          fontFamily: FONT, fontSize: 10.5, color: 'rgba(255,255,255,0.88)', textTransform: 'uppercase', letterSpacing: 0.15,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: FONT, fontSize: 24, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
        {uLabel && (
          <span style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.88)', whiteSpace: 'nowrap' }}>
            {uLabel}
          </span>
        )}
      </div>
      {(tone || caption) && (
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {tone && <Tone tone={toneTone}>{tone}</Tone>}
          {caption && <span style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.88)' }}>{caption}</span>}
        </div>
      )}
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
  useNow(30000) // keeps "Last updated" current
  if (!data) return null

  const temp = T(data.tempC, unit)
  // The current reading can sit a fraction outside the forecast range; never show H below now
  const hi = Math.max(T(data.hiC, unit), temp)
  const lo = Math.min(T(data.loC, unit), temp)
  const feels = T(data.feelsLikeC, unit)
  const lastUpd = relativeTime(data.fetchedAt, tr)

  return (
    <div>
      {/* Location header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.88)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Flag cc={data.countryCode} size={13} /> {countryName(data.countryCode, tr.locale, data.country)}</span>
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
          <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 12, color: isStale ? '#ffa850' : 'rgba(255,255,255,0.88)', marginTop: 6 }}>
            {tr.lastUpdated(lastUpd)}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <UnitToggle unit={unit} onToggle={onToggleUnit} tr={tr} height={40} />

          {/* Refresh */}
          <button
            onClick={() => onRefetch(true)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.88)',
              fontSize: 16,
            }}
            aria-label={tr.refresh}
            title={tr.refresh}
          >
            ↻
          </button>
        </div>
      </div>

      {/* Main hero card */}
      <Glass style={{ padding: '24px 28px', marginBottom: 12 }}>
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
                  color: 'rgba(255,255,255,0.88)',
                  marginTop: 8,
                }}
              >
                °
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 22, fontWeight: 400, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
                {tr?.conditions?.[data.condition] || data.condition}
              </div>
              <div style={{ display: 'flex', gap: 16, fontFamily: '"Geist", system-ui, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.88)' }}>
                <span>{tr.feels} {feels}°</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{tr.hiLo(hi, lo)}</span>
              </div>
            </div>
          </div>

          {/* Weather icon */}
          <div style={{ flexShrink: 0, paddingRight: 16 }}>
            <ForecastIcon kind={heroIconKind(data)} size={180} />
          </div>
        </div>
      </Glass>

      {data.alerts?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <WeatherAlerts key={data.city} alerts={data.alerts} timezone={data.timezone} tr={tr} />
        </div>
      )}

      {/* 4-up metric grid */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 0 }}>
        <MetricCell
          icon={<GUV size={13} color="rgba(255,255,255,0.5)" />}
          label={tr.uvIndex}
          value={formatNumber(data.uv?.value ?? 0, tr.locale)}
          caption={tr.uvPeak}
          tone={tr?.uvLabels?.[data.uv?.label] || data.uv?.label}
          toneTone={data.uv?.tone}
        />
        <MetricCell
          icon={<GLeaf size={13} color="rgba(255,255,255,0.5)" />}
          label={tr.airQuality}
          value={data.aqi?.value ?? 0}
          tone={tr?.aqiLabels?.[data.aqi?.label] || data.aqi?.label}
          toneTone={data.aqi?.tone}
        />
        <MetricCell
          icon={null}
          label={tr.wind}
          value={windDisplay(data.windSpeed ?? 0, unit).value}
          unit={`${windDisplay(data.windSpeed ?? 0, unit).label} ${tr?.windDirs?.[data.windDir] || data.windDir || ''}`}
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
