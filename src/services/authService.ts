import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type UserCredential,
} from 'firebase/auth'
import { auth } from '../config/firebase.ts'

const googleProvider = new GoogleAuthProvider()

export class AuthServiceError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'AuthServiceError'
    this.code = code
  }
}

export function toAuthServiceError(error: unknown): AuthServiceError {
  if (error instanceof AuthServiceError) {
    return error
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  ) {
    const { code, message } = error as { code: string; message?: string }
    return new AuthServiceError(code, message ?? code)
  }

  return new AuthServiceError(
    'auth/unknown',
    error instanceof Error ? error.message : 'Unknown authentication error',
  )
}

async function withAuthError<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action()
  } catch (error) {
    throw toAuthServiceError(error)
  }
}

export function registerWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return withAuthError(() =>
    createUserWithEmailAndPassword(auth, email, password),
  )
}

export function signInWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return withAuthError(() => signInWithEmailAndPassword(auth, email, password))
}

export function signInWithGoogle(): Promise<UserCredential> {
  return withAuthError(() => signInWithPopup(auth, googleProvider))
}

export function logOut(): Promise<void> {
  return withAuthError(() => signOut(auth))
}
