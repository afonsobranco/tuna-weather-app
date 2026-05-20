/**
 * Tuna Weather App — Service Worker v2
 * Bumped to v2 to force-evict the old cached JS bundle on all installed PWAs.
 */

const CACHE_NAME  = 'tuna-v2'
const SHELL_CACHE = 'tuna-shell-v2'
const API_CACHE   = 'tuna-api-v2'

const SHELL_URLS = ['/', '/index.html']

// ── Install: pre-cache app shell ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(SHELL_URLS).catch(() => {})
    )
  )
  self.skipWaiting()
})

// ── Activate: delete ALL old caches, then reload open clients ────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![CACHE_NAME, SHELL_CACHE, API_CACHE].includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
      .then(() => {
        // Tell every open tab/PWA window to reload so it picks up fresh JS
        return self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => client.navigate(client.url))
        })
      })
  )
})

// ── Fetch: routing strategy ───────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (!url.protocol.startsWith('http')) return

  // API: network-first so data is always fresh, stale fallback for offline
  if (url.pathname.startsWith('/api/') || url.hostname.includes('onrender.com')) {
    event.respondWith(networkFirstWithFallback(request, API_CACHE))
    return
  }

  // Fonts: cache-first (rarely changes)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(request, CACHE_NAME))
    return
  }

  // App shell: network-first so the latest JS bundle is always served
  // Falls back to cache only when truly offline
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirstWithFallback(request, SHELL_CACHE))
    return
  }
})

// ── Strategies ────────────────────────────────────────────────────────────────
async function networkFirstWithFallback(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return new Response(
      JSON.stringify({ error: 'offline', detail: 'No cached data available.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
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
