export default function AppMark({ size = 128, radius }) {
  const r = radius ?? size * 0.225
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        background:
          'linear-gradient(160deg, #6ED3E8 0%, #2E8FCC 35%, #1A4E8A 70%, #0B1E3B 100%)',
        boxShadow: `0 ${size * 0.06}px ${size * 0.18}px rgba(10,30,60,0.45), inset 0 1px 0 rgba(255,255,255,0.35)`,
      }}
    >
      {/* sun glint */}
      <div
        style={{
          position: 'absolute',
          right: '-10%',
          top: '-10%',
          width: '45%',
          height: '45%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 35% 35%, rgba(255,240,180,0.55), rgba(255,200,120,0.18) 60%, transparent 100%)',
          filter: 'blur(3px)',
        }}
      />
      {/* light shafts */}
      <svg
        viewBox="0 0 100 100"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.35,
        }}
      >
        <defs>
          <linearGradient id="amShaft" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="20,0 30,0 14,100 0,100" fill="url(#amShaft)" />
        <polygon points="60,0 72,0 50,100 38,100" fill="url(#amShaft)" />
        <polygon points="92,0 100,0 100,80 80,100" fill="url(#amShaft)" />
      </svg>
      {/* tuna body */}
      <svg
        viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="amBody" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#F5F8FB" />
            <stop offset="0.45" stopColor="#C8D6E2" />
            <stop offset="0.55" stopColor="#5F7A92" />
            <stop offset="1" stopColor="#243A55" />
          </linearGradient>
          <linearGradient id="amBack" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1B3556" />
            <stop offset="1" stopColor="#3A5C82" />
          </linearGradient>
        </defs>
        <path
          d="M 8 56 C 14 36, 38 30, 58 36 C 70 39, 80 45, 88 50 C 88 50, 92 52, 90 55 C 85 60, 78 64, 70 67 C 55 72, 28 72, 14 64 C 10 62, 6 60, 8 56 Z"
          fill="url(#amBody)"
        />
        <path
          d="M 12 54 C 18 40, 38 36, 58 41 C 72 44, 82 48, 88 51 C 80 47, 68 44, 56 43 C 38 41, 22 46, 14 56 Z"
          fill="url(#amBack)"
        />
        <path d="M 28 38 L 32 30 L 34 38 Z" fill="#1B3556" />
        <path d="M 36 36 L 39 31 L 41 37 Z" fill="#1B3556" />
        <path d="M 43 35 L 46 31 L 48 36 Z" fill="#1B3556" />
        <path d="M 55 41 l 2 -2 l 1 2 z" fill="#FFD45A" />
        <path d="M 60 42 l 2 -2 l 1 2 z" fill="#FFD45A" />
        <path d="M 65 43 l 2 -2 l 1 2 z" fill="#FFD45A" />
        <path d="M 55 67 l 2 2 l 1 -2 z" fill="#FFD45A" />
        <path d="M 60 68 l 2 2 l 1 -2 z" fill="#FFD45A" />
        <path d="M 65 67 l 2 2 l 1 -2 z" fill="#FFD45A" />
        <path
          d="M 86 50 C 92 42, 96 38, 98 36 C 98 42, 96 48, 94 52 C 96 56, 98 62, 98 68 C 96 66, 92 62, 86 56 Z"
          fill="url(#amBack)"
        />
        <path
          d="M 40 56 C 36 64, 32 70, 28 72 C 30 66, 33 60, 36 56 Z"
          fill="#1B3556"
          opacity="0.85"
        />
        <circle cx="20" cy="51" r="2.4" fill="#0B1E3B" />
        <circle cx="19.3" cy="50.3" r="0.8" fill="#fff" opacity="0.9" />
        <path
          d="M 28 47 C 27 52, 27 58, 29 62"
          stroke="#1B3556"
          strokeWidth="0.7"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M 22 62 C 36 68, 56 68, 72 64"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.8"
          fill="none"
        />
      </svg>
    </div>
  )
}
