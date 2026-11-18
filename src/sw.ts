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
const OFFLINE_URL = new URL('offline-fallback.html', sw.registration.scope).href
const STATIC_ASSETS_CACHE = 'static-assets-v1'
const STATIC_ASSETS_META_CACHE = 'static-assets-meta-v1'
const MAX_STATIC_ASSET_ENTRIES = 60
const STATIC_ASSET_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1_000
const STATIC_ASSET_PRUNE_INTERVAL_MS = 60_000
const STATIC_ASSET_EXTENSIONS =
  /\.(?:avif|gif|ico|jpe?g|png|svg|webp|woff2?|ttf|otf)$/i

let lastStaticAssetPruneAt = 0

function isStaticAssetRequest(request: Request, url: URL): boolean {
  if (request.destination === 'image' || request.destination === 'font') {
    return true
  }

  return STATIC_ASSET_EXTENSIONS.test(url.pathname)
}

function isCacheableResponse(response: Response): boolean {
  if (response.type === 'opaque') return true
  if (response.type !== 'basic' && response.type !== 'cors') return false

  return response.ok && response.status !== 206
}

async function readCachedAt(request: Request): Promise<number | null> {
  try {
    const metaCache = await caches.open(STATIC_ASSETS_META_CACHE)
    const metadata = await metaCache.match(request.url)
    if (!metadata) return null

    const cachedAt = Number(await metadata.text())
    return Number.isFinite(cachedAt) ? cachedAt : null
  } catch {
    return null
  }
}

async function matchAppShellAsset(
  request: Request,
): Promise<Response | undefined> {
  const url = new URL(request.url)
  if (url.origin !== sw.location.origin) return undefined

  try {
    const cache = await caches.open(CACHE_NAME)
    return (await cache.match(request, { ignoreVary: true })) ?? undefined
  } catch {
    return undefined
  }
}

async function pruneStaticAssets(force = false): Promise<void> {
  const now = Date.now()

  if (
    !force &&
    now - lastStaticAssetPruneAt < STATIC_ASSET_PRUNE_INTERVAL_MS
  ) {
    return
  }

  lastStaticAssetPruneAt = now

  try {
    const cache = await caches.open(STATIC_ASSETS_CACHE)
    const metaCache = await caches.open(STATIC_ASSETS_META_CACHE)
    const requests = await cache.keys()
    const entries: { request: Request; cachedAt: number }[] = []

    for (const request of requests) {
      const metadata = await metaCache.match(request.url)
      const cachedAt = metadata ? Number(await metadata.text()) : Number.NaN

      if (
        !Number.isFinite(cachedAt) ||
        now - cachedAt > STATIC_ASSET_MAX_AGE_MS
      ) {
        await cache.delete(request, { ignoreVary: true })
        await metaCache.delete(request.url)
      } else {
        entries.push({ request, cachedAt })
      }
    }

    if (entries.length > MAX_STATIC_ASSET_ENTRIES) {
      entries.sort((a, b) => a.cachedAt - b.cachedAt)
      const excess = entries.slice(
        0,
        entries.length - MAX_STATIC_ASSET_ENTRIES,
      )

      await Promise.all(
        excess.map(async ({ request }) => {
          await cache.delete(request, { ignoreVary: true })
          await metaCache.delete(request.url)
        }),
      )
    }
  } catch {
    return
  }
}

async function cacheStaticAsset(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const cache = await caches.open(STATIC_ASSETS_CACHE)
    await cache.put(request, response)

    const metaCache = await caches.open(STATIC_ASSETS_META_CACHE)
    await metaCache.put(
      request.url,
      new Response(String(Date.now()), {
        headers: { 'content-type': 'text/plain' },
      }),
    )

    const entryCount = (await cache.keys()).length
    await pruneStaticAssets(entryCount > MAX_STATIC_ASSET_ENTRIES)
  } catch {
    return
  }
}

async function handleStaticAsset(
  event: FetchEvent,
  request: Request,
): Promise<Response> {
  let staleResponse: Response | undefined

  try {
    const cache = await caches.open(STATIC_ASSETS_CACHE)
    const cachedResponse = await cache.match(request, { ignoreVary: true })

    if (cachedResponse) {
      const cachedAt = await readCachedAt(request)
      if (
        cachedAt !== null &&
        Date.now() - cachedAt <= STATIC_ASSET_MAX_AGE_MS
      ) {
        return cachedResponse
      }

      staleResponse = cachedResponse
    }

    const appShellResponse = await matchAppShellAsset(request)
    if (appShellResponse) return appShellResponse
  } catch {
    staleResponse = undefined
  }

  try {
    const response = await fetch(request)

    if (isCacheableResponse(response)) {
      event.waitUntil(cacheStaticAsset(request, response.clone()))
    }

    return response
  } catch {
    return staleResponse ?? Response.error()
  }
}

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
      const currentCaches = new Set([
        CACHE_NAME,
        STATIC_ASSETS_CACHE,
        STATIC_ASSETS_META_CACHE,
      ])

      await Promise.all(
        cacheKeys
          .filter((key) => !currentCaches.has(key))
          .map((key) => caches.delete(key)),
      )
      await pruneStaticAssets(true)
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

  if (request.mode === 'navigate') {
    if (url.origin !== sw.location.origin) return

    event.respondWith(
      (async () => {
        try {
          return await fetch(request)
        } catch {
          const cache = await caches.open(CACHE_NAME)
          const cachedShell = await cache.match(APP_SHELL_URL, {
            ignoreVary: true,
          })

          if (cachedShell) return cachedShell

          const cachedOfflinePage = await cache.match(OFFLINE_URL, {
            ignoreVary: true,
          })

          return cachedOfflinePage ?? Response.error()
        }
      })(),
    )
    return
  }

  if (isStaticAssetRequest(request, url)) {
    event.respondWith(handleStaticAsset(event, request))
    return
  }

  if (url.origin !== sw.location.origin) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cachedResponse = await cache.match(request, { ignoreVary: true })
      return cachedResponse ?? fetch(request)
    })(),
  )
})
