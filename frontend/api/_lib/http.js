export const UA = 'TunaWeatherApp/1.0 (github.com/afonsobranco/tuna-weather-app)'

// The timeout covers the body download too: large feeds can arrive slowly after the headers.
export async function fetchJson(url, { headers, timeout = 8000 } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, { headers, signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

export function withTimeout(promise, ms, fallback) {
  let timer
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise(resolve => { timer = setTimeout(() => resolve(fallback), ms) }),
  ])
}
