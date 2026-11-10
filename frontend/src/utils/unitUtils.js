export const c2f = (c) => Math.round(c * 9 / 5 + 32)
export const T = (c, unit) => unit === 'F' ? c2f(c) : Math.round(c)
export const unitLabel = (unit) => unit === 'F' ? '°F' : '°C'

export function relativeTime(isoString, tr) {
  try {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000)
    if (diff < 2) return tr?.timeJustNow ?? 'just now'
    if (diff < 60) return tr?.timeMinAgo ? tr.timeMinAgo(diff) : `${diff} min ago`
    return tr?.timeHrAgo ? tr.timeHrAgo(Math.floor(diff / 60)) : `${Math.floor(diff / 60)}h ago`
  } catch {
    return '—'
  }
}

export function formatNumber(value, locale, digits = 1) {
  if (value == null || Number.isNaN(value)) return '—'
  return Number(value).toLocaleString(locale, { maximumFractionDigits: digits })
}

// Wind follows the temperature unit: km/h with °C, mph with °F
export function windDisplay(kmh, unit) {
  return unit === 'F'
    ? { value: Math.round(kmh * 0.621371), label: 'mph' }
    : { value: Math.round(kmh), label: 'km/h' }
}
