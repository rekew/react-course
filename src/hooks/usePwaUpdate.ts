import { useCallback, useEffect, useRef, useState } from 'react'

const SKIP_WAITING_MESSAGE = { type: 'SKIP_WAITING' }

export interface PwaUpdateState {
  updateAvailable: boolean
  applyUpdate: () => void
}

export function usePwaUpdate(): PwaUpdateState {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const reloadRequestedRef = useRef(false)
  const hasReloadedRef = useRef(false)

  useEffect(() => {
    if (!import.meta.env.PROD) return
    if (!('serviceWorker' in navigator)) return

    let disposed = false
    let watchedWorker: ServiceWorker | null = null

    const handleControllerChange = () => {
      if (!reloadRequestedRef.current || hasReloadedRef.current) return

      hasReloadedRef.current = true
      window.location.reload()
    }

    const handleStateChange = () => {
      if (disposed) return

      const registration = registrationRef.current
      if (!registration?.waiting || !navigator.serviceWorker.controller) return

      setWaitingWorker(registration.waiting)
    }

    const watchWorker = (worker: ServiceWorker) => {
      watchedWorker = worker
      worker.addEventListener('statechange', handleStateChange)
      handleStateChange()
    }

    const handleUpdateFound = () => {
      const worker = registrationRef.current?.installing
      if (worker) watchWorker(worker)
    }

    const trackRegistration = (registration: ServiceWorkerRegistration) => {
      if (disposed) return

      registrationRef.current = registration
      registration.addEventListener('updatefound', handleUpdateFound)

      if (registration.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(registration.waiting)
      }

      if (registration.installing) {
        watchWorker(registration.installing)
      }
    }

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      handleControllerChange,
    )

    void navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        if (registration) {
          trackRegistration(registration)
          return
        }

        return navigator.serviceWorker.ready.then(trackRegistration)
      })
      .catch((error: unknown) => {
        console.error('Failed to watch for service worker updates:', error)
      })

    return () => {
      disposed = true
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        handleControllerChange,
      )
      registrationRef.current?.removeEventListener(
        'updatefound',
        handleUpdateFound,
      )
      watchedWorker?.removeEventListener('statechange', handleStateChange)
    }
  }, [])

  const applyUpdate = useCallback(() => {
    const worker = waitingWorker ?? registrationRef.current?.waiting
    if (!worker) return

    reloadRequestedRef.current = true
    worker.postMessage(SKIP_WAITING_MESSAGE)
  }, [waitingWorker])

  return {
    updateAvailable: waitingWorker !== null,
    applyUpdate,
  }
}
