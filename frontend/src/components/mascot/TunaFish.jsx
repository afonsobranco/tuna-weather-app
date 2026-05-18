import { useId } from 'react'

const PALETTES = {
  default: {
    body: ['#F5F8FB', '#C8D6E2', '#5F7A92', '#243A55'],
    back: ['#1B3556', '#3A5C82'],
    stripe: '#1B3556',
    finlet: '#FFD45A',
    eye: '#0B1E3B',
  },
  silver: {
    body: ['#F8FAFC', '#D6DFE8', '#7A8EA3', '#3A4E66'],
    back: ['#26405F', '#46688F'],
    stripe: '#26405F',
    finlet: '#FFD45A',
    eye: '#0B1E3B',
  },
  pale: {
    body: ['#FFFFFF', '#E4ECF2', '#9CB3C6', '#6A85A0'],
    back: ['#5A7894', '#86A5C2'],
    stripe: '#5A7894',
    finlet: '#FFE08A',
    eye: '#243A55',
  },
}

export default function TunaFish({
  size = 64,
  flip = false,
  pose = 'normal',
  palette = 'default',
  style = {},
}) {
  const id = useId().replace(/:/g, '')
  const p = PALETTES[palette] || PALETTES.default

  const bodyGradId = `tunaBody_${id}`
  const backGradId = `tunaBack_${id}`

  const transform = flip ? 'scaleX(-1)' : undefined

  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox="0 0 100 55"
      fill="none"
      style={{ transform, ...style }}
    >
      <defs>
        <linearGradient id={bodyGradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.body[0]} />
          <stop offset="0.45" stopColor={p.body[1]} />
          <stop offset="0.55" stopColor={p.body[2]} />
          <stop offset="1" stopColor={p.body[3]} />
        </linearGradient>
        <linearGradient id={backGradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.back[0]} />
          <stop offset="1" stopColor={p.back[1]} />
        </linearGradient>
      </defs>

      {/* Main body */}
      <path
        d="M 8 28 C 14 18, 38 15, 58 18 C 70 20, 80 23, 88 25 C 88 25, 92 26, 90 28 C 85 30, 78 32, 70 34 C 55 36, 28 36, 14 32 C 10 31, 6 30, 8 28 Z"
        fill={`url(#${bodyGradId})`}
      />
      {/* Back/dorsal shading */}
      <path
        d="M 12 27 C 18 20, 38 18, 58 21 C 72 22, 82 24, 88 26 C 80 24, 68 22, 56 22 C 38 21, 22 23, 14 28 Z"
        fill={`url(#${backGradId})`}
      />
      {/* Dorsal fins */}
      <path d="M 28 19 L 32 15 L 34 19 Z" fill={p.stripe} />
      <path d="M 36 18 L 39 15 L 41 18 Z" fill={p.stripe} />
      <path d="M 43 17 L 46 15 L 48 18 Z" fill={p.stripe} />

      {/* Upper finlets */}
      <path d="M 55 20 l 2 -2 l 1 2 z" fill={p.finlet} />
      <path d="M 60 21 l 2 -2 l 1 2 z" fill={p.finlet} />
      <path d="M 65 22 l 2 -2 l 1 2 z" fill={p.finlet} />
      {/* Lower finlets */}
      <path d="M 55 34 l 2 2 l 1 -2 z" fill={p.finlet} />
      <path d="M 60 34 l 2 2 l 1 -2 z" fill={p.finlet} />
      <path d="M 65 34 l 2 2 l 1 -2 z" fill={p.finlet} />

      {/* Tail fin */}
      <path
        d="M 86 25 C 92 21, 96 19, 98 18 C 98 21, 96 24, 94 26 C 96 28, 98 31, 98 34 C 96 33, 92 31, 86 28 Z"
        fill={`url(#${backGradId})`}
      />

      {/* Pectoral fin */}
      <path
        d="M 40 28 C 36 32, 32 35, 28 36 C 30 33, 33 30, 36 28 Z"
        fill={p.stripe}
        opacity="0.85"
      />

      {/* Eye */}
      <circle cx="20" cy="25" r="2.4" fill={p.eye} />
      <circle cx="19.3" cy="24.3" r="0.8" fill="#fff" opacity="0.9" />

      {/* Gill line */}
      <path
        d="M 28 24 C 27 26, 27 29, 29 31"
        stroke={p.stripe}
        strokeWidth="0.7"
        fill="none"
        opacity="0.6"
      />

      {/* Lateral line */}
      <path
        d="M 22 31 C 36 34, 56 34, 72 32"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.8"
        fill="none"
      />

      {/* Pose-specific additions */}
      {pose === 'sad' && (
        <>
          {/* Teardrop */}
          <ellipse cx="22" cy="30" rx="1.5" ry="2.5" fill="rgba(100,180,255,0.7)" />
          {/* Sad mouth curve */}
          <path d="M 14 28 C 15 27, 17 27, 18 28" stroke={p.stripe} strokeWidth="0.8" fill="none" />
        </>
      )}
      {pose === 'sleeping' && (
        <>
          {/* Z's */}
          <text x="28" y="12" fontSize="6" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif">z</text>
          <text x="33" y="8" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="sans-serif">Z</text>
          <text x="40" y="5" fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="sans-serif">Z</text>
          {/* Closed eye */}
          <path d="M 18.5 25 C 19 24, 21 24, 21.5 25" stroke={p.eye} strokeWidth="1" fill="none" />
        </>
      )}
      {pose === 'offline' && (
        <>
          {/* Wifi arcs with X */}
          <path d="M 30 12 Q 35 8 40 12" stroke="rgba(255,100,100,0.8)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 28 15 Q 35 9 42 15" stroke="rgba(255,100,100,0.6)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="35" cy="18" r="2" fill="rgba(255,100,100,0.8)" />
          <line x1="33" y1="10" x2="37" y2="14" stroke="rgba(255,100,100,1)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="37" y1="10" x2="33" y2="14" stroke="rgba(255,100,100,1)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {pose === 'searching' && (
        <>
          {/* Magnifying glass */}
          <circle cx="38" cy="10" r="5" stroke="rgba(255,220,100,0.9)" strokeWidth="1.5" fill="none" />
          <line x1="42" y1="14" x2="46" y2="18" stroke="rgba(255,220,100,0.9)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}
