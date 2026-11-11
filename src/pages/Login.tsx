import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button.tsx'
import { Input } from '../components/ui/input.tsx'
import { Label } from '../components/ui/label.tsx'
import { useAuth } from '../hooks/useAuth.ts'
import {
  getAuthErrorMessage,
  validateEmail,
  validatePassword,
} from '../lib/authForm.ts'

interface FieldErrors {
  email?: string
  password?: string
}

export default function Login() {
  const { error, login, signInWithGoogle, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const authError = getAuthErrorMessage(error)

  useEffect(() => {
    clearError()
  }, [clearError])

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value)
    setFieldErrors((previous) => ({ ...previous, email: undefined }))
    if (error) clearError()
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value)
    setFieldErrors((previous) => ({ ...previous, password: undefined }))
    if (error) clearError()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FieldErrors = {
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
    }
    setFieldErrors(nextErrors)

    if (nextErrors.email || nextErrors.password) {
      return
    }

    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    setSubmitting(true)
    try {
      await signInWithGoogle()
    } finally {
      setSubmitting(false)
    }
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

        <form
          className="mt-6 space-y-5"
          onSubmit={handleSubmit}
          aria-busy={submitting}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-11"
              value={email}
              onChange={handleEmailChange}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={
                fieldErrors.email ? 'login-email-error' : undefined
              }
            />
            {fieldErrors.email && (
              <p
                id="login-email-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {fieldErrors.email}
              </p>
            )}
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
              onChange={handlePasswordChange}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? 'login-password-error' : undefined
              }
            />
            {fieldErrors.password && (
              <p
                id="login-password-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full"
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Login'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 w-full"
              onClick={handleGoogleSignIn}
              disabled={submitting}
            >
              Continue with Google
            </Button>
          </div>

          {authError && (
            <p id="login-error" className="text-sm text-destructive" role="alert">
              {authError}
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Don’t have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}
