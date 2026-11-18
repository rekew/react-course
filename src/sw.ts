interface PrecacheEntry {
  url: string
  revision: string | null
}

declare global {
  interface Window {
    __WB_MANIFEST: PrecacheEntry[]
  }
}

interface ExtendableEvent {
  waitUntil(promise: Promise<unknown>): void
}

interface FetchEvent extends ExtendableEvent {
  request: Request
  respondWith(response: Response | Promise<Response>): void
}

interface ServiceWorkerScope {
  location: Location
  registration: { scope: string }
  clients: { claim(): Promise<void> }
  addEventListener(
    type: 'install' | 'activate',
    listener: (event: ExtendableEvent) => void,
  ): void
  addEventListener(type: 'fetch', listener: (event: FetchEvent) => void): void
  skipWaiting(): Promise<void>
}

const sw = self as unknown as ServiceWorkerScope

const CACHE_NAME = 'app-shell-v1'
const APP_SHELL_URL = new URL('index.html', sw.registration.scope).href
const PRECACHE_URLS = [
  ...new Set(self.__WB_MANIFEST.map((entry) => entry.url)),
]

sw.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll(PRECACHE_URLS)
      await sw.skipWaiting()
    })(),
  )
})

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys()
      await Promise.all(
        cacheKeys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      )
      await sw.clients.claim()
    })(),
  )
})

sw.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== sw.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cachedShell = await caches.match(APP_SHELL_URL)
        return cachedShell ?? fetch(request)
      })(),
    )
    return
  }

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request)
      return cachedResponse ?? fetch(request)
    })(),
  )
})
