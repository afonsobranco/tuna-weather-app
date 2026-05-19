/**
 * Tuna Weather App — Vercel Serverless Function (Node.js)
 * Node 18+ runtime: built-in fetch, no dependencies needed.
 * Cold start: ~50ms vs ~25s for Python runtime.
 */

// ─── External API URLs ───────────────────────────────────────────────────────
const NOMINATIM_URL   = 'https://nominatim.openstreetmap.org/search'
const OPEN_METEO_URL  = 'https://api.open-meteo.com/v1/forecast'
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const GEOCODE_URL     = 'https://geocoding-api.open-meteo.com/v1/search'
const WIKIMEDIA_URL   = 'https://en.wikipedia.org/api/rest_v1/feed/onthisday/events'

const UA = 'TunaWeatherApp/1.0 (github.com/afonsobranco/tuna-weather-app)'

// ─── WMO weather code map ────────────────────────────────────────────────────
const WMO_MAP = {
  0: ['Clear Sky', 'sun'], 1: ['Mainly Clear', 'sun'], 2: ['Partly Cloudy', 'partly'],
  3: ['Overcast', 'cloud'], 45: ['Foggy', 'cloud'], 48: ['Icy Fog', 'cloud'],
  51: ['Light Drizzle', 'rain'], 53: ['Drizzle', 'rain'], 55: ['Heavy Drizzle', 'rain'],
  56: ['Freezing Drizzle', 'rain'], 57: ['Freezing Drizzle', 'rain'],
  61: ['Light Rain', 'rain'], 63: ['Rain', 'rain'], 65: ['Heavy Rain', 'rain'],
  66: ['Freezing Rain', 'rain'], 67: ['Freezing Rain', 'rain'],
  71: ['Light Snow', 'cloud'], 73: ['Snow', 'cloud'], 75: ['Heavy Snow', 'cloud'],
  77: ['Snow Grains', 'cloud'], 80: ['Rain Showers', 'rain'], 81: ['Rain Showers', 'rain'],
  82: ['Heavy Showers', 'rain'], 85: ['Snow Showers', 'cloud'], 86: ['Heavy Snow Showers', 'cloud'],
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
function healthScore(uv, aqi, humidity, wind) {
  const uvS   = Math.max(0, 100 - uv * 9)
  const aqiS  = Math.max(0, 100 - aqi * 0.6)
  const humS  = Math.max(0, 100 - (Math.abs(humidity - 57.5) / 57.5) * 80)
  const windS = Math.max(0, 100 - (Math.abs(wind - 15) / 40) * 60)
  const score = Math.round(uvS * 0.25 + aqiS * 0.40 + humS * 0.20 + windS * 0.15)

  const [, aqiTone] = aqiLabel(aqi)
  const [, uvTone]  = uvLabel(uv)
  let tip
  if (score >= 85)      tip = 'Perfect outdoor conditions. Great day for activities.'
  else if (score >= 70) tip = 'Good day outside. Apply sunscreen if UV is elevated.'
  else if (score >= 55) {
    if (aqiTone === 'red')                 tip = 'Moderate air quality — sensitive groups should limit outdoor time.'
    else if (['orange','red'].includes(uvTone)) tip = 'High UV — stay in the shade during midday hours.'
    else                                   tip = 'Acceptable conditions. Stay hydrated.'
  } else if (score >= 40) {
    tip = aqiTone === 'red'
      ? 'Poor air quality. Wear an N95 if outdoors; open windows briefly.'
      : 'Challenging conditions. Limit strenuous outdoor activity.'
  } else {
    tip = 'Avoid prolonged outdoor exposure today. Check air quality alerts.'
  }
  return { score, tip }
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────
function countryFlag(code) {
  try { return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E0 + c.charCodeAt(0) - 65)).join('') }
  catch { return '🌍' }
}

function formatTime(iso) {
  if (!iso) return '—'
  const t = iso.split('T')[1]
  return t ? t.slice(0, 5) : '—'
}

function daylightRemaining(sunriseIso, sunsetIso) {
  try {
    const sr = new Date(sunriseIso), ss = new Date(sunsetIso)
    const mins = Math.max(0, Math.round((ss - sr) / 60000))
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  } catch { return '—' }
}

function windDir(deg) {
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(deg / 45) % 8]
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
function dayLabel(dateStr, i) {
  if (i === 0) return 'Today'
  if (i === 1) return 'Tomorrow'
  try { return DAYS[new Date(dateStr).getDay() === 0 ? 6 : new Date(dateStr).getDay() - 1] }
  catch { return DAYS[i % 7] }
}

