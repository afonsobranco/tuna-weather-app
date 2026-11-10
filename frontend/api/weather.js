/**
 * Tuna Weather App — Vercel Serverless Function (Node.js 18+, no dependencies).
 * All "now"/"today" logic uses the city's local clock as reported by Open-Meteo,
 * never the server's UTC clock.
 */
import { fetchJson, withTimeout, UA } from './_lib/http.js'
import { getHistory } from './_lib/history.js'

const NOMINATIM_URL   = 'https://nominatim.openstreetmap.org/search'
const OPEN_METEO_URL  = 'https://api.open-meteo.com/v1/forecast'
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const GEOCODE_URL     = 'https://geocoding-api.open-meteo.com/v1/search'

// ─── WMO weather code map ────────────────────────────────────────────────────
const WMO_MAP = {
  0: ['Clear Sky', 'sun'], 1: ['Mainly Clear', 'sun'], 2: ['Partly Cloudy', 'partly'],
  3: ['Overcast', 'cloud'], 45: ['Foggy', 'cloud'], 48: ['Icy Fog', 'cloud'],
  51: ['Light Drizzle', 'rain'], 53: ['Drizzle', 'rain'], 55: ['Heavy Drizzle', 'rain'],
  56: ['Freezing Drizzle', 'rain'], 57: ['Freezing Drizzle', 'rain'],
  61: ['Light Rain', 'rain'], 63: ['Rain', 'rain'], 65: ['Heavy Rain', 'rain'],
  66: ['Freezing Rain', 'rain'], 67: ['Freezing Rain', 'rain'],
  71: ['Light Snow', 'snow'], 73: ['Snow', 'snow'], 75: ['Heavy Snow', 'snow'],
  77: ['Snow Grains', 'snow'], 80: ['Rain Showers', 'rain'], 81: ['Rain Showers', 'rain'],
  82: ['Heavy Showers', 'rain'], 85: ['Snow Showers', 'snow'], 86: ['Heavy Snow Showers', 'snow'],
  95: ['Thunderstorm', 'storm'], 96: ['Thunderstorm', 'storm'], 99: ['Thunderstorm', 'storm'],
}

function wmoCondition(code) { return WMO_MAP[code] || ['Partly Cloudy', 'partly'] }

function wmoWeatherState(code, isNight) {
  if ([0, 1, 2].includes(code)) return isNight ? 'clear-night' : 'clear-day'
  if (code === 3 || (code >= 45 && code < 50)) return isNight ? 'clear-night' : 'sunset'
  if (code >= 51) return 'rainy'
  return 'clear-day'
}

function iconForForecast(code, isNight) {
  const [, base] = wmoCondition(code)
  if (base === 'sun')    return isNight ? 'moon'      : 'sun'
  if (base === 'partly') return isNight ? 'mooncloud' : 'partly'
  return base
}

// ─── UV / AQI helpers ────────────────────────────────────────────────────────
function uvLabel(val) {
  const v = Math.round(val)
  if (v <= 0)  return ['None',      'green']
  if (v <= 2)  return ['Low',       'green']
  if (v <= 5)  return ['Moderate',  'orange']
  if (v <= 7)  return ['High',      'orange']
  if (v <= 10) return ['Very High', 'red']
  return ['Extreme', 'red']
}

function aqiLabel(val) {
  const v = Math.round(val)
  if (v <= 20)  return ['Excellent', 'green']
  if (v <= 40)  return ['Good',      'green']
  if (v <= 80)  return ['Moderate',  'orange']
  if (v <= 120) return ['Unhealthy', 'red']
  return ['Hazardous', 'red']
}

