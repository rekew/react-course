import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getProducts, type Product } from '../../services/service.ts'

export type ProductsStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface ProductsState {
  items: Product[]
  status: ProductsStatus
  error: string | null
  requestId: string | null
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
  requestId: null,
}

export const fetchProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>(
  'products/fetchList',
  async (_, { signal, rejectWithValue }) => {
    try {
      const response = await getProducts(signal)
      return response.products
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to load products',
      )
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = (getState() as { products: ProductsState }).products
      return status === 'idle' || status === 'failed'
    },
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.requestId = action.meta.requestId
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return

        state.status = 'succeeded'
        state.items = action.payload
        state.requestId = null
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return

        state.status = 'failed'
        state.error =
          action.payload ?? action.error.message ?? 'Failed to load products'
        state.requestId = null
      })
  },
})

export const productsReducer = productsSlice.reducer

export const selectProductItems = (state: { products: ProductsState }) =>
  state.products.items
export const selectProductsStatus = (state: { products: ProductsState }) =>
  state.products.status
export const selectProductsError = (state: { products: ProductsState }) =>
  state.products.error
