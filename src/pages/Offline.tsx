import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LoaderCircle, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '../components/ui/button.tsx'

type RetryStatus = 'idle' | 'checking' | 'offline'

interface OfflineLocationState {
  from?: unknown
}

function getPathFromState(from: unknown): string | null {
  if (typeof from === 'string') return from

  if (from && typeof from === 'object' && 'pathname' in from) {
    const pathname = (from as { pathname?: unknown }).pathname
    const search = (from as { search?: unknown }).search

    if (typeof pathname === 'string') {
      return `${pathname}${typeof search === 'string' ? search : ''}`
    }
  }

  return null
}

function getSafeDestination(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/'
  }

  try {
    const url = new URL(value, window.location.origin)
    const destination = `${url.pathname}${url.search}${url.hash}`

    if (url.origin !== window.location.origin) return '/'
    if (url.pathname === '/offline') return '/'

    return destination
  } catch {
    return '/'
  }
}

export default function Offline() {
  const location = useLocation()
  const navigate = useNavigate()
  const [status, setStatus] = useState<RetryStatus>('idle')

  const queryFrom = new URLSearchParams(location.search).get('from')
  const stateFrom = getPathFromState(
    (location.state as OfflineLocationState | null)?.from,
  )
  const destination = getSafeDestination(queryFrom ?? stateFrom)

  async function handleRetry() {
    if (status === 'checking') return

    setStatus('checking')

    try {
      const response = await fetch(
        `${import.meta.env.BASE_URL}manifest.webmanifest?ping=${Date.now()}`,
        { cache: 'no-store' },
      )

      if (!response.ok) {
        throw new Error(`Connectivity check failed with ${response.status}`)
      }

      navigate(destination, { replace: true })
    } catch {
      setStatus('offline')
    }
  }

  const isChecking = status === 'checking'

  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border bg-card p-8 text-center text-card-foreground sm:p-12">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <WifiOff aria-hidden="true" className="size-7" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          You’re offline
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It looks like you’ve lost your internet connection. Cached pages may
          still work, but new content can’t be loaded until you reconnect.
        </p>
        <Button
          type="button"
          size="lg"
          onClick={handleRetry}
          disabled={isChecking}
          className="mt-6"
        >
          {isChecking ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : (
            <RefreshCw aria-hidden="true" />
          )}
          {isChecking ? 'Checking connection…' : 'Retry Connection'}
        </Button>
        <p
          role="status"
          aria-live="polite"
          className="mt-4 min-h-5 text-sm text-destructive"
        >
          {status === 'offline'
            ? 'Still offline. Check your connection and try again.'
            : ''}
        </p>
      </div>
    </section>
  )
}