// ─── Health score ─────────────────────────────────────────────────────────────
const HEALTH_TIPS_EN = {
  alertRed:      'Red weather warning in effect. Stay indoors and follow official advice.',
  alertOrange:   'Weather warning in effect. Avoid unnecessary trips outside.',
  storm:         'Thunderstorms around. Stay indoors and avoid open spaces.',
  snow:          'Snow and ice likely. Dress warmly and watch your footing.',
  rain:          'Wet day ahead. Take a rain jacket and plan indoor activities.',
  perfect:       'Perfect outdoor conditions. Great day for activities.',
  goodSunscreen: 'Good day outside. Apply sunscreen around midday.',
  good:          'Good conditions outside. Enjoy some fresh air.',
  aqiModerate:   'Moderate air quality. Sensitive groups should limit outdoor time.',
  uvHigh:        'High UV. Stay in the shade during midday hours.',
  ok:            'Acceptable conditions. Stay hydrated.',
  aqiPoor:       'Poor air quality. Wear an N95 if outdoors; open windows briefly.',
  challenging:   'Challenging conditions. Limit strenuous outdoor activity.',
  avoid:         'Avoid prolonged outdoor exposure today.',
}

const clamp100 = (v) => Math.max(0, Math.min(100, v))

function healthScore({ uv, aqi, humidity, wind, code, precip, isDay, alertLevel }) {
  const factors = [
    { key: 'uv',       weight: 25, score: clamp100(100 - uv * 9) },
    { key: 'aqi',      weight: 40, score: clamp100(100 - aqi * 0.6) },
    { key: 'humidity', weight: 20, score: clamp100(100 - (Math.abs(humidity - 57.5) / 57.5) * 80) },
    { key: 'wind',     weight: 15, score: clamp100(100 - (Math.abs(wind - 15) / 40) * 60) },
  ].map(f => ({ ...f, score: Math.round(f.score) }))
  const base = Math.round(factors.reduce((s, f) => s + f.score * f.weight / 100, 0))

  const [, kind] = wmoCondition(code)
  let weather = null, penalty = 0
  if (kind === 'storm')                                  { weather = 'storm'; penalty = 30 }
  else if (kind === 'snow')                              { weather = 'snow';  penalty = 20 }
  else if ([65, 67, 82].includes(code) || (kind === 'rain' && precip >= 80)) { weather = 'rain'; penalty = 20 }
  else if (kind === 'rain' || precip >= 60)              { weather = 'rain';  penalty = 10 }

  let score = Math.max(0, base - penalty)
  if (alertLevel === 'red')    score = Math.min(score, 30)
  if (alertLevel === 'orange') score = Math.min(score, 50)

  const [, aqiTone] = aqiLabel(aqi)
  const [, uvTone]  = uvLabel(uv)
  let tipKey
  if (alertLevel === 'red')          tipKey = 'alertRed'
  else if (alertLevel === 'orange')  tipKey = 'alertOrange'
  else if (weather)                  tipKey = weather
  else if (score >= 85)              tipKey = 'perfect'
  else if (score >= 70)              tipKey = isDay && uv >= 3 ? 'goodSunscreen' : 'good'
  else if (score >= 55) {
    if (aqiTone === 'red')                                tipKey = 'aqiModerate'
    else if (isDay && ['orange', 'red'].includes(uvTone)) tipKey = 'uvHigh'
    else                                                  tipKey = 'ok'
  }
  else if (score >= 40)              tipKey = aqiTone === 'red' ? 'aqiPoor' : 'challenging'
  else                               tipKey = 'avoid'

  return { score, tipKey, tip: HEALTH_TIPS_EN[tipKey], factors, penalty: base - score }
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────
function countryFlag(code) {
  if (!/^[A-Z]{2}$/.test(code || '')) return '🌍'
  return [...code].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')
}

function formatTime(iso) {
  const t = iso?.split('T')[1]
  return t ? t.slice(0, 5) : '—'
}

// Open-Meteo returns wall-clock strings ("2026-11-10T21:30") in the city's timezone.
// Parsing them all as UTC keeps differences between them correct.
function localMs(s) {
  return s ? Date.parse(`${s.length === 16 ? `${s}:00` : s}Z`) : NaN
}

function windDir(deg) {
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(deg / 45) % 8]
}

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
function dayLabel(dateStr, i) {
  if (i === 0) return 'Today'
  if (i === 1) return 'Tomorrow'
  return DAYS[new Date(`${dateStr}T12:00:00Z`).getUTCDay()]
}