// ─── Fetch with timeout ───────────────────────────────────────────────────────
async function fetchWithTimeout(url, opts = {}, ms = 8000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal })
    clearTimeout(timer)
    return res
  } catch (e) {
    clearTimeout(timer)
    throw e
  }
}

// ─── API calls ────────────────────────────────────────────────────────────────
async function geocodeCity(city) {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  const res = await fetchWithTimeout(url, {}, 6000)
  const json = await res.json()
  const results = json.results || []
  if (results.length) {
    const r = results[0]
    return { lat: r.latitude, lon: r.longitude, city: r.name, country: r.country || '', countryCode: (r.country_code || '').toUpperCase() }
  }
  // Nominatim fallback
  const url2 = `${NOMINATIM_URL}?q=${encodeURIComponent(city)}&format=json&limit=1&addressdetails=1`
  const res2 = await fetchWithTimeout(url2, { headers: { 'User-Agent': UA } }, 6000)
  const nom = await res2.json()
  if (!nom.length) throw new Error(`City '${city}' not found.`)
  const r = nom[0], addr = r.address || {}
  return { lat: parseFloat(r.lat), lon: parseFloat(r.lon), city: addr.city || addr.town || addr.village || city, country: addr.country || '', countryCode: (addr.country_code || '').toUpperCase() }
}

async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,is_day',
    hourly: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max',
    timezone: 'auto', forecast_days: 7, wind_speed_unit: 'kmh',
  })
  const res = await fetchWithTimeout(`${OPEN_METEO_URL}?${params}`, {}, 9000)
  return res.json()
}

async function fetchAQI(lat, lon) {
  const params = new URLSearchParams({ latitude: lat, longitude: lon, current: 'european_aqi,us_aqi', timezone: 'auto' })
  const res = await fetchWithTimeout(`${AIR_QUALITY_URL}?${params}`, {}, 9000)
  return res.json()
}

