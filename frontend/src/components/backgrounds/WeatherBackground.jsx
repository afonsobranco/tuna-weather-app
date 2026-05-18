import { useMemo } from 'react'

const BASE = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
}

function GrainOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse at 20% 10%, rgba(140,100,40,0.15), transparent 55%), ' +
          'radial-gradient(ellipse at 80% 90%, rgba(120,80,30,0.15), transparent 60%)',
        mixBlendMode: 'overlay',
        opacity: 0.2,
      }}
    />
  )
}

function BgClearDay() {
  return (
    <div
      style={{
        ...BASE,
        background:
          'linear-gradient(180deg, #f5cf8c 0%, #f0b178 18%, #d9a18a 32%, #b29bb6 50%, #7b9ec9 70%, #4a7eb3 100%)',
      }}
    >
      {/* Sun halo */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          right: '15%',
          width: 140,
          height: 140,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,240,180,0.55) 0%, rgba(255,210,130,0.25) 40%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
      {/* Sun core */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '17%',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fff8e0 0%, #ffd060 55%, #f5a840 100%)',
          boxShadow: '0 0 40px rgba(255,200,80,0.6)',
        }}
      />
      {/* Mountain ridge */}
      <svg
        viewBox="0 0 400 160"
        style={{ position: 'absolute', bottom: '22%', width: '100%', opacity: 0.35 }}
        preserveAspectRatio="none"
      >
        <path
          d="M0 160 L0 90 L60 55 L120 85 L180 40 L240 70 L300 30 L360 65 L400 45 L400 160Z"
          fill="#3a5878"
        />
      </svg>
      {/* Foreground hill */}
      <svg
        viewBox="0 0 400 120"
        style={{ position: 'absolute', bottom: 0, width: '100%', opacity: 0.55 }}
        preserveAspectRatio="none"
      >
        <path
          d="M0 120 L0 80 Q100 30 200 60 Q300 90 400 50 L400 120Z"
          fill="#2e4a62"
        />
      </svg>
      <GrainOverlay />
    </div>
  )
}

function BgSunset() {
  return (
    <div
      style={{
        ...BASE,
        background:
          'linear-gradient(180deg, #1a1a44 0%, #4a2872 20%, #8a3a76 38%, #d35a5a 58%, #f08858 72%, #f5b574 86%, #d49a6a 100%)',
      }}
    >
      {/* Setting sun */}
      <div
        style={{
          position: 'absolute',
          bottom: '28%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fffbe0 0%, #ffcc60 45%, #f09040 100%)',
          boxShadow: '0 0 80px rgba(255,160,60,0.5)',
        }}
      />
      {/* Horizon line */}
      <div
        style={{
          position: 'absolute',
          bottom: '28%',
          left: 0,
          right: 0,
          height: 1,
          background: 'rgba(255,200,120,0.3)',
        }}
      />
      {/* Ridge left */}
      <svg
        viewBox="0 0 400 100"
        style={{ position: 'absolute', bottom: '28%', width: '100%', opacity: 0.5 }}
        preserveAspectRatio="none"
      >
        <path d="M0 100 L0 60 L80 30 L160 55 L220 20 L280 45 L340 25 L400 40 L400 100Z" fill="#1a1232" />
      </svg>
      {/* Cloud blurs */}
      {[
        { left: '5%', bottom: '38%', w: 200, opacity: 0.15 },
        { left: '45%', bottom: '42%', w: 160, opacity: 0.12 },
        { left: '70%', bottom: '35%', w: 120, opacity: 0.1 },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: c.left,
            bottom: c.bottom,
            width: c.w,
            height: 40,
            borderRadius: 999,
            background: 'rgba(255,180,100,0.4)',
            filter: 'blur(16px)',
            opacity: c.opacity,
          }}
        />
      ))}
      <GrainOverlay />
    </div>
  )
}

function BgRainy() {
  const drops = useMemo(() => {
    return Array.from({ length: 38 }, (_, i) => ({
      left: `${(i * 2.7) % 100}%`,
      delay: `${(i * 0.045) % 1.5}s`,
      dur: `${0.9 + (i % 8) * 0.1}s`,
      height: `${60 + (i % 5) * 12}px`,
      opacity: 0.4 + (i % 4) * 0.1,
    }))
  }, [])

  return (
    <div
      style={{
        ...BASE,
        background:
          'linear-gradient(180deg, #1d2735 0%, #2a3a4f 35%, #3d4f64 65%, #2f3e52 100%)',
      }}
    >
      {/* Cloud body */}
      <div
        style={{
          position: 'absolute',
          top: '-5%',
          left: '-10%',
          right: '-10%',
          height: '35%',
          background: 'rgba(40,55,75,0.8)',
          borderRadius: '0 0 50% 50%',
          filter: 'blur(20px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '2%',
          left: '-5%',
          right: '-5%',
          height: '25%',
          background: 'rgba(55,70,90,0.6)',
          borderRadius: '0 0 40% 40%',
          filter: 'blur(12px)',
        }}
      />
      {/* Raindrops */}
      {drops.map((d, i) => (
        <span
          key={i}
          className="raindrop"
          style={{
            left: d.left,
            top: -80,
            height: d.height,
            animationDelay: d.delay,
            animationDuration: d.dur,
            opacity: d.opacity,
          }}
        />
      ))}
      <GrainOverlay />
    </div>
  )
}

function BgClearNight() {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      left: `${(i * 1.28 + i * i * 0.013) % 100}%`,
      top: `${(i * 1.7 + i * 0.3) % 70}%`,
      size: 1 + (i % 3) * 0.7,
      delay: `${(i * 0.05) % 4.5}s`,
      dur: `${2 + (i % 5) * 0.5}s`,
    }))
  }, [])

  return (
    <div
      style={{
        ...BASE,
        background:
          'linear-gradient(180deg, #060a1c 0%, #0c1230 25%, #131a3d 55%, #1c2147 85%, #2a2f5a 100%)',
      }}
    >
      {/* Milky way */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '20%',
          width: '60%',
          height: '40%',
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(150,160,220,0.12) 0%, transparent 70%)',
          transform: 'rotate(-25deg)',
          filter: 'blur(4px)',
        }}
      />
      {/* Stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}
      {/* Moon */}
      <div
        style={{
          position: 'absolute',
          right: '12%',
          top: '14%',
          width: 52,
          height: 52,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 40% 40%, #f5f0e0 0%, #ede5c0 40%, #d4c890 100%)',
          boxShadow: '0 0 30px rgba(240,230,180,0.25)',
        }}
      >
        {/* Crescent shadow */}
        <div
          style={{
            position: 'absolute',
            top: '8%',
            right: '5%',
            width: '65%',
            height: '65%',
            borderRadius: '50%',
            background: 'rgba(10,18,50,0.45)',
          }}
        />
      </div>
      {/* Horizon glow */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '20%',
          background:
            'linear-gradient(0deg, rgba(30,40,90,0.6) 0%, transparent 100%)',
        }}
      />
      <GrainOverlay />
    </div>
  )
}

export default function WeatherBackground({ state }) {
  switch (state) {
    case 'sunset': return <BgSunset />
    case 'rainy': return <BgRainy />
    case 'clear-night': return <BgClearNight />
    default: return <BgClearDay />
  }
}
