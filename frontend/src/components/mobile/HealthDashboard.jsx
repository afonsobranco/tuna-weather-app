import { useState } from 'react'
import Glass from '../primitives/Glass'
import Tone from '../primitives/Tone'
import { GLeaf, GUV, GDrop } from '../icons/UIGlyphs'
import { ringColor } from '../../utils/weatherUtils'

function ProgressBar({ value, max = 100, color }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div
      style={{
        height: 4,
        background: 'rgba(255,255,255,0.12)',
        borderRadius: 999,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 999,
          transition: 'width 0.6s ease',
        }}
      />
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
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={6}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text
        x={size / 2}
        y={size / 2 + 5}
        textAnchor="middle"
        fill={color}
        fontSize={16}
        fontWeight={600}
        fontFamily='"Geist", system-ui, sans-serif'
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {score}
      </text>
    </svg>
  )
}

export default function HealthDashboard({ data, unit, tr }) {
  const [expanded, setExpanded] = useState(false)

  if (!data) return null

  const { uv, aqi, health } = data
  const score = health?.score ?? 75
  const tip = health?.tip ?? ''
  const windSpeed = data.windSpeed ?? 0
  const humidity = data.humidity ?? 0

  // Derived factor values for the breakdown bars
  const uvFactor = Math.min(100, ((uv?.value ?? 0) / 11) * 100)
  const aqiFactor = Math.min(100, Math.max(0, 100 - ((aqi?.value ?? 0) / 200) * 100))
  const dewFactor = Math.min(100, Math.max(0, 100 - ((humidity - 40) / 60) * 100))
  const windFactor = Math.min(100, Math.max(0, 100 - (windSpeed / 60) * 100))

  const rcUv = ringColor(100 - uvFactor)
  const rcAqi = ringColor(aqiFactor)
  const rcDew = ringColor(dewFactor)
  const rcWind = ringColor(windFactor)

  return (
    <div style={{ padding: '0 16px 12px' }}>
      {/* UV + AQI row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        {/* UV Cell */}
        <Glass style={{ flex: 1, padding: '14px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <GUV size={13} color="rgba(255,255,255,0.5)" />
            <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {tr.uvIndex}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
            <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 28, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
              {uv?.value ?? 0}
            </span>
            <Tone tone={uv?.tone || 'green'}>{tr?.uvLabels?.[uv?.label] || uv?.label || '—'}</Tone>
          </div>
          <ProgressBar value={uv?.value ?? 0} max={11} color="#ffa850" />
        </Glass>

        {/* AQI Cell */}
        <Glass style={{ flex: 1, padding: '14px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <GLeaf size={13} color="rgba(255,255,255,0.5)" />
            <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {tr.airQuality}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
            <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 28, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
              {aqi?.value ?? 0}
            </span>
            <Tone tone={aqi?.tone || 'green'}>{tr?.aqiLabels?.[aqi?.label] || aqi?.label || '—'}</Tone>
          </div>
          <ProgressBar value={aqi?.value ?? 0} max={200} color="#3ed28b" />
        </Glass>
      </div>

      {/* Wind + Humidity row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <Glass style={{ flex: 1, padding: '12px 14px' }}>
          <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
            {tr.wind}
          </div>
          <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 22, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
            {windSpeed} <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.55)' }}>km/h {tr?.windDirs?.[data.windDir] || data.windDir || ''}</span>
          </div>
        </Glass>
        <Glass style={{ flex: 1, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
            <GDrop size={12} color="rgba(255,255,255,0.5)" />
            <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {tr.humidity}
            </span>
          </div>
          <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 22, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
            {humidity}<span style={{ fontSize: 14 }}>%</span>
          </div>
        </Glass>
      </div>

      {/* Health Score card */}
      <Glass style={{ padding: '14px 16px' }}>
        <button
          onClick={() => setExpanded((e) => !e)}
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
            <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff' }}>
              {tr.dailyHealthScore}
            </div>
            <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3, lineHeight: 1.4 }}>
              {tip}
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
          style={{
            maxHeight: expanded ? 280 : 0,
            overflow: 'hidden',
            transition: 'max-height 350ms cubic-bezier(.4,1,.4,1)',
          }}
        >
          <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 12 }}>
            <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>
              {tr.howWeCalculate}
            </div>
            {(tr?.healthFactors || ['UV Index', 'Air Quality', 'Dewpoint / Humidity', 'Wind']).map((label, i) => {
              const factors = [
                { weight: '25%', value: uvFactor,   color: rcUv   },
                { weight: '40%', value: aqiFactor,  color: rcAqi  },
                { weight: '20%', value: dewFactor,  color: rcDew  },
                { weight: '15%', value: windFactor, color: rcWind },
              ]
              const f = { label, ...factors[i] }
              return (
              <div key={f.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                    {f.label}
                  </span>
                  <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                    {f.weight}
                  </span>
                </div>
                <ProgressBar value={f.value} max={100} color={f.color} />
              </div>
              )
            })}
            <button
              onClick={() => setExpanded(false)}
              style={{
                marginTop: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: '"Geist", system-ui, sans-serif',
                fontSize: 12,
                color: 'rgba(255,255,255,0.45)',
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
