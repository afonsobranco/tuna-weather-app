export function IconSun({ size = 28, color = '#FFD18A', glow = true }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {glow && <circle cx="16" cy="16" r="12" fill={color} opacity="0.18" />}
      {rays.map((angle) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 16 + Math.cos(rad) * 9.5
        const y1 = 16 + Math.sin(rad) * 9.5
        const x2 = 16 + Math.cos(rad) * 13
        const y2 = 16 + Math.sin(rad) * 13
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )
      })}
      <circle cx="16" cy="16" r="6.2" fill={color} />
    </svg>
  )
}

export function IconCloud({ size = 28, color = '#E8ECF4' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M9 22h15.5a4.5 4.5 0 0 0 .9-8.9 6.5 6.5 0 0 0-12.7-1.5A5 5 0 0 0 9 22z"
        fill={color}
      />
    </svg>
  )
}

export function IconPartlyCloudy({ size = 28 }) {
  const sunColor = '#FFD18A'
  const rays = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {rays.map((angle) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 11 + Math.cos(rad) * 7.5
        const y1 = 11 + Math.sin(rad) * 7.5
        const x2 = 11 + Math.cos(rad) * 10
        const y2 = 11 + Math.sin(rad) * 10
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={sunColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        )
      })}
      <circle cx="11" cy="11" r="5" fill={sunColor} />
      <path
        d="M11 24h14a4 4 0 0 0 .8-7.9 5.8 5.8 0 0 0-11.3-1.3A4.5 4.5 0 0 0 11 24z"
        fill="#E8ECF4"
      />
    </svg>
  )
}

export function IconRain({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M8 20h16.5a4.5 4.5 0 0 0 .9-8.9 6.5 6.5 0 0 0-12.7-1.5A5 5 0 0 0 8 20z"
        fill="#C8D4E8"
      />
      <line x1="11" y1="23" x2="9" y2="28" stroke="#7EB3E8" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="15" y1="23" x2="13" y2="28" stroke="#7EB3E8" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="19" y1="23" x2="17" y2="28" stroke="#7EB3E8" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="23" y1="23" x2="21" y2="28" stroke="#7EB3E8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconStorm({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M8 18h16.5a4.5 4.5 0 0 0 .9-8.9 6.5 6.5 0 0 0-12.7-1.5A5 5 0 0 0 8 18z"
        fill="#8A9DC0"
      />
      <path
        d="M15 19l-3 6h4l-2 5 6-7h-4l3-4z"
        fill="#FFCB45"
        stroke="#E8A020"
        strokeWidth="0.5"
      />
    </svg>
  )
}

export function IconMoon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M22 19a8 8 0 0 1-10.5-10.5A9 9 0 1 0 22 19z"
        fill="#EDE5C8"
      />
    </svg>
  )
}

export function IconMoonCloud({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M18 14a5 5 0 0 1-6.5-6.5A6 6 0 1 0 18 14z"
        fill="#EDE5C8"
      />
      <path
        d="M10 24h14a3.5 3.5 0 0 0 .7-6.9 5 5 0 0 0-9.8-1A4 4 0 0 0 10 24z"
        fill="#C8D4E8"
      />
    </svg>
  )
}

export function ForecastIcon({ kind, size = 30 }) {
  switch (kind) {
    case 'sun': return <IconSun size={size} />
    case 'partly': return <IconPartlyCloudy size={size} />
    case 'cloud': return <IconCloud size={size} />
    case 'rain': return <IconRain size={size} />
    case 'storm': return <IconStorm size={size} />
    case 'moon': return <IconMoon size={size} />
    case 'mooncloud': return <IconMoonCloud size={size} />
    default: return <IconPartlyCloudy size={size} />
  }
}