async function fetchHistory(month, day) {
  const mm = String(month).padStart(2, '0'), dd = String(day).padStart(2, '0')
  try {
    const res = await fetchWithTimeout(`${WIKIMEDIA_URL}/${mm}/${dd}`, { headers: { 'User-Agent': UA } }, 4000)
    const json = await res.json()
    return json.events || []
  } catch {
    return [] // non-blocking — don't let Wikipedia slow down the response
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const city = new URL(req.url, 'http://x').searchParams.get('city')?.trim()
  if (!city) return res.status(400).json({ error: 'Missing city parameter' })

  try {
    const geo = await geocodeCity(city)
    const { lat, lon } = geo
    const now = new Date()

    // Weather + AQI are critical; Wikipedia is best-effort with short timeout
    const [weatherData, aqiData, historyEvents] = await Promise.all([
      fetchWeather(lat, lon),
      fetchAQI(lat, lon),
      fetchHistory(now.getMonth() + 1, now.getDate()),
    ])

    const curr     = weatherData.current || {}
    const tempC    = curr.temperature_2m ?? 0
    const humidity = curr.relative_humidity_2m ?? 50
    const feels    = curr.apparent_temperature ?? tempC
    const wmoCode  = curr.weather_code ?? 0
    const windSpd  = curr.wind_speed_10m ?? 0
    const windDeg  = curr.wind_direction_10m ?? 0
    const uvCurr   = curr.uv_index ?? 0
    const isDay    = !!curr.is_day

    const [conditionLabel] = wmoCondition(wmoCode)
    const daily   = weatherData.daily || {}
    const times   = daily.time || []
    const hiArr   = daily.temperature_2m_max || []
    const loArr   = daily.temperature_2m_min || []
    const srArr   = daily.sunrise || []
    const ssArr   = daily.sunset || []
    const ppArr   = daily.precipitation_probability_max || []
    const uvArr   = daily.uv_index_max || []
    const dcArr   = daily.weather_code || []

    const sunriseRaw = srArr[0] || ''
    const sunsetRaw  = ssArr[0] || ''

    let weatherState = wmoWeatherState(wmoCode, !isDay)
    if (isDay && weatherState === 'clear-day') {
      try {
        const ssDiff = (new Date(sunsetRaw) - now) / 1000
        if (ssDiff > 0 && ssDiff < 7200) weatherState = 'sunset'
      } catch {}
    }

    // 5-day forecast
    const forecast = []
    for (let i = 0; i < Math.min(5, times.length); i++) {
      forecast.push({
        d: dayLabel(times[i], i),
        i: iconForForecast(dcArr[i] ?? 0, i > 0),
        hi: Math.round(hiArr[i] ?? 0),
        lo: Math.round(loArr[i] ?? 0),
        p: Math.round(ppArr[i] ?? 0),
      })
    }

    // Per-day hourly
    const hTemps = weatherData.hourly?.temperature_2m || []
    const hCodes = weatherData.hourly?.weather_code || []
    const hTimes = weatherData.hourly?.time || []
    const nowDateStr = now.toISOString().slice(0, 10)

    for (let di = 0; di < forecast.length; di++) {
      const dayDate = new Date(now)
      dayDate.setDate(dayDate.getDate() + di)
      const prefix = dayDate.toISOString().slice(0, 10)
      const entries = []
      for (let idx = 0; idx < hTimes.length; idx++) {
        if (!hTimes[idx].startsWith(prefix) || idx >= hTemps.length) continue
        const hour = parseInt(hTimes[idx].slice(11, 13), 10)
        entries.push({
          time: hTimes[idx],
          tempC: Math.round(hTemps[idx]),
          icon: iconForForecast(hCodes[idx] ?? 0, hour < 6 || hour >= 20),
          isNow: di === 0 && hTimes[idx].slice(0, 13) === now.toISOString().slice(0, 13),
        })
      }
      forecast[di].hourly = entries.filter((_, i) => i % 2 === 0).slice(0, 12)
    }

    // Today's hourly strip
    const nowHourStr = now.toISOString().slice(0, 13)
    let currIdx = hTimes.findIndex(t => t.slice(0, 13) >= nowHourStr)
    if (currIdx < 0) currIdx = 0
    const hourly = []
    for (let i = 0; i < 12; i++) {
      const idx = currIdx + i * 2
      if (idx >= hTemps.length) break
      const t = hTimes[idx] || ''
      const hour = parseInt(t.slice(11, 13), 10)
      hourly.push({ time: t, tempC: Math.round(hTemps[idx]), icon: iconForForecast(hCodes[idx] ?? 0, hour < 6 || hour >= 20), isNow: i === 0 })
    }

    // AQI + UV
    const aqiCurr = aqiData.current || {}
    const aqiVal  = parseFloat(aqiCurr.european_aqi ?? aqiCurr.us_aqi ?? 0)
    const [aqiLbl, aqiTone] = aqiLabel(aqiVal)
    const uvDay = parseFloat(uvArr[0] ?? uvCurr)
    const [uvLbl, uvTone] = uvLabel(uvDay)

    // Health
    const health = healthScore(uvDay, aqiVal, humidity, windSpd)

    // History
    const scored = historyEvents
      .map(ev => {
        const text = `${ev.text || ''} ${(ev.pages || []).map(p => p.titles?.normalized || '').join(' ')}`.toLowerCase()
        return { ev, score: (text.includes(geo.city.toLowerCase()) ? 10 : 0) + (text.includes(geo.country.toLowerCase()) ? 10 : 0) }
      })
      .sort((a, b) => b.score - a.score)
      .map(x => x.ev)
    const topEvents = (scored.length >= 3 ? scored : historyEvents).slice(0, 3)
    const history = topEvents.map(ev => {
      const pages = ev.pages || []
      return {
        year:  String(ev.year || ''),
        title: (ev.text || '').slice(0, 120),
        body:  (pages[0]?.extract || ev.text || '').slice(0, 200),
        href:  pages[0]?.content_urls?.desktop?.page || '#',
      }
    })

    res.status(200).json({
      city: geo.city, country: geo.country, flag: countryFlag(geo.countryCode),
      lat, lon,
      tempC: Math.round(tempC * 10) / 10,
      hiC: Math.round(hiArr[0] ?? tempC),
      loC: Math.round(loArr[0] ?? tempC),
      feelsLikeC: Math.round(feels * 10) / 10,
      condition: conditionLabel, weatherCode: wmoCode, weatherState,
      windSpeed: Math.round(windSpd), windDir: windDir(windDeg),
      humidity: Math.round(humidity),
      sunrise: formatTime(sunriseRaw), sunset: formatTime(sunsetRaw),
      daylight: daylightRemaining(sunriseRaw, sunsetRaw),
      uv:     { value: Math.round(uvDay * 10) / 10, label: uvLbl, tone: uvTone },
      aqi:    { value: Math.round(aqiVal),           label: aqiLbl, tone: aqiTone },
      health,
      history, forecast, hourly,
      fetchedAt: now.toISOString(),
    })
  } catch (err) {
    const notFound = err.message?.toLowerCase().includes('not found')
    res.status(notFound ? 404 : 500).json({ error: err.message || 'Weather service unavailable.' })
  }
}
