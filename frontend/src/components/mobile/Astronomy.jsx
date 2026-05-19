import Glass from '../primitives/Glass'
import { GSunrise, GSunset, GHourglass } from '../icons/UIGlyphs'

export default function Astronomy({ data, tr, noPadding }) {
  if (!data) return null

  const { sunrise, sunset, daylight } = data

  return (
    <div style={noPadding ? {} : { padding: '0 16px 12px' }}>
      <Glass style={{ padding: '16px' }}>
        {/* Sunrise / Sunset row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Sunrise */}
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 }}>
              <GSunrise size={14} color="rgba(255,220,120,0.8)" />
              <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {tr.sunrise}
              </span>
            </div>
            <span
              style={{
                fontFamily: '"Instrument Serif", serif',
                fontStyle: 'italic',
                fontSize: 30,
                color: '#fff',
                letterSpacing: '-0.5px',
              }}
            >
              {sunrise}
            </span>
          </div>

          {/* Sun arc SVG */}
          <div style={{ flex: 1, padding: '0 8px' }}>
            <svg viewBox="0 0 120 50" style={{ width: '100%', overflow: 'visible' }}>
              {/* Dashed arc path */}
              <path
                d="M 10 45 Q 60 -5 110 45"
                fill="none"
                stroke="rgba(255,220,120,0.25)"
                strokeWidth="1.5"
                strokeDasharray="3 4"
              />
              {/* Horizon line */}
              <line x1="5" y1="45" x2="115" y2="45" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              {/* Sun dot — approximately at 78% through arc */}
              <circle cx="78" cy="11" r="5" fill="rgba(255,220,100,0.9)" />
              {/* Sun halo */}
              <circle cx="78" cy="11" r="10" fill="rgba(255,220,100,0.15)" />
            </svg>
          </div>

          {/* Sunset */}
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 }}>
              <GSunset size={14} color="rgba(255,160,80,0.8)" />
              <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {tr.sunset}
              </span>
            </div>
            <span
              style={{
                fontFamily: '"Instrument Serif", serif',
                fontStyle: 'italic',
                fontSize: 30,
                color: '#fff',
                letterSpacing: '-0.5px',
              }}
            >
              {sunset}
            </span>
          </div>
        </div>

        {/* Daylight remaining */}
        {daylight && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
            }}
          >
            <GHourglass size={14} color="rgba(255,255,255,0.45)" />
            <span style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {tr.daylightRemaining}
            </span>
            <span
              style={{
                fontFamily: '"Instrument Serif", serif',
                fontStyle: 'italic',
                fontSize: 16,
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              {daylight}
            </span>
          </div>
        )}
      </Glass>
    </div>
  )
}
