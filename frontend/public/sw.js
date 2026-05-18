/**
 * Tuna Weather App — Service Worker
 * Strategy:
 *  - App shell (HTML/JS/CSS): Cache-first, update in background (StaleWhileRevalidate)
 *  - API calls: Network-first with offline fallback to last cache
 *  - Images/fonts: Cache-first with long TTL
 */

const CACHE_NAME = 'tuna-v1'
const SHELL_CACHE = 'tuna-shell-v1'
const API_CACHE   = 'tuna-api-v1'

const SHELL_URLS = [
  '/tuna-weather-app/',
  '/tuna-weather-app/index.html',
]

// ── Install: pre-cache app shell ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(SHELL_URLS).catch(() => {})
    )
  )
  self.skipWaiting()
})

// ── Activate: clean up old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![CACHE_NAME, SHELL_CACHE, API_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch: routing strategy ───────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and chrome-extension
  if (request.method !== 'GET') return
  if (!url.protocol.startsWith('http')) return

  // API requests: Network-first with stale fallback
  if (url.hostname.includes('onrender.com') || url.pathname.includes('/weather')) {
    event.respondWith(networkFirstWithFallback(request, API_CACHE))
    return
  }

  // Google Fonts: Cache-first
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(request, CACHE_NAME))
    return
  }

  // App shell: StaleWhileRevalidate
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE))
    return
  }
})

// ── Strategies ────────────────────────────────────────────────────────────────
async function networkFirstWithFallback(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return new Response(JSON.stringify({ error: 'offline', detail: 'No cached data available.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  const cache = await caches.open(cacheName)
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const networkPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone())
    return response
  }).catch(() => null)
  return cached || (await networkPromise) || new Response('Offline', { status: 503 })
}
