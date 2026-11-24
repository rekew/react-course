import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import {
  registerWithEmail,
  toAuthServiceError,
} from '../../services/authService.ts'

export interface SessionUser {
  uid: string
  email: string | null
}

export interface AuthErrorPayload {
  code: string
  message: string
}

export type AuthActionStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface AuthState {
  user: SessionUser | null
  loading: boolean
  error: AuthErrorPayload | null
  actionStatus: AuthActionStatus
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  actionStatus: 'idle',
}

interface SignupCredentials {
  email: string
  password: string
}

export const signupWithEmail = createAsyncThunk<
  SessionUser,
  SignupCredentials,
  { rejectValue: AuthErrorPayload }
>(
  'auth/signupWithEmail',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const credential = await registerWithEmail(email, password)
      return {
        uid: credential.user.uid,
        email: credential.user.email,
      }
    } catch (error) {
      const authError = toAuthServiceError(error)
      return rejectWithValue({
        code: authError.code,
        message: authError.message,
      })
    }
  },
  {
    condition: (_, { getState }) => {
      const { actionStatus } = (getState() as { auth: AuthState }).auth
      return actionStatus !== 'loading'
    },
  },
)

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
  extraReducers: (builder) => {
    builder
      .addCase(signupWithEmail.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(signupWithEmail.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.user = action.payload
        state.error = null
      })
      .addCase(signupWithEmail.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload ?? {
          code: 'auth/unknown',
          message: action.error.message ?? 'Failed to create account',
        }
      })
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
export const selectAuthActionStatus = (state: { auth: AuthState }) =>
  state.auth.actionStatus
