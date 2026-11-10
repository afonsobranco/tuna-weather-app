export const UA = 'TunaWeatherApp/1.0 (github.com/afonsobranco/tuna-weather-app)'

class HttpError extends Error {
  constructor(status) { super(`HTTP ${status}`); this.status = status }
}

// The timeout covers the body download too: large feeds can arrive slowly after the headers.
async function fetchOnce(url, headers, timeout) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, { headers, signal: ctrl.signal })
    if (!res.ok) throw new HttpError(res.status)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

// Upstream APIs occasionally drop connections ("fetch failed") or return 5xx; one quick
// retry turns most of those into a normal response.
export async function fetchJson(url, { headers, timeout = 8000, retries = 0 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetchOnce(url, headers, timeout)
    } catch (err) {
      const transient = !(err instanceof HttpError) || err.status >= 500 || err.status === 429
      if (attempt >= retries || !transient || err.name === 'AbortError') throw err
      await new Promise(r => setTimeout(r, 300 * (attempt + 1)))
    }
  }
}

export function withTimeout(promise, ms, fallback) {
  let timer
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise(resolve => { timer = setTimeout(() => resolve(fallback), ms) }),
  ])
}
