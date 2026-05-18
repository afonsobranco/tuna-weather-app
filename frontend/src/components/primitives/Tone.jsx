import { toneColors } from '../../utils/weatherUtils'

export default function Tone({ tone, children }) {
  const t = toneColors(tone)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px 3px 8px',
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        fontWeight: 600,
        fontSize: 11.5,
        letterSpacing: 0.2,
        textTransform: 'uppercase',
        fontFamily: '"Geist", system-ui, sans-serif',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: t.dot,
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  )
}
