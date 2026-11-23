import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface SessionUser {
  uid: string
  email: string | null
}

export interface AuthErrorPayload {
  code: string
  message: string
}

export interface AuthState {
  user: SessionUser | null
  loading: boolean
  error: AuthErrorPayload | null
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authUserChanged(state, action: PayloadAction<SessionUser | null>) {
      state.user = action.payload
    },
    authLoadingChanged(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    authErrorSet(state, action: PayloadAction<AuthErrorPayload>) {
      state.error = action.payload
    },
    authErrorCleared(state) {
      state.error = null
    },
  },
})

export const {
  authUserChanged,
  authLoadingChanged,
  authErrorSet,
  authErrorCleared,
} = authSlice.actions

export const authReducer = authSlice.reducer

export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error
