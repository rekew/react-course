import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getCategories } from '../../services/service.ts'

export type CategoriesStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface CategoriesState {
  items: string[]
  status: CategoriesStatus
  error: string | null
  requestId: string | null
}

const initialState: CategoriesState = {
  items: [],
  status: 'idle',
  error: null,
  requestId: null,
}

export const fetchCategories = createAsyncThunk<
  string[],
  void,
  { rejectValue: string }
>(
  'categories/fetchList',
  async (_, { signal, rejectWithValue }) => {
    try {
      return await getCategories(signal)
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to load categories',
      )
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = (getState() as { categories: CategoriesState })
        .categories
      return status === 'idle' || status === 'failed'
    },
  },
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.requestId = action.meta.requestId
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return

        state.status = 'succeeded'
        state.items = action.payload
        state.requestId = null
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return

        state.status = 'failed'
        state.error =
          action.payload ?? action.error.message ?? 'Failed to load categories'
        state.requestId = null
      })
  },
})

export const categoriesReducer = categoriesSlice.reducer

export const selectCategoryItems = (state: { categories: CategoriesState }) =>
  state.categories.items
export const selectCategoriesStatus = (state: { categories: CategoriesState }) =>
  state.categories.status
export const selectCategoriesError = (state: { categories: CategoriesState }) =>
  state.categories.error
