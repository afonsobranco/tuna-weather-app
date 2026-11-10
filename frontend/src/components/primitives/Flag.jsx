let emojiFlagsSupported

// Windows draws flag emoji as plain letters ("PT"); detect that once by checking
// whether a rendered flag contains any coloured pixels.
function canRenderFlagEmoji() {
  if (emojiFlagsSupported !== undefined) return emojiFlagsSupported
  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 20
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.font = '16px sans-serif'
    ctx.textBaseline = 'top'
    ctx.fillText('\u{1F1F5}\u{1F1F9}', 0, 0)
    const px = ctx.getImageData(0, 0, 20, 20).data
    emojiFlagsSupported = false
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] && (Math.abs(px[i] - px[i + 1]) > 40 || Math.abs(px[i + 1] - px[i + 2]) > 40)) {
        emojiFlagsSupported = true
        break
      }
    }
  } catch {
    emojiFlagsSupported = true
  }
  return emojiFlagsSupported
}

export default function Flag({ cc, size = 14, label }) {
  const code = (cc || '').toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return <span aria-hidden style={{ fontSize: size, lineHeight: 1 }}>🌍</span>

  if (canRenderFlagEmoji()) {
    const emoji = [...code].map((c) => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')
    return (
      <span role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
        style={{ fontSize: size, lineHeight: 1 }}>
        {emoji}
      </span>
    )
  }
  return (
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={label || ''}
      width={Math.round(size * 1.4)}
      height={size}
      style={{ borderRadius: 2, objectFit: 'cover', verticalAlign: '-2px', display: 'inline-block' }}
    />
  )
}
