// Maps weather state string to background style
export const BG_GRADIENTS = {
  'clear-day':   'linear-gradient(180deg, #f5cf8c 0%, #f0b178 18%, #d9a18a 32%, #b29bb6 50%, #7b9ec9 70%, #4a7eb3 100%)',
  'sunset':      'linear-gradient(180deg, #1a1a44 0%, #4a2872 20%, #8a3a76 38%, #d35a5a 58%, #f08858 72%, #f5b574 86%, #d49a6a 100%)',
  'rainy':       'linear-gradient(180deg, #1d2735 0%, #2a3a4f 35%, #3d4f64 65%, #2f3e52 100%)',
  'clear-night': 'linear-gradient(180deg, #060a1c 0%, #0c1230 25%, #131a3d 55%, #1c2147 85%, #2a2f5a 100%)',
}

export function ringColor(score) {
  if (score >= 75) return '#3ed28b'
  if (score >= 50) return '#ffa850'
  return '#ff5a5a'
}

export function toneColors(tone) {
  const map = {
    green:  { fg: '#1f7a4f', bg: 'rgba(60,210,135,0.18)',  dot: '#3ed28b' },
    orange: { fg: '#a14e15', bg: 'rgba(255,170,80,0.22)',  dot: '#ffa850' },
    red:    { fg: '#a02525', bg: 'rgba(255,90,90,0.24)',   dot: '#ff5a5a' },
  }
  return map[tone] || map.green
}

// WMO code → tomorrow tile condition
// tr is optional — if provided, labels/tips are translated
export function tomorrowCondition(iconKind, tr) {
  const icons = {
    rain:  { icon: 'rain',   accent: '#6FA8E8' },
    storm: { icon: 'storm',  accent: '#FFCB45' },
    cloud: { icon: 'cloud',  accent: '#C9D2E0' },
    moon:  { icon: 'partly', accent: '#FFD18A' },
  }
  const englishLabels = {
    rain:  { label: 'Rain expected',  tip: 'Pack an umbrella' },
    storm: { label: 'Stormy',         tip: 'Avoid early commute' },
    cloud: { label: 'Overcast',       tip: 'Layer up — slow warmth' },
    moon:  { label: 'Clear',          tip: 'Crisp start' },
  }
  const defaultEnglish = { label: 'Clear & cool', tip: 'Great for a run' }
  const baseIcon = icons[iconKind] || { icon: 'partly', accent: '#FFD18A' }
  const translated = (tr?.tomorrowConditions?.[iconKind]) || (tr?.tomorrowConditions?.default) || englishLabels[iconKind] || defaultEnglish
  return { ...baseIcon, label: translated.label, tip: translated.tip }
}
