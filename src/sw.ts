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

interface MessageEvent extends ExtendableEvent {
  data: unknown
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
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent) => void,
  ): void
  skipWaiting(): Promise<void>
}

const sw = self as unknown as ServiceWorkerScope

const PRECACHE_MANIFEST = [...self.__WB_MANIFEST].sort((a, b) =>
  a.url.localeCompare(b.url),
)
const PRECACHE_URLS = [
  ...new Set(PRECACHE_MANIFEST.map((entry) => entry.url)),
]

function hashManifest(entries: PrecacheEntry[]): string {
  const input = entries
    .map(({ url, revision }) => `${url}:${revision ?? ''}`)
    .join('|')
  let hash = 0x811c9dc5

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }

  return (hash >>> 0).toString(36)
}

const CACHE_NAME = `app-shell-${hashManifest(PRECACHE_MANIFEST)}`
const APP_SHELL_URL = new URL('index.html', sw.registration.scope).href

sw.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll(PRECACHE_URLS)
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

sw.addEventListener('message', (event) => {
  const data = event.data as { type?: unknown } | null

  if (data?.type === 'SKIP_WAITING') {
    event.waitUntil(sw.skipWaiting())
  }
})

sw.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== sw.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME)
        const cachedShell = await cache.match(APP_SHELL_URL, {
          ignoreVary: true,
        })
        return cachedShell ?? fetch(request)
      })(),
    )
    return
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cachedResponse = await cache.match(request, { ignoreVary: true })
      return cachedResponse ?? fetch(request)
    })(),
  )
})
