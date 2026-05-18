import { useState, useEffect } from 'react'

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'

export function useGeolocation() {
  const [city, setCity] = useState(null)
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
          const resp = await fetch(
            `${NOMINATIM}?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { 'User-Agent': 'TunaWeatherApp/1.0' } }
          )
          const data = await resp.json()
          const addr = data.address || {}
          const name = addr.city || addr.town || addr.village || addr.county || 'Lisbon'
          setCity(name)
          setStatus('success')
        } catch {
          setCity('Lisbon')
          setStatus('error')
        }
      },
      (err) => {
        if (err.code === 1) setStatus('denied')
        else setStatus('error')
        setCity('Lisbon') // fallback
      },
      { timeout: 8000, maximumAge: 300000 }
    )
  }, [])

  return { city, status }
}
