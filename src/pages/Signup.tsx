import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  confirmPassword?: string
}

export default function Signup() {
  const { user, error, signup, clearError } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const authError = getAuthErrorMessage(error)

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }))
    if (error) clearError()
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value)
    clearFieldError('email')
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value)
    clearFieldError('password')
  }

  function handleConfirmPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(event.target.value)
    clearFieldError('confirmPassword')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FieldErrors = {
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirmPassword: !confirmPassword
        ? 'Please confirm your password.'
        : password !== confirmPassword
          ? 'Passwords do not match.'
          : undefined,
    }
    setFieldErrors(nextErrors)

    if (
      nextErrors.email ||
      nextErrors.password ||
      nextErrors.confirmPassword
    ) {
      return
    }

    setSubmitting(true)
    try {
      await signup(email.trim(), password)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <section className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground sm:p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Sign up</h1>
          <p className="text-sm text-muted-foreground">
            Create your account.
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
                fieldErrors.email ? 'signup-email-error' : undefined
              }
            />
            {fieldErrors.email && (
              <p
                id="signup-email-error"
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
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="h-11"
              value={password}
              onChange={handlePasswordChange}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? 'signup-password-error' : undefined
              }
            />
            {fieldErrors.password && (
              <p
                id="signup-password-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              className="h-11"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={
                fieldErrors.confirmPassword
                  ? 'signup-confirm-password-error'
                  : undefined
              }
            />
            {fieldErrors.confirmPassword && (
              <p
                id="signup-confirm-password-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {fieldErrors.confirmPassword}
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
              {submitting ? 'Creating account…' : 'Sign up'}
            </Button>
          </div>

          {authError && (
            <p
              id="signup-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {authError}
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}
