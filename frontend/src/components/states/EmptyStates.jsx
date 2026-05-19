import TunaFish from '../mascot/TunaFish'

const VARIANTS = {
  'no-cities': {
    bg: 'linear-gradient(180deg, #1a4d72 0%, #88b3d4 100%)',
    pose: 'normal',
    titleKey: 'noSavedCities',
    bodyKey: 'noSavedCitiesBody',
    ctaKey: 'addCity',
    defaultTitle: 'Your shoal is empty.',
    defaultBody: 'Save up to 8 cities to follow them at a glance.',
    defaultCta: 'Add a city',
  },
  'search-empty': {
    bg: 'linear-gradient(180deg, #0e1d33 0%, #243a55 100%)',
    pose: 'searching',
    titleKey: 'cityNotFound',
    bodyKey: 'cityNotFoundBody',
    ctaKey: null,
    defaultTitle: 'Nothing in these waters.',
    defaultBody: 'No city matched that name. Try a different spelling.',
  },
  'geo-denied': {
    bg: 'linear-gradient(180deg, #1a4d72 0%, #4a7fa8 100%)',
    pose: 'sad',
    titleKey: 'locationDenied',
    bodyKey: 'locationDeniedBody',
    ctaKey: 'enableLocation',
    defaultTitle: "You've hidden your location.",
    defaultBody: "Without it, Tuna can't show your local sky.",
    defaultCta: 'Open Settings',
  },
  offline: {
    bg: 'linear-gradient(180deg, #1d2735 0%, #3d4f64 100%)',
    pose: 'offline',
    titleKey: 'offline',
    bodyKey: 'offlineBody',
    ctaKey: 'retry',
    defaultTitle: 'We lost the current.',
    defaultBody: "Tuna can't reach the surface. Showing last cached reading.",
    defaultCta: 'Retry now',
  },
}

export default function EmptyState({ variant = 'search-empty', tr, onCta }) {
  const v = VARIANTS[variant] || VARIANTS['search-empty']

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: v.bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-start',
      fontFamily: '"Geist", system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Subtle scrim */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.12)',
        pointerEvents: 'none',
      }} />

      {/* Search bar placeholder */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', padding: '60px 18px 0',
      }}>
        <div style={{
          height: 46, borderRadius: 23,
          background: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', paddingLeft: 16,
          color: 'rgba(255,255,255,0.45)', fontSize: 15,
        }}>
          🔍 Search a city…
        </div>
      </div>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 2,
        marginTop: 60, maxWidth: 280,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 14, padding: '0 18px', textAlign: 'center',
      }}>
        {/* Mascot with fishBob animation */}
        <div style={{ animation: 'fishBob 3.6s ease-in-out infinite' }}>
          <TunaFish size={88} pose={v.pose} />
        </div>

        <div style={{
          fontFamily: '"Geist", system-ui, sans-serif', fontStyle: 'italic',
          color: '#fff', fontSize: 20, lineHeight: 1.2,
        }}>
          {tr?.[v.titleKey] || v.defaultTitle}
        </div>

        <div style={{
          color: 'rgba(255,255,255,0.7)', fontSize: 12.5, lineHeight: 1.5,
          maxWidth: 220,
        }}>
          {tr?.[v.bodyKey] || v.defaultBody}
        </div>

        {v.ctaKey && (
          <button
            onClick={onCta}
            style={{
              marginTop: 6, padding: '10px 18px', borderRadius: 9999,
              background: 'rgba(255,255,255,0.92)',
              color: '#0d2e44', fontWeight: 600, fontSize: 14,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              minHeight: 44,
            }}
          >
            {tr?.[v.ctaKey] || v.defaultCta}
          </button>
        )}
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 32, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        <TunaFish size={40} />
        <div style={{
          fontFamily: '"Geist", system-ui, sans-serif', fontStyle: 'italic',
          color: 'rgba(255,255,255,0.55)', fontSize: 14,
        }}>
          {tr?.madeWith || 'made with cold currents.'}
        </div>
      </div>
    </div>
  )
}
