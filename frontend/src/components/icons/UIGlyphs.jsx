export function GSearch({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="6" stroke={color} strokeWidth="1.6" />
      <path d="M14 14l4 4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function GLocate({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3" stroke={color} strokeWidth="1.6" />
      <path d="M10 1v3M10 16v3M1 10h3M16 10h3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function GSunrise({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path
        d="M3 14a7 7 0 0 1 14 0"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <line x1="10" y1="11" x2="10" y2="5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <polyline points="7,8 10,5 13,8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="3" y1="17" x2="17" y2="17" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function GSunset({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path
        d="M3 11a7 7 0 0 1 14 0"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <line x1="10" y1="5" x2="10" y2="11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <polyline points="7,8 10,11 13,8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="3" y1="17" x2="17" y2="17" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function GHourglass({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M4 2h8M4 14h8M5 2c0 3 3 4 3 6s-3 3-3 6M11 2c0 3-3 4-3 6s3 3 3 6"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GExternal({ size = 12, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path
        d="M7 2h3v3M10 2L5.5 6.5M5 3H2v7h7V7"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GLeaf({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path
        d="M2 12C2 12 3 7 7 5C11 3 12 2 12 2C12 2 12 5 10 8C8 11 5 12 2 12Z"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M2 12L7 7" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function GUV({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke={color} strokeWidth="1.3" />
      <path
        d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.8 2.8l1 1M10.2 10.2l1 1M2.8 11.2l1-1M10.2 3.8l1-1"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function GDrop({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path
        d="M7 2C7 2 3 6.5 3 9a4 4 0 0 0 8 0C11 6.5 7 2 7 2Z"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
