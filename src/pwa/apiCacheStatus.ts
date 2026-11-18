import { useSyncExternalStore } from 'react'

export interface ApiCacheStatus {
  isCached: boolean
  lastUpdated: Date | null
}

const CACHE_HEADER = 'x-from-cache'
const CACHE_UPDATED_AT_HEADER = 'x-cache-updated-at'
const EMPTY_STATUS: ApiCacheStatus = { isCached: false, lastUpdated: null }
const statuses = new Map<string, ApiCacheStatus>()
const listeners = new Map<string, Set<() => void>>()

function notify(cacheKey: string) {
  listeners.get(cacheKey)?.forEach((listener) => listener())
}

export function recordApiCacheStatus(cacheKey: string, response: Response) {
  const isCached = response.headers.get(CACHE_HEADER) === 'true'
  const updatedAt = Number(response.headers.get(CACHE_UPDATED_AT_HEADER))
  const lastUpdated =
    isCached && Number.isFinite(updatedAt) ? new Date(updatedAt) : null
  const nextStatus = { isCached, lastUpdated }
  const currentStatus = statuses.get(cacheKey)

  if (
    currentStatus?.isCached === nextStatus.isCached &&
    currentStatus?.lastUpdated?.getTime() === nextStatus.lastUpdated?.getTime()
  ) {
    return
  }

  statuses.set(cacheKey, nextStatus)
  notify(cacheKey)
}

export function clearApiCacheStatus(cacheKey: string) {
  const currentStatus = statuses.get(cacheKey)
  if (!currentStatus || !currentStatus.isCached) return

  statuses.set(cacheKey, EMPTY_STATUS)
  notify(cacheKey)
}

export function useApiCacheStatus(cacheKey: string | null): ApiCacheStatus {
  return useSyncExternalStore(
    (listener) => {
      if (!cacheKey) return () => undefined

      const cacheListeners = listeners.get(cacheKey) ?? new Set()
      cacheListeners.add(listener)
      listeners.set(cacheKey, cacheListeners)

      return () => {
        cacheListeners.delete(listener)
        if (cacheListeners.size === 0) listeners.delete(cacheKey)
      }
    },
    () => (cacheKey ? statuses.get(cacheKey) ?? EMPTY_STATUS : EMPTY_STATUS),
    () => EMPTY_STATUS,
  )
}
