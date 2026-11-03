import { useState, type FormEvent } from 'react'
import { Button } from '../components/ui/button.tsx'
import { Input } from '../components/ui/input.tsx'
import { Label } from '../components/ui/label.tsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }

    setMessage('Authentication is not implemented yet.')
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <section className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground sm:p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Login</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-11"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-11"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <Button type="submit" size="lg" className="h-11 w-full">
            Sign in
          </Button>

          {error && (
            <p
              id="login-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-muted-foreground" role="status">
              {message}
            </p>
          )}
        </form>
      </section>
    </div>
  )
}
