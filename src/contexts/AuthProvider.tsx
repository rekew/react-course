import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../config/firebase.ts'
import {
  AuthServiceError,
  logOut,
  registerWithEmail,
  signInWithEmail,
  signInWithGoogle as signInWithGoogleRequest,
  toAuthServiceError,
} from '../services/authService.ts'
import { AuthContext, type AuthContextValue } from './AuthContext.ts'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthServiceError | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser)
        setLoading(false)
      },
      (cause) => {
        setError(toAuthServiceError(cause))
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const runAuthAction = useCallback(async (action: () => Promise<unknown>) => {
    setError(null)

    try {
      await action()
    } catch (cause) {
      setError(toAuthServiceError(cause))
    }
  }, [])

  const signup = useCallback(
    (email: string, password: string) =>
      runAuthAction(() => registerWithEmail(email, password)),
    [runAuthAction],
  )

  const login = useCallback(
    (email: string, password: string) =>
      runAuthAction(() => signInWithEmail(email, password)),
    [runAuthAction],
  )

  const signInWithGoogle = useCallback(
    () => runAuthAction(() => signInWithGoogleRequest()),
    [runAuthAction],
  )

  const logout = useCallback(
    () => runAuthAction(() => logOut()),
    [runAuthAction],
  )

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      signup,
      login,
      signInWithGoogle,
      logout,
      clearError,
    }),
    [user, loading, error, signup, login, signInWithGoogle, logout, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
