import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button.tsx'
import { useAuth } from '../hooks/useAuth.ts'
import { getAuthErrorMessage } from '../lib/authForm.ts'

export default function Profile() {
  const { user, logout, error, clearError } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const authError = getAuthErrorMessage(error)

  useEffect(() => {
    clearError()
  }, [clearError])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <section className="mx-auto w-full max-w-lg rounded-xl border bg-card p-6 text-card-foreground sm:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your account details.
        </p>
      </div>

      <dl className="mt-6 space-y-4">
        <div className="space-y-1">
          <dt className="text-sm font-medium text-muted-foreground">Email</dt>
          <dd className="break-all text-sm font-medium">
            {user.email ?? '—'}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm font-medium text-muted-foreground">
            Firebase UID
          </dt>
          <dd className="break-all font-mono text-sm">{user.uid}</dd>
        </div>
      </dl>

      {authError && (
        <p className="mt-6 text-sm text-destructive" role="alert">
          {authError}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="mt-6 h-11 w-full sm:w-auto"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? 'Signing out…' : 'Logout'}
      </Button>
    </section>
  )
}
