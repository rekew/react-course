import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase.ts'
import {
  AuthServiceError,
  logOut,
  signInWithEmail,
  signInWithGoogle as signInWithGoogleRequest,
  toAuthServiceError,
} from '../services/authService.ts'
import {
  authErrorCleared,
  authErrorSet,
  authLoadingChanged,
  authUserChanged,
  selectAuthActionStatus,
  selectAuthError,
  selectAuthLoading,
  selectAuthUser,
  signupWithEmail,
} from '../features/auth/authSlice.ts'
import { useAppDispatch, useAppSelector } from '../store/hooks.ts'
import { AuthContext, type AuthContextValue } from './AuthContext.ts'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const loading = useAppSelector(selectAuthLoading)
  const storedError = useAppSelector(selectAuthError)
  const actionStatus = useAppSelector(selectAuthActionStatus)

  const error = useMemo(
    () =>
      storedError
        ? new AuthServiceError(storedError.code, storedError.message)
        : null,
    [storedError],
  )

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        dispatch(
          authUserChanged(
            firebaseUser
              ? { uid: firebaseUser.uid, email: firebaseUser.email }
              : null,
          ),
        )
        dispatch(authLoadingChanged(false))
      },
      (cause) => {
        const authError = toAuthServiceError(cause)
        dispatch(
          authErrorSet({ code: authError.code, message: authError.message }),
        )
        dispatch(authLoadingChanged(false))
      },
    )

    return unsubscribe
  }, [dispatch])

  const runAuthAction = useCallback(
    async (action: () => Promise<unknown>) => {
      dispatch(authErrorCleared())

      try {
        await action()
      } catch (cause) {
        const authError = toAuthServiceError(cause)
        dispatch(
          authErrorSet({ code: authError.code, message: authError.message }),
        )
      }
    },
    [dispatch],
  )

  const signup = useCallback(
    async (email: string, password: string) => {
      await dispatch(signupWithEmail({ email, password }))
    },
    [dispatch],
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

  const clearError = useCallback(
    () => dispatch(authErrorCleared()),
    [dispatch],
  )

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
      signupLoading: actionStatus === 'loading',
    }),
    [
      user,
      loading,
      error,
      signup,
      login,
      signInWithGoogle,
      logout,
      clearError,
      actionStatus,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
