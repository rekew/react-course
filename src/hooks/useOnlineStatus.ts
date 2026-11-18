import { useCallback, useEffect, useRef, useState } from 'react'

const CHECK_TIMEOUT_MS = 5_000
const RECHECK_INTERVAL_MS = 30_000

async function isReachable(signal: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}manifest.webmanifest?ping=${Date.now()}`,
      { cache: 'no-store', signal },
    )
    return response.ok
  } catch {
    return false
  }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const requestIdRef = useRef(0)
  const controllerRef = useRef<AbortController | null>(null)

  const checkConnection = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    controllerRef.current?.abort()

    const controller = new AbortController()
    controllerRef.current = controller
    const timeout = window.setTimeout(
      () => controller.abort(),
      CHECK_TIMEOUT_MS,
    )

    try {
      const online = await isReachable(controller.signal)
      if (requestId === requestIdRef.current) setIsOnline(online)
      return online
    } finally {
      window.clearTimeout(timeout)
      if (requestId === requestIdRef.current) {
        controllerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    void checkConnection()

    function handleOnline() {
      void checkConnection()
    }

    function handleOffline() {
      controllerRef.current?.abort()
      requestIdRef.current += 1
      setIsOnline(false)
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void checkConnection()
      }
    }

    const interval = window.setInterval(() => {
      void checkConnection()
    }, RECHECK_INTERVAL_MS)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      controllerRef.current?.abort()
      requestIdRef.current += 1
    }
  }, [checkConnection])

  return { isOnline, checkConnection }
}