function normalize(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

// ─── API calls ────────────────────────────────────────────────────────────────
// Names arrive in the app's languages ("Lisboa" vs "Lisbon"); searching only in English
// turns "Lisboa" into a village in Mozambique. Take each language's top hit and keep the
// larger city; on a tie the current language wins so the name matches what the user typed.
async function geocodeCity(city, lang) {
  const search = (l) =>
    fetchJson(`${GEOCODE_URL}?name=${encodeURIComponent(city)}&count=1&language=${l}&format=json`, { timeout: 6000 })
      .then(j => j.results?.[0]).catch(() => null)
  const order = lang === 'pt' ? ['pt', 'en'] : ['en', 'pt']
  const results = (await Promise.all(order.map(search))).filter(Boolean)
  if (results.length) {
    const r = results.reduce((best, x) => ((x.population || 0) > (best.population || 0) ? x : best))
    return { lat: r.latitude, lon: r.longitude, city: r.name, country: r.country || '', countryCode: (r.country_code || '').toUpperCase() }
  }
  const nom = await fetchJson(`${NOMINATIM_URL}?q=${encodeURIComponent(city)}&format=json&limit=1&addressdetails=1`,
    { headers: { 'User-Agent': UA }, timeout: 6000 })
  if (!nom.length) throw new Error(`City '${city}' not found.`)
  const r = nom[0], addr = r.address || {}
  return { lat: parseFloat(r.lat), lon: parseFloat(r.lon), city: addr.city || addr.town || addr.village || city, country: addr.country || '', countryCode: (addr.country_code || '').toUpperCase() }
}

function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,is_day',
    hourly: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max',
    timezone: 'auto', forecast_days: 7, wind_speed_unit: 'kmh',
  })
  return fetchJson(`${OPEN_METEO_URL}?${params}`, { timeout: 9000 })
}

function fetchAQI(lat, lon) {
  const params = new URLSearchParams({ latitude: lat, longitude: lon, current: 'european_aqi,us_aqi', timezone: 'auto' })
  return fetchJson(`${AIR_QUALITY_URL}?${params}`, { timeout: 9000 }).catch(() => ({}))
}

// ─── Weather alerts ───────────────────────────────────────────────────────────
const METEOALARM_URL = 'https://feeds.meteoalarm.org/api/v1/warnings/feeds-'
const NWS_ALERTS_URL = 'https://api.weather.gov/alerts/active'
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse'

const METEOALARM_FEEDS = {
  AT: 'austria', BA: 'bosnia-herzegovina', BE: 'belgium', BG: 'bulgaria', CH: 'switzerland',
  CY: 'cyprus', CZ: 'czechia', DE: 'germany', DK: 'denmark', EE: 'estonia', ES: 'spain',
  FI: 'finland', FR: 'france', GB: 'united-kingdom', GR: 'greece', HR: 'croatia', HU: 'hungary',
  IE: 'ireland', IL: 'israel', IS: 'iceland', IT: 'italy', LT: 'lithuania', LU: 'luxembourg',
  LV: 'latvia', MD: 'moldova', ME: 'montenegro', MK: 'republic-of-north-macedonia', MT: 'malta',
  NL: 'netherlands', NO: 'norway', PL: 'poland', PT: 'portugal', RO: 'romania', RS: 'serbia',
  SE: 'sweden', SI: 'slovenia', SK: 'slovakia', UA: 'ukraine',
}

const LEVEL_RANK = { yellow: 1, orange: 2, red: 3 }

// Feeds are country-wide and large; reuse them across requests on a warm instance
const feedCache = new Map()
async function fetchMeteoAlarmFeed(slug) {
  const hit = feedCache.get(slug)
  if (hit && Date.now() - hit.ts < 10 * 60 * 1000) return hit.warnings
  const json = await fetchJson(`${METEOALARM_URL}${slug}`, { headers: { 'User-Agent': UA }, timeout: 3500 })
  const warnings = json.warnings || []
  feedCache.set(slug, { warnings, ts: Date.now() })
  return warnings
}

