// A place is { name, lat, lon, country, cc }. Old saved entries may only have a name
// until they are opened once and resolved by the API.
export const DEFAULT_PLACE = { name: 'Lisbon', lat: 38.7251, lon: -9.1498, country: 'Portugal', cc: 'PT' }

export const SEED_PLACES = {
  Lisbon:      DEFAULT_PLACE,
  London:      { name: 'London', lat: 51.5085, lon: -0.1257, country: 'United Kingdom', cc: 'GB' },
  'Reykjavík': { name: 'Reykjavík', lat: 64.1355, lon: -21.8954, country: 'Iceland', cc: 'IS' },
  Tokyo:       { name: 'Tokyo', lat: 35.6895, lon: 139.6917, country: 'Japan', cc: 'JP' },
}

export const hasCoords = (p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lon)

export function placeKey(p) {
  if (!p) return ''
  return hasCoords(p) ? `${p.lat.toFixed(2)},${p.lon.toFixed(2)}` : `name:${p.name.trim().toLowerCase()}`
}

export function samePlace(a, b) {
  if (!a || !b) return false
  if (hasCoords(a) && hasCoords(b)) return Math.abs(a.lat - b.lat) < 0.05 && Math.abs(a.lon - b.lon) < 0.05
  if (hasCoords(a) || hasCoords(b)) return false
  return a.name.trim().toLowerCase() === b.name.trim().toLowerCase()
}

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'

// Same rule as the API: each language's top hit, keep the larger city
export async function resolvePlaceName(name) {
  const search = (lang) => fetch(`${GEO_URL}?name=${encodeURIComponent(name)}&count=1&language=${lang}&format=json`)
    .then((r) => r.json()).then((j) => j.results?.[0]).catch(() => null)
  const hits = (await Promise.all([search('en'), search('pt')])).filter(Boolean)
  if (!hits.length) return null
  const best = hits.reduce((a, b) => ((b.population || 0) > (a.population || 0) ? b : a))
  return { ...placeFromSuggestion(best), name }
}

export function placeFromData(data) {
  return { name: data.city, lat: data.lat, lon: data.lon, country: data.country, cc: data.countryCode || '' }
}

export function placeFromSuggestion(s) {
  return { name: s.name, lat: s.latitude, lon: s.longitude, country: s.country || '', cc: (s.country_code || '').toUpperCase() }
}

export function toPlace(value) {
  if (!value) return null
  if (typeof value === 'string') return SEED_PLACES[value] || { name: value }
  return value
}
