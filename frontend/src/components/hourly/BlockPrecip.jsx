import { GDrop } from '../icons/UIGlyphs'

// Chance of rain for a 2-hour block: "💧 40%", read out as "40% chance of precipitation".
// Older cached responses have no value: show nothing.
export default function BlockPrecip({ p, tr, size = 10.5 }) {
  if (!Number.isFinite(p)) return null
  return (
    <div
      title={`${p}% ${tr.precipChance}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 2,
        fontFamily: '"Geist", system-ui, sans-serif', fontSize: size, fontWeight: 600,
        color: '#CFE6FF', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
      }}
    >
      <GDrop size={size - 1} color="currentColor" />
      <span aria-hidden>{p}%</span>
      <span className="sr-only">{`${p}% ${tr.precipChance}`}</span>
    </div>
  )
}
