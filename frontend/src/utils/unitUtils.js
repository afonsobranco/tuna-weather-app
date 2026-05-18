export const c2f = (c) => Math.round(c * 9 / 5 + 32)
export const T = (c, unit) => unit === 'F' ? c2f(c) : Math.round(c)
export const unitLabel = (unit) => unit === 'F' ? '°F' : '°C'

export function relativeTime(isoString) {
  try {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000)
    if (diff < 2) return 'just now'
    if (diff < 60) return `${diff} min ago`
    return `${Math.floor(diff / 60)}h ago`
  } catch {
    return '—'
  }
}
