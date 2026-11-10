import { fetchJson, UA } from './http.js'

const WIKI = { en: 'https://en.wikipedia.org', pt: 'https://pt.wikipedia.org' }

export function clip(text, max) {
  const s = (text || '').replace(/\s+/g, ' ').trim()
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.–-]+$/, '')}…`
}

// Feeds for a date never change within a day; keep them on warm instances
const feedCache = new Map()

async function fetchEvents(base, mm, dd) {
  const key = `${base}/${mm}/${dd}`
  const hit = feedCache.get(key)
  if (hit && Date.now() - hit.ts < 12 * 3600 * 1000) return hit.events
  const json = await fetchJson(`${base}/api/rest_v1/feed/onthisday/events/${mm}/${dd}`,
    { headers: { 'User-Agent': UA }, timeout: 4000 })
  const events = json.events || []
  feedCache.set(key, { events, ts: Date.now() })
  return events
}

export async function getHistory({ month, day, city = '', country = '', lang = 'en' }) {
  const base = WIKI[lang] || WIKI.en
  const mm = String(month).padStart(2, '0'), dd = String(day).padStart(2, '0')
  let events = []
  try {
    events = await fetchEvents(base, mm, dd)
  } catch {
    return [] // best-effort: never let Wikipedia slow down or break a response
  }

  const cityL = city.toLowerCase(), countryL = country.toLowerCase()
  const relevance = (ev) => {
    const text = `${ev.text || ''} ${(ev.pages || []).map(p => p.titles?.normalized || '').join(' ')}`.toLowerCase()
    return (cityL && text.includes(cityL) ? 10 : 0) + (countryL && text.includes(countryL) ? 10 : 0)
  }
  const ranked = [...events].sort((a, b) => relevance(b) - relevance(a))

  return ranked.slice(0, 3).map(ev => {
    const page = ev.pages?.[0]
    return {
      year:  String(ev.year ?? ''),
      title: clip(ev.text, 140),
      body:  clip(page?.extract || '', 220),
      href:  page?.content_urls?.desktop?.page || null,
    }
  })
}
