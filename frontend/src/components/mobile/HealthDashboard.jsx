import { useId, useState } from 'react'
import Glass from '../primitives/Glass'
import Tone from '../primitives/Tone'
import { GLeaf, GUV, GDrop } from '../icons/UIGlyphs'
import { ProgressBar, HealthRing, HealthBreakdown, healthTip } from '../health/HealthParts'
import { formatNumber, windDisplay } from '../../utils/unitUtils'
import { toneColors } from '../../utils/weatherUtils'

const LABEL = {
  margin: 0, fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, fontWeight: 400,
  color: 'rgba(255,255,255,0.88)', textTransform: 'uppercase', letterSpacing: 0.4,
}

export default function HealthDashboard({ data, unit, tr }) {
  const [expanded, setExpanded] = useState(false)
  const breakdownId = useId()

  if (!data) return null

  const { uv, aqi, health } = data
  const score = health?.score ?? 0
  const windSpeed = data.windSpeed ?? 0
  const humidity = data.humidity ?? 0

  return (
    <div style={{ padding: '0 16px 12px' }}>
      {/* UV + AQI row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        {/* UV Cell */}
        <Glass style={{ flex: 1, padding: '14px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <GUV size={13} color="rgba(255,255,255,0.5)" />
            <h2 style={LABEL}>{tr.uvIndex}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, rowGap: 4, marginBottom: 8 }}>
            <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 28, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
              {formatNumber(uv?.value ?? 0, tr.locale)}
            </span>
            <Tone tone={uv?.tone || 'green'}>{tr?.uvLabels?.[uv?.label] || uv?.label || '—'}</Tone>
          </div>
          <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.88)', marginTop: -4, marginBottom: 6 }}>
            {tr.uvPeak}
          </div>
          <ProgressBar value={uv?.value ?? 0} max={11} color={toneColors(uv?.tone).dot} />
        </Glass>

        {/* AQI Cell */}
        <Glass style={{ flex: 1, padding: '14px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <GLeaf size={13} color="rgba(255,255,255,0.5)" />
            <h2 style={LABEL}>{tr.airQuality}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, rowGap: 4, marginBottom: 8 }}>
            <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 28, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
              {aqi?.value ?? 0}
            </span>
            <Tone tone={aqi?.tone || 'green'}>{tr?.aqiLabels?.[aqi?.label] || aqi?.label || '—'}</Tone>
          </div>
          <ProgressBar value={aqi?.value ?? 0} max={200} color={toneColors(aqi?.tone).dot} />
        </Glass>
      </div>

      {/* Wind + Humidity row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <Glass style={{ flex: 1, padding: '12px 14px' }}>
          <h2 style={{ ...LABEL, marginBottom: 6 }}>{tr.wind}</h2>
          <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 22, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
            {windDisplay(windSpeed, unit).value} <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.88)' }}>{windDisplay(windSpeed, unit).label} {tr?.windDirs?.[data.windDir] || data.windDir || ''}</span>
          </div>
        </Glass>
        <Glass style={{ flex: 1, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
            <GDrop size={12} color="rgba(255,255,255,0.5)" />
            <h2 style={LABEL}>{tr.humidity}</h2>
          </div>
          <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 22, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
            {humidity}<span style={{ fontSize: 14 }}>%</span>
          </div>
        </Glass>
      </div>

      {/* Health Score card */}
      <Glass style={{ padding: '14px 16px' }}>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-controls={breakdownId}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            minHeight: 44,
          }}
        >
          <HealthRing score={score} size={64} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <h2 style={{ margin: 0, fontFamily: '"Geist", system-ui, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff' }}>
              {tr.dailyHealthScore}
            </h2>
            <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3, lineHeight: 1.4 }}>
              {healthTip(health, tr)}
            </div>
          </div>
          {/* Chevron */}
          <svg
            width={16}
            height={16}
            viewBox="0 0 16 16"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms ease',
              flexShrink: 0,
            }}
          >
            <path d="M4 6l4 4 4-4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>

        {/* Collapsible breakdown */}
        <div
          id={breakdownId}
          hidden={!expanded}
          style={{
            maxHeight: expanded ? 400 : 0,
            overflow: 'hidden',
            transition: 'max-height 350ms cubic-bezier(.4,1,.4,1)',
          }}
        >
          <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 12 }}>
            <HealthBreakdown health={health} tr={tr} />
            <button
              type="button"
              onClick={() => setExpanded(false)}
              style={{
                marginTop: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: '"Geist", system-ui, sans-serif',
                fontSize: 12,
                color: 'rgba(255,255,255,0.88)',
                padding: 0,
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {tr.hideBreakdown}
            </button>
          </div>
        </div>
      </Glass>
    </div>
  )
}