// MeteoAlarm areas are named in the local language ("Lisboa"), so match against
// a reverse lookup without Accept-Language, which returns local names.
const areaCache = new Map()
async function localAreaNames(lat, lon) {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`
  if (areaCache.has(key)) return areaCache.get(key)
  const json = await fetchJson(`${NOMINATIM_REVERSE_URL}?lat=${lat}&lon=${lon}&format=json&zoom=10`,
    { headers: { 'User-Agent': UA }, timeout: 3000 })
  const addr = json.address || {}
  const names = ['city', 'town', 'village', 'municipality', 'county', 'state_district', 'state', 'region', 'province', 'island', 'archipelago']
    .map(k => normalize(addr[k]))
    .filter(n => n.length >= 3)
  areaCache.set(key, names)
  return names
}

function areaMatches(areaDesc, names) {
  const area = normalize(areaDesc)
  const head = normalize(areaDesc.split(' - ')[0])
  return names.some(n => n === area || n === head || area.includes(n) || n.includes(head))
}

async function fetchMeteoAlarmAlerts(countryCode, lat, lon, now) {
  const slug = METEOALARM_FEEDS[countryCode]
  if (!slug) return []
  const [warnings, names] = await Promise.all([fetchMeteoAlarmFeed(slug), localAreaNames(lat, lon)])
  if (!names.length) return []

  const byType = new Map()
  for (const w of warnings) {
    const infos = w.alert?.info || []
    const first = infos[0]
    if (!first || !(first.area || []).some(a => areaMatches(a.areaDesc, names))) continue
    if (new Date(first.expires) <= now) continue

    const param = (info, name) => (info.parameter || []).find(p => p.valueName === name)?.value || ''
    const level = param(first, 'awareness_level').split(';')[1]?.trim()
    if (!LEVEL_RANK[level]) continue
    const type = param(first, 'awareness_type').split(';')[1]?.trim() || first.event

    const text = {}
    for (const info of infos) {
      const l = (info.language || '').slice(0, 2)
      if (!text[l]) text[l] = { title: info.event, description: info.description || '' }
    }

    const alert = {
      level, type, text,
      onset: first.onset || first.effective, expires: first.expires,
      source: first.senderName || 'MeteoAlarm', url: first.web || 'https://meteoalarm.org',
    }
    const prev = byType.get(type)
    if (!prev || LEVEL_RANK[level] > LEVEL_RANK[prev.level] ||
        (LEVEL_RANK[level] === LEVEL_RANK[prev.level] && alert.onset < prev.onset)) {
      byType.set(type, alert)
    }
  }
  return [...byType.values()]
}

async function fetchNwsAlerts(lat, lon) {
  const json = await fetchJson(`${NWS_ALERTS_URL}?point=${lat.toFixed(4)},${lon.toFixed(4)}`,
    { headers: { 'User-Agent': UA, Accept: 'application/geo+json' }, timeout: 3500 })
  const levelFor = { Extreme: 'red', Severe: 'orange', Moderate: 'yellow', Minor: 'yellow' }
  return (json.features || [])
    .map(f => f.properties || {})
    .filter(p => levelFor[p.severity])
    .map(p => ({
      level: levelFor[p.severity], type: p.event,
      text: { en: { title: p.event, description: p.description || p.headline || '' } },
      onset: p.onset || p.effective, expires: p.ends || p.expires,
      source: p.senderName || 'National Weather Service', url: 'https://www.weather.gov',
    }))
}

async function fetchAlerts(countryCode, lat, lon, now) {
  try {
    const alerts = countryCode === 'US'
      ? await fetchNwsAlerts(lat, lon)
      : await fetchMeteoAlarmAlerts(countryCode, lat, lon, now)
    return alerts.sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level]).slice(0, 4)
  } catch {
    return [] // non-blocking — alerts must never break or slow the main response
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const params = new URL(req.url, 'http://x').searchParams
  const city = params.get('city')?.trim()
  if (!city) return res.status(400).json({ error: 'Missing city parameter' })
  const lang = params.get('lang') === 'pt' ? 'pt' : 'en'
  const hintLat = parseFloat(params.get('lat'))
  const hintLon = parseFloat(params.get('lon'))
  const hasHint = Number.isFinite(hintLat) && Number.isFinite(hintLon) &&
    Math.abs(hintLat) <= 90 && Math.abs(hintLon) <= 180

  try {
    const geo = hasHint
      ? { lat: hintLat, lon: hintLon, city, country: params.get('country') || '', countryCode: (params.get('cc') || '').toUpperCase() }
      : await geocodeCity(city, lang)
    const { lat, lon } = geo
    const now = new Date()

    const [weatherData, aqiData, alerts] = await Promise.all([
      fetchWeather(lat, lon),
      fetchAQI(lat, lon),
      withTimeout(fetchAlerts(geo.countryCode, lat, lon, now), 3500, []),
    ])

    const curr     = weatherData.current || {}
    const localNow = curr.time || ''
    const tempC    = curr.temperature_2m ?? 0
    const humidity = curr.relative_humidity_2m ?? 50
    const feels    = curr.apparent_temperature ?? tempC
    const wmoCode  = curr.weather_code ?? 0
    const windSpd  = curr.wind_speed_10m ?? 0
    const windDeg  = curr.wind_direction_10m ?? 0
    const uvCurr   = curr.uv_index ?? 0
    const isDay    = !!curr.is_day

    const [conditionLabel] = wmoCondition(wmoCode)
    const daily = weatherData.daily || {}
    const times = daily.time || []
    const hiArr = daily.temperature_2m_max || []
    const loArr = daily.temperature_2m_min || []
    const srArr = daily.sunrise || []
    const ssArr = daily.sunset || []
    const ppArr = daily.precipitation_probability_max || []
    const uvArr = daily.uv_index_max || []
    const dcArr = daily.weather_code || []

    const localDate = times[0] || localNow.slice(0, 10)
    const [mm, dd] = localDate.slice(5).split('-').map(Number)
    const historyPromise = getHistory({ month: mm, day: dd, city: geo.city, country: geo.country, lang })

    // Sun phase relative to the city's local now
    const nowMs = localMs(localNow), srMs = localMs(srArr[0]), ssMs = localMs(ssArr[0])
    let sun = null
    if ([nowMs, srMs, ssMs].every(Number.isFinite)) {
      if (nowMs < srMs) {
        sun = { phase: 'before', minutes: Math.round((srMs - nowMs) / 60000), progress: null }
      } else if (nowMs < ssMs) {
        sun = { phase: 'day', minutes: Math.round((ssMs - nowMs) / 60000), progress: (nowMs - srMs) / (ssMs - srMs) }
      } else {
        const nextSr = localMs(srArr[1])
        sun = { phase: 'after', minutes: Number.isFinite(nextSr) ? Math.round((nextSr - nowMs) / 60000) : null, progress: null }
      }
    }

    let weatherState = wmoWeatherState(wmoCode, !isDay)
    if (isDay && weatherState === 'clear-day' && sun?.phase === 'day' && sun.minutes < 120) weatherState = 'sunset'

    // A local hour is night if it falls outside that day's sunrise–sunset
    const isNightAt = (t) => {
      const di = times.indexOf(t.slice(0, 10))
      if (di < 0 || !srArr[di] || !ssArr[di]) { const h = Number(t.slice(11, 13)); return h < 6 || h >= 20 }
      return t < srArr[di] || t >= ssArr[di]
    }

    const hTemps = weatherData.hourly?.temperature_2m || []
    const hCodes = weatherData.hourly?.weather_code || []
    const hTimes = weatherData.hourly?.time || []
    const nowHour = localNow.slice(0, 13)
    const hourEntry = (idx) => ({
      time: hTimes[idx],
      tempC: Math.round(hTemps[idx]),
      icon: iconForForecast(hCodes[idx] ?? 0, isNightAt(hTimes[idx])),
    })

    // 5-day forecast (daytime icons) with each day's 2-hourly strip
    const forecast = []
    for (let i = 0; i < Math.min(5, times.length); i++) {
      const entries = []
      for (let idx = 0; idx < hTimes.length && idx < hTemps.length; idx++) {
        const t = hTimes[idx]
        if (!t.startsWith(times[i]) || Number(t.slice(11, 13)) % 2) continue
        const hour = Number(t.slice(11, 13)), nowH = Number(nowHour.slice(11, 13))
        entries.push({ ...hourEntry(idx), isNow: i === 0 && hour <= nowH && nowH < hour + 2 })
      }
      forecast.push({
        d: dayLabel(times[i], i),
        i: iconForForecast(dcArr[i] ?? 0, false),
        hi: Math.round(hiArr[i] ?? 0),
        lo: Math.round(loArr[i] ?? 0),
        p: Math.round(ppArr[i] ?? 0),
        hourly: entries.slice(0, 12),
      })
    }

    // Today's strip: next 24h from the current local hour
    let currIdx = hTimes.findIndex(t => t.slice(0, 13) >= nowHour)
    if (currIdx < 0) currIdx = 0
    const hourly = []
    for (let i = 0; i < 12; i++) {
      const idx = currIdx + i * 2
      if (idx >= hTemps.length) break
      hourly.push({ ...hourEntry(idx), isNow: i === 0 })
    }

    // AQI + UV
    const aqiCurr = aqiData.current || {}
    const aqiVal  = parseFloat(aqiCurr.european_aqi ?? aqiCurr.us_aqi ?? 0)
    const [aqiLbl, aqiTone] = aqiLabel(aqiVal)
    const uvDay = parseFloat(uvArr[0] ?? uvCurr)
    const [uvLbl, uvTone] = uvLabel(uvDay)

    const soon = now.getTime() + 12 * 3600 * 1000
    const worstAlert = alerts
      .filter(a => new Date(a.onset).getTime() <= soon)
      .reduce((worst, a) => (LEVEL_RANK[a.level] > (LEVEL_RANK[worst] || 0) ? a.level : worst), null)

    const health = healthScore({
      uv: isDay ? uvDay : uvCurr, aqi: aqiVal, humidity, wind: windSpd,
      code: wmoCode, precip: ppArr[0] ?? 0, isDay, alertLevel: worstAlert,
    })

    const history = await historyPromise

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json({
      city: geo.city, country: geo.country, countryCode: geo.countryCode, flag: countryFlag(geo.countryCode),
      lat, lon,
      tempC: Math.round(tempC * 10) / 10,
      hiC: Math.round(hiArr[0] ?? tempC),
      loC: Math.round(loArr[0] ?? tempC),
      feelsLikeC: Math.round(feels * 10) / 10,
      condition: conditionLabel, weatherCode: wmoCode, weatherState, isDay,
      windSpeed: Math.round(windSpd), windDir: windDir(windDeg),
      humidity: Math.round(humidity),
      sunrise: formatTime(srArr[0]), sunset: formatTime(ssArr[0]), sun,
      uv:     { value: Math.round(uvDay * 10) / 10, label: uvLbl, tone: uvTone },
      aqi:    { value: Math.round(aqiVal),           label: aqiLbl, tone: aqiTone },
      health,
      history, forecast, hourly, alerts,
      timezone: weatherData.timezone, localDate, localTime: localNow,
      fetchedAt: now.toISOString(),
    })
  } catch (err) {
    const notFound = err.message?.toLowerCase().includes('not found')
    res.status(notFound ? 404 : 500).json({ error: err.message || 'Weather service unavailable.' })
  }
}
