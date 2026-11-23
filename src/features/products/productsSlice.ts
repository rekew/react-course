import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getProducts, type Product } from '../../services/service.ts'

export type ProductsStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface ProductsState {
  items: Product[]
  status: ProductsStatus
  error: string | null
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
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
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          action.payload ?? action.error.message ?? 'Failed to load products'
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
