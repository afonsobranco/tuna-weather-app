import { useState, useEffect } from 'react'

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'

export function useGeolocation() {
  const [place, setPlace] = useState(null)
  const [status, setStatus] = useState('idle') // idle | detecting | success | denied | error

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }
    setStatus('detecting')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const resp = await fetch(`${NOMINATIM}?lat=${coords.latitude}&lon=${coords.longitude}&format=json`)
          const addr = (await resp.json()).address || {}
          setPlace({
            name: addr.city || addr.town || addr.village || addr.county || 'Lisbon',
            lat: coords.latitude, lon: coords.longitude,
            country: addr.country || '', cc: (addr.country_code || '').toUpperCase(),
          })
          setStatus('success')
        } catch {
          setStatus('error')
        }
      },
      (err) => setStatus(err.code === 1 ? 'denied' : 'error'),
      { timeout: 4000, maximumAge: 300000 }
    )
  }, [])

  return { place, status }
}
