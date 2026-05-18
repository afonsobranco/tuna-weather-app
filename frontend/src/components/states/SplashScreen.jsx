import { useId } from 'react'
import AppMark from '../primitives/AppMark'
import TunaFish from '../mascot/TunaFish'

function TunaSwimming({ size = 32, top = '50%', delay = 0, dur = 8, flip = false }) {
  const uid = useId().replace(/:/g, '')
  const kf = `swim_${uid}`
  return (
    <>
      <div style={{
        position: 'absolute', top, left: '-15%',
        animation: `${kf} ${dur}s ${delay}s linear infinite`,
        opacity: 0.65,
      }}>
        <TunaFish size={size} flip={flip} palette="pale" />
      </div>
      <style>{`
        @keyframes ${kf} {
          0%   { transform: translateX(-60px)  translateY(0); }
          50%  { transform: translateX(140px)  translateY(-10px); }
          100% { transform: translateX(130vw)  translateY(0); }
        }
      `}</style>
    </>
  )
}

export default function SplashScreen({ isDetecting = false, tr }) {
  const bubbles = Array.from({ length: 22 }, (_, i) => ({
    left: `${(i * 11.7) % 100}%`,
    top: `${(i * 17.3) % 90}%`,
    size: 2 + (i % 5) * 1.5,
    dur: 4 + (i % 4),
    delay: (i * 0.2) % 2,
  }))

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: 'linear-gradient(180deg, #06151c 0%, #0d2e44 40%, #1a4d72 75%, #2c7ba8 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Geist", system-ui, sans-serif',
    }}>
      {/* Light shafts */}
      <svg
        viewBox="0 0 300 600" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}
      >
        <defs>
          <linearGradient id="splashShaft" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="80,0 110,0 40,600 0,600" fill="url(#splashShaft)" />
        <polygon points="180,0 215,0 130,600 90,600" fill="url(#splashShaft)" />
        <polygon points="280,0 310,0 240,600 200,600" fill="url(#splashShaft)" />
      </svg>

      {/* Floating bubbles */}
      {bubbles.map((b, i) => (
        <span key={i} style={{
          position: 'absolute', left: b.left, top: b.top,
          width: b.size, height: b.size, borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          boxShadow: 'inset 0 0 2px rgba(255,255,255,0.5)',
          animation: `splashFloat ${b.dur}s ${b.delay}s ease-in-out infinite`,
        }} />
      ))}

      {/* Swimming tuna */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <TunaSwimming size={28} top="22%" delay={0}   dur={9} />
        <TunaSwimming size={20} top="68%" delay={2.5} dur={11} flip />
        <TunaSwimming size={36} top="82%" delay={5}   dur={8} />
      </div>

      {/* Logo + wordmark */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
      }}>
        <AppMark size={108} />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: '"Instrument Serif", serif', fontStyle: 'italic',
            color: '#fff', fontSize: 48, lineHeight: 1, letterSpacing: -0.6,
          }}>Tuna</div>
          <div style={{
            marginTop: 6, color: 'rgba(255,255,255,0.62)', fontSize: 10.5,
            letterSpacing: 3, textTransform: 'uppercase', fontWeight: 500,
          }}>Weather App</div>
        </div>
      </div>

      {/* Loading message */}
      {isDetecting && (
        <div style={{
          position: 'absolute', bottom: 96, color: 'rgba(255,255,255,0.55)',
          fontSize: 12, fontWeight: 500, letterSpacing: 0.3,
        }}>
          {tr?.autoDetect || 'Detecting location…'}
        </div>
      )}

      {/* Pulsing dots */}
      <div style={{
        position: 'absolute', bottom: 64, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 6,
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            animation: `splashPulse 1.2s ${i * 0.15}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}
