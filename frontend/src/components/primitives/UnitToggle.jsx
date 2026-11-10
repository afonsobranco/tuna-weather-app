const FONT = '"Geist", system-ui, sans-serif'

export default function UnitToggle({ unit, onToggle, tr, height = 40 }) {
  const width = Math.round(height * 1.8)
  const knob = height - 6
  const isC = unit === 'C'
  const label = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 600, fontFamily: FONT, color: 'rgba(255,255,255,0.6)', pointerEvents: 'none' }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={tr.unitToggle(isC ? '°F' : '°C')}
      title={tr.unitToggle(isC ? '°F' : '°C')}
      style={{
        width, height, borderRadius: 999, position: 'relative', flexShrink: 0, padding: 0, cursor: 'pointer',
        background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <span aria-hidden style={{ ...label, left: 9 }}>°F</span>
      <span aria-hidden style={{ ...label, right: 9 }}>°C</span>
      <span
        aria-hidden
        style={{
          position: 'absolute', top: 2, left: isC ? width - knob - 4 : 2,
          width: knob, height: knob, borderRadius: 999,
          background: 'rgba(255,255,255,0.95)', color: '#0d2e44',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT, fontSize: 12, fontWeight: 700,
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          transition: 'left 250ms cubic-bezier(.4,1.2,.5,1)',
        }}
      >
        {isC ? '°C' : '°F'}
      </span>
    </button>
  )
}
