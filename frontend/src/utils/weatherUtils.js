// Maps weather state string to background style
export const BG_GRADIENTS = {
  'clear-day':   'linear-gradient(180deg, #f5cf8c 0%, #f0b178 18%, #d9a18a 32%, #b29bb6 50%, #7b9ec9 70%, #4a7eb3 100%)',
  'sunset':      'linear-gradient(180deg, #1a1a44 0%, #4a2872 20%, #8a3a76 38%, #d35a5a 58%, #f08858 72%, #f5b574 86%, #d49a6a 100%)',
  'rainy':       'linear-gradient(180deg, #1d2735 0%, #2a3a4f 35%, #3d4f64 65%, #2f3e52 100%)',
  'overcast':    'linear-gradient(180deg, #1d2735 0%, #2a3a4f 35%, #3d4f64 65%, #2f3e52 100%)',
  'clear-night': 'linear-gradient(180deg, #060a1c 0%, #0c1230 25%, #131a3d 55%, #1c2147 85%, #2a2f5a 100%)',
}

// Bright sunrise/sunset/day skies: the layout scrim (≈0.5–0.56 dark) plus these keep
// 88%-white text above 4.5:1 on the brightest parts of the gradient
export const WARM_GLASS = {
  '--glass-bg': 'rgba(14,18,40,0.32)',
  '--rail-bg': 'rgba(8,12,30,0.45)',
  '--chip-bg': 'rgba(8,12,30,0.45)',
  '--glass-antique': 'linear-gradient(155deg, rgba(55,38,18,0.62) 0%, rgba(40,26,12,0.62) 100%)',
}

export const WARM_STATES = ['sunset', 'clear-day']

export function ringColor(score) {
  if (score >= 75) return '#3ed28b'
  if (score >= 50) return '#ffa850'
  return '#ff5a5a'
}

export function toneColors(tone) {
  const map = {
    green:  { fg: '#B6F5D2', bg: 'rgba(20,60,45,0.55)',  border: 'rgba(62,210,139,0.55)', dot: '#3ed28b' },
    orange: { fg: '#FFD8B0', bg: 'rgba(70,40,15,0.55)',  border: 'rgba(255,168,80,0.6)',  dot: '#ffa850' },
    red:    { fg: '#FFC9C9', bg: 'rgba(75,20,20,0.55)',  border: 'rgba(255,90,90,0.6)',   dot: '#ff5a5a' },
  }
  return map[tone] || map.green
}

// WMO code → tomorrow tile condition
// tr is optional — if provided, labels/tips are translated
export function tomorrowCondition(iconKind, tr) {
  const icons = {
    rain:  { icon: 'rain',   accent: '#6FA8E8' },
    storm: { icon: 'storm',  accent: '#FFCB45' },
    snow:  { icon: 'snow',   accent: '#DCE4F2' },
    cloud: { icon: 'cloud',  accent: '#C9D2E0' },
    moon:  { icon: 'partly', accent: '#FFD18A' },
  }
  const englishLabels = {
    rain:  { label: 'Rain expected',  tip: 'Pack an umbrella' },
    storm: { label: 'Stormy',         tip: 'Avoid early commute' },
    snow:  { label: 'Snow expected',  tip: 'Dress warm, roads may be icy' },
    cloud: { label: 'Overcast',       tip: 'Layer up — slow warmth' },
    moon:  { label: 'Clear',          tip: 'Crisp start' },
  }
  const defaultEnglish = { label: 'Clear & cool', tip: 'Great for a run' }
  const baseIcon = icons[iconKind] || { icon: 'partly', accent: '#FFD18A' }
  const translated = (tr?.tomorrowConditions?.[iconKind]) || (tr?.tomorrowConditions?.default) || englishLabels[iconKind] || defaultEnglish
  return { ...baseIcon, label: translated.label, tip: translated.tip }
}

const SNOW_CODES = [71, 73, 75, 77, 85, 86]

export function heroIconKind(data) {
  const code = data?.weatherCode
  const night = data?.isDay === false || data?.weatherState === 'clear-night'
  if (code >= 95) return 'storm'
  if (SNOW_CODES.includes(code)) return 'snow'
  if (code >= 51) return 'rain'
  if (code === 3 || (code >= 45 && code < 50)) return 'cloud'
  if (code === 2) return night ? 'mooncloud' : 'partly'
  if (code === 0 || code === 1) return night ? 'moon' : 'sun'
  return night ? 'moon' : 'partly'
}
