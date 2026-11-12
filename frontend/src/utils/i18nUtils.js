const regionNames = new Map()

export function countryName(cc, locale, fallback = '') {
  if (!/^[A-Za-z]{2}$/.test(cc || '')) return fallback
  try {
    if (!regionNames.has(locale)) regionNames.set(locale, new Intl.DisplayNames([locale], { type: 'region' }))
    return regionNames.get(locale).of(cc.toUpperCase()) || fallback
  } catch {
    return fallback
  }
}

export function formatMinutes(min) {
  if (min == null) return '—'
  const h = Math.floor(min / 60), m = min % 60
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}

// Full day name for screen-reader labels ("Saturday", not "Sat")
export function translateDayLong(d, tr) {
  if (d === 'Today') return tr.today
  if (d === 'Tomorrow') return tr.tomorrow
  return tr.daysLong?.[d] || translateDay(d, tr)
}

export function translateDay(d, tr) {
  if (d === 'Today') return tr.today
  if (d === 'Tomorrow') return tr.tomorrow
  return tr.days?.[d] || d
}
