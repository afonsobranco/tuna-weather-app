// A place is { name, lat, lon, country, cc }. Old saved entries may only have a name
// until they are opened once and resolved by the API.
export const DEFAULT_PLACE = { name: 'Lisbon', names: { en: 'Lisbon', pt: 'Lisboa' }, lat: 38.7251, lon: -9.1498, country: 'Portugal', cc: 'PT' }

export const SEED_PLACES = {
  Lisbon:      DEFAULT_PLACE,
  London:      { name: 'London', names: { en: 'London', pt: 'Londres' }, lat: 51.5085, lon: -0.1257, country: 'United Kingdom', cc: 'GB' },
  'Reykjavík': { name: 'Reykjavík', names: { en: 'Reykjavik', pt: 'Reiquiavique' }, lat: 64.1355, lon: -21.8954, country: 'Iceland', cc: 'IS' },
  Tokyo:       { name: 'Tokyo', names: { en: 'Tokyo', pt: 'Tóquio' }, lat: 35.6895, lon: 139.6917, country: 'Japan', cc: 'JP' },
}

// A place's name in the given language, if we've seen it in that language
export function displayName(place, lang) {
  return place?.names?.[lang] || place?.name || ''
}

// A place's region (state/province) in the given language, if we've seen it in that language
export function displayRegion(place, lang) {
  return place?.regions?.[lang] || place?.region || ''
}

const fold = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// Federal countries where the same city name often exists in several states
// (Paris TX, Portland ME/OR, Honolulu NC/HI)
const REGION_COUNTRIES = new Set(['US', 'CA', 'AU', 'BR', 'MX', 'IN', 'DE', 'AR', 'RU', 'CN'])

// Region worth showing next to a name: only where it disambiguates, and not when it just
// repeats the city ("New York, New York")
export function regionLabel(name, region, cc) {
  if (!region || !REGION_COUNTRIES.has((cc || '').toUpperCase())) return ''
  return fold(region).includes(fold(name)) ? '' : region
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
  return {
    name: data.city, names: data.lang ? { [data.lang]: data.city } : undefined,
    regions: data.lang && data.region ? { [data.lang]: data.region } : undefined,
    lat: data.lat, lon: data.lon, region: data.region || '', country: data.country, cc: data.countryCode || '',
  }
}

// Name and region of a saved place in another language, looked up by name and matched by
// coordinates (so "Charlotte" in Portuguese comes back in "Carolina do Norte")
export async function localizePlace(place, lang) {
  try {
    const r = await fetch(`${GEO_URL}?name=${encodeURIComponent(place.name)}&count=10&language=${lang}&format=json`)
    const hit = ((await r.json()).results || []).find((h) => samePlace(place, { lat: h.latitude, lon: h.longitude }))
    return hit ? { name: hit.name, region: hit.admin1 || '' } : null
  } catch { return null }
}

export function placeFromSuggestion(s) {
  return { name: s.name, lat: s.latitude, lon: s.longitude, region: s.admin1 || '', country: s.country || '', cc: (s.country_code || '').toUpperCase() }
}

export function toPlace(value) {
  if (!value) return null
  if (typeof value === 'string') return SEED_PLACES[value] || { name: value }
  return value
}
