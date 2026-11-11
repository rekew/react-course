import type { AuthServiceError } from '../services/authService.ts'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

const authErrorMessages: Record<string, string> = {
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-not-found': 'No account was found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use':
    'An account with this email already exists. Try signing in instead.',
  'auth/weak-password': `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  'auth/too-many-requests':
    'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed':
    'Network error. Check your connection and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/popup-blocked':
    'The sign-in popup was blocked. Allow popups and try again.',
  'auth/account-exists-with-different-credential':
    'An account already exists with a different sign-in method.',
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) {
    return 'Email is required.'
  }

  if (!EMAIL_PATTERN.test(value.trim())) {
    return 'Enter a valid email address.'
  }

  return null
}

export function validatePassword(value: string): string | null {
  if (!value) {
    return 'Password is required.'
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  return null
}

export function getAuthErrorMessage(
  error: AuthServiceError | null,
): string | null {
  if (!error) {
    return null
  }

  return (
    authErrorMessages[error.code] ??
    error.message ??
    'Authentication failed. Please try again.'
  )
}
