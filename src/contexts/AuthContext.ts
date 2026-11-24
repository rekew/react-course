import { createContext } from 'react'
import type { SessionUser } from '../features/auth/authSlice.ts'
import type { AuthServiceError } from '../services/authService.ts'

export interface AuthContextValue {
  user: SessionUser | null
  loading: boolean
  error: AuthServiceError | null
  signup: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  signupLoading: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
