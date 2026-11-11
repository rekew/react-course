import { createContext } from 'react'
import type { User } from 'firebase/auth'
import type { AuthServiceError } from '../services/authService.ts'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  error: AuthServiceError | null
  signup: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
