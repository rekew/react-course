import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Wifi, WifiOff } from 'lucide-react'
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts'

const TOAST_DURATION_MS = 4_000

interface ToastState {
  isOnline: boolean
  message: string
}

export default function ConnectivityStatus() {
  const { isOnline } = useOnlineStatus()
  const queryClient = useQueryClient()
  const [toast, setToast] = useState<ToastState | null>(null)
  const previousOnlineRef = useRef<boolean | null>(null)
  const toastTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const previousOnline = previousOnlineRef.current
    previousOnlineRef.current = isOnline

    if (previousOnline === null || previousOnline === isOnline) return

    if (isOnline) {
      void queryClient.refetchQueries({ type: 'active' })
    }

    setToast({
      isOnline,
      message: isOnline
        ? 'You’re back online.'
        : 'You’re offline. Some features may be unavailable.',
    })

    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current)
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null)
      toastTimeoutRef.current = null
    }, TOAST_DURATION_MS)
  }, [isOnline, queryClient])

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <div className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
        <span
          aria-hidden="true"
          className={`size-2 rounded-full ${
            isOnline ? 'bg-emerald-500' : 'bg-destructive'
          }`}
        />
        {isOnline ? 'Online' : 'Offline'}
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed right-4 bottom-20 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg"
        >
          {toast.isOnline ? (
            <Wifi aria-hidden="true" className="size-4 text-emerald-600" />
          ) : (
            <WifiOff aria-hidden="true" className="size-4 text-destructive" />
          )}
          <span>{toast.message}</span>
        </div>
      ) : null}
    </>
  )
}
